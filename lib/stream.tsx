import {
  createContext,
  use,
  useMemo,
  type PropsWithChildren,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Chat,
  OverlayProvider,
  useCreateChatClient,
} from "stream-chat-expo";
import type { ChannelFilters, StreamChat } from "stream-chat";

import { useAuth } from "@/ctx";
import { useUser } from "@/hooks/user";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

interface StreamCredentials {
  api_key: string;
  user_id: string;
  user_name: string;
  user_image: string | null;
  token: string;
}

interface StreamContextValue {
  userId: string | null;
  client: StreamChat | null;
}

const INACTIVE: StreamContextValue = { userId: null, client: null };

const StreamContext = createContext<StreamContextValue>(INACTIVE);

// Returns the Stream user id once the client is fully connected, else null.
export function useStreamUserId() {
  return use(StreamContext).userId;
}

// Returns the connected Stream client, or null if the user is not yet
// messaging-activated or the client is still connecting. Safe to call
// from anywhere in the authenticated tree.
export function useStreamClient() {
  return use(StreamContext).client;
}

function useStreamCredentials() {
  const { token, signOut } = useAuth();
  return useQuery<StreamCredentials>({
    queryKey: ["stream-credentials", token],
    enabled: !!token,
    staleTime: Infinity,
    retry: (_count, error: Error) => error.message !== "Unauthorized",
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/stream/credentials?token=${token}`
      );
      if (response.status === 401) {
        signOut();
        throw new Error("Unauthorized");
      }
      if (!response.ok) throw new Error("Failed to fetch stream credentials");
      return response.json();
    },
  });
}

function ConnectedProvider({
  creds,
  children,
}: PropsWithChildren<{ creds: StreamCredentials }>) {
  const userData = useMemo(
    () => ({
      id: creds.user_id,
      name: creds.user_name,
      image: creds.user_image ?? undefined,
    }),
    [creds.user_id, creds.user_name, creds.user_image]
  );

  const client = useCreateChatClient({
    apiKey: creds.api_key,
    userData,
    tokenOrProvider: creds.token,
  });

  const value = useMemo<StreamContextValue>(
    () => (client ? { userId: creds.user_id, client } : INACTIVE),
    [client, creds.user_id]
  );

  return (
    <StreamContext.Provider value={value}>
      {client ? (
        <OverlayProvider>
          <Chat client={client}>{children}</Chat>
        </OverlayProvider>
      ) : (
        children
      )}
    </StreamContext.Provider>
  );
}

function ActivatedProvider({ children }: PropsWithChildren) {
  const { data: creds } = useStreamCredentials();
  if (!creds) {
    return <StreamContext.Provider value={INACTIVE}>{children}</StreamContext.Provider>;
  }
  return <ConnectedProvider creds={creds}>{children}</ConnectedProvider>;
}

// Mounts the Stream client only when the user is messaging-activated.
// Children are always rendered; consumers should check useStreamClient()
// before rendering Stream UI.
export function StreamChatProvider({ children }: PropsWithChildren) {
  const { data: user } = useUser();
  const isActivated = !!user?.messaging_activated_at;

  if (!isActivated) {
    return <StreamContext.Provider value={INACTIVE}>{children}</StreamContext.Provider>;
  }
  return <ActivatedProvider>{children}</ActivatedProvider>;
}

// Looks up an existing 1-1 DM channel between the current user and `otherId`
// using Stream's distinct channel member matching.
// Returns the channel id if found, else null.
export async function findExistingDmChannel(
  client: StreamChat,
  selfId: string | number,
  otherId: string | number
): Promise<string | null> {
  const filters: ChannelFilters = {
    type: "messaging",
    members: { $eq: [String(selfId), String(otherId)] },
  };
  try {
    const channels = await client.queryChannels(
      filters,
      {},
      { limit: 1, state: false, watch: false }
    );
    return channels.length > 0 ? (channels[0].id ?? null) : null;
  } catch {
    return null;
  }
}

// Starts (or reuses) a 1-1 DM channel by sending the first message through
// the backend. On success, refreshes /me so the StreamChatProvider can mount
// Stream for the first time. Returns the channel id.
export function useStartConversation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return async (
    otherUserId: string | number,
    text: string
  ): Promise<{ channel_id: string; channel_type: string }> => {
    const response = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, user_id: otherUserId, text }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to start conversation");
    }
    const json = await response.json();

    await queryClient.refetchQueries({ queryKey: ["me", token] });

    return json;
  };
}

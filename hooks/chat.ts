import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createConsumer } from "@/lib/actioncable";

import { useAuth } from "@/ctx";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;

function cableUrl(token: string) {
  return `${API_URL.replace(/^http/, "ws")}/cable?token=${token}`;
}

export interface Message {
  id: number;
  role: "user" | "model";
  content: string;
  created_at: string;
}

interface MessagesResponse {
  messages: Message[];
  timed_out: boolean;
}

export function useMessages() {
  const { token, signOut } = useAuth();
  const queryClient = useQueryClient();
  const consumerRef = useRef<ReturnType<typeof createConsumer> | null>(null);

  useEffect(() => {
    if (!token) return;

    const consumer = createConsumer(cableUrl(token));
    consumerRef.current = consumer;

    consumer.subscriptions.create("MessagesChannel", {
      received(message: Message) {
        queryClient.setQueryData<MessagesResponse>(
          ["messages", token],
          (old) => {
            const msgs = old?.messages ?? [];
            if (msgs.some((m) => m.id === message.id)) return old!;
            return { messages: [...msgs, message], timed_out: false };
          }
        );
      },
    });

    return () => {
      consumer.disconnect();
      consumerRef.current = null;
    };
  }, [token, queryClient]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        queryClient.invalidateQueries({ queryKey: ["messages", token] });
      }
    });
    return () => subscription.remove();
  }, [queryClient, token]);

  return useQuery<MessagesResponse>({
    queryKey: ["messages", token],
    enabled: !!token,
    retry: (_count: number, error: Error) => error.message !== "Unauthorized",
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.messages.length) return false;
      const last = data.messages[data.messages.length - 1];
      const waitingForReply = last.role === "user" && !data.timed_out;
      return waitingForReply ? 10000 : false;
    },
    queryFn: async () => {
      const response = await fetch(`${API_URL}/messages?token=${token}`);
      if (response.status === 401) {
        signOut();
        throw new Error("Unauthorized");
      }
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });
}

export function useSendMessage() {
  const { token, signOut } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, content }),
      });
      if (response.status === 401) {
        signOut();
        throw new Error("Unauthorized");
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send message");
      }
      return response.json();
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["messages", token] });
      const previous = queryClient.getQueryData<MessagesResponse>(["messages", token]);

      queryClient.setQueryData<MessagesResponse>(["messages", token], (old) => ({
        messages: [
          ...(old?.messages ?? []),
          {
            id: Date.now(),
            role: "user" as const,
            content,
            created_at: new Date().toISOString(),
          },
        ],
        timed_out: false,
      }));

      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", token] });
    },
    onError: (_err, _content, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["messages", token], context.previous);
      }
    },
  });
}

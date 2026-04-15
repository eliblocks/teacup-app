import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/ctx";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Message {
  id: number;
  role: "user" | "model";
  content: string;
  created_at: string;
}

export function useMessages() {
  const { token, signOut } = useAuth();
  return useQuery<Message[]>({
    queryKey: ["messages", token],
    enabled: !!token,
    retry: (_count: number, error: Error) => error.message !== "Unauthorized",
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
      const previous = queryClient.getQueryData<Message[]>(["messages", token]);

      queryClient.setQueryData<Message[]>(["messages", token], (old = []) => [
        ...old,
        {
          id: Date.now(),
          role: "user" as const,
          content,
          created_at: new Date().toISOString(),
        },
      ]);

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

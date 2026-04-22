import { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Pressable, Text } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  Channel,
  MessageComposer,
  MessageList,
} from "stream-chat-expo";
import type { Channel as StreamChannel } from "stream-chat";

import { useStreamClient, useStreamUserId } from "@/lib/stream";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useStreamClient();
  const currentUserId = useStreamUserId();
  const headerHeight = useHeaderHeight();
  const [channel, setChannel] = useState<StreamChannel | null>(null);

  useEffect(() => {
    if (!id || !client) return;
    let cancelled = false;
    const load = async () => {
      const c = client.channel("messaging", id);
      await c.watch();
      if (!cancelled) setChannel(c);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, client]);

  const otherMember = channel
    ? Object.values(channel.state.members).find(
        (m) => m.user?.id && m.user.id !== currentUserId
      )
    : undefined;
  const otherUser = otherMember?.user;
  const title = otherUser?.name || "";

  if (!client || !channel) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "" }} />
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerTitle: () => (
            <Pressable
              onPress={() => {
                if (otherUser?.id) router.push(`/user/${otherUser.id}`);
              }}
              style={styles.headerTitleWrap}
            >
              <Text style={styles.headerTitle}>{title}</Text>
            </Pressable>
          ),
        }}
      />
      <Channel channel={channel} keyboardVerticalOffset={headerHeight}>
        <MessageList />
        <MessageComposer />
      </Channel>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  headerTitleWrap: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
});

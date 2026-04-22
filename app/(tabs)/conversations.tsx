import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { ChannelList } from "stream-chat-expo";
import type { Channel as StreamChannel } from "stream-chat";

import { useStreamUserId } from "@/lib/stream";

export default function ConversationsScreen() {
  const userId = useStreamUserId();

  const filters = useMemo(
    () =>
      userId
        ? {
            type: "messaging" as const,
            members: { $in: [userId] },
          }
        : undefined,
    [userId]
  );

  const sort = useMemo(() => ({ last_message_at: -1 as const }), []);
  const options = useMemo(() => ({ state: true, watch: true, presence: true }), []);

  if (!filters) return null;

  return (
    <View style={styles.container}>
      <ChannelList
        filters={filters}
        sort={sort}
        options={options}
        onSelect={(channel: StreamChannel) => {
          router.push(`/conversation/${channel.id}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

import { useUser, useUserProfile } from "@/hooks/user";
import {
  findExistingDmChannel,
  useStartConversation,
  useStreamClient,
} from "@/lib/stream";

export default function NewConversationScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data: recipient } = useUserProfile(userId);
  const { data: currentUser } = useUser();
  const streamClient = useStreamClient();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const startConversation = useStartConversation();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // If a DM with this recipient already exists, jump straight into it so we
  // don't create a duplicate "first message" via the backend.
  useEffect(() => {
    if (!streamClient || !currentUser || !userId) return;
    let cancelled = false;
    findExistingDmChannel(streamClient, currentUser.id, userId).then((id) => {
      if (!cancelled && id) router.replace(`/conversation/${id}`);
    });
    return () => {
      cancelled = true;
    };
  }, [streamClient, currentUser, userId]);

  const title = recipient?.full_name || "";
  const canSend = text.trim().length > 0 && !sending;

  const initials = (recipient?.full_name || "")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !userId || sending) return;
    setSending(true);
    try {
      const { channel_id } = await startConversation(userId, trimmed);
      router.replace(`/conversation/${channel_id}`);
    } catch (err: any) {
      Alert.alert(
        "Could not send message",
        err?.message ?? "Unknown error"
      );
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerTitle: () => (
            <Pressable
              onPress={() => {
                if (userId) router.push(`/user/${userId}`);
              }}
              style={styles.headerTitleWrap}
            >
              <Text style={styles.headerTitle}>{title}</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={styles.emptyState}>
          <View style={styles.avatar}>
            {recipient?.avatar_url ? (
              <Image
                source={{ uri: recipient.avatar_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarInitials}>{initials || "?"}</Text>
            )}
          </View>
          <Text style={styles.emptyTitle}>{title}</Text>
          <Text style={styles.emptySubtitle}>
            Send your first message to start the conversation.
          </Text>
        </View>
        <View
          style={[
            styles.composer,
            { paddingBottom: Math.max(insets.bottom, 8) },
          ]}
        >
          <View style={styles.inputPill}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Message"
              placeholderTextColor="#9aa0a6"
              multiline
              editable={!sending}
              autoFocus
            />
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              hitSlop={8}
              style={styles.sendButton}
              accessibilityLabel="Send message"
              testID="send-button"
            >
              {sending ? (
                <ActivityIndicator size="small" color="#0a7aff" />
              ) : (
                <SymbolView
                  name={{ ios: "arrow.up.circle.fill", android: "arrow_circle_up", web: "arrow_circle_up" }}
                  size={30}
                  tintColor={canSend ? "#0a7aff" : "#c7c9cc"}
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "600",
    color: "#333",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  composer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  inputPill: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f2f3f5",
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 36,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 6,
    paddingRight: 8,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
  },
});

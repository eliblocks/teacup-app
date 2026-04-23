import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { Redirect, router } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useUser } from "@/hooks/user";
import { useMessages, useSendMessage, type Message } from "@/hooks/chat";

const MENTION_RE = /\[([^\]]+)\]\((\d+)\)/g;

function renderMessageContent(content: string, isUser: boolean) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MENTION_RE.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    const name = match[1];
    const userId = match[2];
    parts.push(
      <Text
        key={`${userId}-${match.index}`}
        style={[styles.mention, isUser && styles.userMention]}
        onPress={() => router.push(`/user/${userId}`)}
        accessibilityRole="link"
        accessibilityLabel={name}
        accessible
        testID={`mention-${userId}`}
      >
        {name}
      </Text>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

export default function Index() {
  const { data: user } = useUser();
  const { data, isPending: loadingMessages } = useMessages();
  const messages = data?.messages ?? [];
  const timedOut = data?.timed_out ?? false;
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const headerHeight = useHeaderHeight();

  const invertedMessages = [...messages].reverse();
  const awaitingReply = messages.length > 0 && messages[messages.length - 1].role === "user";
  const showThinking = sendMessage.isPending || (awaitingReply && !timedOut);

  if (user && !user.bio) {
    return <Redirect href="/editProfile" />;
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || showThinking) return;
    setText("");
    sendMessage.mutate(trimmed);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.modelBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {renderMessageContent(item.content, isUser)}
        </Text>
      </View>
    );
  };

  if (loadingMessages) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      {messages.length === 0 && !showThinking ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>☕</Text>
          <Text style={styles.emptyTitle}>Welcome to Teacup</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation below
          </Text>
        </View>
      ) : (
        <FlatList
          data={invertedMessages}
          inverted
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            showThinking ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#999" />
                <Text style={styles.typingText}>Teacup is thinking...</Text>
              </View>
            ) : timedOut ? (
              <Text style={styles.failedText}>Failed to send</Text>
            ) : null
          }
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor="#999"
          multiline
          maxLength={4000}
          accessibilityLabel="Message input"
          testID="message-input"
        />
        <Pressable
          onPress={handleSend}
          style={[
            styles.sendButton,
            (!text.trim() || showThinking) && styles.sendButtonDisabled,
          ]}
          disabled={!text.trim() || showThinking}
          accessibilityLabel="Send"
          testID="send-button"
        >
          <Ionicons
            name="arrow-up-circle"
            size={36}
            color={text.trim() && !showThinking ? "#000" : "#ccc"}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#333",
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f4f4f4",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
  },
  userMessageText: {
    color: "#fff",
  },
  mention: {
    fontWeight: "600",
    textDecorationLine: "underline",
    color: "#007AFF",
  },
  userMention: {
    color: "#A0CFFF",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingText: {
    color: "#999",
    fontSize: 13,
    marginLeft: 8,
  },
  failedText: {
    color: "#e53935",
    fontSize: 13,
    textAlign: "right",
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: "#111",
    marginRight: 8,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});

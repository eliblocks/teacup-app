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
import { Redirect } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useUser } from "@/hooks/user";
import { useMessages, useSendMessage, type Message } from "@/hooks/chat";

export default function Index() {
  const { data: user } = useUser();
  const { data: messages = [], isPending: loadingMessages } = useMessages();
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const headerHeight = useHeaderHeight();

  const invertedMessages = [...messages].reverse();

  if (user && !user.bio) {
    return <Redirect href="/editProfile" />;
  }

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;
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
          {item.content}
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
      {messages.length === 0 && !sendMessage.isPending ? (
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
            sendMessage.isPending ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#999" />
                <Text style={styles.typingText}>Teacup is thinking...</Text>
              </View>
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
            (!text.trim() || sendMessage.isPending) &&
              styles.sendButtonDisabled,
          ]}
          disabled={!text.trim() || sendMessage.isPending}
          accessibilityLabel="Send"
          testID="send-button"
        >
          <Ionicons
            name="arrow-up-circle"
            size={36}
            color={
              text.trim() && !sendMessage.isPending ? "#000" : "#ccc"
            }
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

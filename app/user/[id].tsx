import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useUser, useUserProfile } from "@/hooks/user";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useUserProfile(id);
  const { data: currentUser } = useUser();

  const isSelf = currentUser && String(currentUser.id) === String(id);

  const handleMessage = () => {
    if (!id) return;
    router.push(`/new-conversation/${id}`);
  };

  if (isLoading || !data) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: "" }} />
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: data.full_name || "Profile" }} />
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          {data.avatar_url ? (
            <Image
              source={{ uri: data.avatar_url }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {data.full_name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{data.full_name || "No name set"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.bio}>{data.bio || "No bio yet."}</Text>
      </View>

      {!isSelf && (
        <Pressable
          style={styles.messageButton}
          onPress={handleMessage}
          accessibilityLabel="Message user"
          testID="message-button"
        >
          <Ionicons name="paper-plane" size={18} color="#fff" style={styles.messageIcon} />
          <Text style={styles.messageButtonText}>Message</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#333",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 14,
  },
  messageIcon: {
    marginRight: 8,
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

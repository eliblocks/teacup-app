import { StyleSheet, Text, View, Pressable, ActivityIndicator, Image } from "react-native";
import { useUser } from "@/hooks/user";
import { useAuth } from "@/ctx";
import { router } from "expo-router";

export default function Profile() {
  const { data, isLoading } = useUser();
  const { signOut } = useAuth();

  if (isLoading || !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          {data.avatar_url ? (
            <Image source={{ uri: data.avatar_url }} style={styles.avatarImage} />
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

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push("/editProfile")}
      >
        <Text style={styles.primaryButtonText}>Edit Profile</Text>
      </Pressable>

      <Pressable style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable>
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
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
  },
  signOutButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});

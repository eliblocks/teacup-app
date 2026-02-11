import { StyleSheet, Text, View, Pressable } from "react-native";
import { useAuth } from '@/ctx';

export default function Index() {
  const { token, signOut } = useAuth()

  return (
    <View style={styles.container}>
      <View>
        <Text>Welcome, your secret token is {token} </Text>
        <Pressable onPress={() => signOut()}><Text>Log out</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 44,
  },
});

import { StyleSheet, Text, View } from "react-native";
import { useUser } from '@/hooks/user';
import { Link } from "expo-router";

export default function Profile() {
  const  { data } = useUser()

  return (
    <View style={styles.container}>
      <View>
        <Text>Name: {data?.full_name}</Text>
      </View>
      <View>
        <Text>Bio: {data?.bio}</Text>
      </View>
      <Link href="/editProfile">Edit</Link>
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

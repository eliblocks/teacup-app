import { StyleSheet, Text, View, Pressable } from "react-native";
import { router, Redirect } from 'expo-router';

import { useAuth } from '@/ctx';
import { useUser } from '@/hooks/user';


export default function Index() {
  const { signOut } = useAuth()

  const { isPending, error, data } = useUser()

  console.log("Data: ", data)


  if (data && !data.bio) {
    return <Redirect href="/editProfile" />;
  }

  return (
      <View style={styles.container}>
        <View>
          <Text>Welcome, your id is {data?.id} </Text>
          <Pressable onPress={() => router.push('/editProfile')}><Text>Edit Profile</Text></Pressable>
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

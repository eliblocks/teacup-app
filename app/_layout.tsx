import { Stack } from "expo-router";
import { AuthProvider, useAuth } from '../ctx';

function RootNavigator() {
  const { token } = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!token}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
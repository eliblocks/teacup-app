import { Stack } from "expo-router";
import { AuthProvider, useAuth } from '../ctx';
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";

const queryClient = new QueryClient()

function RootNavigator() {
  const { token } = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!token}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
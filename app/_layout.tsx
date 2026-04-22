import { Stack } from "expo-router";
import { AuthProvider, useAuth } from '../ctx';
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { StreamChatProvider } from "@/lib/stream";

const queryClient = new QueryClient()

function RootNavigator() {
  const { token } = useAuth();

  return (
    <StreamChatProvider>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#000',
        headerShadowVisible: false,
      }}>
        <Stack.Protected guard={!!token}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!token}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
    </StreamChatProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

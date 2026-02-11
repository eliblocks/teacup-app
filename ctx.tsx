import { use, createContext, useState, type PropsWithChildren } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext<{
  signIn: (newToken: string) => void;
  signOut: () => void;
  token?: string | null;
}>({
  signIn: () => null,
  signOut: () => null,
  token: null,
});

export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be wrapped in a <AuthProvider />');
  }

  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => {
    return SecureStore.getItem('token');
  });

  return (
    <AuthContext.Provider
      value={{
        signIn: (newToken: string) => {
          SecureStore.setItemAsync('token', newToken)
          setToken(newToken)
        },
        signOut: () => {
          SecureStore.deleteItemAsync('token');
          setToken(null)
        },
        token,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
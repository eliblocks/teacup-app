import * as AppleAuthentication from 'expo-apple-authentication';
import { StyleSheet } from "react-native";
import { useAuth } from '@/ctx';

export default function SignIn() {
  const { signIn } = useAuth();

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={styles.button}
      onPress={async () => {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });

          console.log("sending credential:", credential)

          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/apple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity_token: credential.identityToken }),
          });
          const data = await response.json();
          
          if (data.success) {
            signIn(data.token);
            console.log("token created, setting in storage")
          } else {
            console.log('Server response:', data);
          }

        } catch (e: any) {
          if (e.code === 'ERR_REQUEST_CANCELED') {
            // handle that the user canceled the sign-in flow
          } else {
            // handle other errors
          }
        }
      }}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 44,
  },
});

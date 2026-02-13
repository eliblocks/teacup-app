import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function ImagePickerButton({ onImageSelected }: { onImageSelected: (uri: string) => void }) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <Pressable style={styles.button} onPress={pickImage}>
      <Text style={styles.buttonText}>Choose Photo</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
});

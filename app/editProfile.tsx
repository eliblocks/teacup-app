import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';

import ImagePickerButton from '@/components/imagePicker';
import { useUpdateUser, useUser } from '@/hooks/user';

export default function EditProfile() {
  const { data, isLoading } = useUser();

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return <EditProfileForm data={data} />;
}

function EditProfileForm({ data }: { data: { full_name: string; bio: string; avatar_url?: string | null } }) {
  const [fullName, setFullName] = useState(data.full_name);
  const [bio, setBio] = useState(data.bio);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { mutate } = useUpdateUser()

  const displayImage = avatarUri ?? data.avatar_url;

  function handleUpdate() {
    mutate({ fullName, bio, avatarUri }, { onSuccess: () => router.replace('/profile') })
  }

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        bottomOffset={75}
      >
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatarPlaceholder}>
            {displayImage ? (
              <Image source={{ uri: displayImage }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={48} color="#999" />
            )}
          </View>
          <ImagePickerButton onImageSelected={setAvatarUri} />
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your full name"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          multiline
          textAlignVertical="top"
        />

        <Pressable style={styles.saveButton} onPress={handleUpdate}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  bioInput: {
    height: 100,
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});

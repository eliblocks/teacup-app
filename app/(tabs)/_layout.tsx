import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useUser } from '@/hooks/user';

export default function TabLayout() {
  const { data: user } = useUser();
  const hasConversations = !!user?.messaging_activated_at;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#8e8e93',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShadowVisible: false,
        headerTintColor: '#000',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{ ios: focused ? 'bubble.left.fill' : 'bubble.left', android: 'chat_bubble', web: 'chat_bubble' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="conversations"
        options={{
          title: 'Messages',
          href: hasConversations ? '/conversations' : null,
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{ ios: focused ? 'envelope.fill' : 'envelope', android: 'mail', web: 'mail' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={{ ios: focused ? 'person.fill' : 'person', android: 'person', web: 'person' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}

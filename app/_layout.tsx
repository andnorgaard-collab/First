import { Tabs } from 'expo-router';
import { FARVER } from '../src/theme';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: FARVER.kaffeAccent,
        tabBarInactiveTintColor: FARVER.tekstSekund,
        tabBarStyle: {
          backgroundColor: FARVER.kortBaggrund,
          borderTopColor: FARVER.border,
        },
        headerStyle: {
          backgroundColor: FARVER.kaffe,
        },
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kaffeklub',
          tabBarLabel: 'Hjem',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="☕" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ny"
        options={{
          title: 'Tilføj kaffe',
          tabBarLabel: 'Tilføj',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="➕" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistik"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="soeg"
        options={{
          title: 'Søg brugere',
          tabBarLabel: 'Søg',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="🔍" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color, size }: { emoji: string; color: string; size: number }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: size * 0.8 }}>{emoji}</Text>;
}

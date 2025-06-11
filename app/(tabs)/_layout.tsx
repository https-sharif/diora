import { Tabs } from 'expo-router';
import { Home, Plus, Search, ShoppingBag, User, View } from 'lucide-react-native';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme, isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ size, color, focused }) => (
            <Home size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color, focused }) => (
            <Search size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shop',
          tabBarIcon: ({ size, color, focused }) => (
            <ShoppingBag size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <User size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

import { router, Tabs } from 'expo-router';
import { BarChart3, Home, Plus, Search, ShoppingBag, User, Shield } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';

export default function TabLayout() {
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { fetchNotifications } = useNotification();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  if (!isAuthenticated) {
    return null;
  }

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
            (user?.type === 'admin') ? (
              <BarChart3 size={size} color={color} strokeWidth={focused ? 3 : 2} />
            ) : (
              <Home size={size} color={color} strokeWidth={focused ? 3 : 2} />
            )
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
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ size, color, focused }) => (
            <Plus size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          href: user?.type === 'admin' ? null : '/shopping',
          title: 'Shop',
          tabBarIcon: ({ size, color, focused }) => (
            <ShoppingBag size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          href: user?.type === 'admin' ? '/reports' : null,
          title: 'Reports',
          tabBarIcon: ({ size, color, focused }) => (
            <Shield size={size} color={color} strokeWidth={focused ? 3 : 2} />
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

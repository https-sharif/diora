import { router, Tabs } from 'expo-router';
import { Eye, Flag, BarChart3, User, Home, Search, Plus, ShoppingBag } from 'lucide-react-native';
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

  useEffect(() => {
    if (isAuthenticated && user?.type === 'admin') {
      router.replace('/(tabs)/analytics');
    }
  }, [isAuthenticated, user?.type]);

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
        name="analytics"
        options={{
          href: user?.type === 'admin' ? '/analytics' : null,
          title: 'Analytics',
          tabBarIcon: ({ size, color, focused }) => (
            <BarChart3 size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: user?.type === 'admin' ? null : '/',
          title: 'Feed',
          tabBarIcon: ({ size, color, focused }) => (
            <Home size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: user?.type === 'admin' ? null : '/explore',
          title: 'Explore',
          tabBarIcon: ({ size, color, focused }) => (
            <Search size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="monitor"
        options={{
          href: user?.type === 'admin' ? '/monitor' : null,
          title: 'Monitor',
          tabBarIcon: ({ size, color, focused }) => (
            <Eye size={size} color={color} strokeWidth={focused ? 3 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: user?.type === 'admin' ? null : '/create',
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
            <Flag size={size} color={color} strokeWidth={focused ? 3 : 2} />
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

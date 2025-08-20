import React from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import { CreatePostProvider } from '@/contexts/CreatePostContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import formScreen from '../formScreen';
import imageScreen from '../imageScreen';

const Stack = createNativeStackNavigator();

export default function CreateScreen() {
  const { theme } = useTheme();
  return (
    <CreatePostProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Stack.Navigator
          screenOptions={{
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen
            name="CreateImage"
            component={imageScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateForm"
            component={formScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </KeyboardAvoidingView>
    </CreatePostProvider>
  );
}

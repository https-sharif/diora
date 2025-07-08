import CreateFormScreen from '@/app/CreateFormScreen';
import CreateImageScreen from '@/app/CreateImageScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/contexts/ThemeContext';

const Stack = createNativeStackNavigator();

export default function CreatePostFlow() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ animation: 'slide_from_right', contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="CreateImage" component={CreateImageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateForm" component={CreateFormScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

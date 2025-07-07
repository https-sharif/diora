import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { User } from 'lucide-react-native';
import { Theme } from '@/types/Theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    userIcon: {
      width: 80,
      height: 80,
      borderRadius: 50,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    notLoggedIn: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 16,
    },
    button: {
      backgroundColor: theme.accent,
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: '#000',
      fontSize: 16,
      fontFamily: 'Inter-Medium',
    },
  });

export default function NotLoggedIn() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.centered}>
      <View style={styles.userIcon}>
        <User size={48} color={theme.text} />
      </View>
      <Text style={styles.notLoggedIn}>You are not logged in</Text>
      <TouchableOpacity
        onPress={() => router.push('/auth')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

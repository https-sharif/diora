import { View, StyleSheet, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@/types/Theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      backgroundColor: theme.background,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 24,
      textAlign: 'center',
    },
  });

export const EmptyState = ({
  text,
  icon,
}: {
  text: string;
  icon: React.ReactNode | null;
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        {icon || <Inbox size={40} color={theme.text} />}
      </View>
      <Text style={styles.emptyTitle}>{text}</Text>
    </View>
  );
};

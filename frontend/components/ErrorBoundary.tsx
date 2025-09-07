import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { showToast } from '@/utils/toastUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Enhanced Error Boundary component for catching and handling React errors
 * Provides user-friendly error UI and error reporting capabilities
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show error toast to user
    showToast.error('An unexpected error occurred. Please try again.');

    // Here you could send error to monitoring service
    // Example: errorReportingService.logError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    showToast.success('Retrying...');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI component
 */
const ErrorFallback: React.FC<{ error?: Error; onRetry: () => void }> = ({
  error,
  onRetry,
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.errorContent}>
        <AlertTriangle size={48} color={theme.error} />
        <Text style={[styles.title, { color: theme.text }]}>
          Something went wrong
        </Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          We encountered an unexpected error. Please try again.
        </Text>

        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={[styles.errorText, { color: theme.error }]}>
              {error.message}
            </Text>
            <Text style={[styles.errorStack, { color: theme.textSecondary }]}>
              {error.stack}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={20} color={theme.primary} />
          <Text style={[styles.retryText, { color: theme.primary }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorDetails: {
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ErrorBoundary;

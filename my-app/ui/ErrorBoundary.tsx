import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme/colors';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: colors.background }}>
          <Text className="text-2xl font-bold mb-4" style={{ color: colors.error }}>
            Something went wrong
          </Text>
          <Text className="text-base mb-6 text-center" style={{ color: colors.textMuted }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button
            label="Try Again"
            onPress={() => this.setState({ hasError: false, error: null })}
            variant="primary"
          />
        </View>
      );
    }

    return this.props.children;
  }
}


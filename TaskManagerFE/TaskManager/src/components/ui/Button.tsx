/**
 * Reusable UI Components — Button
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const colors = useColors();

  const bgColors: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.primaryLight,
    outline: 'transparent',
    ghost: 'transparent',
    danger: colors.danger,
  };

  const textColors: Record<string, string> = {
    primary: '#FFFFFF',
    secondary: colors.primary,
    outline: colors.primary,
    ghost: colors.primary,
    danger: '#FFFFFF',
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 12, paddingHorizontal: 24 },
    lg: { paddingVertical: 16, paddingHorizontal: 32 },
  };

  const fontSizes: Record<string, number> = {
    sm: FontSizes.sm,
    md: FontSizes.base,
    lg: FontSizes.md,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        {
          backgroundColor: bgColors[variant],
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? colors.primary : undefined,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: textColors[variant],
                fontSize: fontSizes[size],
                marginLeft: icon ? 8 : 0,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    gap: Spacing.two,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.3,
  },
});

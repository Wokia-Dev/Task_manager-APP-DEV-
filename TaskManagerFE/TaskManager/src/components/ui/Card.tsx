/**
 * Reusable Card Component
 */
import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'surface' | 'elevated' | 'outlined';
  style?: ViewStyle;
  noPadding?: boolean;
}

export function Card({
  children,
  onPress,
  variant = 'surface',
  style,
  noPadding = false,
}: CardProps) {
  const colors = useColors();

  const bgColor =
    variant === 'elevated' ? colors.surfaceElevated :
    variant === 'surface' ? colors.surface : 'transparent';

  const content = (
    <>
      {children}
    </>
  );

  const cardStyle: ViewStyle[] = [
    styles.card,
    {
      backgroundColor: bgColor,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: variant === 'outlined' ? colors.border : undefined,
    },
    ...(variant !== 'outlined' ? [Shadows.sm as ViewStyle] : []),
    ...(!noPadding ? [styles.padding] : []),
    ...(style ? [style] : []),
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable style={cardStyle} disabled>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  padding: {
    padding: Spacing.three,
  },
});

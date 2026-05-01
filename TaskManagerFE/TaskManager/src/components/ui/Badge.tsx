/**
 * Badge Component — For status and priority labels.
 */
import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({
  label,
  color,
  backgroundColor,
  icon,
  size = 'sm',
  style,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          paddingVertical: size === 'sm' ? 3 : 6,
          paddingHorizontal: size === 'sm' ? 8 : 12,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.label,
          {
            color,
            fontSize: size === 'sm' ? FontSizes.xs : FontSizes.sm,
            marginLeft: icon ? 4 : 0,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.2,
  },
});

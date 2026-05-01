/**
 * Stat Card — Displays a single metric on the dashboard.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-theme';

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bgColor: string;
}

export function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  const colors = useColors();

  return (
    <Card style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  title: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

/**
 * TaskCard — Displays a task in a list with status, priority, assignee, and due date.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FontSizes, FontWeights, PriorityConfig, Spacing, StatusConfig } from '@/constants/theme';
import { useColors } from '@/hooks/use-theme';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  /** When true, prominently show the assignee name + avatar (for Team Tasks view). */
  showAssignee?: boolean;
}

export function TaskCard({ task, onPress, showAssignee = true }: TaskCardProps) {
  const colors = useColors();

  const priorityColors: Record<string, { color: string; bg: string }> = {
    low: { color: colors.priorityLow, bg: colors.divider },
    medium: { color: colors.priorityMedium, bg: colors.warningLight },
    high: { color: colors.priorityHigh, bg: colors.dangerLight },
    urgent: { color: colors.priorityUrgent, bg: colors.dangerLight },
  };

  const statusColors: Record<string, { color: string; bg: string }> = {
    todo: { color: colors.statusTodo, bg: colors.divider },
    in_progress: { color: colors.statusInProgress, bg: colors.primaryLight },
    completed: { color: colors.statusCompleted, bg: colors.accentLight },
  };

  const pColor = priorityColors[task.priority] || priorityColors.medium;
  const sColor = statusColors[task.status] || statusColors.todo;

  const formatDueDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM d');
    } catch {
      return dateStr;
    }
  };

  const getDueDateColor = (): string => {
    if (!task.due_date || task.status === 'completed') return colors.textTertiary;
    try {
      const date = parseISO(task.due_date);
      if (isPast(date) && !isToday(date)) return colors.danger;
      if (isToday(date)) return colors.warning;
    } catch { /* ignore */ }
    return colors.textTertiary;
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: sColor.color }]} />

      <View style={styles.content}>
        {/* Header: title + priority */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              task.status === 'completed' && styles.completedTitle,
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <Badge
            label={PriorityConfig[task.priority].label}
            color={pColor.color}
            backgroundColor={pColor.bg}
            size="sm"
          />
        </View>

        {/* Description preview */}
        {task.description && (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}

        {/* Footer: status, assignee, due date */}
        <View style={styles.footer}>
          <Badge
            label={StatusConfig[task.status].label}
            color={sColor.color}
            backgroundColor={sColor.bg}
            icon={
              <MaterialIcons
                name={StatusConfig[task.status].icon}
                size={12}
                color={sColor.color}
              />
            }
            size="sm"
          />

          <View style={styles.footerRight}>
            {task.due_date && (
              <View style={styles.dueDateContainer}>
                <MaterialIcons name="schedule" size={13} color={getDueDateColor()} />
                <Text style={[styles.dueDate, { color: getDueDateColor() }]}>
                  {formatDueDate(task.due_date)}
                </Text>
              </View>
            )}

            {showAssignee && task.assignee && (
              <View style={styles.assigneeContainer}>
                <Text style={[styles.assigneeName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {task.assignee.full_name?.split(' ')[0]}
                </Text>
                <Avatar
                  initials={task.assignee.initials}
                  color={task.assignee.avatar_color}
                  size={26}
                />
              </View>
            )}
            {showAssignee && !task.assignee && (
              <Text style={[styles.unassigned, { color: colors.textTertiary }]}>Unassigned</Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.three,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: FontSizes.sm,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  assigneeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assigneeName: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  unassigned: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    fontStyle: 'italic',
  },
});

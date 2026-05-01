/**
 * Task Detail / Edit Modal Screen
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Avatar } from '@/components/common/Avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  FontSizes,
  FontWeights,
  PriorityConfig,
  Radius,
  Spacing,
  StatusConfig,
} from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/use-theme';
import { api, ApiError } from '@/services/api';
import type { Task, TaskPriority, TaskStatus, TeamMember } from '@/types';

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in_progress', 'completed'];
const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export default function TaskDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser, activeTeam } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [editAssignee, setEditAssignee] = useState<number | null>(null);

  const fetchTask = useCallback(async () => {
    if (!id) return;
    try {
      const { task: t } = await api.tasks.get(Number(id));
      setTask(t);
      setEditTitle(t.title);
      setEditDesc(t.description ?? '');
      setEditPriority(t.priority);
      setEditDueDate(t.due_date ?? '');
      setDateObj(t.due_date ? parseISO(t.due_date) : null);
      setEditAssignee(t.assigned_to);
    } catch (e) {
      console.error('Failed to fetch task:', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTask(); }, [fetchTask]);

  useEffect(() => {
    if (activeTeam) {
      api.teams.getMembers(activeTeam.id).then(({ members: m }) => setMembers(m)).catch(() => {});
    }
  }, [activeTeam]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      const { task: updated } = await api.tasks.update(task.id, { status: newStatus });
      setTask(updated);
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleSave = async () => {
    if (!task || !editTitle.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { task: updated } = await api.tasks.update(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        priority: editPriority,
        due_date: editDueDate || null,
        assigned_to: editAssignee,
      });
      setTask(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!task) return;
    Alert.alert('Delete Task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.tasks.delete(task.id);
            router.back();
          } catch {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading task..." />;
  if (!task) return null;

  const statusColors: Record<string, { color: string; bg: string }> = {
    todo: { color: colors.statusTodo, bg: colors.divider },
    in_progress: { color: colors.statusInProgress, bg: colors.primaryLight },
    completed: { color: colors.statusCompleted, bg: colors.accentLight },
  };

  const priorityColors: Record<string, string> = {
    low: colors.priorityLow,
    medium: colors.priorityMedium,
    high: colors.priorityHigh,
    urgent: colors.priorityUrgent,
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Task Details</Text>
        <View style={styles.headerActions}>
          {!editing && (
            <Pressable onPress={() => setEditing(true)} style={styles.headerBtn}>
              <MaterialIcons name="edit" size={22} color={colors.primary} />
            </Pressable>
          )}
          <Pressable onPress={handleDelete} style={styles.headerBtn}>
            <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {editing ? (
            /* ─── Edit Mode ────────────────────── */
            <>
              {error ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
                  <Text style={{ color: colors.danger }}>{error}</Text>
                </View>
              ) : null}

              <Input label="Title" value={editTitle} onChangeText={setEditTitle} leftIcon="title" />
              <Input
                label="Description"
                value={editDesc}
                onChangeText={setEditDesc}
                multiline
                numberOfLines={4}
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />

              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
                <View style={styles.optionRow}>
                  {PRIORITY_OPTIONS.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setEditPriority(p)}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: editPriority === p ? priorityColors[p] : colors.surface,
                          borderWidth: editPriority === p ? 0 : 1,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: editPriority === p ? '#FFF' : colors.textSecondary,
                          fontSize: FontSizes.sm,
                          fontWeight: FontWeights.semibold,
                        }}
                      >
                        {PriorityConfig[p].label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Due Date (optional)</Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={[{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: Radius.md,
                    paddingHorizontal: 14,
                    height: 52,
                    gap: 10,
                  }]}
                >
                  <MaterialIcons name="event" size={20} color={colors.textSecondary} />
                  <Text style={{ color: dateObj ? colors.text : colors.textTertiary, fontSize: FontSizes.base }}>
                    {dateObj ? format(dateObj, 'yyyy-MM-dd') : 'Select a date...'}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={dateObj || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setDateObj(selectedDate);
                        setEditDueDate(format(selectedDate, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                )}
                {Platform.OS === 'ios' && showDatePicker && (
                  <Button title="Done" onPress={() => setShowDatePicker(false)} size="sm" style={{ alignSelf: 'flex-end', marginTop: -8 }} />
                )}
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Assign to</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.assigneeRow}>
                    <Pressable
                      onPress={() => setEditAssignee(null)}
                      style={[styles.assigneeChip, { borderColor: editAssignee === null ? colors.primary : colors.border, backgroundColor: editAssignee === null ? colors.primaryLight : colors.surface }]}
                    >
                      <Text style={{ color: editAssignee === null ? colors.primary : colors.textSecondary, fontSize: FontSizes.sm }}>None</Text>
                    </Pressable>
                    {members.map((m) => (
                      <Pressable
                        key={m.user.id}
                        onPress={() => setEditAssignee(m.user.id)}
                        style={[styles.assigneeChip, { borderColor: editAssignee === m.user.id ? colors.primary : colors.border, backgroundColor: editAssignee === m.user.id ? colors.primaryLight : colors.surface }]}
                      >
                        <Avatar initials={m.user.initials} color={m.user.avatar_color} size={22} />
                        <Text style={{ color: editAssignee === m.user.id ? colors.primary : colors.textSecondary, fontSize: FontSizes.sm }}>
                          {m.user.id === currentUser?.id ? 'Me' : m.user.full_name.split(' ')[0]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.editActions}>
                <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" style={{ flex: 1 }} />
                <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
              </View>
            </>
          ) : (
            /* ─── View Mode ────────────────────── */
            <>
              <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>

              {/* Status Buttons */}
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map((s) => {
                  const sc = statusColors[s];
                  const isActive = task.status === s;
                  return (
                    <Pressable
                      key={s}
                      onPress={() => handleStatusChange(s)}
                      style={[
                        styles.statusBtn,
                        {
                          backgroundColor: isActive ? sc.color : colors.surface,
                          borderWidth: isActive ? 0 : 1,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={StatusConfig[s].icon}
                        size={16}
                        color={isActive ? '#FFF' : sc.color}
                      />
                      <Text
                        style={{
                          color: isActive ? '#FFF' : colors.textSecondary,
                          fontSize: FontSizes.sm,
                          fontWeight: FontWeights.semibold,
                        }}
                      >
                        {StatusConfig[s].label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Description */}
              <Card>
                <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 6 }]}>
                  Description
                </Text>
                <Text style={[styles.descText, { color: colors.text }]}>
                  {task.description || 'No description provided'}
                </Text>
              </Card>

              {/* Details Grid */}
              <Card style={styles.detailsCard}>
                <DetailRow
                  icon="flag"
                  label="Priority"
                  value={PriorityConfig[task.priority].label}
                  valueColor={priorityColors[task.priority]}
                  colors={colors}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <DetailRow
                  icon="event"
                  label="Due Date"
                  value={task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : 'Not set'}
                  valueColor={task.is_overdue ? colors.danger : colors.text}
                  colors={colors}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <DetailRow
                  icon="person"
                  label="Assignee"
                  value={task.assignee?.full_name ?? 'Unassigned'}
                  colors={colors}
                  avatar={task.assignee ? { initials: task.assignee.initials, color: task.assignee.avatar_color } : undefined}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <DetailRow
                  icon="person-outline"
                  label="Created by"
                  value={task.creator.full_name}
                  colors={colors}
                  avatar={{ initials: task.creator.initials, color: task.creator.avatar_color }}
                />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <DetailRow
                  icon="access-time"
                  label="Created"
                  value={format(parseISO(task.created_at), 'MMM d, yyyy h:mm a')}
                  colors={colors}
                />
                {task.completed_at && (
                  <>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <DetailRow
                      icon="check-circle"
                      label="Completed"
                      value={format(parseISO(task.completed_at), 'MMM d, yyyy h:mm a')}
                      valueColor={colors.accent}
                      colors={colors}
                    />
                  </>
                )}
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
  colors,
  avatar,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  colors: any;
  avatar?: { initials: string; color: string };
}) {
  return (
    <View style={styles.detailRow}>
      <MaterialIcons name={icon} size={18} color={colors.textTertiary} />
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.detailValue}>
        {avatar && <Avatar initials={avatar.initials} color={avatar.color} size={22} />}
        <Text style={[styles.detailValueText, { color: valueColor ?? colors.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  headerActions: { flexDirection: 'row' },
  content: { padding: Spacing.three, gap: 18, paddingBottom: 40 },
  taskTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.extrabold, lineHeight: 34 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  descText: { fontSize: FontSizes.base, lineHeight: 22 },
  detailsCard: { gap: 0, padding: 0 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
  },
  detailLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, width: 80 },
  detailValue: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' },
  detailValueText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  divider: { height: 1, marginHorizontal: Spacing.three },
  section: { gap: 8 },
  label: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, marginLeft: 2 },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.md },
  assigneeRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  assigneeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full, borderWidth: 1 },
  editActions: { flexDirection: 'row', gap: 12 },
  errorBanner: { padding: 12, borderRadius: Radius.md },
});

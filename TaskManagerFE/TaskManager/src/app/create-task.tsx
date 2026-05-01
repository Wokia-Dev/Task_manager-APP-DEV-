/**
 * Create Task Modal Screen
 */
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
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
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/use-theme';
import { api, ApiError } from '@/services/api';
import type { TeamMember, TaskPriority } from '@/types';

const PRIORITIES: { key: TaskPriority; label: string; color: string }[] = [
  { key: 'low', label: 'Low', color: '#9CA3AF' },
  { key: 'medium', label: 'Medium', color: '#FFB347' },
  { key: 'high', label: 'High', color: '#FF6B6B' },
  { key: 'urgent', label: 'Urgent', color: '#DC2626' },
];

export default function CreateTaskScreen() {
  const colors = useColors();
  const router = useRouter();
  const { activeTeam, user: currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTeam) {
      api.teams.getMembers(activeTeam.id).then(({ members: m }) => setMembers(m)).catch(() => {});
    }
  }, [activeTeam]);

  const handleCreate = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!activeTeam) return;
    setLoading(true);
    setError('');
    try {
      await api.tasks.create({
        team_id: activeTeam.id,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        assigned_to: assignedTo ?? undefined,
      });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Task</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
              <Text style={{ color: colors.danger, fontSize: FontSizes.sm }}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Title"
            placeholder="What needs to be done?"
            value={title}
            onChangeText={setTitle}
            leftIcon="title"
          />

          <Input
            label="Description (optional)"
            placeholder="Add more details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
          />

          {/* Priority Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <Pressable
                  key={p.key}
                  onPress={() => setPriority(p.key)}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: priority === p.key ? p.color : colors.surface,
                      borderWidth: priority === p.key ? 0 : 1,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: priority === p.key ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Due Date */}
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
                    setDueDate(format(selectedDate, 'yyyy-MM-dd'));
                  }
                }}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <Button title="Done" onPress={() => setShowDatePicker(false)} size="sm" style={{ alignSelf: 'flex-end', marginTop: -8 }} />
            )}
          </View>

          {/* Assignee */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Assign to</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.assigneeRow}>
                {/* Unassigned option */}
                <Pressable
                  onPress={() => setAssignedTo(null)}
                  style={[
                    styles.assigneeChip,
                    {
                      backgroundColor: assignedTo === null ? colors.primaryLight : colors.surface,
                      borderColor: assignedTo === null ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="person-off"
                    size={18}
                    color={assignedTo === null ? colors.primary : colors.textTertiary}
                  />
                  <Text
                    style={{
                      color: assignedTo === null ? colors.primary : colors.textSecondary,
                      fontSize: FontSizes.sm,
                      fontWeight: FontWeights.medium,
                    }}
                  >
                    None
                  </Text>
                </Pressable>

                {members.map((m) => (
                  <Pressable
                    key={m.user.id}
                    onPress={() => setAssignedTo(m.user.id)}
                    style={[
                      styles.assigneeChip,
                      {
                        backgroundColor: assignedTo === m.user.id ? colors.primaryLight : colors.surface,
                        borderColor: assignedTo === m.user.id ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Avatar initials={m.user.initials} color={m.user.avatar_color} size={24} />
                    <Text
                      style={{
                        color: assignedTo === m.user.id ? colors.primary : colors.textSecondary,
                        fontSize: FontSizes.sm,
                        fontWeight: FontWeights.medium,
                      }}
                    >
                      {m.user.id === currentUser?.id ? 'Me' : m.user.full_name.split(' ')[0]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <Button
            title="Create Task"
            onPress={handleCreate}
            loading={loading}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  form: { padding: Spacing.three, gap: 18, paddingBottom: 40 },
  section: { gap: 8 },
  label: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, marginLeft: 2 },
  errorBanner: { padding: 12, borderRadius: Radius.md },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  priorityText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  assigneeRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});

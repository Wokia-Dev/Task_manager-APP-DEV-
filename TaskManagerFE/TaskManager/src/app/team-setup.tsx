/**
 * Team Setup Screen — Create or Join a team after registration.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/use-theme';
import { api, ApiError } from '@/services/api';

type Mode = 'select' | 'create' | 'join';

export default function TeamSetupScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setActiveTeam, logout } = useAuth();

  const [mode, setMode] = useState<Mode>('select');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  const handleCreate = async () => {
    if (!teamName.trim()) { setError('Team name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const { team } = await api.teams.create(teamName.trim());
      setCreatedCode(team.invite_code);
      setActiveTeam(team);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) { setError('Invite code is required'); return; }
    setLoading(true);
    setError('');
    try {
      const { team } = await api.teams.join(inviteCode.trim());
      await setActiveTeam(team);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    router.replace('/(tabs)');
  };

  // ─── Success state after team creation ──────
  if (createdCode) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.accentLight }]}>
            <MaterialIcons name="celebration" size={48} color={colors.accent} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Team Created!</Text>
          <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
            Share this invite code with your teammates:
          </Text>
          <View style={[styles.codeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.inviteCodeText, { color: colors.primary }]}>{createdCode}</Text>
          </View>
          <Button title="Go to Dashboard" onPress={goToDashboard} fullWidth size="lg" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialIcons name="groups" size={48} color="#FFF" />
        <Text style={styles.headerTitle}>Set Up Your Team</Text>
        <Text style={styles.headerSub}>Create a new team or join an existing one</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {mode === 'select' && (
            <>
              <Card onPress={() => setMode('create')} style={styles.optionCard}>
                <View style={[styles.optionIcon, { backgroundColor: colors.primaryLight }]}>
                  <MaterialIcons name="add-circle" size={28} color={colors.primary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>Create a Team</Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    Start a new team and invite your classmates
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </Card>

              <Card onPress={() => setMode('join')} style={styles.optionCard}>
                <View style={[styles.optionIcon, { backgroundColor: colors.accentLight }]}>
                  <MaterialIcons name="group-add" size={28} color={colors.accent} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>Join a Team</Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    Enter an invite code from your team leader
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </Card>
            </>
          )}

          {mode === 'create' && (
            <View style={styles.formSection}>
              <Pressable onPress={() => { setMode('select'); setError(''); }} style={styles.backRow}>
                <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
                <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
              </Pressable>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Create Your Team</Text>

              {error ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
                  <Text style={{ color: colors.danger, fontSize: FontSizes.sm }}>{error}</Text>
                </View>
              ) : null}

              <Input
                label="Team Name"
                placeholder="e.g., CS101 Project Team"
                value={teamName}
                onChangeText={setTeamName}
                leftIcon="groups"
              />

              <Button title="Create Team" onPress={handleCreate} loading={loading} fullWidth size="lg" />
            </View>
          )}

          {mode === 'join' && (
            <View style={styles.formSection}>
              <Pressable onPress={() => { setMode('select'); setError(''); }} style={styles.backRow}>
                <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
                <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
              </Pressable>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Join a Team</Text>

              {error ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
                  <Text style={{ color: colors.danger, fontSize: FontSizes.sm }}>{error}</Text>
                </View>
              ) : null}

              <Input
                label="Invite Code"
                placeholder="e.g., A3B7K9X2"
                value={inviteCode}
                onChangeText={setInviteCode}
                leftIcon="vpn-key"
                autoCapitalize="characters"
              />

              <Button title="Join Team" onPress={handleJoin} loading={loading} fullWidth size="lg" />
            </View>
          )}

          <Pressable onPress={logout} style={styles.logoutRow}>
            <MaterialIcons name="logout" size={18} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 36,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 8,
  },
  headerTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.extrabold, color: '#FFF' },
  headerSub: { fontSize: FontSizes.base, color: 'rgba(255,255,255,0.8)' },
  content: { padding: Spacing.four, gap: 16, paddingBottom: 40 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  optionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1, gap: 4 },
  optionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  optionDesc: { fontSize: FontSizes.sm, lineHeight: 18 },
  formSection: { gap: 16 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  backText: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },
  sectionTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  errorBanner: { padding: 12, borderRadius: Radius.md },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: 16,
  },
  successIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.extrabold },
  successMessage: { fontSize: FontSizes.base, textAlign: 'center' },
  codeBox: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  inviteCodeText: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.extrabold, letterSpacing: 4 },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    paddingVertical: 12,
  },
  logoutText: { fontSize: FontSizes.base, fontWeight: FontWeights.medium },
});

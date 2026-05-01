/**
 * Register Screen
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
import { Input } from '@/components/ui/Input';
import { FontSizes, FontWeights, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';

// Pleasant avatar colors
const AVATAR_COLORS = [
  '#6C63FF', '#00C9A7', '#FF6B6B', '#FFB347',
  '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD',
];

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'At least 3 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register({
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        avatar_color: selectedColor,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Connection failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Compute initials preview
  const initials = form.full_name.trim()
    ? form.full_name.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarPreview}>
          <View style={[styles.avatarCircle, { backgroundColor: selectedColor }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formArea}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {errors.general && (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
              <MaterialIcons name="error-outline" size={18} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.general}</Text>
            </View>
          )}

          <Input
            label="Full Name"
            placeholder="John Doe"
            value={form.full_name}
            onChangeText={v => updateField('full_name', v)}
            error={errors.full_name}
            leftIcon="person"
            autoComplete="name"
          />

          <Input
            label="Username"
            placeholder="johndoe"
            value={form.username}
            onChangeText={v => updateField('username', v)}
            error={errors.username}
            leftIcon="alternate-email"
            autoCapitalize="none"
            autoComplete="username"
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={form.email}
            onChangeText={v => updateField('email', v)}
            error={errors.email}
            leftIcon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChangeText={v => updateField('password', v)}
            error={errors.password}
            leftIcon="lock"
            isPassword
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChangeText={v => updateField('confirmPassword', v)}
            error={errors.confirmPassword}
            leftIcon="lock-outline"
            isPassword
          />

          {/* Avatar Color Picker */}
          <View style={styles.colorSection}>
            <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>
              Choose avatar color
            </Text>
            <View style={styles.colorRow}>
              {AVATAR_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorDotSelected,
                  ]}
                >
                  {selectedColor === c && (
                    <MaterialIcons name="check" size={16} color="#FFF" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
          />

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?
            </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.linkText, { color: colors.primary }]}> Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarPreview: { alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInitials: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.extrabold,
    color: '#FFF',
  },
  formArea: { flex: 1 },
  formContainer: {
    padding: Spacing.four,
    gap: 14,
    paddingTop: 24,
    paddingBottom: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
  },
  errorText: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, flex: 1 },
  colorSection: { gap: 8 },
  colorLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, marginLeft: 2 },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: { fontSize: FontSizes.base },
  linkText: { fontSize: FontSizes.base, fontWeight: FontWeights.bold },
});

/**
 * Login Screen
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

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Connection failed. Please check your network.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="task-alt" size={36} color={colors.primary} />
          </View>
          <Text style={styles.appName}>TaskFlow</Text>
          <Text style={styles.tagline}>Manage your team's work</Text>
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
          <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to continue to your workspace
          </Text>

          {errors.general && (
            <View style={[styles.errorBanner, { backgroundColor: colors.dangerLight }]}>
              <MaterialIcons name="error-outline" size={18} color={colors.danger} />
              <Text style={[styles.errorBannerText, { color: colors.danger }]}>
                {errors.general}
              </Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            leftIcon="lock"
            isPassword
            autoComplete="password"
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?
            </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.linkText, { color: colors.primary }]}> Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.extrabold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeights.medium,
  },
  formArea: {
    flex: 1,
  },
  formContainer: {
    padding: Spacing.four,
    gap: 18,
    paddingTop: 32,
  },
  welcomeText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  subtitle: {
    fontSize: FontSizes.base,
    marginBottom: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
  },
  errorBannerText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: FontSizes.base,
  },
  linkText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
  },
});

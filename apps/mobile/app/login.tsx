import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Button, Input, Screen } from '@/components/ui';
import { VedaLogo } from '@/components/brand/VedaLogo';
import { auth } from '@/lib/firebase';

function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes('invalid-credential') || msg.includes('wrong-password')) {
    return 'Incorrect email or password.';
  }
  if (msg.includes('email-already-in-use')) return 'An account with this email already exists.';
  if (msg.includes('weak-password')) return 'Password must be at least 6 characters.';
  if (msg.includes('invalid-email')) return 'Please enter a valid email address.';
  if (msg.includes('network')) return 'Network error — check your connection.';
  return 'Something went wrong. Please try again.';
}

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.trim() || !password) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      router.back();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <VedaLogo size={64} />
          <Text variant="hero" style={styles.brand}>
            VEDA
          </Text>
          <Text variant="bodySmall" style={styles.tagline}>
            {mode === 'signin'
              ? 'Welcome back, seeker.'
              : 'Begin your journey through the scriptures.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.form}>
          {mode === 'signup' ? (
            <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
          ) : null}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={error}
          />
          <Button
            title={mode === 'signin' ? 'Sign In' : 'Create Account'}
            onPress={submit}
            loading={busy}
            fullWidth
          />
          <Button
            title={mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
            onPress={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            variant="ghost"
            fullWidth
          />
          <View style={styles.guest}>
            <Button title="Continue as guest" variant="outline" onPress={() => router.back()} fullWidth />
          </View>
        </Animated.View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  header: { alignItems: 'center', marginTop: theme.spacing(10), marginBottom: theme.spacing(8) },
  brand: { letterSpacing: 8, marginTop: theme.spacing(3) },
  tagline: { marginTop: theme.spacing(1) },
  form: { gap: theme.spacing(4) },
  guest: { marginTop: theme.spacing(2) },
});

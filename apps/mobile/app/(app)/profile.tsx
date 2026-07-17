import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { theme } from '@/theme';
import { Text, Card, Screen, Button, EmptyState } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { useAuth } from '@/providers/AuthProvider';
import { auth } from '@/lib/firebase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return (
      <Screen tabBarSpace={false}>
        <ScreenHeader title="Profile" left="back" />
        <EmptyState
          emoji="🙏"
          title="You are browsing as a guest"
          message="Sign in to sync your library and preferences."
          actionLabel="Sign in"
          onAction={() => router.push('/login')}
        />
      </Screen>
    );
  }

  return (
    <Screen tabBarSpace={false}>
      <ScreenHeader title="Profile" left="back" />

      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={34} color={theme.colors.primary} />
        </View>
        <Text variant="heading">{user.displayName ?? 'Seeker'}</Text>
        <Text variant="bodySmall">{user.email}</Text>
        <Text variant="caption">
          Member since{' '}
          {user.metadata.creationTime
            ? new Date(user.metadata.creationTime).toLocaleDateString()
            : '—'}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button title="Settings" variant="outline" onPress={() => router.push('/(app)/settings' as never)} fullWidth />
        <Button
          title="Sign out"
          variant="ghost"
          onPress={async () => {
            await signOut(auth);
            router.back();
          }}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: theme.spacing(1.5), paddingVertical: theme.spacing(7) },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },
  actions: { gap: theme.spacing(3), marginTop: theme.spacing(5) },
});

import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { theme } from '@/theme';
import { Text, Pressable } from '@/components/ui';
import { VedaLogo } from '@/components/brand/VedaLogo';
import { useAuth } from '@/providers/AuthProvider';
import { auth } from '@/lib/firebase';

type IconName = keyof typeof Ionicons.glyphMap;

const SECTIONS: Array<{ label: string; items: Array<{ icon: IconName; label: string; href: string }> }> = [
  {
    label: 'Explore VEDA',
    items: [
      { icon: 'home-outline', label: 'Home', href: '/(app)/(tabs)/home' },
      { icon: 'book-outline', label: 'Scriptures', href: '/(app)/(tabs)/read' },
      { icon: 'chatbubble-ellipses-outline', label: 'Ask VEDA', href: '/(app)/(tabs)/ask' },
      { icon: 'compass-outline', label: 'Explore Concepts', href: '/(app)/(tabs)/explore' },
      { icon: 'flask-outline', label: 'Deep Research', href: '/(app)/research' },
    ],
  },
  {
    label: 'Your Library',
    items: [
      { icon: 'library-outline', label: 'Library', href: '/(app)/(tabs)/library' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: 'person-circle-outline', label: 'Profile', href: '/(app)/profile' },
      { icon: 'settings-outline', label: 'Settings', href: '/(app)/settings' },
    ],
  },
];

export function DrawerContent() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <View style={[styles.root, { paddingTop: insets.top + theme.spacing(4), paddingBottom: insets.bottom + theme.spacing(4) }]}>
      {/* Brand header */}
      <View style={styles.header}>
        <VedaLogo size={44} />
        <View>
          <Text variant="serif" style={styles.brand}>
            VEDA
          </Text>
          <Text variant="caption">Knowledge Operating System</Text>
        </View>
      </View>

      {/* User card */}
      <Pressable
        style={styles.userCard}
        onPress={() => router.push(user ? '/(app)/profile' : '/login')}
      >
        <Ionicons
          name={user ? 'person-circle' : 'log-in-outline'}
          size={34}
          color={theme.colors.primary}
        />
        <View style={styles.userText}>
          <Text variant="title" numberOfLines={1}>
            {user ? (user.displayName ?? user.email ?? 'Seeker') : 'Sign in'}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {user ? user.email : 'Sync bookmarks, notes & collections'}
          </Text>
        </View>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.sections}>
        {SECTIONS.map((section) => (
          <View key={section.label} style={styles.section}>
            <Text variant="label" style={styles.sectionLabel}>
              {section.label}
            </Text>
            {section.items.map((item) => {
              const active = pathname.includes(item.href.split('/').pop() ?? '');
              return (
                <Pressable
                  key={item.href}
                  haptic
                  style={[styles.item, active && styles.itemActive]}
                  onPress={() => router.push(item.href as never)}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={active ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text
                    variant="body"
                    style={active ? styles.itemLabelActive : styles.itemLabel}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {user ? (
        <Pressable style={styles.signOut} onPress={() => signOut(auth)}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text variant="body" color={theme.colors.error}>
            Sign out
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0C1220',
    paddingHorizontal: theme.spacing(4),
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(3), marginBottom: theme.spacing(5) },
  brand: { letterSpacing: 4, fontSize: 22 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: theme.spacing(5),
  },
  userText: { flex: 1 },
  sections: { flex: 1 },
  section: { marginBottom: theme.spacing(5) },
  sectionLabel: { marginBottom: theme.spacing(2), marginLeft: theme.spacing(2) },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.radius.md,
  },
  itemActive: { backgroundColor: theme.colors.primarySoft },
  itemLabel: { color: theme.colors.textSecondary },
  itemLabelActive: { color: theme.colors.primary, fontFamily: theme.font.sansSemiBold },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(3),
    paddingHorizontal: theme.spacing(3),
  },
});

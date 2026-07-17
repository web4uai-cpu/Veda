import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Card, Pressable, Screen, Skeleton } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { MandalaRing } from '@/components/brand/MandalaRing';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/store/settings';
import { useScriptures } from '@/lib/queries';

type IconName = keyof typeof Ionicons.glyphMap;

const QUICK_ACTIONS: Array<{
  icon: IconName;
  label: string;
  sub: string;
  href: string;
  colors: [string, string];
}> = [
  { icon: 'chatbubble-ellipses', label: 'Ask VEDA', sub: 'AI answers with citations', href: '/(app)/(tabs)/ask', colors: ['#E8A23C', '#C97A24'] },
  { icon: 'book', label: 'Read', sub: 'Browse the scriptures', href: '/(app)/(tabs)/read', colors: ['#5478AE', '#243B63'] },
  { icon: 'compass', label: 'Explore', sub: 'Concepts & schools', href: '/(app)/(tabs)/explore', colors: ['#A78BFA', '#6D4ACF'] },
  { icon: 'flask', label: 'Research', sub: 'Deep structured reports', href: '/(app)/research', colors: ['#34D399', '#0F8A5F'] },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const lastRead = useSettings((s) => s.lastRead);
  const { data, isLoading } = useScriptures();

  const featured = data?.scriptures?.find((s) => s.verse_count > 0);
  const greetingName = user?.displayName?.split(' ')[0];

  return (
    <Screen>
      <ScreenHeader
        title={`Namaste${greetingName ? `, ${greetingName}` : ''}`}
        subtitle="What wisdom do you seek today?"
      />

      {/* Hero card */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <Card style={styles.hero} padded={false}>
          <View style={styles.heroMandala}>
            <MandalaRing size={220} opacity={0.14} />
          </View>
          <View style={styles.heroInner}>
            <Text variant="label" color={theme.colors.primary}>
              Featured Scripture
            </Text>
            {isLoading ? (
              <View style={styles.heroSkeleton}>
                <Skeleton width={200} height={26} />
                <Skeleton width={140} height={14} />
              </View>
            ) : featured ? (
              <>
                {featured.sanskrit_name ? (
                  <Text variant="sanskrit" style={styles.heroSanskrit}>
                    {featured.sanskrit_name}
                  </Text>
                ) : null}
                <Text variant="hero" style={styles.heroTitle}>
                  {featured.name}
                </Text>
                <Text variant="bodySmall" numberOfLines={2}>
                  {featured.description ??
                    `${featured.chapter_count} chapters · ${featured.verse_count} verses`}
                </Text>
                <Pressable
                  haptic
                  style={styles.heroCta}
                  onPress={() => router.push(`/(app)/read/${featured.slug}` as never)}
                >
                  <Text variant="title" color={theme.colors.primary}>
                    Start reading
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                </Pressable>
              </>
            ) : (
              <Text variant="bodySmall">Scriptures are being prepared…</Text>
            )}
          </View>
        </Card>
      </Animated.View>

      {/* Continue reading */}
      {lastRead ? (
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Pressable
            haptic
            onPress={() =>
              router.push(`/(app)/read/${lastRead.slug}/${lastRead.chapterNumber}` as never)
            }
          >
            <Card style={styles.continueCard}>
              <Ionicons name="bookmark" size={20} color={theme.colors.primary} />
              <View style={styles.continueText}>
                <Text variant="title">Continue reading</Text>
                <Text variant="bodySmall">
                  {lastRead.scriptureName} · Chapter {lastRead.chapterNumber}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Card>
          </Pressable>
        </Animated.View>
      ) : null}

      {/* Quick actions */}
      <Text variant="label" style={styles.sectionLabel}>
        Begin your journey
      </Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action, i) => (
          <Animated.View
            key={action.label}
            entering={FadeInDown.delay(120 + i * 60).duration(400)}
            style={styles.gridItem}
          >
            <Pressable haptic onPress={() => router.push(action.href as never)}>
              <LinearGradient
                colors={action.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.action}
              >
                <Ionicons name={action.icon} size={26} color="#FFFFFF" />
                <Text variant="title" style={styles.actionLabel}>
                  {action.label}
                </Text>
                <Text variant="caption" style={styles.actionSub}>
                  {action.sub}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* Categories rail */}
      <Text variant="label" style={styles.sectionLabel}>
        Traditions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {[
          { label: 'Vedas', category: 'veda' },
          { label: 'Upanishads', category: 'upanishad' },
          { label: 'Bhagavad Gita', category: 'gita' },
          { label: 'Puranas', category: 'purana' },
          { label: 'Itihasa', category: 'ramayana' },
          { label: 'Shastras', category: 'shastra' },
        ].map((c) => (
          <Pressable
            key={c.category}
            style={styles.railChip}
            onPress={() => router.push('/(app)/(tabs)/read' as never)}
          >
            <Text variant="bodySmall" color={theme.colors.text}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: theme.spacing(4), overflow: 'hidden' },
  heroMandala: { position: 'absolute', right: -70, top: -70 },
  heroInner: { padding: theme.spacing(5), gap: theme.spacing(1.5) },
  heroSkeleton: { gap: theme.spacing(2), marginTop: theme.spacing(2) },
  heroSanskrit: { fontSize: 16, lineHeight: 26, color: theme.colors.textSecondary },
  heroTitle: { fontSize: 30, lineHeight: 36 },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(3),
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
  continueText: { flex: 1 },
  sectionLabel: { marginBottom: theme.spacing(3), marginTop: theme.spacing(2) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(3), marginBottom: theme.spacing(4) },
  gridItem: { width: '47.7%' },
  action: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing(4),
    gap: theme.spacing(1),
    minHeight: 110,
  },
  actionLabel: { color: '#FFFFFF', marginTop: theme.spacing(1) },
  actionSub: { color: 'rgba(255,255,255,0.75)' },
  rail: { gap: theme.spacing(2), paddingBottom: theme.spacing(2) },
  railChip: {
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2.5),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
});

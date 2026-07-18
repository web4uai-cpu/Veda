/**
 * Knowledge Graph — placeholder.
 *
 * The Neo4j instance backing the graph is not provisioned on the current plan,
 * so the live implementation (radial view, hub list, graph search) was pulled
 * rather than left calling endpoints that return nothing. See git history for
 * the working version to restore once the graph is connected.
 *
 * Deliberately makes zero network requests.
 */
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Text, Card, Pressable, Screen } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { MandalaRing } from '@/components/brand/MandalaRing';

const UPCOMING: Array<{ icon: keyof typeof Ionicons.glyphMap; title: string; body: string }> = [
  {
    icon: 'git-network-outline',
    title: 'Concept ↔ verse traversal',
    body: 'Follow a concept like karma through every verse that teaches it, up to five hops out.',
  },
  {
    icon: 'school-outline',
    title: 'School lineages',
    body: 'See how Advaita, Dvaita and Vishishtadvaita read the same passage differently.',
  },
  {
    icon: 'swap-horizontal-outline',
    title: 'Contradiction mapping',
    body: 'Where sources disagree, both readings are surfaced side by side — never merged.',
  },
];

export default function GraphScreen() {
  const router = useRouter();
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withTiming(360, { duration: 60000, easing: Easing.linear });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mandalaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <Screen>
      <ScreenHeader title="Knowledge Graph" subtitle="Coming soon" />

      <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
        <Animated.View style={[styles.mandala, mandalaStyle]}>
          <MandalaRing size={200} opacity={0.22} />
        </Animated.View>
        <Ionicons
          name="git-network-outline"
          size={44}
          color={theme.colors.primary}
          style={styles.heroIcon}
        />
      </Animated.View>

      <Text variant="bodySmall" style={styles.lede}>
        The graph layer is being provisioned. Once it is live, every concept, verse
        and school in the corpus becomes navigable as one connected map.
      </Text>

      <View style={styles.list}>
        {UPCOMING.map((item, i) => (
          <Animated.View key={item.title} entering={FadeInDown.delay(100 + i * 70).duration(400)}>
            <Card style={styles.card}>
              <View style={styles.cardHead}>
                <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
                <Text variant="title">{item.title}</Text>
              </View>
              <Text variant="bodySmall">{item.body}</Text>
            </Card>
          </Animated.View>
        ))}
      </View>

      <Pressable
        haptic
        style={styles.cta}
        onPress={() => router.push('/(app)/explore' as never)}
      >
        <Ionicons name="compass-outline" size={18} color={theme.colors.primary} />
        <Text variant="body" color={theme.colors.primary}>
          Explore concepts instead
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  mandala: { position: 'absolute' },
  heroIcon: { opacity: 0.9 },
  lede: { textAlign: 'center', marginBottom: theme.spacing(5) },
  list: { gap: theme.spacing(3) },
  card: { gap: theme.spacing(2) },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(2) },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(3),
    marginTop: theme.spacing(5),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
});

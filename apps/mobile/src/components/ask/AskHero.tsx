import { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Chip } from '@/components/ui';
import { MandalaRing } from '@/components/brand/MandalaRing';

/**
 * Ask VEDA's empty state — the mobile counterpart of the website hero.
 *
 * The web hero's Three.js SacredGeometry can't run here, so a slowly rotating
 * MandalaRing stands in for it. Reveal delays mirror the web TextReveal timings
 * (0.3s then 0.6s) so both surfaces feel like one product.
 */

const SUGGESTIONS = [
  'What does the Gita say about duty?',
  'Explain karma yoga',
  'Who is Arjuna?',
  'What is the nature of the atman?',
];

export function AskHero({ onPick }: { onPick: (q: string) => void }) {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(spin);
  }, [spin]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.root}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.mandalaWrap}>
        <Animated.View style={[styles.mandala, spinStyle]}>
          <MandalaRing size={260} opacity={0.28} />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(600)}>
          <Text style={styles.om}>ॐ</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(300).duration(500)}>
        <Text variant="hero" style={styles.line1}>
          Explore the Wisdom of
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(600).duration(500)}>
        <Text variant="hero" style={styles.line2}>
          Sanatan Dharma
        </Text>
      </Animated.View>

      {/* Sanskrit → transliteration → translation, never combined (CLAUDE.md). */}
      <Animated.View entering={FadeInUp.delay(900).duration(500)} style={styles.banner}>
        <Text variant="sanskrit" style={styles.bannerSanskrit}>
          ज्ञानं परमं बलम्
        </Text>
        <Text variant="transliteration" style={styles.centered}>
          Jñānaṁ Paramaṁ Balam
        </Text>
        <Text variant="caption" style={styles.centered}>
          Knowledge is the Supreme Power
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(1150).duration(500)} style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <Chip key={s} label={s} onPress={() => onPick(s)} />
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing(6),
    paddingVertical: theme.spacing(6),
  },
  mandalaWrap: { alignItems: 'center', justifyContent: 'center', height: 260, marginBottom: theme.spacing(2) },
  mandala: { position: 'absolute' },
  om: {
    fontSize: 56,
    color: theme.colors.primary,
    fontFamily: theme.font.devanagari,
    lineHeight: 84,
    textAlign: 'center',
  },
  line1: { fontSize: 28, lineHeight: 36, textAlign: 'center', color: theme.colors.textSecondary },
  line2: { fontSize: 34, lineHeight: 44, textAlign: 'center', color: theme.colors.primary },
  banner: { marginTop: theme.spacing(5), alignItems: 'center', gap: 2 },
  bannerSanskrit: { textAlign: 'center', color: theme.colors.text },
  centered: { textAlign: 'center' },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(6),
  },
});

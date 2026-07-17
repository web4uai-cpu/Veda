import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text } from '@/components/ui';
import { VedaLogo } from './VedaLogo';
import { MandalaRing } from './MandalaRing';

interface Props {
  onDone: () => void;
}

/**
 * In-app animated splash: mandala rotates + fades in, logo springs up,
 * "VEDA" serif wordmark reveals, then the whole overlay fades away.
 */
export function AnimatedSplash({ onDone }: Props) {
  const mandalaRotate = useSharedValue(-30);
  const mandalaOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const wordOpacity = useSharedValue(0);
  const wordTranslate = useSharedValue(10);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    mandalaOpacity.value = withTiming(1, { duration: 900 });
    mandalaRotate.value = withTiming(30, { duration: 2400, easing: Easing.out(Easing.cubic) });
    logoOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));
    logoScale.value = withDelay(250, withSpring(1, { damping: 12, stiffness: 120 }));
    wordOpacity.value = withDelay(750, withTiming(1, { duration: 600 }));
    wordTranslate.value = withDelay(750, withTiming(0, { duration: 600 }));
    overlayOpacity.value = withDelay(
      2100,
      withTiming(0, { duration: 450 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const mandalaStyle = useAnimatedStyle(() => ({
    opacity: mandalaOpacity.value,
    transform: [{ rotate: `${mandalaRotate.value}deg` }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordTranslate.value }],
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View style={[styles.mandala, mandalaStyle]}>
          <MandalaRing size={260} opacity={0.35} />
        </Animated.View>
        <Animated.View style={logoStyle}>
          <VedaLogo size={84} />
        </Animated.View>
        <Animated.View style={wordStyle}>
          <Text variant="hero" style={styles.word}>
            VEDA
          </Text>
          <Text variant="label" style={styles.tagline}>
            Knowledge Operating System
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  center: { alignItems: 'center', gap: theme.spacing(5) },
  mandala: { position: 'absolute', alignSelf: 'center', top: -70 },
  word: {
    letterSpacing: 10,
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  tagline: {
    textAlign: 'center',
    marginTop: theme.spacing(1),
    color: theme.colors.textMuted,
  },
});

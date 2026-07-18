/**
 * Drawer account control — a compact pill toggle rather than a static card.
 *
 * Signed out, the knob sits left; pressing springs it across and fades the pill
 * before navigating, so the control visibly completes rather than just
 * disappearing under a route change. Signed in, the knob rests on the right and
 * the pill is a shortcut to the profile.
 */
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Text, Pressable } from '@/components/ui';

const TRACK_HEIGHT = 52;
const KNOB = 40;
const PAD = (TRACK_HEIGHT - KNOB) / 2;

interface Props {
  /** Display name when signed in; null renders the signed-out state. */
  name: string | null;
  detail: string | null;
  signedIn: boolean;
  onActivate: () => void;
}

export function SignInToggle({ name, detail, signedIn, onActivate }: Props) {
  // 0 = knob left (signed out), 1 = knob right (signed in / completing).
  const progress = useSharedValue(signedIn ? 1 : 0);
  const fade = useSharedValue(1);
  const width = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(signedIn ? 1 : 0, { damping: 15, stiffness: 140 });
  }, [signedIn, progress]);

  function press() {
    if (signedIn) {
      onActivate();
      return;
    }
    // Let the knob finish its travel before the route changes.
    progress.value = withSpring(1, { damping: 14, stiffness: 130 });
    fade.value = withTiming(0.6, { duration: 260 }, (finished) => {
      if (finished) {
        fade.value = withTiming(1, { duration: 200 });
        progress.value = withSpring(0, { damping: 15, stiffness: 140 });
        runOnJS(onActivate)();
      }
    });
  }

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, Math.max(width.value - KNOB - PAD * 2, 0)]) },
    ],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.primary, theme.colors.cardBorder],
    ),
  }));

  // The label sits opposite the knob, so it slides the other way.
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45, 1], [1, 0.35, 1]),
  }));

  return (
    <Pressable haptic scaleTo={0.98} onPress={press}>
      <Animated.View
        style={[styles.track, trackStyle]}
        onLayout={(e) => {
          width.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View style={[styles.knob, knobStyle]}>
          <Ionicons
            name={signedIn ? 'person-circle' : 'log-in-outline'}
            size={22}
            color={theme.colors.primary}
          />
        </Animated.View>

        <Animated.View
          style={[styles.labels, signedIn ? styles.labelsLeft : styles.labelsRight, labelStyle]}
        >
          <Text variant="bodySmall" numberOfLines={1} style={styles.name}>
            {signedIn ? (name ?? 'Your account') : 'Sign in'}
          </Text>
          {detail ? (
            <Text variant="caption" numberOfLines={1}>
              {detail}
            </Text>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    backgroundColor: theme.colors.primarySoft,
    padding: PAD,
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
  knob: {
    position: 'absolute',
    left: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  labels: { justifyContent: 'center' },
  // Knob on the right → text to its left, and vice versa.
  labelsLeft: { marginRight: KNOB + PAD, marginLeft: theme.spacing(3), alignItems: 'flex-start' },
  labelsRight: { marginLeft: KNOB + PAD, marginRight: theme.spacing(3), alignItems: 'flex-start' },
  name: { color: theme.colors.text },
});

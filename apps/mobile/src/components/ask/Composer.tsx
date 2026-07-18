import { useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { Pressable } from '@/components/ui';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  busy?: boolean;
  placeholder?: string;
}

/**
 * The bottom-pinned input pill shared by Ask and Deep Research.
 *
 * While `busy`, the border cycles through saffron so the wait reads as active
 * work rather than a frozen field — the mobile counterpart of the web's
 * loading-step ticker.
 */
export function Composer({ value, onChangeText, onSubmit, busy, placeholder = 'Ask VEDA…' }: Props) {
  const glow = useSharedValue(0);

  useEffect(() => {
    if (busy) {
      glow.value = withRepeat(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(glow);
      glow.value = withTiming(0, { duration: 200 });
    }
    return () => cancelAnimation(glow);
  }, [busy, glow]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      glow.value,
      [0, 1],
      [theme.colors.cardBorder, theme.colors.primary],
    ),
  }));

  const canSend = value.trim().length > 0 && !busy;

  return (
    <Animated.View style={[styles.pill, borderStyle]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.primary}
        multiline
        editable={!busy}
        onSubmitEditing={onSubmit}
      />
      <Pressable haptic onPress={onSubmit} disabled={!canSend}>
        <LinearGradient
          colors={[theme.colors.primaryBright, theme.colors.primary]}
          style={[styles.sendBtn, !canSend && styles.sendDisabled]}
        >
          <Ionicons name={busy ? 'ellipsis-horizontal' : 'arrow-up'} size={20} color="#fff" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing(2),
    borderWidth: 1,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surfaceElevated,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.5),
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingVertical: theme.spacing(2),
    fontFamily: theme.font.sans,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.35 },
});

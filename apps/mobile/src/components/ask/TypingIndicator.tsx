import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { theme } from '@/theme';

function Dot({ delay }: { delay: number }) {
  const translate = useSharedValue(0);

  useEffect(() => {
    translate.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(-5, { duration: 300 }), withTiming(0, { duration: 300 })),
        -1,
      ),
    );
  }, [delay, translate]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translate.value }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function TypingIndicator() {
  return (
    <View style={styles.bubble}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: theme.glass.backgroundColor,
    borderWidth: 1,
    borderColor: theme.glass.borderColor,
    borderRadius: theme.radius.lg,
    borderBottomLeftRadius: 6,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3.5),
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.primary,
  },
});

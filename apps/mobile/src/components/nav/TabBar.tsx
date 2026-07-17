import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { theme } from '@/theme';
import { Text, Pressable } from '@/components/ui';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_META: Record<string, { icon: IconName; iconActive: IconName; label: string }> = {
  home: { icon: 'home-outline', iconActive: 'home', label: 'Home' },
  read: { icon: 'book-outline', iconActive: 'book', label: 'Read' },
  ask: { icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses', label: 'Ask' },
  explore: { icon: 'compass-outline', iconActive: 'compass', label: 'Explore' },
  library: { icon: 'library-outline', iconActive: 'library', label: 'Library' },
};

/** Floating glass tab bar with saffron active state. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, theme.spacing(3)) }]}>
      <BlurView intensity={40} tint="dark" style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = TAB_META[route.name] ?? {
            icon: 'ellipse-outline' as IconName,
            iconActive: 'ellipse' as IconName,
            label: route.name,
          };

          return (
            <Pressable
              key={route.key}
              haptic
              style={styles.tab}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            >
              <Ionicons
                name={focused ? meta.iconActive : meta.icon}
                size={22}
                color={focused ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text
                variant="caption"
                style={focused ? styles.labelActive : styles.label}
              >
                {meta.label}
              </Text>
              {focused ? <Animated.View entering={FadeIn.duration(200)} style={styles.dot} /> : null}
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: theme.spacing(4),
    right: theme.spacing(4),
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.tabBar,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingVertical: theme.spacing(2),
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: theme.spacing(1) },
  label: { color: theme.colors.textMuted },
  labelActive: { color: theme.colors.primary, fontFamily: theme.font.sansSemiBold },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 1,
  },
});

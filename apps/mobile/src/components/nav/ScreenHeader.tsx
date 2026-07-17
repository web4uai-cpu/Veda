import { View, StyleSheet } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Text, Pressable } from '@/components/ui';

interface Props {
  title: string;
  subtitle?: string;
  /** 'menu' opens the drawer (tab roots); 'back' pops the stack. */
  left?: 'menu' | 'back' | 'none';
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, left = 'menu', right }: Props) {
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <View style={styles.row}>
      {left !== 'none' ? (
        <Pressable
          haptic
          style={styles.iconBtn}
          onPress={() =>
            left === 'menu'
              ? navigation.dispatch(DrawerActions.openDrawer())
              : router.back()
          }
        >
          <Ionicons
            name={left === 'menu' ? 'menu-outline' : 'arrow-back-outline'}
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
      ) : null}
      <View style={styles.titles}>
        <Text variant="heading" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  titles: { flex: 1 },
});

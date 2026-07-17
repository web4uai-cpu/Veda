import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { Text } from './Text';
import { Pressable } from './Pressable';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, fullWidth }: Props) {
  const isDisabled = disabled || loading;

  const inner = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : theme.colors.primary} />
      ) : (
        <>
          {icon}
          <Text
            variant="title"
            style={[
              styles.title,
              variant === 'primary' ? styles.titlePrimary : { color: theme.colors.primary },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      haptic
      style={[fullWidth && styles.fullWidth, isDisabled && styles.disabled]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[theme.colors.primaryBright, theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View style={[styles.base, variant === 'outline' ? styles.outline : styles.ghost]}>{inner}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(3.5),
    paddingHorizontal: theme.spacing(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(2) },
  title: { fontSize: theme.fontSize.base },
  titlePrimary: { color: '#FFFFFF' },
  ghost: { backgroundColor: theme.colors.primarySoft },
  outline: { borderWidth: 1, borderColor: theme.colors.cardBorder, backgroundColor: 'transparent' },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
});

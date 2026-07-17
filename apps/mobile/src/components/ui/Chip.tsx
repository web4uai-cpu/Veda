import { StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';
import { Pressable } from './Pressable';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}

export function Chip({ label, active, onPress, color }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        active && styles.active,
        color ? { backgroundColor: `${color}22`, borderColor: `${color}55` } : null,
      ]}
    >
      <Text
        variant="bodySmall"
        style={[styles.label, active && styles.labelActive, color ? { color } : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(1.5),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  active: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  label: { color: theme.colors.textSecondary },
  labelActive: { color: '#FFFFFF', fontFamily: theme.font.sansSemiBold },
});

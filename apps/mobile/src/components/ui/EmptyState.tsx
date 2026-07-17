import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  emoji?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = '🪔', title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="title" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="bodySmall" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} variant="ghost" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: theme.spacing(12), paddingHorizontal: theme.spacing(6) },
  emoji: { fontSize: 40, marginBottom: theme.spacing(3) },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: theme.spacing(2), maxWidth: 280 },
  action: { marginTop: theme.spacing(4) },
});

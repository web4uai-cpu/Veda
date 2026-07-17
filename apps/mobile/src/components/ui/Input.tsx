import { TextInput, type TextInputProps, StyleSheet, View } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function Input({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.primary}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color={theme.colors.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing(1.5) },
  label: { marginLeft: theme.spacing(1) },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    fontFamily: theme.font.sans,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  inputError: { borderColor: theme.colors.error },
});

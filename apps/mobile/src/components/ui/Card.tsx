import { View, type ViewProps, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface Props extends ViewProps {
  padded?: boolean;
}

/** Glass-morphism card — translucent dark surface with hairline border. */
export function Card({ padded = true, style, ...rest }: Props) {
  return <View style={[styles.card, padded && styles.padded, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.glass.backgroundColor,
    borderColor: theme.glass.borderColor,
    borderWidth: theme.glass.borderWidth,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },
  padded: {
    padding: theme.spacing(4),
  },
});

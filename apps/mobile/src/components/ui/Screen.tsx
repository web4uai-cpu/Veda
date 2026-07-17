import { type ReactNode } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Extra bottom padding so content clears the floating tab bar. */
  tabBarSpace?: boolean;
}

export function Screen({ children, scroll = true, padded = true, refreshing, onRefresh, tabBarSpace = true }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + theme.spacing(3),
    paddingBottom: (tabBarSpace ? 96 : theme.spacing(6)) + insets.bottom,
  };

  if (!scroll) {
    return (
      <View style={[styles.root, padding, padded && styles.padded]}>{children}</View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[padding, padded && styles.padded]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  padded: { paddingHorizontal: theme.spacing(4) },
});

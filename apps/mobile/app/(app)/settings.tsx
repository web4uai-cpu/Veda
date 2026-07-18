import { View, StyleSheet, Switch } from 'react-native';
import Constants from 'expo-constants';
import { theme } from '@/theme';
import { Text, Card, Screen } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { VedaLogo } from '@/components/brand/VedaLogo';
import { useSettings } from '@/store/settings';

export default function SettingsScreen() {
  const {
    showTransliteration,
    toggleTransliteration,
    showTranslation,
    toggleTranslation,
  } = useSettings();

  return (
    <Screen>
      <ScreenHeader title="Settings" left="back" />

      <Text variant="label" style={styles.sectionLabel}>
        Reading
      </Text>
      <Card style={styles.group}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text variant="body">Transliteration (IAST)</Text>
            <Text variant="caption">Show romanized Sanskrit under each verse</Text>
          </View>
          <Switch
            value={showTransliteration}
            onValueChange={toggleTransliteration}
            trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceElevated }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text variant="body">English translation</Text>
            <Text variant="caption">Show translation under each verse</Text>
          </View>
          <Switch
            value={showTranslation}
            onValueChange={toggleTranslation}
            trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceElevated }}
            thumbColor="#fff"
          />
        </View>
      </Card>

      <Text variant="label" style={styles.sectionLabel}>
        About
      </Text>
      <Card style={styles.about}>
        <VedaLogo size={44} />
        <Text variant="serif" style={styles.aboutTitle}>
          VEDA
        </Text>
        <Text variant="bodySmall" style={styles.aboutText}>
          Knowledge Operating System for Sanatan Dharma. Every AI answer is grounded in and cited
          from canonical scripture.
        </Text>
        <Text variant="caption">Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginBottom: theme.spacing(2), marginTop: theme.spacing(2) },
  group: { paddingVertical: theme.spacing(2) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing(2.5),
    gap: theme.spacing(3),
  },
  rowText: { flex: 1, gap: 1 },
  divider: { height: 1, backgroundColor: theme.colors.cardBorder },
  about: { alignItems: 'center', gap: theme.spacing(2), paddingVertical: theme.spacing(6) },
  aboutTitle: { letterSpacing: 4 },
  aboutText: { textAlign: 'center', maxWidth: 280 },
});

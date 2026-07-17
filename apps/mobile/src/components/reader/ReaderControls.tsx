import { Modal, StyleSheet, View, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { Text, Pressable } from '@/components/ui';
import { useSettings } from '@/store/settings';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SCALES = [0.85, 1, 1.15, 1.3];

/** Bottom sheet with reading preferences (font size, layers shown). */
export function ReaderControls({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const {
    fontScale,
    setFontScale,
    showTransliteration,
    toggleTransliteration,
    showTranslation,
    toggleTranslation,
  } = useSettings();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing(5) }]}>
        <View style={styles.handle} />
        <Text variant="title" style={styles.title}>
          Reading preferences
        </Text>

        <Text variant="label" style={styles.sectionLabel}>
          Text size
        </Text>
        <View style={styles.scaleRow}>
          {SCALES.map((s) => (
            <Pressable
              key={s}
              haptic
              style={[styles.scaleBtn, fontScale === s && styles.scaleBtnActive]}
              onPress={() => setFontScale(s)}
            >
              <Text
                style={{
                  fontFamily: theme.font.sansSemiBold,
                  fontSize: 12 + s * 6,
                  color: fontScale === s ? '#fff' : theme.colors.textSecondary,
                }}
              >
                A
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.toggleRow}>
          <Text variant="body">Show transliteration (IAST)</Text>
          <Switch
            value={showTransliteration}
            onValueChange={toggleTransliteration}
            trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceElevated }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.toggleRow}>
          <Text variant="body">Show translation</Text>
          <Switch
            value={showTranslation}
            onValueChange={toggleTranslation}
            trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceElevated }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: theme.colors.overlay },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textMuted,
    marginBottom: theme.spacing(4),
  },
  title: { marginBottom: theme.spacing(4) },
  sectionLabel: { marginBottom: theme.spacing(2) },
  scaleRow: { flexDirection: 'row', gap: theme.spacing(2), marginBottom: theme.spacing(5) },
  scaleBtn: {
    width: 52,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  scaleBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing(2.5),
  },
});

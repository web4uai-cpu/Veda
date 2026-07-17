import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { theme } from '@/theme';
import { Text, Card } from '@/components/ui';
import { api, type Verse } from '@/lib/api';
import { useSettings } from '@/store/settings';
import { useAuth } from '@/providers/AuthProvider';

/** Renders one verse in the canonical Sanskrit → IAST → translation stack. */
export function VerseCard({ verse }: { verse: Verse }) {
  const { user } = useAuth();
  const fontScale = useSettings((s) => s.fontScale);
  const showTransliteration = useSettings((s) => s.showTransliteration);
  const showTranslation = useSettings((s) => s.showTranslation);
  const [bookmarked, setBookmarked] = useState(false);

  const { sanskrit, transliteration, translation } = useMemo(() => {
    const sanskrit = verse.contents.find((c) => c.content_type === 'sanskrit');
    const transliteration = verse.contents.find((c) => c.content_type === 'transliteration');
    const translation =
      verse.contents.find((c) => c.content_type === 'translation' && c.is_primary) ??
      verse.contents.find((c) => c.content_type === 'translation');
    return { sanskrit, transliteration, translation };
  }, [verse]);

  const bookmark = useMutation({
    mutationFn: () => api.createBookmark('verse', verse.id),
    onSuccess: () => {
      setBookmarked(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text variant="label" color={theme.colors.primary}>
          {verse.canonical_reference}
        </Text>
        {user ? (
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={bookmarked ? theme.colors.primary : theme.colors.textMuted}
            onPress={() => !bookmarked && bookmark.mutate()}
          />
        ) : null}
      </View>

      {sanskrit ? (
        <Text
          variant="sanskrit"
          style={{ fontSize: theme.fontSize.lg * fontScale, lineHeight: 36 * fontScale }}
        >
          {sanskrit.content}
        </Text>
      ) : null}

      {showTransliteration && transliteration ? (
        <Text
          variant="transliteration"
          style={[styles.transliteration, { fontSize: theme.fontSize.sm * fontScale }]}
        >
          {transliteration.content}
        </Text>
      ) : null}

      {showTranslation && translation ? (
        <Text
          variant="body"
          style={[styles.translation, { fontSize: theme.fontSize.base * fontScale, lineHeight: 22 * fontScale }]}
        >
          {translation.content}
        </Text>
      ) : null}

      {translation?.source ? (
        <Text variant="caption" style={styles.source}>
          — {translation.source}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.spacing(2) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transliteration: { marginTop: theme.spacing(1) },
  translation: { marginTop: theme.spacing(1) },
  source: { marginTop: theme.spacing(1) },
});

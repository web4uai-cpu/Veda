import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Text, Pressable, Skeleton, EmptyState } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { VerseCard } from '@/components/reader/VerseCard';
import { ReaderControls } from '@/components/reader/ReaderControls';
import { useScripture, useVerses } from '@/lib/queries';
import { useSettings } from '@/store/settings';

export default function ChapterReaderScreen() {
  const { slug, chapter } = useLocalSearchParams<{ slug: string; chapter: string }>();
  const chapterNumber = Number(chapter);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [controlsOpen, setControlsOpen] = useState(false);
  const setLastRead = useSettings((s) => s.setLastRead);

  const scriptureQ = useScripture(slug);
  const versesQ = useVerses(scriptureQ.data?.id, chapterNumber);

  const scripture = scriptureQ.data;
  const verses = useMemo(() => versesQ.data?.verses ?? [], [versesQ.data]);
  const totalChapters = scripture?.chapter_count ?? 0;

  useEffect(() => {
    if (scripture) {
      setLastRead({ slug, scriptureName: scripture.name, chapterNumber });
    }
  }, [scripture, slug, chapterNumber, setLastRead]);

  const header = (
    <View style={styles.headerBlock}>
      <ScreenHeader
        title={`Chapter ${chapterNumber}`}
        subtitle={scripture?.name}
        left="back"
        right={
          <Pressable haptic style={styles.controlBtn} onPress={() => setControlsOpen(true)}>
            <Ionicons name="text-outline" size={20} color={theme.colors.text} />
          </Pressable>
        }
      />
      <Text variant="caption" style={styles.verseCount}>
        {verses.length} verses
      </Text>
    </View>
  );

  const footer =
    totalChapters > 1 ? (
      <View style={styles.pager}>
        {chapterNumber > 1 ? (
          <Pressable
            haptic
            style={styles.pagerBtn}
            onPress={() => router.replace(`/(app)/read/${slug}/${chapterNumber - 1}` as never)}
          >
            <Ionicons name="chevron-back" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" color={theme.colors.primary}>
              Chapter {chapterNumber - 1}
            </Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Text variant="caption">
          {chapterNumber} of {totalChapters}
        </Text>
        {chapterNumber < totalChapters ? (
          <Pressable
            haptic
            style={styles.pagerBtn}
            onPress={() => router.replace(`/(app)/read/${slug}/${chapterNumber + 1}` as never)}
          >
            <Text variant="bodySmall" color={theme.colors.primary}>
              Chapter {chapterNumber + 1}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </Pressable>
        ) : (
          <View />
        )}
      </View>
    ) : null;

  return (
    <View style={styles.root}>
      <FlatList
        data={verses}
        keyExtractor={(v) => v.id}
        renderItem={({ item }) => <VerseCard verse={item} />}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={
          versesQ.isLoading ? (
            <View style={styles.skeletons}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} height={160} radius={theme.radius.card} />
              ))}
            </View>
          ) : (
            <EmptyState title="No verses in this chapter yet" />
          )
        }
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + theme.spacing(3), paddingBottom: insets.bottom + theme.spacing(8) },
        ]}
        showsVerticalScrollIndicator={false}
      />
      <ReaderControls visible={controlsOpen} onClose={() => setControlsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: theme.spacing(4), gap: theme.spacing(3) },
  headerBlock: { marginBottom: theme.spacing(1) },
  verseCount: { marginBottom: theme.spacing(2) },
  controlBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  skeletons: { gap: theme.spacing(3) },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing(5),
  },
  pagerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
});

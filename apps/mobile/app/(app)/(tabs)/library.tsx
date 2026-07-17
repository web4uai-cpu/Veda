import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Card, Screen, Skeleton, EmptyState, Button, Input, Pressable } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

const TABS = ['Bookmarks', 'Notes', 'Collections'] as const;
type Tab = (typeof TABS)[number];

export default function LibraryScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('Bookmarks');

  if (!loading && !user) {
    return (
      <Screen>
        <ScreenHeader title="Library" subtitle="Your personal knowledge collection" />
        <EmptyState
          emoji="📚"
          title="Sign in to build your library"
          message="Bookmarks, notes, and collections sync across your devices."
          actionLabel="Sign in"
          onAction={() => router.push('/login')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Library" subtitle="Your personal knowledge collection" />

      {/* Segmented control */}
      <View style={styles.segments}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            haptic
            style={[styles.segment, tab === t && styles.segmentActive]}
            onPress={() => setTab(t)}
          >
            <Text
              variant="bodySmall"
              style={tab === t ? styles.segmentLabelActive : styles.segmentLabel}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'Bookmarks' ? <BookmarksTab /> : tab === 'Notes' ? <NotesTab /> : <CollectionsTab />}
    </Screen>
  );
}

function BookmarksTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['library', 'bookmarks'],
    queryFn: () => api.getBookmarks(),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteBookmark(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library', 'bookmarks'] }),
  });

  if (isLoading) return <TabSkeleton />;
  const bookmarks = data?.bookmarks ?? [];
  if (bookmarks.length === 0) {
    return <EmptyState emoji="🔖" title="No bookmarks yet" message="Long-press the bookmark icon on any verse while reading." />;
  }

  return (
    <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
      {bookmarks.map((b, i) => (
        <Animated.View key={b.id} entering={FadeInDown.delay(Math.min(i, 8) * 40)}>
          <Card style={styles.row}>
            <Ionicons name="bookmark" size={18} color={theme.colors.primary} />
            <View style={styles.rowText}>
              <Text variant="title">{b.target_type}</Text>
              <Text variant="caption" numberOfLines={1}>
                {new Date(b.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Pressable haptic onPress={() => remove.mutate(b.id)}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </Card>
        </Animated.View>
      ))}
    </Animated.ScrollView>
  );
}

function NotesTab() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<{ title: string; content: string } | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['library', 'notes'],
    queryFn: () => api.getNotes(),
  });
  const save = useMutation({
    mutationFn: (d: { title: string; content: string }) => api.createNote(d),
    onSuccess: () => {
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ['library', 'notes'] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library', 'notes'] }),
  });

  if (isLoading) return <TabSkeleton />;
  const notes = data?.notes ?? [];

  return (
    <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
      {draft ? (
        <Card style={styles.editor}>
          <Input
            placeholder="Title"
            value={draft.title}
            onChangeText={(t) => setDraft({ ...draft, title: t })}
          />
          <Input
            placeholder="Write your reflection…"
            value={draft.content}
            onChangeText={(t) => setDraft({ ...draft, content: t })}
            multiline
            style={styles.editorContent}
          />
          <View style={styles.editorActions}>
            <Button title="Cancel" variant="outline" onPress={() => setDraft(null)} />
            <Button
              title="Save note"
              onPress={() => draft.title.trim() && draft.content.trim() && save.mutate(draft)}
              loading={save.isPending}
            />
          </View>
        </Card>
      ) : (
        <Button title="＋ New note" variant="ghost" onPress={() => setDraft({ title: '', content: '' })} />
      )}

      {notes.length === 0 && !draft ? (
        <EmptyState emoji="📝" title="No notes yet" message="Capture reflections as you study." />
      ) : (
        notes.map((n, i) => (
          <Animated.View key={n.id} entering={FadeInDown.delay(Math.min(i, 8) * 40)}>
            <Card style={styles.note}>
              <View style={styles.noteHeader}>
                <Text variant="title" style={styles.noteTitle} numberOfLines={1}>
                  {n.title}
                </Text>
                <Pressable haptic onPress={() => remove.mutate(n.id)}>
                  <Ionicons name="trash-outline" size={17} color={theme.colors.textMuted} />
                </Pressable>
              </View>
              <Text variant="bodySmall" numberOfLines={3}>
                {n.content}
              </Text>
              <Text variant="caption">{new Date(n.updated_at).toLocaleDateString()}</Text>
            </Card>
          </Animated.View>
        ))
      )}
    </Animated.ScrollView>
  );
}

function CollectionsTab() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['library', 'collections'],
    queryFn: () => api.getCollections(),
  });
  const create = useMutation({
    mutationFn: () => api.createCollection({ name }),
    onSuccess: () => {
      setName('');
      queryClient.invalidateQueries({ queryKey: ['library', 'collections'] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteCollection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library', 'collections'] }),
  });

  if (isLoading) return <TabSkeleton />;
  const collections = data?.collections ?? [];

  return (
    <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
      <Card style={styles.newCollection}>
        <View style={styles.newCollectionInput}>
          <Input placeholder="New collection name…" value={name} onChangeText={setName} />
        </View>
        <Button title="Create" onPress={() => name.trim() && create.mutate()} loading={create.isPending} />
      </Card>

      {collections.length === 0 ? (
        <EmptyState emoji="📂" title="No collections yet" message="Group verses and concepts by theme." />
      ) : (
        collections.map((c, i) => (
          <Animated.View key={c.id} entering={FadeInDown.delay(Math.min(i, 8) * 40)}>
            <Card style={styles.row}>
              <Ionicons name="folder-open-outline" size={20} color={theme.nodeColors.school} />
              <View style={styles.rowText}>
                <Text variant="title" numberOfLines={1}>
                  {c.name}
                </Text>
                <Text variant="caption">{c.item_count} items</Text>
              </View>
              <Pressable haptic onPress={() => remove.mutate(c.id)}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.textMuted} />
              </Pressable>
            </Card>
          </Animated.View>
        ))
      )}
    </Animated.ScrollView>
  );
}

function TabSkeleton() {
  return (
    <View style={styles.list}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height={76} radius={theme.radius.card} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  segments: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    padding: 3,
    marginBottom: theme.spacing(4),
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: theme.colors.primary },
  segmentLabel: { color: theme.colors.textSecondary },
  segmentLabelActive: { color: '#fff', fontFamily: theme.font.sansSemiBold },
  list: { gap: theme.spacing(3), paddingBottom: 110 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(3) },
  rowText: { flex: 1 },
  editor: { gap: theme.spacing(3) },
  editorContent: { minHeight: 100, textAlignVertical: 'top' },
  editorActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing(2) },
  note: { gap: theme.spacing(1.5) },
  noteHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  noteTitle: { flex: 1, marginRight: theme.spacing(2) },
  newCollection: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(2) },
  newCollectionInput: { flex: 1 },
});

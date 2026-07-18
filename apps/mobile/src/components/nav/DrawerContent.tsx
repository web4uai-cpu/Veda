import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
/** Only the piece of the drawer navigation we actually use. */
interface DrawerNav {
  closeDrawer: () => void;
}
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { theme } from '@/theme';
import { Text, Pressable } from '@/components/ui';
import { VedaLogo } from '@/components/brand/VedaLogo';
import { SignInToggle } from '@/components/nav/SignInToggle';
import { useAuth } from '@/providers/AuthProvider';
import { auth } from '@/lib/firebase';
import { displayNameFor } from '@/lib/user';
import { useChat, useRecentChats } from '@/store/chat';

type IconName = keyof typeof Ionicons.glyphMap;

interface NavItem {
  icon: IconName;
  label: string;
  href: string;
  /** Small pill on the right — flags a destination that is not live yet. */
  badge?: string;
}

const SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Explore VEDA',
    items: [
      { icon: 'book-outline', label: 'Scriptures', href: '/(app)/read' },
      { icon: 'compass-outline', label: 'Explore Concepts', href: '/(app)/explore' },
      {
        icon: 'git-network-outline',
        label: 'Knowledge Graph',
        href: '/(app)/graph',
        badge: 'Soon',
      },
      { icon: 'flask-outline', label: 'Deep Research', href: '/(app)/research' },
    ],
  },
  {
    label: 'Your Library',
    items: [{ icon: 'library-outline', label: 'Library', href: '/(app)/library' }],
  },
  {
    label: 'Account',
    items: [
      { icon: 'person-circle-outline', label: 'Profile', href: '/(app)/profile' },
      { icon: 'settings-outline', label: 'Settings', href: '/(app)/settings' },
    ],
  },
];

/** Conversations shown before the "Show all" expander. */
const RECENT_VISIBLE = 15;

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(ts).toLocaleDateString();
}

/** Strips the route group so '/(app)/read' compares against pathname '/read'. */
function routeOf(href: string): string {
  return href.replace(/\/\([^)]*\)/g, '') || '/';
}

export function DrawerContent({ navigation }: { navigation: DrawerNav }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [showAllChats, setShowAllChats] = useState(false);
  const [chatsOpen, setChatsOpen] = useState(true);
  // Alert.prompt is iOS-only, so renaming needs its own modal to work on Android.
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);

  const chats = useRecentChats();
  const activeId = useChat((s) => s.activeId);
  const newChat = useChat((s) => s.newChat);
  const selectChat = useChat((s) => s.selectChat);
  const deleteChat = useChat((s) => s.deleteChat);
  const renameChat = useChat((s) => s.renameChat);

  const close = () => navigation.closeDrawer();

  function goHome() {
    router.push('/(app)' as never);
    close();
  }

  function onNewChat() {
    newChat();
    goHome();
  }

  function onSelect(id: string) {
    selectChat(id);
    goHome();
  }

  function onLongPress(id: string, title: string) {
    Alert.alert(title, undefined, [
      { text: 'Rename', onPress: () => setRenaming({ id, value: title }) },
      { text: 'Delete', style: 'destructive', onPress: () => deleteChat(id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  const visibleChats = showAllChats ? chats : chats.slice(0, RECENT_VISIBLE);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + theme.spacing(4), paddingBottom: insets.bottom + theme.spacing(4) },
      ]}
    >
      <View style={styles.header}>
        <VedaLogo size={44} />
        <View>
          <Text variant="serif" style={styles.brand}>
            VEDA
          </Text>
          <Text variant="caption">Knowledge Operating System</Text>
        </View>
      </View>

      <SignInToggle
        signedIn={!!user}
        name={user ? displayNameFor(user) : null}
        detail={user ? user.email : 'Sync bookmarks, notes & collections'}
        onActivate={() => {
          router.push(user ? '/(app)/profile' : '/login');
          close();
        }}
      />

      <Pressable haptic style={styles.newChat} onPress={onNewChat}>
        <Ionicons name="add" size={18} color={theme.colors.primary} />
        <Text variant="body" color={theme.colors.primary} style={styles.newChatLabel}>
          New Chat
        </Text>
      </Pressable>

      {/* Navigation sits above the chat history: the section list is fixed in
          length, so it stays reachable no matter how many conversations pile up. */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.sections}>
        {SECTIONS.map((section) => (
          <View key={section.label} style={styles.section}>
            <Text variant="label" style={styles.sectionLabel}>
              {section.label}
            </Text>
            {section.items.map((item) => {
              const route = routeOf(item.href);
              const active = pathname === route || pathname.startsWith(`${route}/`);
              return (
                <Pressable
                  key={item.href}
                  haptic
                  style={[styles.item, active && styles.itemActive]}
                  onPress={() => {
                    router.push(item.href as never);
                    close();
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={active ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text variant="body" style={active ? styles.itemLabelActive : styles.itemLabel}>
                    {item.label}
                  </Text>
                  {item.badge ? (
                    <View style={styles.badge}>
                      <Text variant="caption" color={theme.colors.primary}>
                        {item.badge}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={styles.section}>
          <Pressable style={styles.chatsHead} onPress={() => setChatsOpen((v) => !v)}>
            <Text variant="label" style={styles.sectionLabel}>
              Recent Chats
            </Text>
            {chats.length > 0 ? (
              <Ionicons
                name={chatsOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.colors.textMuted}
              />
            ) : null}
          </Pressable>

          {chats.length === 0 ? (
            <Text variant="caption" style={styles.emptyChats}>
              Your conversations will appear here.
            </Text>
          ) : chatsOpen ? (
            <>
              {visibleChats.map((c) => {
                const active = c.id === activeId;
                return (
                  <Pressable
                    key={c.id}
                    haptic
                    style={[styles.chatItem, active && styles.itemActive]}
                    onPress={() => onSelect(c.id)}
                    onLongPress={() => onLongPress(c.id, c.title)}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color={active ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <View style={styles.chatText}>
                      <Text
                        variant="bodySmall"
                        numberOfLines={1}
                        style={active ? styles.itemLabelActive : styles.chatTitle}
                      >
                        {c.title}
                      </Text>
                      <Text variant="caption">{timeAgo(c.updatedAt)}</Text>
                    </View>
                  </Pressable>
                );
              })}
              {chats.length > RECENT_VISIBLE ? (
                <Pressable style={styles.showAll} onPress={() => setShowAllChats((v) => !v)}>
                  <Text variant="caption" color={theme.colors.primary}>
                    {showAllChats ? 'Show less' : `Show all ${chats.length}`}
                  </Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <Text variant="caption" style={styles.emptyChats}>
              {chats.length} conversation{chats.length === 1 ? '' : 's'} hidden
            </Text>
          )}
        </View>
      </ScrollView>

      {user ? (
        <Pressable style={styles.signOut} onPress={() => signOut(auth)}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text variant="body" color={theme.colors.error}>
            Sign out
          </Text>
        </Pressable>
      ) : null}

      <Modal
        visible={!!renaming}
        transparent
        animationType="fade"
        onRequestClose={() => setRenaming(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text variant="title">Rename chat</Text>
            <TextInput
              style={styles.modalInput}
              value={renaming?.value ?? ''}
              onChangeText={(v) => setRenaming((r) => (r ? { ...r, value: v } : r))}
              placeholder="Chat name"
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.primary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtn} onPress={() => setRenaming(null)}>
                <Text variant="body" color={theme.colors.textSecondary}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={styles.modalBtn}
                disabled={!renaming?.value.trim()}
                onPress={() => {
                  if (renaming?.value.trim()) renameChat(renaming.id, renaming.value);
                  setRenaming(null);
                }}
              >
                <Text
                  variant="body"
                  color={renaming?.value.trim() ? theme.colors.primary : theme.colors.textMuted}
                >
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0C1220',
    paddingHorizontal: theme.spacing(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
  },
  brand: { letterSpacing: 4, fontSize: 22 },
  // Sized to sit in the same rhythm as the nav rows below it, not to dominate them.
  newChat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    marginBottom: theme.spacing(4),
  },
  newChatLabel: { fontFamily: theme.font.sansSemiBold },
  sections: { flex: 1 },
  section: { marginBottom: theme.spacing(5) },
  sectionLabel: { marginBottom: theme.spacing(2), marginLeft: theme.spacing(2) },
  chatsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2),
  },
  emptyChats: { marginLeft: theme.spacing(3), marginTop: theme.spacing(1) },
  badge: {
    marginLeft: 'auto',
    paddingHorizontal: theme.spacing(2),
    paddingVertical: 1,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.radius.md,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2.5),
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(3),
    borderRadius: theme.radius.md,
  },
  chatText: { flex: 1 },
  chatTitle: { color: theme.colors.text },
  showAll: { paddingVertical: theme.spacing(2), paddingHorizontal: theme.spacing(3) },
  itemActive: { backgroundColor: theme.colors.primarySoft },
  itemLabel: { color: theme.colors.textSecondary },
  itemLabelActive: { color: theme.colors.primary, fontFamily: theme.font.sansSemiBold },
  modalBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing(6),
  },
  modalCard: {
    width: '100%',
    gap: theme.spacing(3),
    padding: theme.spacing(5),
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
    fontFamily: theme.font.sans,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing(2) },
  modalBtn: { paddingHorizontal: theme.spacing(4), paddingVertical: theme.spacing(2) },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    paddingVertical: theme.spacing(3),
    paddingHorizontal: theme.spacing(3),
  },
});

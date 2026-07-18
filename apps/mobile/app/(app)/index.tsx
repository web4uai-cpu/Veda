import { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { Text, Card, Pressable } from '@/components/ui';
import { TypingIndicator } from '@/components/ask/TypingIndicator';
import { Composer } from '@/components/ask/Composer';
import { AskHero } from '@/components/ask/AskHero';
import { AnswerText } from '@/components/ask/AnswerText';
import { CitationSheet } from '@/components/ask/CitationSheet';
import { useChat, useActiveMessages, type ChatMessage } from '@/store/chat';
import type { Citation, EvidencePacket } from '@/lib/api';

export default function AskScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [input, setInput] = useState('');
  // The open citation, plus the evidence of the message it came from — the
  // sheet needs both to fall back when a reference has no verse behind it.
  const [openCitation, setOpenCitation] = useState<{
    citation: Citation;
    evidence?: EvidencePacket[];
  } | null>(null);

  const messages = useActiveMessages();
  const thinking = useChat((s) => s.thinking);
  const activeId = useChat((s) => s.activeId);
  const send = useChat((s) => s.send);
  const newChat = useChat((s) => s.newChat);

  const isEmpty = messages.length === 0 && !thinking;

  // Opening a thread from the drawer should land on the latest turn, not
  // replay a scroll animation through the whole history.
  useEffect(() => {
    if (messages.length) listRef.current?.scrollToEnd({ animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  function submit(query: string) {
    const q = query.trim();
    if (!q || thinking) return;
    setInput('');
    void send(q);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inner, { paddingTop: insets.top + theme.spacing(2) }]}>
        {/* menu — wordmark — new chat */}
        <View style={styles.header}>
          <Pressable
            haptic
            style={styles.iconBtn}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Ionicons name="menu-outline" size={22} color={theme.colors.text} />
          </Pressable>

          <Text variant="serif" style={styles.wordmark}>
            VEDA
          </Text>

          {/* Always mounted — a control that vanishes on an empty thread just
              makes users hunt for it. It dims to a no-op instead. */}
          <Pressable
            haptic
            style={[styles.iconBtn, isEmpty && styles.iconBtnMuted]}
            disabled={isEmpty}
            onPress={newChat}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={isEmpty ? theme.colors.textMuted : theme.colors.primary}
            />
          </Pressable>
        </View>

        {isEmpty ? (
          <AskHero onPick={submit} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                onCitationPress={(citation) =>
                  setOpenCitation({ citation, evidence: item.evidence })
                }
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={thinking ? <TypingIndicator /> : null}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View
          style={[
            styles.composerWrap,
            { paddingBottom: Math.max(insets.bottom, theme.spacing(3)) },
          ]}
        >
          <Composer
            value={input}
            onChangeText={setInput}
            onSubmit={() => submit(input)}
            busy={thinking}
          />
        </View>
      </View>

      <CitationSheet
        citation={openCitation?.citation ?? null}
        evidence={openCitation?.evidence}
        onClose={() => setOpenCitation(null)}
      />
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  onCitationPress,
}: {
  message: ChatMessage;
  onCitationPress: (citation: Citation) => void;
}) {
  if (message.role === 'user') {
    return (
      <Animated.View entering={FadeInUp.duration(250)} style={styles.userRow}>
        <LinearGradient
          colors={[theme.colors.primaryBright, theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text variant="body" style={styles.userText}>
            {message.text}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(250)}>
      <Card style={[styles.assistantBubble, message.role === 'error' && styles.errorBubble]}>
        {/* Errors are plain strings; only model prose carries markup. */}
        {message.role === 'error' ? (
          <Text variant="body">{message.text}</Text>
        ) : (
          <AnswerText
            text={message.text}
            citations={message.citations}
            onCitationPress={onCitationPress}
          />
        )}
        {message.citations && message.citations.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.citations}
          >
            {message.citations.map((c) => (
              <Pressable
                key={c.citation_id}
                haptic
                style={styles.citationChip}
                onPress={() => onCitationPress(c)}
              >
                <Ionicons name="book-outline" size={12} color={theme.colors.primary} />
                <Text variant="caption" color={theme.colors.primary}>
                  {c.reference}
                </Text>
                <Text variant="caption" color={theme.colors.textMuted}>
                  {Math.round(c.confidence * 100)}%
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        {message.model && message.model !== 'error' ? (
          <Text variant="caption" style={styles.model}>
            {message.model.split('/').pop()}
          </Text>
        ) : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  inner: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  wordmark: { letterSpacing: 4, fontSize: 20 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  iconBtnMuted: { opacity: 0.45 },
  list: {
    paddingHorizontal: theme.spacing(4),
    gap: theme.spacing(3),
    paddingBottom: theme.spacing(4),
  },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    maxWidth: '85%',
    borderRadius: theme.radius.lg,
    borderBottomRightRadius: 6,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2.5),
  },
  userText: { color: '#fff' },
  assistantBubble: { borderBottomLeftRadius: 6, gap: theme.spacing(2) },
  errorBubble: { borderColor: 'rgba(248,113,113,0.4)' },
  citations: { gap: theme.spacing(2), paddingTop: theme.spacing(1) },
  citationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  model: { alignSelf: 'flex-end' },
  composerWrap: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
  },
});

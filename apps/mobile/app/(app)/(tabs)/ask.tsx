import { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { Text, Card, Pressable, Chip } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { TypingIndicator } from '@/components/ask/TypingIndicator';
import { api, ApiError, type Citation } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  citations?: Citation[];
  model?: string;
}

const SUGGESTIONS = [
  'What does the Gita say about duty?',
  'Explain karma yoga',
  'Who is Arjuna?',
  'What is the nature of the atman?',
];

export default function AskScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  async function send(query: string) {
    const q = query.trim();
    if (!q || thinking) return;
    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: q }]);
    setThinking(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    try {
      const res = await api.ask({ query: q });
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: res.answer,
          citations: res.citations,
          model: res.model_used,
        },
      ]);
    } catch (e) {
      const message =
        e instanceof ApiError && e.status === 429
          ? 'You are asking a little too fast — VEDA allows 10 questions per minute. Take a breath and try again.'
          : 'VEDA could not answer right now. Please try again.';
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'error', text: message }]);
    } finally {
      setThinking(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.inner, { paddingTop: insets.top + theme.spacing(3) }]}>
        <View style={styles.headerWrap}>
          <ScreenHeader title="Ask VEDA" subtitle="Answers grounded in scripture, always cited" />
        </View>

        {messages.length === 0 && !thinking ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.om}>ॐ</Text>
            <Text variant="title" style={styles.emptyTitle}>
              Ask anything about Sanatan Dharma
            </Text>
            <Text variant="bodySmall" style={styles.emptySub}>
              Every answer cites the exact verses it draws from.
            </Text>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} onPress={() => send(s)} />
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={thinking ? <TypingIndicator /> : null}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, theme.spacing(3)) + 78 }]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask VEDA…"
            placeholderTextColor={theme.colors.textMuted}
            selectionColor={theme.colors.primary}
            multiline
            onSubmitEditing={() => send(input)}
          />
          <Pressable haptic onPress={() => send(input)} disabled={!input.trim() || thinking}>
            <LinearGradient
              colors={[theme.colors.primaryBright, theme.colors.primary]}
              style={[styles.sendBtn, (!input.trim() || thinking) && styles.sendDisabled]}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
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
        <Text variant="body">{message.text}</Text>
        {message.citations && message.citations.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.citations}
          >
            {message.citations.map((c) => (
              <View key={c.citation_id} style={styles.citationChip}>
                <Ionicons name="book-outline" size={12} color={theme.colors.primary} />
                <Text variant="caption" color={theme.colors.primary}>
                  {c.reference}
                </Text>
                <Text variant="caption" color={theme.colors.textMuted}>
                  {Math.round(c.confidence * 100)}%
                </Text>
              </View>
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
  headerWrap: { paddingHorizontal: theme.spacing(4) },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing(6) },
  om: { fontSize: 52, color: theme.colors.primary, fontFamily: theme.font.devanagari, lineHeight: 78 },
  emptyTitle: { marginTop: theme.spacing(3), textAlign: 'center' },
  emptySub: { marginTop: theme.spacing(1), textAlign: 'center' },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(5),
  },
  list: { paddingHorizontal: theme.spacing(4), gap: theme.spacing(3), paddingBottom: theme.spacing(4) },
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    fontFamily: theme.font.sans,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});

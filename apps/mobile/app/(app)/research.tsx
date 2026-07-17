import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Card, Screen, Input, Button, Chip, EmptyState } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { TypingIndicator } from '@/components/ask/TypingIndicator';
import { api, ApiError, type ResearchResponse } from '@/lib/api';

export default function ResearchScreen() {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<'standard' | 'deep'>('standard');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResponse | null>(null);

  async function run() {
    const q = query.trim();
    if (!q || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.research({ query: q, depth });
      setResult(res);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 429
          ? 'Research is limited to 10 requests per minute — please wait a moment.'
          : 'Research failed. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen tabBarSpace={false}>
      <ScreenHeader title="Deep Research" subtitle="Structured reports across the corpus" left="back" />

      <Card style={styles.form}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. Compare karma yoga and jnana yoga…"
          multiline
        />
        <View style={styles.depthRow}>
          <Chip label="Standard" active={depth === 'standard'} onPress={() => setDepth('standard')} />
          <Chip label="Deep" active={depth === 'deep'} onPress={() => setDepth('deep')} />
        </View>
        <Button title="Begin research" onPress={run} loading={busy} fullWidth />
        {error ? (
          <Text variant="bodySmall" color={theme.colors.error}>
            {error}
          </Text>
        ) : null}
      </Card>

      {busy ? (
        <View style={styles.thinking}>
          <TypingIndicator />
          <Text variant="bodySmall" style={styles.thinkingText}>
            Consulting the scriptures — this can take up to a minute…
          </Text>
        </View>
      ) : null}

      {result ? (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.result}>
          <Card style={styles.report}>
            <Text variant="label" color={theme.colors.primary}>
              Research Report
            </Text>
            <Text variant="body" style={styles.reportText}>
              {result.report}
            </Text>
            <Text variant="caption">
              Confidence {Math.round(result.confidence * 100)}% ·{' '}
              {result.model_used.split('/').pop()} · {(result.query_time_ms / 1000).toFixed(1)}s
            </Text>
          </Card>

          {result.citations.length > 0 ? (
            <View>
              <Text variant="label" style={styles.sectionLabel}>
                Citations ({result.citations.length})
              </Text>
              <View style={styles.chips}>
                {result.citations.map((c) => (
                  <Chip key={c.citation_id} label={c.reference} color={theme.colors.primary} />
                ))}
              </View>
            </View>
          ) : null}
        </Animated.View>
      ) : !busy && !error ? (
        <EmptyState
          emoji="🔬"
          title="Multi-source scriptural research"
          message="VEDA searches across scriptures, weighs evidence, and writes a cited report."
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing(3), marginBottom: theme.spacing(4) },
  depthRow: { flexDirection: 'row', gap: theme.spacing(2) },
  thinking: { alignItems: 'flex-start', gap: theme.spacing(2), marginTop: theme.spacing(2) },
  thinkingText: { marginLeft: theme.spacing(1) },
  result: { gap: theme.spacing(2) },
  report: { gap: theme.spacing(2) },
  reportText: { lineHeight: 23 },
  sectionLabel: { marginTop: theme.spacing(3), marginBottom: theme.spacing(2) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(2) },
});

import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Text, Card, Chip, Pressable, EmptyState } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { Composer } from '@/components/ask/Composer';
import { ReportRenderer } from '@/components/research/ReportRenderer';
import { api, ApiError, type ResearchResponse, type EvidencePacket } from '@/lib/api';

/** Mirrors the web research page's loading ticker. */
const LOADING_STEPS = [
  'Searching the corpus…',
  'Weighing the evidence…',
  'Cross-checking citations…',
  'Composing the report…',
];
const STEP_MS = 2500;

const SOURCE_TYPE_LABELS: Record<string, string> = {
  SCRIPTURE: 'Scripture',
  COMMENTARY: 'Commentary',
  SCHOLARLY_SOURCE: 'Scholarly',
  UPLOAD: 'Upload',
  AI_NOTE: 'AI Note',
};

export default function ResearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<'standard' | 'deep'>('standard');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!busy) {
      setStep(0);
      return;
    }
    const t = setInterval(() => setStep((s) => (s + 1) % LOADING_STEPS.length), STEP_MS);
    return () => clearInterval(t);
  }, [busy]);

  const evidenceGroups = useMemo(() => {
    const groups = new Map<string, EvidencePacket[]>();
    for (const packet of result?.evidence ?? []) {
      const key = packet.source_type ?? 'SCRIPTURE';
      const list = groups.get(key);
      if (list) list.push(packet);
      else groups.set(key, [packet]);
    }
    return [...groups.entries()];
  }, [result]);

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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inner, { paddingTop: insets.top + theme.spacing(3) }]}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            title="Deep Research"
            subtitle="Structured reports across the corpus"
            left="back"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {busy ? (
            <Animated.View key={step} entering={FadeIn.duration(400)} style={styles.loading}>
              <Ionicons name="sparkles-outline" size={18} color={theme.colors.primary} />
              <Text variant="bodySmall">{LOADING_STEPS[step]}</Text>
            </Animated.View>
          ) : null}

          {error ? (
            <Card style={styles.errorCard}>
              <Text variant="body" color={theme.colors.error}>
                {error}
              </Text>
            </Card>
          ) : null}

          {result ? (
            <View style={styles.result}>
              <Animated.View entering={FadeInDown.duration(320)}>
                <Card style={styles.metaCard}>
                  <View style={styles.metaRow}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={theme.colors.primary} />
                    <Text variant="caption">
                      Confidence {Math.round(result.confidence * 100)}% ·{' '}
                      {result.model_used.split('/').pop()} ·{' '}
                      {(result.query_time_ms / 1000).toFixed(1)}s
                    </Text>
                  </View>
                </Card>
              </Animated.View>

              <ReportRenderer report={result.report} />

              {result.citations.length > 0 ? (
                <View style={styles.section}>
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

              {evidenceGroups.map(([type, packets]) => (
                <EvidenceGroup key={type} type={type} packets={packets} />
              ))}
            </View>
          ) : !busy && !error ? (
            <EmptyState
              emoji="🔬"
              title="Multi-source scriptural research"
              message="VEDA searches across scriptures, weighs evidence, and writes a cited report."
            />
          ) : null}
        </ScrollView>

        <View
          style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom, theme.spacing(3)) }]}
        >
          <View style={styles.depthRow}>
            <Chip label="Standard" active={depth === 'standard'} onPress={() => setDepth('standard')} />
            <Chip label="Deep" active={depth === 'deep'} onPress={() => setDepth('deep')} />
          </View>
          <Composer
            value={query}
            onChangeText={setQuery}
            onSubmit={run}
            busy={busy}
            placeholder="e.g. Compare karma yoga and jnana yoga…"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function EvidenceGroup({ type, packets }: { type: string; packets: EvidencePacket[] }) {
  const [open, setOpen] = useState(false);
  const label = SOURCE_TYPE_LABELS[type] ?? type;

  return (
    <View style={styles.section}>
      <Pressable style={styles.groupHead} onPress={() => setOpen((v) => !v)}>
        <Text variant="label">
          {label} ({packets.length})
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      {open ? (
        <View style={styles.rows}>
          {packets.map((p, i) => (
            <Animated.View key={p.citation?.citation_id ?? i} entering={FadeInDown.duration(250)}>
              <Card style={styles.evidenceCard}>
                {p.citation?.reference ? (
                  <Text variant="caption" color={theme.colors.primary}>
                    {p.citation.reference}
                  </Text>
                ) : null}
                {p.title ? (
                  <Text variant="title" numberOfLines={2}>
                    {p.title}
                  </Text>
                ) : null}
                <Text variant="bodySmall" numberOfLines={4}>
                  {p.content}
                </Text>
              </Card>
            </Animated.View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  inner: { flex: 1 },
  headerWrap: { paddingHorizontal: theme.spacing(4) },
  scroll: { paddingHorizontal: theme.spacing(4), paddingBottom: theme.spacing(4) },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(3),
  },
  errorCard: { borderColor: 'rgba(248,113,113,0.4)' },
  result: { gap: theme.spacing(3) },
  metaCard: { paddingVertical: theme.spacing(2.5) },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing(2) },
  section: { gap: theme.spacing(2) },
  sectionLabel: { marginLeft: theme.spacing(1) },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(1),
  },
  rows: { gap: theme.spacing(2) },
  evidenceCard: { gap: theme.spacing(1) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(2) },
  composerWrap: { paddingHorizontal: theme.spacing(4), paddingTop: theme.spacing(2), gap: theme.spacing(2) },
  depthRow: { flexDirection: 'row', gap: theme.spacing(2) },
});

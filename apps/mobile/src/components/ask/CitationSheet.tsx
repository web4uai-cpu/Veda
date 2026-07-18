/**
 * Citation detail sheet.
 *
 * Tapping any citation — a chip under an answer or an inline [BG.2.47] pill in
 * the prose — opens the cited verse here in Sanskrit → IAST → English, never
 * combined into one line (CLAUDE.md).
 *
 * Not every reference resolves to a verse row: uploads and commentaries have no
 * canonical reference, and the model occasionally invents one. In those cases
 * the sheet falls back to the evidence packet that came back with the answer, so
 * the user always sees the source behind a claim rather than an error.
 */
import { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable as RNPressable,
  BackHandler,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Text, Pressable, Skeleton } from '@/components/ui';
import { api, type Citation, type EvidencePacket, type VerseContent } from '@/lib/api';
import { useVerseByReference } from '@/lib/queries';

interface Props {
  citation: Citation | null;
  /** Evidence from the same answer — the fallback body when no verse resolves. */
  evidence?: EvidencePacket[];
  onClose: () => void;
}

/** Language codes we can name; anything else falls back to the raw code. */
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  sa: 'Sanskrit',
};

const DEVANAGARI = /[ऀ-ॿ]/;

/**
 * Splits an evidence packet body into its Sanskrit and translation halves.
 *
 * Packets arrive as one blob — a reference line, the Devanagari verse, then the
 * English rendering prefixed with its verse number:
 *
 *   BG.3.7
 *   यस्त्विन्द्रियाणि मनसा नियम्यारभतेऽर्जुन |
 *   3.7 But whosoever, controlling the senses by the mind…
 *
 * Splitting on script keeps the sheet's Sanskrit → translation rendering honest
 * even when the verse endpoint can't be reached. No transliteration is present
 * in packets, so that line is simply omitted rather than faked.
 */
function splitPacket(content: string, reference: string): { sanskrit: string; translation: string } {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    // The packet repeats its own reference as a title line.
    .filter((l) => l !== reference);

  const sanskrit = lines.filter((l) => DEVANAGARI.test(l));
  const translation = lines
    .filter((l) => !DEVANAGARI.test(l))
    // Strip the leading "3.7 " verse number the source text carries.
    .map((l) => l.replace(/^\d+\.\d+\.?\s*/, ''));

  return { sanskrit: sanskrit.join('\n'), translation: translation.join(' ') };
}

function pickTranslations(contents: VerseContent[]): VerseContent[] {
  const translations = contents.filter((c) => c.content_type === 'translation');
  // Primary first, then any other languages the corpus happens to carry.
  return [...translations].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
}

export function CitationSheet({ citation, evidence, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const reference = citation?.reference;
  const { data: verse, isLoading, isError } = useVerseByReference(reference);

  // Only needed for the "Open in reader" link — the verse carries an id, the
  // route needs a slug.
  const { data: scripture } = useQuery({
    queryKey: ['scripture-by-id', verse?.scripture_id],
    queryFn: () => api.getScripture(verse!.scripture_id),
    enabled: !!verse?.scripture_id,
    retry: 0,
  });

  const packet = useMemo(
    () => evidence?.find((p) => p.citation.reference === reference),
    [evidence, reference],
  );

  const sanskrit = verse?.contents.find((c) => c.content_type === 'sanskrit');
  const transliteration = verse?.contents.find((c) => c.content_type === 'transliteration');
  const translations = verse ? pickTranslations(verse.contents) : [];

  function openReader() {
    if (!scripture) return;
    onClose();
    router.push(`/(app)/read/${scripture.slug}` as never);
  }

  // Hardware back closes the sheet before it would pop the navigation stack.
  useEffect(() => {
    if (!citation) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [citation, onClose]);

  if (!citation) return null;

  return (
    // Deliberately not a <Modal>: on Android under the New Architecture a
    // transparent Modal nested in the screen's KeyboardAvoidingView mounts but
    // never draws. An absolute overlay is predictable and animates with the
    // reanimated already in use here.
    <Animated.View
      style={styles.backdrop}
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(150)}
    >
      {/* Tapping the dimmed area above the sheet dismisses it. Plain RN
          Pressable — the themed one springs on press, which is wrong for a
          full-bleed dismiss target. */}
      <RNPressable style={styles.backdropFill} onPress={onClose} />

      <Animated.View
        style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing(4) }]}
        entering={SlideInDown.duration(260)}
        exiting={SlideOutDown.duration(200)}
      >
        <View style={styles.grabber} />

        <View style={styles.metaRow}>
          <View style={styles.refPill}>
            <Ionicons name="book-outline" size={12} color={theme.colors.primary} />
            <Text variant="caption" color={theme.colors.primary}>
              {citation.reference}
            </Text>
          </View>
          <Text variant="caption" numberOfLines={1} style={styles.sourceName}>
            {citation.source_name}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text variant="caption">Confidence {Math.round(citation.confidence * 100)}%</Text>
          <Text variant="caption">Evidence {citation.evidence_level}</Text>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
                {isLoading ? (
                  <View style={styles.skeleton}>
                    <Skeleton height={28} />
                    <Skeleton height={18} width="80%" />
                    <Skeleton height={44} />
                  </View>
                ) : verse ? (
                  <>
                    {/* Sanskrit → transliteration → translation, never combined. */}
                    {sanskrit ? (
                      <Text variant="sanskrit" style={styles.block}>
                        {sanskrit.content}
                      </Text>
                    ) : null}

                    {transliteration ? (
                      <Text variant="transliteration" style={styles.block}>
                        {transliteration.content}
                      </Text>
                    ) : null}

                    {translations.map((t) => (
                      <View key={t.id} style={styles.block}>
                        {/* Only label the language once more than one exists. */}
                        {translations.length > 1 ? (
                          <Text variant="label" style={styles.langLabel}>
                            {LANGUAGE_NAMES[t.language_code] ?? t.language_code}
                          </Text>
                        ) : null}
                        <Text variant="body">{t.content}</Text>
                        {t.source ? (
                          <Text variant="caption" style={styles.source}>
                            Source: {t.source}
                          </Text>
                        ) : null}
                      </View>
                    ))}

                    {scripture ? (
                      <Pressable haptic style={styles.readerBtn} onPress={openReader}>
                        <Ionicons
                          name="library-outline"
                          size={16}
                          color={theme.colors.primary}
                        />
                        <Text variant="bodySmall" color={theme.colors.primary}>
                          Open {scripture.name} in reader
                        </Text>
                      </Pressable>
                    ) : null}
                  </>
                ) : packet ? (
                  // No verse row behind this reference — fall back to the
                  // retrieved passage the answer was actually built from, split
                  // back into Sanskrit and translation.
                  <PacketBody packet={packet} reference={citation.reference} />
                ) : (
                  <Text variant="bodySmall" style={styles.block}>
                    {isError
                      ? `The full text for ${citation.reference} could not be loaded. The reference itself is recorded above.`
                      : `No passage is stored for ${citation.reference} yet.`}
                  </Text>
                )}
        </ScrollView>

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text variant="body" color={theme.colors.textSecondary}>
            Close
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function PacketBody({ packet, reference }: { packet: EvidencePacket; reference: string }) {
  const { sanskrit, translation } = splitPacket(packet.content, reference);

  // If the blob carried no Devanagari there is nothing to split — show it whole
  // rather than mangling it through the parser.
  if (!sanskrit) {
    return (
      <>
        <Text variant="title" style={styles.block}>
          {packet.title}
        </Text>
        <Text variant="body" style={styles.block}>
          {packet.content}
        </Text>
      </>
    );
  }

  return (
    <>
      <Text variant="sanskrit" style={styles.block}>
        {sanskrit}
      </Text>
      {translation ? (
        <Text variant="body" style={styles.block}>
          {translation}
        </Text>
      ) : null}
      <Text variant="caption" style={styles.block}>
        Retrieved passage · {packet.retrieval_source}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
    // Above the message list and the composer.
    zIndex: 50,
    elevation: 50,
  },
  backdropFill: { flex: 1 },
  sheet: {
    maxHeight: '82%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    borderTopWidth: 1,
    borderColor: theme.colors.cardBorder,
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(2),
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.cardBorder,
    marginBottom: theme.spacing(3),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  refPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  sourceName: { flex: 1 },
  body: { marginTop: theme.spacing(2) },
  bodyContent: { paddingBottom: theme.spacing(2) },
  skeleton: { gap: theme.spacing(3) },
  block: { marginBottom: theme.spacing(3) },
  langLabel: { marginBottom: theme.spacing(1) },
  source: { marginTop: theme.spacing(1) },
  readerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(2.5),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    marginTop: theme.spacing(1),
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
});

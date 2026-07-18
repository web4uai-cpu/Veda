import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Card, Screen, Skeleton, EmptyState, Chip } from '@/components/ui';
import { ScreenHeader } from '@/components/nav/ScreenHeader';
import { RadialGraph } from '@/components/explore/RadialGraph';
import { useConcept } from '@/lib/queries';

export default function ConceptDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useConcept(slug);

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Concept" left="back" />
        <View style={styles.skeletons}>
          <Skeleton height={140} radius={theme.radius.card} />
          <Skeleton height={300} radius={theme.radius.card} />
        </View>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <ScreenHeader title="Concept" left="back" />
        <EmptyState
          emoji="🕸️"
          title="Concept not available"
          message="The knowledge graph may still be seeding."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </Screen>
    );
  }

  const { concept } = data;

  return (
    <Screen>
      <ScreenHeader title={concept.name} left="back" />

      <Animated.View entering={FadeInDown.duration(350)}>
        <Card style={styles.headCard}>
          {concept.sanskrit_name ? (
            <Text variant="sanskrit">{concept.sanskrit_name}</Text>
          ) : null}
          {concept.summary ? (
            <Text variant="bodySmall" style={styles.summary}>
              {concept.summary}
            </Text>
          ) : null}
          {concept.category ? (
            <Text variant="label" color={theme.colors.primary}>
              {concept.category}
            </Text>
          ) : null}
        </Card>
      </Animated.View>

      {data.related_concepts.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(80).duration(350)}>
          <Text variant="label" style={styles.sectionLabel}>
            Connections
          </Text>
          <Card padded={false} style={styles.graphCard}>
            <RadialGraph
              centerName={concept.name}
              nodes={data.related_concepts.map((r) => ({ slug: r.slug, name: r.name }))}
              onNodePress={(s) => router.push(`/(app)/explore/${s}` as never)}
            />
          </Card>
        </Animated.View>
      ) : null}

      {data.schools.length > 0 ? (
        <View>
          <Text variant="label" style={styles.sectionLabel}>
            Philosophical schools
          </Text>
          <View style={styles.stack}>
            {data.schools.map((school) => (
              <Card key={school.slug} style={styles.rowCard}>
                <Text variant="title">{school.name}</Text>
                {school.summary ? <Text variant="bodySmall">{school.summary}</Text> : null}
              </Card>
            ))}
          </View>
        </View>
      ) : null}

      {data.persons.length > 0 ? (
        <View>
          <Text variant="label" style={styles.sectionLabel}>
            Teachers & rishis
          </Text>
          <View style={styles.chipsWrap}>
            {data.persons.map((p) => (
              <Chip key={p.name} label={p.name} color={theme.nodeColors.person} />
            ))}
          </View>
        </View>
      ) : null}

      {data.scripture_mentions.length > 0 ? (
        <View>
          <Text variant="label" style={styles.sectionLabel}>
            Mentioned in
          </Text>
          <View style={styles.chipsWrap}>
            {data.scripture_mentions.map((m) => (
              <Chip
                key={m.slug}
                label={`${m.name}${m.mention_count > 0 ? ` · ${m.mention_count}` : ''}`}
                color={theme.nodeColors.scripture}
                onPress={() => router.push(`/(app)/read/${m.slug}` as never)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  skeletons: { gap: theme.spacing(4) },
  headCard: { gap: theme.spacing(2), marginBottom: theme.spacing(2) },
  summary: { lineHeight: 20 },
  sectionLabel: { marginTop: theme.spacing(4), marginBottom: theme.spacing(2) },
  graphCard: { paddingVertical: theme.spacing(4) },
  stack: { gap: theme.spacing(3) },
  rowCard: { gap: theme.spacing(1) },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(2) },
});

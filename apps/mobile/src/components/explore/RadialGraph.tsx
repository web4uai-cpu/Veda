import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { theme } from '@/theme';
import { Text, Pressable } from '@/components/ui';

export interface RadialNode {
  slug: string;
  name: string;
  relationship?: string;
}

interface Props {
  centerName: string;
  nodes: RadialNode[];
  size?: number;
  onNodePress?: (slug: string) => void;
}

/**
 * 2D radial mini-map: the concept at the center, related concepts on a
 * ring. Lightweight SVG replacement for the web's 3D knowledge graph.
 */
export function RadialGraph({ centerName, nodes, size = 320, onNodePress }: Props) {
  const shown = nodes.slice(0, 8);
  const c = size / 2;
  const ring = size * 0.36;

  const positions = useMemo(
    () =>
      shown.map((node, i) => {
        const angle = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
        return {
          node,
          x: c + ring * Math.cos(angle),
          y: c + ring * Math.sin(angle),
        };
      }),
    [shown, c, ring],
  );

  if (shown.length === 0) return null;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G>
          {positions.map(({ x, y }, i) => (
            <Line
              key={i}
              x1={c}
              y1={c}
              x2={x}
              y2={y}
              stroke={theme.colors.cardBorder}
              strokeWidth={1}
            />
          ))}
          <Circle cx={c} cy={c} r={ring} stroke={theme.colors.cardBorder} strokeWidth={0.6} fill="none" strokeDasharray="3 6" />
          <Circle cx={c} cy={c} r={34} fill={theme.nodeColors.concept} opacity={0.16} />
          <Circle cx={c} cy={c} r={26} fill={theme.nodeColors.concept} opacity={0.9} />
          {positions.map(({ x, y }, i) => (
            <Circle key={`n-${i}`} cx={x} cy={y} r={16} fill={theme.colors.surfaceElevated} stroke={theme.nodeColors.concept} strokeWidth={1.2} />
          ))}
        </G>
      </Svg>

      {/* Center label */}
      <View style={[styles.label, { left: 0, right: 0, top: c - 8 }]} pointerEvents="none">
        <Text variant="caption" style={styles.centerText} numberOfLines={1}>
          {centerName}
        </Text>
      </View>

      {/* Tappable node labels */}
      {positions.map(({ node, x, y }) => (
        <Pressable
          key={node.slug}
          onPress={() => onNodePress?.(node.slug)}
          style={[styles.node, { left: x - 44, top: y + 18 }]}
        >
          <Text variant="caption" style={styles.nodeText} numberOfLines={1}>
            {node.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { position: 'absolute', alignItems: 'center' },
  centerText: {
    color: '#fff',
    fontFamily: theme.font.sansSemiBold,
    maxWidth: 70,
    textAlign: 'center',
  },
  node: { position: 'absolute', width: 88, alignItems: 'center' },
  nodeText: { color: theme.colors.textSecondary, textAlign: 'center' },
});

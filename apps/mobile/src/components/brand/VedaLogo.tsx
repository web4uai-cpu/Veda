import { View, Text as RNText, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { theme } from '@/theme';

interface Props {
  size?: number;
}

/**
 * VEDA brand mark — saffron gradient tile with the Devanagari "व" glyph.
 * The glyph is a font-rendered overlay (SVG <Text> font loading is
 * unreliable on RN), so it always uses the loaded Noto Sans Devanagari.
 */
export function VedaLogo({ size = 56 }: Props) {
  const radius = size * 0.28;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="veda-tile" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#E8A23C" />
            <Stop offset="1" stopColor="#C97A24" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} rx={radius} fill="url(#veda-tile)" />
      </Svg>
      <View style={styles.glyphWrap}>
        <RNText
          style={[
            styles.glyph,
            { fontSize: size * 0.52, lineHeight: size * 0.72 },
          ]}
        >
          व
        </RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glyphWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily: theme.font.devanagariSemiBold,
    color: '#FFFFFF',
  },
});

import Svg, { G, Path, Circle } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  opacity?: number;
}

/**
 * Decorative 12-petal mandala ring drawn as SVG paths — used behind the
 * logo on the splash screen and section headers.
 */
export function MandalaRing({ size = 220, color = '#C97A24', opacity = 0.4 }: Props) {
  const c = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = rOuter * 0.78;
  const petals = 12;

  const paths: string[] = [];
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const next = ((i + 0.5) / petals) * Math.PI * 2;
    const prev = ((i - 0.5) / petals) * Math.PI * 2;
    const tipX = c + rOuter * Math.cos(angle);
    const tipY = c + rOuter * Math.sin(angle);
    const leftX = c + rInner * Math.cos(prev);
    const leftY = c + rInner * Math.sin(prev);
    const rightX = c + rInner * Math.cos(next);
    const rightY = c + rInner * Math.sin(next);
    paths.push(
      `M ${leftX} ${leftY} Q ${tipX} ${tipY} ${rightX} ${rightY}`,
    );
  }

  return (
    <Svg width={size} height={size} opacity={opacity}>
      <G>
        {paths.map((d, i) => (
          <Path key={i} d={d} stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        ))}
        <Circle cx={c} cy={c} r={rInner * 0.92} stroke={color} strokeWidth={0.8} fill="none" />
        <Circle cx={c} cy={c} r={rOuter} stroke={color} strokeWidth={0.6} fill="none" strokeDasharray="2 6" />
      </G>
    </Svg>
  );
}

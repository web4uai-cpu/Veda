/**
 * Generates the VEDA app icon, Android adaptive foreground, and splash mark.
 *
 * The brand mark is a saffron gradient tile carrying the Devanagari glyph "व",
 * mirroring src/components/brand/VedaLogo.tsx. That component renders the glyph
 * with a font at runtime; here we outline it to a vector path first, because
 * sharp's bundled librsvg cannot rasterize SVG <text>.
 *
 * Run: pnpm --filter mobile icons
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '..', 'assets');

// Same family/weight as theme.font.devanagariSemiBold, so the icon and the
// in-app VedaLogo are the same shape.
const FONT_PATH = path.join(
  path.dirname(require.resolve('@expo-google-fonts/noto-sans-devanagari/package.json')),
  'NotoSansDevanagari_600SemiBold.ttf'
);

const GLYPH = 'व';
const GRADIENT_FROM = '#E8A23C';
const GRADIENT_TO = '#C97A24';
const SIZE = 1024;

/**
 * Returns an SVG path `d` for the glyph, scaled so its inked bounding box is
 * `targetHeight` tall and centred on (cx, cy).
 *
 * Devanagari hangs from the shirorekha rather than sitting on the baseline, so
 * centring on font metrics leaves the glyph visibly low. We measure the actual
 * ink instead.
 */
function glyphPath(font, targetHeight, cx, cy) {
  const probe = 1000;
  const bbox = font.getPath(GLYPH, 0, 0, probe).getBoundingBox();
  const inkHeight = bbox.y2 - bbox.y1;
  const scale = (targetHeight / inkHeight) * probe;

  const scaled = font.getPath(GLYPH, 0, 0, scale).getBoundingBox();
  const x = cx - (scaled.x1 + scaled.x2) / 2;
  const y = cy - (scaled.y1 + scaled.y2) / 2;

  return font.getPath(GLYPH, x, y, scale).toPathData(3);
}

const gradientDef = `
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GRADIENT_FROM}" />
      <stop offset="1" stop-color="${GRADIENT_TO}" />
    </linearGradient>
  </defs>`;

async function render(svg, file) {
  const out = path.join(ASSETS, file);
  await sharp(Buffer.from(svg)).png().toFile(out);
  const { size } = await fs.stat(out);
  console.log(`  ${file.padEnd(20)} ${(size / 1024).toFixed(1)} KB`);
}

async function main() {
  const font = opentype.parse(readFileSync(FONT_PATH).buffer);
  await fs.mkdir(ASSETS, { recursive: true });
  console.log('Generating VEDA icons from', path.basename(FONT_PATH));

  // icon.png — full-bleed, opaque, square corners. iOS applies its own mask;
  // baking rounded corners in would double-round it.
  await render(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
      ${gradientDef}
      <rect width="${SIZE}" height="${SIZE}" fill="url(#tile)" />
      <path d="${glyphPath(font, SIZE * 0.44, SIZE / 2, SIZE / 2)}" fill="#FFFFFF" />
    </svg>`,
    'icon.png'
  );

  // adaptive-icon.png — foreground only, transparent. Android crops to the
  // inner 66%, so the glyph stays well inside that safe zone.
  await render(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
      <path d="${glyphPath(font, SIZE * 0.34, SIZE / 2, SIZE / 2)}" fill="#FFFFFF" />
    </svg>`,
    'adaptive-icon.png'
  );

  // splash.png — the rounded tile as it appears in-app (AnimatedSplash),
  // centred on transparency and shown over #0B0F1A via resizeMode: contain.
  const tile = SIZE * 0.5;
  const inset = (SIZE - tile) / 2;
  await render(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
      ${gradientDef}
      <rect x="${inset}" y="${inset}" width="${tile}" height="${tile}"
            rx="${tile * 0.28}" fill="url(#tile)" />
      <path d="${glyphPath(font, tile * 0.52, SIZE / 2, SIZE / 2)}" fill="#FFFFFF" />
    </svg>`,
    'splash.png'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

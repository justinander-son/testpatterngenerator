/**
 * Standard basic resolutions and common LED tile presets.
 * Kept loose, lightweight, and easily extensible.
 */

export const STANDARD_RESOLUTIONS = [
  { label: 'Custom', width: 1920, height: 1080 },
  { label: '1080p Full HD (1920×1080)', width: 1920, height: 1080, ratio: '16:9' },
  { label: '1440p QHD (2560×1440)', width: 2560, height: 1440, ratio: '16:9' },
  { label: '4K UHD (3840×2160)', width: 3840, height: 2160, ratio: '16:9' },
  { label: '4K DCI (4096×2160)', width: 4096, height: 2160, ratio: '17:9' },
  { label: 'Ultra-Wide (3440×1440)', width: 3440, height: 1440, ratio: '21:9' },
  { label: 'Dual 4K Wide (7680×2160)', width: 7680, height: 2160, ratio: '32:9' },
  { label: 'LED Strip Banner (3840×540)', width: 3840, height: 540, ratio: '64:9' },
  { label: 'Square LED Pillar (1024×1024)', width: 1024, height: 1024, ratio: '1:1' },
];

export const STANDARD_TILE_SIZES = [
  { label: 'Custom Tile', width: 192, height: 192 },
  { label: '192×192 px (e.g. 500mm @ 2.6mm)', width: 192, height: 192, modules: 2 },
  { label: '176×176 px (e.g. 500mm @ 2.84mm)', width: 176, height: 176, modules: 2 },
  { label: '200×200 px (e.g. 500mm @ 2.5mm)', width: 200, height: 200, modules: 2 },
  { label: '256×256 px (e.g. 500mm @ 1.95mm)', width: 256, height: 256, modules: 2 },
  { label: '136×272 px (e.g. 500×1000mm)', width: 136, height: 272, modules: 4 },
  { label: '128×128 px (Standard / Generic)', width: 128, height: 128, modules: 2 },
  { label: '100×100 px (Metric 100px)', width: 100, height: 100, modules: 2 },
];

/**
 * 54 Curated Pastel Color Pairs sampled directly from technician reference palette.
 * Each pair contains [ColorA, ColorB] representing the two alternating panel colors for a screen/wall.
 */
export const PASTEL_PALETTES = [
  ['#e2fe92', '#fbffb5'],
  ['#b8fccc', '#f4feb5'],
  ['#a8f0da', '#e2feb6'],
  ['#9ce6e7', '#bffdec'],
  ['#ccfdf0', '#ffffe9'],
  ['#bdf7d9', '#ffffe9'],
  ['#b4f4e4', '#ebfef2'],
  ['#b0f5fd', '#cffcfe'],
  ['#abe4fc', '#cdf8fd'],
  ['#fef7a6', '#fffcd7'],
  ['#fbe6a3', '#fef8ba'],
  ['#f7d1a0', '#fceeba'],
  ['#f5c4a0', '#fbe9b9'],
  ['#f4b8d1', '#fae2d6'],
  ['#edabdc', '#f9d8d5'],
  ['#e69fe0', '#eed5fc'],
  ['#e9b0d2', '#d7eefd'],
  ['#a6d2fb', '#b7e9fc'],
  ['#efbdd3', '#f8d3d2'],
  ['#f6cccf', '#fcf2df'],
  ['#f5e7dc', '#fefbec'],
  ['#e9d1c5', '#fdf4ed'],
  ['#dfb5b3', '#fceeec'],
  ['#f6effe', '#f3fcfe'],
  ['#e9e0f9', '#f4ffff'],
  ['#d5cef5', '#e3f8fe'],
  ['#a3c5fa', '#bce5fc'],
  ['#e2c9b7', '#f4d2cc'],
  ['#fdf3e8', '#f8d6c7'],
  ['#fefce9', '#fdf1e3'],
  ['#f7cede', '#fefce9'],
  ['#fefce9', '#d1a9a5'],
  ['#f3e4ce', '#d1a9a5'],
  ['#fefce9', '#fdf3e8'],
  ['#f7cede', '#fefce9'],
  ['#f9dde4', '#f7cede'],
  ['#a1de95', '#96d4ac'],
  ['#a9ea98', '#a1de95'],
  ['#bbe9a6', '#a9ea98'],
  ['#c4f4a9', '#a9ea98'],
  ['#91c8bd', '#d6f5b4'],
  ['#91c8bd', '#eafeb8'],
  ['#91c8bd', '#95d7be'],
  ['#91c8bd', '#96d4ac'],
  ['#96d4ac', '#9ce2af'],
  ['#859acd', '#b0edd1'],
  ['#b0edd1', '#99cdcf'],
  ['#a1e1d8', '#94d1d8'],
  ['#a6d7c7', '#a1e1d8'],
  ['#b0edd1', '#859acd'],
  ['#859acd', '#b0edd1'],
  ['#89aad4', '#a1e1d8'],
  ['#b0edd1', '#94d1d8'],
  ['#8ebcd6', '#b0edd1']
];

/**
 * Resolves the two panel colors [ColorA, ColorB] for a given screen and state.
 */
export function getScreenColors(screen, state, screenIndex = 0) {
  const mode = state.themeMode || 'obsidian';

  if (mode === 'multicolor') {
    const idx = (screen && screen.paletteIndex !== undefined && screen.paletteIndex !== null)
      ? screen.paletteIndex
      : (screenIndex >= 0 ? screenIndex : 0);
    const pair = PASTEL_PALETTES[Math.abs(idx) % PASTEL_PALETTES.length];
    return [pair[0], pair[1]];
  } else if (mode === 'custom') {
    const colA = state.customColorA || '#111317';
    const colB = state.customAlternatePanels ? (state.customColorB || '#1a1d24') : colA;
    return [colA, colB];
  } else {
    // Obsidian Mode: solid dark background
    const bg = state.backgroundColor || '#111317';
    return [bg, bg];
  }
}

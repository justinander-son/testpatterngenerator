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
 * 20 Curated Diverse, Accessible Pastel Color Pairs.
 * Sequenced to maximize chromatic diversity across adjacent screens
 * (Blue -> Amber -> Mint -> Rose -> Cyan -> Violet -> Terracotta -> Sage -> Cobalt -> Peach -> Mauve -> Jade -> Teal -> Coral -> Denim -> Ochre -> Willow -> Amethyst -> Sea Breeze -> Ruby).
 * Calibrated for accessible contrast with white alignment text and geometry.
 */
export const PASTEL_PALETTES = [
  ['#7c93c9', '#a4bbee'], // 01. Periwinkle / Slate Blue (Cool Blue)
  ['#e0a548', '#f2c879'], // 02. Honey / Warm Amber (Golden Amber)
  ['#5db88c', '#8de0b4'], // 03. Emerald Mint / Seafoam (Botanical Mint)
  ['#cf6f90', '#ea9eb7'], // 04. Dusty Rose / Berry Blush (Berry Pink)
  ['#4ca8be', '#88d2e3'], // 05. Arctic Cyan / Sky Aqua (Crisp Aqua Cyan)
  ['#9a7ac9', '#c4aeee'], // 06. Lavender / Royal Violet (Regal Violet)
  ['#cf7355', '#ea9c84'], // 07. Terracotta / Warm Coral (Earthy Terracotta)
  ['#68a882', '#97cca9'], // 08. Forest Sage / Celadon (Natural Sage)
  ['#5b8bc9', '#8eb6e6'], // 09. Cobalt Mist / French Blue (Classic Azure)
  ['#df894c', '#f2ae79'], // 10. Apricot / Golden Peach (Warm Peach)
  ['#a86d99', '#d198c4'], // 11. Mauve / Dusty Lilac (Soft Mauve)
  ['#5da878', '#8ed6a3'], // 12. Jade / Spring Pistachio (Vibrant Spring Green)
  ['#469d9e', '#7ec9c9'], // 13. Ocean Teal / Deep Marine (Marine Teal)
  ['#d66775', '#ee959f'], // 14. Watermelon / Coral Pink (Vibrant Warm Pink)
  ['#6483a6', '#95b2d4'], // 15. Steel Denim / Powder Blue (Slate Steel Blue)
  ['#c49141', '#e2b671'], // 16. Desert Ochre / Sandstone (Warm Desert Gold)
  ['#63a36b', '#95cf9c'], // 17. Willow / Sweet Pea Green (Leaf Green)
  ['#8862b8', '#b191df'], // 18. Amethyst / Royal Orchid (Jewel Violet)
  ['#48b3b7', '#87e0e3'], // 19. Ice Cyan / Sea Breeze (Tropical Sea Breeze)
  ['#bc5c75', '#df8b9f'], // 20. Crimson / Ruby Rose (Deep Ruby Rose)
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

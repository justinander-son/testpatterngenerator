/**
 * Master Canvas Rendering Engine
 * Composites all procedural layers in order with exact pixel coordinates.
 */

import { renderBorderLayer } from './borderLayer.js';
import { renderGridLayer } from './gridLayer.js';
import { renderGeometryLayer } from './geometryLayer.js';
import { renderMetadataLayer } from './metadataLayer.js?v=2.2';
import { getScreenColors } from '../presets.js';

export function renderPattern(canvas, screen, state, screenIndex = 0) {
  if (!canvas || !screen) return;

  const width = Math.max(16, parseInt(screen.width, 10) || 1920);
  const height = Math.max(16, parseInt(screen.height, 10) || 1080);

  // Resize canvas if needed
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // Disable browser smoothing for razor-sharp pixel lines
  ctx.imageSmoothingEnabled = false;

  // 1. Theme Background / Alternating Panels
  const [colorA, colorB] = getScreenColors(screen, state, screenIndex);
  const cabW = Math.max(8, screen.cabinetW || 192);
  const cabH = Math.max(8, screen.cabinetH || 192);

  if (colorA === colorB) {
    ctx.fillStyle = colorA;
    ctx.fillRect(0, 0, width, height);
  } else {
    const cols = Math.ceil(width / cabW);
    const rows = Math.ceil(height / cabH);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (c + r) % 2 === 0 ? colorA : colorB;
        const px = c * cabW;
        const py = r * cabH;
        ctx.fillRect(px, py, Math.min(cabW, width - px), Math.min(cabH, height - py));
      }
    }
  }

  // 2. Geometry Layer (Checkerboard, Diagonals, Concentric Circles, Center Crosshair)
  renderGeometryLayer(ctx, width, height, state);

  // 3. LED Cabinet & Module Grids
  renderGridLayer(ctx, width, height, screen, state);

  // 4. Outer 1px Perimeter Border & Corner Crop Ticks
  renderBorderLayer(ctx, width, height, state);

  // 5. High-Contrast Disguise Screen Metadata Plaque
  renderMetadataLayer(ctx, width, height, screen, state);
}

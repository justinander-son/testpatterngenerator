/**
 * Lossless PNG Export Engine
 * Generates unscaled, pixel-perfect PNG files for Disguise media servers.
 */

import { renderPattern } from './canvasEngine.js';

export function sanitizeFilename(str) {
  return (str || '')
    .trim()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_');
}

export async function exportScreenToPng(screen, state) {
  const width = Math.max(16, parseInt(screen.width, 10) || 1920);
  const height = Math.max(16, parseInt(screen.height, 10) || 1080);

  // Create an offscreen memory canvas
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width;
  exportCanvas.height = height;

  const screenIndex = state.screens ? state.screens.findIndex(s => s.id === screen.id) : 0;
  renderPattern(exportCanvas, screen, state, screenIndex >= 0 ? screenIndex : 0);

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to generate image blob.'));
        return;
      }

      const project = sanitizeFilename(state.projectTitle || 'Disguise');
      const screenName = sanitizeFilename(screen.name || 'Screen');
      const filename = `${project}_${screenName}_${width}x${height}.png`;

      // Trigger automatic browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      resolve({ filename, blob });
    }, 'image/png');
  });
}

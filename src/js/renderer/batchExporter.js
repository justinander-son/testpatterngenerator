/**
 * Batch ZIP Export Engine
 * Loops through all screens in the queue, renders each to an offscreen canvas,
 * and packages them into a single zip archive for Disguise.
 */

import { renderPattern } from './canvasEngine.js';
import { sanitizeFilename } from './exportEngine.js';

export async function exportAllScreensToZip(screens, state, onProgress) {
  if (!window.JSZip) {
    throw new Error('JSZip library is not available.');
  }

  const zip = new window.JSZip();
  const folderName = sanitizeFilename(state.projectTitle || 'Disguise_Project') + '_TestPatterns';
  const folder = zip.folder(folderName);

  const offscreen = document.createElement('canvas');
  const total = screens.length;

  for (let i = 0; i < total; i++) {
    const screen = screens[i];
    if (onProgress) {
      onProgress(i + 1, total, screen.name);
    }

    const width = Math.max(16, parseInt(screen.width, 10) || 1920);
    const height = Math.max(16, parseInt(screen.height, 10) || 1080);

    offscreen.width = width;
    offscreen.height = height;

    renderPattern(offscreen, screen, state, i);

    // Convert canvas to array buffer / blob
    const blob = await new Promise(res => offscreen.toBlob(res, 'image/png'));
    const indexPrefix = String(i + 1).padStart(2, '0');
    const screenName = sanitizeFilename(screen.name || `Screen_${i + 1}`);
    const filename = `${indexPrefix}_${screenName}_${width}x${height}.png`;

    folder.file(filename, blob);

    // Yield to main thread briefly for smooth progress bar updates
    await new Promise(r => setTimeout(r, 16));
  }

  // Also include a show screen manifest text file
  const manifest = [
    `Project: ${state.projectTitle}`,
    `Export Date: ${new Date().toISOString()}`,
    `Total Screens: ${total}`,
    '----------------------------------------',
    ...screens.map((s, idx) => 
      `${idx + 1}. ${s.name}: ${s.width}x${s.height} px (Tiles: ${s.cabinetW}x${s.cabinetH} px) ${s.notes ? `[${s.notes}]` : ''}`
    )
  ].join('\n');
  folder.file('README_Manifest.txt', manifest);

  // Generate ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress(total, total, `Compressing ZIP (${Math.round(metadata.percent)}%)...`);
    }
  });

  // Trigger download
  const zipFilename = `${folderName}.zip`;
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return zipFilename;
}

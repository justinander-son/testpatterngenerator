/**
 * Disguise Screen Metadata Plaque Layer
 * Prominent, high-contrast information block identifying the screen,
 * exact resolution, aspect ratio, physical cabinet count, and author.
 */

export function renderMetadataLayer(ctx, width, height, screen, state) {
  if (!state.showMetadata) return;

  ctx.save();

  const scale = Math.max(0.5, Math.min(2.5, state.metadataScale || 1.0));
  const cabW = Math.max(8, screen.cabinetW || 192);
  const cabH = Math.max(8, screen.cabinetH || 192);
  const cols = Math.ceil(width / cabW);
  const rows = Math.ceil(height / cabH);
  const totalCabs = cols * rows;

  // Aspect ratio calculation
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const ratioStr = `${width / divisor}:${height / divisor}`;

  // Date formatting
  const dateStr = state.metadataCustomDate || new Date().toISOString().split('T')[0];

  // Plaque dimensions
  const baseW = 480 * scale;
  const baseH = 200 * scale;
  const padding = 24 * scale;

  let posX = 0;
  let posY = 0;
  const margin = 40 * scale;

  switch (state.metadataPosition) {
    case 'bottom-center':
      posX = Math.floor((width - baseW) / 2);
      posY = height - baseH - margin;
      break;
    case 'top-center':
      posX = Math.floor((width - baseW) / 2);
      posY = margin;
      break;
    case 'top-left':
      posX = margin;
      posY = margin;
      break;
    case 'top-right':
      posX = width - baseW - margin;
      posY = margin;
      break;
    case 'bottom-left':
      posX = margin;
      posY = height - baseH - margin;
      break;
    case 'bottom-right':
      posX = width - baseW - margin;
      posY = height - baseH - margin;
      break;
    case 'center':
    default:
      posX = Math.floor((width - baseW) / 2);
      posY = Math.floor((height - baseH) / 2);
      break;
  }

  // Ensure within screen boundaries
  posX = Math.max(10, Math.min(width - baseW - 10, posX));
  posY = Math.max(10, Math.min(height - baseH - 10, posY));

  // 1. Drop shadow & background card
  ctx.shadowColor = 'rgba(0, 0, 0, 0.70)';
  ctx.shadowBlur = 24 * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6 * scale;

  ctx.fillStyle = '#111317'; // Precision studio slate
  ctx.beginPath();
  const radius = 10 * scale;
  ctx.roundRect(posX, posY, baseW, baseH, radius);
  ctx.fill();

  // 2. High-contrast precision graphite/silver border
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#3b4252'; // Sleek architectural graphite
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // Top header highlight line
  ctx.strokeStyle = '#272b36';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(posX + padding, posY + 62 * scale);
  ctx.lineTo(posX + baseW - padding, posY + 62 * scale);
  ctx.stroke();

  // 3. Text content
  ctx.textAlign = 'left';

  // Screen Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${22 * scale}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(screen.name || 'Disguise Screen', posX + padding, posY + 34 * scale);

  // Project Tag (refined monochrome capsule pill badge)
  const projectTagText = (state.projectTitle || 'PROJECT').toUpperCase();
  ctx.font = `600 ${10 * scale}px system-ui, -apple-system, sans-serif`;
  const tagMetrics = ctx.measureText(projectTagText);
  const tagPadX = 8 * scale;
  const tagH = 16 * scale;
  const tagW = tagMetrics.width + (tagPadX * 2);
  const tagY = posY + 40 * scale;

  ctx.fillStyle = '#1e222b'; // Dark capsule background
  ctx.beginPath();
  ctx.roundRect(posX + padding, tagY, tagW, tagH, 3 * scale);
  ctx.fill();

  ctx.fillStyle = '#94a3b8'; // Neutral silver text
  ctx.textBaseline = 'middle';
  ctx.fillText(projectTagText, posX + padding + tagPadX, tagY + (tagH / 2));
  ctx.textBaseline = 'alphabetic';

  // Main Resolution (Large, high visibility)
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${28 * scale}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(`${width} × ${height}`, posX + padding, posY + 102 * scale);

  // Resolution Subtitle (Aspect Ratio)
  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${13 * scale}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(`Aspect Ratio: ${ratioStr} | Total: ${(width * height).toLocaleString()} px`, posX + padding, posY + 124 * scale);

  // Hardware Tile Details
  ctx.fillStyle = '#e2e8f0';
  ctx.font = `600 ${12 * scale}px system-ui, -apple-system, sans-serif`;
  const tileSummary = `LED Tiles: ${cols}W × ${rows}H (${totalCabs} cabs @ ${cabW}×${cabH}px)`;
  ctx.fillText(tileSummary, posX + padding, posY + 152 * scale);

  // Footer: Notes / Author / Date
  ctx.fillStyle = '#71717a';
  ctx.font = `500 ${11 * scale}px system-ui, -apple-system, sans-serif`;
  const extraInfo = [
    screen.notes ? `Note: ${screen.notes}` : null,
    state.metadataAuthor ? `Tech: ${state.metadataAuthor}` : null,
    `Date: ${dateStr}`
  ].filter(Boolean).join('  •  ');
  ctx.fillText(extraInfo, posX + padding, posY + 176 * scale);

  ctx.restore();
}

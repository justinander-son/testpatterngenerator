/**
 * Outer Border & Crop Ticks Layer
 * Ground truth for Disguise Direct Mapping.
 * If this 1px border is missing or cropped on an LED wall, overscan/scaling is detected immediately.
 */

export function renderBorderLayer(ctx, width, height, state) {
  if (!state.showBorder) return;

  ctx.save();
  const isPastel = state.themeMode === 'multicolor';
  ctx.strokeStyle = isPastel ? '#ffffff' : (state.borderColor || '#00ffff');
  ctx.lineWidth = Math.max(1, state.borderWidth || 1);

  // Exact 1px perimeter box aligned with sub-pixel 0.5 offset
  const half = ctx.lineWidth / 2;
  ctx.strokeRect(half, half, width - ctx.lineWidth, height - ctx.lineWidth);

  // Corner Crop Ticks (L-brackets at all 4 corners)
  if (state.showCropTicks) {
    const tickLen = Math.min(Math.max(16, state.cropTickSize || 32), Math.min(width, height) / 4);
    ctx.lineWidth = Math.max(2, (state.borderWidth || 1) + 1);

    ctx.beginPath();
    // Top-Left
    ctx.moveTo(0, tickLen);
    ctx.lineTo(0, 0);
    ctx.lineTo(tickLen, 0);

    // Top-Right
    ctx.moveTo(width - tickLen, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, tickLen);

    // Bottom-Left
    ctx.moveTo(0, height - tickLen);
    ctx.lineTo(0, height);
    ctx.lineTo(tickLen, height);

    // Bottom-Right
    ctx.moveTo(width - tickLen, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, height - tickLen);

    ctx.stroke();

    // Center Edge Ticks
    const midX = Math.floor(width / 2);
    const midY = Math.floor(height / 2);
    const centerTick = Math.min(24, tickLen);

    ctx.beginPath();
    // Top center
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, centerTick);
    // Bottom center
    ctx.moveTo(midX, height);
    ctx.lineTo(midX, height - centerTick);
    // Left center
    ctx.moveTo(0, midY);
    ctx.lineTo(centerTick, midY);
    // Right center
    ctx.moveTo(width, midY);
    ctx.lineTo(width - centerTick, midY);
    ctx.stroke();
  }

  ctx.restore();
}

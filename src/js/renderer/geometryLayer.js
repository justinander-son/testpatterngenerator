/**
 * Geometric Alignment Layer
 * Concentric circles for aspect ratio / stretch verification,
 * diagonal corner-to-corner crosshairs, and center target rings.
 */

export function renderGeometryLayer(ctx, width, height, state) {
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  const isPastel = state.themeMode === 'multicolor';

  // 1. Alternating Checkerboard Overlay (Optional)
  if (state.showCheckerboard) {
    const size = Math.max(16, state.checkerboardSize || 96);
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = Math.max(0.02, Math.min(0.5, state.checkerboardOpacity || 0.12));

    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
          ctx.fillRect(x, y, Math.min(size, width - x), Math.min(size, height - y));
        }
      }
    }
    ctx.restore();
  }

  // 2. Corner-to-Corner Diagonal Diagonals ('X')
  if (state.showDiagonals) {
    ctx.save();
    ctx.strokeStyle = isPastel ? '#ffffff' : (state.diagonalColor || '#ffd60a');
    ctx.lineWidth = 1;
    ctx.globalAlpha = isPastel ? 0.9 : 0.65;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.restore();
  }

  // 3. Concentric Circles
  if (state.showConcentricCircles) {
    ctx.save();
    const cCol = isPastel ? '#ffffff' : (state.circleColor || '#ff2d55');
    ctx.strokeStyle = cCol;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = isPastel ? 0.95 : 0.85;

    if (isPastel) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
      ctx.shadowBlur = 2.5;
    }

    const maxRadius = Math.sqrt(midX * midX + midY * midY);
    const step = Math.max(40, state.circleSpacing || 200);

    for (let r = step; r < maxRadius; r += step) {
      ctx.beginPath();
      ctx.arc(midX + 0.5, midY + 0.5, r, 0, Math.PI * 2);
      ctx.stroke();

      // Radius label along horizontal axis
      if (r < midX - 40) {
        const text = `r=${r}`;
        ctx.font = '600 10px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        if (isPastel) {
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.strokeText(text, midX + r, midY - 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, midX + r, midY - 3);
        } else {
          ctx.fillStyle = cCol;
          ctx.fillText(text, midX + r, midY - 3);
        }
      }
    }
    ctx.restore();
  }

  // 4. Center Crosshair & Target Reticle
  if (state.showCenterCrosshair) {
    ctx.save();
    const crossCol = isPastel ? '#ffffff' : (state.crosshairColor || '#30d158');
    ctx.strokeStyle = crossCol;
    ctx.fillStyle = crossCol;
    ctx.lineWidth = 1.5;

    if (isPastel) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.40)';
      ctx.shadowBlur = 2.5;
    }

    const reticleRadius = Math.max(20, Math.min(state.centerTargetRadius || 120, Math.min(width, height) / 3));

    // Outer and inner target rings
    ctx.beginPath();
    ctx.arc(midX + 0.5, midY + 0.5, reticleRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(midX + 0.5, midY + 0.5, reticleRadius / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair lines spanning full width and height
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal center line
    ctx.moveTo(0, midY + 0.5);
    ctx.lineTo(width, midY + 0.5);
    // Vertical center line
    ctx.moveTo(midX + 0.5, 0);
    ctx.lineTo(midX + 0.5, height);
    ctx.stroke();

    // Center precision dot
    ctx.beginPath();
    ctx.arc(midX + 0.5, midY + 0.5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Center coordinate badge
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const centerText = `CENTER (${midX}, ${midY})`;
    if (isPastel) {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.strokeText(centerText, midX + 8, midY + 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(centerText, midX + 8, midY + 8);
    } else {
      ctx.fillText(centerText, midX + 8, midY + 8);
    }

    ctx.restore();
  }
}

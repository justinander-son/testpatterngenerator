/**
 * Multi-Tier Physical LED Grid Layer
 * Renders:
 * 1. Fine pixel measurement grid (e.g. 50px/100px)
 * 2. Internal module sub-grid (e.g. 2x2 modules per cabinet, dashed)
 * 3. Primary cabinet seam grid (solid, crisp)
 * 4. Coordinate callout badges inside each tile
 */

export function renderGridLayer(ctx, width, height, screen, state) {
  const cabW = Math.max(8, screen.cabinetW || 192);
  const cabH = Math.max(8, screen.cabinetH || 192);
  const divisions = Math.max(1, screen.moduleDivisions || 2);

  const isPastel = state.themeMode === 'multicolor';

  // 1. Fine Measurement Grid (Optional)
  if (state.showFineGrid) {
    const step = Math.max(10, state.fineGridStep || 50);
    ctx.save();
    ctx.strokeStyle = isPastel ? 'rgba(255, 255, 255, 0.25)' : (state.fineGridColor || '#2c313a');
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = step; x < width; x += step) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }
    for (let y = step; y < height; y += step) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 2. Module Sub-Grid (e.g. 2x2 or 4x4 modules per cabinet)
  if (state.showModuleGrid && divisions > 1) {
    const modW = cabW / divisions;
    const modH = cabH / divisions;

    ctx.save();
    ctx.strokeStyle = isPastel ? '#ffffff' : (state.moduleGridColor || '#5a6275');
    ctx.globalAlpha = isPastel ? 0.35 : Math.max(0.1, Math.min(1, state.moduleGridOpacity || 0.5));
    ctx.lineWidth = 1;

    if (state.moduleGridStyle === 'dashed') {
      ctx.setLineDash([4, 4]);
    } else if (state.moduleGridStyle === 'dotted') {
      ctx.setLineDash([2, 4]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    // Vertical module lines
    for (let x = 0; x < width; x += modW) {
      // Skip if it aligns with a cabinet boundary (cabinet grid draws solid over it)
      if (Math.round(x) % cabW !== 0) {
        ctx.moveTo(Math.floor(x) + 0.5, 0);
        ctx.lineTo(Math.floor(x) + 0.5, height);
      }
    }
    // Horizontal module lines
    for (let y = 0; y < height; y += modH) {
      if (Math.round(y) % cabH !== 0) {
        ctx.moveTo(0, Math.floor(y) + 0.5);
        ctx.lineTo(width, Math.floor(y) + 0.5);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // 3. Primary Cabinet Seam Grid (Solid, High Visibility)
  if (state.showCabinetGrid) {
    ctx.save();
    ctx.strokeStyle = isPastel ? '#ffffff' : (state.cabinetGridColor || '#ffffff');
    ctx.globalAlpha = isPastel ? 0.95 : Math.max(0.1, Math.min(1, state.cabinetGridOpacity || 0.8));
    ctx.lineWidth = Math.max(1, state.cabinetGridWidth || 1);
    ctx.setLineDash([]);

    ctx.beginPath();
    const cols = Math.ceil(width / cabW);
    const rows = Math.ceil(height / cabH);

    for (let c = 1; c <= cols; c++) {
      const x = Math.min(width, c * cabW);
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }
    for (let r = 1; r <= rows; r++) {
      const y = Math.min(height, r * cabH);
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();

    // 4. Cabinet Labels: subtle coordinate callouts [Col, Row]
    if (state.showCabinetLabels && cabW >= 64 && cabH >= 48) {
      if (isPastel) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.95;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 3;
      } else {
        ctx.fillStyle = state.cabinetGridColor || '#ffffff';
        ctx.globalAlpha = 0.5;
      }
      ctx.font = '600 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const posX = c * cabW + 6;
          const posY = r * cabH + 6;
          if (posX < width - 20 && posY < height - 20) {
            ctx.fillText(`${c + 1},${r + 1}`, posX, posY);
          }
        }
      }
    }

    ctx.restore();
  }
}

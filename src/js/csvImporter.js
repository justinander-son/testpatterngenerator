/**
 * Tolerant CSV / TSV Parser for fast population of screen lists.
 * Supports comma, semicolon, and tab delimiters (Excel / Google Sheets clipboard paste).
 */

export function parseScreenCsv(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  // Normalize newlines
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: check first line for tabs, semicolons, or commas
  const headerLine = lines[0];
  let delimiter = ',';
  if (headerLine.includes('\t')) {
    delimiter = '\t';
  } else if ((headerLine.match(/;/g) || []).length > (headerLine.match(/,/g) || []).length) {
    delimiter = ';';
  }

  // Parse lines into tokens (handling quotes)
  const rows = lines.map(line => parseRow(line, delimiter));
  if (rows.length === 0) return [];

  // Determine headers
  const headerRow = rows[0].map(h => h.toLowerCase().trim().replace(/[\s_-]+/g, ''));
  const hasHeaders = headerRow.some(h => ['name', 'screen', 'surface', 'width', 'w', 'height', 'h'].includes(h));

  let colMap = {
    name: -1,
    width: -1,
    height: -1,
    cabinetW: -1,
    cabinetH: -1,
    modules: -1,
    notes: -1
  };

  let startIndex = 0;

  if (hasHeaders) {
    startIndex = 1;
    headerRow.forEach((col, idx) => {
      if (['name', 'screen', 'surface', 'screenname', 'label', 'display'].includes(col)) colMap.name = idx;
      else if (['width', 'w', 'resx', 'xres', 'pixelsx'].includes(col)) colMap.width = idx;
      else if (['height', 'h', 'resy', 'yres', 'pixelsy'].includes(col)) colMap.height = idx;
      else if (['cabinetw', 'tilew', 'cabinetwidth', 'tilewidth'].includes(col)) colMap.cabinetW = idx;
      else if (['cabineth', 'tileh', 'cabinetheight', 'tileheight'].includes(col)) colMap.cabinetH = idx;
      else if (['modules', 'modulediv', 'subdivisions', 'div'].includes(col)) colMap.modules = idx;
      else if (['notes', 'note', 'comment', 'processor', 'port', 'info'].includes(col)) colMap.notes = idx;
    });
  } else {
    // Positional fallback: Name, Width, Height, CabinetW, CabinetH, Notes
    colMap = { name: 0, width: 1, height: 2, cabinetW: 3, cabinetH: 4, modules: 5, notes: 6 };
  }

  const results = [];

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const name = colMap.name >= 0 && row[colMap.name] ? row[colMap.name].trim() : `Screen ${i}`;
    const rawW = colMap.width >= 0 ? parseInt(row[colMap.width], 10) : 1920;
    const rawH = colMap.height >= 0 ? parseInt(row[colMap.height], 10) : 1080;
    const rawCabW = colMap.cabinetW >= 0 ? parseInt(row[colMap.cabinetW], 10) : 192;
    const rawCabH = colMap.cabinetH >= 0 ? parseInt(row[colMap.cabinetH], 10) : 192;
    const rawMods = colMap.modules >= 0 ? parseInt(row[colMap.modules], 10) : 2;
    const notes = colMap.notes >= 0 && row[colMap.notes] ? row[colMap.notes].trim() : '';

    if (isNaN(rawW) || isNaN(rawH) || rawW <= 0 || rawH <= 0) continue;

    results.push({
      name,
      width: rawW,
      height: rawH,
      cabinetW: isNaN(rawCabW) || rawCabW <= 0 ? 192 : rawCabW,
      cabinetH: isNaN(rawCabH) || rawCabH <= 0 ? 192 : rawCabH,
      moduleDivisions: isNaN(rawMods) || rawMods <= 0 ? 2 : rawMods,
      notes
    });
  }

  return results;
}

function parseRow(text, delimiter) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export function generateSampleCsv() {
  return `Screen Name,Width,Height,Cabinet W,Cabinet H,Modules,Notes
Upstage Main Wall,3840,2160,192,192,2,Brompton SX40 Ports 1-4
Stage Left Wing,1920,1080,192,192,2,Brompton S8 Port 1-2
Stage Right Wing,1920,1080,192,192,2,Brompton S8 Port 3-4
DJ Riser Front,2048,512,128,128,2,Helix Processor
Overhead Portal Arch,3440,720,192,192,2,NovaStar MX40
Floor Center Pod,1024,1024,256,256,2,Black Marble 4mm
`;
}

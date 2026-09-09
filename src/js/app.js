/**
 * Application Bootstrap & Master Controller
 * Wires together State, Viewport, Canvas Engine, Screen Drawer, and CSV Importer.
 */

import { store, PASTEL_PALETTES, getScreenColors } from './state.js';
import { STANDARD_RESOLUTIONS, STANDARD_TILE_SIZES } from './presets.js';
import { renderPattern } from './renderer/canvasEngine.js';
import { exportScreenToPng } from './renderer/exportEngine.js';
import { exportAllScreensToZip } from './renderer/batchExporter.js';
import { ViewportController } from './viewport/panZoom.js';
import { PixelPeeper } from './viewport/pixelPeeper.js';
import { parseScreenCsv, generateSampleCsv } from './csvImporter.js';

class App {
  constructor() {
    this.canvas = document.getElementById('pattern-canvas');
    this.canvasWrapper = document.getElementById('canvas-wrapper');
    this.viewportEl = document.getElementById('viewport');
    this.hudEl = document.getElementById('pixel-peeper-hud');

    this.viewport = new ViewportController(
      this.viewportEl,
      this.canvasWrapper,
      this.canvas,
      (scale) => this.pixelPeeper.updateZoomBadge(scale)
    );

    this.pixelPeeper = new PixelPeeper(this.hudEl, this.viewport, store);

    this.initPresets();
    this.initSidebarBindings();
    this.initScreenDrawer();
    this.initCsvModal();
    this.initExportButtons();
    this.initKeyboardShortcuts();

    // Subscribe to state changes
    store.subscribe((state) => {
      this.syncUiFromState(state);
      this.render();
    });

    // Initial render and fit
    this.syncUiFromState(store.get());
    this.render();
    setTimeout(() => {
      const screen = store.getActiveScreen();
      this.viewport.fitToScreen(screen.width, screen.height);
    }, 50);
  }

  render() {
    const screen = store.getActiveScreen();
    const screenIndex = store.getActiveScreenIndex();
    renderPattern(this.canvas, screen, store.get(), screenIndex >= 0 ? screenIndex : 0);
  }

  initPresets() {
    // Populate Resolution Preset Dropdown
    const resSelect = document.getElementById('screen-preset-select');
    resSelect.innerHTML = STANDARD_RESOLUTIONS.map(p => 
      `<option value="${p.width}x${p.height}">${p.label}</option>`
    ).join('');

    resSelect.addEventListener('change', (e) => {
      const [w, h] = e.target.value.split('x').map(Number);
      if (w && h) {
        store.updateActiveScreen({ width: w, height: h });
        this.viewport.fitToScreen(w, h);
      }
    });

    // Populate Tile Size Preset Dropdown
    const tileSelect = document.getElementById('tile-preset-select');
    tileSelect.innerHTML = STANDARD_TILE_SIZES.map(t => 
      `<option value="${t.width}x${t.height}">${t.label}</option>`
    ).join('');

    tileSelect.addEventListener('change', (e) => {
      const [w, h] = e.target.value.split('x').map(Number);
      if (w && h) {
        store.updateActiveScreen({ cabinetW: w, cabinetH: h });
      }
    });
  }

  initSidebarBindings() {
    // Project Title
    const projInput = document.getElementById('project-title-input');
    projInput.value = store.get().projectTitle;
    projInput.addEventListener('input', (e) => {
      store.set({ projectTitle: e.target.value });
    });

    // Screen Dimensions Inputs
    const nameInput = document.getElementById('screen-name-input');
    nameInput.addEventListener('input', (e) => {
      store.updateActiveScreen({ name: e.target.value });
    });

    const wInput = document.getElementById('screen-width-input');
    wInput.addEventListener('change', (e) => {
      const val = Math.max(16, parseInt(e.target.value, 10) || 1920);
      store.updateActiveScreen({ width: val });
      this.viewport.fitToScreen(val, store.getActiveScreen().height);
    });

    const hInput = document.getElementById('screen-height-input');
    hInput.addEventListener('change', (e) => {
      const val = Math.max(16, parseInt(e.target.value, 10) || 1080);
      store.updateActiveScreen({ height: val });
      this.viewport.fitToScreen(store.getActiveScreen().width, val);
    });

    const notesInput = document.getElementById('screen-notes-input');
    notesInput.addEventListener('input', (e) => {
      store.updateActiveScreen({ notes: e.target.value });
    });

    // Cabinet Sizing Inputs
    const cabWInput = document.getElementById('cabinet-width-input');
    cabWInput.addEventListener('change', (e) => {
      const val = Math.max(8, parseInt(e.target.value, 10) || 192);
      store.updateActiveScreen({ cabinetW: val });
    });

    const cabHInput = document.getElementById('cabinet-height-input');
    cabHInput.addEventListener('change', (e) => {
      const val = Math.max(8, parseInt(e.target.value, 10) || 192);
      store.updateActiveScreen({ cabinetH: val });
    });

    // Accordion expand/collapse
    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('open');
      });
    });

    // Layer toggles
    this.bindCheckbox('toggle-border', 'showBorder');
    this.bindColorInput('color-border', 'borderColor');
    this.bindCheckbox('toggle-crop-ticks', 'showCropTicks');

    this.bindCheckbox('toggle-cabinet-grid', 'showCabinetGrid');
    this.bindColorInput('color-cabinet-grid', 'cabinetGridColor');
    this.bindCheckbox('toggle-cabinet-labels', 'showCabinetLabels');

    const modDivSelect = document.getElementById('module-divisions-select');
    modDivSelect.addEventListener('change', (e) => {
      store.updateActiveScreen({ moduleDivisions: parseInt(e.target.value, 10) || 2 });
    });

    const modStyleSelect = document.getElementById('module-style-select');
    modStyleSelect.addEventListener('change', (e) => {
      store.set({ moduleGridStyle: e.target.value });
    });

    this.bindCheckbox('toggle-fine-grid', 'showFineGrid');

    this.bindCheckbox('toggle-circles', 'showConcentricCircles');
    this.bindColorInput('color-circles', 'circleColor');
    const circleSpacingInput = document.getElementById('circle-spacing-input');
    circleSpacingInput.addEventListener('change', (e) => {
      store.set({ circleSpacing: Math.max(20, parseInt(e.target.value, 10) || 200) });
    });

    this.bindCheckbox('toggle-diagonals', 'showDiagonals');
    this.bindCheckbox('toggle-crosshair', 'showCenterCrosshair');
    this.bindCheckbox('toggle-checkerboard', 'showCheckerboard');

    // Metadata Plaque
    this.bindCheckbox('toggle-metadata', 'showMetadata');
    const metaPosSelect = document.getElementById('metadata-position-select');
    metaPosSelect.addEventListener('change', (e) => {
      store.set({ metadataPosition: e.target.value });
    });

    const metaScaleSelect = document.getElementById('metadata-scale-select');
    metaScaleSelect.addEventListener('change', (e) => {
      store.set({ metadataScale: parseFloat(e.target.value) || 1.0 });
    });

    const metaAuthorInput = document.getElementById('metadata-author-input');
    metaAuthorInput.addEventListener('input', (e) => {
      store.set({ metadataAuthor: e.target.value });
    });

    // Background & Theme
    this.initThemeBindings();

    // Viewport HUD Zoom Buttons
    document.getElementById('hud-zoom-fit').addEventListener('click', () => {
      const screen = store.getActiveScreen();
      this.viewport.fitToScreen(screen.width, screen.height);
    });
    document.getElementById('hud-zoom-100').addEventListener('click', () => {
      this.viewport.setZoom(1.0);
    });
    document.getElementById('hud-zoom-400').addEventListener('click', () => {
      this.viewport.setZoom(4.0);
    });
    document.getElementById('btn-fit-screen').addEventListener('click', () => {
      const screen = store.getActiveScreen();
      this.viewport.fitToScreen(screen.width, screen.height);
    });

    // Fullscreen Toggle
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.warn(err));
      } else {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    });
  }

  initThemeBindings() {
    // Theme Mode Segmented Tabs
    const tabs = document.querySelectorAll('#theme-mode-tabs .theme-seg-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        store.set({ themeMode: mode });
      });
    });

    // Obsidian Presets
    const btnObsidian = document.getElementById('btn-theme-obsidian');
    if (btnObsidian) {
      btnObsidian.addEventListener('click', () => {
        store.set({ backgroundColor: '#111317' });
      });
    }

    const btnBlack = document.getElementById('btn-theme-black');
    if (btnBlack) {
      btnBlack.addEventListener('click', () => {
        store.set({ backgroundColor: '#000000' });
      });
    }

    // Multi Colour Controls
    const btnPrev = document.getElementById('btn-palette-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        const cur = store.getActiveScreenPaletteIndex();
        store.setActiveScreenPaletteIndex((cur - 1 + PASTEL_PALETTES.length) % PASTEL_PALETTES.length);
      });
    }

    const btnNext = document.getElementById('btn-palette-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const cur = store.getActiveScreenPaletteIndex();
        store.setActiveScreenPaletteIndex((cur + 1) % PASTEL_PALETTES.length);
      });
    }

    const btnAuto = document.getElementById('btn-palette-auto');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        store.resetActiveScreenPaletteIndex();
      });
    }

    const btnBrowse = document.getElementById('btn-browse-palettes');
    const gridContainer = document.getElementById('palette-grid-container');
    if (btnBrowse && gridContainer) {
      btnBrowse.addEventListener('click', () => {
        const isCollapsed = gridContainer.classList.toggle('collapsed');
        btnBrowse.classList.toggle('expanded', !isCollapsed);
      });

      // Populate 54 swatches in the grid
      gridContainer.innerHTML = '';
      PASTEL_PALETTES.forEach((pair, idx) => {
        const item = document.createElement('div');
        item.className = 'palette-grid-item';
        item.dataset.index = idx;
        item.title = `Palette #${idx + 1} (${pair[0]} / ${pair[1]})`;
        item.style.backgroundColor = pair[0];
        item.innerHTML = `<div class="palette-grid-item-circ" style="background-color: ${pair[1]};"></div>`;
        item.addEventListener('click', () => {
          store.setActiveScreenPaletteIndex(idx);
        });
        gridContainer.appendChild(item);
      });
    }

    // Custom Mode Pickers
    const inputCustomA = document.getElementById('color-custom-a');
    const labelCustomA = document.getElementById('color-custom-a-hex');
    if (inputCustomA) {
      inputCustomA.addEventListener('input', (e) => {
        store.set({ customColorA: e.target.value });
        if (labelCustomA) labelCustomA.textContent = e.target.value;
      });
    }

    const inputCustomB = document.getElementById('color-custom-b');
    const labelCustomB = document.getElementById('color-custom-b-hex');
    if (inputCustomB) {
      inputCustomB.addEventListener('input', (e) => {
        store.set({ customColorB: e.target.value });
        if (labelCustomB) labelCustomB.textContent = e.target.value;
      });
    }

    const toggleAlternate = document.getElementById('toggle-custom-alternate');
    if (toggleAlternate) {
      toggleAlternate.addEventListener('change', (e) => {
        store.set({ customAlternatePanels: e.target.checked });
      });
    }

    const btnCustomObsidian = document.getElementById('btn-custom-obsidian-preset');
    if (btnCustomObsidian) {
      btnCustomObsidian.addEventListener('click', () => {
        store.set({
          customColorA: '#111317',
          customColorB: '#111317'
        });
        if (inputCustomA) inputCustomA.value = '#111317';
        if (inputCustomB) inputCustomB.value = '#111317';
        if (labelCustomA) labelCustomA.textContent = '#111317';
        if (labelCustomB) labelCustomB.textContent = '#111317';
      });
    }
  }

  bindCheckbox(id, stateKey) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', (e) => {
      store.set({ [stateKey]: e.target.checked });
    });
  }

  bindColorInput(id, stateKey) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      store.set({ [stateKey]: e.target.value });
    });
  }

  bindRangeInput(id, stateKey, parser = parseInt) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      store.set({ [stateKey]: parser(e.target.value, 10) });
    });
  }

  syncUiFromState(state) {
    const screen = store.getActiveScreen();

    if (screen) {
      // Header badge
      const headerName = document.getElementById('header-screen-name');
      const headerRes = document.getElementById('header-screen-res');
      if (headerName) headerName.textContent = screen.name;
      if (headerRes) headerRes.textContent = `(${screen.width}×${screen.height})`;

      // Screen Dimensions section
      const nameInput = document.getElementById('screen-name-input');
      const wInput = document.getElementById('screen-width-input');
      const hInput = document.getElementById('screen-height-input');
      const notesInput = document.getElementById('screen-notes-input');
      if (nameInput) nameInput.value = screen.name;
      if (wInput) wInput.value = screen.width;
      if (hInput) hInput.value = screen.height;
      if (notesInput) notesInput.value = screen.notes || '';

      // Aspect ratio info
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(screen.width, screen.height);
      const ratioStr = `${screen.width / divisor}:${screen.height / divisor}`;
      const decimalRatio = (screen.width / screen.height).toFixed(2);
      const arDisplay = document.getElementById('aspect-ratio-display');
      const pxDisplay = document.getElementById('pixel-count-display');
      if (arDisplay) arDisplay.textContent = `${ratioStr} (${decimalRatio}:1)`;
      if (pxDisplay) pxDisplay.textContent = `${(screen.width * screen.height).toLocaleString()} px`;

      // Cabinet section
      const cabWInput = document.getElementById('cabinet-width-input');
      const cabHInput = document.getElementById('cabinet-height-input');
      const modDivSelect = document.getElementById('module-divisions-select');
      if (cabWInput) cabWInput.value = screen.cabinetW || 192;
      if (cabHInput) cabHInput.value = screen.cabinetH || 192;
      if (modDivSelect) modDivSelect.value = screen.moduleDivisions || 2;
    }

    // Layer Controls
    const toggleBorder = document.getElementById('toggle-border');
    if (toggleBorder) toggleBorder.checked = state.showBorder;
    const colorBorder = document.getElementById('color-border');
    if (colorBorder) colorBorder.value = state.borderColor;
    const toggleTicks = document.getElementById('toggle-crop-ticks');
    if (toggleTicks) toggleTicks.checked = state.showCropTicks;

    const toggleCabGrid = document.getElementById('toggle-cabinet-grid');
    if (toggleCabGrid) toggleCabGrid.checked = state.showCabinetGrid;
    const colorCabGrid = document.getElementById('color-cabinet-grid');
    if (colorCabGrid) colorCabGrid.value = state.cabinetGridColor;
    const toggleCabLabels = document.getElementById('toggle-cabinet-labels');
    if (toggleCabLabels) toggleCabLabels.checked = state.showCabinetLabels;
    const modStyleSelect = document.getElementById('module-style-select');
    if (modStyleSelect) modStyleSelect.value = state.moduleGridStyle || 'dashed';

    const toggleFine = document.getElementById('toggle-fine-grid');
    if (toggleFine) toggleFine.checked = state.showFineGrid;

    const toggleCircles = document.getElementById('toggle-circles');
    if (toggleCircles) toggleCircles.checked = state.showConcentricCircles;
    const colorCircles = document.getElementById('color-circles');
    if (colorCircles) colorCircles.value = state.circleColor;
    const spacingInput = document.getElementById('circle-spacing-input');
    if (spacingInput) spacingInput.value = state.circleSpacing || 200;

    const toggleDiag = document.getElementById('toggle-diagonals');
    if (toggleDiag) toggleDiag.checked = state.showDiagonals;
    const toggleCross = document.getElementById('toggle-crosshair');
    if (toggleCross) toggleCross.checked = state.showCenterCrosshair;
    const toggleCheck = document.getElementById('toggle-checkerboard');
    if (toggleCheck) toggleCheck.checked = state.showCheckerboard;

    const toggleMeta = document.getElementById('toggle-metadata');
    if (toggleMeta) toggleMeta.checked = state.showMetadata;
    const metaPosSelect = document.getElementById('metadata-position-select');
    if (metaPosSelect) metaPosSelect.value = state.metadataPosition;
    const metaScaleSelect = document.getElementById('metadata-scale-select');
    if (metaScaleSelect) metaScaleSelect.value = String(state.metadataScale);
    const metaAuthorInput = document.getElementById('metadata-author-input');
    if (metaAuthorInput) metaAuthorInput.value = state.metadataAuthor;

    // Theme Mode Sync
    const mode = state.themeMode || 'obsidian';
    document.querySelectorAll('#theme-mode-tabs .theme-seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const viewObsidian = document.getElementById('theme-view-obsidian');
    const viewMulti = document.getElementById('theme-view-multicolor');
    const viewCustom = document.getElementById('theme-view-custom');
    if (viewObsidian) viewObsidian.style.display = mode === 'obsidian' ? 'flex' : 'none';
    if (viewMulti) viewMulti.style.display = mode === 'multicolor' ? 'flex' : 'none';
    if (viewCustom) viewCustom.style.display = mode === 'custom' ? 'flex' : 'none';

    // If Multi Colour: update preview card and active grid swatch
    if (mode === 'multicolor') {
      const palIdx = store.getActiveScreenPaletteIndex();
      const pair = PASTEL_PALETTES[Math.abs(palIdx) % PASTEL_PALETTES.length];
      const isManual = screen && screen.paletteIndex !== undefined && screen.paletteIndex !== null;

      const swatchSq = document.getElementById('multi-swatch-sq');
      const swatchCirc = document.getElementById('multi-swatch-circ');
      const screenNameEl = document.getElementById('multi-palette-screen-name');
      const tagEl = document.getElementById('multi-palette-index-tag');

      if (swatchSq) swatchSq.style.backgroundColor = pair[0];
      if (swatchCirc) swatchCirc.style.backgroundColor = pair[1];
      if (screenNameEl) screenNameEl.textContent = screen ? screen.name : 'Active Screen';
      if (tagEl) {
        tagEl.textContent = `Palette #${(Math.abs(palIdx) % PASTEL_PALETTES.length) + 1} of 54 ${isManual ? '(Custom Override)' : '(Auto)'}`;
      }

      // Mark active swatch in 54-grid
      const activeIdx = Math.abs(palIdx) % PASTEL_PALETTES.length;
      document.querySelectorAll('#palette-grid-container .palette-grid-item').forEach(item => {
        item.classList.toggle('active', parseInt(item.dataset.index, 10) === activeIdx);
      });
    }

    // If Custom: update custom pickers
    if (mode === 'custom') {
      const inputA = document.getElementById('color-custom-a');
      const inputB = document.getElementById('color-custom-b');
      const labelA = document.getElementById('color-custom-a-hex');
      const labelB = document.getElementById('color-custom-b-hex');
      const toggleAlt = document.getElementById('toggle-custom-alternate');

      if (inputA) inputA.value = state.customColorA || '#111317';
      if (inputB) inputB.value = state.customColorB || '#1a1d24';
      if (labelA) labelA.textContent = state.customColorA || '#111317';
      if (labelB) labelB.textContent = state.customColorB || '#1a1d24';
      if (toggleAlt) toggleAlt.checked = state.customAlternatePanels !== false;
    }

    // Refresh multi-screen drawer
    this.renderScreenDrawer();
  }

  /* ========================================================================
     BOTTOM MULTI-SCREEN QUEUE DRAWER
     ======================================================================== */
  initScreenDrawer() {
    const drawer = document.getElementById('screen-drawer');
    const toggle = document.getElementById('drawer-toggle');

    toggle.addEventListener('click', () => {
      drawer.classList.toggle('collapsed');
    });

    this.renderScreenDrawer();
  }

  renderScreenDrawer() {
    const state = store.get();
    const track = document.getElementById('screen-cards-track');
    document.getElementById('drawer-screen-count').textContent = state.screens.length;

    track.innerHTML = '';

    state.screens.forEach((screen, idx) => {
      const isActive = screen.id === state.activeScreenId;
      const card = document.createElement('div');
      card.className = `screen-card ${isActive ? 'active' : ''}`;
      
      const cabW = screen.cabinetW || 192;
      const cabH = screen.cabinetH || 192;
      const cols = Math.ceil(screen.width / cabW);
      const rows = Math.ceil(screen.height / cabH);

      const colors = getScreenColors(screen, state, idx);
      const isSolid = colors[0] === colors[1];
      const badgeHtml = isSolid
        ? `<div class="screen-card-theme-badge" title="Theme Color: ${colors[0]}">
             <div class="badge-sq" style="background: ${colors[0]};"></div>
           </div>`
        : `<div class="screen-card-theme-badge" title="Panel A: ${colors[0]} • Panel B: ${colors[1]}">
             <div class="badge-sq" style="background: ${colors[0]};"></div>
             <div class="badge-circ" style="background: ${colors[1]};"></div>
           </div>`;

      card.innerHTML = `
        <div class="screen-card-top">
          <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
            ${badgeHtml}
            <span class="screen-card-name" title="${screen.name}">${idx + 1}. ${screen.name}</span>
          </div>
          ${state.screens.length > 1 ? `<button class="screen-card-delete" title="Delete screen">&times;</button>` : ''}
        </div>
        <div class="screen-card-res">${screen.width} × ${screen.height}</div>
        <div class="screen-card-meta">
          <span>${cols}×${rows} tiles</span>
          <span>${screen.notes ? screen.notes.slice(0, 14) : ''}</span>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('screen-card-delete')) {
          e.stopPropagation();
          store.removeScreen(screen.id);
          return;
        }
        store.setActiveScreen(screen.id);
        const s = store.getActiveScreen();
        this.viewport.fitToScreen(s.width, s.height);
      });

      track.appendChild(card);
    });

    // Add "+ Add Screen" Card
    const addCard = document.createElement('div');
    addCard.className = 'screen-card-add-new';
    addCard.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>Add Screen</span>
    `;
    addCard.addEventListener('click', () => {
      const newScreen = store.addScreen();
      this.viewport.fitToScreen(newScreen.width, newScreen.height);
    });
    track.appendChild(addCard);
  }

  /* ========================================================================
     CSV IMPORT MODAL
     ======================================================================== */
  initCsvModal() {
    const modal = document.getElementById('csv-modal');
    const openBtn = document.getElementById('btn-open-csv');
    const closeBtn = document.getElementById('csv-modal-close');
    const cancelBtn = document.getElementById('csv-cancel-btn');
    const dropZone = document.getElementById('csv-drop-zone');
    const fileInput = document.getElementById('csv-file-input');
    const textInput = document.getElementById('csv-text-input');
    const submitBtn = document.getElementById('csv-import-submit');
    const previewCount = document.getElementById('csv-preview-count');
    const sampleBtn = document.getElementById('btn-download-sample-csv');

    const showModal = () => modal.classList.add('open');
    const hideModal = () => modal.classList.remove('open');

    openBtn.addEventListener('click', showModal);
    closeBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });

    // Sample CSV Download
    sampleBtn.addEventListener('click', () => {
      const csv = generateSampleCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'disguise_screens_sample.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Drop zone interactions
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        this.handleCsvFile(e.dataTransfer.files[0], textInput, previewCount);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleCsvFile(e.target.files[0], textInput, previewCount);
      }
    });

    textInput.addEventListener('input', () => {
      const parsed = parseScreenCsv(textInput.value);
      previewCount.textContent = parsed.length > 0 ? `${parsed.length} valid screens detected` : 'Ready to parse';
    });

    submitBtn.addEventListener('click', () => {
      const raw = textInput.value;
      const parsed = parseScreenCsv(raw);
      if (parsed.length === 0) {
        alert('Please paste valid CSV data or select a CSV file first.');
        return;
      }

      const replace = document.getElementById('csv-replace-checkbox').checked;
      store.importScreens(parsed, replace);
      hideModal();

      const screen = store.getActiveScreen();
      this.viewport.fitToScreen(screen.width, screen.height);
    });
  }

  handleCsvFile(file, textInput, previewCount) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      textInput.value = text;
      const parsed = parseScreenCsv(text);
      previewCount.textContent = `${parsed.length} screens loaded from "${file.name}"`;
    };
    reader.readAsText(file);
  }

  /* ========================================================================
     EXPORTS: INTEGRATED SPLIT DROPDOWN (BATCH ZIP DEFAULT + SINGLE PNG)
     ======================================================================== */
  initExportButtons() {
    const dropdownMenu = document.getElementById('export-dropdown-menu');
    const caretBtn = document.getElementById('btn-export-caret');
    const exportAllBtn = document.getElementById('btn-export-zip-top');
    const exportSingleBtn = document.getElementById('btn-export-single');
    const exportAllOpt = document.getElementById('btn-export-all-opt');

    // Caret toggle dropdown menu
    caretBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('open');
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#export-dropdown-group')) {
        dropdownMenu.classList.remove('open');
      }
    });

    // Single Screen Export PNG action
    const triggerSingleExport = async () => {
      dropdownMenu.classList.remove('open');
      const screen = store.getActiveScreen();
      try {
        await exportScreenToPng(screen, store.get());
      } catch (err) {
        alert('Export failed: ' + err.message);
      }
    };

    if (exportSingleBtn) {
      exportSingleBtn.addEventListener('click', triggerSingleExport);
    }

    // Batch Export ZIP action (Default)
    const triggerBatchExport = async () => {
      dropdownMenu.classList.remove('open');
      const modal = document.getElementById('batch-export-modal');
      const progressFill = document.getElementById('batch-progress-fill');
      const progressStatus = document.getElementById('batch-progress-status');
      
      modal.classList.add('open');
      progressFill.style.width = '0%';
      progressStatus.textContent = 'Starting batch export...';

      try {
        const screens = store.get().screens;
        await exportAllScreensToZip(screens, store.get(), (cur, total, msg) => {
          const pct = Math.round((cur / total) * 100);
          progressFill.style.width = `${pct}%`;
          progressStatus.textContent = `Screen ${cur}/${total}: ${msg}`;
        });
        setTimeout(() => modal.classList.remove('open'), 600);
      } catch (err) {
        alert('Batch export failed: ' + err.message);
        modal.classList.remove('open');
      }
    };

    exportAllBtn.addEventListener('click', triggerBatchExport);
    if (exportAllOpt) {
      exportAllOpt.addEventListener('click', triggerBatchExport);
    }

    this.triggerSingleExport = triggerSingleExport;
    this.triggerBatchExport = triggerBatchExport;
  }

  /* ========================================================================
     KEYBOARD SHORTCUTS
     ======================================================================== */
  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // 'F' or 'Z' -> Fit to screen
      if (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'f') {
        const screen = store.getActiveScreen();
        this.viewport.fitToScreen(screen.width, screen.height);
      }

      // '1' -> 100% Zoom
      if (e.key === '1') {
        this.viewport.setZoom(1.0);
      }

      // '4' -> 400% Zoom
      if (e.key === '4') {
        this.viewport.setZoom(4.0);
      }

      // Cmd/Ctrl + E -> Export single PNG
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        this.triggerSingleExport();
      }

      // Cmd/Ctrl + B -> Batch Export ZIP
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        this.triggerBatchExport();
      }
    });
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});

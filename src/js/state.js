/**
 * Reactive Central State Store with LocalStorage Persistence
 * Manages the active screen, multi-screen queue, and layer configuration.
 */

import { PASTEL_PALETTES, getScreenColors } from './presets.js';

export { PASTEL_PALETTES, getScreenColors };

const STORAGE_KEY = 'disguise_tpg_v1_state';

function createDefaultScreen(id = 'screen-1', name = 'Upstage Main', width = 3840, height = 2160, cabinetW = 192, cabinetH = 192) {
  return {
    id,
    name,
    width,
    height,
    cabinetW,
    cabinetH,
    moduleDivisions: 2,
    notes: 'Disguise Direct Map'
  };
}

const DEFAULT_STATE = {
  projectTitle: 'Production Stage 2026',
  screens: [
    createDefaultScreen('screen-1', 'Upstage Main LED', 3840, 2160, 192, 192),
    createDefaultScreen('screen-2', 'Stage Left Wing', 1920, 1080, 192, 192),
    createDefaultScreen('screen-3', 'DJ Riser LED', 2048, 512, 128, 128)
  ],
  activeScreenId: 'screen-1',
  
  // Layer Settings
  showBorder: true,
  borderColor: '#00ffff', // High visibility Cyan
  borderWidth: 1,
  showCropTicks: true,
  cropTickSize: 32,

  showCabinetGrid: true,
  cabinetGridColor: '#ffffff',
  cabinetGridOpacity: 0.8,
  cabinetGridWidth: 1,
  showCabinetLabels: true,

  showModuleGrid: true,
  moduleGridColor: '#5a6275',
  moduleGridOpacity: 0.5,
  moduleGridStyle: 'dashed', // 'solid' | 'dashed' | 'dotted'

  showFineGrid: false,
  fineGridStep: 50,
  fineGridColor: '#333842',

  showConcentricCircles: true,
  circleColor: '#ff2d55', // Vibrant magenta/red
  circleSpacing: 200,

  showDiagonals: true,
  diagonalColor: '#ffd60a', // Bright yellow

  showCenterCrosshair: true,
  crosshairColor: '#30d158', // High visibility green
  centerTargetRadius: 120,

  showCheckerboard: false,
  checkerboardSize: 96,
  checkerboardOpacity: 0.12,

  // Disguise Metadata Plaque
  showMetadata: true,
  metadataPosition: 'center', // 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  metadataScale: 1.0,
  metadataAuthor: 'Lead Video Tech',
  metadataCustomDate: '',

  // Canvas Global Theme & Panels
  themeMode: 'obsidian', // 'obsidian' | 'multicolor' | 'custom'
  backgroundColor: '#111317', // Deep Charcoal Pro Dark
  customColorA: '#111317',
  customColorB: '#1a1d24',
  customAlternatePanels: true,
  
  // Viewport
  zoom: 1,
  panX: 0,
  panY: 0
};

class StateStore {
  constructor() {
    this.subscribers = new Set();
    this.state = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure at least one screen exists
        if (!parsed.screens || parsed.screens.length === 0) {
          parsed.screens = DEFAULT_STATE.screens;
          parsed.activeScreenId = DEFAULT_STATE.screens[0].id;
        }
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (err) {
      console.warn('Could not load state from localStorage:', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn('Could not save state to localStorage:', err);
    }
  }

  get() {
    return this.state;
  }

  getActiveScreen() {
    const screen = this.state.screens.find(s => s.id === this.state.activeScreenId);
    return screen || this.state.screens[0];
  }

  set(updates, options = { notify: true, save: true }) {
    this.state = { ...this.state, ...updates };
    if (options.save) this.saveToStorage();
    if (options.notify) this.notify();
  }

  updateActiveScreen(screenUpdates) {
    const screens = this.state.screens.map(s => {
      if (s.id === this.state.activeScreenId) {
        return { ...s, ...screenUpdates };
      }
      return s;
    });
    this.set({ screens });
  }

  getActiveScreenIndex() {
    return this.state.screens.findIndex(s => s.id === this.state.activeScreenId);
  }

  getActiveScreenPaletteIndex() {
    const screen = this.getActiveScreen();
    const idx = this.getActiveScreenIndex();
    if (screen && screen.paletteIndex !== undefined && screen.paletteIndex !== null) {
      return screen.paletteIndex;
    }
    return idx >= 0 ? idx : 0;
  }

  setActiveScreenPaletteIndex(paletteIdx) {
    this.updateActiveScreen({ paletteIndex: paletteIdx });
  }

  resetActiveScreenPaletteIndex() {
    this.updateActiveScreen({ paletteIndex: null });
  }

  addScreen(screenData = {}) {
    const id = 'screen-' + Date.now();
    const newScreen = createDefaultScreen(
      id,
      screenData.name || `Screen ${this.state.screens.length + 1}`,
      screenData.width || 1920,
      screenData.height || 1080,
      screenData.cabinetW || 192,
      screenData.cabinetH || 192
    );
    if (screenData.moduleDivisions) newScreen.moduleDivisions = screenData.moduleDivisions;
    if (screenData.notes) newScreen.notes = screenData.notes;

    const screens = [...this.state.screens, newScreen];
    this.set({ screens, activeScreenId: id });
    return newScreen;
  }

  removeScreen(id) {
    if (this.state.screens.length <= 1) {
      alert('Cannot delete the last remaining screen.');
      return;
    }
    const screens = this.state.screens.filter(s => s.id !== id);
    let activeScreenId = this.state.activeScreenId;
    if (activeScreenId === id) {
      activeScreenId = screens[0].id;
    }
    this.set({ screens, activeScreenId });
  }

  setActiveScreen(id) {
    if (this.state.screens.some(s => s.id === id)) {
      this.set({ activeScreenId: id });
    }
  }

  importScreens(newScreens, replace = false) {
    if (!newScreens || newScreens.length === 0) return;
    const formatted = newScreens.map((s, idx) => ({
      id: 'screen-' + Date.now() + '-' + idx,
      name: s.name || `Screen ${idx + 1}`,
      width: Math.max(16, parseInt(s.width, 10) || 1920),
      height: Math.max(16, parseInt(s.height, 10) || 1080),
      cabinetW: Math.max(8, parseInt(s.cabinetW, 10) || 192),
      cabinetH: Math.max(8, parseInt(s.cabinetH, 10) || 192),
      moduleDivisions: Math.max(1, parseInt(s.moduleDivisions, 10) || 2),
      notes: s.notes || ''
    }));

    const screens = replace ? formatted : [...this.state.screens, ...formatted];
    this.set({ screens, activeScreenId: formatted[0].id });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const callback of this.subscribers) {
      try {
        callback(this.state);
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    }
  }

  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveToStorage();
    this.notify();
  }
}

export const store = new StateStore();

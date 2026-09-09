/**
 * Real-time Pixel Peeper HUD
 * Displays exact cursor coordinates, physical cabinet index, and current zoom.
 */

export class PixelPeeper {
  constructor(hudEl, viewportController, stateStore) {
    this.hudEl = hudEl;
    this.viewportController = viewportController;
    this.stateStore = stateStore;

    this.coordsEl = hudEl.querySelector('#hud-coords');
    this.tileEl = hudEl.querySelector('#hud-tile');
    this.zoomEl = hudEl.querySelector('#hud-zoom');

    this.initEvents();
  }

  initEvents() {
    const canvasEl = this.viewportController.canvasEl;

    window.addEventListener('mousemove', (e) => {
      const { x, y } = this.viewportController.clientToCanvasCoords(e.clientX, e.clientY);
      const screen = this.stateStore.getActiveScreen();
      const w = screen.width;
      const h = screen.height;

      if (x >= 0 && x < w && y >= 0 && y < h) {
        this.coordsEl.textContent = `X: ${x.toString().padStart(4, '0')}, Y: ${y.toString().padStart(4, '0')}`;

        const cabW = Math.max(8, screen.cabinetW || 192);
        const cabH = Math.max(8, screen.cabinetH || 192);
        const col = Math.floor(x / cabW) + 1;
        const row = Math.floor(y / cabH) + 1;
        const div = Math.max(1, screen.moduleDivisions || 2);
        const modCol = Math.floor((x % cabW) / (cabW / div)) + 1;
        const modRow = Math.floor((y % cabH) / (cabH / div)) + 1;

        this.tileEl.textContent = `Cab: [${col}, ${row}] • Mod: [${modCol}, ${modRow}]`;
        this.hudEl.classList.remove('outside');
      } else {
        this.coordsEl.textContent = `X: ----, Y: ----`;
        this.tileEl.textContent = `Outside Canvas`;
        this.hudEl.classList.add('outside');
      }
    });
  }

  updateZoomBadge(scale) {
    const percent = Math.round(scale * 100);
    this.zoomEl.textContent = `${percent}%`;
  }
}

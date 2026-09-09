/**
 * Interactive Viewport Engine: Pan & Zoom
 * Supports smooth trackpad pinch / scroll wheel zooming (10% to 3200%),
 * Space+Drag panning, and guarantees raw nearest-neighbor pixelated rendering.
 */

export class ViewportController {
  constructor(viewportEl, canvasWrapperEl, canvasEl, onTransformChange) {
    this.viewportEl = viewportEl;
    this.canvasWrapperEl = canvasWrapperEl;
    this.canvasEl = canvasEl;
    this.onTransformChange = onTransformChange;

    this.scale = 1;
    this.panX = 0;
    this.panY = 0;

    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.isSpacePressed = false;

    this.initEvents();
  }

  initEvents() {
    // Wheel / Pinch Zoom
    this.viewportEl.addEventListener('wheel', (e) => {
      e.preventDefault();

      const rect = this.viewportEl.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.ctrlKey ? 0.05 : 0.0015;
      const delta = -e.deltaY * zoomFactor;
      const oldScale = this.scale;
      
      let newScale = this.scale * Math.exp(delta);
      // Clamp scale between 5% and 3200% (32x)
      newScale = Math.max(0.05, Math.min(32.0, newScale));

      // Zoom toward cursor position
      this.panX = mouseX - (mouseX - this.panX) * (newScale / oldScale);
      this.panY = mouseY - (mouseY - this.panY) * (newScale / oldScale);
      this.scale = newScale;

      this.updateTransform();
    }, { passive: false });

    // Drag / Pan Mouse Events
    this.viewportEl.addEventListener('mousedown', (e) => {
      // Pan on middle click, or left click with Space, or left click directly on viewport background
      if (e.button === 1 || (e.button === 0 && (this.isSpacePressed || e.target === this.viewportEl))) {
        this.isDragging = true;
        this.dragStartX = e.clientX - this.panX;
        this.dragStartY = e.clientY - this.panY;
        this.viewportEl.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.dragStartX;
      this.panY = e.clientY - this.dragStartY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.viewportEl.style.cursor = this.isSpacePressed ? 'grab' : 'default';
      }
    });

    // Spacebar Key Handling for Pan
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isSpacePressed && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        this.isSpacePressed = true;
        this.viewportEl.style.cursor = 'grab';
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isSpacePressed = false;
        if (!this.isDragging) {
          this.viewportEl.style.cursor = 'default';
        }
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.updateTransform();
    });
  }

  fitToScreen(canvasWidth, canvasHeight) {
    const rect = this.viewportEl.getBoundingClientRect();
    const pad = 60; // Padding around canvas
    const availW = Math.max(100, rect.width - pad * 2);
    const availH = Math.max(100, rect.height - pad * 2);

    const scaleX = availW / canvasWidth;
    const scaleY = availH / canvasHeight;
    this.scale = Math.min(1.0, Math.min(scaleX, scaleY));

    // Center canvas in viewport
    this.panX = (rect.width - canvasWidth * this.scale) / 2;
    this.panY = (rect.height - canvasHeight * this.scale) / 2;

    this.updateTransform();
  }

  setZoom(newScale) {
    const rect = this.viewportEl.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const oldScale = this.scale;

    this.scale = Math.max(0.05, Math.min(32.0, newScale));
    this.panX = centerX - (centerX - this.panX) * (this.scale / oldScale);
    this.panY = centerY - (centerY - this.panY) * (this.scale / oldScale);

    this.updateTransform();
  }

  updateTransform() {
    this.canvasWrapperEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    if (this.onTransformChange) {
      this.onTransformChange(this.scale, this.panX, this.panY);
    }
  }

  clientToCanvasCoords(clientX, clientY) {
    const rect = this.canvasEl.getBoundingClientRect();
    const scale = this.scale;
    const x = Math.floor((clientX - rect.left) / scale);
    const y = Math.floor((clientY - rect.top) / scale);
    return { x, y };
  }
}

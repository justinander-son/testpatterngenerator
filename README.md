# Disguise Test Pattern Generator
### Offline-First, Pixel-Perfect Test Pattern & Pixel Map Generator for LED Walls & Projection Surfaces

Designed specifically for **Disguise (d3) Direct Mapping**, where 1 exported PNG corresponds to 1 LED screen or projection surface.

---

## Quick Start on macOS

Simply double-click the **`start_mac.command`** script in this folder.
It starts an offline local server and opens the application in your default browser.

Alternatively, run from terminal:
```bash
./start_mac.command
```
Or with Python directly:
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080` in Chrome, Safari, or Arc.

---

## Key Features

1. **Disguise Direct Mapping Alignment**:
   * **1-Pixel Outer Perimeter Line**: Detects overscan, scaling, or edge cropping on media server outputs immediately.
   * **Corner & Edge Crop Ticks**: High-visibility $L$-brackets at the extreme corners.
   * **Physical LED Cabinet & Module Grids**: Fully customizable tile dimensions (e.g. 192×192, 176×176, 256×256) with module subdivisions (dashed/dotted lines) and coordinate callouts.
   * **Geometric Diagnostics**: Concentric circles (verifies non-square pixel stretch), corner-to-corner diagonal 'X', and center target reticle with coordinate badge.
   * **High-Contrast Disguise Metadata Plaque**: Clearly displays Screen Name, Project, Resolution, Aspect Ratio, Cabinet Math ($Cols \times Rows$), Date, and Lead Tech.

2. **CSV Screen Import & Batch ZIP Generation**:
   * **Drag-and-Drop or Paste**: Drop any `.csv` or `.tsv` file (or paste directly from Excel / Google Sheets).
   * Automatically recognizes headers: `Name`, `Width`, `Height`, `Cabinet W`, `Cabinet H`, `Notes`.
   * Downloadable sample CSV directly inside the import modal.
   * **Multi-Screen Queue Drawer**: Easily cycle between screens at the bottom of the workstation to preview and fine-tune each pattern.
   * **1-Click "Export All (ZIP)"**: Generates all screens in the queue at their native uncompressed resolution and downloads a neatly packaged `.zip` file with Disguise-ready naming (`[Project]_[ScreenName]_[WxH].png`).

3. **Interactive Pixel Peeper (1:1 Nearest-Neighbor Zoom)**:
   * Smooth trackpad pinch / mousewheel zoom from **10% up to 3200% (32×)**.
   * Nearest-neighbor rendering (`image-rendering: pixelated`) prevents browser bilinear smoothing, guaranteeing absolute 1:1 pixel sharpness.
   * Real-time floating HUD showing exact cursor pixel coordinates `X: [x], Y: [y]` and active physical cabinet/module indices `Cab: [C, R] • Mod: [c, r]`.

4. **100% Offline-First**:
   * Zero external dependencies. Uses a vendored `jszip.min.js`.
   * No accounts, no logins, no cloud tracking.
   * Settings and screens automatically persist in your browser's local storage.

---

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`Space + Drag`** | Pan canvas around viewport |
| **`Z` or `F`** | Fit canvas to screen |
| **`1`** | Reset to 100% zoom (1:1 pixel view) |
| **`4`** | Zoom to 400% magnification |
| **`Cmd + E`** | Export active screen to lossless PNG |
| **`Cmd + B`** | Batch export all screens to ZIP |

---

## Sample CSV Format

```csv
Screen Name,Width,Height,Cabinet W,Cabinet H,Modules,Notes
Upstage Main Wall,3840,2160,192,192,2,Brompton SX40 Ports 1-4
Stage Left Wing,1920,1080,192,192,2,Brompton S8 Port 1-2
Stage Right Wing,1920,1080,192,192,2,Brompton S8 Port 3-4
DJ Riser Front,2048,512,128,128,2,Helix Processor
Overhead Portal Arch,3440,720,192,192,2,NovaStar MX40
Floor Center Pod,1024,1024,256,256,2,Black Marble 4mm
```

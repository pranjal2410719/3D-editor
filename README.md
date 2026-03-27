# 🎬 Three.js Scene Simulator

A standalone, professional-grade visual editor to find the perfect camera angles and model transforms for your production projects. 

## 🚀 Quick Start

1. **Serve the folder**: Since this uses ES Modules, it must be run on a local server.
   ```bash
   # If you have Node.js installed:
   npx serve .
   ```
   Then open `http://localhost:3000/scene-simulator/` in your browser.

2. **Import your model**:
   - Open the simulator in the browser.
   - Click **Import Model**.
   - Use **Single File** for a `.glb`.
   - Use **GLTF Folder** for a `.gltf` package so relative textures and `.bin` assets load correctly.

## 🎮 Controls

### 🖱 Interaction
- **Left Click + Drag**: Rotate Camera (Orbit)
- **Right Click + Drag**: Pan Camera
- **Scroll**: Zoom In/Out
- **Gizmos**: Click and drag the arrows/rings/squares on the model to move/rotate/scale it.

### ⌨ Keyboard Shortcuts
- **[T]**: Translate (Move) Mode
- **[R]**: Rotate Mode
- **[S]**: Scale Mode
- **[F]**: Fit Camera to Model
- **[C]**: Open Capture Panel
- **[Esc]**: Close UI Panels

## 🛠 Features

- **Transform Gizmos**: Move, rotate, and scale your model visually.
- **Model Import**: Bring in your own `.glb` or `.gltf` asset directly from the UI.
- **Auto-Frame**: "Fit View" uses the model's bounding box and camera FOV to perfectly frame it.
- **Frustum Helper**: Visualize the camera's sight lines and clipping planes.
- **Live Debug UI**: Every value (position, rotation, FOV) is visible and tweakable in the `lil-gui` panel.
- **Capture & Export**: Click **Capture** to get ready-to-use JSON or a Three.js code snippet you can copy directly into your production code.
- **Save/Load**: Save your composition as a `.json` file and reload it later.

## 📦 Integration

Once you've found the perfect look:
1. Click the **Capture** button.
2. Select the **Three.js Code** tab.
3. Copy the code into your project's initialization logic.

---
*Built for precision 3D engineering.*

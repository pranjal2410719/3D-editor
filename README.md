# 🎬 Three.js Editor

A standalone, professional-grade visual editor with a stunning glassmorphism UI to find the perfect camera angles and model transforms for your Three.js production projects. 

## 🌐 Deployed Website

**Live Demo:** [Pending Deployment / Insert Link Here]

*To deploy your own instance quickly, you can use Vercel, Netlify, or Surge.*
```bash
# Example: Deploying with Surge (must have Node.js installed)
npx surge ./ --domain your-threejs-editor.surge.sh
```

## 🚀 Quick Start

1. **Serve the folder**: Since this uses ES Modules, it must be run on a local server.
   ```bash
   # If you have Node.js installed:
   npx serve .
   ```
   Then open `http://localhost:3000` in your browser.

2. **Import your model**:
   - Open the editor in your browser.
   - Click **File** under Scene Setup to upload a `.glb` object.
   - Click **Folder** if your `.gltf` model includes a directory of outer texture files and `.bin` assets.

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

- **Intuitive UI:** A beautifully crafted, responsive dark-mode interface built with Tailwind CSS.
- **Transform Gizmos**: Move, rotate, and scale your model visually.
- **Model Import**: Bring in your own `.glb` or `.gltf` asset directly from the UI.
- **Auto-Frame**: "Fit View" uses the model's bounding box and camera FOV to perfectly frame it.
- **Frustum Helper**: Visualize the camera's sight lines and clipping planes.
- **Live Debug UI**: Every value (position, rotation, FOV) is visible and tweakable in the `lil-gui` panel over an isolated container.
- **Capture & Export**: Click **Capture** to get ready-to-use JSON or a Three.js code snippet you can copy directly into your production code.
- **Save/Load**: Save your composition as a `.json` file and reload it later.

## 📦 Integration

Once you've found the perfect look:
1. Click the **Capture** button under File Operations.
2. Select the **Three.js Snippet** tab.
3. Click "Copy Code" to grab the generated initialization logic.
4. Paste the code into your production application.

---
*Built for precision 3D engineering.*

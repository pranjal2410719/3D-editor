# Nexus — WebGL Scene Editor

I got tired of guessing camera values in Three.js.

Every time I worked on a 3D scene, it was the same loop:

→ Move the camera → Refresh → Adjust values → Repeat…

And animations? Writing GSAP timelines without seeing the result first felt like pure trial-and-error.

So I built something to fix that.

**Nexus** is a WebGL Scene Editor for frontend developers — a workspace where you can *see everything* before writing a single line of code.

🔗 **Live Demo:** [https://3edits.netlify.app/](https://3edits.netlify.app/)
💻 **GitHub:** [https://github.com/pranjal2410719/3D-editor](https://github.com/pranjal2410719/3D-editor)

---

## 🖼 Preview

**Landing Page**

![Landing Page](./assets/Screenshot%20from%202026-03-27%2022-12-17.png)

**Simulation Workspace**

![Simulation Page](./assets/Screenshot%20from%202026-03-27%2023-17-41.png)

**Demo**

<video src="./assets/Screencast from 2026-03-27 23-03-22.webm" controls width="100%"></video>

> Can't play the video above? [Download the demo](./assets/Screencast%20from%202026-03-27%2023-03-22.webm)

---

## What it does

- Visually position your camera → export exact coordinates
- Adjust transforms in real-time with gizmos
- Export production-ready configs + boilerplate code
- Save and reload your compositions as `.json`

It turns **"guess → tweak → reload"** into **"design → export → ship"**.

This isn't a 3D viewer. It's an **Animation IDE for the modern web.**

---

## 🚀 Quick Start

Since this uses ES Modules, it must be served over HTTP:

```bash
npx serve .
```

Then open `http://localhost:3000`.

**Import your model:**
- Click **Import Model** → **Single File** for `.glb`
- Click **GLTF Folder** when your `.gltf` depends on textures or `.bin` files

---

## 🎮 Controls

| Input | Action |
|---|---|
| Left Click + Drag | Orbit camera |
| Right Click + Drag | Pan camera |
| Scroll | Zoom |
| Gizmo arrows/rings | Move / Rotate / Scale model |

**Keyboard shortcuts:**

| Key | Action |
|---|---|
| `T` | Translate mode |
| `R` | Rotate mode |
| `S` | Scale mode |
| `F` | Fit camera to model |
| `C` | Open Capture panel |
| `Esc` | Close panels |

---

## 📦 Exporting to your project

1. Click **Capture** in the File Operations panel
2. Switch to the **Three.js Snippet** tab
3. Hit **Copy Code** and paste it directly into your production app

---

## 🛠 Features

- **Transform Gizmos** — move, rotate, scale visually
- **Auto-Frame** — fits the camera perfectly using the model's bounding box
- **Frustum Helper** — visualize camera sight lines and clipping planes
- **Wireframe & BBox toggles** — inspect geometry at any time
- **Live Inspector** — every camera and model value is tweakable via `lil-gui`
- **Save / Load** — persist your scene composition as `.json`
- **Glassmorphism UI** — built with Tailwind CSS, dark mode only

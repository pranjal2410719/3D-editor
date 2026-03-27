/**
 * scene-simulator/js/main.js
 * ─────────────────────────────────────────────────────────────────
 * Entry point. Bootstraps all modules and wires them together.
 * Drop this entire `scene-simulator/` folder into any project and
 * open index.html with a local server (e.g. `npx serve .`).
 * ─────────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import GUI from 'lil-gui';

import { createScene }      from './modules/scene.js';
import { createCamera }     from './modules/camera.js';
import { createRenderer }   from './modules/renderer.js';
import { createLights }     from './modules/lights.js';
import { createHelpers }    from './modules/helpers.js';
import { importModelFiles } from './modules/loader.js';
import { buildGUI }         from './modules/gui.js';
import { CaptureManager }   from './modules/capture.js';
import { ToolbarController }from './modules/toolbar.js';
import { FrustumHelper }    from './modules/frustumHelper.js';
import { fitCameraToModel, focusOnModel } from './modules/frameUtils.js';
import { TimelineManager }  from './modules/timeline.js';

// ── Core objects (shared state) ──────────────────────────────────
const canvas   = document.getElementById('simulator-canvas');
const container = document.getElementById('canvas-container') || document.body;
const getW = () => container.clientWidth;
const getH = () => container.clientHeight;

const modelFileInput = document.getElementById('model-file-input');
const modelFolderInput = document.getElementById('model-folder-input');
const startupPanel = document.getElementById('startup-panel');
const importPanel = document.getElementById('import-panel');
const primaryImportBtn = document.getElementById('btn-import-primary');
const importFileBtn = document.getElementById('btn-import-file');
const importFolderBtn = document.getElementById('btn-import-folder');
const closeImportPanelBtn = document.getElementById('btn-close-import-panel');
const scene    = createScene();
const camera   = createCamera(getW(), getH());
const renderer = createRenderer(canvas, getW(), getH());

// Lights
createLights(scene);

// Helpers (grid + axes)
const helpers = createHelpers(scene);

// Controls
const orbitControls     = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.06;

const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.addEventListener('dragging-changed', (e) => {
  orbitControls.enabled = !e.value;
});
scene.add(transformControls.getHelper());

// State
const state = {
  model:           null,
  modelBBox:       new THREE.Box3(),
  modelCenter:     new THREE.Vector3(),
  wireframe:       false,
  bboxVisible:     false,
  bboxHelper:      null,
  frustumVisible:  false,
  transformMode:   'translate',   // 'translate' | 'rotate' | 'scale'
};

// Frustum helper (wraps camera helper for a secondary preview cam)
const frustumHelperModule = new FrustumHelper(scene, camera);

function triggerImport() {
  importPanel.classList.remove('hidden');
}

function closeImportPanel() {
  importPanel.classList.add('hidden');
}

async function handleImportedFiles(fileList) {
  const imported = await importModelFiles(fileList, scene, state, transformControls, (model) => {
    console.log('[Simulator] Model loaded:', model);
    fitCameraToModel(camera, orbitControls, state.modelBBox);
  });

  if (imported) {
    startupPanel.classList.add('hidden');
    closeImportPanel();
    
    // Update Hierarchy Label
    const status = document.getElementById('model-status');
    if (status) status.textContent = state.model?.name || 'Model loaded';
  }
}

async function handleInputChange(event) {
  const files = event.target.files;
  if (files?.length) {
    await handleImportedFiles(files);
  }
  event.target.value = '';
}

modelFileInput.addEventListener('change', handleInputChange);
modelFolderInput.addEventListener('change', handleInputChange);

primaryImportBtn.addEventListener('click', triggerImport);
importFileBtn.addEventListener('click', () => modelFileInput.click());
importFolderBtn.addEventListener('click', () => modelFolderInput.click());
closeImportPanelBtn.addEventListener('click', closeImportPanel);

// ── GUI (lil-gui) ────────────────────────────────────────────────
const gui = new GUI({ 
  container: document.getElementById('contextual-props'),
  title: '⚙ Scene Params',
  touchStyles: false 
});
const guiState = buildGUI(gui, camera, orbitControls, state);

// ── Capture manager ──────────────────────────────────────────────
const capture = new CaptureManager(camera, orbitControls, state);

// ── Timeline manager ──────────────────────────────────────────────
const timeline = new TimelineManager(camera, orbitControls, state);

// ── Toolbar ──────────────────────────────────────────────────────
const toolbar = new ToolbarController({
  transformControls,
  orbitControls,
  camera,
  state,
  scene,
  capture,
  timeline,
  frustumHelperModule,
  fitCameraToModel,
  focusOnModel,
  triggerImport,
});

// ── FPS tracking ──────────────────────────────────────────────────
const fpsEl = document.getElementById('fps-counter');
let lastTime = performance.now();
let frames   = 0;

// ── Render loop ───────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();
  frustumHelperModule.update();

  // Sync GUI values from live camera / model
  guiState.sync(camera, orbitControls, state);

  renderer.render(scene, camera);

  // FPS counter
  frames++;
  const now = performance.now();
  if (now - lastTime >= 500) {
    if (fpsEl) fpsEl.textContent = `${Math.round(frames / ((now - lastTime) / 1000))} FPS`;
    frames   = 0;
    lastTime = now;
  }

  // Sync Timeline Playhead visual
  const playhead = document.getElementById('playhead');
  if (playhead && timeline) {
    const kfs = timeline.getKeyframes();
    if (kfs.length > 1) {
      const progress = (timeline.activeIndex || 0) / (kfs.length - 1);
      playhead.style.left = `${progress * 100}%`;
    } else {
      playhead.style.left = '0%';
    }
  }
}
animate();

// ── Resize handler ────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const w = getW();
  const h = getH();
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ── Keyboard shortcuts ────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'INPUT') return;
  switch (e.key.toLowerCase()) {
    case 't': toolbar.setTransformMode('translate'); break;
    case 'r': toolbar.setTransformMode('rotate');    break;
    case 's': toolbar.setTransformMode('scale');     break;
    case 'f': fitCameraToModel(camera, orbitControls, state.modelBBox); break;
    case 'c': toolbar.openCapture(); break;
    case 'escape':
      toolbar.closeCapture();
      closeImportPanel();
      break;
  }
});

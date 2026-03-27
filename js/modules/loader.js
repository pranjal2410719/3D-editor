/**
 * modules/loader.js
 * ─────────────────────────────────────────────────────────────────
 * Imports user-selected GLTF/GLB files, resolves local asset references,
 * centres the model via bounding box, and attaches it to TransformControls.
 * ─────────────────────────────────────────────────────────────────
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function importModelFiles(files, scene, state, transformControls, onLoaded) {
  const selectedFiles = Array.from(files ?? []);
  const entryFile = selectedFiles.find((file) => /\.(glb|gltf)$/i.test(file.name));

  if (!entryFile) {
    _setStatus('MODEL: SELECT A .GLB OR .GLTF FILE', '#f74f6b');
    return false;
  }

  const loadingOverlay = createLoadingOverlay(`Importing ${entryFile.name}…`);
  _setStatus('MODEL: IMPORTING...', '#f7c14f');

  const objectUrls = [];
  const fileUrlMap = new Map();
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => resolveFileUrl(url, selectedFiles, fileUrlMap, objectUrls));

  try {
    const payload = await readFile(entryFile);
    const loader = new GLTFLoader(manager);
    const model = await parseModel(loader, payload);

    clearCurrentModel(scene, state, transformControls);
    _prepareModel(model, scene, state, transformControls);

    _setStatus(`MODEL: READY (${entryFile.name})`, '#4ff7a1');
    console.log(`[Loader] Imported model: ${entryFile.name}`);
    onLoaded?.(model);
    return true;
  } catch (err) {
    console.error('[Loader] Failed to import model:', err);
    const importHint = /\.gltf$/i.test(entryFile.name) ? ' - TRY GLTF FOLDER' : '';
    _setStatus(`MODEL: IMPORT FAILED (${entryFile.name})${importHint}`, '#f74f6b');
    return false;
  } finally {
    removeLoadingOverlay(loadingOverlay);
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }
}

// ── Internal helpers ──────────────────────────────────────────────

function clearCurrentModel(scene, state, transformControls) {
  transformControls.detach();

  if (state.model) {
    scene.remove(state.model);
    disposeObject3D(state.model);
    state.model = null;
  }

  if (state.bboxHelper) {
    scene.remove(state.bboxHelper);
    state.bboxHelper.geometry?.dispose?.();
    state.bboxHelper.material?.dispose?.();
    state.bboxHelper = null;
  }

  state.modelBBox.makeEmpty();
  state.modelCenter.set(0, 0, 0);
}

function _prepareModel(model, scene, state, transformControls) {
  // Enable shadows on every mesh
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow    = true;
      child.receiveShadow = true;
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => {
          if (material) material.wireframe = state.wireframe;
        });
      } else if (child.material) {
        child.material.wireframe = state.wireframe;
      }
    }
  });

  // Centre at world origin via bounding box
  const bbox   = new THREE.Box3().setFromObject(model);
  const centre = new THREE.Vector3();
  bbox.getCenter(centre);
  model.position.sub(centre);

  scene.add(model);

  // Update shared state
  state.model       = model;
  state.modelBBox   = new THREE.Box3().setFromObject(model);
  state.modelCenter = new THREE.Vector3();
  state.modelBBox.getCenter(state.modelCenter);

  if (state.bboxVisible) {
    state.bboxHelper = new THREE.Box3Helper(state.modelBBox.clone(), 0x4f8ef7);
    scene.add(state.bboxHelper);
  }

  transformControls.attach(model);
}

function createLoadingOverlay(label = 'Loading model…') {
  const div = document.createElement('div');
  div.id        = 'loading-overlay';
  div.innerHTML = `
    <div class="loader-ring"></div>
    <p>${label}</p>
  `;
  document.body.appendChild(div);
  return div;
}

function removeLoadingOverlay(el) {
  el.classList.add('fade-out');
  setTimeout(() => el.remove(), 600);
}

function _setStatus(text, color) {
  const statusEl = document.getElementById('model-status');
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = color;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error ?? new Error(`Failed to read ${file.name}`));
    reader.onload = () => resolve(reader.result);

    if (/\.gltf$/i.test(file.name)) {
      reader.readAsText(file);
      return;
    }

    reader.readAsArrayBuffer(file);
  });
}

function parseModel(loader, payload) {
  return new Promise((resolve, reject) => {
    loader.parse(payload, '', (gltf) => resolve(gltf.scene), reject);
  });
}

function resolveFileUrl(url, files, fileUrlMap, objectUrls) {
  if (/^(https?:|blob:|data:)/i.test(url)) return url;

  const normalizedUrl = decodeURIComponent(url.split('?')[0]).replace(/\\/g, '/').replace(/^\.\//, '');
  const urlLeaf = normalizedUrl.split('/').pop();
  const match = files.find((file) => {
    const relative = (file.webkitRelativePath || file.name).replace(/\\/g, '/');
    return relative === normalizedUrl || relative.endsWith(`/${normalizedUrl}`) || file.name === urlLeaf;
  });

  if (!match) return url;
  if (fileUrlMap.has(match)) return fileUrlMap.get(match);

  const objectUrl = URL.createObjectURL(match);
  fileUrlMap.set(match, objectUrl);
  objectUrls.push(objectUrl);
  return objectUrl;
}

function disposeObject3D(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;

    child.geometry?.dispose?.();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material?.dispose?.());
  });
}

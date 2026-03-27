/**
 * modules/gui.js
 * ─────────────────────────────────────────────────────────────────
 * Builds the lil-gui panel with three folders:
 *   • Camera  – position + target (read-only, sync from live state)
 *   • Model   – position, rotation, scale (two-way bound)
 *   • Display – fog, grid, axes toggles
 *
 * Returns a `{ sync() }` object to call each frame.
 * ─────────────────────────────────────────────────────────────────
 */
import * as THREE from 'three';

export function buildGUI(gui, camera, orbitControls, state) {

  // ── Proxy objects (lil-gui reads/writes these) ─────────────────
  const camProxy = {
    posX: 0, posY: 0, posZ: 0,
    targetX: 0, targetY: 0, targetZ: 0,
    fov: camera.fov,
  };

  const modelProxy = {
    posX: 0, posY: 0, posZ: 0,
    rotX: 0, rotY: 0, rotZ: 0,
    scaleX: 1, scaleY: 1, scaleZ: 1,
  };

  const displayProxy = {
    fog: true,
    grid: true,
    axes: true,
  };

  // ── Camera folder ──────────────────────────────────────────────
  const camFolder = gui.addFolder('📷 Camera');
  camFolder.add(camProxy, 'posX', -100, 100, 0.01).name('pos X').listen().onChange(applyCameraTransform);
  camFolder.add(camProxy, 'posY', -100, 100, 0.01).name('pos Y').listen().onChange(applyCameraTransform);
  camFolder.add(camProxy, 'posZ', -100, 100, 0.01).name('pos Z').listen().onChange(applyCameraTransform);
  camFolder.add(camProxy, 'targetX', -20, 20, 0.01).name('target X').listen().onChange(applyCameraTransform);
  camFolder.add(camProxy, 'targetY', -20, 20, 0.01).name('target Y').listen().onChange(applyCameraTransform);
  camFolder.add(camProxy, 'targetZ', -20, 20, 0.01).name('target Z').listen().onChange(applyCameraTransform);
  camFolder.add(camProxy, 'fov', 1, 175, 1).name('FOV').onChange((v) => {
    camera.fov = v;
    camera.updateProjectionMatrix();
  });
  camFolder.open();

  function applyCameraTransform() {
    camera.position.set(camProxy.posX, camProxy.posY, camProxy.posZ);
    orbitControls.target.set(camProxy.targetX, camProxy.targetY, camProxy.targetZ);
    orbitControls.update();
  }

  // ── Model folder ───────────────────────────────────────────────
  const modelFolder = gui.addFolder('📦 Model');

  const posFolder = modelFolder.addFolder('Position');
  posFolder.add(modelProxy, 'posX', -20, 20, 0.001).name('X').listen().onChange(applyModelTransform);
  posFolder.add(modelProxy, 'posY', -20, 20, 0.001).name('Y').listen().onChange(applyModelTransform);
  posFolder.add(modelProxy, 'posZ', -20, 20, 0.001).name('Z').listen().onChange(applyModelTransform);

  const rotFolder = modelFolder.addFolder('Rotation (deg)');
  rotFolder.add(modelProxy, 'rotX', -360, 360, 0.1).name('X').listen().onChange(applyModelTransform);
  rotFolder.add(modelProxy, 'rotY', -360, 360, 0.1).name('Y').listen().onChange(applyModelTransform);
  rotFolder.add(modelProxy, 'rotZ', -360, 360, 0.1).name('Z').listen().onChange(applyModelTransform);

  const sclFolder = modelFolder.addFolder('Scale');
  const uniformScale = { all: 1 };
  sclFolder.add(uniformScale, 'all', 0.001, 10, 0.001).name('Uniform').listen().onChange((v) => {
    modelProxy.scaleX = modelProxy.scaleY = modelProxy.scaleZ = v;
    applyModelTransform();
  });
  sclFolder.add(modelProxy, 'scaleX', 0.001, 10, 0.001).name('X').listen().onChange(applyModelTransform);
  sclFolder.add(modelProxy, 'scaleY', 0.001, 10, 0.001).name('Y').listen().onChange(applyModelTransform);
  sclFolder.add(modelProxy, 'scaleZ', 0.001, 10, 0.001).name('Z').listen().onChange(applyModelTransform);
  modelFolder.open();

  // ── Display folder ─────────────────────────────────────────────
  // (Display toggles are wired in toolbar.js; we expose the proxy)
  gui.addFolder('🌐 Display');   // stub – filled by toolbar

  // ── Apply model transform from proxy → actual model ────────────
  function applyModelTransform() {
    const m = state.model;
    if (!m) return;
    m.position.set(modelProxy.posX, modelProxy.posY, modelProxy.posZ);
    m.rotation.set(
      THREE.MathUtils.degToRad(modelProxy.rotX),
      THREE.MathUtils.degToRad(modelProxy.rotY),
      THREE.MathUtils.degToRad(modelProxy.rotZ)
    );
    m.scale.set(modelProxy.scaleX, modelProxy.scaleY, modelProxy.scaleZ);
    // Refresh bbox in state
    if (state.bboxHelper) {
      state.bboxHelper.box.setFromObject(m);
    }
  }

  // ── Sync proxy ← live scene (called every frame) ───────────────
  function sync(cam, orbit) {
    // Camera pos
    camProxy.posX = +cam.position.x.toFixed(4);
    camProxy.posY = +cam.position.y.toFixed(4);
    camProxy.posZ = +cam.position.z.toFixed(4);
    // Orbit target
    camProxy.targetX = +orbit.target.x.toFixed(4);
    camProxy.targetY = +orbit.target.y.toFixed(4);
    camProxy.targetZ = +orbit.target.z.toFixed(4);

    // Model (only sync when not being dragged by TransformControls to avoid flicker)
    const m = state.model;
    if (m) {
      modelProxy.posX = +m.position.x.toFixed(4);
      modelProxy.posY = +m.position.y.toFixed(4);
      modelProxy.posZ = +m.position.z.toFixed(4);
      modelProxy.rotX = +THREE.MathUtils.radToDeg(m.rotation.x).toFixed(2);
      modelProxy.rotY = +THREE.MathUtils.radToDeg(m.rotation.y).toFixed(2);
      modelProxy.rotZ = +THREE.MathUtils.radToDeg(m.rotation.z).toFixed(2);
      modelProxy.scaleX = +m.scale.x.toFixed(4);
      modelProxy.scaleY = +m.scale.y.toFixed(4);
      modelProxy.scaleZ = +m.scale.z.toFixed(4);
    }
  }

  return { sync, modelProxy, camProxy, displayProxy };
}

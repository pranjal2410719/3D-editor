/**
 * modules/frameUtils.js
 * ─────────────────────────────────────────────────────────────────
 * Utility functions for camera framing helpers:
 *   • fitCameraToModel  – auto-frame to model bounding box
 *   • focusOnModel      – smoothly orbit camera to face model center
 * ─────────────────────────────────────────────────────────────────
 */
import * as THREE from 'three';

/**
 * Auto-frame the camera so the entire model fills the view.
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {OrbitControls}           controls
 * @param {THREE.Box3}              bbox    - model's world bounding box
 * @param {number}                  padding - extra margin factor (default 1.3)
 */
export function fitCameraToModel(camera, controls, bbox, padding = 1.3) {
  if (!bbox || bbox.isEmpty()) return;

  const size   = new THREE.Vector3();
  const center = new THREE.Vector3();
  bbox.getSize(size);
  bbox.getCenter(center);

  const maxDim   = Math.max(size.x, size.y, size.z);
  const fovRad   = THREE.MathUtils.degToRad(camera.fov);
  const distance = (maxDim / (2 * Math.tan(fovRad / 2))) * padding;

  // Maintain current look direction but pull back to fit
  const direction = new THREE.Vector3()
    .subVectors(camera.position, controls.target)
    .normalize();

  camera.position.copy(center).addScaledVector(direction, distance);
  controls.target.copy(center);
  controls.update();
}

/**
 * Smoothly pan the orbit target to the model's center.
 * The camera distance is preserved.
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {OrbitControls}           controls
 * @param {THREE.Vector3}           center  - model center in world space
 */
export function focusOnModel(camera, controls, center) {
  if (!center) return;

  // Offset camera so it keeps its current distance
  const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
  camera.position.copy(center).add(offset);
  controls.target.copy(center);
  controls.update();
}

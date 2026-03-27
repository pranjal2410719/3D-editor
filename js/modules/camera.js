/**
 * modules/camera.js – Creates and returns the PerspectiveCamera
 */
import * as THREE from 'three';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    60,                                       // FOV (degrees)
    window.innerWidth / window.innerHeight,   // Aspect ratio
    0.01,                                     // Near clipping plane
    5000                                      // Far clipping plane
  );
  camera.position.set(3, 2, 5);
  return camera;
}

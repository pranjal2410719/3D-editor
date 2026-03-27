/**
 * modules/lights.js – Adds ambient + hemisphere + directional lights
 */
import * as THREE from 'three';

export function createLights(scene) {
  // Soft ambient fill
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // Hemisphere sky/ground light for natural colour shift
  const hemi = new THREE.HemisphereLight(0x8ab4f8, 0x2a2a40, 0.6);
  scene.add(hemi);

  // Primary directional (sun)
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 10, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far  = 200;
  sun.shadow.camera.left   = -20;
  sun.shadow.camera.right  =  20;
  sun.shadow.camera.top    =  20;
  sun.shadow.camera.bottom = -20;
  sun.shadow.bias = -0.0001;
  scene.add(sun);

  // Rim/back light for depth
  const rim = new THREE.DirectionalLight(0x4f8ef7, 0.5);
  rim.position.set(-5, 3, -7);
  scene.add(rim);

  return { ambient, hemi, sun, rim };
}

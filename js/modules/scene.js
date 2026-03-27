/**
 * modules/scene.js – Creates and returns the Three.js Scene
 */
import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  // Subtle dark gradient background
  scene.background = new THREE.Color(0x0b0d12);
  // Optional fog for depth
  scene.fog = new THREE.FogExp2(0x0b0d12, 0.008);
  return scene;
}

/**
 * modules/helpers.js – GridHelper + AxesHelper
 */
import * as THREE from 'three';

export function createHelpers(scene) {
  // Grid: 20×20 cells at 1-unit spacing
  const grid = new THREE.GridHelper(20, 20, 0x1e243a, 0x1e243a);
  grid.material.opacity    = 0.6;
  grid.material.transparent = true;
  scene.add(grid);

  // Axes: X=red, Y=green, Z=blue
  const axes = new THREE.AxesHelper(2);
  scene.add(axes);

  return { grid, axes };
}

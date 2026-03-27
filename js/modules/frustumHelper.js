/**
 * modules/frustumHelper.js
 * ─────────────────────────────────────────────────────────────────
 * Renders a visual camera frustum using a secondary "spy" camera
 * that is positioned offset from the main camera, plus a
 * CameraHelper that shows the main camera's view frustum.
 *
 * Call update() each frame.
 * ─────────────────────────────────────────────────────────────────
 */
import * as THREE from 'three';

export class FrustumHelper {
  /**
   * @param {THREE.Scene}             scene
   * @param {THREE.PerspectiveCamera} mainCamera  - The camera to visualise
   */
  constructor(scene, mainCamera) {
    this.scene      = scene;
    this.mainCamera = mainCamera;

    // CameraHelper mirrors the frustum of mainCamera
    this._helper = new THREE.CameraHelper(mainCamera);
    this._helper.visible = false;
    scene.add(this._helper);
  }

  /** Toggle visibility */
  setVisible(visible) {
    this._helper.visible = visible;
  }

  /** Must be called every frame to keep the helper in sync */
  update() {
    if (this._helper.visible) {
      this._helper.update();
    }
  }

  dispose() {
    this.scene.remove(this._helper);
    this._helper.dispose();
  }
}

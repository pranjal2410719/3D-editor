/**
 * modules/toolbar.js
 * ─────────────────────────────────────────────────────────────────
 * Wires all bottom-toolbar buttons and keyboard shortcuts.
 * Handles: transform mode switching, wireframe, bounding box,
 *           frustum, fit/focus, capture, save/load.
 * ─────────────────────────────────────────────────────────────────
 */
import * as THREE from 'three';

export class ToolbarController {
  constructor({ transformControls, orbitControls, camera, state, scene, capture, frustumHelperModule, fitCameraToModel, focusOnModel, triggerImport }) {
    this.tc              = transformControls;
    this.orbit           = orbitControls;
    this.camera          = camera;
    this.state           = state;
    this.scene           = scene;
    this.capture         = capture;
    this.frustumModule   = frustumHelperModule;
    this._fitCamera      = fitCameraToModel;
    this._focusOnModel   = focusOnModel;
    this._triggerImport  = triggerImport;
    this.modeLabel       = document.getElementById('mode-label');

    this._init();
  }

  // ── Public ──────────────────────────────────────────────────────

  setTransformMode(mode) {
    this.tc.setMode(mode);
    this.state.transformMode = mode;
    this._updateToolbarActive(mode);
    this.modeLabel.textContent = `MODE: ${mode.toUpperCase()}`;
  }

  openCapture()  { this.capture.open(); }
  closeCapture() { this.capture.close(); }

  // ── Private ─────────────────────────────────────────────────────

  _init() {
    this._btn('btn-import').addEventListener('click', () => this._triggerImport?.());

    // Transform mode
    this._btn('btn-translate').addEventListener('click', () => this.setTransformMode('translate'));
    this._btn('btn-rotate').addEventListener('click',    () => this.setTransformMode('rotate'));
    this._btn('btn-scale').addEventListener('click',     () => this.setTransformMode('scale'));
    this.setTransformMode('translate'); // default

    // Fit / Focus
    this._btn('btn-fit').addEventListener('click', () => {
      this._fitCamera(this.camera, this.orbit, this.state.modelBBox);
    });
    this._btn('btn-focus').addEventListener('click', () => {
      this._focusOnModel(this.camera, this.orbit, this.state.modelCenter);
    });

    // Wireframe toggle
    this._btn('btn-wireframe').addEventListener('click', () => {
      this.state.wireframe = !this.state.wireframe;
      this._btn('btn-wireframe').classList.toggle('active', this.state.wireframe);
      if (this.state.model) {
        this.state.model.traverse((child) => {
          if (child.isMesh) {
            child.material.wireframe = this.state.wireframe;
          }
        });
      }
    });

    // Bounding box toggle
    this._btn('btn-bbox').addEventListener('click', () => {
      this.state.bboxVisible = !this.state.bboxVisible;
      this._btn('btn-bbox').classList.toggle('active', this.state.bboxVisible);

      if (this.state.bboxVisible) {
        if (!this.state.bboxHelper && this.state.model) {
          const bbox = new THREE.Box3().setFromObject(this.state.model);
          this.state.bboxHelper = new THREE.Box3Helper(bbox, 0x4f8ef7);
          this.scene.add(this.state.bboxHelper);
        } else if (this.state.bboxHelper) {
          this.state.bboxHelper.visible = true;
        }
      } else if (this.state.bboxHelper) {
        this.state.bboxHelper.visible = false;
      }
    });

    // Frustum / camera helper toggle
    this._btn('btn-frustum').addEventListener('click', () => {
      this.state.frustumVisible = !this.state.frustumVisible;
      this._btn('btn-frustum').classList.toggle('active', this.state.frustumVisible);
      this.frustumModule.setVisible(this.state.frustumVisible);
    });

    // Capture
    this._btn('btn-capture').addEventListener('click', () => this.capture.open());
    this._btn('btn-save').addEventListener('click',    () => this.capture.save());
    this._btn('btn-load').addEventListener('click',    () => this.capture.triggerLoad());
  }

  _btn(id) { return document.getElementById(id); }

  _updateToolbarActive(mode) {
    ['translate', 'rotate', 'scale'].forEach((m) => {
      document.getElementById(`btn-${m}`)?.classList.toggle('active', m === mode);
    });
  }
}

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
  constructor({ transformControls, orbitControls, camera, state, scene, capture, timeline, frustumHelperModule, fitCameraToModel, focusOnModel, triggerImport }) {
    this.tc              = transformControls;
    this.orbit           = orbitControls;
    this.camera          = camera;
    this.state           = state;
    this.scene           = scene;
    this.capture         = capture;
    this.timeline        = timeline;
    this.frustumModule   = frustumHelperModule;
    this._fitCamera      = fitCameraToModel;
    this._focusOnModel   = focusOnModel;
    this._triggerImport  = triggerImport;
    this.modeLabel       = document.getElementById('mode-label');
    this.keyframeCountEl = document.getElementById('keyframe-count');
    this.keyframeListEl  = document.getElementById('keyframe-list');
    this.playTimelineBtn = document.getElementById('btn-play-timeline');
    this.resetTimelineBtn = document.getElementById('btn-reset-timeline');
    this.rulerEl         = document.getElementById('timeline-ruler');

    this._init();
  }

  // ── Public ──────────────────────────────────────────────────────

  setTransformMode(mode) {
    this.tc.setMode(mode);
    this.state.transformMode = mode;
    this._updateToolbarActive(mode);
    this.modeLabel.textContent = `MODE: ${mode.toUpperCase()}`;
  }

  openCapture()  { 
    const code = this.timeline ? this.timeline.generateGSAPCode() : '';
    this.capture.open(code); 
  }
  closeCapture() { this.capture.close(); }

  // ── Private ─────────────────────────────────────────────────────

  _init() {
    this._btn('btn-import').addEventListener('click', () => this._triggerImport?.());

    // Timeline bindings
    if (this._btn('btn-add-keyframe')) {
      this._btn('btn-add-keyframe').addEventListener('click', () => {
        const count = this.timeline.addKeyframe();
        this._updateTimelineUI();
        const btn = this._btn('btn-add-keyframe');
        const orig = btn.innerHTML;
        btn.innerHTML = `<span class="text-emerald-700 font-bold tracking-widest text-[10px] uppercase">Added!</span>`;
        setTimeout(() => btn.innerHTML = orig, 1000);
      });
      this._btn('btn-clear-timeline').addEventListener('click', () => {
        this.timeline.clear();
        this._updateTimelineUI();
      });
    }

    this.playTimelineBtn?.addEventListener('click', () => {
      this.timeline.togglePlayback(() => this._updateTimelineUI());
      this._updateTimelineUI();
    });

    this.resetTimelineBtn?.addEventListener('click', () => {
      this.timeline.stopPlayback(true);
      this.timeline.applyKeyframe(0);
      this._updateTimelineUI();
    });

    this.rulerEl?.addEventListener('click', (e) => {
      if (this.timeline.keyframes.length < 2) return;
      const rect = this.rulerEl.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const index = Math.round(pct * (this.timeline.keyframes.length - 1));
      this.timeline.applyKeyframe(index);
      this._updateTimelineUI();
    });

    this.keyframeListEl?.addEventListener('click', (event) => {
      if (this.timeline.isPlaying) {
        this.timeline.stopPlayback();
      }

      const removeBtn = event.target.closest('[data-remove-keyframe]');
      if (removeBtn) {
        const index = Number(removeBtn.dataset.removeKeyframe);
        this.timeline.removeKeyframe(index);
        this._updateTimelineUI();
        return;
      }

      const jumpBtn = event.target.closest('[data-keyframe-index]');
      if (jumpBtn) {
        const index = Number(jumpBtn.dataset.keyframeIndex);
        this.timeline.applyKeyframe(index);
        this._updateTimelineUI();
      }
    });

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
    this._btn('btn-capture').addEventListener('click', () => this.openCapture());
    this._btn('btn-save').addEventListener('click',    () => this.capture.save());
    this._btn('btn-load').addEventListener('click',    () => this.capture.triggerLoad());

    this._updateTimelineUI();
  }

  _btn(id) { return document.getElementById(id); }

  _updateToolbarActive(mode) {
    ['translate', 'rotate', 'scale'].forEach((m) => {
      document.getElementById(`btn-${m}`)?.classList.toggle('active', m === mode);
    });
  }

  _updateTimelineUI() {
    const keyframes = this.timeline?.getKeyframes() ?? [];
    if (this.keyframeCountEl) {
      this.keyframeCountEl.textContent = `${keyframes.length} frames`;
    }

    if (this.playTimelineBtn) {
      const disabled = keyframes.length < 2;
      this.playTimelineBtn.disabled = disabled;
      this.playTimelineBtn.title = disabled ? 'Add at least 2 keyframes to play' : (this.timeline.isPlaying ? 'Stop timeline' : 'Play timeline');
      this.playTimelineBtn.className = this.timeline.isPlaying
        ? 'w-10 relative flex items-center justify-center rounded-xl border border-red-400/20 bg-red-500/15 text-red-300 transition-all hover:bg-red-500/25 hover:text-white active:scale-[0.98] group'
        : 'w-10 relative flex items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/15 text-emerald-300 transition-all hover:bg-emerald-500/25 hover:text-white active:scale-[0.98] group';

      if (disabled) {
        this.playTimelineBtn.className += ' opacity-40 cursor-not-allowed hover:bg-emerald-500/15 hover:text-emerald-300';
      }

      this.playTimelineBtn.innerHTML = this.timeline.isPlaying
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"></path></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>';
    }

    if (!this.keyframeListEl) return;
    const count = keyframes.length;

    if (count === 0) {
      this.keyframeListEl.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 11px;">
          No keyframes recorded in this session. Add at least two to begin sequence.
        </div>
      `;
      return;
    }

    const segments = Math.max(count - 1, 1);
    
    // Modern Multitrack Layout
    let html = `
      <div style="display: flex; flex-direction: column; gap: 4px; padding: 12px 0;">
        ${this._renderTrackRow('Camera', keyframes, (i) => i / segments)}
        ${keyframes[0]?.model ? this._renderTrackRow('Model Pos', keyframes, (i) => i / segments) : ''}
        ${keyframes[0]?.model ? this._renderTrackRow('Model Rot', keyframes, (i) => i / segments) : ''}
      </div>
    `;
    
    this.keyframeListEl.innerHTML = html;
  }

  _renderTrackRow(label, keyframes, getProgress) {
    const markers = keyframes.map((kf, i) => {
      const active = i === this.timeline.activeIndex;
      const left = getProgress(i) * 100;
      return `
        <div 
          class="keyframe ${active ? 'active' : ''}" 
          style="position: absolute; left: ${left}%; top: 50%; width: 10px; height: 10px; background: ${active ? '#fcd34d' : '#fff'}; transform: translate(-50%, -50%) rotate(45deg); cursor: pointer; border: 1px solid rgba(0,0,0,0.5); z-index: 50;"
          data-keyframe-index="${i}"
          title="Jump to frame ${i + 1}"
        ></div>
      `;
    }).join('');

    return `
      <div class="track-row" style="position: relative; height: 28px; display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.02);">
        <span class="track-label" style="position: absolute; left: 32px; font-size: 10px; color: var(--text-muted); z-index: 10; pointer-events: none; opacity: 0.6;">${label}</span>
        <div class="track-line" style="position: absolute; left: 0; right: 0; height: 1px; background: rgba(255,255,255,0.05);"></div>
        ${markers}
      </div>
    `;
  }

  _describeKeyframe(keyframe) {
    const cam = keyframe.camera.position;
    const model = keyframe.model;
    const cameraSummary = `Cam ${cam.x}, ${cam.y}, ${cam.z}`;

    if (!model) return `${cameraSummary} • No model`;

    const pos = model.position;
    return `${cameraSummary} • Model ${pos.x}, ${pos.y}, ${pos.z}`;
  }
}

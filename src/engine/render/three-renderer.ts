// three-renderer.ts — Three.js renderer backend for WebOn3D engine.
// Deno-friendly (imports via import_map.json or esm.sh)

import * as THREE from "three";
import { IRenderSystem } from "./render-system.ts";

interface RendererConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  pixelRatio?: number;
  fov?: number;
  near?: number;
  far?: number;
}

export class ThreeWebRenderSystem implements IRenderSystem {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  constructor(cfg: RendererConfig) {
    this.canvas = cfg.canvas;
    this.width = cfg.width;
    this.height = cfg.height;

    // Renderer (can be swapped later for WebGPU)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });

    this.renderer.setPixelRatio(cfg.pixelRatio ?? window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    const fov = cfg.fov ?? 60;
    const near = cfg.near ?? 0.1;
    const far = cfg.far ?? 2000;

    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      near,
      far,
    );

    this.camera.position.set(0, 2, 5);
    this.scene.add(this.camera);

    // Basic lighting
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(5, 10, 7);
    this.scene.add(light);
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

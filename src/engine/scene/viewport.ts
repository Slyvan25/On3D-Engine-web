// viewport.ts — Defines the region of the screen a camera renders into.
// Future-proofed for split-screen or minimaps.

import { SceneCamera } from "./camera.ts";
import { IRenderSystem } from "../render/render-system.ts";

export class Viewport {
  private camera: SceneCamera | null = null;

  left = 0;
  top = 0;
  width = 1;
  height = 1;

  constructor(private renderSystem: IRenderSystem) {}

  setCamera(cam: SceneCamera) {
    this.camera = cam;
  }

  setDimensions(left: number, top: number, width: number, height: number) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  getCamera() {
    return this.camera;
  }
}

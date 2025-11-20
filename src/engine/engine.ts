// engine.ts
// High-level entry point that wires the render system, scene graph,
// avatar manager, and optional resource handling together.

import { IRenderSystem } from "./render/render-system.ts";
import { ThreeWebRenderSystem } from "./render/three-renderer.ts";
import { WebGPURenderSystem, WebGPURendererConfig } from "./render/webgpu-renderer.ts";
import { WebSceneManager } from "./scene/scene-manager.ts";
import { ResourceManager } from "./resource/resource-manager.ts";
import { AvatarManager } from "./avatar/avatar-manager.ts";
import { WebGameSceneManager } from "./game/game-scene.ts";
import type { SceneLoadOptions } from "./types/Scene.ts";
import type { AvatarOptions } from "./avatar/avatar.ts";

export type RendererKind = "three" | "webgpu";

export interface EngineConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  renderer?: RendererKind;
}

export class WebOn3DEngine {
  renderSystem: IRenderSystem;
  sceneManager: WebSceneManager;
  resourceManager: ResourceManager | null = null;
  avatarManager: AvatarManager;
  gameSceneManager: WebGameSceneManager;

  private running = false;
  private lastTime = 0;

  private constructor(renderSystem: IRenderSystem) {
    this.renderSystem = renderSystem;
    this.sceneManager = new WebSceneManager(this.renderSystem);
    this.avatarManager = new AvatarManager(this.sceneManager);
    this.gameSceneManager = new WebGameSceneManager(this.sceneManager);
  }

  static async create(config: EngineConfig): Promise<WebOn3DEngine> {
    const { canvas, width, height, renderer = "three" } = config;

    let renderSystem: IRenderSystem;

    if (renderer === "webgpu") {
      const webgpuCfg: WebGPURendererConfig = { canvas, width, height };
      renderSystem = await WebGPURenderSystem.create(webgpuCfg);
    } else {
      renderSystem = new ThreeWebRenderSystem({
        canvas,
        width,
        height,
        pixelRatio: globalThis.devicePixelRatio ?? 1,
      });
    }

    return new WebOn3DEngine(renderSystem);
  }

  /**
   * Optional: attach a .pack for resource loading.
   */
  async loadPack(url: string) {
    this.resourceManager = await ResourceManager.fromPackUrl(url);
  }

  async loadScene(opts: SceneLoadOptions) {
    await this.gameSceneManager.loadScene(opts);
  }

  createAvatar(opts: AvatarOptions) {
    return this.avatarManager.createAvatar(opts);
  }

  start(onUpdate?: (dt: number) => void) {
    this.running = true;
    this.lastTime = performance.now();

    const loop = (time: number) => {
      if (!this.running) return;
      const dt = (time - this.lastTime) / 1000;
      this.lastTime = time;

      this.sceneManager.update(dt);
      onUpdate?.(dt);
      this.sceneManager.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }
}

export default WebOn3DEngine;

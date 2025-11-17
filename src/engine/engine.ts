// import { IEngine, EngineFrameHooks } from "./types/Engine.ts";
// import { EngineConfig } from "./types/EngineConfig.ts";

// import { WebSceneManager } from "./scene/scene-manager.ts";
// import { AvatarManager as WebAvatarManager } from "./avatar/avatar-manager.ts";
// import { WebGameSceneManager } from "./game/game-scene.ts";
// // render imports
// import { IRenderSystem } from "./render/render-system.ts";
// import { ThreeWebRenderSystem } from "./render/three-renderer.ts";
// import {
//   WebGPURendererConfig,
//   WebGPURenderSystem,
// } from "./render/webgpu-renderer.ts";
// import { ISceneManager, SceneLoadOptions } from "./types/Scene.ts";
// import { AvatarCreateOptions, IAvatarManager } from "./types/IAvatarManager.ts";

// export class WebOn3DEngine implements IEngine {
//   renderSystem: IRenderSystem;
//   sceneManager: WebSceneManager;
//   avatarManager: IAvatarManager;
//   gameSceneManager: WebGameSceneManager;

//   private running = false;
//   private lastTime = 0;

//   // ---------------------------------------------------------------------------
//   // Construction
//   // ---------------------------------------------------------------------------

//   // Private constructor: use WebOn3DEngine.create(...)
//   private constructor(renderSystem: IRenderSystem, _config: EngineConfig) {
//     this.renderSystem = renderSystem;

//     // Scene + gameplay systems
//     this.sceneManager = new WebSceneManager(this.renderSystem);
//     this.avatarManager = new WebAvatarManager(this.sceneManager);
//     this.gameSceneManager = new WebGameSceneManager(this.sceneManager);
//   }

//   /**
//    * Async factory that sets up the chosen renderer (Three.js or WebGPU),
//    * then wires together all engine subsystems.
//    */
//   static async create(config: EngineConfig): Promise<WebOn3DEngine> {
//     const { canvas, width, height, renderer = "three" } = config;

//     let renderSystem: IRenderSystem;

//     if (renderer === "webgpu") {
//       const webgpuCfg: WebGPURendererConfig = {
//         canvas,
//         width,
//         height,
//       };
//       renderSystem = await WebGPURenderSystem.create(webgpuCfg);
//     } else {
//       renderSystem = new ThreeWebRenderSystem({
//         canvas,
//         width,
//         height,
//         pixelRatio: globalThis.devicePixelRatio ?? 1,
//       });
//     }

//     return new WebOn3DEngine(renderSystem, config);
//   }

//   // ---------------------------------------------------------------------------
//   // Scene / avatar API
//   // ---------------------------------------------------------------------------

//   async loadScene(opts: SceneLoadOptions): Promise<void> {
//     return this.gameSceneManager.loadScene(opts);
//   }

//   createAvatar(opts: AvatarCreateOptions) {
//     return this.avatarManager.createAvatar(opts);
//   }

//   // ---------------------------------------------------------------------------
//   // Main loop
//   // ---------------------------------------------------------------------------

//   start(hooks: EngineFrameHooks = {}): void {
//     this.running = true;
//     this.lastTime = performance.now();

//     const loop = (time: number) => {
//       if (!this.running) return;

//       const deltaMs = time - this.lastTime;
//       this.lastTime = time;
//       const dt = deltaMs / 1000;

//       // Update scene / game logic
//       this.sceneManager.update(dt);
//       hooks.onUpdate?.(dt);

//       // Render frame
//       this.sceneManager.render();

//       requestAnimationFrame(loop);
//     };

//     requestAnimationFrame(loop);
//   }

//   stop(): void {
//     this.running = false;
//   }
// }

// export default WebOn3DEngine;
// engine.ts
// Pure WebOn3DEngine: no game logic, no automatic scene loading.
// Just: renderSystem + sceneManager + (optional) resourceManager.

import { IRenderSystem } from "./render/render-system.ts";
import { ThreeWebRenderSystem } from "./render/three-renderer.ts";
import { WebGPURenderSystem, WebGPURendererConfig } from "./render/webgpu-renderer.ts";
import { WebSceneManager } from "./scene/scene-manager.ts";
import { ResourceManager } from "./resource/resource-manager.ts";
import { PackReader } from "./resource/pack-reader.ts";

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

  private running = false;
  private lastTime = 0;

  private constructor(renderSystem: IRenderSystem) {
    this.renderSystem = renderSystem;
    this.sceneManager = new WebSceneManager(this.renderSystem);
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
    const pack = await PackReader.load(url);
    this.resourceManager = new ResourceManager(pack);
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

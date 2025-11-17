// game-scene.ts
// High-level scene loader for your game. Wraps:
// - PackReader
// - ResourceManager
// - SceneBuilder
// - MeshBuilder
// - MaterialBuilder

import { SceneLoadOptions } from "../types/Scene.ts";
import { WebSceneManager } from "../scene/scene-manager.ts";

import { PackReader } from "../resource/pack-reader.ts";
import { ResourceManager } from "../resource/resource-manager.ts";

import { MeshBuilder } from "../resource/builders/mesh-builder.ts";
import { MaterialBuilder } from "../resource/builders/material-builder.ts";
import { SceneBuilder } from "../resource/builders/scene-builder.ts";

export interface IGameSceneManager {
  loadScene(options: SceneLoadOptions): Promise<void>;
}

export class WebGameSceneManager implements IGameSceneManager {
  private sceneManager: WebSceneManager;

  private pack: PackReader | null = null;
  private resources: ResourceManager | null = null;
  private sceneBuilder: SceneBuilder | null = null;

  constructor(sceneManager: WebSceneManager) {
    this.sceneManager = sceneManager;
  }

  async loadPack(url: string) {
    this.pack = await PackReader.load(url);
    this.resources = new ResourceManager(this.pack);

    const matBuilder = new MaterialBuilder();
    const meshBuilder = new MeshBuilder(matBuilder, this.resources);
    this.sceneBuilder = new SceneBuilder(this.resources, meshBuilder);
  }

  async loadScene(options: SceneLoadOptions): Promise<void> {
    if (!this.resources || !this.sceneBuilder) {
      throw new Error(
        "GameSceneManager: Pack not loaded. Call loadPack('/packs/data.pack') first.",
      );
    }

    const sceneFile = options.sceneFile ?? options.mapFile;
    if (!sceneFile) {
      throw new Error("SceneLoadOptions requires sceneFile or mapFile");
    }

    // Load scene data from .pack
    const data = this.resources.loadScene(sceneFile);

    // Build into the scene graph
    this.sceneBuilder.build(data.root, this.sceneManager.root);

    // Progress callback
    options.onProgress?.(0, 1, 0);
  }
}

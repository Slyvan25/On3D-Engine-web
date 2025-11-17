// resource-manager.ts
// Central cache + loader for pack-backed resources.

import type { PackFile } from "./pack.ts";
import { PackReader } from "./pack.ts";
import { MaterialLoader, type MaterialData } from "./loaders/material-loader.ts";
import { MeshLoader, type MeshData } from "./loaders/mesh-loader.ts";
import { SceneLoader, type SceneData } from "./loaders/scene-loader.ts";
import { CollisionLoader, type CollisionMesh } from "./loaders/collision-loader.ts";

export class ResourceManager {
  private pack: PackFile | null;

  private materials = new Map<string, MaterialData>();
  private meshes = new Map<string, MeshData>();
  private scenes = new Map<string, SceneData>();
  private collisions = new Map<string, CollisionMesh>();

  constructor(pack: PackFile | null) {
    this.pack = pack;
  }

  static async fromPackUrl(url: string): Promise<ResourceManager> {
    const pack = await PackReader.load(url);
    return new ResourceManager(pack);
  }

  private requirePack(): PackFile {
    if (!this.pack) {
      throw new Error("ResourceManager: no pack has been loaded yet.");
    }
    return this.pack;
  }

  private readFile(path: string): ArrayBuffer {
    const pack = this.requirePack();
    const data = PackReader.getFile(pack, path);
    if (!data) {
      throw new Error(`ResourceManager: file not found in pack: ${path}`);
    }
    return data;
  }

  /**
   * Low-level helper for systems that need raw buffers (e.g. metadata readers).
   */
  getFileBuffer(path: string): ArrayBuffer {
    return this.readFile(path);
  }

  loadMaterial(path: string): MaterialData {
    if (!this.materials.has(path)) {
      const buffer = this.readFile(path);
      this.materials.set(path, MaterialLoader.parse(buffer));
    }
    return this.materials.get(path)!;
  }

  loadMesh(path: string): MeshData {
    if (!this.meshes.has(path)) {
      const buffer = this.readFile(path);
      this.meshes.set(path, MeshLoader.parse(buffer));
    }
    return this.meshes.get(path)!;
  }

  loadScene(path: string): SceneData {
    if (!this.scenes.has(path)) {
      const buffer = this.readFile(path);
      this.scenes.set(path, SceneLoader.parse(buffer));
    }
    return this.scenes.get(path)!;
  }

  loadCollision(path: string): CollisionMesh {
    if (!this.collisions.has(path)) {
      const buffer = this.readFile(path);
      this.collisions.set(path, CollisionLoader.parse(buffer));
    }
    return this.collisions.get(path)!;
  }
}

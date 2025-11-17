// // resource-manager.ts
// // Central cache for meshes, materials, scenes, collision, textures.

// import { PackReader } from "./pack-reader.ts";
// import { MaterialLoader, MaterialData } from "./loaders/material-loader.ts";
// import { MeshLoader, MeshData } from "./loaders/mesh-loader.ts";
// import { SceneLoader, SceneData } from "./loaders/scene-loader.ts";
// import { CollisionLoader, CollisionMesh } from "./loaders/collision-loader.ts";

// export class ResourceManager {
//   constructor(private pack: PackReader) {}

//   materials = new Map<string, MaterialData>();
//   meshes = new Map<string, MeshData>();
//   scenes = new Map<string, SceneData>();
//   collisions = new Map<string, CollisionMesh>();

//   loadMaterial(path: string): MaterialData {
//     if (!this.materials.has(path)) {
//       const buf = this.pack.getFile(path);
//       this.materials.set(path, MaterialLoader.parse(buf));
//     }
//     return this.materials.get(path)!;
//   }

//   loadMesh(path: string): MeshData {
//     if (!this.meshes.has(path)) {
//       const buf = this.pack.getFile(path);
//       this.meshes.set(path, MeshLoader.parse(buf));
//     }
//     return this.meshes.get(path)!;
//   }

//   loadScene(path: string): SceneData {
//     if (!this.scenes.has(path)) {
//       const buf = this.pack.getFile(path);
//       this.scenes.set(path, SceneLoader.parse(buf));
//     }
//     return this.scenes.get(path)!;
//   }

//   loadCollision(path: string): CollisionMesh {
//     if (!this.collisions.has(path)) {
//       const buf = this.pack.getFile(path);
//       this.collisions.set(path, CollisionLoader.parse(buf));
//     }
//     return this.collisions.get(path)!;
//   }
// }
// src/engine/resource/resource-manager.ts

import type { PackFile } from "./pack.ts";
import { PackReader } from "./pack.ts";
import type { MeshFile } from "./mesh.ts";
import { MeshLoader } from "./mesh.ts";
import type { MaterialFile } from "./material.ts";
import { MaterialParser } from "./material.ts";
import type { SceneFile } from "./scene-format.ts";
import { SceneSerializer } from "./scene-format.ts";
import type { CollisionFile } from "./collision.ts";
import { CollisionLoader } from "./collision.ts";

export class ResourceManager {
  private pack: PackFile | null;

  constructor(pack: PackFile | null) {
    this.pack = pack;
  }

  static async fromPackUrl(url: string): Promise<ResourceManager> {
    const pack = await PackReader.load(url);
    return new ResourceManager(pack);
  }

  getRawFile(name: string): ArrayBuffer | null {
    if (!this.pack) return null;
    return PackReader.getFile(this.pack, name);
  }

  async loadMesh(name: string): Promise<MeshFile | null> {
    const buf = this.getRawFile(name);
    if (!buf) return null;
    return MeshLoader.parse(buf);
  }

  async loadMaterial(name: string): Promise<MaterialFile | null> {
    const buf = this.getRawFile(name);
    if (!buf) return null;
    const text = new TextDecoder("utf-8").decode(buf);
    return MaterialParser.parse(text);
  }

  async loadScene(name: string): Promise<SceneFile | null> {
    const buf = this.getRawFile(name);
    if (!buf) return null;
    const text = new TextDecoder("utf-8").decode(buf);

    // If original .scene is text, use native parser; otherwise swap to binary.
    return SceneSerializer.parseNative(text);
  }

  async loadCollision(name: string): Promise<CollisionFile | null> {
    const buf = this.getRawFile(name);
    if (!buf) return null;
    return CollisionLoader.parse(buf);
  }
}

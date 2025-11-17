import { writable } from "svelte/store";
import type { PackFile } from "@engine/resource/pack.ts";
import type { MaterialFile } from "@engine/resource/material.ts";
import type { MeshFile } from "@engine/resource/mesh.ts";
import type { SceneFile } from "@engine/resource/scene-format.ts";
import type { CollisionFile } from "@engine/resource/collision.ts";
import { PackReader } from "../../../engine/resource/pack";
import { ResourceManager } from "../../../engine/resource/resource-manager";

export interface EditorResources {
  pack: PackFile | null;
  resourceManager: ResourceManager | null;

  scenes: string[];
  materials: string[];
  meshes: string[];
  collisions: string[];
}

const initial: EditorResources = {
  pack: null,
  resourceManager: null,

  scenes: [],
  materials: [],
  meshes: [],
  collisions: [],
};

export const resourceStore = writable<EditorResources>(initial);

export async function loadPackFromFile(file: File) {
  const buf = await file.arrayBuffer();
  const pack = PackReader.parse(buf);
  const res = new ResourceManager(pack);

  const entries = pack.entries;

  const byExtension = (ext: string) =>
    entries
      .filter((e) => e.name.toLowerCase().endsWith(ext))
      .map((e) => e.name);

  const scenes = byExtension(".scene");
  const materials = byExtension(".material");
  const meshes = byExtension(".mesh");
  const collisions = byExtension(".collision");

  resourceStore.set({
    pack,
    resourceManager: res,
    scenes,
    materials,
    meshes,
    collisions,
  });
}

import { writable } from "svelte/store";
import type { PackEntryHeader, PackFile } from "@engine/resource/pack.ts";
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
  files: string[];
  tree: AssetFolder;
}

export type AssetNode = AssetFolder | AssetFile;

export interface AssetFolder {
  type: "folder";
  name: string;
  path: string;
  children: AssetNode[];
}

export interface AssetFile {
  type: "file";
  name: string;
  path: string;
  extension: string;
}

function createFolder(path: string, name?: string): AssetFolder {
  return {
    type: "folder",
    name: name ?? (path ? path.split("/").pop() ?? "" : ""),
    path,
    children: [],
  };
}

const emptyTree = () => createFolder("");

const initial: EditorResources = {
  pack: null,
  resourceManager: null,

  scenes: [],
  materials: [],
  meshes: [],
  collisions: [],
  files: [],
  tree: emptyTree(),
};

export const resourceStore = writable<EditorResources>(initial);

export async function loadPackFromFile(file: File) {
  const buf = await file.arrayBuffer();
  const pack = PackReader.parse(buf);
  const res = new ResourceManager(pack);

  const entries = pack.entries;

  const toPath = (entry: PackEntryHeader) => entry.path || entry.name;

  const byExtension = (ext: string) =>
    entries
      .filter((e) => toPath(e).toLowerCase().endsWith(ext))
      .map((e) => toPath(e));

  const scenes = byExtension(".scene");
  const materials = byExtension(".material");
  const meshes = byExtension(".mesh");
  const collisions = byExtension(".collision");
  const files = entries.map(toPath);

  const tree = buildAssetTree(entries);

  resourceStore.set({
    pack,
    resourceManager: res,
    scenes,
    materials,
    meshes,
    collisions,
    files,
    tree,
  });
}

function buildAssetTree(entries: PackEntryHeader[]): AssetFolder {
  const root = createFolder("");
  for (const entry of entries) {
    const fullPath = (entry.path || entry.name).replace(/\\/g, "/");
    const segments = fullPath.split("/").filter((part) => part.length > 0);
    const fileName = segments.pop();
    if (!fileName) continue;

    let cursor = root;
    let currentPath = "";
    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      let next = cursor.children.find(
        (child): child is AssetFolder => child.type === "folder" && child.name === segment,
      );
      if (!next) {
        next = createFolder(currentPath, segment);
        cursor.children.push(next);
      }
      cursor = next;
    }

    const extension = fileName.includes(".")
      ? `.${fileName.split(".").pop()!.toLowerCase()}`
      : "";

    const existingIndex = cursor.children.findIndex(
      (child) => child.type === "file" && child.path === fullPath,
    );
    if (existingIndex !== -1) {
      cursor.children[existingIndex] = {
        type: "file",
        name: fileName,
        path: fullPath,
        extension,
      };
      continue;
    }

    cursor.children.push({
      type: "file",
      name: fileName,
      path: fullPath,
      extension,
    });
  }

  sortTree(root);
  return root;
}

function sortTree(folder: AssetFolder) {
  folder.children.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === "folder" ? -1 : 1;
  });

  for (const child of folder.children) {
    if (child.type === "folder") {
      sortTree(child);
    }
  }
}

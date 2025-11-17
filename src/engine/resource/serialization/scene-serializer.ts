// scene-serializer.ts
// Convert SceneNode tree <-> serializable SceneData structure.

import type { SceneNode } from "../../scene/scene-node.ts";
import type { SceneData, SceneNodeData } from "../loaders/scene-loader.ts";
import { Vector3 } from "../../core/math.ts";

export interface SceneFile extends SceneData {
  name?: string;
}

/**
 * SceneSerializer: purely structural (no pack/mesh assumptions).
 * Editor is free to save/load this JSON to disk.
 */
export class SceneSerializer {
  static createEmpty(name = "Untitled"): SceneFile {
    return {
      name,
      root: {
        name: "root",
        position: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        mesh: undefined,
        children: [],
      },
    };
  }

  static serialize(root: SceneNode): SceneFile {
    return {
      name: root.name ?? "scene",
      root: this.serializeNode(root),
    };
  }

  private static serializeNode(node: SceneNode): SceneNodeData {
    const pos = node.object3D.position;
    const rot = node.object3D.rotation;
    const scl = node.object3D.scale;

    const data: SceneNodeData = {
      name: node.name ?? "",
      position: new Vector3(pos.x, pos.y, pos.z),
      rotation: new Vector3(rot.x, rot.y, rot.z),
      scale: new Vector3(scl.x, scl.y, scl.z),
      mesh: undefined,  // extend later if you bind meshes
      children: [],
    };

    for (const child of node.object3D.children) {
      const childNode = (child as any).__sceneNodeRef as SceneNode | undefined;
      if (!childNode) continue;
      data.children.push(this.serializeNode(childNode));
    }

    return data;
  }

  /**
   * Wipe children of root and rebuild from file.root
   */
  static deserialize(file: SceneFile, root: SceneNode) {
    root.object3D.clear();
    this.buildNode(file.root, root);
  }

  private static buildNode(data: SceneNodeData, parent: SceneNode) {
    // root is already created, so for top level we just apply transforms
    const node = parent.name === data.name ? parent : new (parent.constructor as any)(data.name);

    if (node !== parent) {
      parent.attach(node);
    }

    node.object3D.position.set(data.position.x, data.position.y, data.position.z);
    node.object3D.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    node.object3D.scale.set(data.scale.x, data.scale.y, data.scale.z);

    for (const child of data.children) {
      this.buildNode(child, node);
    }
  }
}

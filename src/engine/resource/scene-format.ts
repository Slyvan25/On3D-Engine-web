// src/engine/resource/scene-format.ts

import type { SceneNode } from "../scene/scene-node.ts";
import { Vector3 } from "../core/math.ts";

export interface SceneNodeData {
  name: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  meshName?: string;
  children: SceneNodeData[];
}

export interface SceneFile {
  name?: string;
  root: SceneNodeData;
}

export class SceneSerializer {
  static createEmpty(name = "Untitled"): SceneFile {
    return {
      name,
      root: {
        name: "root",
        position: new Vector3(0, 0, 0),
        rotation: new Vector3(0, 0, 0),
        scale: new Vector3(1, 1, 1),
        children: [],
      },
    };
  }

  static fromSceneGraph(rootNode: SceneNode): SceneFile {
    return {
      name: rootNode.name ?? "scene",
      root: this.nodeToData(rootNode),
    };
  }

  private static nodeToData(node: SceneNode): SceneNodeData {
    const pos = node.object3D.position;
    const rot = node.object3D.rotation;
    const scl = node.object3D.scale;

    const data: SceneNodeData = {
      name: node.name ?? "",
      position: new Vector3(pos.x, pos.y, pos.z),
      rotation: new Vector3(rot.x, rot.y, rot.z),
      scale: new Vector3(scl.x, scl.y, scl.z),
      meshName: undefined,
      children: [],
    };

    for (const child of node.object3D.children) {
      const childNode = (child as any).__sceneNodeRef as SceneNode | undefined;
      if (!childNode) continue;
      data.children.push(this.nodeToData(childNode));
    }

    return data;
  }

  static applyToScene(rootData: SceneNodeData, rootNode: SceneNode) {
    rootNode.object3D.clear();
    this.buildNode(rootData, rootNode);
  }

  private static buildNode(data: SceneNodeData, parent: SceneNode) {
    const ctor = parent.constructor as any;
    const node =
      parent.name === data.name && parent.name !== "root"
        ? parent
        : new ctor(data.name);

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

  // ---------- Text / native format hooks ----------

  /**
   * JSON helper used by editor.
   */
  static toJson(scene: SceneFile): string {
    return JSON.stringify(scene, null, 2);
  }

  static fromJson(json: string): SceneFile {
    const obj = JSON.parse(json);
    // Optionally validate here.
    return obj;
  }

  /**
   * Hook for qpang native .scene syntax.
   * Implement once you've examined qpang-toolkit's parser.
   */
  static parseNative(text: string): SceneFile {
    // TODO: port qpang .scene parser from qpang-toolkit
    console.warn("SceneSerializer.parseNative is a stub – port from qpang-toolkit");
    return this.createEmpty();
  }

  static toNativeText(scene: SceneFile): string {
    // TODO: implement text emitter compatible with qpang-toolkit's .scene writer (if any)
    console.warn("SceneSerializer.toNativeText is a stub – port from qpang-toolkit");
    return this.toJson(scene);
  }
}

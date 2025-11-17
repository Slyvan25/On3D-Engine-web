// scene-loader.ts
// Simple JSON scene format parser.
// (If your .scene format differs, we’ll rewrite this parser)

import { Vector3 } from "../../core/math.ts";

export interface SceneNodeData {
  name: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  mesh?: string;
  children: SceneNodeData[];
}

export interface SceneData {
  root: SceneNodeData;
}

export class SceneLoader {
  static parse(buffer: ArrayBuffer): SceneData {
    const text = new TextDecoder().decode(buffer);
    return JSON.parse(text) as SceneData;
  }
}

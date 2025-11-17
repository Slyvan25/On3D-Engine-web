/* ============================================================================
 * Scene graph interfaces
 * ========================================================================== */

import { Vec3 } from "./Vec3";

export interface ISceneNode {
  name?: string;
  setPosition(v: Vec3): void;
  translate(v: Vec3): void;
  yaw(radians: number): void;
  pitch(radians: number): void;
  roll(radians: number): void;
  lookAt(target: Vec3): void;

  attach(child: ISceneNode): void;
  detach(child: ISceneNode): void;
  setVisible(visible: boolean): void;
}

export interface ICamera {
  setPosition(v: Vec3): void;
  lookAt(v: Vec3): void;
  setNear(distance: number): void;
  setFar(distance: number): void;
  setFov(degrees: number): void;
}

export interface IViewport {
  setCamera(cam: ICamera): void;
  setDimensions(left: number, top: number, width: number, height: number): void;
}

/* ============================================================================
 * Scene loading / game-specific
 * ========================================================================== */

export interface SceneLoadOptions {
  sceneFile?: string;
  mapFile?: string;
  onProgress?: (msgType: number, p1: number, p2: number) => void;
}

export interface ISceneManager {
  loadScene(options: SceneLoadOptions): Promise<void>;
}

// scene-node.ts — Core scene graph node for the WebOn3D engine.
// Wraps a Three.js Object3D and exposes engine-friendly methods.

import * as THREE from "three";
import { Vector3 } from "../core/math.ts";

export class SceneNode {
  name?: string;
  readonly object3D: THREE.Object3D;

  constructor(name?: string) {
    this.name = name;
    this.object3D = new THREE.Object3D();
    (this.object3D as any).__sceneNodeRef = this; // <-- IMPORTANT for editor
    if (name) this.object3D.name = name;
  }

  // ---------------------------------------------------------------
  // Transform
  // ---------------------------------------------------------------
  setPosition(v: Vector3) {
    this.object3D.position.set(v.x, v.y, v.z);
  }

  translate(v: Vector3) {
    this.object3D.position.add(new THREE.Vector3(v.x, v.y, v.z));
  }

  yaw(rad: number) {
    this.object3D.rotateY(rad);
  }

  pitch(rad: number) {
    this.object3D.rotateX(rad);
  }

  roll(rad: number) {
    this.object3D.rotateZ(rad);
  }

  lookAt(target: Vector3) {
    this.object3D.lookAt(target.x, target.y, target.z);
  }

  // ---------------------------------------------------------------
  // Hierarchy
  // ---------------------------------------------------------------
  attach(child: SceneNode) {
    this.object3D.add(child.object3D);
  }

  detach(child: SceneNode) {
    this.object3D.remove(child.object3D);
  }

  setVisible(v: boolean) {
    this.object3D.visible = v;
  }
}

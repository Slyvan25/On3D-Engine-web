// camera.ts — Perspective camera wrapper for WebOn3D.

import * as THREE from "three";
import { Vector3 } from "../core/math.ts";

export class SceneCamera {
  readonly camera: THREE.PerspectiveCamera;

  constructor(fov = 60, aspect = 1, near = 0.1, far = 2000) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  setPosition(v: Vector3) {
    this.camera.position.set(v.x, v.y, v.z);
  }

  lookAt(v: Vector3) {
    this.camera.lookAt(v.x, v.y, v.z);
  }

  setNear(n: number) {
    this.camera.near = n;
    this.camera.updateProjectionMatrix();
  }

  setFar(f: number) {
    this.camera.far = f;
    this.camera.updateProjectionMatrix();
  }

  setFov(deg: number) {
    this.camera.fov = deg;
    this.camera.updateProjectionMatrix();
  }
}

// transform.ts — Simple transform component for WebOn3D engine.

import { Vector3, Quaternion, Matrix4 } from "./math.ts";

export class Transform {
  position = new Vector3();
  rotation = new Quaternion();
  scale = new Vector3(1, 1, 1);

  matrix = new Matrix4();

  constructor() {}

  setPosition(x: number, y: number, z: number) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  setRotation(quat: Quaternion) {
    this.rotation = quat;
  }

  setScale(x: number, y: number, z: number) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
  }

  /**
   * Update transform → matrix4
   * Called by SceneNode or manually.
   */
  updateMatrix() {
    this.matrix.compose(this.position, this.rotation, this.scale);
    return this.matrix;
  }

  clone() {
    const t = new Transform();
    t.position = this.position.clone();
    t.rotation = this.rotation.clone();
    t.scale = this.scale.clone();
    t.updateMatrix();
    return t;
  }
}

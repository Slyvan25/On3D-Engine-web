// character-controller.ts
// WASD character movement for the local player avatar.

import { Avatar } from "@/engine/avatar/avatar.ts";
import { InputState } from "./input.ts";
import { Vector3 } from "@/engine/core/math.ts";

export class CharacterController {
  private avatar: Avatar;
  private input: InputState;

  private moveSpeed = 5; // units per second

  constructor(avatar: Avatar, input: InputState) {
    this.avatar = avatar;
    this.input = input;
  }

  update(dt: number) {
    const dir = new Vector3();

    if (this.input.isDown("w")) dir.z -= 1;
    if (this.input.isDown("s")) dir.z += 1;
    if (this.input.isDown("a")) dir.x -= 1;
    if (this.input.isDown("d")) dir.x += 1;

    if (dir.x !== 0 || dir.z !== 0) {
      dir.normalize().multiplyScalar(this.moveSpeed * dt);

      const pos = this.avatar.node.object3D.position;
      pos.x += dir.x;
      pos.z += dir.z;
    }
  }
}

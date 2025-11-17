// src/game/camera-controller.ts
// Simple 3rd-person camera following an avatar.

import * as THREE from "three";
import { Avatar } from "@/engine/avatar/avatar.ts";
import { WebOn3DEngine } from "@/engine/engine.ts"; // if default export, adjust import
// If default export is `export default`, you can instead import type:
// import type WebOn3DEngine from "@/engine/engine.ts";

export class CameraController {
  private avatar: Avatar;
  private engine: any;

  // Offsets in local space behind the avatar
  private distance = 5;
  private height = 2;

  constructor(engine: any, avatar: Avatar) {
    this.engine = engine;
    this.avatar = avatar;
  }

  update(_dt: number) {
    // Access underlying Three.js camera via renderSystem
    const rs: any = this.engine.renderSystem;
    const camera: THREE.PerspectiveCamera = rs.camera;

    const avatarPos = this.avatar.node.object3D.position;

    const target = new THREE.Vector3(
      avatarPos.x,
      avatarPos.y + this.height,
      avatarPos.z,
    );

    // Simple static offset behind avatar (Z-)
    const camPos = new THREE.Vector3(
      target.x,
      target.y + 2,
      target.z + this.distance,
    );

    camera.position.copy(camPos);
    camera.lookAt(target);
  }
}

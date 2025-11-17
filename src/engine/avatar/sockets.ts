// sockets.ts — Attachment system for avatar meshes

import * as THREE from "three";

export type AvatarSocketName = "hand_r" | "hand_l" | "head" | "back" | "root";

export class AvatarSocketSystem {
  private base: THREE.Object3D;
  private sockets = new Map<AvatarSocketName, THREE.Object3D>();

  constructor(mesh: THREE.Object3D) {
    this.base = mesh;

    // Define simple sockets (placeholder)
    this.addSocket("root", new THREE.Vector3(0, 0, 0));
    this.addSocket("hand_r", new THREE.Vector3(0.4, 0.8, 0));
    this.addSocket("hand_l", new THREE.Vector3(-0.4, 0.8, 0));
    this.addSocket("head", new THREE.Vector3(0, 1.3, 0));
    this.addSocket("back", new THREE.Vector3(0, 0.9, -0.3));
  }

  private addSocket(name: AvatarSocketName, pos: THREE.Vector3) {
    const obj = new THREE.Object3D();
    obj.position.copy(pos);
    this.base.add(obj);
    this.sockets.set(name, obj);
  }

  /**
   * Attach mesh created by a factory function to a socket
   */
  attachTo(name: AvatarSocketName, factory: () => THREE.Object3D) {
    const socket = this.sockets.get(name);
    if (!socket) throw new Error(`Socket '${name}' not found.`);

    const item = factory();
    socket.add(item);
    return item;
  }

  /**
   * Get raw Three.js Object3D for socket.
   */
  getSocket(name: AvatarSocketName) {
    return this.sockets.get(name);
  }
}

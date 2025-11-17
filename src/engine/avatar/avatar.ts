// avatar.ts — Core avatar implementation for WebOn3D Engine

import * as THREE from "three";
import { SceneNode } from "../scene/scene-node.ts";
import { Vector3 } from "../core/math.ts";
import { AvatarSocketSystem } from "./sockets.ts";

export interface AvatarOptions {
  characterId?: number;
  position?: Vector3;
  items?: string[];
  decorations?: string[];
}

export class Avatar {
  readonly id: number;
  readonly node: SceneNode;
  readonly mesh: THREE.Object3D;

  sockets: AvatarSocketSystem;

  private items = new Map<string, THREE.Object3D>();
  private decorations = new Map<string, THREE.Object3D>();

  constructor(id: number, node: SceneNode, mesh: THREE.Object3D) {
    this.id = id;
    this.node = node;
    this.mesh = mesh;

    this.node.object3D.add(this.mesh);

    this.sockets = new AvatarSocketSystem(this.mesh);
  }

  // -------------------------------------------------------------
  // Transform
  // -------------------------------------------------------------

  setPosition(v: Vector3) {
    this.node.setPosition(v);
  }

  // -------------------------------------------------------------
  // Items / Decorations (simple placeholders)
  // -------------------------------------------------------------

  attachItem(name: string) {
    const item = this.sockets.attachTo("hand_r", () => {
      return new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.1, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xffaa00 }),
      );
    });

    this.items.set(name, item);
  }

  attachDecoration(name: string) {
    const deco = this.sockets.attachTo("head", () => {
      return new THREE.Mesh(
        new THREE.SphereGeometry(0.2),
        new THREE.MeshStandardMaterial({ color: 0x00aaff }),
      );
    });

    this.decorations.set(name, deco);
  }
}

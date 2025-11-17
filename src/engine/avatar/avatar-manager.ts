// avatar-manager.ts — Creates and tracks avatar instances

import * as THREE from "three";
import { Avatar, AvatarOptions } from "./avatar.ts";
import { WebSceneManager } from "../scene/scene-manager.ts";
import { Vector3 } from "../core/math.ts";

export class AvatarManager {
  private avatars: Avatar[] = [];
  private nextId = 1;

  constructor(private sceneManager: WebSceneManager) {}

  createAvatar(opts: AvatarOptions) {
    const id = this.nextId++;

    // Create scene node
    const node = this.sceneManager.createNode(`avatar_${id}`);

    // Placeholder avatar mesh
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.8, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x22ffcc }),
    );

    const avatar = new Avatar(id, node, mesh);

    // Set initial position
    if (opts.position) avatar.setPosition(opts.position);

    // Attach items
    opts.items?.forEach((i) => avatar.attachItem(i));
    opts.decorations?.forEach((d) => avatar.attachDecoration(d));

    this.avatars.push(avatar);
    return avatar;
  }

  getAvatars() {
    return this.avatars;
  }
}

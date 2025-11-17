// game-avatar.ts
// Higher-level game-facing avatar logic
// (not the engine's base avatar.ts)

import { WebAvatarManager } from "../avatar/avatar.ts";
import { WebSceneManager } from "../scene/scene-manager.ts";
import { AvatarCreateOptions } from "../types/IAvatarManager.ts";

export class GameAvatarController {
  private avatarManager: WebAvatarManager;

  constructor(scene: WebSceneManager) {
    this.avatarManager = new WebAvatarManager(scene);
  }

  spawnPlayer(opts: AvatarCreateOptions) {
    const avatar = this.avatarManager.createAvatar(opts);
    // Additional game logic later:
    // - weapon equip
    // - abilities
    // - events
    return avatar;
  }
}

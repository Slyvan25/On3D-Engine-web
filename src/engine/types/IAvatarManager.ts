/* ============================================================================
 * Avatar system
 * ========================================================================== */

import { Vec3 } from "./Vec3.ts";

export interface AvatarCreateOptions {
  characterId?: number;
  position?: Vec3;
  items?: string[];
  decorations?: string[];
}

export interface IAvatar {
  characterId: number;
  setPosition(pos: Vec3): void;
  attachItem(name: string): void;
  attachDecoration(name: string): void;
}

export interface IAvatarManager {
  createAvatar(opts: AvatarCreateOptions): IAvatar;
  getAvatars(): IAvatar[];
}

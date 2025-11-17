// game-scene.ts
// High-level game orchestration:
// - load pack
// - load scene
// - spawn a player avatar
// - hook up character + camera controllers

import WebOn3DEngine from "@/engine/engine.ts";
import { WebGameSceneManager } from "@/engine/game/game-scene.ts"; // engine-level scene manager
import { AvatarOptions } from "@/engine/avatar/avatar.ts";
import { InputState } from "./input.ts";
import { CharacterController } from "./character-controller.ts";
import { CameraController } from "./camera-controller.ts";
import { Vector3 } from "@/engine/core/math.ts";

export interface GameSceneInitOptions {
  packUrl: string;
  sceneFile: string;
}

export class GameScene {
  private engine: WebOn3DEngine;
  private input: InputState;

  private characterController: CharacterController | null = null;
  private cameraController: CameraController | null = null;

  constructor(engine: WebOn3DEngine) {
    this.engine = engine;
    this.input = new InputState(document.body);
  }

  async init(opts: GameSceneInitOptions) {
    // Load pack + prepare game-level scene manager
    const gsm = (this.engine as any).gameSceneManager as WebGameSceneManager;
    await gsm.loadPack(opts.packUrl);

    // Load scene from pack
    await this.engine.loadScene({
      sceneFile: opts.sceneFile,
      onProgress: (type, p1, p2) => {
        console.log("Scene loading progress:", type, p1, p2);
      },
    });

    // Spawn player avatar at origin
    const avatarOpts: AvatarOptions = {
      characterId: 1,
      position: new Vector3(0, 0, 0),
      items: ["weapon_01"],
      decorations: ["hat_red"],
    };

    const avatar = (this.engine.avatarManager as any).createAvatar(avatarOpts);

    // Hook controllers
    this.characterController = new CharacterController(avatar, this.input);
    this.cameraController = new CameraController(this.engine, avatar);
  }

  update(dt: number) {
    this.characterController?.update(dt);
    this.cameraController?.update(dt);
  }
}

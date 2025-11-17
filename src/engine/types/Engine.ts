import { WebGameSceneManager } from "../game/game-scene.ts";
import {
  AvatarCreateOptions,
  IAvatar,
  IAvatarManager,
} from "./IAvatarManager.ts";
import { IRenderSystem } from "./IRenderSystem.ts";
import { ISceneManager, SceneLoadOptions } from "./Scene.ts";

export interface EngineFrameHooks {
  onUpdate?: (deltaSeconds: number) => void;
}

export interface IEngine {
  renderSystem: IRenderSystem;
  sceneManager: any;
  avatarManager: IAvatarManager;
  gameSceneManager: ISceneManager;

  loadScene(opts: SceneLoadOptions): Promise<void>;
  createAvatar(opts: AvatarCreateOptions): IAvatar;
  start(hooks?: EngineFrameHooks): void;
  stop(): void;
}

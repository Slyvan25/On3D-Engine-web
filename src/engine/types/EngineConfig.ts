import { RendererType } from "./Render.ts";

export interface EngineConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  pixelRatio?: number;
  fov?: number; // Field of view in degrees
  near?: number;
  far?: number;
  renderer?: RendererType;
}

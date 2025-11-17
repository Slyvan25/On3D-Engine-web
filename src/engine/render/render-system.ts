// render-system.ts — Renderer abstraction for the WebOn3DEngine.

export interface IRenderSystem {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;

  setSize(width: number, height: number): void;
  render(): void;
}

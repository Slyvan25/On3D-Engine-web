/* ============================================================================
 * Rendering
 * ========================================================================== */

export interface IRenderSystem {
  setSize(width: number, height: number): void;
  render(): void;
}

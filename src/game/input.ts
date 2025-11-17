// src/game/input.ts
// Centralized keyboard + mouse input helper.

export class InputState {
  private keys = new Set<string>();
  mouseDeltaX = 0;
  mouseDeltaY = 0;

  constructor(target: HTMLElement | Window = window) {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key.toLowerCase());
    });

    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    target.addEventListener("mousemove", (e: MouseEvent) => {
      this.mouseDeltaX += e.movementX;
      this.mouseDeltaY += e.movementY;
    });
  }

  isDown(key: string) {
    return this.keys.has(key.toLowerCase());
  }

  consumeMouseDelta() {
    const dx = this.mouseDeltaX;
    const dy = this.mouseDeltaY;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return { dx, dy };
  }
}

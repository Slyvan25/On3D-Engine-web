// webgpu-renderer.ts
// Native WebGPU renderer backend for the WebOn3D engine.
// Works in modern browsers (Chrome/Edge) and in Deno with --unstable-webgpu.

import { IRenderSystem } from "./render-system.ts";

export interface WebGPURendererConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  clearColor?: [number, number, number, number]; // RGBA
}

export class WebGPURenderSystem implements IRenderSystem {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;

  // WebGPU core objects
  private adapter!: GPUAdapter;
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;

  // Optional depth buffer
  private depthTexture: GPUTexture | null = null;
  private depthView: GPUTextureView | null = null;
  private depthFormat: GPUTextureFormat = "depth24plus";

  // Clear color for the render pass
  private clearColor: [number, number, number, number];

  private constructor(cfg: WebGPURendererConfig) {
    this.canvas = cfg.canvas;
    this.width = cfg.width;
    this.height = cfg.height;
    this.clearColor = cfg.clearColor ?? [0.0, 0.0, 0.0, 1.0];
  }

  /**
   * Async factory: initializes WebGPU adapter/device and canvas context.
   */
  static async create(cfg: WebGPURendererConfig): Promise<WebGPURenderSystem> {
    const rs = new WebGPURenderSystem(cfg);
    await rs.init();
    return rs;
  }

  private async init() {
    // 1) Get adapter
    const nav: any = globalThis.navigator ?? {};
    if (!nav.gpu) {
      throw new Error(
        "WebGPU not available. Ensure you're in a WebGPU-enabled browser or Deno with --unstable-webgpu.",
      );
    }

    this.adapter = await nav.gpu.requestAdapter();
    if (!this.adapter) {
      throw new Error("Failed to get GPU adapter");
    }

    // 2) Request device
    this.device = await this.adapter.requestDevice();

    // 3) Canvas context
    const ctx = this.canvas.getContext("webgpu") as GPUCanvasContext | null;
    if (!ctx) {
      throw new Error("Canvas does not support 'webgpu' context");
    }
    this.context = ctx;

    // 4) Choose format & configure swapchain
    this.format = (nav.gpu as GPU).getPreferredCanvasFormat();

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "opaque",
    });

    // 5) Create depth buffer
    this.createDepthTexture();
  }

  private createDepthTexture() {
    if (this.depthTexture) {
      this.depthTexture.destroy();
    }

    this.depthTexture = this.device.createTexture({
      size: { width: this.width, height: this.height },
      format: this.depthFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.depthView = this.depthTexture.createView();
  }

  // ---------------------------------------------------------------------------
  // IRenderSystem interface
  // ---------------------------------------------------------------------------

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    this.canvas.width = width;
    this.canvas.height = height;

    // Recreate depth buffer to match new size
    this.createDepthTexture();
  }

  /**
   * Render a frame.
   *
   * Right now this just clears the screen to the clearColor.
   * You can extend this to:
   * - Set a pipeline
   * - Draw meshes
   * - Run multiple render passes
   */
  render(): void {
    if (!this.device || !this.context) {
      // Not yet initialized or failed
      return;
    }

    const textureView = this.context.getCurrentTexture().createView();

    const encoder = this.device.createCommandEncoder();

    const colorAttachment: GPURenderPassColorAttachment = {
      view: textureView,
      clearValue: {
        r: this.clearColor[0],
        g: this.clearColor[1],
        b: this.clearColor[2],
        a: this.clearColor[3],
      },
      loadOp: "clear",
      storeOp: "store",
    };

    const depthAttachment: GPURenderPassDepthStencilAttachment | undefined =
      this.depthView
        ? {
            view: this.depthView,
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: "store",
            /* stencil not used */ stencilLoadOp: "load",
            stencilStoreOp: "store",
          }
        : undefined;

    const renderPassDesc: GPURenderPassDescriptor = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: depthAttachment,
    };

    const pass = encoder.beginRenderPass(renderPassDesc);

    // TODO: Pipeline + draw calls will go here.
    // For now we simply clear the screen.
    pass.end();

    const cmdBuf = encoder.finish();
    this.device.queue.submit([cmdBuf]);
  }
}

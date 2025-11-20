// scene-manager.ts — Central scene graph controller for WebOn3D engine.

import * as THREE from "three";
import { SceneNode } from "./scene-node.ts";
import { SceneCamera } from "./camera.ts";
import { Viewport } from "./viewport.ts";
import { IRenderSystem } from "../render/render-system.ts";

export class WebSceneManager {
  readonly renderSystem: IRenderSystem;
  readonly root: SceneNode;
  private environmentNode: SceneNode;

  private nodes = new Map<string, SceneNode>();
  private cameras = new Map<string, SceneCamera>();

  private activeCamera: SceneCamera | null = null;
  private viewport: Viewport;

  constructor(renderSystem: IRenderSystem) {
    this.renderSystem = renderSystem;

    // Root of scene graph
    this.root = new SceneNode("root");
    (this.renderSystem as any).scene.add(this.root.object3D);

    this.environmentNode = new SceneNode("environment");
    this.root.attach(this.environmentNode);
    this.setupDefaultEnvironment();

    this.viewport = new Viewport(renderSystem);
  }

  private setupDefaultEnvironment() {
    const ambient = new THREE.HemisphereLight(0xffffff, 0x404040, 0.6);
    ambient.name = "default-ambient";
    this.environmentNode.object3D.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.0);
    directional.position.set(5, 10, 7);
    directional.name = "default-directional";
    this.environmentNode.object3D.add(directional);

    const skyGeo = new THREE.SphereGeometry(500, 32, 32);
    skyGeo.scale(-1, 1, 1);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
    const skybox = new THREE.Mesh(skyGeo, skyMat);
    skybox.name = "default-skybox";
    this.environmentNode.object3D.add(skybox);
  }

  // ---------------------------------------------------------------
  // Nodes
  // ---------------------------------------------------------------
  createNode(name?: string) {
    const node = new SceneNode(name);
    if (name) this.nodes.set(name, node);
    this.root.attach(node);
    return node;
  }

  getNode(name: string) {
    return this.nodes.get(name);
  }

  destroyNode(id: string | SceneNode) {
    const node = typeof id === "string" ? this.nodes.get(id)! : id;
    if (!node) return;
    this.root.detach(node);

    for (const [key, val] of this.nodes) {
      if (val === node) this.nodes.delete(key);
    }
  }

  // ---------------------------------------------------------------
  // Cameras
  // ---------------------------------------------------------------
  createCamera(name: string, fov = 60, near = 0.1, far = 2000) {
    const cam = new SceneCamera(fov, 1, near, far);
    this.cameras.set(name, cam);
    if (!this.activeCamera) this.activeCamera = cam;
    return cam;
  }

  getCamera(name: string) {
    return this.cameras.get(name);
  }

  setActiveCamera(name: string) {
    const cam = this.cameras.get(name);
    if (cam) this.activeCamera = cam;
  }

  // ---------------------------------------------------------------
  // Frame update + render
  // ---------------------------------------------------------------
  update(dt: number) {
    // Future:
    // - animation system
    // - avatar updates
    // - scene scripts
  }

  render() {
    this.renderSystem.render();
  }
}

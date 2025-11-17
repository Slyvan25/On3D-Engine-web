import { WebOn3DEngine } from "@/engine/engine.ts";
import { ResourceManager } from "@/engine/resource/resource-manager.ts";
import { SceneBuilder } from "@/engine/resource/builders/scene-builder.ts";
import { MeshBuilder } from "@/engine/resource/builders/mesh-builder.ts";
import { MaterialBuilder } from "@/engine/resource/builders/material-builder.ts";

const canvasElement = document.getElementById("game");
if (!(canvasElement instanceof HTMLCanvasElement)) {
  throw new Error("Unable to find <canvas id='game'> element.");
}

const engine = await WebOn3DEngine.create({
  canvas: canvasElement,
  width: window.innerWidth,
  height: window.innerHeight,
  renderer: "three", // or "webgpu"
});

let resources: ResourceManager | null = null;
try {
  resources = await ResourceManager.fromPackUrl("/assets/packs/data.pack");
} catch (err) {
  console.warn("Failed to load pack /assets/packs/data.pack", err);
}

if (resources) {
  const matBuilder = new MaterialBuilder();
  const meshBuilder = new MeshBuilder(matBuilder, resources);
  const sceneBuilder = new SceneBuilder(resources, meshBuilder);

  try {
    const sceneData = resources.loadScene("scenes/lobby.scene");
    sceneBuilder.build(sceneData.root, engine.sceneManager.root);
  } catch (err) {
    console.warn("Failed to build lobby.scene from pack", err);
  }
}

engine.createAvatar({
  characterId: 1,
  position: { x: 0, y: 0, z: 0 },
});

engine.start();

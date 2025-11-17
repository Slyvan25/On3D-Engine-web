import { WebOn3DEngine } from "@/engine/engine.ts";
import { PackReader } from "@/engine/resource/pack-reader.ts";
import { ResourceManager } from "@/engine/resource/resource-manager.ts";
import { SceneBuilder } from "@/engine/resource/builders/scene-builder.ts";
import { MeshBuilder } from "@/engine/resource/builders/mesh-builder.ts";
import { MaterialBuilder } from "@/engine/resource/builders/material-builder.ts";

import * as THREE from "three";

const canvas = document.getElementById("game") as HTMLCanvasElement;

const engine = await WebOn3DEngine.create({
  canvas,
  width: window.innerWidth,
  height: window.innerHeight,
  renderer: "three", // or "webgpu"
});

const pack = await PackReader.load("/assets/packs/data.pack");
const resources = new ResourceManager(pack);

const matBuilder = new MaterialBuilder();
const meshBuilder = new MeshBuilder(matBuilder, resources);
const sceneBuilder = new SceneBuilder(resources, meshBuilder);

// Load initial map
const sceneData = resources.loadScene("scenes/lobby.scene");
sceneBuilder.build(sceneData.root, engine.sceneManager.root);

// Add a test avatar
engine.createAvatar({
  characterId: 1,
  position: { x: 0, y: 0, z: 0 },
});

engine.start();

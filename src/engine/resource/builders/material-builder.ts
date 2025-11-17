// material-builder.ts
// Builds Three.js materials from MaterialData

import * as THREE from "three";
import { MaterialData } from "../loaders/material-loader.ts";

export class MaterialBuilder {
  private loader = new THREE.TextureLoader();
  private cache = new Map<string, THREE.Texture>();

  private loadTexture(path: string) {
    if (!path) return null;
    if (this.cache.has(path)) return this.cache.get(path)!;
    const texture = this.loader.load(path);
    this.cache.set(path, texture);
    return texture;
  }

  build(mat: MaterialData) {
    return new THREE.MeshStandardMaterial({
      map: this.loadTexture(mat.diffuse ?? ""),
      normalMap: this.loadTexture(mat.normal ?? ""),
      roughnessMap: this.loadTexture(mat.specular ?? ""),
    });
  }
}

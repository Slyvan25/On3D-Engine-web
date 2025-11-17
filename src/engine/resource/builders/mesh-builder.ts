// mesh-builder.ts
// Converts MeshData → THREE.Mesh

import * as THREE from "three";
import { MeshData } from "../loaders/mesh-loader.ts";
import { ResourceManager } from "../resource-manager.ts";
import { MaterialBuilder } from "./material-builder.ts";

export class MeshBuilder {
  constructor(
    private materials: MaterialBuilder,
    private resources: ResourceManager,
  ) {}

  build(mesh: MeshData) {
    const geo = new THREE.BufferGeometry();

    geo.setAttribute("position", new THREE.BufferAttribute(mesh.vertices, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(mesh.normals, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(mesh.uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(mesh.indices, 1));

    const mats: THREE.Material[] = [];

    for (const sub of mesh.submeshes) {
      const matPath = `${sub.material}.material`;
      const matData = this.resources.loadMaterial(matPath);
      mats.push(this.materials.build(matData));
    }

    return new THREE.Mesh(geo, mats);
  }
}

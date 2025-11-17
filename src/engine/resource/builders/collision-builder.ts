// collision-builder.ts
// Renders collision meshes as debug wireframes

import * as THREE from "three";
import { CollisionMesh } from "../loaders/collision-loader.ts";

export class CollisionBuilder {
  buildDebugMesh(col: CollisionMesh) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(col.triangles, 3));
    geo.computeVertexNormals();

    return new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true }),
    );
  }
}

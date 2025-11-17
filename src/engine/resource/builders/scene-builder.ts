// scene-builder.ts
// Converts SceneData → SceneNode hierarchy using SceneManager

import { SceneNodeData } from "../loaders/scene-loader.ts";
import { ResourceManager } from "../resource-manager.ts";
import { MeshBuilder } from "./mesh-builder.ts";

import { SceneNode } from "../../scene/scene-node.ts";

export class SceneBuilder {
  constructor(
    private resources: ResourceManager,
    private meshBuilder: MeshBuilder,
  ) {}

  build(nodeData: SceneNodeData, parent: SceneNode) {
    const node = parent;

    // Transform
    node.object3D.position.set(
      nodeData.position.x,
      nodeData.position.y,
      nodeData.position.z,
    );

    node.object3D.rotation.set(
      nodeData.rotation.x,
      nodeData.rotation.y,
      nodeData.rotation.z,
    );

    node.object3D.scale.set(
      nodeData.scale.x,
      nodeData.scale.y,
      nodeData.scale.z,
    );

    // Mesh
    if (nodeData.mesh) {
      const meshData = this.resources.loadMesh(nodeData.mesh);
      const mesh = this.meshBuilder.build(meshData);
      node.object3D.add(mesh);
    }

    // Children
    for (const child of nodeData.children) {
      const childNode = new SceneNode(child.name);
      parent.attach(childNode);
      this.build(child, childNode);
    }
  }
}

import * as THREE from "three";
import type { SceneNode } from "@engine/scene/scene-node.ts";

export class TransformGizmo {
  root: THREE.Object3D;
  node: SceneNode | null = null;

  xArrow: THREE.Mesh;
  yArrow: THREE.Mesh;
  zArrow: THREE.Mesh;

  constructor() {
    this.root = new THREE.Object3D();
    const geom = new THREE.CylinderGeometry(0, 0.05, 0.5, 8);

    this.xArrow = new THREE.Mesh(
      geom,
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    this.xArrow.rotation.z = -Math.PI / 2;
    this.xArrow.position.x = 0.6;
    this.root.add(this.xArrow);

    this.yArrow = new THREE.Mesh(
      geom,
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    this.yArrow.position.y = 0.6;
    this.root.add(this.yArrow);

    this.zArrow = new THREE.Mesh(
      geom,
      new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    this.zArrow.rotation.x = Math.PI / 2;
    this.zArrow.position.z = 0.6;
    this.root.add(this.zArrow);
  }

  attachTo(node: SceneNode | null) {
    this.node = node;
    if (!node) {
      this.root.visible = false;
      return;
    }
    this.root.visible = true;
    this.root.position.copy(node.object3D.position);
  }

  update() {
    if (!this.node) return;
    this.root.position.copy(this.node.object3D.position);
  }
}

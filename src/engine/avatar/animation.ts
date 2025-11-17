// animation.ts — Basic avatar animation wrapper using THREE.AnimationMixer

import * as THREE from "three";

export class AvatarAnimationController {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();

  constructor(private mesh: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(mesh);
  }

  /**
   * Load animations from a GLTF file or custom clip
   */
  addClip(clip: THREE.AnimationClip, name?: string) {
    const action = this.mixer.clipAction(clip);
    this.actions.set(name ?? clip.name, action);
    return action;
  }

  play(name: string, loop = THREE.LoopRepeat) {
    const action = this.actions.get(name);
    if (!action) throw new Error(`Animation '${name}' not found.`);
    action.reset();
    action.setLoop(loop, Infinity);
    action.play();
  }

  stop(name: string) {
    const action = this.actions.get(name);
    action?.stop();
  }

  update(dt: number) {
    this.mixer.update(dt);
  }
}

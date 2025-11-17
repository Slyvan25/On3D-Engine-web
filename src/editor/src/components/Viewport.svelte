<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { editorState, selectedNode } from "../stores/editorStore";
  import * as THREE from "three";
  import { TransformGizmo } from "../lib/gizmo/TransformGizmo";

  export let canvasEl: HTMLCanvasElement | null = null;

  let state;
  $: state = $editorState;
  $: node = $selectedNode;

  let gizmo: TransformGizmo | null = null;
  let rs: any;
  let raycaster: THREE.Raycaster;
  let mouse = new THREE.Vector2();
  let dragging = false;
  let dragAxis: "x" | "y" | "z" | null = null;

  onMount(() => {
    const engine = state.engine;
    if (!engine) return;

    rs = engine.renderSystem as any;
    gizmo = new TransformGizmo();
    rs.scene.add(gizmo.root);
    raycaster = new THREE.Raycaster();

    const canvas = canvasEl!;
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const id = setInterval(() => {
      gizmo?.attachTo(node ?? null);
      gizmo?.update();
    }, 16);

    onDestroy(() => {
      clearInterval(id);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    });
  });

  function ndcFromEvent(ev: PointerEvent) {
    const rect = canvasEl!.getBoundingClientRect();
    mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function intersectGizmo(ev: PointerEvent) {
    if (!gizmo || !rs?.camera) return null;
    ndcFromEvent(ev);
    raycaster.setFromCamera(mouse, rs.camera);
    const hits = raycaster.intersectObjects(gizmo.root.children, true);
    if (!hits.length) return null;
    const obj = hits[0].object;
    if (obj === gizmo.xArrow) return "x";
    if (obj === gizmo.yArrow) return "y";
    if (obj === gizmo.zArrow) return "z";
    return null;
  }

  function onPointerDown(ev: PointerEvent) {
    const axis = intersectGizmo(ev);
    if (axis) {
      dragging = true;
      dragAxis = axis;
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  function onPointerMove(ev: PointerEvent) {
    if (!dragging || !dragAxis || !node) return;
    const delta = ev.movementX * 0.02;
    node.object3D.position[dragAxis] += delta;
  }

  function onPointerUp(_ev: PointerEvent) {
    dragging = false;
    dragAxis = null;
  }
</script>

<canvas bind:this={canvasEl} style="width:100%; height:100%; display:block;"
></canvas>

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { resourceStore } from "../../stores/resourceStore";
  import { scenePreviewSelection } from "../../stores/scenePreviewStore";
  import type { SceneNodeData } from "@engine/resource/loaders/scene-loader";

  let container: HTMLDivElement | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let controls: OrbitControls | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let frameId: number | null = null;
  let previewRoot: THREE.Group | null = null;
  let stagedGeometries: THREE.BufferGeometry[] = [];
  let stagedMaterials: THREE.Material[] = [];
  let activeScenePath: string | null = null;
  let status = "Select a .scene file to preview it.";

  $: resourceManager = $resourceStore.resourceManager;
  $: requestedScene = $scenePreviewSelection;
  $: if (scene && renderer) {
    refreshScene(requestedScene);
  }

  onMount(() => {
    if (!container) return;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(globalThis.devicePixelRatio ?? 1);
    renderer.setClearColor(0x0c0d12, 1);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f111a);

    camera = new THREE.PerspectiveCamera(48, 1, 0.1, 4000);
    camera.position.set(8, 6, 8);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1, 0);

    const grid = new THREE.GridHelper(40, 40, 0x444a6d, 0x1c1e2c);
    scene.add(grid);
    scene.add(new THREE.AxesHelper(1.5));

    const hemi = new THREE.HemisphereLight(0xffffff, 0x1b1d26, 0.7);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(6, 10, 4);
    scene.add(dir);

    previewRoot = new THREE.Group();
    scene.add(previewRoot);

    const resize = () => {
      if (!renderer || !camera || !container) return;
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const tick = () => {
      frameId = requestAnimationFrame(tick);
      controls?.update();
      renderer?.render(scene!, camera!);
    };

    tick();
  });

  onDestroy(() => {
    if (frameId) cancelAnimationFrame(frameId);
    resizeObserver?.disconnect();
    disposePreview();
    controls?.dispose();
    renderer?.dispose();
    renderer = null;
    scene = null;
    camera = null;
    previewRoot = null;
  });

  function disposePreview() {
    previewRoot?.clear();
    for (const geo of stagedGeometries) geo.dispose();
    for (const mat of stagedMaterials) mat.dispose();
    stagedGeometries = [];
    stagedMaterials = [];
  }

  function refreshScene(path: string | null) {
    if (!previewRoot) return;
    if (path === activeScenePath) return;
    activeScenePath = path;

    if (!path) {
      disposePreview();
      status = "Select a .scene file to preview it.";
      return;
    }

    if (!resourceManager) {
      disposePreview();
      status = "Import a .pack to preview scenes.";
      return;
    }

    status = "Loading scene...";

    let sceneData;
    try {
      sceneData = resourceManager.loadScene(path);
    } catch (err) {
      disposePreview();
      status = err instanceof Error ? err.message : String(err);
      return;
    }

    disposePreview();

    const node = buildNode(sceneData.root);
    if (node) {
      previewRoot.add(node);
      focusCamera(node);
      status = `Previewing ${path}`;
    } else {
      status = "Scene contains no previewable nodes.";
    }
  }

  function buildNode(data: SceneNodeData | undefined): THREE.Object3D | null {
    if (!data) return null;
    const group = new THREE.Group();
    group.name = data.name ?? "node";
    group.position.set(data.position.x, data.position.y, data.position.z);
    group.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    group.scale.set(data.scale.x, data.scale.y, data.scale.z);

    if (data.mesh) {
      try {
        const meshData = resourceManager?.loadMesh(data.mesh);
        if (meshData) {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(meshData.vertices, 3),
          );
          if (meshData.normals?.length) {
            geometry.setAttribute(
              "normal",
              new THREE.BufferAttribute(meshData.normals, 3),
            );
          } else {
            geometry.computeVertexNormals();
          }
          if (meshData.uvs?.length) {
            geometry.setAttribute("uv", new THREE.BufferAttribute(meshData.uvs, 2));
          }
          if (meshData.indices?.length) {
            geometry.setIndex(new THREE.BufferAttribute(meshData.indices, 1));
          }
          geometry.computeBoundingSphere();
          geometry.computeBoundingBox();
          const material = new THREE.MeshStandardMaterial({
            color: 0xbec8ff,
            metalness: 0.1,
            roughness: 0.75,
          });
          stagedGeometries.push(geometry);
          stagedMaterials.push(material);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        }
      } catch (err) {
        console.warn("SceneViewerPanel: failed to load mesh", data.mesh, err);
      }
    }

    for (const child of data.children ?? []) {
      const built = buildNode(child);
      if (built) group.add(built);
    }

    return group;
  }

  function focusCamera(root: THREE.Object3D) {
    if (!camera || !controls) return;
    const bounds = new THREE.Box3().setFromObject(root);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 1);
    controls.target.copy(center);
    const offset = radius * 1.6;
    camera.position.set(center.x + offset, center.y + radius * 0.8, center.z + offset);
    camera.near = Math.max(0.1, radius * 0.02);
    camera.far = Math.max(2000, radius * 10);
    camera.updateProjectionMatrix();
  }
</script>

<div class="scene-viewer">
  <div class="viewer-surface" bind:this={container}></div>
  <div class="viewer-status" role="status">{status}</div>
</div>

<style>
  .scene-viewer {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid #1d2032;
    border-radius: 6px;
    background: #0a0b11;
    overflow: hidden;
  }

  .viewer-surface {
    width: 100%;
    height: 100%;
  }

  .viewer-status {
    position: absolute;
    bottom: 10px;
    left: 12px;
    right: 12px;
    padding: 6px 10px;
    border-radius: 4px;
    background: rgba(5, 6, 10, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #c5cae9;
    pointer-events: none;
  }
</style>

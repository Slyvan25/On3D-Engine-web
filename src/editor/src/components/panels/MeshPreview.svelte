<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";
  import { resourceStore } from "../../stores/resourceStore";
  import type { ResourceManager } from "@engine/resource/resource-manager";

  export let meshName: string | null = null;

  let container: HTMLDivElement | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let animationFrame: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let currentMesh: THREE.Mesh | null = null;
  let currentMeshName: string | null = null;
  let loadError: string | null = null;

  $: resourceManager = $resourceStore.resourceManager;

  $: if (renderer && scene && camera) {
    refreshPreview(meshName, resourceManager);
  }

  onMount(() => {
    if (!container) return;

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(globalThis.devicePixelRatio ?? 1);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.5, 3);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 1.0);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 5, 2);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    grid.position.y = -1.5;
    scene.add(grid);

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

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

    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      if (currentMesh) {
        currentMesh.rotation.y += 0.01;
      }
      renderer?.render(scene!, camera!);
    };

    animate();
  });

  onDestroy(() => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }
    resizeObserver?.disconnect();
    disposeCurrentMesh();
    renderer?.dispose();
    renderer = null;
    scene = null;
    camera = null;
  });

  function disposeCurrentMesh() {
    if (!currentMesh || !scene) return;
    scene.remove(currentMesh);
    (currentMesh.geometry as THREE.BufferGeometry).dispose();
    if (Array.isArray(currentMesh.material)) {
      currentMesh.material.forEach((mat) => mat.dispose());
    } else {
      currentMesh.material.dispose();
    }
    currentMesh = null;
    currentMeshName = null;
  }

  function refreshPreview(name: string | null, manager: ResourceManager | null) {
    if (!scene || !camera) return;

    if (!name || !manager) {
      disposeCurrentMesh();
      loadError = null;
      return;
    }

    if (currentMeshName === name) {
      return;
    }

    let meshData;
    try {
      meshData = manager.loadMesh(name);
    } catch (err) {
      console.error("Failed to load mesh", err);
      disposeCurrentMesh();
      loadError = err instanceof Error ? err.message : String(err);
      return;
    }

    disposeCurrentMesh();
    loadError = null;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(meshData.vertices, 3));
    if (meshData.normals?.length) {
      geometry.setAttribute("normal", new THREE.BufferAttribute(meshData.normals, 3));
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
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: 0xdedede,
      metalness: 0.1,
      roughness: 0.8,
      flatShading: false,
    });

    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);
    currentMeshName = name;

    const radius = geometry.boundingSphere?.radius ?? 1;
    const distance = radius * 2.5;
    camera.position.set(radius * 1.5, radius * 1.2, distance);
    camera.lookAt(0, 0, 0);
  }
</script>

<div class="preview-wrapper">
  <div class="preview-canvas" bind:this={container}></div>
  {#if loadError}
    <div class="preview-error" role="status">Failed to load mesh: {loadError}</div>
  {/if}
</div>

<style>
  .preview-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .preview-canvas {
    width: 100%;
    height: 100%;
    min-height: 200px;
    background: radial-gradient(circle at top, #202030, #101018);
    border-radius: 4px;
    border: 1px solid #23233a;
    overflow: hidden;
  }

  .preview-error {
    position: absolute;
    inset: 8px;
    border-radius: 4px;
    background: rgba(16, 16, 24, 0.9);
    border: 1px solid #5b1f1f;
    color: #ffb4b4;
    font-size: 13px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>

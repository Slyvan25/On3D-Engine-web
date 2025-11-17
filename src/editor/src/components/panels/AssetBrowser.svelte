<script lang="ts">
  import { resourceStore } from "../../stores/resourceStore";
  import { editorState } from "../../stores/editorStore";
  import { SceneSerializer } from "../../../../engine/resource/scene-format";
  import MeshPreview from "./MeshPreview.svelte";

  let selectedMesh: string | null = null;

  $: resources = $resourceStore;
  $: engine = $editorState.engine;

  $: if (selectedMesh && !resources.meshes.includes(selectedMesh)) {
    selectedMesh = null;
  }

  const hasPackLoaded = () => Boolean(resources.resourceManager);

  async function loadScene(name: string) {
    if (!engine) return;

    const rm = resources.resourceManager;
    if (!rm) return;

    const scene = await rm.loadScene(name);
    if (!scene) return;

    SceneSerializer.applyToScene(scene.root, engine.sceneManager.root);
  }

  function selectMesh(name: string) {
    selectedMesh = name;
  }
</script>

<div class="asset-browser">
  <div class="asset-list">
    <div class="section">
      <div class="title">Scenes</div>
      {#if resources.scenes.length === 0}
        <div class="empty">No scenes in pack</div>
      {:else}
        {#each resources.scenes as scene}
          <button type="button" class="item" on:click={() => loadScene(scene)}>
            {scene}
          </button>
        {/each}
      {/if}
    </div>

    <div class="section">
      <div class="title">Meshes</div>
      {#if resources.meshes.length === 0}
        <div class="empty">No meshes in pack</div>
      {:else}
        {#each resources.meshes as mesh}
          <button
            type="button"
            class:item-active={selectedMesh === mesh}
            class="item"
            on:click={() => selectMesh(mesh)}
          >
            {mesh}
          </button>
        {/each}
      {/if}
    </div>

    <div class="section">
      <div class="title">Materials</div>
      {#if resources.materials.length === 0}
        <div class="empty">No materials in pack</div>
      {:else}
        {#each resources.materials as mat}
          <div class="item passive">{mat}</div>
        {/each}
      {/if}
    </div>

    <div class="section">
      <div class="title">Collisions</div>
      {#if resources.collisions.length === 0}
        <div class="empty">No collisions in pack</div>
      {:else}
        {#each resources.collisions as col}
          <div class="item passive">{col}</div>
        {/each}
      {/if}
    </div>
  </div>

  <div class="preview-pane">
    <div class="preview-header">Mesh Preview</div>
    <div class="preview-body">
      {#if !hasPackLoaded()}
        <div class="placeholder">Import a .pack file to preview meshes.</div>
      {:else if !selectedMesh}
        <div class="placeholder">Select a mesh to see a real-time preview.</div>
      {:else}
        <MeshPreview meshName={selectedMesh} />
      {/if}
    </div>
    {#if selectedMesh}
      <div class="preview-footer">
        {selectedMesh}
      </div>
    {/if}
  </div>
</div>

<style>
  .asset-browser {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .asset-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }

  .section {
    margin-bottom: 12px;
  }

  .title {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 4px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .item {
    padding: 4px;
    cursor: pointer;
    font-size: 13px;
    border-radius: 3px;
    transition: background 0.2s;
    background: transparent;
    border: none;
    color: inherit;
    width: 100%;
    text-align: left;
    font: inherit;
  }

  .item:hover {
    background: #303044;
  }

  .item.passive {
    cursor: default;
    background: transparent;
    pointer-events: none;
  }

  .item-active {
    background: #3b3b5e;
    color: #fff;
  }

  .empty {
    font-size: 12px;
    color: #666;
    padding: 2px 4px;
  }

  .preview-pane {
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px solid #23233a;
    display: flex;
    flex-direction: column;
  }

  .preview-header {
    font-size: 11px;
    letter-spacing: 0.08em;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .preview-body {
    flex: 0 0 260px;
    min-height: 220px;
  }

  .preview-footer {
    margin-top: 4px;
    font-size: 12px;
    color: #bbb;
    word-break: break-all;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 13px;
    color: #666;
    background: #101018;
    border-radius: 4px;
    border: 1px dashed #23233a;
  }
</style>

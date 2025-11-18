<script lang="ts">
  import { resourceStore, type AssetFile, type AssetFolder } from "../../stores/resourceStore";
  import { editorState } from "../../stores/editorStore";
  import { SceneSerializer } from "../../../../engine/resource/scene-format";
  import MeshPreview from "./MeshPreview.svelte";
  import AssetTreeNode from "./AssetTreeNode.svelte";

  let selectedMesh: string | null = null;
  let selectedFile: string | null = null;
  let expandedPaths = new Set<string>();
  let expandedInitialized = false;

  let tree: AssetFolder = { type: "folder", name: "", path: "", children: [] };

  $: resources = $resourceStore;
  $: engine = $editorState.engine;
  $: tree = resources.tree ?? tree;

  $: if (selectedMesh && !resources.meshes.includes(selectedMesh)) {
    selectedMesh = null;
  }

  $: if (selectedFile && !resources.files.includes(selectedFile)) {
    selectedFile = null;
  }

  $: if (!resources.pack) {
    expandedPaths = new Set();
    expandedInitialized = false;
  }

  $: if (!expandedInitialized && tree.children.length > 0) {
    expandedPaths = new Set(
      tree.children.filter((child) => child.type === "folder").map((child) => child.path),
    );
    expandedInitialized = true;
  }

  const hasPackLoaded = () => Boolean(resources.resourceManager);

  async function loadScene(path: string) {
    if (!engine) return;

    const rm = resources.resourceManager;
    if (!rm) return;

    const scene = await rm.loadScene(path);
    SceneSerializer.applyToScene(scene.root, engine.sceneManager.root);
  }

  function handleFileSelect(file: AssetFile) {
    selectedFile = file.path;

    if (file.extension === ".scene") {
      loadScene(file.path);
      selectedMesh = null;
      return;
    }

    if (file.extension === ".mesh") {
      selectedMesh = file.path;
      return;
    }

    selectedMesh = null;
  }

  function toggleFolder(path: string) {
    expandedPaths = new Set(expandedPaths);
    if (expandedPaths.has(path)) {
      expandedPaths.delete(path);
    } else {
      expandedPaths.add(path);
    }
  }

  function startNewScene() {
    if (!engine) return;
    const suggestion = "Untitled";
    const input = prompt("Name your new scene", suggestion);
    if (input === null) return;
    const name = input.trim() || suggestion;

    const scene = SceneSerializer.createEmpty(name);
    SceneSerializer.applyToScene(scene.root, engine.sceneManager.root);
    selectedMesh = null;
    selectedFile = null;
  }
</script>

<div class="asset-browser">
  <div class="tree-pane">
    <div class="tree-header">
      <div class="title">Assets</div>
      <button type="button" class="new-scene" on:click={startNewScene}>
        New Scene
      </button>
    </div>

    {#if tree.children.length === 0}
      <div class="tree-empty">
        {#if resources.pack}
          This pack doesn't contain any files yet.
        {:else}
          Import a .pack file to browse and preview assets.
        {/if}
      </div>
    {:else}
      <div class="tree-scroll">
        {#each tree.children as child (child.path)}
          <AssetTreeNode
            node={child}
            depth={0}
            expanded={expandedPaths}
            toggleFolder={toggleFolder}
            selectFile={handleFileSelect}
            selectedFile={selectedFile}
          />
        {/each}
      </div>
    {/if}
  </div>

  <div class="preview-pane">
    <div class="preview-header">Mesh Preview</div>
    <div class="preview-body">
      {#if selectedMesh}
        {#if hasPackLoaded()}
          <MeshPreview meshName={selectedMesh} />
        {:else}
          <div class="placeholder">Preview unavailable until the pack finishes loading.</div>
        {/if}
      {:else if hasPackLoaded()}
        <div class="placeholder">Select a .mesh file to see a real-time preview.</div>
      {:else}
        <div class="placeholder">Import a .pack file to preview meshes.</div>
      {/if}
    </div>
    <div class="preview-footer">
      {#if selectedMesh}
        {selectedMesh}
      {:else}
        Click any mesh file in the tree to spin up the preview.
      {/if}
    </div>
  </div>
</div>

<style>
  .asset-browser {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .tree-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .title {
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a0a0c0;
  }

  .new-scene {
    border: 1px solid #3b3b5e;
    background: #252536;
    color: #f4f4ff;
    font-size: 12px;
    padding: 3px 8px;
    cursor: pointer;
  }

  .tree-scroll {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
  }

  .tree-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 13px;
    color: #7c7c92;
    padding: 24px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.08);
    border-radius: 4px;
  }

  .preview-pane {
    margin-top: 10px;
    padding-top: 10px;
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
    min-height: 18px;
  }

  .placeholder {
    font-size: 13px;
    color: #7c7c90;
    padding: 12px;
    text-align: center;
  }
</style>

<script lang="ts">
  import { resourceStore } from "../../stores/resourceStore";
  import { get } from "svelte/store";
  import { editorState } from "../../stores/editorStore";
  import { SceneSerializer } from "../../../../engine/resource/scene-format";

  $: resources = $resourceStore;
  $: engine = $editorState.engine;

  async function loadScene(name: string) {
    if (!engine) return;

    const rm = resources.resourceManager;
    if (!rm) return;

    const scene = await rm.loadScene(name);
    if (!scene) return;

    SceneSerializer.applyToScene(scene.root, engine.sceneManager.root);
  }
</script>

<div>
  <div class="section">
    <div class="title">Scenes</div>
    {#each resources.scenes as scene}
      <div class="item" on:click={() => loadScene(scene)}>
        {scene}
      </div>
    {/each}
  </div>

  <div class="section">
    <div class="title">Meshes</div>
    {#each resources.meshes as mesh}
      <div class="item">{mesh}</div>
    {/each}
  </div>

  <div class="section">
    <div class="title">Materials</div>
    {#each resources.materials as mat}
      <div class="item">{mat}</div>
    {/each}
  </div>

  <div class="section">
    <div class="title">Collisions</div>
    {#each resources.collisions as col}
      <div class="item">{col}</div>
    {/each}
  </div>
</div>

<style>
  .section {
    margin-bottom: 12px;
  }
  .title {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 4px;
    color: #aaa;
  }
  .item {
    padding: 4px;
    cursor: pointer;
    font-size: 13px;
  }
  .item:hover {
    background: #303044;
  }
</style>

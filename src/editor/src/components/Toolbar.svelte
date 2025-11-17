<script lang="ts">
  import { editorMode, setMode, editorState } from "../stores/editorStore";
  import { get } from "svelte/store";
  import { SceneSerializer } from "../../../engine/resource/serialization/scene-serializer";

  import { loadPackFromFile, resourceStore } from "../stores/resourceStore";
  import { PackWriter } from "../../../engine/resource/pack";

  $: mode = $editorMode;

  function newScene() {
    const { engine } = get(editorState);
    if (!engine) return;
    const root = engine.sceneManager.root;
    root.object3D.clear();
    root.object3D.position.set(0, 0, 0);
    root.object3D.rotation.set(0, 0, 0);
    root.object3D.scale.set(1, 1, 1);
  }

  async function saveScene() {
    const { engine } = get(editorState);
    if (!engine) return;

    const file = SceneSerializer.serialize(engine.sceneManager.root);
    const blob = new Blob([JSON.stringify(file, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name ?? "scene"}.scene.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadScene() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.scene,.scene.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const json = JSON.parse(text);

      const { engine } = get(editorState);
      if (!engine) return;

      SceneSerializer.deserialize(json, engine.sceneManager.root);
    };
    input.click();
  }
  function importPack() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pack";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      await loadPackFromFile(file);
    };
    input.click();
  }

  function exportPack() {
    const res = get(resourceStore);
    if (!res.pack) return;

    const buf = PackWriter.toArrayBuffer(res.pack);
    const blob = new Blob([buf]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "export.pack";
    a.click();
  }
</script>

<div class="toolbar">
  <div style="font-weight:bold; margin-right:16px;">WebOn3D Editor</div>

  <button on:click={newScene}>New</button>
  <button on:click={loadScene}>Open</button>
  <button on:click={saveScene}>Save</button>
  <button on:click={importPack}>Import Pack</button>
  <button on:click={exportPack}>Export Pack</button>

  <div style="margin-left:16px; display:flex; gap:4px;">
    <button
      class:active={mode === "translate"}
      on:click={() => setMode("translate")}
    >
      Move
    </button>
    <button
      class:active={mode === "rotate"}
      on:click={() => setMode("rotate")}
      disabled
    >
      Rotate
    </button>
    <button
      class:active={mode === "scale"}
      on:click={() => setMode("scale")}
      disabled
    >
      Scale
    </button>
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    gap: 8px;
    padding: 4px 8px;
    background: #181822;
    border-bottom: 1px solid #23233a;
    align-items: center;
  }
  .toolbar button {
    background: #26263a;
    color: #eee;
    border: 1px solid #343456;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
  }
  .toolbar button.active {
    background: #3b82f6;
    border-color: #60a5fa;
  }
</style>

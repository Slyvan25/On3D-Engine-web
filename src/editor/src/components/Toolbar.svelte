<script lang="ts">
  import { editorMode, setMode, editorState } from "../stores/editorStore";
  import { get } from "svelte/store";
  import { SceneSerializer } from "../../../engine/resource/serialization/scene-serializer";

  import { loadPackFromFile, resourceStore } from "../stores/resourceStore";
  import { PackWriter } from "../../../engine/resource/pack";
  import {
    resetDockLayout,
    saveDockLayoutState,
    loadSavedDockLayout,
  } from "../stores/dockStore";

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

  function saveLayout() {
    saveDockLayoutState();
  }

  function restoreLayout() {
    loadSavedDockLayout();
  }
</script>

<div class="toolbar">
  <div class="brand">On3D Editor</div>

  <div class="button-group">
    <button on:click={newScene}>New Scene</button>
    <button on:click={loadScene}>Open</button>
    <button on:click={saveScene}>Save</button>
  </div>

  <div class="button-group">
    <button on:click={importPack}>Import Pack</button>
    <button on:click={exportPack}>Export Pack</button>
  </div>

  <div class="button-group">
    <button on:click={saveLayout}>Save Layout</button>
    <button on:click={restoreLayout}>Load Layout</button>
    <button on:click={resetDockLayout}>Reset Layout</button>
  </div>

  <div class="spacer" />

  <div class="mode-group">
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
    gap: 12px;
    padding: 8px 16px;
    background: linear-gradient(180deg, #161820, #0f1118);
    border-bottom: 1px solid #1f2130;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
  }

  .brand {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.28em;
    color: #e0e7ff;
    font-size: 13px;
    padding-right: 16px;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }

  .button-group,
  .mode-group {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .mode-group {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    padding: 4px;
  }

  .toolbar button {
    background: #242637;
    color: #d7dbff;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 12px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .toolbar button:hover:not(:disabled) {
    background: #2f3249;
  }

  .toolbar button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .mode-group button.active {
    background: linear-gradient(180deg, #3d7bff, #3356d5);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 10px rgba(61, 123, 255, 0.35);
  }

  .spacer {
    flex: 1;
  }
</style>

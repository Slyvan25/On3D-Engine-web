<script lang="ts">
  import { onMount } from "svelte";
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import WebOn3DEngine from "../../engine/engine";
  import { setEngine } from "./stores/editorStore";

  import Toolbar from "./components/Toolbar.svelte";
  import HierarchyPanel from "./components/HierarchyPanel.svelte";
  import InspectorPanel from "./components/InspectorPanel.svelte";
  // import HierarchyPanel from "./components/HierarchyPanel.svelte";
  import Viewport from "./components/Viewport.svelte";
  import AssetBrowser from "./components/panels/AssetBrowser.svelte";

  let canvasEl: HTMLCanvasElement | null = null;

  onMount(async () => {
    if (!canvasEl) return;

    const engine = await WebOn3DEngine.create({
      canvas: canvasEl,
      width: canvasEl.clientWidth || window.innerWidth,
      height: canvasEl.clientHeight || window.innerHeight,
      renderer: "three",
    });

    setEngine(engine);

    engine.start();

    window.addEventListener("resize", () => {
      if (!canvasEl) return;
      engine.renderSystem.setSize(window.innerWidth, window.innerHeight);
    });
  });
</script>

<div class="app-shell">
  <Toolbar />

  <Splitpanes class="editor-layout">
    <Pane size={15} minSize={10}>
      <div class="panel">
        <div class="panel-header">Hierarchy</div>
        <div class="panel-body">
          <HierarchyPanel />
        </div>
      </div>
    </Pane>
    <Pane>
      <Splitpanes horizontal>
        <Pane>
          <div class="panel">
            <div class="panel-header">Scene View</div>
            <div class="panel-body" style="padding:0;">
              <Viewport bind:canvasEl />
            </div>
          </div>
        </Pane>
        <Pane size={30} minSize={10}>
          <div class="panel">
            <div class="panel-header">Assets</div>
            <div class="panel-body">
              <AssetBrowser />
            </div>
          </div>
        </Pane>
      </Splitpanes>
    </Pane>
    <Pane size={18} minSize={10}>
      <div class="panel">
        <div class="panel-header">Inspector</div>
        <div class="panel-body">
          <InspectorPanel />
        </div>
      </div>
    </Pane>
  </Splitpanes>
</div>

<style>
  .app-shell {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
  }

  .editor-layout {
    background: #101015;
  }

  .panel {
    background: #181822;
    border-radius: 4px;
    /* The border is now handled by the splitter */
    /* border: 1px solid #23233a; */
    border: 1px solid #23233a;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    padding: 4px 8px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #aaa;
    border-bottom: 1px solid #23233a;
  }

  .panel-body {
    flex: 1;
    overflow: auto;
    padding: 6px;
  }

  :global(.splitpanes__pane) {
    background: #101015 !important;
  }

  :global(.splitpanes__splitter) {
    background-color: #101015;
    position: relative;
    border: none;
  }

  :global(.splitpanes__splitter:before) {
    content: "";
    background-color: #23233a;
    transition: background-color 0.3s;
  }
</style>

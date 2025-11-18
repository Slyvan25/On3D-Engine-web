<script lang="ts">
  import { onMount } from "svelte";
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import WebOn3DEngine from "../../engine/engine";
  import { setEngine } from "./stores/editorStore";

  import Toolbar from "./components/Toolbar.svelte";
  import DockZone from "./components/DockZone.svelte";

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
    <Pane size={18} minSize={10}>
      <DockZone zoneId="left" bind:viewportCanvas={canvasEl} />
    </Pane>
    <Pane>
      <Splitpanes horizontal>
        <Pane>
          <DockZone zoneId="center" bind:viewportCanvas={canvasEl} />
        </Pane>
        <Pane size={32} minSize={12}>
          <DockZone zoneId="bottom" bind:viewportCanvas={canvasEl} />
        </Pane>
      </Splitpanes>
    </Pane>
    <Pane size={20} minSize={12}>
      <DockZone zoneId="right" bind:viewportCanvas={canvasEl} />
    </Pane>
  </Splitpanes>
</div>

<style>
  .app-shell {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
  }

  :global(.editor-layout) {
    background: #101015;
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

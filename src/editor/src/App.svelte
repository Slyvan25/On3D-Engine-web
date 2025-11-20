<script lang="ts">
  import { onMount } from "svelte";
  import { Splitpanes, Pane } from "svelte-splitpanes";
  import WebOn3DEngine from "../../engine/engine";
  import { setEngine } from "./stores/editorStore";

  import Toolbar from "./components/Toolbar.svelte";
  import DockZone from "./components/DockZone.svelte";

  let canvasEl: HTMLCanvasElement | null = null;
  const PANE_STORAGE_KEY = "on3d-editor-pane-sizes";
  let paneSizes = { left: 18, right: 22, bottom: 32 };
  let panesLoaded = false;

  onMount(async () => {
    if (!canvasEl) return;

    loadStoredPaneSizes();

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

  function loadStoredPaneSizes() {
    if (panesLoaded || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PANE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        paneSizes = {
          left: parsed.left ?? paneSizes.left,
          right: parsed.right ?? paneSizes.right,
          bottom: parsed.bottom ?? paneSizes.bottom,
        };
      }
    } catch (err) {
      console.warn("App: failed to restore pane sizes", err);
    }
    panesLoaded = true;
  }

  function persistPaneSizes(next: typeof paneSizes) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PANE_STORAGE_KEY, JSON.stringify(next));
  }

  function handlePrimaryResize(event: CustomEvent<any>) {
    const panes = event.detail?.panes ?? [];
    if (panes.length < 3) return;
    paneSizes = { ...paneSizes, left: panes[0].size, right: panes[2].size };
    persistPaneSizes(paneSizes);
  }

  function handleCenterResize(event: CustomEvent<any>) {
    const panes = event.detail?.panes ?? [];
    if (panes.length < 2) return;
    paneSizes = { ...paneSizes, bottom: panes[1].size };
    persistPaneSizes(paneSizes);
  }
</script>

<div class="app-shell">
  <Toolbar />

  <div class="workspace">
    <Splitpanes class="editor-layout" on:resized={handlePrimaryResize}>
      <Pane size={paneSizes.left} minSize={12}>
        <DockZone zoneId="left" bind:viewportCanvas={canvasEl} />
      </Pane>
      <Pane>
        <Splitpanes horizontal on:resized={handleCenterResize}>
          <Pane>
            <DockZone zoneId="center" bind:viewportCanvas={canvasEl} />
          </Pane>
          <Pane size={paneSizes.bottom} minSize={18}>
            <DockZone zoneId="bottom" bind:viewportCanvas={canvasEl} />
          </Pane>
        </Splitpanes>
      </Pane>
      <Pane size={paneSizes.right} minSize={14}>
        <DockZone zoneId="right" bind:viewportCanvas={canvasEl} />
      </Pane>
    </Splitpanes>
  </div>
</div>

<style>
  .app-shell {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
    background: #08090f;
  }

  .workspace {
    min-height: 0;
    height: 100%;
    padding: 12px;
    background: radial-gradient(circle at top, rgba(28, 31, 51, 0.6), #06070d);
    box-sizing: border-box;
  }

  :global(.editor-layout) {
    height: 100%;
    background: transparent;
  }

  :global(.splitpanes__pane) {
    background: transparent !important;
    min-height: 0;
  }

  :global(.splitpanes__splitter) {
    background-color: transparent;
    border: none;
    position: relative;
  }

  :global(.splitpanes__splitter::before) {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 999px;
  }
</style>

<script lang="ts">
  import HierarchyPanel from "./HierarchyPanel.svelte";
  import InspectorPanel from "./InspectorPanel.svelte";
  import Viewport from "./Viewport.svelte";
  import AssetBrowser from "./panels/AssetBrowser.svelte";
  import ThreeEditorPanel from "./panels/ThreeEditorPanel.svelte";
  import type { PanelId } from "../stores/dockStore";

  export let panelId: PanelId;
  export let canvasEl: HTMLCanvasElement | null = null;
</script>

{#if panelId === "hierarchy"}
  <HierarchyPanel />
{:else if panelId === "viewport"}
  <Viewport bind:canvasEl />
{:else if panelId === "assets"}
  <AssetBrowser />
{:else if panelId === "inspector"}
  <InspectorPanel />
{:else if panelId === "three-editor"}
  <ThreeEditorPanel />
{:else}
  <div class="unknown-panel">Unknown panel: {panelId}</div>
{/if}

<style>
  .unknown-panel {
    padding: 8px;
    font-size: 13px;
    color: #ff7b7b;
  }
</style>

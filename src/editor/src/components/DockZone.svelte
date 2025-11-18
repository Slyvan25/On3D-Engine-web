<script lang="ts">
  import { dndzone } from "svelte-dnd-action";
  import { dockLayout, movePanel, setActivePanel } from "../stores/dockStore";
  import type { DockZoneId, PanelId } from "../stores/dockStore";
  import PanelRenderer from "./PanelRenderer.svelte";

  export let zoneId: DockZoneId;
  export let viewportCanvas: HTMLCanvasElement | null = null;

  const panelTitles: Record<PanelId, string> = {
    hierarchy: "Hierarchy",
    viewport: "Scene View",
    assets: "Assets",
    inspector: "Inspector",
    "scene-viewer": "Scene Viewer",
  };

  $: layout = $dockLayout[zoneId];
  $: panels = layout?.panels ?? [];
  $: activePanelId = layout?.active ?? panels[0] ?? null;
  $: activePanelId = activePanelId && panels.includes(activePanelId)
    ? activePanelId
    : panels[0] ?? null;
  $: if (layout && layout.active !== activePanelId) {
    // keep layout active in sync if our derived fallback changed
    if (activePanelId) {
      setActivePanel(zoneId, activePanelId);
    }
  }

  function handleTabClick(panelId: PanelId) {
    setActivePanel(zoneId, panelId);
  }

  $: tabItems = panels.map((panelId) => ({ id: panelId }));

  function handleDndFinalize(event: CustomEvent<any>) {
    const info = event.detail?.info;
    const destination = info?.destination;
    const draggedId = info?.dragged?.id as PanelId | undefined;
    if (!destination || !draggedId) return;
    movePanel(draggedId, destination.zone as DockZoneId, destination.index);
  }
</script>

<div class="dock-zone" role="region" aria-label={`Panel dock ${zoneId}`}>
  <div
    class="tab-bar"
    use:dndzone={{ items: tabItems, zone: zoneId }}
    on:finalize={handleDndFinalize}
  >
    {#if panels.length === 0}
      <div class="tab tab-empty">Drop a panel tab here</div>
    {:else}
      {#each panels as panelId}
        <button
          type="button"
          class:tab-active={panelId === activePanelId}
          class="tab"
          draggable
          data-dnd-id={panelId}
          on:click={() => handleTabClick(panelId)}
        >
          {panelTitles[panelId]}
        </button>
      {/each}
    {/if}
  </div>
  <div class="dock-content">
    {#if activePanelId}
      <PanelRenderer panelId={activePanelId} bind:canvasEl={viewportCanvas} />
    {:else}
      <div class="empty-state">Drag a panel tab above to show it here.</div>
    {/if}
  </div>
</div>

<style>
  .dock-zone {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    border: 1px solid #1d1d2b;
    border-radius: 6px;
    background: linear-gradient(180deg, #191a25, #13141d);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  }

  .tab-bar {
    display: flex;
    gap: 4px;
    padding: 6px 8px;
    background: #0e0f16;
    border-bottom: 1px solid #1f2030;
    min-height: 36px;
    align-items: center;
    overflow-x: auto;
  }

  .tab {
    appearance: none;
    border: none;
    background: #1f2130;
    color: #aeb4d9;
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: grab;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    transition: background 0.2s, color 0.2s;
    white-space: nowrap;
  }

  .tab:not(.tab-empty):hover {
    background: #2b2d42;
    color: #fff;
  }

  .tab:active {
    cursor: grabbing;
  }

  .tab-active {
    background: linear-gradient(180deg, #3d4a7e, #2d3562);
    color: #fff;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  .tab-empty {
    flex: 1;
    text-align: center;
    font-style: italic;
    cursor: default;
    color: #5c607c;
    border: 1px dashed #292c44;
    padding: 6px 10px;
  }

  .dock-content {
    flex: 1;
    padding: 8px;
    overflow: hidden;
    min-height: 0;
  }

  .empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #7a7f9f;
    border: 1px dashed #2f3350;
    border-radius: 4px;
    background: rgba(10, 11, 18, 0.6);
  }
</style>

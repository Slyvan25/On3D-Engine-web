<script lang="ts">
  import { dockLayout, movePanel, setActivePanel } from "../stores/dockStore";
  import type { DockZoneId, PanelId } from "../stores/dockStore";
  import PanelRenderer from "./PanelRenderer.svelte";

  export let zoneId: DockZoneId;
  export let viewportCanvas: HTMLCanvasElement | null = null;

  const TAB_DRAG_TYPE = "application/x-on3d-panel";

  const panelTitles: Record<PanelId, string> = {
    hierarchy: "Hierarchy",
    viewport: "Scene View",
    assets: "Assets",
    inspector: "Inspector",
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

  function handleTabDragStart(event: DragEvent, panelId: PanelId) {
    event.dataTransfer?.setData(TAB_DRAG_TYPE, JSON.stringify({ panelId }));
    event.dataTransfer?.setData("text/plain", panelTitles[panelId]);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  function handleTabDragOver(event: DragEvent) {
    if (!event.dataTransfer?.types.includes(TAB_DRAG_TYPE)) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  function handleTabDrop(event: DragEvent, index: number) {
    if (!event.dataTransfer?.types.includes(TAB_DRAG_TYPE)) return;
    event.preventDefault();
    const payload = event.dataTransfer.getData(TAB_DRAG_TYPE);
    if (!payload) return;
    const { panelId } = JSON.parse(payload) as { panelId: PanelId };
    movePanel(panelId, zoneId, index);
  }

  function handleBodyDrop(event: DragEvent) {
    if (!event.dataTransfer?.types.includes(TAB_DRAG_TYPE)) return;
    event.preventDefault();
    const payload = event.dataTransfer.getData(TAB_DRAG_TYPE);
    if (!payload) return;
    const { panelId } = JSON.parse(payload) as { panelId: PanelId };
    movePanel(panelId, zoneId);
  }
</script>

<div
  class="dock-zone"
  role="region"
  aria-label={`Panel dock ${zoneId}`}
  on:dragover|preventDefault={handleTabDragOver}
  on:drop={handleBodyDrop}
>
  <div class="tab-bar">
    {#if panels.length === 0}
      <div class="tab tab-empty">Drop a panel tab here</div>
    {:else}
      {#each panels as panelId, index}
        <button
          type="button"
          class:tab-active={panelId === activePanelId}
          class="tab"
          draggable
          on:click={() => handleTabClick(panelId)}
          on:dragstart={(event) => handleTabDragStart(event, panelId)}
          on:dragover={(event) => handleTabDragOver(event)}
          on:drop={(event) => handleTabDrop(event, index)}
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
    border: 1px solid #23233a;
    border-radius: 4px;
    background: #181822;
    overflow: hidden;
  }

  .tab-bar {
    display: flex;
    gap: 2px;
    padding: 4px;
    background: #14141f;
    border-bottom: 1px solid #23233a;
    min-height: 32px;
    align-items: center;
  }

  .tab {
    appearance: none;
    border: none;
    background: #1f1f2b;
    color: #bbb;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }

  .tab:not(.tab-empty):hover {
    background: #2c2c3c;
    color: #fff;
  }

  .tab-active {
    background: #3b3b5e;
    color: #fff;
  }

  .tab-empty {
    width: 100%;
    text-align: center;
    font-style: italic;
    cursor: default;
  }

  .dock-content {
    flex: 1;
    padding: 6px;
    overflow: hidden;
  }

  .empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #666;
    border: 1px dashed #2f2f44;
    border-radius: 4px;
    background: #101018;
  }
</style>

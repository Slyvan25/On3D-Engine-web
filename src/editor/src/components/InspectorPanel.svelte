<script lang="ts">
  import { selectedNode } from "../stores/editorStore";

  $: node = $selectedNode;

  function changePos(axis: "x" | "y" | "z", ev: Event) {
    if (!node) return;
    const v = parseFloat((ev.target as HTMLInputElement).value) || 0;
    node.object3D.position[axis] = v;
  }

  function changeScale(axis: "x" | "y" | "z", ev: Event) {
    if (!node) return;
    const v = parseFloat((ev.target as HTMLInputElement).value) || 1;
    node.object3D.scale[axis] = v;
  }
</script>

{#if node}
  <div style="font-size:13px;">
    <div style="margin-bottom:8px; font-weight:bold;">
      {node.name || "(unnamed)"}
    </div>

    <div style="margin-bottom:4px;">Position</div>
    <div style="display:flex; gap:4px; margin-bottom:8px;">
      <input
        type="number"
        step="0.1"
        value={node.object3D.position.x}
        on:change={(e) => changePos("x", e)}
      />
      <input
        type="number"
        step="0.1"
        value={node.object3D.position.y}
        on:change={(e) => changePos("y", e)}
      />
      <input
        type="number"
        step="0.1"
        value={node.object3D.position.z}
        on:change={(e) => changePos("z", e)}
      />
    </div>

    <div style="margin-bottom:4px;">Scale</div>
    <div style="display:flex; gap:4px;">
      <input
        type="number"
        step="0.1"
        value={node.object3D.scale.x}
        on:change={(e) => changeScale("x", e)}
      />
      <input
        type="number"
        step="0.1"
        value={node.object3D.scale.y}
        on:change={(e) => changeScale("y", e)}
      />
      <input
        type="number"
        step="0.1"
        value={node.object3D.scale.z}
        on:change={(e) => changeScale("z", e)}
      />
    </div>
  </div>
{:else}
  <div style="font-size:13px; color:#888;">No selection</div>
{/if}

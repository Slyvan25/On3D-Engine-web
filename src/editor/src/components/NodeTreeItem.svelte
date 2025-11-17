<script lang="ts">
  import { selectNode, selectedNode } from "../stores/editorStore";
  import type { SceneNode } from "@engine/scene/scene-node.ts";

  export let node: SceneNode;
  export let depth: number = 0;

  $: isSelected = $selectedNode === node;

  function getChildren(sceneNode: SceneNode): SceneNode[] {
    const children = sceneNode.object3D.children || [];
    return children
      .map((child) => {
        const ref = (child as any).__sceneNodeRef as SceneNode | undefined;
        return ref || null;
      })
      .filter((n): n is SceneNode => n !== null);
  }

  $: children = getChildren(node);
</script>

<div class="node-item">
  <button
    type="button"
    class="node-label"
    class:selected={isSelected}
    style={`padding-left:${depth * 12}px;`}
    on:click={() => selectNode(node)}
  >
    {node.name || "(unnamed)"}
  </button>

  {#each children as child (child)}
    <svelte:self node={child} depth={depth + 1} />
  {/each}
</div>

<style>
  .node-item {
    font-size: 13px;
  }

  .node-label {
    cursor: pointer;
    padding: 4px 0;
    user-select: none;
    border: none;
    background: transparent;
    color: inherit;
    width: 100%;
    text-align: left;
    font: inherit;
  }

  .node-label:hover {
    background: #3d3f52;
  }

  .selected {
    background: #2f3244;
    color: #fff;
  }
</style>

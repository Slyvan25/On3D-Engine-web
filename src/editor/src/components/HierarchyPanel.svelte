<script lang="ts">
  import { editorState, selectNode, selectedNode } from "../stores/editorStore";
  import type { SceneNode } from "../../../engine/scene/scene-node";
  import NodeTreeItem from "./NodeTreeItem.svelte";

  $: state = $editorState;

  function getChildren(node: SceneNode): SceneNode[] {
    return (node.object3D.children ?? [])
      .map((c: any) => (c.__sceneNodeRef as SceneNode) ?? null)
      .filter(Boolean);
  }

  export let root: SceneNode;
  export let depth: number;

  $: isSelected = $selectedNode === root;
</script>

{#if state.rootNode}
  {#each [state.rootNode] as root}
    {#key root}
      <NodeTreeItem node={root} depth={0} />
    {/key}
  {/each}
{:else}
  <div>No scene.</div>
{/if}

<!-- <svelte:component this={undefined} /> -->

<!-- <div
  class="node {isSelected ? 'selected' : ''}"
  style={`padding-left:${depth * 12}px`}
  on:click={() => selectNode(root)}
>
  {root..name || "(unnamed)"}
</div> -->

{#each getChildren(root) as child}
  <NodeTreeItem node={child} depth={depth + 1} />
{/each}

<style>
  .node {
    padding: 2px 4px;
    font-size: 13px;
    cursor: pointer;
  }
  .node.selected {
    background: #2f3244;
  }
</style>

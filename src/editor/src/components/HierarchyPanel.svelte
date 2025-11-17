<script lang="ts">
  import { editorState } from "../stores/editorStore";
  import NodeTreeItem from "./NodeTreeItem.svelte";

  $: state = $editorState;
  $: rootNode = state.rootNode;
</script>

{#if rootNode}
  <NodeTreeItem node={rootNode} depth={0} />
{:else}
  <div class="empty-state">No scene loaded.</div>
{/if}

<style>
  .empty-state {
    font-size: 13px;
    color: #808097;
    padding: 8px 4px;
  }
</style>

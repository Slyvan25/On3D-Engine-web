<script lang="ts">
  import type { AssetFile, AssetNode } from "../../stores/resourceStore";

  export let node: AssetNode;
  export let depth = 0;
  export let expanded: Set<string>;
  export let toggleFolder: (path: string) => void;
  export let selectFile: (file: AssetFile) => void;
  export let selectedFile: string | null = null;

  let padding = 0;
  let label = "";
  let isOpen = false;
  let isFolder = false;

  $: padding = depth * 14;
  $: label = node.name || (node.type === "folder" ? "root" : "file");
  $: isFolder = node.type === "folder";
  $: isOpen = isFolder && expanded.has(node.path);

  function handleFileClick(file: AssetFile) {
    selectFile(file);
  }
</script>

{#if node.type === "folder"}
  <div class="tree-item folder" style={`padding-left:${padding}px`}>
    <button type="button" class="folder-button" on:click={() => toggleFolder(node.path)}>
      <span class="chevron" class:open={isOpen}>▶</span>
      <span class="label">{label}</span>
    </button>
  </div>
  {#if isOpen}
    {#each node.children as child (child.path)}
      <svelte:self
        node={child}
        depth={depth + 1}
        expanded={expanded}
        toggleFolder={toggleFolder}
        selectFile={selectFile}
        selectedFile={selectedFile}
      />
    {/each}
  {/if}
{:else}
  <button
    type="button"
    class="tree-item file"
    class:selected={selectedFile === node.path}
    style={`padding-left:${padding + 24}px`}
    on:click={() => handleFileClick(node)}
  >
    <span class="badge">{node.extension ? node.extension.replace(".", "").toUpperCase() : "FILE"}</span>
    <span class="label">{label}</span>
  </button>
{/if}

<style>
  .tree-item {
    width: 100%;
    display: flex;
    align-items: center;
    color: #d6d6e1;
    font-size: 13px;
  }

  .folder {
    padding: 0;
  }

  .folder-button {
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 3px 0;
    cursor: pointer;
  }

  .file {
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    padding: 3px 4px;
    gap: 6px;
    cursor: pointer;
  }

  .file:hover,
  .folder-button:hover,
  .file.selected {
    background: rgba(255, 255, 255, 0.08);
  }

  .file.selected {
    color: #fff;
  }

  .badge {
    font-size: 10px;
    text-transform: uppercase;
    color: #8ab4ff;
    letter-spacing: 0.05em;
    min-width: 32px;
  }

  .chevron {
    display: inline-block;
    transition: transform 0.15s ease;
  }

  .chevron.open {
    transform: rotate(90deg);
  }

  .label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

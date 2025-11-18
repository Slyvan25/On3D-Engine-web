<script lang="ts">
  import { onDestroy } from "svelte";

  const PRIMARY_EDITOR_URL =
    "https://raw.githack.com/mrdoob/three.js/dev/editor/index.html";
  const SECONDARY_EDITOR_URL = "https://threejs.org/editor/";

  let iframeSrc = PRIMARY_EDITOR_URL;
  let iframeKey = 0;
  let loadState: "loading" | "ready" | "timeout" = "loading";
  let loadTimer: ReturnType<typeof setTimeout> | null = null;

  function buildSrc() {
    const cacheBust = Date.now();
    return `${iframeSrc}?embed=${cacheBust}`;
  }

  let currentSrc = buildSrc();

  function startLoading() {
    loadState = "loading";
    currentSrc = buildSrc();
    iframeKey += 1;
    if (loadTimer) clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
      if (loadState === "loading") {
        loadState = "timeout";
      }
    }, 15000);
  }

  function handleLoad() {
    if (loadTimer) {
      clearTimeout(loadTimer);
      loadTimer = null;
    }
    loadState = "ready";
  }

  function reloadEditor() {
    startLoading();
  }

  function swapSource() {
    iframeSrc =
      iframeSrc === PRIMARY_EDITOR_URL ? SECONDARY_EDITOR_URL : PRIMARY_EDITOR_URL;
    startLoading();
  }

  function openInNewTab() {
    window.open(iframeSrc, "_blank", "noopener,noreferrer");
  }

  startLoading();

  onDestroy(() => {
    if (loadTimer) {
      clearTimeout(loadTimer);
    }
  });
</script>

<div class="three-editor-panel">
  <header class="panel-header">
    <div>
      <h2>Three.js Editor</h2>
      <p>
        Embeds the upstream <code>dev/editor</code> app so you can author and test
        scenes without leaving On3D.
      </p>
    </div>
    <div class="actions">
      <button type="button" on:click={reloadEditor}>Reload</button>
      <button type="button" on:click={swapSource}>Swap Source</button>
      <button type="button" on:click={openInNewTab}>Open in Tab</button>
    </div>
  </header>

  <div class="iframe-wrapper">
    <iframe
      key={iframeKey}
      title="Three.js Editor"
      src={currentSrc}
      on:load={handleLoad}
      referrerpolicy="no-referrer"
    />
    {#if loadState !== "ready"}
      <div class="overlay">
        {#if loadState === "loading"}
          <span>Loading the official three.js editor…</span>
        {:else}
          <span>
            Unable to confirm the editor loaded. Try swapping the source or opening it
            in a new tab.
          </span>
        {/if}
      </div>
    {/if}
  </div>

  <p class="help-text">
    The embedded editor is hosted by the three.js project. Saving/exporting works the
    same as in the standalone editor, and any downloads will appear via your browser.
  </p>
</div>

<style>
  .three-editor-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  h2 {
    margin: 0;
    font-size: 16px;
  }

  p {
    margin: 4px 0 0;
    color: #9aa3ba;
    font-size: 13px;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  button {
    background: #2d2d42;
    border: 1px solid #3b3b5f;
    color: #e3e7ff;
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 12px;
  }

  button:hover {
    background: #3e3e62;
  }

  .iframe-wrapper {
    position: relative;
    flex: 1;
    border: 1px solid #2a2a3f;
    border-radius: 6px;
    overflow: hidden;
    background: #0b0b14;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #0b0b14;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(6, 6, 12, 0.85);
    color: #d3d7ff;
    font-size: 14px;
    text-align: center;
    padding: 0 24px;
  }

  .help-text {
    font-size: 12px;
    margin: 0;
    color: #7983a3;
  }
</style>

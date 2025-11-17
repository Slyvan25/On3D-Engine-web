import { writable, derived } from "svelte/store";
import type WebOn3DEngine from "@engine/engine.ts";
import type { SceneNode } from "@engine/scene/scene-node.ts";

export type EditorMode = "translate" | "rotate" | "scale";

export interface EditorState {
  engine: WebOn3DEngine | null;
  rootNode: SceneNode | null;
  selectedNode: SceneNode | null;
  mode: EditorMode;
}

const initial: EditorState = {
  engine: null,
  rootNode: null,
  selectedNode: null,
  mode: "translate",
};

export const editorState = writable<EditorState>(initial);

export const selectedNode = derived(editorState, (s) => s.selectedNode);
export const editorMode = derived(editorState, (s) => s.mode);

export function setEngine(engine: WebOn3DEngine) {
  editorState.update((s) => ({
    ...s,
    engine,
    rootNode: engine.sceneManager.root,
  }));
}

export function selectNode(node: SceneNode | null) {
  editorState.update((s) => ({ ...s, selectedNode: node }));
}

export function setMode(mode: EditorMode) {
  editorState.update((s) => ({ ...s, mode }));
}

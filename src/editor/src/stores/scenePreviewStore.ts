import { writable } from "svelte/store";

export const scenePreviewSelection = writable<string | null>(null);

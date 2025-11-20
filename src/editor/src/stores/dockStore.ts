import { writable, get } from "svelte/store";

export type PanelId =
  | "hierarchy"
  | "viewport"
  | "assets"
  | "inspector"
  | "scene-viewer";
export type DockZoneId = "left" | "center" | "bottom" | "right";

export interface DockZoneState {
  id: DockZoneId;
  panels: PanelId[];
  active: PanelId | null;
}

export type DockLayoutState = Record<DockZoneId, DockZoneState>;

const DEFAULT_LAYOUT: DockLayoutState = {
  left: { id: "left", panels: ["hierarchy"], active: "hierarchy" },
  center: { id: "center", panels: ["viewport"], active: "viewport" },
  bottom: {
    id: "bottom",
    panels: ["assets", "scene-viewer"],
    active: "assets",
  },
  right: { id: "right", panels: ["inspector"], active: "inspector" },
};

const STORAGE_KEY = "on3d-editor-dock-layout";
const PANEL_IDS: PanelId[] = [
  "hierarchy",
  "viewport",
  "assets",
  "inspector",
  "scene-viewer",
];

function cloneLayout(layout: DockLayoutState): DockLayoutState {
  return JSON.parse(JSON.stringify(layout));
}

function isValidLayout(value: unknown): value is DockLayoutState {
  if (!value || typeof value !== "object") return false;
  const zones: DockZoneId[] = ["left", "center", "bottom", "right"];
  const seen = new Set<PanelId>();

  for (const zoneId of zones) {
    const zone = (value as Record<string, DockZoneState>)[zoneId];
    if (!zone || !Array.isArray(zone.panels)) return false;
    for (const panel of zone.panels) {
      if (!PANEL_IDS.includes(panel as PanelId)) return false;
      if (seen.has(panel as PanelId)) return false;
      seen.add(panel as PanelId);
    }
  }

  return PANEL_IDS.every((panel) => seen.has(panel));
}

function readStoredLayout(): DockLayoutState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidLayout(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.warn("dockStore: failed to parse saved layout", err);
  }
  return null;
}

const initialLayout =
  typeof window === "undefined"
    ? cloneLayout(DEFAULT_LAYOUT)
    : readStoredLayout() ?? cloneLayout(DEFAULT_LAYOUT);

export const dockLayout = writable<DockLayoutState>(initialLayout);

export function saveDockLayoutState(layout?: DockLayoutState) {
  if (typeof window === "undefined") return;
  const snapshot = JSON.stringify(layout ?? get(dockLayout));
  window.localStorage.setItem(STORAGE_KEY, snapshot);
}

export function resetDockLayout() {
  const reset = cloneLayout(DEFAULT_LAYOUT);
  dockLayout.set(reset);
  saveDockLayoutState(reset);
}

export function loadSavedDockLayout() {
  const saved = readStoredLayout();
  if (!saved) return;
  dockLayout.set(saved);
}

export function setActivePanel(zoneId: DockZoneId, panelId: PanelId) {
  dockLayout.update((layout) => {
    const zone = layout[zoneId];
    if (!zone || !zone.panels.includes(panelId)) return layout;
    return {
      ...layout,
      [zoneId]: {
        ...zone,
        active: panelId,
      },
    };
  });
}

export function movePanel(
  panelId: PanelId,
  targetZoneId: DockZoneId,
  targetIndex?: number,
) {
  dockLayout.update((layout) => {
    let sourceZoneId: DockZoneId | null = null;
    let sourceIndex = -1;

    for (const zoneKey of Object.keys(layout) as DockZoneId[]) {
      const idx = layout[zoneKey].panels.indexOf(panelId);
      if (idx !== -1) {
        sourceZoneId = zoneKey;
        sourceIndex = idx;
        break;
      }
    }

    if (!sourceZoneId) return layout;

    const sourceZone = layout[sourceZoneId];
    const targetZone = layout[targetZoneId];
    if (!targetZone) return layout;

    const nextLayout: DockLayoutState = {
      ...layout,
      [sourceZoneId]: {
        ...sourceZone,
        panels: sourceZone.panels.filter((id) => id !== panelId),
        active:
          sourceZone.active === panelId
            ? sourceZone.panels.find((id) => id !== panelId) ?? null
            : sourceZone.active,
      },
    };

    const destinationPanels = targetZone.panels.filter((id) => id !== panelId);
    const insertionIndex = Math.min(
      targetIndex ?? destinationPanels.length,
      destinationPanels.length,
    );
    destinationPanels.splice(insertionIndex, 0, panelId);

    nextLayout[targetZoneId] = {
      ...targetZone,
      panels: destinationPanels,
      active: panelId,
    };

    saveDockLayoutState(nextLayout);
    return nextLayout;
  });
}

import { writable } from "svelte/store";

export type PanelId = "hierarchy" | "viewport" | "assets" | "inspector";
export type DockZoneId = "left" | "center" | "bottom" | "right";

export interface DockZoneState {
  id: DockZoneId;
  panels: PanelId[];
  active: PanelId | null;
}

export type DockLayoutState = Record<DockZoneId, DockZoneState>;

const initialLayout: DockLayoutState = {
  left: { id: "left", panels: ["hierarchy"], active: "hierarchy" },
  center: { id: "center", panels: ["viewport"], active: "viewport" },
  bottom: { id: "bottom", panels: ["assets"], active: "assets" },
  right: { id: "right", panels: ["inspector"], active: "inspector" },
};

export const dockLayout = writable<DockLayoutState>(initialLayout);

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

    return nextLayout;
  });
}

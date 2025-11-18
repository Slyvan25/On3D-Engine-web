import type { Action } from "svelte/action";

interface DndzoneItem {
  id: string;
  [key: string]: any;
}

interface DndzoneOptions<T extends DndzoneItem = DndzoneItem> {
  items: T[];
  zone?: string;
  dragDisabled?: boolean;
}

interface DragContext<T extends DndzoneItem = DndzoneItem> {
  id: string;
  item: T;
  fromZone: string;
  index: number;
}

const DND_MIME = "application/x-svelte-dnd-action";
let activeDrag: DragContext | null = null;

function cloneItems<T extends DndzoneItem>(items: T[]): T[] {
  return items.map((item) => ({ ...item }));
}

function getDropIndex(node: HTMLElement, event: DragEvent) {
  const children = Array.from(
    node.querySelectorAll<HTMLElement>("[data-dnd-id]"),
  );
  if (children.length === 0) return 0;
  const pointerX = event.clientX;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const rect = child.getBoundingClientRect();
    if (pointerX < rect.left + rect.width / 2) {
      return i;
    }
  }
  return children.length;
}

function dispatchFinalize<T extends DndzoneItem>(
  node: HTMLElement,
  items: T[],
  zoneId: string,
  dropIndex: number,
) {
  if (!activeDrag) return;
  const detail = {
    items: cloneItems(items),
    info: {
      trigger: "drop",
      source: {
        zone: activeDrag.fromZone,
        index: activeDrag.index,
      },
      destination: {
        zone: zoneId,
        index: dropIndex,
      },
      dragged: activeDrag.item,
    },
  } as const;
  node.dispatchEvent(new CustomEvent("finalize", { detail }));
}

export const dndzone: Action<HTMLElement, DndzoneOptions> = (
  node,
  options,
) => {
  let opts: DndzoneOptions = options ?? { items: [] };
  let zoneId = opts.zone ?? node.dataset.dndZone ?? randomId();

  node.dataset.dndZone = zoneId;

  function randomId() {
    return Math.random().toString(36).slice(2);
  }

  function findItemIndex(id: string) {
    return (opts.items ?? []).findIndex((item) => `${item.id}` === id);
  }

  function handleDragStart(event: DragEvent) {
    if (opts.dragDisabled) return;
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      "[data-dnd-id]",
    );
    if (!target) return;
    const id = target.dataset.dndId;
    if (!id) return;
    const index = findItemIndex(id);
    if (index === -1) return;
    const item = opts.items[index];
    activeDrag = { id, item, fromZone: zoneId, index };
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(
        DND_MIME,
        JSON.stringify({ id, zone: zoneId, index }),
      );
    }
  }

  function handleDragOver(event: DragEvent) {
    if (!activeDrag) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  function handleDrop(event: DragEvent) {
    if (!activeDrag) return;
    event.preventDefault();
    const dropIndex = getDropIndex(node, event);
    const items = [...(opts.items ?? [])].filter(
      (item) => `${item.id}` !== activeDrag?.id,
    );
    const insertionIndex = Math.min(Math.max(dropIndex, 0), items.length);
    items.splice(insertionIndex, 0, activeDrag.item);
    dispatchFinalize(node, items, zoneId, insertionIndex);
  }

  function handleDragEnd() {
    activeDrag = null;
  }

  node.addEventListener("dragstart", handleDragStart);
  node.addEventListener("dragover", handleDragOver);
  node.addEventListener("drop", handleDrop);
  node.addEventListener("dragend", handleDragEnd);

  return {
    update(newOptions) {
      opts = newOptions ?? { items: [] };
      zoneId = opts.zone ?? node.dataset.dndZone ?? zoneId;
      node.dataset.dndZone = zoneId;
    },
    destroy() {
      node.removeEventListener("dragstart", handleDragStart);
      node.removeEventListener("dragover", handleDragOver);
      node.removeEventListener("drop", handleDrop);
      node.removeEventListener("dragend", handleDragEnd);
    },
  };
};

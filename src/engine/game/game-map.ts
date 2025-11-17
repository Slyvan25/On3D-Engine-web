// game-map.ts
// Optional helper for map-specific content: spawn points, triggers, metadata.

import { Vector3 } from "../core/math.ts";
import { ResourceManager } from "../resource/resource-manager.ts";

export interface MapMetadata {
  name: string;
  author?: string;
  version?: string;
  spawnPoints?: Vector3[];
}

export class GameMap {
  metadata: MapMetadata = { name: "Unknown" };

  constructor(private resources: ResourceManager) {}

  loadMeta(path: string) {
    if (!this.resources) return;

    const buffer = this.resources["pack"].getFile(path);
    const json = JSON.parse(new TextDecoder().decode(buffer));

    this.metadata = json as MapMetadata;
  }

  getSpawns() {
    return this.metadata.spawnPoints || [];
  }
}

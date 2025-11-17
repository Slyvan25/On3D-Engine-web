// game-types.ts
// Shared game-specific type definitions.

import { Vector3 } from "../core/math.ts";

export interface SpawnPoint {
  position: Vector3;
  rotation?: Vector3;
}

export interface TriggerVolume {
  id: string;
  bounds: {
    min: Vector3;
    max: Vector3;
  };
}

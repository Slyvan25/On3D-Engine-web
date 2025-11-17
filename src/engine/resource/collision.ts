// src/engine/resource/collision.ts

export interface CollisionVertex {
  x: number;
  y: number;
  z: number;
}

export interface CollisionTriangle {
  a: number;
  b: number;
  c: number;
}

export interface CollisionFile {
  name?: string;
  vertices: CollisionVertex[];
  triangles: CollisionTriangle[];
  // TODO: support materials, groups, flags if qpang has them
}

export class CollisionLoader {
  static parse(buffer: ArrayBuffer): CollisionFile {
    const view = new DataView(buffer);
    // TODO: port real layout from qpang-toolkit CollisionFile / CollisionInputStream.

    const col: CollisionFile = {
      vertices: [],
      triangles: [],
    };

    return col;
  }
}

export class CollisionSerializer {
  static toArrayBuffer(col: CollisionFile): ArrayBuffer {
    // TODO: implement actual binary layout
    console.warn("CollisionSerializer.toArrayBuffer is a stub – port from qpang-toolkit");
    return new ArrayBuffer(0);
  }
}

// collision-loader.ts
// Parses On3D/QPang .collision data (simplified)

export interface CollisionMesh {
  triangles: Float32Array;
}

export class CollisionLoader {
  static parse(buffer: ArrayBuffer): CollisionMesh {
    const data = new DataView(buffer);
    let offset = 0;

    const triCount = data.getUint32(offset, true);
    offset += 4;
    const triangles = new Float32Array(
      buffer.slice(offset, offset + triCount * 9 * 4),
    );

    return { triangles };
  }
}

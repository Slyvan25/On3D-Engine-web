// mesh-loader.ts
// Parses On3D / QPang .mesh binary format

export interface SubMeshData {
  material: string;
  indexStart: number;
  indexCount: number;
}

export interface MeshData {
  name: string;
  vertices: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
  submeshes: SubMeshData[];
}

export class MeshLoader {
  static parse(buffer: ArrayBuffer): MeshData {
    const data = new DataView(buffer);
    let offset = 0;

    const nameLen = data.getUint32(offset, true);
    offset += 4;
    const name = new TextDecoder().decode(
      new Uint8Array(buffer, offset, nameLen),
    );
    offset += nameLen;

    const vertCount = data.getUint32(offset, true);
    offset += 4;
    const idxCount = data.getUint32(offset, true);
    offset += 4;

    const vertices = new Float32Array(
      buffer.slice(offset, offset + vertCount * 3 * 4),
    );
    offset += vertCount * 3 * 4;

    const normals = new Float32Array(
      buffer.slice(offset, offset + vertCount * 3 * 4),
    );
    offset += vertCount * 3 * 4;

    const uvs = new Float32Array(
      buffer.slice(offset, offset + vertCount * 2 * 4),
    );
    offset += vertCount * 2 * 4;

    const indices = new Uint16Array(
      buffer.slice(offset, offset + idxCount * 2),
    );
    offset += idxCount * 2;

    const submeshCount = data.getUint32(offset, true);
    offset += 4;
    const submeshes: SubMeshData[] = [];

    for (let i = 0; i < submeshCount; i++) {
      const matId = data.getUint32(offset, true);
      offset += 4;
      const indexStart = data.getUint32(offset, true);
      offset += 4;
      const indexCount = data.getUint32(offset, true);
      offset += 4;

      submeshes.push({
        material: `material_${matId}`,
        indexStart,
        indexCount,
      });
    }

    return { name, vertices, normals, uvs, indices, submeshes };
  }
}

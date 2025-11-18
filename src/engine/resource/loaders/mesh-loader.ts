// mesh-loader.ts
// Parses On3D / QPang .mesh binary format (best-effort, tolerant of legacy quirks)

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
  indices: Uint16Array | Uint32Array;
  submeshes: SubMeshData[];
}

export class MeshLoader {
  static parse(buffer: ArrayBuffer): MeshData {
    const data = new DataView(buffer);
    const totalBytes = buffer.byteLength;
    let offset = 0;

    const readUint32 = (label: string, fallback?: number): number => {
      if (offset + 4 > totalBytes) {
        if (fallback !== undefined) {
          console.warn(`MeshLoader: truncated while reading ${label}, defaulting to ${fallback}`);
          return fallback;
        }
        throw new Error(`MeshLoader: unexpected EOF while reading ${label}`);
      }
      const value = data.getUint32(offset, true);
      offset += 4;
      return value;
    };

    const takeBytes = (length: number, label: string) => {
      const available = Math.max(0, Math.min(length, totalBytes - offset));
      const slice = buffer.slice(offset, offset + available);
      offset += available;
      if (available < length) {
        console.warn(
          `MeshLoader: expected ${length} bytes for ${label} but only ${available} available.`,
        );
      }
      return slice;
    };

    const decoder = new TextDecoder();
    const nameLen = readUint32("name length");
    const nameBytes = takeBytes(nameLen, "name");
    const name = decoder.decode(nameBytes);

    const vertCount = readUint32("vertex count");
    const idxCount = readUint32("index count");

    if (vertCount === 0) {
      throw new Error("MeshLoader: mesh contains zero vertices");
    }

    const sanitizeFloatArray = (array: Float32Array, label: string) => {
      let dirty = 0;
      for (let i = 0; i < array.length; i++) {
        if (!Number.isFinite(array[i])) {
          array[i] = 0;
          dirty++;
        }
      }
      if (dirty > 0) {
        console.warn(
          `MeshLoader: replaced ${dirty} invalid ${label} entries with 0 to keep the mesh renderable.`,
        );
      }
      return array;
    };

    const readAttribute = (floatsPerVertex: number, label: string) => {
      const expectedBytes = vertCount * floatsPerVertex * 4;
      const slice = takeBytes(expectedBytes, label);
      const usableBytes = slice.byteLength - (slice.byteLength % (floatsPerVertex * 4));
      if (usableBytes <= 0) {
        return new Float32Array();
      }
      const data = new Float32Array(slice.slice(0, usableBytes));
      return sanitizeFloatArray(data, label);
    };

    const vertices = readAttribute(3, "positions");
    if (vertices.length === 0) {
      throw new Error("MeshLoader: mesh contains no position data");
    }

    const normals = readAttribute(3, "normals");
    const uvs = readAttribute(2, "uvs");

    const remainingBeforeIndices = totalBytes - offset;
    const bytesFor16 = idxCount * 2;
    const bytesFor32 = idxCount * 4;
    let indexStride = 2;

    // Prefer the stride that still leaves enough room for (at least) the submesh header.
    if (remainingBeforeIndices - bytesFor16 < 4 && remainingBeforeIndices - bytesFor32 >= 4) {
      indexStride = 4;
    }

    const indicesSlice = takeBytes(idxCount * indexStride, "indices");
    const alignment = indexStride === 4 ? 4 : 2;
    const alignedBytes = indicesSlice.byteLength - (indicesSlice.byteLength % alignment);
    const indicesBuffer = indicesSlice.slice(0, alignedBytes);

    let indices: Uint16Array | Uint32Array;
    if (indexStride === 4) {
      indices = new Uint32Array(indicesBuffer);
      if (indices.length !== idxCount) {
        console.warn(
          `MeshLoader: expected ${idxCount} 32-bit indices but read ${indices.length}. Falling back to truncated data.`,
        );
      }
    } else {
      indices = new Uint16Array(indicesBuffer);
      if (indices.length !== idxCount) {
        console.warn(
          `MeshLoader: expected ${idxCount} 16-bit indices but read ${indices.length}. Falling back to truncated data.`,
        );
      }
    }

    let submeshCount = 0;
    if (offset + 4 <= totalBytes) {
      submeshCount = readUint32("submesh count", 0);
    }

    const submeshes: SubMeshData[] = [];
    for (let i = 0; i < submeshCount; i++) {
      if (offset + 12 > totalBytes) {
        console.warn("MeshLoader: truncated while reading submesh table, stopping early.");
        break;
      }
      const matId = readUint32("submesh material id", 0);
      const indexStart = readUint32("submesh index start", 0);
      const indexCount = readUint32("submesh index count", indices.length);
      submeshes.push({
        material: `material_${matId}`,
        indexStart,
        indexCount,
      });
    }

    if (submeshes.length === 0) {
      submeshes.push({
        material: "material_0",
        indexStart: 0,
        indexCount: indices.length,
      });
    }

    return { name, vertices, normals, uvs, indices, submeshes };
  }
}

// src/engine/resource/mesh.ts

export interface MeshVertex {
  position: [number, number, number];
  normal?: [number, number, number];
  uv?: [number, number];
  tangent?: [number, number, number, number];
}

export interface MeshSubmesh {
  materialName?: string;
  indices: Uint32Array;
}

export interface MeshFile {
  name?: string;
  vertices: MeshVertex[];
  indices: Uint32Array;
  submeshes: MeshSubmesh[];
  // TODO: bones, weights, etc if qpang uses them
}

export class MeshLoader {
  static parse(buffer: ArrayBuffer): MeshFile {
    const view = new DataView(buffer);

    // TODO: port real binary layout from qpang-toolkit (MeshFile, MeshInputStream).
    // Below is a "very dumb" placeholder so code compiles:
    const mesh: MeshFile = {
      name: undefined,
      vertices: [],
      indices: new Uint32Array(),
      submeshes: [],
    };

    return mesh;
  }
}

export class MeshSerializer {
  static toArrayBuffer(mesh: MeshFile): ArrayBuffer {
    // TODO: implement actual binary writer compatible with qpang-toolkit MeshFile.
    // For now: dump nothing.
    console.warn("MeshSerializer.toArrayBuffer is a stub – port from qpang-toolkit");
    return new ArrayBuffer(0);
  }
}

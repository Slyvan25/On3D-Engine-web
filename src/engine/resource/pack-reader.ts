// pack-reader.ts
// WebOn3D .pack archive reader (Deno + Browser compatible)

export interface PackEntry {
  path: string;
  offset: number;
  size: number;
  compressed: boolean;
}

export class PackReader {
  private data: ArrayBuffer;
  private view: DataView;
  private entries = new Map<string, PackEntry>();

  private constructor(data: ArrayBuffer) {
    this.data = data;
    this.view = new DataView(data);
  }

  static async load(url: string): Promise<PackReader> {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const reader = new PackReader(buf);
    reader.parseIndex();
    return reader;
  }

  private parseIndex() {
    const entryCount = this.view.getUint32(this.data.byteLength - 4, true);
    let offset = this.data.byteLength - 4 - entryCount * (64 + 4 + 4 + 4);

    for (let i = 0; i < entryCount; i++) {
      const path = this.readString(offset, 64);
      offset += 64;

      const fileOffset = this.view.getUint32(offset, true);
      offset += 4;
      const fileSize = this.view.getUint32(offset, true);
      offset += 4;
      const compressed = !!this.view.getUint32(offset, true);
      offset += 4;

      this.entries.set(path, {
        path,
        offset: fileOffset,
        size: fileSize,
        compressed,
      });
    }
  }

  private readString(off: number, len: number): string {
    const bytes = new Uint8Array(this.data, off, len);
    const zero = bytes.indexOf(0);
    const slice = zero >= 0 ? bytes.slice(0, zero) : bytes;
    return new TextDecoder().decode(slice);
  }

  getFile(path: string): ArrayBuffer {
    const entry = this.entries.get(path);
    if (!entry) throw new Error(`File not found in pack: ${path}`);

    const data = this.data.slice(entry.offset, entry.offset + entry.size);
    if (!entry.compressed) return data;

    // TODO: compressed pack file decoding
    throw new Error("Compressed pack entries not yet supported");
  }

  listFiles() {
    return [...this.entries.keys()];
  }
}

// src/engine/resource/pack.ts

export interface PackEntryHeader {
  name: string;
  offset: number;
  size: number;
  compressedSize: number;
  compressed: boolean;
}

export interface PackFile {
  entries: PackEntryHeader[];
  data: ArrayBuffer;
}

// export class PackReader {
//   static async load(url: string): Promise<PackFile> {
//     const res = await fetch(url);
//     if (!res.ok) throw new Error(`Failed to load pack: ${res.status}`);
//     const buf = await res.arrayBuffer();
//     return this.parse(buf);
//   }

//   static parse(buffer: ArrayBuffer): PackFile {
//     const view = new DataView(buffer);
//     let offset = 0;

//     // TODO: port actual header parsing from qpang-toolkit (PackFile / PackInputStream)
//     // For now: stub "no entries" so it doesn't blow up.
//     const entries: PackEntryHeader[] = [];

//     return { entries, data: buffer };
//   }

//   static getFile(pack: PackFile, name: string): ArrayBuffer | null {
//     const entry = pack.entries.find((e) => e.name.toLowerCase() === name.toLowerCase());
//     if (!entry) return null;

//     const { offset, size, compressed, compressedSize } = entry;
//     const raw = pack.data.slice(offset, offset + (compressed ? compressedSize : size));

//     if (!compressed) return raw;

//     // TODO: integrate the same compression as qpang-toolkit (if any).
//     // Might be zlib/deflate or a custom codec; port from Java.
//     console.warn("PackReader.getFile: compressed entries not implemented yet");
//     return raw;
//   }
// }



// export class PackWriter {
//   /**
//    * Build a new PackFile from in-memory files.
//    * NOTE: Layout is a stub; port the exact structure from qpang-toolkit.
//    */
//   static build(files: { name: string; data: ArrayBuffer }[]): PackFile {
//     // TODO: implement actual pack layout
//     const headers: PackEntryHeader[] = [];
//     const totalSize = files.reduce((sum, f) => sum + f.data.byteLength, 0);
//     const data = new ArrayBuffer(totalSize);
//     const bytes = new Uint8Array(data);

//     let offset = 0;
//     for (const f of files) {
//       bytes.set(new Uint8Array(f.data), offset);
//       headers.push({
//         name: f.name,
//         offset,
//         size: f.data.byteLength,
//         compressedSize: f.data.byteLength,
//         compressed: false,
//       });
//       offset += f.data.byteLength;
//     }

//     return { entries: headers, data };
//   }

//   static toArrayBuffer(pack: PackFile): ArrayBuffer {
//     // TODO: write proper header + entries + data according to qpang-toolkit.
//     console.warn("PackWriter.toArrayBuffer is a stub – port from qpang-toolkit");
//     return pack.data;
//   }
// }

// src/engine/resource/pack.ts

// Helper: read UTF-16LE null-terminated or padded string
function readUtf16LeString(view: DataView, offset: number, lengthBytes: number): string {
  const bytes = new Uint8Array(view.buffer, offset, lengthBytes);
  // Remove trailing nulls
  const trimmed = bytes.filter((b, i) => !(b === 0 && bytes[i + 1] === 0 && i % 2 === 0));
  return new TextDecoder("utf-16le").decode(trimmed).replace(/\0+$/, "");
}

export interface PackEntryHeader {
  name: string;
  offset: number;      // offset in content block
  size: number;
  compressedSize: number;
  compressed: boolean;
  directory: string;
}

export interface PackFile {
  entries: PackEntryHeader[];
  data: ArrayBuffer;
}

export class PackReader {
  static load = async (url: string): Promise<PackFile> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch pack: ${res.status}`);
    const buf = await res.arrayBuffer();
    return this.parse(buf);
  };

  static parse(buffer: ArrayBuffer): PackFile {
    const view = new DataView(buffer);

    // Skip 8 unknown bytes (same as toolkit)
    let offset = 8;

    const directoryCount = view.getInt32(offset, true); offset += 4;
    const fileCount      = view.getInt32(offset, true); offset += 4;

    // Compute initial content offset
    let contentOffset = 16 + directoryCount * 132 + fileCount * 140;

    // ───────────────────────────────────────────────
    // 1. READ DIRECTORY TABLE
    // ───────────────────────────────────────────────
    type Dir = { name: string; location: number };
    const dirs: Dir[] = [];

    for (let i = 0; i < directoryCount; i++) {
      const name = readUtf16LeString(view, offset, 128);
      offset += 128;
      const location = view.getInt32(offset, true);
      offset += 4;

      console.log(`PackReader: dir[${i}] = ${name} (parent: ${location})`);

      dirs.push({ name, location });
    }

    // ───────────────────────────────────────────────
    // 2. READ FILE TABLE
    // ───────────────────────────────────────────────
    const entries: PackEntryHeader[] = [];

    for (let i = 0; i < fileCount; i++) {
      const name = readUtf16LeString(view, offset, 128);
      offset += 128;

      const location       = view.getInt32(offset, true); offset += 4;
      const compressedSize = view.getInt32(offset, true); offset += 4;
      const size           = view.getInt32(offset, true); offset += 4;

      if (compressedSize !== size) {
        throw new Error("Compressed .pack files are not supported (QPang limitation).");
      }

      const entry: PackEntryHeader = {
        name,
        offset: contentOffset,
        size,
        compressedSize,
        compressed: false,
        directory: dirs[location]?.name ?? "root",
      };

        console.log(`PackReader: file[${i}] = ${entry.directory}/${name} (size: ${size} bytes)`);

      entries.push(entry);
      contentOffset += size;
    }

    return {
      entries,
      data: buffer,
    };
  }

  static getFile(pack: PackFile, name: string): ArrayBuffer | null {
    const entry = pack.entries.find(e => e.name.toLowerCase() === name.toLowerCase());
    if (!entry) return null;

    return pack.data.slice(entry.offset, entry.offset + entry.size);
  }
}

export class PackWriter {
    static build(files: { path: string; data: ArrayBuffer }[]): ArrayBuffer {
      // Group by directory
      const directories = new Map<string, number>();
      const fileEntries: {
        name: string;
        dir: string;
        size: number;
        data: ArrayBuffer;
      }[] = [];
  
      // Assign directories indices
      for (const f of files) {
        const parts = f.path.split("/");
        const name = parts.pop()!;
        const dir = parts.join("/") || "root";
  
        if (!directories.has(dir)) {
          directories.set(dir, directories.size);
        }
  
        fileEntries.push({
          name,
          dir,
          data: f.data,
          size: f.data.byteLength,
        });
      }
  
      const directoryCount = directories.size;
      const fileCount = fileEntries.length;
  
      // Compute total file sizes
      const contentSize = fileEntries.reduce((s, f) => s + f.size, 0);
  
      const headerSize = 16 + directoryCount * 132 + fileCount * 140;
      const totalSize  = headerSize + contentSize;
  
      const buf  = new ArrayBuffer(totalSize);
      const view = new DataView(buf);
      const u8   = new Uint8Array(buf);
  
      let offset = 0;
  
      // Unknown 8 bytes
      offset += 8;
  
      view.setInt32(offset, directoryCount, true); offset += 4;
      view.setInt32(offset, fileCount, true); offset += 4;
  
      // Write directories
      for (const [dir, idx] of directories.entries()) {
        // UTF-16LE, padded to 128 bytes
        const encoded = new TextEncoder().encode(dir);
        const utf16 = new TextEncoder("utf-16le").encode(dir);
        u8.set(utf16, offset);
        offset += 128;
  
        // Parent index: all set to 0 or support subdirs
        view.setInt32(offset, 0, true); offset += 4;
      }
  
      // Content offset start
      let contentOffset = headerSize;
  
      // File entries table
      for (const f of fileEntries) {
        const utf16 = new TextEncoder("utf-16le").encode(f.name);
        u8.set(utf16, offset);
        offset += 128;
  
        // directory index
        view.setInt32(offset, directories.get(f.dir) ?? 0, true); offset += 4;
  
        // compressedSize == size
        view.setInt32(offset, f.size, true); offset += 4;
        view.setInt32(offset, f.size, true); offset += 4;
      }
  
      // Write actual file contents
      for (const f of fileEntries) {
        u8.set(new Uint8Array(f.data), contentOffset);
        contentOffset += f.size;
      }
  
      return buf;
    }
  }
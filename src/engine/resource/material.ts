// src/engine/resource/material.ts

export interface MaterialTexture {
  usage: "diffuse" | "normal" | "specular" | "emissive" | string;
  path: string;
}

export interface MaterialFile {
  name: string;
  shader?: string;
  diffuseColor?: [number, number, number, number];
  textures: MaterialTexture[];
  // extend with whatever qpang uses: flags, alpha, etc
}

export class MaterialParser {
  /**
   * Parse text contents of a .material file into a MaterialFile.
   * This is intentionally loose; tighten according to qpang-toolkit parser.
   */
  static parse(text: string): MaterialFile {
    const lines = text.split(/\r?\n/);
    const mat: MaterialFile = { name: "material", textures: [] };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("//") || line.startsWith("#")) continue;

      // Example loose grammar:
      // name myMaterial
      // shader basic
      // map_diffuse textures/whatever.dds
      const [key, ...rest] = line.split(/\s+/);
      const value = rest.join(" ");

      switch (key.toLowerCase()) {
        case "name":
          mat.name = value;
          break;
        case "shader":
          mat.shader = value;
          break;
        case "map_diffuse":
          mat.textures.push({ usage: "diffuse", path: value });
          break;
        case "map_normal":
          mat.textures.push({ usage: "normal", path: value });
          break;
        // TODO: adapt to exact keys used in qpang .material
      }
    }

    return mat;
  }

  static toText(mat: MaterialFile): string {
    const out: string[] = [];

    out.push(`name ${mat.name}`);
    if (mat.shader) out.push(`shader ${mat.shader}`);

    for (const tex of mat.textures) {
      const key =
        tex.usage === "diffuse"
          ? "map_diffuse"
          : tex.usage === "normal"
          ? "map_normal"
          : `map_${tex.usage}`;
      out.push(`${key} ${tex.path}`);
    }

    // TODO: add any other fields once you know the real syntax.
    return out.join("\n") + "\n";
  }
}

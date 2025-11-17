// material-loader.ts
// Parses .material text format

export interface MaterialData {
  name: string;
  diffuse: string | null;
  normal: string | null;
  specular: string | null;
}

export class MaterialLoader {
  static parse(buffer: ArrayBuffer): MaterialData {
    const text = new TextDecoder().decode(buffer);

    const mat: MaterialData = {
      name: "",
      diffuse: null,
      normal: null,
      specular: null,
    };

    for (const line of text.split("\n")) {
      const l = line.trim();
      if (l.startsWith("material")) mat.name = l.split(" ")[1];
      else if (l.startsWith("diffuse")) mat.diffuse = l.split(" ")[1];
      else if (l.startsWith("normal")) mat.normal = l.split(" ")[1];
      else if (l.startsWith("specular")) mat.specular = l.split(" ")[1];
    }

    return mat;
  }
}

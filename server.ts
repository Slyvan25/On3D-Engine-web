// server.ts
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

Deno.serve((req) => {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/src/editor")) {
    // Serve built editor
    const newUrl = new URL(req.url);
    newUrl.pathname = url.pathname.replace("/src/editor", "");
    return serveDir(req, {
      fsRoot: "src/editor/dist",
      urlRoot: "",
      showDirListing: false,
      quiet: true,
    });
  }

  // else: your game / engine API routes, etc.
  return new Response("OK from Deno backend");
});

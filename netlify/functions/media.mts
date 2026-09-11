import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const pathname = new URL(req.url).pathname;
  const key = decodeURIComponent(pathname.replace(/^\/media\//, ""));
  if (!key || key.includes("/") || !key.endsWith(".jpg")) {
    return new Response("Not found", { status: 404 });
  }

  const store = getStore("qatters-media");
  const image = await store.get(key, { type: "arrayBuffer" });
  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers({
    "content-type": "image/jpeg",
    "cache-control": "public, max-age=31536000, immutable"
  });

  if (req.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  return new Response(image, { status: 200, headers });
};

export const config: Config = {
  path: "/media/*"
};

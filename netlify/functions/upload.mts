import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedKey = Netlify.env.get("BRIDGE_KEY");
  const suppliedKey = req.headers.get("x-bridge-key");
  if (!expectedKey || suppliedKey !== expectedKey) {
    return new Response("Unauthorized", { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.startsWith("image/jpeg")) {
    return new Response("Only JPEG uploads are accepted", { status: 415 });
  }

  const bytes = await req.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > 8 * 1024 * 1024) {
    return new Response("Image must be between 1 byte and 8 MB", { status: 413 });
  }

  const key = `${Date.now()}-${crypto.randomUUID()}.jpg`;
  const store = getStore("qatters-media");
  await store.set(key, bytes);

  const origin = new URL(req.url).origin;
  return Response.json({
    key,
    url: `${origin}/media/${key}`
  });
};

export const config: Config = {
  path: "/upload"
};

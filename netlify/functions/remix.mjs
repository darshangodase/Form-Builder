import { createRequestHandler } from "@remix-run/netlify";
import { installGlobals } from "@remix-run/node";

installGlobals();

let build;
try {
  build = await import("../../build/server/index.js");
} catch (error) {
  console.error("Failed to import build:", error);
  throw error;
}

export const handler = createRequestHandler({
  build,
}); 
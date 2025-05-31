import { createRequestHandler } from "@remix-run/netlify";
import { installGlobals } from "@remix-run/node";

installGlobals();

export const handler = createRequestHandler({
  build: await import("../../build/server/index.js"),
}); 
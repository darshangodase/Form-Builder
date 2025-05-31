import { createRequestHandler } from "@remix-run/netlify";
import { installGlobals } from "@remix-run/node";

installGlobals();

export default createRequestHandler({
  build: await import("./build/index.js"),
}); 
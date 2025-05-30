import { createRequestHandler } from "@remix-run/node";
import * as build from "@remix-run/dev/server-build";

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
}); 
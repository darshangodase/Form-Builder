import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  const serviceWorker = await fetch(new URL("/service-worker.js", process.env.URL || "http://localhost:5173"));
  const text = await serviceWorker.text();
  
  return new Response(text, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
    },
  });
}; 
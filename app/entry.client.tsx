/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    console.log("Service Worker: Checking registration...");
    
    // Unregister any existing service workers first
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        console.log("Service Worker: Unregistering old service worker...");
        registration.unregister();
      }
    });

    // Wait for the page to be fully loaded and hydrated
    window.addEventListener("load", () => {
      // Add a small delay to ensure hydration is complete
      setTimeout(() => {
        console.log("Service Worker: Attempting to register...");
        navigator.serviceWorker
          .register("/service-worker.js", {
            scope: "/",
            updateViaCache: "none"
          })
          .then((registration) => {
            console.log("Service Worker: Registration successful with scope:", registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log("Service Worker: Update found!");
              
              newWorker?.addEventListener('statechange', () => {
                console.log("Service Worker: State changed to:", newWorker.state);
              });
            });
          })
          .catch((err) => {
            console.error("Service Worker: Registration failed:", err);
          });
      }, 1000); // 1 second delay
    });
  }
}

// Start hydration
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});

// Register service worker after hydration
registerServiceWorker();

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyPlugin } from "@netlify/remix-adapter/plugin";
import { vitePlugin as remix } from "@remix-run/dev";

export default defineConfig({
  plugins: [remix(), tsconfigPaths(), netlifyPlugin()]
});

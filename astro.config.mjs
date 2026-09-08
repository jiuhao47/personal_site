import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://jiuhao47.github.io",
  base: "/personal_site",
  output: "static",
  build: {
    format: "directory"
  }
});

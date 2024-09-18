// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "wunshot",
      social: {
        github: "https://github.com/lotap/wunshot",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "index" },
            { label: "Prerequisites", slug: "getting-started/prerequisites" },
            { label: "Installation", slug: "getting-started/installation" },
            {
              label: "Base Schema & User Operations",
              slug: "getting-started/base-schema-and-user-operations",
            },
          ],
        },
        {
          label: "Auth",
          badge: "Soon",
          items: [
            // { label: "Sessions", slug: "auth/sessions" },
            // { label: "Username & Password", slug: "auth/username-password" },
            // { label: "Magic Code", slug: "auth/magic-code" },
            // { label: "OAuth", slug: "auth/oauth" },
          ],
        },
      ],
      expressiveCode: {
        themes: ["catppuccin-latte", "catppuccin-macchiato"],
      },
      customCss: [
        "@fontsource-variable/mulish/wght.css",
        "@fontsource-variable/rubik/wght.css",
        "@fontsource-variable/jetbrains-mono/wght.css",
        "./src/styles/tailwind.css",
        "./src/styles/custom.css",
      ],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
});

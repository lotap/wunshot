// @ts-check
import { defineConfig } from "astro/config";
import rehypeMermaid from "rehype-mermaid";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://www.wunshot.dev/",
  integrations: [
    starlight({
      title: "wunshot",
      favicon: "/1f35d.svg",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/lotap/wunshot",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started" },
            { label: "Installation", slug: "getting-started/installation" },
            {
              label: "The wunshot Way",
              slug: "getting-started/the-wunshot-way",
            },
            {
              label: "Base User Model & Ops",
              badge: {
                text: "Deprecated - Updates Coming Soon",
                variant: "danger",
              },
              slug: "getting-started/base-schema-and-user-operations",
            },
          ],
        },
        {
          label: "Authentication",
          badge: {
            text: "In Development - Updates Coming Soon",
            variant: "caution",
          },
          items: [
            { label: "Overview", slug: "auth/overview" },
            { label: "Storage Approaches", slug: "auth/storage-approaches" },
            // { label: "Sessions", slug: "auth/sessions" },
            { label: "Username & Password", slug: "auth/username-password" },
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
        "./src/styles/tailwind.css",
        "./src/styles/custom.css",
      ],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  markdown: {
    rehypePlugins: [rehypeMermaid],
  },
});

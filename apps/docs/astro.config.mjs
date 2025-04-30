// @ts-check
import { defineConfig } from "astro/config";
import rehypeMermaid from "rehype-mermaid";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://www.wunshot.dev/",
  integrations: [
    starlight({
      title: "wunshot",
      favicon: "/favicon.svg",
      head: [
        {
          tag: "link",
          attrs: { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
        },
      ],
      logo: {
        /**
         * Easiest solution for getting Safari to work with multiple colors.
         * @todo either inline the svg or find a way to explicity set the MIME type
         */
        light: "./src/assets/images/wordmark-duo-for-light.svg",
        dark: "./src/assets/images/wordmark-duo-for-dark.svg",
        replacesTitle: true,
      },
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
              label: "Base Initialization",
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
            { label: "Base Models", slug: "auth/base-models" },
            { label: "Base Ops", slug: "auth/base-ops" },
            // { label: "Storage Approaches", slug: "auth/storage-approaches" },
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
        "./src/styles/global.css",
        "./src/styles/custom.css",
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeMermaid],
  },
});

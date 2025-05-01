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
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Installation", slug: "getting-started/installation" },
            {
              label: "The wunshot Way",
              slug: "getting-started/the-wunshot-way",
            },
            {
              label: "Base Initialization",
              slug: "getting-started/base-initialization",
            },
          ],
        },
        {
          label: "Auth",
          items: [
            { label: "Overview", slug: "auth/overview" },
            {
              label: "Initialization",
              slug: "auth/initialization",
            },
            {
              label: "Strategies",
              items: [
                {
                  label: "Username & Password",
                  slug: "auth/strategies/username-password",
                  badge: { text: "beta", variant: "note" },
                },
                {
                  label: "Magic Code",
                  slug: "auth/strategies/magic-code",
                  attrs: {
                    style:
                      "cursor: not-allowed; opacity: 0.5; pointer-events: none",
                  },
                  badge: { text: "soon", variant: "danger" },
                },
                {
                  label: "OAuth",
                  slug: "auth/strategies/oauth",
                  attrs: {
                    style:
                      "cursor: not-allowed; opacity: 0.5; pointer-events: none",
                  },
                  badge: { text: "soon", variant: "danger" },
                },
              ],
            },
          ],
        },
        {
          label: "Guests (Unauthenticated Users)",
          items: [
            {
              label: "Overview",
              slug: "guests/overview",
              badge: { text: "in dev", variant: "caution" },
              attrs: {
                style:
                  "cursor: not-allowed; opacity: 0.5; pointer-events: none",
              },
            },
          ],
        },
        {
          label: "Rate Limiting",
          items: [
            {
              slug: "rate-limiting/overview",
              badge: { text: "in dev", variant: "caution" },
              attrs: {
                style:
                  "cursor: not-allowed; opacity: 0.5; pointer-events: none",
              },
            },
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
  redirects: {
    "/getting-started": {
      status: 302,
      destination: "/getting-started/introduction",
    },
    "/auth": {
      status: 302,
      destination: "/auth/overview",
    },
    "/guests": {
      status: 302,
      destination: "/guests/overview",
    },
    "/rate-limiting": {
      status: 302,
      destination: "/rate-limiting/overview",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeMermaid],
  },
});

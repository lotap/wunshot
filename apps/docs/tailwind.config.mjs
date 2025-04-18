import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";
import starlightPlugin from "@astrojs/starlight-tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      display: ["Mulish Variable", ...defaultTheme.fontFamily.sans],
      sans: ["Rubik Variable", ...defaultTheme.fontFamily.sans],
      // mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
      mono: ["Commit Mono Variable", ...defaultTheme.fontFamily.mono],
    },
    extend: {
      colors: {
        // Your preferred accent color. Indigo is closest to Starlight’s defaults.
        accent: colors.violet,
        // Your preferred gray scale. Zinc is closest to Starlight’s defaults.
        gray: colors.slate,
      },
    },
  },
  plugins: [starlightPlugin()],
};

import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";
import starlightPlugin from "@astrojs/starlight-tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["Rubik Variable", ...defaultTheme.fontFamily.sans],
      mono: ["JetBrains Mono Variable", ...defaultTheme.fontFamily.mono],
    },
    extend: {
      colors: {
        // Your preferred accent color. Indigo is closest to Starlight’s defaults.
        accent: colors.violet,
        // Your preferred gray scale. Zinc is closest to Starlight’s defaults.
        gray: colors.zinc,
      },
      fontFamily: {
        display: ["Mulish Variable", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [starlightPlugin()],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "neo-pink": "#F7A8D8",
        "neo-yellow": "#F9D849",
        "neo-orange": "#FFAE33",
        "neo-cream": "#FFFDF9",
        "neo-black": "#121212",
        "neo-mint": "#76E5B1",
        "neo-red": "#FF6B6B",
        "neo-blue": "#54C4F8",
      },
      boxShadow: {
        "neo": "4px 4px 0px 0px #121212",
        "neo-lg": "6px 6px 0px 0px #121212",
        "neo-xl": "8px 8px 0px 0px #121212",
        "neo-hover": "2px 2px 0px 0px #121212",
      },
      borderWidth: {
        "3": "3px",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

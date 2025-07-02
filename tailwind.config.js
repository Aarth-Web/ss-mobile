module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["RedditSansRegular"], // default
        reddit: ["RedditSansRegular"],
        caveat: ["CaveatRegular"],
        shadows: ["ShadowsIntoLightRegular"],
      },
    },
  },
  plugins: [],
};

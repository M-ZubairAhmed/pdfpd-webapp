module.exports = {
  purge: ["./src/**/*.js"],
  theme: {
    screens: {
      sm: "640px",
      xl: "1280px",
    },
    extend: {
      opacity: {
        90: "0.9",
      },
    },
  },
  variants: {},
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};

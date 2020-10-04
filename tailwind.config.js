module.exports = {
  purge: ["./src/**/*.js"],
  theme: {
    screens: {
      sm: "640px",
      xl: "1280px",
    },
    extend: {},
  },
  variants: {},
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};

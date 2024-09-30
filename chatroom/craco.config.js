const path = require("path");

module.exports = {
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  webpack: {
    alias: {
      "@lib": path.resolve(__dirname, "src/lib"),
      "@": path.resolve(__dirname, "src"), // Adding general alias for src
    },
  },
};

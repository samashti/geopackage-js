import { terser } from "rollup-plugin-terser";

const input = "index.js";
const sourcemap = true;

export default [
  {
    input,
    output: {
      file: "dist/geopackage.es.js",
      format: "es",
      sourcemap
    }
  },
  {
    input,
    output: {
      file: "dist/geopackage.js",
      format: "cjs",
      sourcemap
    }
  },
  {
    input,
    output: {
      file: "dist/geopackage.min.js",
      format: "umd",
      name: "GeoPackage",
      sourcemap
    },
    plugins: [terser()]
  }
];

import { terser } from "rollup-plugin-terser";
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

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
    },
    plugins: [
      commonjs(),
      globals(),
      builtins(),
      json(),
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      babel({
        exclude: [
          // 'node_modules/**',
          '**/*.json'
        ],
        babelrc: false
      })
    ]
  },
  {
    input,
    output: {
      file: "dist/geopackage-iife.js",
      format: "iife",
      name: 'geopackage',
      sourcemap
    },
    plugins: [
      commonjs(),
      globals(),
      builtins(),
      json(),
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      babel({
        babelrc: false
      })
    ]
  },
  {
    input,
    output: {
      file: "dist/geopackage.min.js",
      format: "umd",
      name: "GeoPackage",
      sourcemap
    },
    plugins: [
      commonjs(),
      globals(),
      builtins(),
      json(),
      resolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      babel({
        babelrc: false
      })
    ]
  }
];

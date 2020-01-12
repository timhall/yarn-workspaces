import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: ['src/bin/knit.ts'],
  output: {
    format: 'cjs',
    dir: 'lib',
    sourcemap: true
  },
  external: Object.keys(pkg.dependencies),
  plugins: [
    resolve(),
    commonjs(),
    json(),
    babel({ extensions: ['.mjs', '.js', '.ts'] }),
    typescript()
  ]
};

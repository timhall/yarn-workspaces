import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import builtin from 'builtin-modules';
import babel from 'rollup-plugin-babel';

export default {
  input: ['src/bin/lifeline.ts'],
  output: {
    format: 'cjs',
    dir: 'lib',
    sourcemap: true
  },
  external: [...builtin],
  plugins: [
    resolve(),
    commonjs(),
    json(),
    babel({ extensions: ['.mjs', '.js', '.ts'] }),
    typescript()
  ]
};

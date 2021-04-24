import { terser } from 'rollup-plugin-terser'

const name = 'SideWorker'
const nameLC = name.toLowerCase()

export default {
  input: `${nameLC}.js`,
  output: {
    file: `${nameLC}.min.js`,
    format: 'iife',
    name,
  },
  plugins: [
    terser({
      compress: true,
      mangle: true,
    }),
  ],
};

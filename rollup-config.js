const external = Object.keys(require('./package.json').dependencies).concat(['fs', 'path']);

export default {
  entry: 'dist/index.js',
  dest: 'dist/index.cjs.js',
  format: 'cjs',
  external: external
};
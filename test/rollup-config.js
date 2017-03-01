import angularInline from '../dist/index.js';


export default {
  entry: './test/src/index.js',
  dest: './test/dist/lib.umd.js',
  format: 'umd',
  moduleName: 'testLib',
  plugins: [
    angularInline({
      include: './test/src/**/*.component.js',
      exclude: './test/src/**/*.not-component.js'
    })
  ]
};


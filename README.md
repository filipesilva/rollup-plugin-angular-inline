# Warning
This approach will likely produce innaccurate sourcemaps. 

A better approach is to inline templates/styles directly in the TypeScript sources, which guarantees sourcemaps will be correctly produced by TypeScript.

Such a build step can be found at https://github.com/filipesilva/angular-quickstart-lib.

# rollup-plugin-angular-inline
[![Build Status][travis-badge]][travis-badge-url]

Angular templateUrl and styleUrls inliner for Rollup, based on the 
[angular/material2](https://github.com/angular/material2/blob/master/scripts/release/inline-resources.js)
inlining script.
Also removes `module.id` since it isn't needed afterwards.

Operates over transpiled JavaScript files so you need to provide `include` globs to ensure
replacement is only happening on Angular Components.

Used after `ngc`, to inline templates/styles for UMD bundles but still have es2015 files for
tree shaking.


## Installation
```bash
npm install --save-dev rollup-plugin-angular-inline
```


## Example
```json
// package.json
"scripts": {
  "build": "ngc && rollup -c rollup-config.js",
}
```
```javascript
// rollup-config.js
import angularInline from 'rollup-plugin-angular-inline';

export default {
  entry: './src/index.js',
  dest: './bundles/my-lib.umd.js',
  format: 'umd',
  moduleName: 'ng.my-lib',
  globals: {
    '@angular/core': 'ng.core'
  },
  plugins: [
    angularInline({ include: './src/**/*.component.js' })
  ]
}
```

[travis-badge]: https://travis-ci.org/filipesilva/rollup-plugin-angular-inline.svg?branch=master
[travis-badge-url]: https://travis-ci.org/filipesilva/rollup-plugin-angular-inline

import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';


describe('Angular Inline', () => {
  const libPath = path.join(__dirname, 'dist', 'lib.umd.js');
  const lib = fs.readFileSync(libPath, 'utf8');

  it('should replace templateUrl', () => {
    assert(lib.match('lib-component-html'));
  });

  it('should replace styleUrl', () => {
    assert(lib.match('lib-component-css'));
    assert(lib.match('another-lib-component-css'));
  });

  it('should not replace in excluded files', () => {
    assert(lib.match('lib.not-component.html'));
    assert(lib.match('lib.not-component.css'));
    assert(lib.match('another-lib.not-component.css'));
  });

  it('should replace templateUrl when using doublequotes', () => {
    assert(lib.match('lib-component-double-quotes-html'));
  });

});

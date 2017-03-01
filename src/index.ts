import * as fs from 'fs';
import * as path from 'path';
import MagicString from 'magic-string';
import { createFilter } from 'rollup-pluginutils';

// Eval workaround, see https://github.com/rollup/rollup/wiki/Troubleshooting#eval2--eval
const eval2 = eval;

export interface AngularInlineOptions {
  include: string | string[];
  exclude?: string | string[];
  sourceMap?: boolean;
};

export default function angularInline(options: AngularInlineOptions = { include: [] }) {

  if (!options.include || options.include.length === 0) {
    throw new Error('rollup-plugin-angular-inline requires include globs to be defined in the plugin options.');
  }

  // `options.include` and `options.exclude` can each be a minimatch
  // pattern, or an array of minimatch patterns, relative to process.cwd()
  const filter = createFilter(options.include, options.exclude);

  return {
    transform(code: string, id: string) {
      // If `options.include` is omitted or has zero length, filter
      // will return `true` by default. Otherwise, an ID must match
      // one or more of the minimatch patterns, and must not match
      // any of the `options.exclude` patterns.
      if (!filter(id)) { return; };

      // Generate all files content with inlined templates.
      const generatedCode = inlineResourcesFromString(code, (url: string) => {
        return path.join(path.dirname(id), url);
      });

      // Generate sourcemap
      let generatedSourceMap = { mappings: '' };
      if (options.sourceMap) {
        generatedSourceMap = new MagicString(generatedCode).generateMap({ hires: true });
      }

      return {
        code: generatedCode,
        map: generatedSourceMap
      };
    }
  };
}

// Inline code taken from angular/material2
// https://github.com/angular/material2/blob/master/scripts/release/inline-resources.js

declare type UrlResolver = (url: string) => string;

/**
 * Inline resources from a string content.
 * @param content {string} The source file's content.
 * @param urlResolver {Function} A resolver that takes a URL and return a path.
 * @returns {string} The content with resources inlined.
 */
function inlineResourcesFromString(content: string, urlResolver: UrlResolver) {
  // Curry through the inlining functions.
  return [
    inlineTemplate,
    inlineStyle,
    removeModuleId
  ].reduce((prevContent, fn) => fn(prevContent, urlResolver), content);
}


/**
 * Inline the templates for a source file. Simply search for instances of `templateUrl: ...` and
 * replace with `template: ...` (with the content of the file included).
 * @param content {string} The source file's content.
 * @param urlResolver {Function} A resolver that takes a URL and return a path.
 * @return {string} The content with all templates inlined.
 */
function inlineTemplate(content: string, urlResolver: UrlResolver) {
  return content.replace(/templateUrl:\s*'([^']+?\.html)'/g, function (_m, templateUrl) {
    const templateFile = urlResolver(templateUrl);
    const templateContent = fs.readFileSync(templateFile, 'utf-8');
    const shortenedTemplate = templateContent
      .replace(/([\n\r]\s*)+/gm, ' ')
      .replace(/"/g, '\\"');
    return `template: "${shortenedTemplate}"`;
  });
}


/**
 * Inline the styles for a source file. Simply search for instances of `styleUrls: [...]` and
 * replace with `styles: [...]` (with the content of the file included).
 * @param urlResolver {Function} A resolver that takes a URL and return a path.
 * @param content {string} The source file's content.
 * @return {string} The content with all styles inlined.
 */
function inlineStyle(content: string, urlResolver: UrlResolver) {
  return content.replace(/styleUrls:\s*(\[[\s\S]*?\])/gm, function (_m, styleUrls) {
    const urls = eval2(styleUrls);
    return 'styles: ['
      + urls.map((styleUrl: string) => {
        const styleFile = urlResolver(styleUrl);
        const styleContent = fs.readFileSync(styleFile, 'utf-8');
        const shortenedStyle = styleContent
          .replace(/([\n\r]\s*)+/gm, ' ')
          .replace(/"/g, '\\"');
        return `"${shortenedStyle}"`;
      })
        .join(',\n')
      + ']';
  });
}


/**
 * Remove every mention of `moduleId: module.id`.
 * @param content {string} The source file's content.
 * @returns {string} The content with all moduleId: mentions removed.
 */
function removeModuleId(content: string) {
  return content.replace(/\s*moduleId:\s*module\.id\s*,?\s*/gm, '');
}

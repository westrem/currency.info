// Inspiration: https://rollupjs.org/configuration-options/#input

const glob = require('glob');
const path = require('node:path');
const nodeURL = require('node:url');

const pkg = require('./package.json');
const ts = require('@rollup/plugin-typescript');

const plugins = [ts()];

const buildBrowser = glob.sync('./gen/js/*.js').map((file) => {
  // gen/ts/nested/foo.ts → nested/foo
  const fileId = path.relative(
    'gen/js',
    file.slice(0, file.length - path.extname(file).length),
  );

  const name = `currencyInfo${fileId === 'index' ? '' : fileId}`;

  return {
    input: `./${file}`,
    output: {
      name,
      format: 'umd',
      file: `build/browser/${fileId}.js`, // .umd.js
    },
  };
});

const inputModules = (format) =>
  Object.fromEntries(
    glob.sync('./gen/ts/*.ts').map((file) => {
      // gen/ts/nested/foo.ts → nested/foo
      const fileId = path.relative(
        'gen/ts',
        file.slice(0, file.length - path.extname(file).length),
      );

      return [`${fileId}${format ? `.${format}` : ''}`, `./${file}`];
    }),
  );

module.exports = [
  // browser-friendly UMD build
  ...buildBrowser,
  // import & require builds
  {
    input: inputModules(), // 'cjs'
    plugins,
    output: {
      dir: 'build/require',
      format: 'cjs',
      sourcemap: true,
    },
  },
  {
    input: inputModules(), // 'es'
    plugins,
    output: {
      dir: 'build/import',
      format: 'es',
      sourcemap: true,
    },
  },
];

const fs = require('node:fs');
const path = require('node:path');
const JSON5 = require('json5');
const HBS = require('handlebars');

const currenciesFile = fs.readFileSync(
  path.resolve(__dirname, '../src/currencies.json5'),
);

// All currencies, available to all generators
const currenciesParsed = JSON5.parse(currenciesFile);

// Directory for file generation
const genDir = path.resolve(__dirname, `../gen`);

/*
 * Generator configs
 */

const genConfigs = [
  // ---------------------------------------------------------------------------
  // Generate TypeScript single currency files
  {
    directory: path.resolve(__dirname, `../gen/ts`),
    template: 'single_currency.ts.hbs',
    callback: (templateCompiled) => {
      Object.keys(currenciesParsed).map((currencyIsoCode) => {
        const contentSingleCurrencyTS = templateCompiled(
          {
            ISO: currencyIsoCode,
            currency: new HBS.SafeString(
              JSON.stringify(currenciesParsed[currencyIsoCode], null, 2),
            ),
          },
          {
            noEscape: true,
          },
        );

        fs.writeFileSync(
          path.resolve(__dirname, `../gen/ts/${currencyIsoCode}.ts`),
          contentSingleCurrencyTS,
        );
      });
    },
  },
  // ---------------------------------------------------------------------------
  // Generate TypeScript all currencies index file
  {
    directory: path.resolve(__dirname, `../gen/ts`),
    template: 'multiple_currencies.ts.hbs',
    callback: (templateCompiled) => {
      const ISOCodes = Object.keys(currenciesParsed)
        .map((key) => `| "${key}"`)
        .join('\n');

      const exports = Object.keys(currenciesParsed)
        .map((key) => `export * from './${key}';`)
        .join('\n');

      const contentAllCurrenciesTS = templateCompiled(
        {
          exports: new HBS.SafeString(exports),
          ISOCodes: new HBS.SafeString(ISOCodes),
          currencies: new HBS.SafeString(
            JSON.stringify(currenciesParsed, null, 2),
          ),
        },
        {
          noEscape: true,
        },
      );

      fs.writeFileSync(
        path.resolve(__dirname, `../gen/ts/index.ts`),
        contentAllCurrenciesTS,
      );
    },
  },

  // ---------------------------------------------------------------------------
  // Generate JavaScript single currency files
  {
    directory: path.resolve(__dirname, `../gen/js`),
    template: 'single_currency.js.hbs',
    callback: (templateCompiled) => {
      Object.keys(currenciesParsed).map((currencyIsoCode) => {
        const contentSingleCurrencyTS = templateCompiled(
          {
            ISO: currencyIsoCode,
            currency: new HBS.SafeString(
              JSON.stringify(currenciesParsed[currencyIsoCode], null, 2),
            ),
          },
          {
            noEscape: true,
          },
        );

        fs.writeFileSync(
          path.resolve(__dirname, `../gen/js/${currencyIsoCode}.js`),
          contentSingleCurrencyTS,
        );
      });
    },
  },
  // ---------------------------------------------------------------------------
  // Generate JavaScript all currencies index file
  {
    directory: path.resolve(__dirname, `../gen/js`),
    template: 'multiple_currencies.js.hbs',
    callback: (templateCompiled) => {
      const ISOCodes = Object.keys(currenciesParsed)
        .map((key) => `| "${key}"`)
        .join('\n');

      const exports = Object.keys(currenciesParsed)
        .map((key) => `export * from './${key}';`)
        .join('\n');

      const contentAllCurrenciesTS = templateCompiled(
        {
          exports: new HBS.SafeString(exports),
          ISOCodes: new HBS.SafeString(ISOCodes),
          currencies: new HBS.SafeString(
            JSON.stringify(currenciesParsed, null, 2),
          ),
        },
        {
          noEscape: true,
        },
      );

      fs.writeFileSync(
        path.resolve(__dirname, `../gen/js/index.js`),
        contentAllCurrenciesTS,
      );
    },
  },
];

/*
 * Create gen directory
 */
if (!fs.existsSync(genDir)) {
  fs.mkdirSync(genDir);
}

/*
 * Run configs
 */
genConfigs.forEach((genConfig) => {
  if (!fs.existsSync(genConfig.directory)) {
    fs.mkdirSync(genConfig.directory);
  }

  const templateSource = fs.readFileSync(
    path.resolve(__dirname, `./templates/${genConfig.template}`),
    'utf-8',
  );

  const templateCompiled = HBS.compile(templateSource);

  genConfig.callback(templateCompiled);
});

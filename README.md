# currency.info

currency.info is a collection of information about actively<sup>†</sup> used currencies around the world.

It can help you if you need to:

- show a list/select of supported currencies
- format a number as a currency value
- convert monetary value in minor units to major units and vice versa

# Installation

You can use `npm` or `yarn` package manager to install **currency.info** as dependency

```sh
npm i @westrem/currency.info
```

```sh
yarn add @westrem/currency.info
```

# Usage

**currency.info** provides two list-like structures that contain all currencies while also exporting every individual currency on its own.

```typescript
// Named imports
import { currenciesMap, currenciesList, JPY } from '@westrem/currency.info';

// Default import is the map structure
import currenciesMap from '@westrem/currency.info';

// Single currency import
import { EUR } from '@westrem/currency.info'; // from main package
import { USD } from '@westrem/currency.info/USD' // from dedicated file

// map
currenciesMap['EUR'].symbol === "€";

// list
currenciesList.map(currency => {
  if (currency.isoCode === "EUR") {...}
});

// single currency
EUR.symbol === "€";
USD.symbol === "$";
JPY.symbol === "¥";
```

## Types

**currency.info** is fully typed. Each currency is of the following type:

```typescript
// Example for EUR currency
interface Currency {
  /**
   * Human readable name of the currency
   * @example Euro
   */
  displayName: string;
  
  /**
   * ISO 4217 numeric code for the currency
   * @example 978
   */
  numericCode: number;

  /**
   * Tells how many, if any, fraction digits the currency usually uses when formatting a monetary value
   * @example 2
   */
  defaultFractionDigits: number;

  /**
   * Tells the relation between minor and major units for a currency - aka how many minor units is one major unit divided into
   * @example 100
   * @example 1
   * @example 1000
   */
  subUnit: number;

  /**
   * Tells whether there should be a space between the numeric value and symbol when formatting a monetary value
   */
  symbolSpaced: boolean;

  /**
   * Tells whether the symbol should be before or after the numeric value when formatting a monetary value
   */
  symbolPosition: "after" | "before";

  /**
   * Symbol for the currency, can be multiple letters
   * @example €
   * @example JOD
   */
  symbol: string;

  /**
   * ISO 4217 code for the currency
   * @example EUR
   */
  isoCode: "EUR" | "USD" | ...; // notice that ISO code is not a general string type but explicit code
};
```

The `currenciesMap` is defined as follows:

```
type CurrencyISOCode = "EUR" | "USD" | ...;
const currenciesMap: { [key in CurrencyISOCode]: Currency } = { ... };
```

The keys for the `currenciesMap` are explicit and can be suggested by your IDE and type-checked by compiler.

Finally, the `currenciesList` is defined as follows:

```
const currenciesList: Currency[] = Object.values(currenciesMap);
```

Both `CurrencyISOCode` type and `Currency` interface are exported and you can import them and use in your code.

# Currencies 101

**currency.info** provides information about 154 currencies. Some good-to-knows:

- not every currency has a one-letter `symbol` like `$` or `€` - some symbols are longer, e.g. `Kč` for Czech crowns and/or can contain special characters
- some currencies don't have a dedicated `symbol` at all, and they use their ISO Code as `symbol`
- not every currency is divided into `100` minor units (e.g. cents or similar), some currencies are divided into `1000` subunits<sup>††</sup> (e.g. Libyan Dinar) and some don't have subunits at all<sup>†††</sup> - aka `subUnit === 1` (e.g. Japanese Yen)
- for currencies that are used in multiple countries, the `symbolPosition` may vary based on locale - this packages does NOT take this into consideration and provides the most used positioning or the generally recommended one, e.g. [EUR sign usage](https://en.wikipedia.org/wiki/Euro_sign#Use)

# Money 101

When working with monetary value **it's a best practice is to always work with minor units (integers)** and switch to major units only upon visual formatting of the value. 

Meaning, any values stored in database or similar should be in minor units. Similarly, variables in code should contain the value in minor units. 

This can prevent bugs related to rounding and float number representation limitations in various programming languages. 

# Code examples

**Select with all currencies**

```tsx
// TypeScript JSX
import { currenciesList } from '@westrem/currency.info';

const CurrenciesSelect = () => (
    <select>
      {currenciesList.map(currency => (
        <option value={currency.isoCode}>
          {currency.displayName} ({currency.symbol})
        </option>
      ))}
    </select>
  );
```

## Formatting monetary values

### JavaScript/TypeScript

JavaScript has a great build-in utility for formatting monetary values: `Intl.NumberFormat`. It works very well hand-in-hand with `currency.info`:

```typescript
// TypeScript

import { currenciesMap, CurrencyISOCode } from '@westrem/currency.info';

const formatMoney = (
  valueInMinorUnits: number, 
  currencyISOCode: CurrencyISOCode, 
  locale: string = 'en-US'
) =>
  Intl.NumberFormat(locale, {
    currency: currencyISOCode,
    currencyDisplay: 'narrowSymbol',
    style: 'currency',
    minimumFractionDigits: currenciesMap[currencyISOCode].defaultFractionDigits,
    maximumFractionDigits: currenciesMap[currencyISOCode].defaultFractionDigits,
  }).format(valueInMinorUnits / currenciesMap[currencyISOCode].subUnit)
;

formatMoney(1234, 'USD'); // $12.34
formatMoney(567, 'JPY'); // ¥567
formatMoney(8900, 'JOD'); // JOD 8.900
formatMoney(1234, 'EUR'); // €12.34 ← dot as decimal separator, symbol before, without space
formatMoney(1234, 'EUR', 'sk-SK'); // 12,34 € ← comma as decimal separator, symbol after, with space
```

If you want to force symbol position, for example because you are rendering values in a tabular context, you can do following:

```typescript
// TypeScript

import { currenciesMap, CurrencyISOCode } from '@westrem/currency.info';

const formatMoneyTabular = (
  valueInMinorUnits: number, 
  currencyISOCode: CurrencyISOCode, 
  locale: string = 'en-US'
) => {
  const numeric = Intl.NumberFormat(locale, {
    currency: currencyISOCode,
    style: 'decimal',
    minimumFractionDigits: currenciesMap[currencyISOCode].defaultFractionDigits,
    maximumFractionDigits: currenciesMap[currencyISOCode].defaultFractionDigits,
  }).format(valueInMinorUnits / currenciesMap[currencyISOCode].subUnit)
  
  return `${CurrencyISOCode} ${numeric}`;
};

formatMoneyTabular(1234, 'USD'); // USD 12.34
formatMoneyTabular(567, 'JPY'); // JPY 567
formatMoneyTabular(8900, 'JOD'); // JOD 8.900
formatMoneyTabular(1234, 'EUR'); // EUR 12.34 ← dot as decimal separator
formatMoneyTabular(1234, 'EUR', 'sk-SK'); // EUR 12,34 ← comma as decimal separator
```

Notice how `locale` in the examples above serves two purposes:

1. it determines what characters are used as decimal and thousands separators (both `formatMoney` and `formatMoneyTabular`)
1. it determines where the currency symbol is positioned (`formatMoney` only)

If for any reason you can't use `Intl.NumberFormat` you can use the `symbolSpaced` and `symbolPosition` properties of each currency to aid you with your formatting needs.

----

* <sup>†</sup> Examples of currencies that existed but are not actively in use anymore: `LTL` - Lithuanian Litas, `LVL` - Latvian Lats: both replaced by EUR
* <sup>††</sup> Following currencies have `subUnit` value of `1000`: `BHD, IQD, JOD, KWD, LYD, OMR, TND`
* <sup>†††</sup> Following currencies have `subUnit` value of `1` (aka they don't have a subunit): `CLP, CVE, DJF, IDR, JPY, KHR, VND, VUV`

# Acknowledgements

- Base data for currencies is taken from https://github.com/vimeo/py-money which itself took data from https://github.com/sebastianbergmann/money
- Symbol position and symbol spacing is sourced also from https://fastspring.com/blog/how-to-format-30-currencies-from-countries-all-over-the-world/
- Symbols are sourced from https://en.wikipedia.org/wiki/List_of_circulating_currencies
- Some of the data above have been tweaked and updated to match current world affairs while I worked at https://primer.io 

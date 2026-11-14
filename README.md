# Test

Sandbox repo for trying the agentic dev workflow.

## Usage

```js
import { slugify } from './src/slugify.js';

slugify('Café au lait!'); // 'cafe-au-lait'
```

`slugify` accepts a string and returns an ASCII-only slug made of `[a-z0-9-]`.
Non-string input throws a `TypeError`.

## Tests

Run tests with `npm test` (requires Node.js 20 or later; no dependencies to install).

# @truenas/common-typescript

Shared TypeScript utilities, scripts and ESLint configurations for TrueNAS projects.

## Installation

```bash
npm install @truenas/common-typescript
```

## Usage

### ESLint Configuration

In your project's `eslint.config.mjs`:

```javascript
import tnCommonConfig from '@truenas/common-typescript/eslint';

export default [
  ...tnCommonConfig,
  // Your additional config
];
```

### Custom rules only

`eslint/rules` is also a separate package, `@truenas/eslint-rules`, with no dependencies. Use it
to get the custom rules without installing the full config and its plugins. Yarn 2+ can install
it straight from this repository:

```bash
yarn add -D "@truenas/eslint-rules@github:truenas/tn-common-typescript#workspace=@truenas/eslint-rules&commit=<sha>"
```

```javascript
import truenas from '@truenas/eslint-rules';

export default [
  {
    plugins: { truenas },
    rules: { 'truenas/max-comment-lines': ['error', 20] },
  },
];
```

Single rules are exported too, e.g. `@truenas/eslint-rules/max-comment-lines`.

### Scripts

#### Linting

```bash
npx @truenas/common-typescript/scripts/lint
# or with --fix
npx @truenas/common-typescript/scripts/lint --fix
```

#### Test Changed Files

```bash
npx @truenas/common-typescript/scripts/test_changed
```

## Contents

- **scripts/lint.ts** - TypeScript/JavaScript and SCSS linting script
- **scripts/test_changed.js** - Run tests only for changed files
- **eslint.config.mjs** - Main ESLint configuration
- **eslint/** - ESLint rule configurations and overrides
  - `eslint-html.mjs` - HTML template linting rules
  - `eslint-spec.mjs` - Test file specific rules
  - `eslint-ts-rules-extra.mjs` - Additional TypeScript rules
  - `eslint-ts-rules-fix-later.mjs` - Rules to be fixed later
  - `eslint-ts-rules-overrides.mjs` - Rule overrides
  - `rules/` - Custom rules, also the dependency-free `@truenas/eslint-rules` workspace package
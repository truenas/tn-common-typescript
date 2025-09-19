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
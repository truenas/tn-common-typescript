if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

import { RuleTester } from 'eslint';
import ruleModule from './max-comment-lines.mjs';
const rule = ruleModule.default || ruleModule;

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2020 },
});

const lineRun = (count) => Array.from({ length: count }, (_, i) => `// line ${i + 1}`).join('\n');
const blockComment = (count) => `/*\n${Array.from({ length: count - 2 }, (_, i) => ` * line ${i + 1}`).join('\n')}\n */`;
const jsdocComment = (count) => `/**\n${Array.from({ length: count - 2 }, (_, i) => ` * line ${i + 1}`).join('\n')}\n */`;

ruleTester.run('max-comment-lines', rule, {
  valid: [
    // Short line comment
    {
      code: '// short\nconst a = 1;',
    },
    // Run of line comments exactly at the default limit
    {
      code: `${lineRun(10)}\nconst a = 1;`,
    },
    // Block comment exactly at the default limit
    {
      code: `${blockComment(10)}\nconst a = 1;`,
    },
    // JSDoc exactly at the default limit
    {
      code: `${jsdocComment(10)}\nfunction a() {}`,
    },
    // Two runs separated by code are measured independently
    {
      code: `${lineRun(6)}\nconst a = 1;\n${lineRun(6)}\nconst b = 2;`,
    },
    // Two runs separated by a blank line are measured independently
    {
      code: `${lineRun(6)}\n\n${lineRun(6)}\nconst a = 1;`,
    },
    // Trailing comments after code on consecutive lines are not a run
    {
      code: Array.from({ length: 12 }, (_, i) => `const a${i} = ${i}; // trailing ${i}`).join('\n'),
    },
    // A trailing comment does not extend a run that starts on the next line
    {
      code: `const a = 1; // trailing\n${lineRun(10)}\nconst b = 2;`,
    },
    // Block comment followed directly by line comments is two blocks
    {
      code: `${blockComment(6)}\n${lineRun(6)}\nconst a = 1;`,
    },
    // Custom limit raises the threshold
    {
      code: `${lineRun(20)}\nconst a = 1;`,
      options: [20],
    },
    // No comments at all
    {
      code: 'const a = 1;',
    },
    // eslint-disable-next-line for this rule suppresses the run beneath it
    {
      code: `// eslint-disable-next-line rule-to-test/max-comment-lines\n${lineRun(11)}\nconst a = 1;`,
    },
    // A directive for another rule above a run at the limit does not extend it
    {
      code: `// eslint-disable-next-line no-console\n${lineRun(10)}\nconsole.log(1);`,
    },
    // A pragma below a run at the limit does not extend it
    {
      code: `${lineRun(10)}\n// @ts-expect-error\nconst a = 1;`,
    },
    // A directive in the middle of a run splits it
    {
      code: `${lineRun(6)}\n// eslint-disable-next-line no-console\n${lineRun(6)}\nconsole.log(1);`,
    },
    // Triple-slash references are not a comment run
    {
      code: Array.from({ length: 12 }, (_, i) => `/// <reference path="./a${i}.d.ts" />`).join('\n'),
    },
    // Block-form directives are never reported
    {
      code: '/* eslint-disable no-console */\nconsole.log(1);\n/* eslint-enable no-console */',
      options: [1],
    },
  ],
  invalid: [
    // Run of line comments over the default limit
    {
      code: `${lineRun(11)}\nconst a = 1;`,
      errors: [{ messageId: 'tooLong', data: { actual: '11', max: '10' }, line: 1, endLine: 11 }],
    },
    // Block comment over the default limit
    {
      code: `${blockComment(11)}\nconst a = 1;`,
      errors: [{ messageId: 'tooLong', data: { actual: '11', max: '10' } }],
    },
    // JSDoc over the default limit
    {
      code: `${jsdocComment(15)}\nfunction a() {}`,
      errors: [{ messageId: 'tooLong', data: { actual: '15', max: '10' } }],
    },
    // Custom limit lowers the threshold
    {
      code: `${lineRun(4)}\nconst a = 1;`,
      options: [3],
      errors: [{ messageId: 'tooLong', data: { actual: '4', max: '3' } }],
    },
    // Only the run that exceeds the limit is reported
    {
      code: `${lineRun(3)}\nconst a = 1;\n${lineRun(11)}\nconst b = 2;`,
      errors: [{ messageId: 'tooLong', data: { actual: '11', max: '10' }, line: 5, endLine: 15 }],
    },
    // Indented run inside a function body
    {
      code: `function a() {\n${lineRun(11).replace(/^/gm, '  ')}\n  return 1;\n}`,
      errors: [{ messageId: 'tooLong', data: { actual: '11', max: '10' } }],
    },
    // A directive above a run does not shift where the run is reported
    {
      code: `// eslint-disable-next-line no-console\n${lineRun(11)}\nconsole.log(1);`,
      errors: [{ messageId: 'tooLong', data: { actual: '11', max: '10' }, line: 2, endLine: 12 }],
    },
  ],
});

console.log('All tests passed.');

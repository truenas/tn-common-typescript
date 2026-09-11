/**
 * ESLint rule: max-comment-lines
 *
 * Caps the number of lines a single comment block may span. A block is one `/* ... *\/` or
 * JSDoc comment, or a run of `//` comments on consecutive lines with nothing else on them.
 * Directive comments (eslint-*, @ts-*, triple-slash references, istanbul/prettier pragmas)
 * are never counted and always end a run, so `eslint-disable-next-line` works on a run.
 *
 * Long comments usually restate the code, narrate history, or hold documentation that
 * belongs in a docs folder. Comment the why, keep it short.
 *
 * Bad:  // Explains the next line
 *       // and then explains it again
 *       // ... (more lines than the limit)
 *
 * Good: // Two-line "why" that the code itself cannot express.
 *       // Longer explanations go to docs.
 *
 * Options: an integer (the maximum, default 10), or an object:
 *   max            maximum lines per block (default 10)
 *   skipBlankLines do not count lines with no text, including a JSDoc opener and closer (default false)
 *   ignoreJsDoc    do not check `/** *\/` comments (default false)
 */

const DEFAULT_MAX = 10;

const DIRECTIVE_PATTERN = /^\s*(?:eslint|globals?\s|exported\s|istanbul\s|c8\s|v8\s|prettier-ignore|@ts-(?:check|nocheck|ignore|expect-error)|\/\s*<)/u;

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum number of lines per comment block',
    },
    messages: {
      tooLong: 'Comment block is {{actual}} lines, maximum is {{max}}.',
    },
    schema: [
      {
        oneOf: [
          {
            type: 'integer',
            minimum: 1,
          },
          {
            type: 'object',
            properties: {
              max: { type: 'integer', minimum: 1 },
              skipBlankLines: { type: 'boolean' },
              ignoreJsDoc: { type: 'boolean' },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
  },

  create(context) {
    const option = context.options[0];
    const {
      max = DEFAULT_MAX,
      skipBlankLines = false,
      ignoreJsDoc = false,
    } = typeof option === 'number' ? { max: option } : (option ?? {});
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function isDirective(comment) {
      return DIRECTIVE_PATTERN.test(comment.value);
    }

    function isJsDoc(comment) {
      return comment.type === 'Block' && comment.value.startsWith('*');
    }

    function isOnOwnLine(comment) {
      const line = sourceCode.lines[comment.loc.start.line - 1];
      return line.slice(0, comment.loc.start.column).trim() === '';
    }

    function isBlankLine(text) {
      return text.replace(/^\s*\*?/u, '').trim() === '';
    }

    function countLines(comments) {
      const first = comments[0];
      const last = comments[comments.length - 1];
      const span = last.loc.end.line - first.loc.start.line + 1;
      if (!skipBlankLines) {
        return span;
      }
      const blank = comments.flatMap((comment) => comment.value.split('\n')).filter(isBlankLine).length;
      return span - blank;
    }

    function check(comments) {
      const actual = countLines(comments);
      if (actual <= max) {
        return;
      }
      context.report({
        loc: { start: comments[0].loc.start, end: comments[comments.length - 1].loc.end },
        messageId: 'tooLong',
        data: { actual: String(actual), max: String(max) },
      });
    }

    return {
      Program() {
        let run = [];

        const flushRun = () => {
          if (run.length) {
            check(run);
          }
          run = [];
        };

        for (const comment of sourceCode.getAllComments()) {
          if (isDirective(comment)) {
            flushRun();
            continue;
          }

          const ownLine = comment.type === 'Line' && isOnOwnLine(comment);
          const previous = run[run.length - 1];

          if (ownLine && previous && comment.loc.start.line === previous.loc.end.line + 1) {
            run.push(comment);
            continue;
          }

          flushRun();

          if (ownLine) {
            run = [comment];
          } else if (!(ignoreJsDoc && isJsDoc(comment))) {
            check([comment]);
          }
        }

        flushRun();
      },
    };
  },
};

export default rule;

/**
 * ESLint rule: max-comment-lines
 *
 * Caps the number of lines a single comment block may span. A block is one `/* ... *\/` or
 * JSDoc comment, or a run of `//` comments on consecutive lines with nothing else on them.
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
 * Options: a single integer, the maximum number of lines per block (default 10).
 */

const DEFAULT_MAX = 10;

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
        type: 'integer',
        minimum: 1,
      },
    ],
  },

  create(context) {
    const max = context.options[0] ?? DEFAULT_MAX;
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function isOnOwnLine(comment) {
      const line = sourceCode.lines[comment.loc.start.line - 1];
      return line.slice(0, comment.loc.start.column).trim() === '';
    }

    function report(first, last) {
      const actual = last.loc.end.line - first.loc.start.line + 1;
      if (actual <= max) {
        return;
      }
      context.report({
        loc: { start: first.loc.start, end: last.loc.end },
        messageId: 'tooLong',
        data: { actual: String(actual), max: String(max) },
      });
    }

    return {
      Program() {
        let runStart = null;
        let runEnd = null;

        const flushRun = () => {
          if (runStart) {
            report(runStart, runEnd);
          }
          runStart = null;
          runEnd = null;
        };

        for (const comment of sourceCode.getAllComments()) {
          const continuesRun = comment.type === 'Line'
            && isOnOwnLine(comment)
            && runEnd
            && comment.loc.start.line === runEnd.loc.end.line + 1;

          if (continuesRun) {
            runEnd = comment;
            continue;
          }

          flushRun();

          if (comment.type === 'Line' && isOnOwnLine(comment)) {
            runStart = comment;
            runEnd = comment;
          } else {
            report(comment, comment);
          }
        }

        flushRun();
      },
    };
  },
};

export default rule;

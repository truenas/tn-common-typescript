import maxCommentLines from './max-comment-lines.mjs';
import noExtraWhitespaceInLineContinuation from './no-extra-whitespace-in-line-continuation.mjs';

// ESLint plugin object; register it under the `truenas` prefix to match the shared config.
export default {
  meta: { name: '@truenas/eslint-rules' },
  rules: {
    'max-comment-lines': maxCommentLines,
    'no-extra-whitespace-in-line-continuation': noExtraWhitespaceInLineContinuation,
  },
};

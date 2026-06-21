// The dataset validator is plain JS (shared verbatim with the node content-lint
// script, so there is exactly one source of truth). Declare its shape for TS.
declare module '*validate-words.mjs' {
  export function validateWords(data: unknown): string[];
}

declare module '*.css';

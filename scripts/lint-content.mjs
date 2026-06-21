#!/usr/bin/env node
/**
 * Content/data lint — validates the word dataset with a real exit code.
 * (1 = invalid). The cheapest, easiest-to-skip gate, so we run it every time.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateWords } from './validate-words.mjs';

const dataPath = fileURLToPath(new URL('../src/data/words.json', import.meta.url));

let data;
try {
  data = JSON.parse(readFileSync(dataPath, 'utf8'));
} catch (err) {
  console.error(`✗ lint:content: cannot read/parse src/data/words.json — ${err.message}`);
  process.exit(1);
}

const errors = validateWords(data);
if (errors.length > 0) {
  console.error('✗ lint:content: dataset invalid:\n');
  for (const e of errors) console.error('  ' + e);
  console.error(`\n${errors.length} error(s) across ${Array.isArray(data) ? data.length : 0} entr(ies).`);
  process.exit(1);
}

console.log(`✓ lint:content: ${data.length} words valid.`);

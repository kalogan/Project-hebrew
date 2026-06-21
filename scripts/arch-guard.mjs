#!/usr/bin/env node
/**
 * Architecture guard — the hard, framework-free backstop for our non-negotiable
 * boundaries. Runs in the gate with a real exit code (1 = violation).
 *
 * Rules enforced:
 *   1. The core is UI-agnostic. Files under src/core/** may not import React,
 *      react-dom, or anything from src/ui/** or src/app/**. The authoritative
 *      domain logic must not depend on the presentation layer.
 *   2. The core is deterministic. Files under src/core/** may not read the
 *      wall-clock (Date.now / new Date) or call Math.random directly — time and
 *      randomness are injected (Clock, Rng). Test files are exempt.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const coreDir = join(root, 'src', 'core');

/** @returns {string[]} absolute paths of .ts/.tsx files under dir */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out; // dir doesn't exist yet — nothing to guard
  }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

const violations = [];

const FORBIDDEN_IMPORTS = [
  { re: /from\s+['"]react(-dom)?['"]/, msg: 'imports React/react-dom' },
  { re: /from\s+['"].*\/ui\//, msg: 'imports from the UI layer (src/ui)' },
  { re: /from\s+['"].*\/app\//, msg: 'imports from the app layer (src/app)' },
];

const FORBIDDEN_NONDETERMINISM = [
  { re: /\bDate\.now\s*\(/, msg: 'calls Date.now() — inject a Clock instead' },
  { re: /\bnew\s+Date\s*\(\s*\)/, msg: 'reads wall-clock via new Date() — inject a Clock' },
  { re: /\bMath\.random\s*\(/, msg: 'calls Math.random() — inject an Rng instead' },
];

for (const file of walk(coreDir)) {
  const isTest = /\.test\.tsx?$/.test(file);
  const rel = relative(root, file);
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const { re, msg } of FORBIDDEN_IMPORTS) {
      if (re.test(line)) violations.push(`${rel}:${i + 1}  core ${msg}`);
    }
    if (!isTest) {
      for (const { re, msg } of FORBIDDEN_NONDETERMINISM) {
        if (re.test(line)) violations.push(`${rel}:${i + 1}  core ${msg}`);
      }
    }
  });
}

if (violations.length > 0) {
  console.error('✗ arch-guard: boundary violations found:\n');
  for (const v of violations) console.error('  ' + v);
  console.error(`\n${violations.length} violation(s).`);
  process.exit(1);
}

console.log('✓ arch-guard: core boundaries clean (UI-agnostic + deterministic).');

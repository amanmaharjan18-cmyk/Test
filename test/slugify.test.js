import { test } from 'node:test';
import assert from 'node:assert/strict';

import { slugify } from '../src/slugify.js';

test('lowercases and hyphenates words', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('strips diacritics', () => {
  assert.equal(slugify('Café'), 'cafe');
});

test('collapses runs of separators into one hyphen', () => {
  assert.equal(slugify('a  --  b__c'), 'a-b-c');
});

test('trims leading and trailing separators', () => {
  assert.equal(slugify('  --Hello!--  '), 'hello');
});

test('returns an empty string for empty or whitespace-only input', () => {
  assert.equal(slugify(''), '');
  assert.equal(slugify('   \t\n'), '');
});

test('throws a TypeError for non-string input', () => {
  assert.throws(() => slugify(42), {
    name: 'TypeError',
    message: 'slugify: expected a string, got number',
  });
});

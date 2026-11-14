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

// ---------------------------------------------------------------------------
// QA: contract tests
// ---------------------------------------------------------------------------

const SLUG_SHAPE = /^[a-z0-9]*(-[a-z0-9]+)*$/;

const VARIED_INPUTS = [
  '',
  '   ',
  '\t\n ',
  '-',
  '---',
  '--foo--',
  'Hello World',
  '  Hello,   World!  ',
  'Café',
  'Café',
  'Crème Brûlée',
  'foo -- _ !! bar',
  'a_b',
  'Top 10 Tips 2026',
  'UPPER lower MiXeD',
  'é́́',
  '́',
  'İstanbul',
  'Kelvin',
  'straße',
  'æon øre',
  'ｆｕｌｌ１２３',
  'x²',
  '½ cup',
  'ﬁnal',
  '日本語 abc',
  'Привет',
  'emoji \u{1F600} party',
  '\uD800abc\uDFFF',
  'a\u0000b',
  ' a b﻿',
  '__proto__',
  'a/b\\c?d#e&f=g+h%20i',
  '<script>alert(1)</script>',
  'x'.repeat(5000) + ' ' + 'é'.repeat(50),
];

test('contract: lowercases and hyphenates', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('contract: strips diacritics in precomposed (NFC) form', () => {
  assert.equal(slugify('Café'), 'cafe');
  assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
});

test('contract: strips diacritics in combining (NFD) form', () => {
  const combining = 'Café';
  assert.equal(combining.length, 5, 'fixture must be the decomposed form');
  assert.equal(slugify(combining), 'cafe');
});

test('contract: precomposed and combining forms produce the same slug', () => {
  for (const s of ['Café', 'Crème Brûlée', 'Ångström', 'naïve']) {
    assert.equal(slugify(s.normalize('NFD')), slugify(s.normalize('NFC')), s);
  }
});

test('contract: every run of non-alphanumerics becomes a single hyphen', () => {
  assert.equal(slugify('foo   bar'), 'foo-bar');
  assert.equal(slugify('foo -- _ !! bar'), 'foo-bar');
  assert.equal(slugify('a_b'), 'a-b');
});

test('contract: trims leading and trailing hyphens', () => {
  assert.equal(slugify('  Hello,   World!  '), 'hello-world');
  assert.equal(slugify('--foo--'), 'foo');
  assert.equal(slugify('---'), '');
});

test('contract: empty and whitespace-only input return ""', () => {
  assert.equal(slugify(''), '');
  assert.equal(slugify('   '), '');
  assert.equal(slugify('\t\n '), '');
});

test('contract: digits are preserved', () => {
  assert.equal(slugify('Top 10 Tips 2026'), 'top-10-tips-2026');
});

test('contract: letters without a decomposition and non-Latin scripts act as separators', () => {
  assert.equal(slugify('straße'), 'stra-e');
  assert.equal(slugify('æon'), 'on');
  assert.equal(slugify('søk'), 's-k');
  assert.equal(slugify('日本語 abc'), 'abc');
  assert.equal(slugify('Привет'), '');
  assert.equal(slugify('emoji \u{1F600} party'), 'emoji-party');
});

test('contract: idempotent - slugify(slugify(x)) === slugify(x)', () => {
  for (const input of VARIED_INPUTS) {
    const once = slugify(input);
    assert.equal(slugify(once), once, `not idempotent for ${JSON.stringify(input.slice(0, 40))}`);
  }
});

test('contract: output always matches /^[a-z0-9]*(-[a-z0-9]+)*$/', () => {
  for (const input of VARIED_INPUTS) {
    const out = slugify(input);
    assert.equal(typeof out, 'string');
    assert.match(out, SLUG_SHAPE, `bad slug for ${JSON.stringify(input.slice(0, 40))}`);
  }
});

test('contract: output shape and idempotence hold for every BMP code point between letters', () => {
  for (let cp = 0; cp <= 0xffff; cp++) {
    const out = slugify('a' + String.fromCharCode(cp) + 'b');
    if (!SLUG_SHAPE.test(out) || slugify(out) !== out) {
      assert.fail(`U+${cp.toString(16).toUpperCase().padStart(4, '0')} produced ${JSON.stringify(out)}`);
    }
  }
});

test('contract: throws TypeError for non-string input', () => {
  const nonStrings = [
    ['undefined', undefined],
    ['null', null],
    ['42', 42],
    ['true', true],
    ['{}', {}],
    ['[]', []],
    ['Symbol()', Symbol()],
    ['new String("x")', new String('x')],
  ];
  for (const [label, value] of nonStrings) {
    assert.throws(() => slugify(value), TypeError, `expected TypeError for ${label}`);
  }
});

test('contract: throws TypeError when called with no argument', () => {
  assert.throws(() => slugify(), TypeError);
});

test('contract: does not coerce objects with toString/valueOf', () => {
  let called = false;
  const sneaky = {
    toString() { called = true; return 'x'; },
    valueOf() { called = true; return 'x'; },
  };
  assert.throws(() => slugify(sneaky), TypeError);
  assert.equal(called, false);
});

test('contract: long separator runs complete in linear time', () => {
  const input = '-'.repeat(200_000) + 'a' + ' '.repeat(200_000) + '́'.repeat(200_000);
  assert.equal(slugify(input), 'a');
});

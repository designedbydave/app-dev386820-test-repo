import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { greeting } from '../src/greeting.js';

describe('greeting', () => {
  it('greets the world by default', () => {
    assert.equal(greeting(), 'Hello, world!');
  });

  it('greets by name', () => {
    assert.equal(greeting('Dave'), 'Hello, Dave!');
  });

  it('ignores surrounding whitespace', () => {
    assert.equal(greeting('  Dave  '), 'Hello, Dave!');
  });

  it('falls back to world for a blank name', () => {
    assert.equal(greeting('   '), 'Hello, world!');
  });
});

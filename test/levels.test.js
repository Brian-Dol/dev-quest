import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, buildLevel, ROWS } from '../js/levels.js';

for (const def of LEVELS) {
  test(`level ${def.id} (${def.phase}) is well formed`, () => {
    const lvl = buildLevel(def);
    const all = lvl.rows.join('');
    assert.equal(lvl.rows.length, ROWS);
    assert.ok(lvl.rows.every((r) => r.length === lvl.width), 'rows have equal width');
    assert.equal((all.match(/P/g) || []).length, 1, 'exactly one player start');
    assert.equal((all.match(/\?/g) || []).length, def.lessons.length, 'one ? block per lesson');
    assert.ok((all.match(/F/g) || []).length >= 4, 'has a goal flag');
    assert.ok((all.match(/E/g) || []).length >= 1, 'has at least one enemy');
  });

  test(`level ${def.id} is traversable`, () => {
    const { cols } = buildLevel(def);
    let run = 0;
    for (let x = 0; x < cols.length; x++) {
      if (cols[x] === null || cols[x] === undefined) {
        run++;
        assert.ok(run <= 3, `gap wider than 3 tiles at column ${x}`);
      } else {
        run = 0;
        const prev = cols[x - 1];
        if (x > 0 && prev != null) assert.ok(prev - cols[x] <= 1, `step too tall at column ${x}`);
      }
    }
  });

  test(`level ${def.id} is deterministic`, () => {
    assert.deepEqual(buildLevel(def), buildLevel(def));
  });

  test(`level ${def.id} has content`, () => {
    assert.equal(def.lessons.length, 3);
    assert.ok(def.summary.deliverables.length >= 4);
    assert.ok(def.goal && def.phase && def.bug);
  });
}

test('levels are numbered sequentially', () => {
  LEVELS.forEach((l, i) => assert.equal(l.id, i + 1));
});

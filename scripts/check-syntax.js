import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

let failed = false;
for (const d of ['js', 'scripts', 'test']) {
  for (const f of readdirSync(d).filter((n) => n.endsWith('.js'))) {
    const r = spawnSync(process.execPath, ['--check', join(d, f)], { encoding: 'utf8' });
    if (r.status !== 0) { failed = true; console.error(r.stderr); }
  }
}
console.log(failed ? 'Syntax check FAILED' : 'Syntax check passed');
process.exit(failed ? 1 : 0);

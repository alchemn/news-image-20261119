// news-image-20261119 entry (Node 22, standard library only).
// The finished poster ships in this repository as entry.png; this program
// places that exact file at the output path as entry.png, so the judge
// sees the very bytes in the repository.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
if (!existsSync(source)) {
  throw new Error('entry.png is missing from the repository');
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const target = join(outDir, 'entry.png');
copyFileSync(source, target);
const bytes = statSync(target).size;
if (bytes !== statSync(source).size) {
  throw new Error(`entry.png copy is incomplete: ${bytes} bytes written`);
}
console.log(`entry.png written: ${bytes} bytes`);

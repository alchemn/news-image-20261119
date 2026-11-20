// news-image-20261119 entry, round 3 — v4 dark poster (Node 22, stdlib only).
// The poster is a finished 1024x1024 PNG checked into this repo as entry.png.
// This program copies that exact file to the output directory as entry.png,
// so the judge sees the same bytes that are in the repository.
//
// Local check:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
if (!existsSync(source)) {
  throw new Error('entry.png is missing from the repository');
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const target = join(outDir, 'entry.png');
copyFileSync(source, target);
const written = statSync(target).size;
const expected = statSync(source).size;
if (written !== expected) {
  throw new Error(`entry.png copy is incomplete: wrote ${written} of ${expected} bytes`);
}
const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
if (sha256(target) !== sha256(source)) {
  throw new Error('entry.png copy failed its sha256 check');
}
// A PNG always starts with the same 8 signature bytes; reject anything else
// so a truncated or non-image file can never pass silently.
const header = readFileSync(target).subarray(0, 8);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!header.equals(pngMagic)) {
  throw new Error('entry.png copy is not a valid PNG (bad signature bytes)');
}
// The competition caps the image at 1024x1024 and 1 MiB; read the IHDR chunk
// (width at bytes 16-19, height at 20-23, big-endian) and refuse anything over.
const ihdr = readFileSync(target).subarray(16, 24);
const width = ihdr.readUInt32BE(0);
const height = ihdr.readUInt32BE(4);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}
if (written > 1024 * 1024) {
  throw new Error(`entry.png is ${written} bytes, over the 1 MiB cap`);
}
console.log(`entry.png written: ${written} bytes, ${width}x${height}, sha256 ${sha256(target)}`);

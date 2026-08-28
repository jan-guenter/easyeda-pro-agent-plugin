#!/usr/bin/env node
import { createCheckpoint, verifyCheckpoint } from '../server/src/checkpoint.mjs';

const [action, ...rest] = process.argv.slice(2);
let result;
if (action === 'create') {
  const [source, outputDir, label] = rest;
  if (!source || !outputDir || !label) {
    throw new Error('Usage: checkpoint.mjs create SOURCE OUTPUT_DIR LABEL');
  }
  result = await createCheckpoint({ source, outputDir, label });
} else if (action === 'verify') {
  const [receiptPath] = rest;
  if (!receiptPath) throw new Error('Usage: checkpoint.mjs verify RECEIPT_PATH');
  result = await verifyCheckpoint(receiptPath);
} else {
  throw new Error('First argument must be create or verify.');
}
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

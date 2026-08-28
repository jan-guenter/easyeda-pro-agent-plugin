#!/usr/bin/env node
import {
  createCheckpoint,
  verifyCheckpoint,
} from "../server/src/checkpoint.ts";

const [action, ...rest] = process.argv.slice(2);
let result;
if (action === "create") {
  const [source, outputDir, label] = rest;
  if (
    source === undefined ||
    source.length === 0 ||
    outputDir === undefined ||
    outputDir.length === 0 ||
    label === undefined ||
    label.length === 0
  ) {
    throw new Error("Usage: checkpoint.ts create SOURCE OUTPUT_DIR LABEL");
  }
  result = await createCheckpoint({ source, outputDir, label });
} else if (action === "verify") {
  const [receiptPath] = rest;
  if (receiptPath === undefined || receiptPath.length === 0) {
    throw new Error("Usage: checkpoint.ts verify RECEIPT_PATH");
  }
  result = await verifyCheckpoint(receiptPath);
} else {
  throw new Error("First argument must be create or verify.");
}
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

/** Fixed reader program: bundled with built-ins only; never receives caller code. */
/* oxlint-disable node/no-top-level-await -- This fixed ESM process entry point is never loaded with require(). */
import { IDENTITY_KEYS, SqlInventoryRefusalError, scanExactSqliteInventory } from "./sqlite-inventory-core.ts";
import type { SqlScanInput } from "./sqlite-inventory-core.ts";

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function validInput(value: unknown): value is SqlScanInput {
  const bound = record(value) ? value["identity"] : null;
  return record(value) && typeof value["checkpointPath"] === "string" && typeof value["expectedSha256"] === "string" &&
    record(bound) && IDENTITY_KEYS.every((key) => typeof bound[key] === "string" && /^\d+$/u.test(bound[key]));
}
async function send(value: unknown): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<true>();
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Await the native stream flush callback before entering synchronous SQLite.
  process.stdout.write(`${JSON.stringify(value)}\n`, (error) => { if (error) { reject(error); } else { resolve(true); } });
  await promise;
}
try {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const raw of process.stdin) {
    const chunk: unknown = raw;
    if (!Buffer.isBuffer(chunk)) { throw new SqlInventoryRefusalError("Reader input was not bytes."); }
    size += chunk.length;
    if (size > 8192) { throw new SqlInventoryRefusalError("Reader input exceeded its bound."); }
    chunks.push(chunk);
  }
  const input: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!validInput(input)) { throw new SqlInventoryRefusalError("Reader input shape refused."); }
  const inventory = await scanExactSqliteInventory(input, () => send({ phase: "scan-start" }));
  await send({ inventory });
} catch (error) {
  await send({ refusal: error instanceof SqlInventoryRefusalError ? error.message : "Isolated SQLite reader failed." });
  process.exitCode = 2;
}

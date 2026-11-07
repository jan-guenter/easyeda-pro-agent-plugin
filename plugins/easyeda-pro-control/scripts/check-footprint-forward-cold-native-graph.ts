/** Static exact graph identity check only. No owner, native helper, compiler,
 * app/control data or automatic pin refresh is imported or invoked. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, readFile, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_GRAPH as GRAPH } from "../server/src/current-footprint-forward-cold-native-graph-pins.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_GRAPH_LIMITS as LIMITS } from "../server/src/current-footprint-forward-cold-native-limits.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_COLD_NATIVE_GRAPH_IDENTITY"); } }
async function main(): Promise<void> {
  need(process.argv.length === 2 && GRAPH.files.map(file => file.role).join(",") === "driver,core,phase");
  const smoke = await readFile(new URL("footprint-forward-cold-execution-smoke.ps1", import.meta.url), "utf8"); let aggregate = 0, compiled = 1;
  for (const pin of GRAPH.files) {
    const path = fileURLToPath(new URL(`../${pin.relativePath}`, import.meta.url));
    const before = await lstat(path);
    need(before.isFile() && !before.isSymbolicLink() && before.nlink === 1 && before.size === pin.bytes && pin.bytes > 0 && pin.bytes <= pin.maximumBytes && pin.maximumBytes <= LIMITS.file);
    // oxlint-disable-next-line eslint/no-bitwise -- Retain the exact regular source descriptor and refuse symlink substitution.
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const first = await file.stat(); need(first.isFile() && !before.isSymbolicLink() && before.nlink === 1 && first.nlink === 1 && first.dev === before.dev && first.ino === before.ino && first.size === pin.bytes && pin.bytes <= pin.maximumBytes && pin.maximumBytes <= LIMITS.file && await realpath(path) === path);
      const bytes = Buffer.alloc(pin.bytes + 1); let offset = 0;
      while (offset < bytes.length) { const result = await file.read(bytes, offset, bytes.length - offset, null); if (result.bytesRead === 0) { break; } offset += result.bytesRead; }
      const after = await file.stat(), named = await lstat(path);
      need(offset === pin.bytes && first.dev === after.dev && first.ino === after.ino && first.size === after.size && first.mtimeMs === after.mtimeMs && first.ctimeMs === after.ctimeMs && first.dev === named.dev && first.ino === named.ino && first.size === named.size && first.mtimeMs === named.mtimeMs && first.ctimeMs === named.ctimeMs && !named.isSymbolicLink() && named.nlink === 1);
      const actual = bytes.subarray(0, offset); need(!actual.some(byte => byte > 127) && createHash("sha256").update(actual).digest("hex") === pin.sha256);
      need(smoke.includes(`@{role='${pin.role}';path='${pin.relativePath}';bytes=${String(pin.bytes)};maximum=${String(pin.maximumBytes)};sha256='${pin.sha256}'}`));
      aggregate += pin.bytes; if (pin.role !== "driver") { compiled += pin.bytes; }
    } finally { await file.close(); }
  }
  need(aggregate === GRAPH.aggregateBytes && aggregate <= LIMITS.aggregate && compiled <= LIMITS.compiled);
  process.stdout.write(`${JSON.stringify({ ok: true, files: GRAPH.files.length, aggregateBytes: aggregate, compiledBytes: compiled, legacyMaximumBytes: LIMITS.file, nativeExecuted: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Static source/artifact check with no runtime owner imports.
await main();

import { readFile, writeFile } from "node:fs/promises";
import { currentPcbWorkerStartupNativeSource } from "../server/src/current-pcb-worker-startup-native.ts";
import { currentPcb209EmptyNativeSource } from "../server/src/current-pcb-209-empty-native.ts";

async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
  const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url);
  const source = await readFile(path, "utf8");
  let next = source;
  for (const [name, generated] of [["WORKER STARTUP", currentPcbWorkerStartupNativeSource()],
    ["WORKER STARTUP EMPTY209", currentPcb209EmptyNativeSource()]] as const) {
    const begin = `// BEGIN GENERATED ${name} PROTOCOL`, end = `// END GENERATED ${name} PROTOCOL`;
    const start = next.indexOf(begin), stop = next.indexOf(end);
    if (start === -1 || stop < start || next.includes(begin, start + begin.length) || next.includes(end, stop + end.length)) {
      throw new Error("Native startup protocol markers must occur once");
    }
    next = next.slice(0, start) + generated + next.slice(stop + end.length);
  }
  if (Buffer.byteLength(next) > 1_048_576) { throw new Error("Native startup helper exceeds its fixed byte bound"); }
  if (action === "--write") { await writeFile(path, next); }
  else if (next !== source) { throw new Error("Generated native startup protocol differs"); }
}
// oxlint-disable-next-line node/no-top-level-await -- ESM-only build command; never loaded by require().
await main();

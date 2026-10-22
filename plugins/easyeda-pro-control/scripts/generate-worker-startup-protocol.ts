import { readFile, writeFile } from "node:fs/promises";
import { currentPcbWorkerStartupNativeSource } from "../server/src/current-pcb-worker-startup-native.ts";

async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
  const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url);
  const source = await readFile(path, "utf8");
  const begin = "// BEGIN GENERATED WORKER STARTUP PROTOCOL", end = "// END GENERATED WORKER STARTUP PROTOCOL";
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) {
    throw new Error("Native startup protocol markers must occur once");
  }
  const next = source.slice(0, start) + currentPcbWorkerStartupNativeSource() + source.slice(stop + end.length);
  if (action === "--write") { await writeFile(path, next); }
  else if (next !== source) { throw new Error("Generated native startup protocol differs"); }
}
// oxlint-disable-next-line node/no-top-level-await -- ESM-only build command; never loaded by require().
await main();

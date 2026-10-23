import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_LAYERS_FUNCTION } from "../server/src/current-pcb-209-layers.ts";

async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
  const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url), source = await readFile(path, "utf8");
  const begin = "// BEGIN GENERATED PCB209 LAYERS PROGRAM", end = "// END GENERATED PCB209 LAYERS PROGRAM";
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) {
    throw new Error("Native layer protocol markers must occur once");
  }
  const digest = createHash("sha256").update(CURRENT_PCB_209_LAYERS_FUNCTION).digest("hex");
  const program = `${begin}\n  const string Layers209Function=@"${CURRENT_PCB_209_LAYERS_FUNCTION.replaceAll('"', '""')}";\n  const string Layers209FunctionSha256="${digest}";\n  ${end}`;
  const next = source.slice(0, start) + program + source.slice(stop + end.length);
  if (action === "--write") { await writeFile(path, next); }
  else if (next !== source) { throw new Error("Generated native layer program differs"); }
}
// oxlint-disable-next-line node/no-top-level-await -- ESM-only generation command.
await main();

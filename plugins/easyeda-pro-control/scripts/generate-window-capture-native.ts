import { readFile, writeFile } from "node:fs/promises";
import { CURRENT_WINDOW_CAPTURE_NATIVE_MEMBERS } from "../server/src/current-pcb-diagnostic-window-capture-native.ts";

const action = process.argv[2];
if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url);
// oxlint-disable-next-line node/no-top-level-await -- One deterministic builtin-only native source generation command.
const source = await readFile(path, "utf8");
const begin = "// BEGIN GENERATED DIAGNOSTIC WINDOW CAPTURE", end = "// END GENERATED DIAGNOSTIC WINDOW CAPTURE";
const start = source.indexOf(begin), stop = source.indexOf(end);
if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) {
  throw new Error("Window capture native markers must occur once inside the original owner");
}
const generated = `${begin}\n${CURRENT_WINDOW_CAPTURE_NATIVE_MEMBERS.trim()}\n  ${end}`;
const next = source.slice(0, start) + generated + source.slice(stop + end.length);
if (action === "--write") {
  // oxlint-disable-next-line node/no-top-level-await -- Emit only the exact source-owned fixed marker block.
  await writeFile(path, next);
} else if (next !== source) { throw new Error("Generated native window capture differs"); }

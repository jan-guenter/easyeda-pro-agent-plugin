/** Fixed source graph generation only. This command reads source, writes only
 * its reviewed output roles, and never imports the owner or starts a helper. */
import { CURRENT_NATIVE_BASELINE, assertCurrentNativeBaseline } from "./native-baseline-source.ts";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { currentFootprintForwardNativeOutputs, currentFootprintForwardNativePins, currentFootprintForwardNativeSmoke } from "../server/src/current-footprint-forward-native-graph-source.ts";

async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--check" && action !== "--write") { throw new Error("FORWARD_NATIVE_GRAPH_ARGUMENTS"); }
  const legacy = await readFile(new URL(`../${CURRENT_NATIVE_BASELINE.relativePath}`, import.meta.url), "utf8");
  assertCurrentNativeBaseline(legacy);
  const outputs = currentFootprintForwardNativeOutputs(legacy);
  const files = [...outputs.map(output => ({ url: new URL(`../${output.relativePath}`, import.meta.url), text: output.source })),
    { url: new URL("../server/src/current-footprint-forward-native-graph-pins.ts", import.meta.url), text: currentFootprintForwardNativePins(outputs) },
    { url: new URL("footprint-forward-execution-smoke.ps1", import.meta.url), text: currentFootprintForwardNativeSmoke(outputs) }];
  for (const file of files) {
    if (action === "--write") { await mkdir(new URL(".", file.url), { recursive: true }); await writeFile(file.url, file.text); }
    else if (await readFile(file.url, "utf8") !== file.text) { throw new Error("FORWARD_NATIVE_GRAPH_GENERATION_CHANGED"); }
  }
  process.stdout.write(`${JSON.stringify({ ok: true, roles: outputs.map(({ source: _source, ...pin }) => pin), nativeExecuted: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Fixed source generation executable; no runtime owner or application imports exist.
await main();

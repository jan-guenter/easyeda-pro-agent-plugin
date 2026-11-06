/** Fixed source graph generation only. This command reads source, writes only
 * its reviewed output roles, and never imports the owner or starts a helper. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { currentFootprintForwardColdNativeOutputs, currentFootprintForwardColdNativePins, currentFootprintForwardColdNativeSmoke } from "../server/src/current-footprint-forward-cold-native-graph-source.ts";

async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--check" && action !== "--write") { throw new Error("FORWARD_NATIVE_GRAPH_ARGUMENTS"); }
  const legacy = await readFile(new URL("pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const outputs = currentFootprintForwardColdNativeOutputs(legacy);
  const files = [...outputs.map(output => ({ url: new URL(`../${output.relativePath}`, import.meta.url), text: output.source })),
    { url: new URL("../server/src/current-footprint-forward-cold-native-graph-pins.ts", import.meta.url), text: currentFootprintForwardColdNativePins(outputs) },
    { url: new URL("footprint-forward-cold-execution-smoke.ps1", import.meta.url), text: currentFootprintForwardColdNativeSmoke(outputs) }];
  for (const file of files) {
    if (action === "--write") { await mkdir(new URL(".", file.url), { recursive: true }); await writeFile(file.url, file.text); }
    else if (await readFile(file.url, "utf8") !== file.text) { throw new Error("FORWARD_NATIVE_GRAPH_GENERATION_CHANGED"); }
  }
  process.stdout.write(`${JSON.stringify({ ok: true, roles: outputs.map(({ source: _source, ...pin }) => pin), nativeExecuted: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Fixed source generation executable; no runtime owner or application imports exist.
await main();

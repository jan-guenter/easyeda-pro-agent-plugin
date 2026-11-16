/** Fixed seven-role native generation. It starts no helper or application. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { CURRENT_NATIVE_BASELINE, assertCurrentNativeBaseline } from "./native-baseline-source.ts";
import { currentFootprintForwardWriterCompleteNativeOutputs, currentFootprintForwardWriterCompleteNativePins } from "../server/src/current-footprint-forward-writer-complete-native-source.ts";

import { currentFootprintForwardWriterCompleteNativeSmoke } from "../server/src/current-footprint-forward-writer-complete-native-smoke.ts";

/** Generate or compare the closed graph without importing a runtime owner. */
async function main(): Promise<void> {
  const action = process.argv[2];
  if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("FORWARD_WRITER_NATIVE_ARGUMENTS"); }
  const source = await readFile(new URL(`../${CURRENT_NATIVE_BASELINE.relativePath}`, import.meta.url), "utf8");
  assertCurrentNativeBaseline(source);
  const outputs = currentFootprintForwardWriterCompleteNativeOutputs(source);
  const files = [{ url: new URL("../scripts/footprint-forward-writer-complete-smoke.ps1", import.meta.url), text: currentFootprintForwardWriterCompleteNativeSmoke(outputs) }, ...outputs.map(output => ({ url: new URL(`../${output.relativePath}`, import.meta.url), text: output.source })),
    { url: new URL("../server/src/current-footprint-forward-writer-complete-native-pins.ts", import.meta.url), text: currentFootprintForwardWriterCompleteNativePins(outputs) }];
  for (const file of files) {
    if (action === "--write") { await mkdir(new URL(".", file.url), { recursive: true }); await writeFile(file.url, file.text); }
    else if (await readFile(file.url, "utf8") !== file.text) { throw new Error("FORWARD_WRITER_NATIVE_GENERATION_CHANGED"); }
  }
  process.stdout.write(`${JSON.stringify({ ok: true, files: outputs.map(({ source: _source, ...row }) => row), nativeExecuted: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Fixed source generator, with no runtime owner import or native execution.
await main();

/** Reproduce the two fixed schematic purposes without executing native code. */
import { CURRENT_NATIVE_BASELINE } from "./native-baseline-source.ts";
import { readFile, writeFile } from "node:fs/promises";
import { generateSchematicEditNativeSource, schematicEditNativeIdentity } from "./schematic-edit-native-source.ts";

async function main(): Promise<void> {
  const mode = process.argv[2]; if (process.argv.length !== 3 || mode !== "--check" && mode !== "--write") { throw new Error("SCHEMATIC_NATIVE_GENERATOR_ARGUMENTS"); }
  const seed = await readFile(new URL(`../${CURRENT_NATIVE_BASELINE.relativePath}`, import.meta.url), "utf8"); const data = generateSchematicEditNativeSource(seed);
  const outputs = [{ url: new URL("schematic-edit-native.ps1", import.meta.url), text: data.helper }, { url: new URL("schematic-edit-native.cs", import.meta.url), text: data.review }, { url: new URL("../server/src/current-schematic-edit-native-identity.ts", import.meta.url), text: schematicEditNativeIdentity(data) }];
  for (const output of outputs) {
    if (mode === "--write") { await writeFile(output.url, output.text, { mode: 0o644 }); }
    else if (await readFile(output.url, "utf8") !== output.text) { throw new Error("SCHEMATIC_NATIVE_GENERATION_CHANGED"); }
  }
  process.stdout.write(`${JSON.stringify({ ok: true, helperBytes: Buffer.byteLength(data.helper), compilerBytes: Buffer.byteLength(data.compiler), nativeExecuted: false })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- Build-only command, with no owner or application imports.
await main();

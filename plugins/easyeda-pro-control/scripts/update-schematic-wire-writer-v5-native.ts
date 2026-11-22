/** Rebuild or check the fixed V5 helper graph. */
import { readFile, writeFile } from "node:fs/promises";
import { SCHEMATIC_WIRE_WRITER_V4_PREIMAGE } from "../server/src/current-schematic-wire-writer-v4-native-preimage.ts";
import { SCHEMATIC_WIRE_WRITER_V5_REVIEW_PATH, generateSchematicWireWriterV5NativeSource, schematicWireWriterV5NativeIdentity } from "./schematic-wire-writer-v5-native-source.ts";

async function main(): Promise<void> {
  const argument = process.argv[2];
  if (process.argv.length > 3 || (argument !== undefined && argument !== "--check")) {
    throw new Error("WIRE_V5_GENERATOR_ARGUMENT");
  }

  const seed = await readFile(new URL(`../${SCHEMATIC_WIRE_WRITER_V4_PREIMAGE.relativePath}`, import.meta.url), "utf8");
  const data = generateSchematicWireWriterV5NativeSource(seed);
  const files = [
    ["./schematic-wire-writer-v5-native.ps1", data.helper],
    [`../../../${SCHEMATIC_WIRE_WRITER_V5_REVIEW_PATH}`, data.review],
    ["../server/src/current-schematic-wire-writer-v5-native-identity.ts", schematicWireWriterV5NativeIdentity(data)],
  ] as const;

  for (const [path, contents] of files) {
    const url = new URL(path, import.meta.url);
    if (argument === "--check") {
      if (await readFile(url, "utf8") !== contents) {
        throw new Error("WIRE_V5_GENERATED_SOURCE_DRIFT");
      }
    } else {
      await writeFile(url, contents);
    }
  }
}

// oxlint-disable-next-line unicorn/prefer-top-level-await -- This build-only CLI keeps await inside its main function.
void main();

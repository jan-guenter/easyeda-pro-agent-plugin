/** Rebuild or check the fixed V5 and compile-only V6 helper graphs. */
import { readFile, writeFile } from "node:fs/promises";
import { SCHEMATIC_WIRE_WRITER_V4_PREIMAGE } from "../server/src/current-schematic-wire-writer-v4-native-preimage.ts";
import {
  SCHEMATIC_WIRE_WRITER_V5_REVIEW_PATH, SCHEMATIC_WIRE_WRITER_V6_REVIEW_PATH,
  generateSchematicWireWriterV5NativeSource, generateSchematicWireWriterV6NativeSource,
  schematicWireWriterV5NativeIdentity, schematicWireWriterV6NativeIdentity,
} from "./schematic-wire-writer-v5-native-source.ts";

async function v5Files(): Promise<readonly (readonly [string, string])[]> {
  const seed = await readFile(new URL(`../${SCHEMATIC_WIRE_WRITER_V4_PREIMAGE.relativePath}`, import.meta.url), "utf8");
  const data = generateSchematicWireWriterV5NativeSource(seed);
  return [
    ["./schematic-wire-writer-v5-native.ps1", data.helper],
    [`../../../${SCHEMATIC_WIRE_WRITER_V5_REVIEW_PATH}`, data.review],
    ["../server/src/current-schematic-wire-writer-v5-native-identity.ts", schematicWireWriterV5NativeIdentity(data)],
  ];
}

async function v6Files(): Promise<readonly (readonly [string, string])[]> {
  const seed = await readFile(new URL("schematic-wire-writer-v5-native.ps1", import.meta.url), "utf8");
  const data = generateSchematicWireWriterV6NativeSource(seed);
  return [
    ["./schematic-wire-writer-v6-native.ps1", data.helper],
    [`../../../${SCHEMATIC_WIRE_WRITER_V6_REVIEW_PATH}`, data.review],
    ["../server/src/current-schematic-wire-writer-v6-native-identity.ts", schematicWireWriterV6NativeIdentity(data)],
  ];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2), v6 = args[0] === "--v6";
  const check = args[v6 ? 1 : 0];
  if (args.length > (v6 ? 2 : 1) || (check !== undefined && check !== "--check")) {
    throw new Error(v6 ? "WIRE_V6_GENERATOR_ARGUMENT" : "WIRE_V5_GENERATOR_ARGUMENT");
  }
  const files = await (v6 ? v6Files() : v5Files());

  for (const [path, contents] of files) {
    const url = new URL(path, import.meta.url);
    if (check === "--check") {
      if (await readFile(url, "utf8") !== contents) {
        throw new Error(v6 ? "WIRE_V6_GENERATED_SOURCE_DRIFT" : "WIRE_V5_GENERATED_SOURCE_DRIFT");
      }
    } else {
      await writeFile(url, contents);
    }
  }
}

// oxlint-disable-next-line unicorn/prefer-top-level-await -- This build-only CLI keeps await inside its main function.
void main();

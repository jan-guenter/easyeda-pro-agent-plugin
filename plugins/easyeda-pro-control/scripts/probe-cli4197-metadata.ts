#!/usr/bin/env node
/** Developer source entry only. Run with the reviewed Node24 source-checkout
 * dependencies; this is neither an installed runtime nor an MCP execution tool. */
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { runCli4197MetadataProbe } from "./cli4197-metadata/runner.ts";
import { parseCli4197MetadataOptions } from "./cli4197-metadata/profile.ts";

/** Exact named resources and one fixed metadata route, with no positional argv,
 * project/session/code arguments or implicit invocation on module import. */
export async function cli4197MetadataMain(args: readonly string[]): Promise<void> {
  const parsed = parseArgs({ args: [...args], allowPositionals: false, strict: true, options: {
    help: { type: "boolean" }, command: { type: "string" }, "runtime-directory": { type: "string" }, inventory: { type: "string" }, "evidence-parent": { type: "string" },
  } });
  if (parsed.values.help === true) {
    if (Object.keys(parsed.values).length !== 1) { throw new Error("CLI4197_METADATA_HELP_ONLY"); }
    process.stdout.write("Developer source probe: --command rootHelp|openHelp|apiHelp|invokeHelp|sessionListHelp|viaCreateDocs --runtime-directory <fixed4197-runtime> --inventory <reviewed-inventory.json> --evidence-parent <private-mode0700-directory>\n"); return;
  }
  const options = parseCli4197MetadataOptions({ command: parsed.values.command, runtimeDirectory: parsed.values["runtime-directory"], inventoryPath: parsed.values.inventory, evidenceParent: parsed.values["evidence-parent"] });
  const result = await runCli4197MetadataProbe(options);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
if (process.argv[1] !== undefined && resolve(process.argv[1]) === import.meta.filename) {
  try {
    // oxlint-disable-next-line node/no-top-level-await -- This developer source entry retains the original namespace child and resources through closure.
    await cli4197MetadataMain(process.argv.slice(2));
  } catch {
    process.stderr.write("CLI4197_METADATA_PROBE_REFUSED: inspect the private retained artifacts; no retry or runtime admission was granted.\n"); process.exitCode = 1;
  }
}

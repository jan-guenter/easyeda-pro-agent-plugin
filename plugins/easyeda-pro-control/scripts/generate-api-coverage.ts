import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { extensionApiCoverageSummary, inventoryExtensionApiCoverage } from "../server/src/extension-api-coverage.ts";

async function generate(): Promise<void> {
  const mode = process.argv[2];
  if (process.argv.length !== 3 || (mode !== "--check" && mode !== "--write")) { throw new Error("Usage: generate-api-coverage.ts --check|--write"); }
  const entries = inventoryExtensionApiCoverage();
  const output = `${JSON.stringify({ schema: "easyeda-pro-control.extension-api-coverage-inventory.v1", scope: "offline-implementation-inventory;not-execution-authority", summary: extensionApiCoverageSummary(entries), entries }, null, 2)}\n`;
  const path = resolve(import.meta.dirname, "../api-coverage.json");
  if (mode === "--check") {
    if (await readFile(path, "utf8") !== output) { throw new Error("Committed API coverage inventory is stale; review coverage policy/routes then run generator --write."); }
  } else { await writeFile(path, output); }
  process.stdout.write(`API coverage ${mode === "--check" ? "verified" : "generated"}: ${entries.length} distinct methods.\n`);
}

// oxlint-disable-next-line node/no-top-level-await -- This deterministic generator is a CLI entrypoint, never an imported facade module.
await generate();

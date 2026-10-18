#!/usr/bin/env node
import { resolve } from "node:path";

import { verifyInstalledPayload } from "./installed-payload.ts";

async function main(): Promise<void> {
  const [installedRoot, commit, ...extra] = process.argv.slice(2);
  if (installedRoot === undefined || commit === undefined || extra.length > 0) {
    throw new Error("Usage: verify-installed-payload.ts /absolute/installed/plugin FULL_COMMIT_SHA");
  }
  const result = await verifyInstalledPayload({ commit, installedRoot, repositoryRoot: resolve(import.meta.dirname, "../../..") });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (import.meta.main) {
  try {
    // oxlint-disable-next-line node/no-top-level-await -- The guarded CLI is inert when imported by tests or another reviewed verifier.
    await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : "Installed payload verification failed."}\n`);
    process.exitCode = 1;
  }
}

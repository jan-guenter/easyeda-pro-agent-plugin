#!/usr/bin/env node
import { fileURLToPath } from "node:url";

import { launchMachine as launchMachineForRoot } from "../server/src/machine-launch.ts";
import { MachineProfileError } from "../server/src/machine-profile.ts";

export { parseMachineLauncherArguments } from "../server/src/machine-launch.ts";

export async function launchMachine(args: readonly string[]): Promise<void> {
  const pluginRoot = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/u, "");
  await launchMachineForRoot(args, pluginRoot);
}

if (import.meta.main) {
  try {
    // oxlint-disable-next-line node/no-top-level-await -- The launcher completes profile checks before loading the single facade process.
    await launchMachine(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof MachineProfileError ? error.code : "machine-launch-failed" })}\n`);
    process.exitCode = 1;
  }
}

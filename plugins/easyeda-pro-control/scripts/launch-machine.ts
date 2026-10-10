#!/usr/bin/env node
import { fileURLToPath } from "node:url";

import {
  MachineProfileError,
  loadRuntimeMachineProfile,
  machineProfileLaunchConfiguration,
  openVerifiedMachineNode,
} from "../server/src/machine-profile.ts";

export function parseMachineLauncherArguments(args: readonly string[]): { profilePath?: string } {
  if (args.length === 0) { return {}; }
  if (args.length !== 2 || args[0] !== "--profile" || args[1] === undefined || args[1].startsWith("--")) {
    throw new MachineProfileError("machine-launcher-arguments-invalid");
  }
  return { profilePath: args[1] };
}

export async function launchMachine(args: readonly string[]): Promise<void> {
  const runtime = await loadRuntimeMachineProfile(parseMachineLauncherArguments(args));
  const pluginRoot = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/u, "");
  const configuration = machineProfileLaunchConfiguration(runtime.profile, pluginRoot);
  const entrypoint = configuration.args[0];
  if (entrypoint === undefined) { throw new MachineProfileError("machine-launcher-entrypoint-missing"); }
  const environment = { ...process.env, ...configuration.env, EASYEDA_MACHINE_PROFILE: runtime.profilePath };
  // A portable node command may select another version. POSIX replacement
  // Preserves PID, stdio, signals and exit status without an orphanable wrapper.
  if (typeof process.execve !== "function") {
    throw new MachineProfileError("machine-launcher-needs-node-with-execve");
  }
  const node = await openVerifiedMachineNode(runtime.profile.runtime);
  try {
    process.chdir(configuration.cwd);
    await node.assertCurrent();
    // Keep admission open through the kernel handoff.
    // Path swaps after the final proof cannot substitute a different executable.
    // Replacement preserves the single facade PID and stdio without a wrapper child.
    process.execve(node.descriptorPath, [configuration.command, ...configuration.args], environment);
  } finally {
    await node.close();
  }
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

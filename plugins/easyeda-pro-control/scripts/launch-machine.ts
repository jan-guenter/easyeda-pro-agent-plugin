#!/usr/bin/env node
import { lstat, realpath, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  MACHINE_NODE_VERSION,
  MachineProfileError,
  loadRuntimeMachineProfile,
  machineProfileLaunchConfiguration,
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
  process.chdir(configuration.cwd);
  const runningNode = await stat("/proc/self/exe");
  const configuredNode = await lstat(configuration.command);
  if (process.versions.node === MACHINE_NODE_VERSION && await realpath(process.execPath) === configuration.command &&
      runningNode.dev === configuredNode.dev && runningNode.ino === configuredNode.ino) {
    Object.assign(process.env, environment);
    // One facade in the current process: no extra MCP owner or stdio framing layer.
    await import(pathToFileURL(entrypoint).href);
    return;
  }
  // A portable node command may select another version. POSIX replacement
  // Preserves PID, stdio, signals and exit status without an orphanable wrapper.
  if (typeof process.execve !== "function") {
    throw new MachineProfileError("machine-launcher-needs-node-with-execve");
  }
  process.execve(configuration.command, [configuration.command, ...configuration.args], environment);
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

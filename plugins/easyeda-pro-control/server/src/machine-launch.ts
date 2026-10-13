import {
  MachineProfileError,
  loadMachineLaunchProfile,
  machineInstallationFailureCodeSchema,
  machineProfileLaunchConfiguration,
  openVerifiedMachineNode,
} from "./machine-profile.ts";
import type { MachineInstallationFailureCode } from "./machine-profile.ts";

export function parseMachineLauncherArguments(args: readonly string[]): { profilePath?: string } {
  if (args.length === 0) { return {}; }
  if (args.length !== 2 || args[0] !== "--profile" || args[1] === undefined || args[1].startsWith("--")) {
    throw new MachineProfileError("machine-launcher-arguments-invalid");
  }
  return { profilePath: args[1] };
}

export function parseOfflineLauncherArguments(args: readonly string[]): MachineInstallationFailureCode {
  const code = machineInstallationFailureCodeSchema.safeParse(args[1]);
  if (args.length !== 2 || args[0] !== "--offline-only" || !code.success) {
    throw new MachineProfileError("machine-launcher-arguments-invalid");
  }
  return code.data;
}

/** The trusted source wrapper or bundled entrypoint derives pluginRoot, never CLI arguments. */
export async function launchMachine(args: readonly string[], pluginRoot: string): Promise<void> {
  const runtime = await loadMachineLaunchProfile(parseMachineLauncherArguments(args));
  const configuration = machineProfileLaunchConfiguration(runtime.profile, pluginRoot);
  const entrypoint = configuration.args[0];
  if (entrypoint === undefined) { throw new MachineProfileError("machine-launcher-entrypoint-missing"); }
  const entrypointArguments = runtime.installation.ready
    ? configuration.args
    : [entrypoint, "--offline-only", runtime.installation.code];
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
    process.execve(node.descriptorPath, [configuration.command, ...entrypointArguments], environment);
  } finally {
    await node.close();
  }
}

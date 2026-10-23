#!/usr/bin/env node
import { resolve } from "node:path";
import { upgradeCalculationProfile } from "../server/src/calculation-profile-upgrade.ts";
import type { CalculationProfileUpgradeTarget } from "../server/src/calculation-profile-upgrade.ts";
import { MachineProfileError, defaultMachineProfilePath } from "../server/src/machine-profile.ts";

export function parseCalculationUpgradeArguments(args: readonly string[]): string {
  if (args.length === 0) { return defaultMachineProfilePath(); }
  if (args.length !== 2 || args[0] !== "--profile" || args[1] === undefined || args[1].length === 0 || args[1].startsWith("--")) {
    throw new MachineProfileError("machine-upgrade-arguments-invalid");
  }
  return resolve(args[1]);
}

export function parseCalculationUpgradeOptions(args: readonly string[]): {
  readonly profilePath: string;
  readonly target: CalculationProfileUpgradeTarget;
} {
  const index = args.indexOf("--target");
  if (index === -1) { return { profilePath: parseCalculationUpgradeArguments(args), target: "sdk-math-206" }; }
  const target = args[index + 1];
  if ((target !== "sdk-math-206" && target !== "public-utilities-209") || args.includes("--target", index + 1)) {
    throw new MachineProfileError("machine-upgrade-arguments-invalid");
  }
  const remaining = [...args.slice(0, index), ...args.slice(index + 2)];
  return { profilePath: parseCalculationUpgradeArguments(remaining), target };
}

if (import.meta.main) {
  try {
    const options = parseCalculationUpgradeOptions(process.argv.slice(2));
    // oxlint-disable-next-line node/no-top-level-await -- The explicit closed migration target is validated before this one guarded CLI call.
    const receipt = await upgradeCalculationProfile(options.profilePath, options.target);
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof MachineProfileError ? error.code : "machine-calculation-upgrade-failed" })}\n`);
    process.exitCode = 1;
  }
}

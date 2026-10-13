#!/usr/bin/env node
import { resolve } from "node:path";
import { upgradeCalculationProfile } from "../server/src/calculation-profile-upgrade.ts";
import { MachineProfileError, defaultMachineProfilePath } from "../server/src/machine-profile.ts";

export function parseCalculationUpgradeArguments(args: readonly string[]): string {
  if (args.length === 0) { return defaultMachineProfilePath(); }
  if (args.length !== 2 || args[0] !== "--profile" || args[1] === undefined || args[1].length === 0 || args[1].startsWith("--")) {
    throw new MachineProfileError("machine-upgrade-arguments-invalid");
  }
  return resolve(args[1]);
}

if (import.meta.main) {
  try {
    // oxlint-disable-next-line node/no-top-level-await -- Report the one explicit configuration migration only after durable completion.
    const receipt = await upgradeCalculationProfile(parseCalculationUpgradeArguments(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof MachineProfileError ? error.code : "machine-calculation-upgrade-failed" })}\n`);
    process.exitCode = 1;
  }
}

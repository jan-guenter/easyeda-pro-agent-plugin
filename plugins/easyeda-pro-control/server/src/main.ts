#!/usr/bin/env node
import { fileURLToPath } from "node:url";

import { configureWindowsWslMachine, launchMachine, machineLaunchFailureCode, parseOfflineLauncherArguments } from "./machine-launch.ts";
import { MachineProfileError } from "./machine-profile.ts";

if (process.argv[2] === "--machine-launch") {
  try {
    const pluginRoot = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/u, "");
    // oxlint-disable-next-line node/no-top-level-await -- Complete launch checks before initializing any facade module or lease.
    await launchMachine(process.argv.slice(3), pluginRoot);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: machineLaunchFailureCode(error) })}\n`);
    process.exitCode = 1;
  }
} else if (process.argv[2] === "--configure-wsl-launch") {
  try {
    const pluginRoot = fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/u, "");
    // oxlint-disable-next-line node/no-top-level-await -- This explicit standalone provisioner verifies fixed readonly WSL metadata before publishing its recognized launcher profile.
    const result = await configureWindowsWslMachine(process.argv.slice(3), pluginRoot);
    process.stdout.write(`${JSON.stringify(result)  }\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: machineLaunchFailureCode(error) })  }\n`);
    process.exitCode = 1;
  }
} else if (process.argv[2] === "--offline-only") {
  try {
    const code = parseOfflineLauncherArguments(process.argv.slice(2));
    // oxlint-disable-next-line node/no-top-level-await -- The offline module is selected only after its exact bounded arguments pass.
    const { startOfflineControlServer } = await import("./offline-control.ts");
    // oxlint-disable-next-line node/no-top-level-await -- This isolated entrypoint never initializes the ordinary facade or a live controller.
    await startOfflineControlServer(code);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof MachineProfileError ? error.code : "machine-offline-start-failed" })}\n`);
    process.exitCode = 1;
  }
} else if (process.argv[2] === undefined) {
  // oxlint-disable-next-line node/no-top-level-await -- Lazy initialization is required so the launch selector cannot create facade state.
  await import("./index.ts");
} else {
  process.stderr.write(`${JSON.stringify({ ok: false, error: "machine-launcher-arguments-invalid" })}\n`);
  process.exitCode = 1;
}

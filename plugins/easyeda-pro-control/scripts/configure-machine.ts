#!/usr/bin/env node
import { lstat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  MachineProfileError,
  createMachineProfile,
  defaultMachineProfilePath,
  readMachineProfile,
  writeMachineProfile,
} from "../server/src/machine-profile.ts";
import type { MachineProfileOptions } from "../server/src/machine-profile.ts";

export function parseMachineArguments(args: readonly string[]): {
  profilePath: string;
  options: MachineProfileOptions;
  hasOverrides: boolean;
} {
  const names = new Set(["--profile", "--plugin-root", "--node", "--upstream-root", "--assets-root", "--control-dir", "--pcb-version", "--api-version"]);
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (name === undefined || !names.has(name) || values.has(name) || value === undefined ||
        value.length === 0 || value.startsWith("--")) { throw new MachineProfileError("machine-configuration-arguments-invalid"); }
    values.set(name, value);
  }
  const profilePath = values.has("--profile")
    ? resolve(values.get("--profile") ?? "")
    : defaultMachineProfilePath();
  const options: MachineProfileOptions = {
    pluginRoot: resolve(values.get("--plugin-root") ?? fileURLToPath(new URL("..", import.meta.url))),
    ...(values.has("--node") ? { nodeExecutable: resolve(values.get("--node") ?? "") } : {}),
    ...(values.has("--upstream-root") ? { upstreamRoot: resolve(values.get("--upstream-root") ?? "") } : {}),
    ...(values.has("--assets-root") ? { assetsRoot: resolve(values.get("--assets-root") ?? "") } : {}),
    controlDirectory: resolve(values.get("--control-dir") ?? dirname(profilePath)),
    ...(values.has("--pcb-version") ? { pcbBundleVersion: values.get("--pcb-version") ?? "" } : {}),
    ...(values.has("--api-version") ? { publicApiBundleVersion: values.get("--api-version") ?? "" } : {}),
  };
  return { profilePath, options, hasOverrides: [...values.keys()].some((name) => name !== "--profile") };
}

export async function configureMachine(args: readonly string[]): Promise<{
  ok: true; profilePath: string; reused: boolean; platform: string; nodeVersion: string;
  upstreamVersion: string; pcbBundleVersion: string; publicApiBundleVersion: string;
}> {
  const parsed = parseMachineArguments(args);
  let exists = false;
  try {
    await lstat(parsed.profilePath);
    exists = true;
  } catch (error) {
    if (error === null || typeof error !== "object" || !("code" in error) || error.code !== "ENOENT") { throw error; }
  }
  if (exists && parsed.hasOverrides) { throw new MachineProfileError("machine-profile-exists-use-fresh-profile-path"); }
  const profile = exists ? await readMachineProfile(parsed.profilePath) : await createMachineProfile(parsed.options);
  if (!exists) { await writeMachineProfile(profile, parsed.profilePath); }
  return {
    ok: true, profilePath: parsed.profilePath, reused: exists, platform: profile.platform,
    nodeVersion: profile.runtime.nodeVersion, upstreamVersion: profile.upstream.serverVersion,
    pcbBundleVersion: profile.easyeda.pcbBundleVersion, publicApiBundleVersion: profile.easyeda.publicApiBundleVersion,
  };
}

if (import.meta.main) {
  try {
    // oxlint-disable-next-line node/no-top-level-await -- This executable CLI must finish configuration before reporting its exit status.
    const result = await configureMachine(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof MachineProfileError ? error.code : "machine-configuration-failed" })}\n`);
    process.exitCode = 1;
  }
}

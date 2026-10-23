import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, opendir, realpath } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";
import { MACHINE_PROFILE_ENVIRONMENT_VARIABLE, defaultMachineProfilePath, machineProfileSchema, readMachineInspectionProfile } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";

const versionSchema = z.string().regex(/^[0-9][A-Za-z0-9.+-]{0,127}$/u);
const MAX_ENTRIES = 128;
const MAX_BUNDLE_BYTES = 256 * 1024 * 1024;
type Observation = "present" | "missing" | "unsafe" | "unavailable";

function sameFile(left: Stats, right: Stats): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.mode === right.mode &&
    left.size === right.size && left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs;
}

function missing(error: unknown): boolean {
  return error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT";
}

async function observe(path: string, directory: boolean): Promise<Observation> {
  try {
    const before = await lstat(path);
    if (before.isSymbolicLink() || (directory ? !before.isDirectory() :
      !before.isFile() || before.size === 0 || before.size > MAX_BUNDLE_BYTES) ||
      await realpath(path) !== path || !sameFile(before, await lstat(path))) { return "unsafe"; }
    return "present";
  } catch (error) { return missing(error) ? "missing" : "unavailable"; }
}

async function packageVersion(assetsRoot: string): Promise<{ state: Observation; version?: string }> {
  const path = join(dirname(assetsRoot), "package.json");
  const state = await observe(path, false);
  if (state !== "present") { return { state }; }
  try {
    const before = await lstat(path);
    if (before.size > 64 * 1024) { return { state: "unsafe" }; }
    // oxlint-disable-next-line eslint/no-bitwise -- Inspection retains a no-follow descriptor; package text is never executed.
    const file = await open(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
    try {
      if (!sameFile(before, await file.stat())) { return { state: "unsafe" }; }
      const bytes = Buffer.alloc(64 * 1024 + 1);
      const result = await file.read(bytes, 0, bytes.length, 0);
      if (result.bytesRead !== before.size || !sameFile(before, await file.stat()) ||
          !sameFile(before, await lstat(path))) { return { state: "unsafe" }; }
      const input: unknown = JSON.parse(bytes.subarray(0, result.bytesRead).toString("utf8"));
      const parsed = z.looseObject({ version: versionSchema }).safeParse(input);
      return parsed.success ? { state: "present", version: parsed.data.version } : { state: "unsafe" };
    } finally { await file.close(); }
  } catch (error) { return { state: missing(error) ? "missing" : "unavailable" }; }
}

interface FamilyObservation {
  readonly state: Observation | "too-many-entries";
  readonly configuredVersion: string;
  readonly configuredFiles: Readonly<Record<string, Observation>>;
  readonly candidateVersions: readonly string[];
  readonly candidatesAdmitted: false;
}

async function familyObservation(root: string, family: string, configuredVersion: string,
  files: Readonly<Record<string, string>>): Promise<FamilyObservation> {
  const directory = join(root, family);
  const state = await observe(directory, true);
  const configuredFiles: Record<string, Observation> = {};
  for (const [role, relative] of Object.entries(files)) {
    configuredFiles[role] = state === "present" ? await observe(join(directory, configuredVersion, relative), false) : state;
  }
  const base = { configuredVersion, configuredFiles, candidatesAdmitted: false as const };
  if (state !== "present") { return { ...base, state, candidateVersions: [] }; }
  try {
    const before = await lstat(directory);
    const versions: string[] = [];
    let count = 0;
    // Iterate rather than materializing an unbounded directory listing. A
    // Partial listing is never returned as a complete candidate inventory.
    for await (const entry of await opendir(directory)) {
      count += 1;
      if (count > MAX_ENTRIES) { return { ...base, state: "too-many-entries", candidateVersions: [] }; }
      if (entry.isDirectory() && versionSchema.safeParse(entry.name).success &&
          await observe(join(directory, entry.name), true) === "present") { versions.push(entry.name); }
    }
    if (!sameFile(before, await lstat(directory)) || await realpath(directory) !== directory) {
      return { ...base, state: "unsafe", candidateVersions: [] };
    }
    return { ...base, state: "present", candidateVersions: versions.toSorted() };
  } catch (error) { return { ...base, state: missing(error) ? "missing" : "unavailable", candidateVersions: [] }; }
}

/** Metadata only: candidate directory names are not source review, execution
 * admission, a migration plan, or evidence of who replaced an installation.
 */
export async function inspectMachineInstallation(profileInput: MachineProfile): Promise<Record<string, unknown>> {
  const profile = machineProfileSchema.parse(profileInput);
  const root = profile.easyeda.assetsRoot;
  const assets = await observe(root, true);
  if (assets !== "present") { return { state: assets, configuredBundleFilesPresent: false, candidatesAdmitted: false, liveExecutionAvailable: false }; }
  const application = await packageVersion(root);
  const pcb = await familyObservation(root, "pro-pcb", profile.easyeda.pcbBundleVersion, { implementation: "js/pcb.js" });
  const publicApi = await familyObservation(root, "pro-api", profile.easyeda.publicApiBundleVersion,
    { implementation: "api.js", adapter: "api-types.js", declarations: "api-types.d.ts" });
  return { state: "observed", observationScope: "current-configured-installation-not-startup-snapshot",
    application, pcb, publicApi,
    configuredBundleFilesPresent: [pcb, publicApi].every((family) => family.state === "present" &&
      Object.values(family.configuredFiles).every((state) => state === "present")),
    candidatesAdmitted: false, liveExecutionAvailable: false,
    nextAction: "Review the installed generation and use an explicitly supported profile migration, then restart. Do not replace compatibility hashes or selectors based on this inventory." };
}

/** Reads only the existing private machine configuration and installation
 * metadata. Trust failures produce a fixed diagnostic, never private paths.
 */
export async function diagnoseConfiguredInstallation(): Promise<Record<string, unknown>> {
  try {
    const profile = await readMachineInspectionProfile(process.env[MACHINE_PROFILE_ENVIRONMENT_VARIABLE] ?? defaultMachineProfilePath());
    return { ...await inspectMachineInstallation(profile), restartRequired: true };
  } catch {
    return { state: "configuration-unavailable", candidatesAdmitted: false, liveExecutionAvailable: false,
      restartRequired: true, nextAction: "Review the private machine configuration locally. This offline process cannot promote itself." };
  }
}

import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats, Dirent } from "node:fs";
import { lstat, mkdir, open, opendir, realpath } from "node:fs/promises";
import { join, resolve } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive } from "./artifacts.ts";
import type { ControlRootDirectory } from "./control-root.ts";
import { assertSubset, canonicalJson, controlImplementationFingerprint, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "./core.ts";
import type { WindowsAuthorityLaunch } from "./windows-authority.ts";

/** Ordinary startup of the existing profile, not project-free or isolated startup. */
export const ORDINARY_LAUNCH_PROFILE = {
  schema: "easyeda-pro-control.ordinary-launch.v1",
  installedPackageVersion: "3.2.206.715d940d",
  installedFiles: [
    { relativePath: "../../../easyeda-pro.exe", bytes: 222_989_936, sha256: "e59d159f0f7bb5ac4832ce6583622251750ede7b839050f3aabe774cadfd1f55" },
    { relativePath: "../app.js", bytes: 2_657_192, sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c" },
    { relativePath: "../package.json", bytes: 248, sha256: "e349f8d80f809f82a057f1b81799430ba25bfa0f7c7cb96f6155327b49391455" },
    { relativePath: "../editor.ini", bytes: 8031, sha256: "cb18dd85262f44dedd65487deed4e1b1fac68eb90ad6a99ca86ba163efe655b6" },
  ],
  // Updated together with the reviewed helper's fixed launch observer.
  helper: { relativePath: "scripts/windows-authority.ps1", sha256: "811d22eca033a31b58a9963ee7d51d2a3ed8182a0d859e511a42cbae68786c65" },
} as const;

const operationIdSchema = z.string().min(1).max(80).regex(/^[a-z0-9][a-z0-9_-]*$/u);
const digestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const tokenSchema = z.string().regex(/^[a-f0-9]{32}$/u);
export const ordinaryLaunchRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId: operationIdSchema, confirmLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId: operationIdSchema }).strict(),
  z.object({ action: z.literal("observe-termination"), operationId: operationIdSchema }).strict(),
]);
export type OrdinaryLaunchRequest = z.infer<typeof ordinaryLaunchRequestSchema>;
export function parseOrdinaryLaunchRequest(input: unknown): OrdinaryLaunchRequest { return ordinaryLaunchRequestSchema.parse(input); }

const limitations = [
  "Starts the existing EasyEDA profile with no project arguments, flags or caller-selected code. This is not an isolated or startup-qualified profile.",
  "Ordinary startup may read project-list metadata, write preferences/cache/logs, contact services and run or update enabled extensions. Extension actions and persisted startup configuration are not prevented or qualified.",
  "A retained process launch is not bridge authentication, a verified Start Page, design admission or proof that no project file was accessed. No navigation, Save or forced termination is dispatched by this tool.",
  "One exclusive operation intent precedes dispatch. Unresolved attempts block further launches across restarts. Only a durable termination observation from the original retained Job permits another operation; lost ownership requires separate recovery, never PID-only adoption.",
] as const;
const claims = { bridgeAuthentication: "not-observed", startPage: "not-observed", profileIsolated: false,
  startupQualified: false, projectArgumentsSupplied: false, designExecutionAuthorized: false } as const;

export function queryOrdinaryLaunch(input: unknown = {}): Record<string, unknown> {
  const parsed = z.object({ includeSchemas: z.boolean().optional() }).strict().parse(input);
  return { tool: "easyeda_control_launch", actions: ["launch", "inspect", "observe-termination"],
    effect: "ordinary-existing-profile-application-startup", profile: ORDINARY_LAUNCH_PROFILE,
    limitations, ...(parsed.includeSchemas === true ? { requestSchema: z.toJSONSchema(ordinaryLaunchRequestSchema) } : {}) };
}
export function validateOrdinaryLaunchArguments(input: unknown): Record<string, unknown> {
  const parsed = ordinaryLaunchRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false, issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
  };
}

export interface OrdinaryLaunchRuntime {
  readonly launch: () => Promise<WindowsAuthorityLaunch>;
  readonly observeExistingApplication: () => Promise<{ running: boolean }>;
  readonly observeLaunchTermination: () => Promise<{ jobId: string; helperInstance: string; terminated: boolean }>;
}
export interface OrdinaryLaunchOptions {
  readonly assetsRoot: string;
  readonly pluginRoot: string;
  readonly assertAllowed: () => Promise<void>;
  readonly allocateRuntime: (input: { expectedExecutableSha256: string; expectedHelperSha256: string; reviewedExecutionScopeSha256: string }) => OrdinaryLaunchRuntime;
}
/** Internal offline-test seam, never a tool argument or runtime profile override. */
export interface OrdinaryLaunchDependencies {
  readonly verifyInstallation?: (options: OrdinaryLaunchOptions) => Promise<string>;
}

const launchSchema = z.object({ jobId: tokenSchema, helperInstance: tokenSchema, root: z.object({
  pid: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), role: z.literal("easyeda-main"),
  startIdentity: z.string().regex(/^win32:[0-9]{15,20}:job:[a-f0-9]{32}$/u),
}).strict() }).strict().refine((value) => value.root.startIdentity.endsWith(`:job:${value.jobId}`));
const intentSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-launch-intent.v1"), operationId: operationIdSchema,
  profileSha256: digestSchema, facadeSha256: digestSchema, createdAt: z.iso.datetime() }).strict();
const launchedSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-launched.v1"), operationId: operationIdSchema,
  intentSha256: digestSchema, launch: launchSchema }).strict();
const terminatedSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-terminated.v1"), operationId: operationIdSchema,
  launchedSha256: digestSchema, jobId: tokenSchema, helperInstance: tokenSchema, terminated: z.literal(true) }).strict();
const refusedSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-not-dispatched.v1"), operationId: operationIdSchema,
  intentSha256: digestSchema, dispatchAttempted: z.literal(false) }).strict();
type Intent = z.infer<typeof intentSchema>;
type Launched = z.infer<typeof launchedSchema>;
type Terminated = z.infer<typeof terminatedSchema>;
type Refused = z.infer<typeof refusedSchema>;
interface Operation {
  readonly operationId: string;
  readonly intent?: Intent;
  readonly launched?: Launched;
  readonly terminated?: Terminated;
  readonly refused?: Refused;
}
const JOURNAL_DIRECTORY = "ordinary-launch-v1";
const MAX_OPERATIONS = 4096;
const MAX_RECORD_BYTES = 8192;

function requireValue(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function absent(error: unknown): boolean { return error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT"; }
function sameFile(left: BigIntStats, right: BigIntStats): boolean {
  return (["dev", "ino", "size", "mode", "uid", "gid", "nlink", "mtimeNs", "ctimeNs"] as const).every((key) => left[key] === right[key]);
}

/** Fixed paths only, bounded descriptor reads and stable named-file identity. */
async function hashPinnedFile(absolute: string, sha256: string, bytes?: number): Promise<void> {
  requireValue(resolve(absolute) === absolute && await realpath(absolute) === absolute, "Ordinary launch file path is not canonical.");
  // oxlint-disable-next-line no-bitwise -- Read only; refuse symlinks and nonregular descriptors without blocking.
  const handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true });
    requireValue(before.isFile() && before.nlink === 1n && before.size > 0n && before.size <= 1_073_741_824n &&
      (bytes === undefined ? before.size <= 65_536n : before.size === BigInt(bytes)), "Ordinary launch pinned file size or kind differs.");
    const hash = createHash("sha256");
    let count = 0;
    for await (const chunk of handle.createReadStream({ autoClose: false })) {
      requireValue(Buffer.isBuffer(chunk), "Ordinary launch hash requires bytes.");
      count += chunk.length;
      requireValue(count <= Number(before.size), "Ordinary launch file grew during hashing.");
      hash.update(chunk);
    }
    requireValue(count === Number(before.size) && hash.digest("hex") === sha256 && sameFile(before, await handle.stat({ bigint: true })) &&
      sameFile(before, await lstat(absolute, { bigint: true })) && await realpath(absolute) === absolute, "Ordinary launch pinned file identity differs.");
  } finally { await handle.close(); }
}

export async function verifyOrdinaryLaunchInstallation(options: OrdinaryLaunchOptions): Promise<string> {
  requireValue(/^\/mnt\/[a-z]\/[^\r\n]+\/resources\/app\/assets$/u.test(options.assetsRoot) &&
    resolve(options.assetsRoot) === options.assetsRoot && await realpath(options.assetsRoot) === options.assetsRoot,
  "Ordinary launch requires the canonical installed Windows assets root.");
  requireValue(resolve(options.pluginRoot) === options.pluginRoot && await realpath(options.pluginRoot) === options.pluginRoot,
    "Ordinary launch requires the canonical plugin root.");
  const manifestIdentity = reviewedCompatibilityManifestFingerprint();
  const manifest = loadReviewedCompatibilityManifest();
  const actual = await controlImplementationFingerprint();
  assertSubset({ version: actual.version, operationSchema: actual.operationSchema, sha256: actual.sha256, fileCount: actual.files.length,
    files: actual.files.map(({ relativePath, bytes, sha256 }) => ({ relativePath, bytes, sha256 })) },
  manifest.facadeImplementation[actual.mode], "Ordinary launch facade identity");
  for (const pin of ORDINARY_LAUNCH_PROFILE.installedFiles) {
    await hashPinnedFile(resolve(options.assetsRoot, pin.relativePath), pin.sha256, pin.bytes);
  }
  await hashPinnedFile(join(options.pluginRoot, ORDINARY_LAUNCH_PROFILE.helper.relativePath), ORDINARY_LAUNCH_PROFILE.helper.sha256);
  requireValue(canonicalJson(manifestIdentity) === canonicalJson(reviewedCompatibilityManifestFingerprint()), "Ordinary launch manifest changed.");
  return actual.sha256;
}

async function readRecord(directory: ControlRootDirectory, name: string): Promise<unknown> {
  const path = `/proc/self/fd/${directory.handle.fd}/${name}`;
  // oxlint-disable-next-line no-bitwise -- Journal children are bounded private regular files, never followed links.
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK).catch((error: unknown) => {
    if (absent(error)) { return null; } throw error;
  });
  if (handle === null) { return null; }
  try {
    const before = await handle.stat({ bigint: true });
    requireValue(before.isFile() && before.nlink === 1n && before.size > 0n && before.size <= BigInt(MAX_RECORD_BYTES) &&
      before.mode % 512n === 0o600n && typeof process.getuid === "function" && before.uid === BigInt(process.getuid()), "Ordinary launch journal file refused.");
    const bytes = Buffer.alloc(Number(before.size) + 1);
    let offset = 0;
    while (offset < bytes.length) {
      const read = await handle.read(bytes, offset, bytes.length - offset, offset);
      if (read.bytesRead === 0) { break; } offset += read.bytesRead;
    }
    requireValue(offset === Number(before.size) && sameFile(before, await handle.stat({ bigint: true })) &&
      sameFile(before, await lstat(path, { bigint: true })), "Ordinary launch journal changed during read.");
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, offset))) as unknown;
  } finally { await handle.close(); }
}

async function boundedEntries(directory: ControlRootDirectory, limit: number): Promise<Dirent[]> {
  const entries: Dirent[] = [];
  const handle = await opendir(`/proc/self/fd/${directory.handle.fd}`);
  // Async iteration closes its handle on completion or an exception.
  for await (const entry of handle) {
    requireValue(entries.length < limit, "Ordinary launch inventory exceeds its bound.");
    entries.push(entry);
  }
  return entries;
}

async function inventory(): Promise<Operation[]> {
  const root = await controlRootCapability(false);
  const parent = await root.openDirectory(join(controlDataDirectory(), JOURNAL_DIRECTORY), false).catch((error: unknown) => {
    if (absent(error)) { return null; } throw error;
  });
  if (parent === null) { return []; }
  try {
    const entries = await boundedEntries(parent, MAX_OPERATIONS);
    const operations: Operation[] = [];
    for (const entry of entries.toSorted((left, right) => left.name.localeCompare(right.name))) {
      requireValue(entry.isDirectory() && operationIdSchema.safeParse(entry.name).success, "Ordinary launch inventory contains an unknown entry.");
      const slot = await root.openDirectory(join(parent.absolute, entry.name), false);
      try {
        const records = await boundedEntries(slot, 4);
        requireValue(records.every((record) => record.isFile() && ["intent.json", "launched.json", "terminated.json", "not-dispatched.json"].includes(record.name)), "Ordinary launch journal contains unknown records.");
        const intentRaw = await readRecord(slot, "intent.json"), launchedRaw = await readRecord(slot, "launched.json"), terminatedRaw = await readRecord(slot, "terminated.json");
        const refusedRaw = await readRecord(slot, "not-dispatched.json");
        const intent = intentRaw === null ? undefined : intentSchema.parse(intentRaw);
        const launched = launchedRaw === null ? undefined : launchedSchema.parse(launchedRaw);
        const terminated = terminatedRaw === null ? undefined : terminatedSchema.parse(terminatedRaw);
        const refused = refusedRaw === null ? undefined : refusedSchema.parse(refusedRaw);
        requireValue(intent === undefined || intent.operationId === entry.name, "Ordinary launch intent ID differs.");
        requireValue(launched === undefined || intent !== undefined && launched.operationId === entry.name && launched.intentSha256 === sha256Json(intent), "Ordinary launch result is unbound.");
        requireValue(terminated === undefined || launched !== undefined && terminated.operationId === entry.name && terminated.launchedSha256 === sha256Json(launched) &&
          terminated.jobId === launched.launch.jobId && terminated.helperInstance === launched.launch.helperInstance, "Ordinary launch termination is unbound.");
        requireValue(refused === undefined || intent !== undefined && launched === undefined && terminated === undefined && refused.operationId === entry.name &&
          refused.intentSha256 === sha256Json(intent), "Ordinary launch nondispatch receipt is unbound.");
        operations.push({ operationId: entry.name, ...(intent === undefined ? {} : { intent }), ...(launched === undefined ? {} : { launched }),
          ...(terminated === undefined ? {} : { terminated }), ...(refused === undefined ? {} : { refused }) });
      } finally { await slot.handle.close(); }
    }
    await root.assertCurrent();
    return operations;
  } finally { await parent.handle.close(); }
}

async function publish(operationId: string, name: string, record: unknown): Promise<void> {
  const bytes = Buffer.from(`${JSON.stringify(record)}\n`);
  requireValue(bytes.length <= MAX_RECORD_BYTES, "Ordinary launch receipt exceeds its bound.");
  await publishManagedAttachmentExclusive(join(controlDataDirectory(), JOURNAL_DIRECTORY, operationId, name),
    "Ordinary launch receipt", bytes, ORDINARY_LAUNCH_PROFILE.schema);
}
function describe(operationId: string, operation?: Operation): Record<string, unknown> {
  let state = "not-found";
  if (operation !== undefined) {
    state = "launch-unknown";
    if (operation.launched !== undefined) { state = "launched"; }
    if (operation.terminated !== undefined) { state = "terminated"; }
    if (operation.refused !== undefined) { state = "not-dispatched"; }
  }
  return { operationId, state, attemptConsumed: operation !== undefined, ...claims, limitations,
  ...(operation?.launched === undefined ? {} : { launch: operation.launched.launch }),
  ...(operation?.terminated === undefined ? {} : { termination: operation.terminated }) };
}
function complete(operation: Operation): boolean { return operation.terminated !== undefined || operation.refused !== undefined; }

export class OrdinaryLaunchCoordinator {
  private readonly options: OrdinaryLaunchOptions;
  private readonly verify: (options: OrdinaryLaunchOptions) => Promise<string>;
  private runtime: OrdinaryLaunchRuntime | undefined;
  private retained: { readonly operationId: string; readonly launch: WindowsAuthorityLaunch; readonly launched: Launched } | undefined;
  private busy = false;
  private uncertain = false;

  public constructor(options: OrdinaryLaunchOptions, dependencies: OrdinaryLaunchDependencies = {}) {
    this.options = options;
    this.verify = dependencies.verifyInstallation ?? verifyOrdinaryLaunchInstallation;
  }

  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request = parseOrdinaryLaunchRequest(input);
    requireValue(!this.busy, "Ordinary launch is already in progress.");
    this.busy = true;
    let publishedIntent: Intent | undefined;
    let launchInvoked = false;
    try {
      const operations = await inventory();
      const operation = operations.find((candidate) => candidate.operationId === request.operationId);
      if (request.action === "inspect") { return describe(request.operationId, operation); }
      await this.options.assertAllowed();
      requireValue(!this.uncertain, "Ordinary launch ownership or publication is uncertain; do not retry.");
      if (request.action === "observe-termination") { return await this.observe(request.operationId, operation); }
      requireValue(operation === undefined && operations.length < MAX_OPERATIONS, "Ordinary launch operation ID is consumed or inventory full.");
      requireValue(operations.every((candidate) => complete(candidate)), "An unresolved ordinary launch blocks another launch.");
      const facadeSha256 = digestSchema.parse(await this.verify(this.options));
      await this.options.assertAllowed();
      this.runtime ??= this.options.allocateRuntime({ expectedExecutableSha256: ORDINARY_LAUNCH_PROFILE.installedFiles[0].sha256,
        expectedHelperSha256: ORDINARY_LAUNCH_PROFILE.helper.sha256,
        reviewedExecutionScopeSha256: facadeSha256 });
      const existing = z.object({ running: z.boolean() }).strict().parse(await this.runtime.observeExistingApplication());
      if (existing.running) { return { ...describe(request.operationId), state: "already-running", attemptConsumed: false }; }
      const root = await controlRootCapability();
      const parent = await root.openDirectory(join(controlDataDirectory(), JOURNAL_DIRECTORY));
      try {
        // Never remove this exclusive reservation, even when publication fails.
        await mkdir(`/proc/self/fd/${parent.handle.fd}/${request.operationId}`, { mode: 0o700 });
        this.uncertain = true;
        await parent.handle.sync();
      } finally { await parent.handle.close(); }
      const intent: Intent = { schema: "easyeda-pro-control.ordinary-launch-intent.v1", operationId: request.operationId,
        profileSha256: sha256Json(ORDINARY_LAUNCH_PROFILE), facadeSha256, createdAt: new Date().toISOString() };
      await publish(request.operationId, "intent.json", intent);
      publishedIntent = intent;
      await this.options.assertAllowed();
      const current = await inventory();
      requireValue(current.length === operations.length + 1 && current.every((candidate) => candidate.operationId === request.operationId ?
        canonicalJson(candidate.intent) === canonicalJson(intent) && candidate.launched === undefined && candidate.terminated === undefined && candidate.refused === undefined : complete(candidate)),
      "Ordinary launch intent or inventory changed before dispatch.");
      requireValue(await this.verify(this.options) === facadeSha256, "Ordinary launch installation changed before dispatch.");
      await this.options.assertAllowed();
      launchInvoked = true;
      const launch = launchSchema.parse(await this.runtime.launch());
      const launched: Launched = { schema: "easyeda-pro-control.ordinary-launched.v1", operationId: request.operationId, intentSha256: sha256Json(intent), launch };
      this.retained = { operationId: request.operationId, launch, launched };
      await publish(request.operationId, "launched.json", launched);
      this.uncertain = false;
      return describe(request.operationId, { operationId: request.operationId, intent, launched });
    } catch (error) {
      if (publishedIntent !== undefined && !launchInvoked) {
        const refused: Refused = { schema: "easyeda-pro-control.ordinary-not-dispatched.v1", operationId: request.operationId,
          intentSha256: sha256Json(publishedIntent), dispatchAttempted: false };
        await publish(request.operationId, "not-dispatched.json", refused);
        this.uncertain = false;
      }
      throw error;
    } finally { this.busy = false; }
  }

  private async observe(operationId: string, operation: Operation | undefined): Promise<Record<string, unknown>> {
    requireValue(operation !== undefined, "Ordinary launch operation was not found.");
    if (complete(operation)) { return describe(operationId, operation); }
    const retained = this.retained;
    requireValue(this.runtime !== undefined && retained !== undefined && retained.operationId === operationId &&
      canonicalJson(operation.launched) === canonicalJson(retained.launched), "Ordinary launch has no retained owner for this exact operation.");
    await this.verify(this.options);
    const observed = z.object({ jobId: tokenSchema, helperInstance: tokenSchema, terminated: z.boolean() }).strict().parse(await this.runtime.observeLaunchTermination());
    requireValue(observed.jobId === retained.launch.jobId && observed.helperInstance === retained.launch.helperInstance, "Ordinary termination observed another launch.");
    if (!observed.terminated) { return { ...describe(operationId, operation), terminationObserved: false }; }
    const terminated: Terminated = { schema: "easyeda-pro-control.ordinary-terminated.v1", operationId,
      launchedSha256: sha256Json(retained.launched), ...observed, terminated: true };
    this.uncertain = true;
    await publish(operationId, "terminated.json", terminated);
    this.uncertain = false;
    return describe(operationId, { ...operation, terminated });
  }
}

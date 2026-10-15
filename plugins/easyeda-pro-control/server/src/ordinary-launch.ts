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
import { observeOrdinaryLaunchRecovery, ordinaryLaunchRecoveryObservationSchema } from "./ordinary-launch-recovery.ts";

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
  // Reviewed retained-root window observer and one-shot normal-close helper.
  helper: { relativePath: "scripts/windows-authority.ps1", sha256: "fa5cff83eea61dea9a58dad282c76a2016bc7cbcb6f54dea1ef51375d9a91161" },
} as const;

const operationIdSchema = z.string().min(1).max(80).regex(/^[a-z0-9][a-z0-9_-]*$/u);
const digestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const tokenSchema = z.string().regex(/^[a-f0-9]{32}$/u);
const windowHandleSchema = z.string().regex(/^[1-9]\d{0,18}$/u);
export const ordinaryLaunchRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId: operationIdSchema, confirmLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId: operationIdSchema }).strict(),
  z.object({ action: z.literal("observe-application"), operationId: operationIdSchema }).strict(),
  z.object({ action: z.literal("observe-termination"), operationId: operationIdSchema }).strict(),
  z.object({ action: z.literal("observe-window"), operationId: operationIdSchema, expectedLaunchedSha256: digestSchema }).strict(),
  z.object({ action: z.literal("normal-close"), operationId: operationIdSchema, expectedLaunchedSha256: digestSchema,
    hwnd: windowHandleSchema, confirmNormalClose: z.literal(true) }).strict(),
  z.object({ action: z.literal("abandon-supervision"), operationId: operationIdSchema,
    expectedLaunchedSha256: digestSchema, confirmAbandonSupervision: z.literal(true),
    acceptUnobservedDescendants: z.literal(true) }).strict(),
  z.object({ action: z.literal("abandon-unknown-launch"), operationId: operationIdSchema,
    expectedIntentSha256: digestSchema, confirmAbandonUnknownLaunch: z.literal(true),
    acceptUnobservedDescendants: z.literal(true) }).strict(),
]);
export type OrdinaryLaunchRequest = z.infer<typeof ordinaryLaunchRequestSchema>;
export function parseOrdinaryLaunchRequest(input: unknown): OrdinaryLaunchRequest { return ordinaryLaunchRequestSchema.parse(input); }

const limitations = [
  "Starts the existing EasyEDA profile with no project arguments, flags or caller-selected code. This is not an isolated or startup-qualified profile.",
  "Ordinary startup may read project-list metadata, write preferences/cache/logs, contact services and run or update enabled extensions. Extension actions and persisted startup configuration are not prevented or qualified.",
  "A retained process launch is not bridge authentication, a verified Start Page, design admission or proof that no project file was accessed. No navigation, Save or forced termination is dispatched by this tool.",
  "One exclusive operation intent precedes dispatch. Unresolved attempts block further launches across restarts. A retained-Job termination receipt or explicit supervision abandonment permits consideration of a new ordinary startup; neither reuses the old operation ID. No PID-only adoption is supported.",
  "Application observation starts only the pinned diagnostic helper and samples same-name process presence twice. Presence may refer to another installation; absence does not prove original root or Job termination. It leaves historical launch state unchanged and grants no adoption or relaunch authority.",
  "Supervision abandonment requires a successful historical launch receipt, its exact digest, explicit acceptance of unobserved descendants, no current retained launch, and two absent same-name samples. It records relinquishment, not termination or saved-state proof. Original descendants or external work may remain. Only the ordinary-startup blocker changes; bridge/design quarantine and all design authority checks remain unchanged.",
  "Unknown-launch abandonment requires a reviewed helper-before-intent protocol, the exact intent digest, a fresh coordinator without an allocated runtime, explicit acceptance of unobserved descendants, and two native samples with no other PowerShell process and no same-name application. The separate read-only helper excludes a delayed launch from the old helper; it does not determine whether launch previously occurred or prove descendant termination. Other PowerShell sessions conservatively block recovery. No process is adopted, closed or killed, and no design gate changes.",
  "Window observation requires the original retained launch and exact launch receipt digest. It exposes only a unique eligible root-owned application HWND, or unavailable/ambiguous status. An observation is not a persistent close permission and cannot adopt a historical process.",
  "Confirmed normal close reobserves that HWND, durably consumes one close intent for the original launch, then requests WM_CLOSE once. Missing acknowledgment or timeout never permits another close. No focus, keyboard, forced termination or Save/Discard choice is dispatched. The application may write data or display a prompt; acknowledgment proves neither termination nor saved contents. Inspect and retained termination observation remain available after close uncertainty, subject to unchanged quarantine gates.",
] as const;
const claims = { bridgeAuthentication: "not-observed", startPage: "not-observed", profileIsolated: false,
  startupQualified: false, projectArgumentsSupplied: false, designExecutionAuthorized: false } as const;

export function queryOrdinaryLaunch(input: unknown = {}): Record<string, unknown> {
  const parsed = z.object({ includeSchemas: z.boolean().optional() }).strict().parse(input);
  return { tool: "easyeda_control_launch", actions: ["launch", "inspect", "observe-application", "observe-termination", "observe-window", "normal-close", "abandon-supervision", "abandon-unknown-launch"],
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
  readonly observeApplicationWindow?: () => Promise<{ jobId: string; helperInstance: string;
    outcome: "available" | "unavailable" | "ambiguous"; hwnd: string | null }>;
  readonly normalClose?: (hwnd: string) => Promise<void>;
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
  readonly observeRecovery?: typeof observeOrdinaryLaunchRecovery;
}

const launchSchema = z.object({ jobId: tokenSchema, helperInstance: tokenSchema, root: z.object({
  pid: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), role: z.literal("easyeda-main"),
  startIdentity: z.string().regex(/^win32:[0-9]{15,20}:job:[a-f0-9]{32}$/u),
}).strict() }).strict().refine((value) => value.root.startIdentity.endsWith(`:job:${value.jobId}`));
const intentFields = { operationId: operationIdSchema, profileSha256: digestSchema, facadeSha256: digestSchema, createdAt: z.iso.datetime() };
const intentSchema = z.discriminatedUnion("schema", [
  z.object({ schema: z.literal("easyeda-pro-control.ordinary-launch-intent.v1"), ...intentFields }).strict(),
  z.object({ schema: z.literal("easyeda-pro-control.ordinary-launch-intent.v2"), ...intentFields,
    dispatchProtocol: z.literal("retained-helper-before-intent.v1") }).strict(),
]);
const launchedSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-launched.v1"), operationId: operationIdSchema,
  intentSha256: digestSchema, launch: launchSchema }).strict();
const terminatedSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-terminated.v1"), operationId: operationIdSchema,
  launchedSha256: digestSchema, jobId: tokenSchema, helperInstance: tokenSchema, terminated: z.literal(true) }).strict();
const refusedSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-not-dispatched.v1"), operationId: operationIdSchema,
  intentSha256: digestSchema, dispatchAttempted: z.literal(false) }).strict();
const abandonedSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-supervision-abandoned.v1"), operationId: operationIdSchema,
  intentSha256: digestSchema, launchedSha256: digestSchema, profileSha256: digestSchema, facadeSha256: digestSchema,
  createdAt: z.iso.datetime(), confirmAbandonSupervision: z.literal(true), acceptUnobservedDescendants: z.literal(true),
  sameNameProcessPresent: z.literal(false), samples: z.literal(2), terminationProved: z.literal(false),
  originalLaunchIdentityVerified: z.literal(false), retainedLaunchAuthority: z.literal(false), designExecutionAuthorized: z.literal(false) }).strict();
const unknownAbandonedSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-unknown-launch-abandoned.v1"), operationId: operationIdSchema,
  intentSha256: digestSchema, profileSha256: digestSchema, facadeSha256: digestSchema, createdAt: z.iso.datetime(),
  confirmAbandonUnknownLaunch: z.literal(true), acceptUnobservedDescendants: z.literal(true),
  observation: ordinaryLaunchRecoveryObservationSchema,
  pendingHelperLaunchExcluded: z.literal(true), launchOutcome: z.literal("unknown"), terminationProved: z.literal(false),
  originalLaunchIdentityVerified: z.literal(false), retainedLaunchAuthority: z.literal(false), designExecutionAuthorized: z.literal(false),
}).strict().refine((value) => !value.observation.otherPowerShellPresent && !value.observation.sameNameProcessPresent,
  "Unknown-launch abandonment requires absent helper and application samples.");
const closeIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-normal-close-intent.v1"), operationId: operationIdSchema,
  intentSha256: digestSchema, launchedSha256: digestSchema, profileSha256: digestSchema, facadeSha256: digestSchema,
  jobId: tokenSchema, helperInstance: tokenSchema, hwnd: windowHandleSchema, createdAt: z.iso.datetime(),
  confirmNormalClose: z.literal(true) }).strict();
const closeAcknowledgmentSchema = z.object({ schema: z.literal("easyeda-pro-control.ordinary-normal-close-acknowledged.v1"), operationId: operationIdSchema,
  closeIntentSha256: digestSchema, requestAcknowledged: z.literal(true), terminationProved: z.literal(false) }).strict();
const windowObservationSchema = z.object({ jobId: tokenSchema, helperInstance: tokenSchema,
  outcome: z.enum(["available", "unavailable", "ambiguous"]), hwnd: windowHandleSchema.nullable() }).strict()
  .refine((value) => (value.outcome === "available") === (value.hwnd !== null), "Window outcome and HWND disagree.");
type Intent = z.infer<typeof intentSchema>;
type Launched = z.infer<typeof launchedSchema>;
type Terminated = z.infer<typeof terminatedSchema>;
type Refused = z.infer<typeof refusedSchema>;
type Abandoned = z.infer<typeof abandonedSchema>;
type UnknownAbandoned = z.infer<typeof unknownAbandonedSchema>;
type CloseIntent = z.infer<typeof closeIntentSchema>;
type CloseAcknowledgment = z.infer<typeof closeAcknowledgmentSchema>;
interface Operation {
  readonly operationId: string;
  readonly intent?: Intent;
  readonly launched?: Launched;
  readonly terminated?: Terminated;
  readonly refused?: Refused;
  readonly abandoned?: Abandoned;
  readonly unknownAbandoned?: UnknownAbandoned;
  readonly closeIntent?: CloseIntent;
  readonly closeAcknowledgment?: CloseAcknowledgment;
}
interface RetainedLaunch { readonly operationId: string; readonly launch: WindowsAuthorityLaunch; readonly launched: Launched }
const JOURNAL_DIRECTORY = "ordinary-launch-v1";
const MAX_OPERATIONS = 4096;
const MAX_RECORD_BYTES = 8192;
// This exact prior profile permits historical supervision relinquishment only.
// It never admits the former helper for launch, adoption, close or exit proof.
const HISTORICAL_ABANDONMENT_PROFILE_SHA256 = "8c1552bec21a71fb3791e2e8422d2cef80394c3487f8ab1c75e7fc7eb20a9314";
// Release 020000 observes its retained native helper before publishing intent.
// That runtime never replaces its supervisor after protocol loss.
// This pin admits only that ordering proof, never old executable authority.
const HISTORICAL_UNKNOWN_LAUNCH = {
  profileSha256: "9ab6901e888bc4d03084fe64e62325fbd8f333794fad7ac6408dab73081c15ad",
  facadeSha256: "d7f99363d58ee66181f74c7841edcfd6b00d6e7da02a7dc1b5b686b77cf828a7",
} as const;
function hasHelperBeforeIntentProtocol(intent: Intent): boolean {
  if (intent.schema === "easyeda-pro-control.ordinary-launch-intent.v1") {
    return intent.profileSha256 === HISTORICAL_UNKNOWN_LAUNCH.profileSha256 && intent.facadeSha256 === HISTORICAL_UNKNOWN_LAUNCH.facadeSha256;
  }
  return intent.profileSha256 === sha256Json(ORDINARY_LAUNCH_PROFILE);
}
function describeLaunchProtocol(intent: Intent): string {
  if (!hasHelperBeforeIntentProtocol(intent)) { return "unsupported"; }
  if (intent.schema === "easyeda-pro-control.ordinary-launch-intent.v1") { return "reviewed-v1"; }
  return "recorded-v2";
}

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
        const records = await boundedEntries(slot, 8);
        requireValue(records.every((record) => record.isFile() && ["intent.json", "launched.json", "terminated.json", "not-dispatched.json", "abandonment.json", "unknown-abandonment.json", "close-intent.json", "close-acknowledged.json"].includes(record.name)), "Ordinary launch journal contains unknown records.");
        const intentRaw = await readRecord(slot, "intent.json"), launchedRaw = await readRecord(slot, "launched.json"), terminatedRaw = await readRecord(slot, "terminated.json");
        const refusedRaw = await readRecord(slot, "not-dispatched.json");
        const abandonedRaw = await readRecord(slot, "abandonment.json");
        const unknownAbandonedRaw = await readRecord(slot, "unknown-abandonment.json");
        const closeAcknowledgmentRaw = await readRecord(slot, "close-acknowledged.json"), closeIntentRaw = await readRecord(slot, "close-intent.json");
        const intent = intentRaw === null ? undefined : intentSchema.parse(intentRaw);
        const launched = launchedRaw === null ? undefined : launchedSchema.parse(launchedRaw);
        const terminated = terminatedRaw === null ? undefined : terminatedSchema.parse(terminatedRaw);
        const refused = refusedRaw === null ? undefined : refusedSchema.parse(refusedRaw);
        const abandoned = abandonedRaw === null ? undefined : abandonedSchema.parse(abandonedRaw);
        const unknownAbandoned = unknownAbandonedRaw === null ? undefined : unknownAbandonedSchema.parse(unknownAbandonedRaw);
        const closeIntent = closeIntentRaw === null ? undefined : closeIntentSchema.parse(closeIntentRaw);
        const closeAcknowledgment = closeAcknowledgmentRaw === null ? undefined : closeAcknowledgmentSchema.parse(closeAcknowledgmentRaw);
        requireValue(intent === undefined || intent.operationId === entry.name, "Ordinary launch intent ID differs.");
        requireValue(launched === undefined || intent !== undefined && launched.operationId === entry.name && launched.intentSha256 === sha256Json(intent), "Ordinary launch result is unbound.");
        requireValue(terminated === undefined || launched !== undefined && terminated.operationId === entry.name && terminated.launchedSha256 === sha256Json(launched) &&
          terminated.jobId === launched.launch.jobId && terminated.helperInstance === launched.launch.helperInstance, "Ordinary launch termination is unbound.");
        requireValue(refused === undefined || intent !== undefined && launched === undefined && terminated === undefined && refused.operationId === entry.name &&
          refused.intentSha256 === sha256Json(intent), "Ordinary launch nondispatch receipt is unbound.");
        requireValue(abandoned === undefined || intent !== undefined && launched !== undefined && terminated === undefined && refused === undefined &&
          abandoned.operationId === entry.name && abandoned.intentSha256 === sha256Json(intent) && abandoned.launchedSha256 === sha256Json(launched) &&
          abandoned.profileSha256 === intent.profileSha256, "Ordinary launch abandonment receipt is unbound or contradicts termination.");
        requireValue(unknownAbandoned === undefined || intent !== undefined && launched === undefined &&
          terminated === undefined && refused === undefined && abandoned === undefined && closeIntent === undefined && closeAcknowledgment === undefined &&
          unknownAbandoned.operationId === entry.name && unknownAbandoned.intentSha256 === sha256Json(intent) &&
          (intent.schema === "easyeda-pro-control.ordinary-launch-intent.v1" ? hasHelperBeforeIntentProtocol(intent) :
            unknownAbandoned.facadeSha256 === intent.facadeSha256) &&
          unknownAbandoned.profileSha256 === intent.profileSha256, "Unknown-launch abandonment is unbound or contradicts another receipt.");
        requireValue(closeIntent === undefined || intent !== undefined && launched !== undefined && refused === undefined &&
          closeIntent.operationId === entry.name && closeIntent.intentSha256 === sha256Json(intent) &&
          closeIntent.launchedSha256 === sha256Json(launched) && closeIntent.profileSha256 === intent.profileSha256 &&
          closeIntent.facadeSha256 === intent.facadeSha256 && closeIntent.jobId === launched.launch.jobId &&
          closeIntent.helperInstance === launched.launch.helperInstance, "Ordinary normal-close intent is unbound.");
        requireValue(closeAcknowledgment === undefined || closeIntent !== undefined && closeAcknowledgment.operationId === entry.name &&
          closeAcknowledgment.closeIntentSha256 === sha256Json(closeIntent), "Ordinary normal-close acknowledgment is unbound.");
        operations.push({ operationId: entry.name, ...(intent === undefined ? {} : { intent }), ...(launched === undefined ? {} : { launched }),
          ...(terminated === undefined ? {} : { terminated }), ...(refused === undefined ? {} : { refused }),
          ...(abandoned === undefined ? {} : { abandoned }), ...(closeIntent === undefined ? {} : { closeIntent }),
          ...(unknownAbandoned === undefined ? {} : { unknownAbandoned }),
          ...(closeAcknowledgment === undefined ? {} : { closeAcknowledgment }) });
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
    if (operation.abandoned !== undefined) { state = "supervision-abandoned"; }
    if (operation.unknownAbandoned !== undefined) { state = "unknown-launch-abandoned"; }
  }
  return { operationId, state, attemptConsumed: operation !== undefined, ...claims, limitations,
  ...(operation?.intent === undefined ? {} : { intentSha256: sha256Json(operation.intent),
    helperBeforeIntentProtocol: describeLaunchProtocol(operation.intent) }),
  ...(operation?.launched === undefined ? {} : { launch: operation.launched.launch, launchedSha256: sha256Json(operation.launched) }),
  ...(operation?.terminated === undefined ? {} : { termination: operation.terminated }),
  ...(operation?.closeIntent === undefined ? {} : { normalClose: { attemptConsumed: true, intent: operation.closeIntent,
    requestAcknowledged: operation.closeAcknowledgment !== undefined, terminationProved: operation.terminated !== undefined,
    ...(operation.closeAcknowledgment === undefined ? {} : { acknowledgment: operation.closeAcknowledgment }) } }),
  ...(operation?.abandoned === undefined ? {} : { abandonment: operation.abandoned, terminationProved: false,
    originalLaunchIdentityVerified: false, retainedLaunchAuthority: false }),
  ...(operation?.unknownAbandoned === undefined ? {} : { unknownLaunchAbandonment: operation.unknownAbandoned,
    launchOutcome: "unknown", terminationProved: false, originalLaunchIdentityVerified: false, retainedLaunchAuthority: false }) };
}
// Relinquishment permits a new ordinary startup, but never counts as termination.
function allowsNextLaunch(operation: Operation): boolean {
  return operation.terminated !== undefined || operation.refused !== undefined || operation.abandoned !== undefined || operation.unknownAbandoned !== undefined;
}

export class OrdinaryLaunchCoordinator {
  private readonly options: OrdinaryLaunchOptions;
  private readonly verify: (options: OrdinaryLaunchOptions) => Promise<string>;
  private readonly observeRecovery: typeof observeOrdinaryLaunchRecovery;
  private runtime: OrdinaryLaunchRuntime | undefined;
  private retained: RetainedLaunch | undefined;
  private readonly closeAttempts = new Set<string>();
  private busy = false;
  private uncertain = false;

  public constructor(options: OrdinaryLaunchOptions, dependencies: OrdinaryLaunchDependencies = {}) {
    this.options = options;
    this.verify = dependencies.verifyInstallation ?? verifyOrdinaryLaunchInstallation;
    this.observeRecovery = dependencies.observeRecovery ?? observeOrdinaryLaunchRecovery;
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
      if (request.action === "inspect") {
        return { ...describe(request.operationId, operation),
          ...(this.closeAttempts.has(request.operationId) && operation?.closeIntent === undefined ? {
            normalClose: { attemptConsumed: true, requestAcknowledged: false, intentPublicationUncertain: true,
              terminationProved: operation?.terminated !== undefined },
          } : {}) };
      }
      await this.options.assertAllowed();
      requireValue(!this.uncertain, "Ordinary launch ownership or publication is uncertain; do not retry.");
      if (request.action === "observe-application") { return await this.observeApplication(request.operationId, operation, operations); }
      if (request.action === "observe-termination") { return await this.observe(request.operationId, operation); }
      if (request.action === "observe-window") {
        const observed = await this.readWindow(request, operation, operations);
        return { action: request.action, operationId: request.operationId, launchedSha256: request.expectedLaunchedSha256,
          window: observed.window, closeAuthorized: false, ...claims, limitations };
      }
      if (request.action === "normal-close") { return await this.normalClose(request, operation, operations); }
      if (request.action === "abandon-supervision") { return await this.abandon(request, operation, operations); }
      if (request.action === "abandon-unknown-launch") { return await this.abandonUnknown(request, operation, operations); }
      requireValue(operation === undefined && operations.length < MAX_OPERATIONS, "Ordinary launch operation ID is consumed or inventory full.");
      requireValue(operations.every((candidate) => allowsNextLaunch(candidate)), "An unresolved ordinary launch blocks another launch.");
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
      const intent: Intent = { schema: "easyeda-pro-control.ordinary-launch-intent.v2", dispatchProtocol: "retained-helper-before-intent.v1", operationId: request.operationId,
        profileSha256: sha256Json(ORDINARY_LAUNCH_PROFILE), facadeSha256, createdAt: new Date().toISOString() };
      await publish(request.operationId, "intent.json", intent);
      publishedIntent = intent;
      await this.options.assertAllowed();
      const current = await inventory();
      requireValue(current.length === operations.length + 1 && current.every((candidate) => candidate.operationId === request.operationId ?
        canonicalJson(candidate.intent) === canonicalJson(intent) && candidate.launched === undefined && candidate.terminated === undefined && candidate.refused === undefined &&
          candidate.abandoned === undefined && candidate.unknownAbandoned === undefined && candidate.closeIntent === undefined && candidate.closeAcknowledgment === undefined : allowsNextLaunch(candidate)),
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

  private async readWindow(request: { readonly operationId: string; readonly expectedLaunchedSha256: string },
    operation: Operation | undefined, operations: Operation[]): Promise<{ runtime: OrdinaryLaunchRuntime; retained: RetainedLaunch;
      window: z.infer<typeof windowObservationSchema>; facadeSha256: string }> {
    requireValue(operation?.intent !== undefined && operation.launched !== undefined && !allowsNextLaunch(operation),
      "Ordinary window observation requires an unresolved successful launch.");
    const retained = this.retained, runtime = this.runtime;
    requireValue(runtime !== undefined && retained !== undefined && retained.operationId === request.operationId &&
      canonicalJson(operation.launched) === canonicalJson(retained.launched), "Ordinary window observation has no retained owner for this exact operation.");
    requireValue(request.expectedLaunchedSha256 === sha256Json(retained.launched), "Ordinary window observation launch digest differs.");
    requireValue(operation.intent.profileSha256 === sha256Json(ORDINARY_LAUNCH_PROFILE), "Ordinary window observation profile changed.");
    const observeWindow = runtime.observeApplicationWindow;
    requireValue(observeWindow !== undefined, "Ordinary retained window observation is unavailable.");
    const current = (): void => {
      requireValue(this.runtime === runtime && this.retained === retained && runtime.observeApplicationWindow === observeWindow &&
        canonicalJson(retained.launched) === canonicalJson(operation.launched), "Ordinary window observation retained owner changed.");
    };
    const facadeSha256 = digestSchema.parse(await this.verify(this.options));
    requireValue(facadeSha256 === operation.intent.facadeSha256, "Ordinary window observation installation changed from launch.");
    await this.options.assertAllowed(); current();
    const window = windowObservationSchema.parse(await observeWindow.call(runtime));
    current();
    requireValue(window.jobId === retained.launch.jobId && window.helperInstance === retained.launch.helperInstance,
      "Ordinary window observation returned another launch.");
    requireValue(await this.verify(this.options) === facadeSha256, "Ordinary window observation installation changed.");
    await this.options.assertAllowed(); current();
    requireValue(canonicalJson(await inventory()) === canonicalJson(operations), "Ordinary window observation journal changed.");
    current();
    return { runtime, retained, window, facadeSha256 };
  }

  private async normalClose(request: Extract<OrdinaryLaunchRequest, { action: "normal-close" }>, operation: Operation | undefined,
    operations: Operation[]): Promise<Record<string, unknown>> {
    requireValue(!this.closeAttempts.has(request.operationId) && operation?.closeIntent === undefined,
      "Ordinary normal-close attempt is consumed; do not repeat close.");
    requireValue(operation?.intent !== undefined && operation.launched !== undefined, "Ordinary normal close requires a successful launch.");
    const { runtime, retained, window, facadeSha256 } = await this.readWindow(request, operation, operations);
    requireValue(window.outcome === "available" && window.hwnd === request.hwnd, "Ordinary normal close requires the freshly observed unique application window.");
    const close = runtime.normalClose;
    requireValue(close !== undefined, "Ordinary retained normal close is unavailable.");
    const closeIntent: CloseIntent = { schema: "easyeda-pro-control.ordinary-normal-close-intent.v1", operationId: request.operationId,
      intentSha256: sha256Json(operation.intent), launchedSha256: request.expectedLaunchedSha256,
      profileSha256: operation.intent.profileSha256, facadeSha256, jobId: retained.launch.jobId,
      helperInstance: retained.launch.helperInstance, hwnd: request.hwnd, createdAt: new Date().toISOString(), confirmNormalClose: true };
    // A publication error may have left durable bytes. Consume this launch in
    // Memory before attempting publication, without blocking read-only exit proof.
    this.closeAttempts.add(request.operationId);
    await publish(request.operationId, "close-intent.json", closeIntent);
    requireValue(await this.verify(this.options) === facadeSha256, "Ordinary normal-close installation changed before dispatch.");
    await this.options.assertAllowed();
    const expected = operations.map((candidate) => candidate.operationId === request.operationId ? { ...candidate, closeIntent } : candidate);
    requireValue(canonicalJson(await inventory()) === canonicalJson(expected), "Ordinary normal-close journal changed before dispatch.");
    await this.options.assertAllowed();
    requireValue(this.runtime === runtime && this.retained === retained && runtime.normalClose === close &&
      canonicalJson(retained.launched) === canonicalJson(operation.launched), "Ordinary normal-close retained owner changed before dispatch.");
    // The original helper repeats root/Job/HWND guards before its fixed WM_CLOSE.
    // Any error or missing reply after this point leaves the intent consumed.
    await close.call(runtime, request.hwnd);
    requireValue(this.runtime === runtime && this.retained === retained && runtime.normalClose === close &&
      canonicalJson(retained.launched) === canonicalJson(operation.launched), "Ordinary normal-close retained owner changed during dispatch.");
    const closeAcknowledgment: CloseAcknowledgment = { schema: "easyeda-pro-control.ordinary-normal-close-acknowledged.v1",
      operationId: request.operationId, closeIntentSha256: sha256Json(closeIntent), requestAcknowledged: true, terminationProved: false };
    await publish(request.operationId, "close-acknowledged.json", closeAcknowledgment);
    return { ...describe(request.operationId, { ...operation, closeIntent, closeAcknowledgment }), action: "normal-close", terminationObserved: false };
  }

  private async observeApplication(operationId: string, operation: Operation | undefined, operations: Operation[]): Promise<Record<string, unknown>> {
    requireValue(operation !== undefined, "Ordinary launch operation was not found.");
    const facadeSha256 = digestSchema.parse(await this.verify(this.options));
    await this.options.assertAllowed();
    this.runtime ??= this.options.allocateRuntime({ expectedExecutableSha256: ORDINARY_LAUNCH_PROFILE.installedFiles[0].sha256,
      expectedHelperSha256: ORDINARY_LAUNCH_PROFILE.helper.sha256, reviewedExecutionScopeSha256: facadeSha256 });
    const runtime = this.runtime;
    const presenceSchema = z.object({ running: z.boolean() }).strict();
    const first = presenceSchema.parse(await runtime.observeExistingApplication());
    await this.options.assertAllowed();
    const second = presenceSchema.parse(await runtime.observeExistingApplication());
    await this.options.assertAllowed();
    requireValue(first.running === second.running, "Ordinary application presence changed between samples.");
    requireValue(await this.verify(this.options) === facadeSha256, "Ordinary application observation installation changed.");
    await this.options.assertAllowed();
    requireValue(canonicalJson(await inventory()) === canonicalJson(operations), "Ordinary application observation journal changed.");
    requireValue(this.runtime === runtime, "Ordinary application observation runtime changed.");
    return { action: "observe-application", operationId, facadeSha256, historical: describe(operationId, operation),
      application: { sameNameProcessPresent: second.running, samples: 2, originalLaunchIdentityVerified: false,
        retainedLaunchAuthority: false, terminationProved: false, relaunchAuthorized: false }, ...claims, limitations };
  }

  private async observe(operationId: string, operation: Operation | undefined): Promise<Record<string, unknown>> {
    requireValue(operation !== undefined, "Ordinary launch operation was not found.");
    if (allowsNextLaunch(operation)) { return describe(operationId, operation); }
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

  private async abandon(request: Extract<OrdinaryLaunchRequest, { action: "abandon-supervision" }>, operation: Operation | undefined,
    operations: Operation[]): Promise<Record<string, unknown>> {
    requireValue(operation?.intent !== undefined && operation.launched !== undefined, "Supervision abandonment requires a successful historical launch receipt.");
    requireValue(!allowsNextLaunch(operation), "Ordinary launch supervision is already resolved or abandoned.");
    requireValue(this.retained === undefined, "Supervision abandonment cannot supersede a current retained owner; observe its termination instead.");
    requireValue(request.expectedLaunchedSha256 === sha256Json(operation.launched), "Supervision abandonment launch digest differs.");
    requireValue(operation.intent.profileSha256 === sha256Json(ORDINARY_LAUNCH_PROFILE) ||
      operation.intent.profileSha256 === HISTORICAL_ABANDONMENT_PROFILE_SHA256, "Supervision abandonment historical profile is not reviewed.");
    // This is an explicit risk acknowledgement, not restoration of lost handles.
    // The observer rechecks installation, admission and the entire inventory.
    const observation = await this.observeApplication(request.operationId, operation, operations);
    const application = z.looseObject({ sameNameProcessPresent: z.boolean() }).parse(observation["application"]);
    requireValue(!application.sameNameProcessPresent, "Supervision abandonment requires absent same-name application samples.");
    const abandoned: Abandoned = { schema: "easyeda-pro-control.ordinary-supervision-abandoned.v1", operationId: request.operationId,
      intentSha256: sha256Json(operation.intent), launchedSha256: request.expectedLaunchedSha256,
      profileSha256: operation.intent.profileSha256, facadeSha256: digestSchema.parse(observation["facadeSha256"]),
      createdAt: new Date().toISOString(), confirmAbandonSupervision: true, acceptUnobservedDescendants: true,
      sameNameProcessPresent: false, samples: 2, terminationProved: false, originalLaunchIdentityVerified: false,
      retainedLaunchAuthority: false, designExecutionAuthorized: false };
    this.uncertain = true;
    await publish(request.operationId, "abandonment.json", abandoned);
    this.uncertain = false;
    return describe(request.operationId, { ...operation, abandoned });
  }

  private async abandonUnknown(request: Extract<OrdinaryLaunchRequest, { action: "abandon-unknown-launch" }>, operation: Operation | undefined,
    operations: Operation[]): Promise<Record<string, unknown>> {
    requireValue(operation?.intent !== undefined && operation.launched === undefined && !allowsNextLaunch(operation),
      "Unknown-launch abandonment requires an unresolved intent-only attempt.");
    requireValue(this.retained === undefined && this.runtime === undefined,
      "Unknown-launch abandonment requires a fresh coordinator without an allocated runtime.");
    requireValue(request.expectedIntentSha256 === sha256Json(operation.intent), "Unknown-launch abandonment intent digest differs.");
    requireValue(hasHelperBeforeIntentProtocol(operation.intent), "Unknown-launch historical dispatch protocol is not reviewed.");
    const facadeSha256 = digestSchema.parse(await this.verify(this.options));
    requireValue(operation.intent.schema === "easyeda-pro-control.ordinary-launch-intent.v1" || operation.intent.facadeSha256 === facadeSha256,
      "Unknown-launch v2 producer differs from the currently reviewed facade.");
    await this.options.assertAllowed();
    // The historical helper already existed when this intent was published.
    // PowerShell absence precedes EasyEDA sampling to exclude its delayed launch.
    // A timed-out facade may have left that helper hashing the executable.
    const observation = ordinaryLaunchRecoveryObservationSchema.parse(await this.observeRecovery(this.options));
    requireValue(!observation.otherPowerShellPresent && !observation.sameNameProcessPresent,
      "Unknown-launch abandonment requires absent other PowerShell and same-name application samples.");
    await this.options.assertAllowed();
    requireValue(await this.verify(this.options) === facadeSha256, "Unknown-launch recovery installation changed.");
    await this.options.assertAllowed();
    requireValue(canonicalJson(await inventory()) === canonicalJson(operations), "Unknown-launch recovery journal changed.");
    requireValue(this.retained === undefined && this.runtime === undefined, "Unknown-launch recovery runtime changed.");
    const unknownAbandoned: UnknownAbandoned = { schema: "easyeda-pro-control.ordinary-unknown-launch-abandoned.v1",
      operationId: request.operationId, intentSha256: request.expectedIntentSha256, profileSha256: operation.intent.profileSha256,
      facadeSha256, createdAt: new Date().toISOString(), confirmAbandonUnknownLaunch: true, acceptUnobservedDescendants: true,
      observation, pendingHelperLaunchExcluded: true, launchOutcome: "unknown", terminationProved: false,
      originalLaunchIdentityVerified: false, retainedLaunchAuthority: false, designExecutionAuthorized: false };
    this.uncertain = true;
    await publish(request.operationId, "unknown-abandonment.json", unknownAbandoned);
    this.uncertain = false;
    return describe(request.operationId, { ...operation, unknownAbandoned });
  }
}

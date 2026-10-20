/** Private, append-only diagnostic lifecycle records. Historical JSON never
 * recreates a native owner. Partial reservations remain launch blockers. */
import { constants } from "node:fs";
import type { BigIntStats, Dirent } from "node:fs";
import { lstat, mkdir, open, opendir } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive } from "./artifacts.ts";
import type { ControlRootDirectory } from "./control-root.ts";
import { canonicalJson, sha256Json } from "./core.ts";

const DIRECTORY = "pcb-diagnostic-lifecycle-v1";
const MAX_BYTES = 8192;
export const DIAGNOSTIC_OBSERVATION_MAX_BYTES = 128 * 1024;
const MAX_OPERATIONS = 4096;
export const diagnosticLifecycleIdSchema = z.string().min(1).max(80).regex(/^[a-z0-9][a-z0-9_-]*$/u);
export const diagnosticLifecycleDigestSchema = z.string().regex(/^[a-f0-9]{64}$/u);
export const diagnosticLifecycleWindowSchema = z.string().regex(/^[1-9]\d{0,18}$/u);
const token = z.string().regex(/^[a-f0-9]{32}$/u);
export const diagnosticLifecycleBindingSchema = z.object({
  helperInstance: token, jobId: token, rootPid: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  rootCreated: z.string().regex(/^(?:0|[1-9]\d{14,19})$/u),
}).strict();
const base = { operationId: diagnosticLifecycleIdSchema, createdAt: z.iso.datetime() };
const intentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-launch-intent.v1"), ...base,
  facadeSha256: diagnosticLifecycleDigestSchema, installationSha256: diagnosticLifecycleDigestSchema,
  confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true),
}).strict();
const bindingSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-launch-binding.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, binding: diagnosticLifecycleBindingSchema,
  launchAcknowledged: z.boolean(),
}).strict().refine(value => !value.launchAcknowledged || value.binding.rootCreated !== "0", "Cleanup-only identity cannot acknowledge diagnostic startup.");
const closeIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-close-intent.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, hwnd: diagnosticLifecycleWindowSchema, confirmNormalClose: z.literal(true),
}).strict();
const closeAcknowledgmentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-close-acknowledged.v1"), ...base,
  closeIntentSha256: diagnosticLifecycleDigestSchema, acknowledged: z.literal(true), terminationProved: z.literal(false),
}).strict();
const terminationSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-terminated.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, originalRootExited: z.literal(true), originalJobEmpty: z.literal(true),
}).strict();
const releaseIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-release-intent.v1"), ...base,
  terminationSha256: diagnosticLifecycleDigestSchema,
}).strict();
const releasedSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-released.v1"), ...base,
  releaseIntentSha256: diagnosticLifecycleDigestSchema, released: z.literal(true),
}).strict();
const unlaunchedIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-unlaunched-release-intent.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, nativeLaunchInvoked: z.literal(false), helperAllocated: z.boolean(),
}).strict();
const notDispatchedSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-not-dispatched.v1"), ...base,
  unlaunchedReleaseIntentSha256: diagnosticLifecycleDigestSchema, nativeLaunchInvoked: z.literal(false), helperReleased: z.boolean(),
}).strict();
export const diagnosticLifecycleNoProcessReleaseProofSchema = z.object({
  launchRequestOutcome: z.enum(["not-issued", "native-refused"]), creationState: z.enum(["not-entered", "returned-false"]),
  createProcessError: z.number().int().min(0).max(4_294_967_295).refine(value => !Object.is(value, -0)).optional(),
  processCreated: z.literal(false), released: z.literal(true),
}).strict().refine(value => value.launchRequestOutcome !== "not-issued" || value.creationState === "not-entered",
  "An unissued native request cannot have entered CreateProcess.")
  .refine(value => value.createProcessError === undefined || value.creationState === "returned-false",
    "Only a failed CreateProcess can carry its captured numeric error.");
const noProcessIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-no-process-release-intent.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, originalLaunchMethodInvoked: z.literal(true),
}).strict();
const noProcessReleasedSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-no-process-released.v1"), ...base,
  noProcessReleaseIntentSha256: diagnosticLifecycleDigestSchema, proof: diagnosticLifecycleNoProcessReleaseProofSchema,
}).strict();
export const diagnosticObservationStageSchema = z.enum(["browser", "frames", "script", "workers", "worker-script", "worker-state"]);
const observationIntentSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-observation-intent.v1"), ...base,
  bindingSha256: diagnosticLifecycleDigestSchema, stage: diagnosticObservationStageSchema,
  targetId: z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u).optional(), frameId: z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u).optional(),
  family: z.enum(["ui", "pcb", "public-api"]).optional(),
}).strict().refine(value => {
  if (value.stage === "browser" || value.stage === "workers" || value.stage === "worker-state") {
    return value.targetId === undefined && value.frameId === undefined && value.family === undefined;
  }
  if (value.stage === "frames" || value.stage === "worker-script") { return value.targetId !== undefined && value.frameId === undefined && value.family === undefined; }
  return value.targetId === undefined && value.frameId !== undefined && value.family !== undefined;
}, "Observation selectors must match the exact stage.");
const observationResultSchema = z.object({ schema: z.literal("easyeda-pro-control.pcb-diagnostic-observation-result.v1"), ...base,
  intentSha256: diagnosticLifecycleDigestSchema, stage: diagnosticObservationStageSchema,
  result: z.record(z.string(), z.unknown()), executionAuthorized: z.literal(false),
}).strict().refine(value => Buffer.byteLength(canonicalJson(value.result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "Observation result exceeds its bound.");
export const diagnosticLifecycleRecordSchemas = {
  "intent.json": intentSchema, "binding.json": bindingSchema, "close-intent.json": closeIntentSchema,
  "close-acknowledged.json": closeAcknowledgmentSchema, "terminated.json": terminationSchema,
  "release-intent.json": releaseIntentSchema, "released.json": releasedSchema,
  "unlaunched-release-intent.json": unlaunchedIntentSchema, "not-dispatched.json": notDispatchedSchema,
  "no-process-release-intent.json": noProcessIntentSchema, "no-process-released.json": noProcessReleasedSchema,
  "browser-intent.json": observationIntentSchema, "browser-result.json": observationResultSchema,
  "frames-intent.json": observationIntentSchema, "frames-result.json": observationResultSchema,
  "script-intent.json": observationIntentSchema, "script-result.json": observationResultSchema,
  "workers-intent.json": observationIntentSchema, "workers-result.json": observationResultSchema,
  "worker-script-intent.json": observationIntentSchema, "worker-script-result.json": observationResultSchema,
  "worker-state-intent.json": observationIntentSchema, "worker-state-result.json": observationResultSchema,
} as const;
export type DiagnosticLifecycleRecords = { readonly [Key in keyof typeof diagnosticLifecycleRecordSchemas]?: z.infer<(typeof diagnosticLifecycleRecordSchemas)[Key]> };
export interface DiagnosticLifecycleOperation { readonly operationId: string; readonly records: DiagnosticLifecycleRecords }
export type DiagnosticLifecycleBinding = z.infer<typeof diagnosticLifecycleBindingSchema>;
export type DiagnosticLifecycleRecordName = keyof typeof diagnosticLifecycleRecordSchemas;
type RecordName = DiagnosticLifecycleRecordName;
export interface CurrentPcbDiagnosticLaunchLease { readonly profile: "private.pcb-diagnostic-launch-exclusion.v1" }
let launchLease: CurrentPcbDiagnosticLaunchLease | null = null;
function requireValue(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`PCB_DIAGNOSTIC_LIFECYCLE_${message}`); }
}
function absent(value: unknown): boolean { return value instanceof Error && "code" in value && value.code === "ENOENT"; }
function recordName(value: string): value is RecordName { return Object.hasOwn(diagnosticLifecycleRecordSchemas, value); }
function recordBound(name: RecordName): number { return name.endsWith("-result.json") ? DIAGNOSTIC_OBSERVATION_MAX_BYTES + MAX_BYTES : MAX_BYTES; }
function same(left: BigIntStats, right: BigIntStats): boolean {
  return (["dev", "ino", "mode", "nlink", "size", "mtimeNs", "ctimeNs"] as const).every(key => left[key] === right[key]);
}

/** Root must wrap every ordinary/replacement launch in this same gate. The
 * original lexical lease alone releases it; JSON and copied IDs cannot. This
 * process-local gate supplements durable scans and the facade's sole-host lease. */
export function acquireCurrentPcbDiagnosticLaunchExclusion(): CurrentPcbDiagnosticLaunchLease {
  requireValue(launchLease === null, "LAUNCH_BUSY");
  const original = Object.freeze({ profile: "private.pcb-diagnostic-launch-exclusion.v1" as const });
  launchLease = original; return original;
}
export function assertCurrentPcbDiagnosticLaunchExclusion(original: CurrentPcbDiagnosticLaunchLease): void {
  requireValue(launchLease === original, "LAUNCH_LEASE_CHANGED");
}
export function releaseCurrentPcbDiagnosticLaunchExclusion(original: CurrentPcbDiagnosticLaunchLease): void {
  assertCurrentPcbDiagnosticLaunchExclusion(original); launchLease = null;
}
export async function withCurrentPcbDiagnosticLaunchExclusion<T>(action: () => Promise<T>): Promise<T> {
  const original = acquireCurrentPcbDiagnosticLaunchExclusion();
  try { return await action(); }
  finally { releaseCurrentPcbDiagnosticLaunchExclusion(original); }
}

async function entries(directory: ControlRootDirectory, limit: number): Promise<Dirent[]> {
  const result: Dirent[] = [];
  const handle = await opendir(`/proc/self/fd/${String(directory.handle.fd)}`);
  for await (const entry of handle) {
    requireValue(result.length < limit, "INVENTORY_BOUND"); result.push(entry);
  }
  return result;
}
async function readRecord(directory: ControlRootDirectory, name: RecordName): Promise<unknown> {
  const path = `/proc/self/fd/${String(directory.handle.fd)}/${name}`;
  // oxlint-disable-next-line no-bitwise -- Bound regular journal descriptors must not follow links or block on devices.
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const initial = await handle.stat({ bigint: true });
    requireValue(initial.isFile() && initial.nlink === 1n && initial.size > 0n && initial.size <= BigInt(recordBound(name)) &&
      initial.mode % 512n === 0o600n && typeof process.getuid === "function" && initial.uid === BigInt(process.getuid()), "RECORD_AUTHORITY");
    const bytes = Buffer.alloc(Number(initial.size) + 1); let count = 0;
    while (count < bytes.length) {
      const read = await handle.read(bytes, count, bytes.length - count, count);
      if (read.bytesRead === 0) { break; } count += read.bytesRead;
    }
    requireValue(count === Number(initial.size) && same(initial, await handle.stat({ bigint: true })) &&
      same(initial, await lstat(path, { bigint: true })), "RECORD_CHANGED");
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, count))) as unknown;
  } finally { await handle.close(); }
}
function validateChain(operation: DiagnosticLifecycleOperation): void {
  const records = operation.records;
  for (const record of Object.values(records)) { requireValue(record.operationId === operation.operationId, "RECORD_OPERATION"); }
  const binding = records["binding.json"], close = records["close-intent.json"], intent = records["intent.json"];
  const acknowledgment = records["close-acknowledged.json"], termination = records["terminated.json"];
  const release = records["release-intent.json"], released = records["released.json"];
  const notDispatched = records["not-dispatched.json"], unlaunched = records["unlaunched-release-intent.json"];
  const noProcess = records["no-process-release-intent.json"], noProcessReleased = records["no-process-released.json"];
  for (const stage of diagnosticObservationStageSchema.options) {
    const observation = records[`${stage}-intent.json`], result = records[`${stage}-result.json`];
    requireValue(observation === undefined || binding !== undefined && observation.stage === stage &&
      observation.bindingSha256 === sha256Json(binding) && binding.launchAcknowledged && binding.binding.rootCreated !== "0", "OBSERVATION_CHAIN");
    requireValue(result === undefined || observation !== undefined && result.stage === stage && result.intentSha256 === sha256Json(observation), "OBSERVATION_RESULT_CHAIN");
  }
  requireValue(records["frames-intent.json"] === undefined || records["browser-result.json"] !== undefined, "FRAMES_CHAIN");
  requireValue(records["script-intent.json"] === undefined || records["frames-result.json"] !== undefined, "SCRIPT_CHAIN");
  requireValue(records["workers-intent.json"] === undefined || records["frames-result.json"] !== undefined, "WORKERS_CHAIN");
  requireValue(records["worker-script-intent.json"] === undefined || records["workers-result.json"] !== undefined, "WORKER_SCRIPT_CHAIN");
  requireValue(records["worker-state-intent.json"] === undefined || records["worker-script-result.json"] !== undefined, "WORKER_STATE_CHAIN");
  requireValue(binding === undefined || intent !== undefined && binding.intentSha256 === sha256Json(intent), "BINDING_CHAIN");
  requireValue(close === undefined || binding !== undefined && close.bindingSha256 === sha256Json(binding), "CLOSE_CHAIN");
  requireValue(acknowledgment === undefined || close !== undefined && acknowledgment.closeIntentSha256 === sha256Json(close), "CLOSE_ACK_CHAIN");
  requireValue(termination === undefined || binding !== undefined && termination.bindingSha256 === sha256Json(binding), "TERMINATION_CHAIN");
  requireValue(release === undefined || termination !== undefined && release.terminationSha256 === sha256Json(termination), "RELEASE_CHAIN");
  requireValue(released === undefined || release !== undefined && released.releaseIntentSha256 === sha256Json(release), "RELEASE_ACK_CHAIN");
  requireValue(unlaunched === undefined || intent !== undefined && unlaunched.intentSha256 === sha256Json(intent) &&
    binding === undefined && close === undefined && acknowledgment === undefined && termination === undefined && release === undefined && released === undefined, "UNLAUNCHED_CHAIN");
  requireValue(notDispatched === undefined || unlaunched !== undefined && notDispatched.unlaunchedReleaseIntentSha256 === sha256Json(unlaunched) &&
    notDispatched.helperReleased === unlaunched.helperAllocated, "NONDISPATCH_CHAIN");
  requireValue(noProcess === undefined || intent !== undefined && noProcess.intentSha256 === sha256Json(intent) && binding === undefined &&
    unlaunched === undefined && notDispatched === undefined && close === undefined && acknowledgment === undefined &&
    termination === undefined && release === undefined && released === undefined, "NO_PROCESS_CHAIN");
  requireValue(noProcessReleased === undefined || noProcess !== undefined && noProcessReleased.noProcessReleaseIntentSha256 === sha256Json(noProcess), "NO_PROCESS_RELEASE_CHAIN");
}

/** Missing root/parent means no records. Anything else unknown, partial or
 * corrupt refuses the scan or remains an unresolved operation. */
export async function readCurrentPcbDiagnosticLifecycles(): Promise<readonly DiagnosticLifecycleOperation[]> {
  const root = await controlRootCapability(false);
  const parent = await root.openDirectory(join(controlDataDirectory(), DIRECTORY), false).catch((error: unknown) => {
    if (absent(error)) { return null; } throw error;
  });
  if (parent === null) { return []; }
  try {
    const operations: DiagnosticLifecycleOperation[] = [];
    const children = await entries(parent, MAX_OPERATIONS);
    for (const entry of children.toSorted((left, right) => left.name.localeCompare(right.name))) {
      requireValue(entry.isDirectory() && diagnosticLifecycleIdSchema.safeParse(entry.name).success, "UNKNOWN_OPERATION");
      const slot = await root.openDirectory(join(parent.absolute, entry.name), false);
      try {
        const records: DiagnosticLifecycleRecords = {};
        for (const record of await entries(slot, Object.keys(diagnosticLifecycleRecordSchemas).length)) {
          requireValue(record.isFile() && recordName(record.name), "UNKNOWN_RECORD");
          const name = record.name;
          Object.defineProperty(records, name, { enumerable: true, value: diagnosticLifecycleRecordSchemas[name].parse(await readRecord(slot, name)) });
        }
        const operation = { operationId: entry.name, records };
        validateChain(operation); operations.push(operation);
      } finally { await slot.handle.close(); }
    }
    await root.assertCurrent(); return operations;
  } finally { await parent.handle.close(); }
}

export async function assertNoUnresolvedCurrentPcbDiagnosticLaunches(): Promise<void> {
  const operations = await readCurrentPcbDiagnosticLifecycles();
  requireValue(operations.every(operation => operation.records["released.json"] !== undefined || operation.records["not-dispatched.json"] !== undefined ||
    operation.records["no-process-released.json"] !== undefined), "UNRESOLVED_LAUNCH");
}
export async function reserveCurrentPcbDiagnosticLifecycle(operationId: string): Promise<void> {
  diagnosticLifecycleIdSchema.parse(operationId);
  const root = await controlRootCapability();
  const parent = await root.openDirectory(join(controlDataDirectory(), DIRECTORY));
  try {
    await mkdir(`/proc/self/fd/${String(parent.handle.fd)}/${operationId}`, { mode: 0o700 });
    await parent.handle.sync(); await root.assertCurrent();
  } finally { await parent.handle.close(); }
}
export async function publishCurrentPcbDiagnosticLifecycleRecord<Key extends RecordName>(operationId: string, name: Key,
  record: z.infer<(typeof diagnosticLifecycleRecordSchemas)[Key]>): Promise<void> {
  diagnosticLifecycleIdSchema.parse(operationId);
  const parsed = diagnosticLifecycleRecordSchemas[name].parse(record);
  requireValue(parsed.operationId === operationId, "PUBLICATION_OPERATION");
  const bytes = Buffer.from(`${JSON.stringify(parsed)}\n`);
  requireValue(bytes.length <= recordBound(name), "PUBLICATION_BOUND");
  await publishManagedAttachmentExclusive(join(controlDataDirectory(), DIRECTORY, operationId, name),
    "PCB diagnostic lifecycle record", bytes, "easyeda-pro-control.pcb-diagnostic-lifecycle.v1");
}
export function assertCurrentPcbDiagnosticLifecycleSnapshot(actual: readonly DiagnosticLifecycleOperation[], expected: readonly DiagnosticLifecycleOperation[]): void {
  requireValue(canonicalJson(actual) === canonicalJson(expected), "JOURNAL_CHANGED");
}

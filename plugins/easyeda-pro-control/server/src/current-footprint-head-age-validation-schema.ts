/** Public read-only head-age observation grammar. Arguments select a
 * disposable checkpoint and consumed actions, never native or replay authority. */
import { z } from "zod";
import { types } from "node:util";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { diagnosticLifecycleBindingSchema } from "./current-pcb-diagnostic-binding-schema.ts";
import { captureCurrentFootprintHeadAgeReply } from "./current-footprint-head-age-main.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS } from "./current-footprint-head-age-native.ts";
import { captureCurrentFootprintHeadAgeCdpException } from "./current-footprint-head-age-cdp-exception.ts";

export const CURRENT_FOOTPRINT_HEAD_AGE_VALIDATION_PREFIX = "footprint-head-age-";
export const CURRENT_FOOTPRINT_HEAD_AGE_VALIDATION_RECORD_BYTES = 524_288;
export const currentFootprintHeadAgeValidationIdSchema = z.string().min(24).max(80)
  .regex(/^footprint-head-age-[a-z0-9][a-z0-9-]*(?![\s\S])/u);
const digest = z.string().regex(/^[a-f\d]{64}(?![\s\S])/u);
const identity = { operationId: currentFootprintHeadAgeValidationIdSchema };
export const currentFootprintHeadAgeValidationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), ...identity, target: currentDisposableOpenTargetSchema,
    confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true), confirmDisposableProject: z.literal(true),
    acceptExistingProfileEffects: z.literal(true), acceptNativeClockObservation: z.literal(true) }).strict(),
  ...(["observe-head-age", "normal-close", "observe-termination", "release-closed", "cleanup-no-resource",
    "cleanup-unlaunched", "cleanup-no-process", "inspect", "settle-records"] as const)
    .map(action => z.object({ action: z.literal(action), ...identity }).strict()),
  z.object({ action: z.literal("abort"), ...identity, confirmOriginalJob: z.literal(true) }).strict(),
]);
export type CurrentFootprintHeadAgeValidationRequest = z.infer<typeof currentFootprintHeadAgeValidationRequestSchema>;

const epochMs = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
/** Public values come only from the retained original native observation.
 * This shape validates bounds; parsing it issues no observation or custody. */
export const currentFootprintHeadAgeSummarySchema = z.object({
  minimumObservedAgeMs: z.number().int().min(61_000).max(Number.MAX_SAFE_INTEGER),
  observedWindow: z.object({ notBeforeMs: epochMs, notAfterMs: epochMs }).strict().refine(
    value => value.notAfterMs >= value.notBeforeMs && value.notAfterMs - value.notBeforeMs <= 10_000,
    "The original native bracket must contain at most ten seconds.",
  ),
  timestampInterpretation: z.literal("original-rl-with-current-offset"),
  appClockDirectlyObserved: z.literal(true), nativeDateProvenanceVerified: z.literal(true),
  preselectedWriterIntervalProven: z.literal(false), continuousClockStabilityProved: z.literal(false),
  writerAuthority: z.literal(false), saveAuthorized: z.literal(false), executionAuthorized: z.literal(false),
}).strict();

const startupFields = { nativeBinding: diagnosticLifecycleBindingSchema } as const;
/** Preserve the existing generic evidence map while requiring complete closed
 * shapes for native-binding data at every record
 * acceptance boundary. Successful parsing confers no original-owner custody.
 */
const evidenceSchema = z.record(z.string().max(128), z.unknown()).superRefine((evidence, context) => {
  for (const [key, schema] of Object.entries(startupFields)) {
    if (Object.hasOwn(evidence, key) && !schema.safeParse(evidence[key]).success) {
      context.addIssue({ code: "custom", path: [key], message: "The complete bounded original native-binding shape is required." });
    }
  }
});
export const currentFootprintHeadAgeValidationRecordSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-head-age-validation-record.v1"), ...identity,
  sequence: z.number().int().min(0).max(511), createdAt: z.iso.datetime(), previousSha256: digest.nullable(),
  kind: z.enum(["launch-intent", "prepared", "allocation-intent", "allocation-result", "launch-result", "observe-head-age-intent", "observe-head-age-result", "normal-close-intent", "normal-close-result",
    "abort-intent", "abort-result", "termination-intent", "termination-result", "release-closed-intent", "release-closed-result",
    "cleanup-no-resource-result", "cleanup-unlaunched-intent", "cleanup-unlaunched-result", "cleanup-no-process-intent", "cleanup-no-process-result", "failure"]),
  evidence: evidenceSchema,
}).strict();
export type CurrentFootprintHeadAgeValidationRecord = z.infer<typeof currentFootprintHeadAgeValidationRecordSchema>;

const maxScalarRecord = { schema: "easyeda-pro-control.footprint-head-age-validation-record.v1", operationId: "x".repeat(80),
  sequence: 511, createdAt: "2000-01-01T00:00:00.000Z", previousSha256: "a".repeat(64), kind: "cleanup-unlaunched-result",
  evidence: { action: "observe-termination", nativeAllocationNeverAttempted: false, nativeAllocationOutcome: "not-attempted", retryAllowed: false,
    failure: "\0".repeat(512), confirmOriginalJob: true, abortRequested: true, originalJobOnly: true, terminationObserved: false,
    saveOrDiscardSelected: false, closeDispatched: true, ordinal: 240, originalRootAndJobTerminated: false,
    originalTerminationObserved: false, released: false, helperReleased: false, applicationTerminationObserved: false, noApplicationGeneration: false,
    nativeTerminationObserved: false, nativeResourceReleaseObserved: false, writerAuthority: false, observationSha256: "a".repeat(64) } };
const cleanupAttempts = 1 + 1 + 240 + 1, pendingNormalFailureRecords = 1;
const cleanupRecords = 2 * cleanupAttempts + pendingNormalFailureRecords;
const cleanupScalarRecordBytes = Buffer.byteLength(JSON.stringify(maxScalarRecord)) + 1;
const observationBytes = 131_072, startupEvidenceBytes = 8192;
// Reserve one complete original observation and one native-binding failure
// Packet even when abort intent is published before a late observation settles.
const rawEvidenceBytes = observationBytes + startupEvidenceBytes + 256;
const operationBytes = 8 * 1024 * 1024;
const cleanupBytes = cleanupRecords * cleanupScalarRecordBytes + rawEvidenceBytes;
export const CURRENT_FOOTPRINT_HEAD_AGE_JOURNAL_LIMITS = Object.freeze({ operationBytes, records: 512, cleanupAttempts, cleanupRecords,
  pendingNormalFailureRecords, cleanupScalarRecordBytes, observationBytes, startupEvidenceBytes, rawEvidenceBytes, cleanupBytes,
  normalBytes: operationBytes - cleanupBytes, normalRecords: 512 - cleanupRecords });

/** Charge retained observation/native-binding packets once and protect all
 * original cleanup rows before normal work can consume their capacity. */
export function assertFootprintHeadAgeJournalBudget(records: readonly CurrentFootprintHeadAgeValidationRecord[]): void {
  let bytes = 0, cleanup = false, cleanupRows = 0, normalBytes = 0, normalRows = 0, rawBytes = 0;
  const packets = new Set<string>();
  for (const record of records) {
    const size = Buffer.byteLength(JSON.stringify(record)) + 1;
    bytes += size;
    cleanup ||= /^(?:normal-close|abort|termination|release-closed|cleanup-)/u.test(record.kind);
    const evidence = { ...record.evidence };
    if (Object.hasOwn(evidence, "headAgeObservation")) {
      if (packets.has("headAgeObservation") || packets.has("headAgeCdpException") || Buffer.byteLength(JSON.stringify(evidence["headAgeObservation"])) > observationBytes) {
        throw new Error("HEAD_AGE_JOURNAL_RAW_PACKET");
      }
      packets.add("headAgeObservation"); delete evidence["headAgeObservation"];
    }
    if (Object.hasOwn(evidence, "headAgeCdpException")) {
      if (record.kind !== "failure" || evidence["action"] !== "observe-head-age" || packets.has("headAgeObservation") || packets.has("headAgeCdpException")) {
        throw new Error("HEAD_AGE_JOURNAL_EXCEPTION_PACKET");
      }
      captureCurrentFootprintHeadAgeCdpException(evidence["headAgeCdpException"]);
      packets.add("headAgeCdpException"); delete evidence["headAgeCdpException"];
    }
    if (Object.hasOwn(evidence, "nativeBinding")) {
      diagnosticLifecycleBindingSchema.parse(evidence["nativeBinding"]);
      if (record.kind !== "failure" || evidence["action"] !== "launch" || packets.has("nativeBinding") ||
          Buffer.byteLength(JSON.stringify(evidence["nativeBinding"])) > startupEvidenceBytes) { throw new Error("HEAD_AGE_JOURNAL_STARTUP_PACKET"); }
      packets.add("nativeBinding"); delete evidence["nativeBinding"];
    }
    const scalarBytes = Buffer.byteLength(JSON.stringify({ ...record, evidence })) + 1; rawBytes += size - scalarBytes;
    if (cleanup) { cleanupRows += 1; if (scalarBytes > cleanupScalarRecordBytes) { throw new Error("HEAD_AGE_JOURNAL_CLEANUP_SCALAR"); } }
    else { normalRows += 1; normalBytes += size; }
    if (bytes > operationBytes || records.length > 512 || cleanupRows > cleanupRecords || normalRows > 512 - cleanupRecords ||
        normalBytes > operationBytes - cleanupBytes || rawBytes > rawEvidenceBytes) { throw new Error("HEAD_AGE_JOURNAL_AGGREGATE"); }
  }
}

/** Copy a complete bounded diagnostic record without executing accessors,
 * proxies, toJSON or inherited array hooks. The original bounded Date observation fits
 * here; the smaller public-request capture is deliberately separate. */
export function captureFootprintHeadAgeValidationRecord(input: unknown): CurrentFootprintHeadAgeValidationRecord {
  const seen = new Set<object>(); let nodes = 0;
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1;
    if (nodes > 16_384 || depth > 24) { throw new Error("HEAD_AGE_RECORD_NODES"); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0)) { return value; }
    if (typeof value === "string" && value.length <= 65_536 && value.isWellFormed()) { return value; }
    if (value === null || typeof value !== "object" || types.isProxy(value) || seen.has(value)) { throw new Error("HEAD_AGE_RECORD_DATA"); }
    seen.add(value);
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    const own = (key: string): unknown => {
      const field = Object.getOwnPropertyDescriptor(value, key);
      if (field === undefined || !Object.hasOwn(field, "value") || field.enumerable !== true) { throw new Error("HEAD_AGE_RECORD_FIELD"); }
      // Only the once-retained native packet may contain its two exhaustive
      // 1681-offset timestamp-control rosters. Other record arrays stay at512.
      if (depth === 1 && key === "headAgeObservation") { return captureCurrentFootprintHeadAgeReply(field.value as unknown).value; }
      if (depth === 1 && key === "headAgeCdpException") { return captureCurrentFootprintHeadAgeCdpException(field.value as unknown); }
      return copy(field.value as unknown, depth + 1);
    };
    if (Array.isArray(value)) {
      if (prototype !== Array.prototype || value.length > 512 || keys.length !== value.length + 1) { throw new Error("HEAD_AGE_RECORD_ARRAY"); }
      return Object.freeze(Array.from({ length: value.length }, (_, index) => own(String(index))));
    }
    if (prototype !== Object.prototype && prototype !== null || keys.length > 256) { throw new Error("HEAD_AGE_RECORD_OBJECT"); }
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (typeof key !== "string" || key.length > 128 || !key.isWellFormed()) { throw new Error("HEAD_AGE_RECORD_KEY"); }
      Object.defineProperty(result, key, { value: own(key), enumerable: true });
    }
    return Object.freeze(result);
  };
  const value = copy(input, 0);
  if (Buffer.byteLength(JSON.stringify(value)) + 1 > CURRENT_FOOTPRINT_HEAD_AGE_VALIDATION_RECORD_BYTES) { throw new Error("HEAD_AGE_RECORD_BYTES"); }
  return currentFootprintHeadAgeValidationRecordSchema.parse(value);
}

/** Describe separately mounted read-only qualification without starting a
 * helper, touching a project or admitting another execution profile. */
export function queryCurrentFootprintHeadAgeValidation(includeSchemas = false): Readonly<Record<string, unknown>> {
  return { profile: "easyeda-pro-control.footprint-head-age-validation.v1", operationPrefix: CURRENT_FOOTPRINT_HEAD_AGE_VALIDATION_PREFIX,
    tool: "easyeda_control_pcb209_worker_startup", wrapperAction: "footprint-head-age", validationOnly: true, readOnly: true,
    nativeQualificationIssued: false, runtimeAdmissionGranted: false, replayTokenIssued: false, writerAuthority: false, saveAuthorized: false,
    executionAuthorized: false, actions: ["launch", "observe-head-age", "normal-close", "abort", "observe-termination", "release-closed",
      "cleanup-no-resource", "cleanup-unlaunched", "cleanup-no-process", "inspect", "settle-records"],
    limits: { terminationObservations: 240, recordBytes: CURRENT_FOOTPRINT_HEAD_AGE_VALIDATION_RECORD_BYTES,
      nativeRequests: CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS, journal: CURRENT_FOOTPRINT_HEAD_AGE_JOURNAL_LIMITS },
    notes: ["Launch selects the actual closed disposable checkpoint, default branch, PCB member and complete original SQL inventory before this separate native role is allocated.",
      "A once-only observation uses the original app-main Date constructor, now function, native timestamp parser and owner-issued Windows UTC/QPC/zone bracket. Historical SQL timestamps and facade time alone are not provenance.",
      "These sequential observations issue no writer capability, future dispatch-age promise, project-open, worker, copy/delete, Save or saved-copy authority.",
      "Every native action is consumed before dispatch. Missing acknowledgment permits original cleanup and evidence settlement, never retry or historical owner adoption.",
      "Normal close selects no Save/Discard response. Explicit abort targets only the original retained Job; root/Job exit and helper release require separate observations.",
      "Existing-profile startup may restore tabs, contact services, migrate or persist files and shared settings. Read-only describes the requested clock work, not profile isolation or unchanged storage."],
    ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintHeadAgeValidationRequestSchema) } : {}) };
}

/** Validate exact argument shape offline. This issues no original owner or
 * execution permit and does not read the selected project. */
export function validateCurrentFootprintHeadAgeValidationArguments(input: unknown): Readonly<Record<string, unknown>> {
  const parsed = currentFootprintHeadAgeValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

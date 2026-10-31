/** Public read-only held-cache qualification grammar. Arguments select a
 * disposable checkpoint and consumed actions, never native or replay authority. */
import { z } from "zod";
import { types } from "node:util";
import { sha256Json } from "./core.ts";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE, CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS, currentFootprintHeldCacheStartupObservationSchema } from "./current-footprint-held-cache-diagnostic-profile.ts";
import { diagnosticLifecycleBindingSchema } from "./current-pcb-diagnostic-binding-schema.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE, CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS } from "./current-footprint-saved-cache-held-profile.ts";

export const CURRENT_FOOTPRINT_HELD_CACHE_VALIDATION_PREFIX = "footprint-held-cache-";
export const CURRENT_FOOTPRINT_HELD_CACHE_VALIDATION_RECORD_BYTES = 524_288;
export const currentFootprintHeldCacheValidationIdSchema = z.string().min(24).max(80)
  .regex(/^footprint-held-cache-[a-z0-9][a-z0-9-]*(?![\s\S])/u);
const digest = z.string().regex(/^[a-f\d]{64}(?![\s\S])/u);
const identity = { operationId: currentFootprintHeldCacheValidationIdSchema };
export const currentFootprintHeldCacheValidationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), ...identity, target: currentDisposableOpenTargetSchema,
    confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true), confirmDisposableProject: z.literal(true),
    acceptExistingProfileEffects: z.literal(true), acceptCacheReadEffects: z.literal(true) }).strict(),
  ...(["observe-first", "observe-fresh", "release-cache", "normal-close", "observe-termination", "release-closed", "cleanup-no-resource",
    "cleanup-unlaunched", "cleanup-no-process", "inspect", "settle-records"] as const)
    .map(action => z.object({ action: z.literal(action), ...identity }).strict()),
  z.object({ action: z.literal("abort"), ...identity, confirmOriginalJob: z.literal(true) }).strict(),
]);
export type CurrentFootprintHeldCacheValidationRequest = z.infer<typeof currentFootprintHeldCacheValidationRequestSchema>;

const startupFields = { heldCacheStartupObservation: currentFootprintHeldCacheStartupObservationSchema, nativeBinding: diagnosticLifecycleBindingSchema } as const;
/** Preserve the existing generic evidence map while requiring complete closed
 * shapes for startup diagnostics and native-binding data at every record
 * acceptance boundary. Successful parsing confers no original-owner custody.
 */
const evidenceSchema = z.record(z.string().max(128), z.unknown()).superRefine((evidence, context) => {
  for (const [key, schema] of Object.entries(startupFields)) {
    if (Object.hasOwn(evidence, key) && !schema.safeParse(evidence[key]).success) {
      context.addIssue({ code: "custom", path: [key], message: "The complete bounded startup observation or original native-binding shape is required." });
    }
  }
});
export const currentFootprintHeldCacheValidationRecordSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-held-cache-validation-record.v1"), ...identity,
  sequence: z.number().int().min(0).max(511), createdAt: z.iso.datetime(), previousSha256: digest.nullable(),
  kind: z.enum(["launch-intent", "prepared", "allocation-intent", "allocation-result", "launch-result", "observe-first-intent", "observe-first-result",
    "observe-fresh-intent", "observe-fresh-result", "release-cache-intent", "release-cache-result", "normal-close-intent", "normal-close-result",
    "abort-intent", "abort-result", "termination-intent", "termination-result", "release-closed-intent", "release-closed-result",
    "cleanup-no-resource-result", "cleanup-unlaunched-intent", "cleanup-unlaunched-result", "cleanup-no-process-intent", "cleanup-no-process-result", "failure"]),
  evidence: evidenceSchema,
}).strict();
export type CurrentFootprintHeldCacheValidationRecord = z.infer<typeof currentFootprintHeldCacheValidationRecordSchema>;

const maxSummary = { phase: "fresh-observing", failure: "recheck-before-getter", normalRequests: 11, cleanupRequests: 1,
  pendingCallbacks: 1, releaseAttempted: false, released: false, metadataRosterConformant: false,
  engine: CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE, nativeQualificationIssued: false, runtimeAdmissionGranted: false,
  replayTokenIssued: false, executionAuthorized: false };
const maxScalarRecord = { schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1", operationId: "x".repeat(80),
  sequence: 511, createdAt: "2000-01-01T00:00:00.000Z", previousSha256: "a".repeat(64), kind: "cleanup-unlaunched-result",
  evidence: { action: "observe-termination", nativeAllocationNeverAttempted: false, nativeAllocationOutcome: "not-attempted", retryAllowed: false,
    failure: "\0".repeat(512), confirmOriginalJob: true, abortRequested: true, originalJobOnly: true, terminationObserved: false,
    saveOrDiscardSelected: false, closeDispatched: true, ordinal: 240, originalRootAndJobTerminated: false,
    originalTerminationObserved: false, released: false, helperReleased: false, applicationTerminationObserved: false, noApplicationGeneration: false,
    nativeTerminationObserved: false, nativeResourceReleaseObserved: false,
    held: { summary: maxSummary, replyStart: 12, previousRepliesSha256: "a".repeat(64), replyDelta: [] } } };
const cleanupAttempts = 1 + 1 + 240 + 1, pendingNormalFailureRecords = 1;
const cleanupRecords = 2 * cleanupAttempts + pendingNormalFailureRecords;
const cleanupScalarRecordBytes = Buffer.byteLength(JSON.stringify(maxScalarRecord)) + 1;
// Each original leaf reply is retained once, plus two packets bounded by the
// Maintained clock-reply capture's131072-byte ceiling. Wrapper keys are fixed.
// One late launch failure may follow an abort intent. Its bounded startup
// Snapshot and original binding therefore need protected cleanup space too.
const startupEvidenceBytes = 8192;
const rawEvidenceBytes = (CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS.normal + CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS.cleanup) *
  (CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS.replyBytes + 128) + 2 * (131_072 + 128) + startupEvidenceBytes;
const operationBytes = 8 * 1024 * 1024;
const cleanupBytes = cleanupRecords * cleanupScalarRecordBytes + rawEvidenceBytes;
export const CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS = Object.freeze({ operationBytes, records: 512, cleanupAttempts, cleanupRecords,
  pendingNormalFailureRecords, cleanupScalarRecordBytes, startupEvidenceBytes, rawEvidenceBytes, cleanupBytes, normalBytes: operationBytes - cleanupBytes, normalRecords: 512 - cleanupRecords });

/** Apply the same aggregate and protected cleanup limits before memory/disk
 * append and when reading history. Raw retained deltas are charged once. */
export function assertFootprintHeldCacheJournalBudget(records: readonly CurrentFootprintHeldCacheValidationRecord[]): void {
  let bytes = 0, cleanup = false, cleanupRows = 0, normalBytes = 0, normalRows = 0, rawBytes = 0, replies = 0;
  const packets = new Set<string>(), replyValues: unknown[] = [];
  for (const record of records) {
    const size = Buffer.byteLength(JSON.stringify(record)) + 1;
    bytes += size;
    cleanup ||= /^(?:normal-close|abort|termination|release-closed|cleanup-)/u.test(record.kind);
    const evidence = { ...record.evidence }, held = evidence["held"];
    if (held !== undefined) {
      if (held === null || typeof held !== "object" || Array.isArray(held)) { throw new Error("HELD_CACHE_JOURNAL_RAW_SHAPE"); }
      const data = Object.getOwnPropertyDescriptors(held), delta: unknown = data["replyDelta"]?.value, start: unknown = data["replyStart"]?.value;
      if (!Array.isArray(delta) || start !== replies || replies + delta.length > 12 || data["previousRepliesSha256"]?.value !== sha256Json(replyValues)) { throw new Error("HELD_CACHE_JOURNAL_RAW_PREFIX"); }
      for (const item of delta.map((value: unknown): unknown => value)) {
        if (Buffer.byteLength(JSON.stringify(item)) > CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS.replyBytes + 128) { throw new Error("HELD_CACHE_JOURNAL_RAW_REPLY"); }
        replyValues.push(item);
      }
      replies += delta.length; evidence["held"] = { ...held, replyDelta: [] };
    }
    for (const key of ["firstObservation", "freshObservation"] as const) {
      if (Object.hasOwn(evidence, key)) {
        if (packets.has(key) || Buffer.byteLength(JSON.stringify(evidence[key])) > 131_072) { throw new Error("HELD_CACHE_JOURNAL_RAW_PACKET"); }
        packets.add(key);
        if (key === "firstObservation") { delete evidence["firstObservation"]; } else { delete evidence["freshObservation"]; }
      }
    }
    if (Object.hasOwn(evidence, "heldCacheStartupObservation") || Object.hasOwn(evidence, "nativeBinding")) {
      for (const [key, schema] of Object.entries(startupFields)) { if (Object.hasOwn(evidence, key)) { schema.parse(evidence[key]); } }
      const startup = { ...(Object.hasOwn(evidence, "heldCacheStartupObservation") ? { heldCacheStartupObservation: evidence["heldCacheStartupObservation"] } : {}),
        ...(Object.hasOwn(evidence, "nativeBinding") ? { nativeBinding: evidence["nativeBinding"] } : {}) };
      if (record.kind !== "failure" || evidence["action"] !== "launch" || packets.has("startupDiagnostics") ||
          Buffer.byteLength(JSON.stringify(startup)) > startupEvidenceBytes) { throw new Error("HELD_CACHE_JOURNAL_STARTUP_PACKET"); }
      packets.add("startupDiagnostics"); delete evidence["heldCacheStartupObservation"]; delete evidence["nativeBinding"];
    }
    const scalarBytes = Buffer.byteLength(JSON.stringify({ ...record, evidence })) + 1; rawBytes += size - scalarBytes;
    if (cleanup) { cleanupRows += 1; if (scalarBytes > cleanupScalarRecordBytes) { throw new Error("HELD_CACHE_JOURNAL_CLEANUP_SCALAR"); } }
    else { normalRows += 1; normalBytes += size; }
    if (bytes > operationBytes || records.length > 512 || cleanupRows > cleanupRecords || normalRows > 512 - cleanupRecords ||
        normalBytes > operationBytes - cleanupBytes || rawBytes > rawEvidenceBytes) { throw new Error("HELD_CACHE_JOURNAL_AGGREGATE"); }
  }
}

/** Copy a complete bounded diagnostic record without executing accessors,
 * proxies, toJSON or inherited array hooks. Twelve bounded leaf replies fit
 * together here; the smaller public-request capture is deliberately separate. */
export function captureFootprintHeldCacheValidationRecord(input: unknown): CurrentFootprintHeldCacheValidationRecord {
  const seen = new Set<object>(); let nodes = 0;
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1;
    if (nodes > 16_384 || depth > 24) { throw new Error("HELD_CACHE_RECORD_NODES"); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0)) { return value; }
    if (typeof value === "string" && value.length <= 65_536 && value.isWellFormed()) { return value; }
    if (value === null || typeof value !== "object" || types.isProxy(value) || seen.has(value)) { throw new Error("HELD_CACHE_RECORD_DATA"); }
    seen.add(value);
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    const own = (key: string): unknown => {
      const field = Object.getOwnPropertyDescriptor(value, key);
      if (field === undefined || !Object.hasOwn(field, "value") || field.enumerable !== true) { throw new Error("HELD_CACHE_RECORD_FIELD"); }
      return copy(field.value as unknown, depth + 1);
    };
    if (Array.isArray(value)) {
      if (prototype !== Array.prototype || value.length > 512 || keys.length !== value.length + 1) { throw new Error("HELD_CACHE_RECORD_ARRAY"); }
      return Object.freeze(Array.from({ length: value.length }, (_, index) => own(String(index))));
    }
    if (prototype !== Object.prototype && prototype !== null || keys.length > 256) { throw new Error("HELD_CACHE_RECORD_OBJECT"); }
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (typeof key !== "string" || key.length > 128 || !key.isWellFormed()) { throw new Error("HELD_CACHE_RECORD_KEY"); }
      Object.defineProperty(result, key, { value: own(key), enumerable: true });
    }
    return Object.freeze(result);
  };
  const value = copy(input, 0);
  if (Buffer.byteLength(JSON.stringify(value)) + 1 > CURRENT_FOOTPRINT_HELD_CACHE_VALIDATION_RECORD_BYTES) { throw new Error("HELD_CACHE_RECORD_BYTES"); }
  return currentFootprintHeldCacheValidationRecordSchema.parse(value);
}

/** Describe separately mounted read-only qualification without starting a
 * helper, touching a project or admitting another execution profile. */
export function queryCurrentFootprintHeldCacheValidation(includeSchemas = false): Readonly<Record<string, unknown>> {
  return { profile: "easyeda-pro-control.footprint-held-cache-validation.v1", operationPrefix: CURRENT_FOOTPRINT_HELD_CACHE_VALIDATION_PREFIX,
    tool: "easyeda_control_pcb209_worker_startup", wrapperAction: "footprint-held-cache",
    engine: CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE, validationOnly: true, readOnly: true,
    nativeQualificationIssued: false, runtimeAdmissionGranted: false, replayTokenIssued: false, writerAuthority: false, saveAuthorized: false,
    executionAuthorized: false, actions: ["launch", "observe-first", "observe-fresh", "release-cache", "normal-close", "abort", "observe-termination",
      "release-closed", "cleanup-no-resource", "cleanup-unlaunched", "cleanup-no-process", "inspect", "settle-records"],
    limits: { terminationObservations: 240, recordBytes: CURRENT_FOOTPRINT_HELD_CACHE_VALIDATION_RECORD_BYTES,
      startupReadiness: CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS, nativeRequests: CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE,
      journal: CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS },
    notes: ["Launch selects one exact disposable checkpoint before the new read-only native generation starts; default branch comes from actual complete SQL.",
      "Browser discovery reads version once and samples at most sixteen valid target inventories, waiting only between empty/about:blank or installation-bound loading-page observations. One exact editor may accompany its loading window; malformed, attached, unrelated or duplicate pages refuse without retry. Retained diagnostics contain bounded stages, classifications, counts and hashes only.",
      "The first observation qualifies the actual held getter/match tuple and reads both fixed namespaces. Fresh observation separately reads both namespaces again.",
      "These sequential point-in-time observations do not grant continuous cache emptiness, saved-copy qualification, replay authority or permission to open a project.",
      "Every native action is consumed before dispatch. Missing acknowledgment permits original cleanup and evidence settlement, never retry or historical owner adoption.",
      "Normal close attempts the original held-group release once. Abort requires explicit confirmation and targets only this original Job; exit and release are separate proofs.",
      "Launch may change shared EasyEDA profile state. Cache reads invoke the qualified native getter and noncreating match method, with no response-body read or network fallback."],
    ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintHeldCacheValidationRequestSchema) } : {}) };
}

/** Validate exact argument shape offline. This issues no original owner or
 * execution permit and does not read the selected project. */
export function validateCurrentFootprintHeldCacheValidationArguments(input: unknown): Readonly<Record<string, unknown>> {
  const parsed = currentFootprintHeldCacheValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

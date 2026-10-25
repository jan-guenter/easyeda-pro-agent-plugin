/** Finite native-origin evidence and data-only comparison. No parsed observation
 * supplies an owner, continuation capability or complete Worker identity. */
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { CURRENT_PCB_209_RATLINE_CREATION_PROFILES } from "./current-pcb-209-ratline-creation-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const coordinate = z.number().int().nonnegative().max(2_147_483_647);
const location = z.object({ scriptId: token, lineNumber: coordinate, columnNumber: coordinate }).strict();
const externalId = z.object({ id: z.string().regex(/^[1-9]\d{0,19}$/u), debuggerId: token }).strict();
const remote = z.looseObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]),
  objectId: token.optional(), description: z.string().max(4096).optional(), className: z.string().max(256).optional(),
  subtype: z.string().max(128).optional() });
const scope = z.looseObject({ type: z.enum(["global", "local", "with", "closure", "catch", "block", "script", "eval", "module", "wasm-expression-stack"]),
  object: remote, name: z.string().max(256).optional(), startLocation: location.optional(), endLocation: location.optional() });
const pausedFrame = z.looseObject({ callFrameId: token, functionName: z.string().max(256), functionLocation: location.optional(), location,
  url: z.string().max(4096), scopeChain: z.array(scope).min(1).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
const runtimeFrame = z.object({ functionName: z.string().max(256), scriptId: token, url: z.string().max(4096),
  lineNumber: coordinate, columnNumber: coordinate }).strict();
type Stack = Readonly<{ description?: string | undefined; callFrames: readonly z.infer<typeof runtimeFrame>[]; parent?: Stack | undefined; parentId?: z.infer<typeof externalId> | undefined }>;
const stack: z.ZodType<Stack> = z.lazy(() => z.object({ description: z.string().max(256).optional(), callFrames: z.array(runtimeFrame).max(32),
  parent: stack.optional(), parentId: externalId.optional() }).strict());
const paused = z.looseObject({ reason: z.string().max(128), callFrames: z.array(pausedFrame).min(1).max(32),
  hitBreakpoints: z.array(token).max(1), asyncStackTrace: stack.optional(), asyncStackTraceId: externalId.optional() });
const reasons = ["matched", "stack-lookup-unavailable", "external-id-missing", "external-id-unqualified", "external-debugger-mismatch", "first-pause-unqualified",
  "constructor-frame-unqualified", "native-stack-unqualified", "native-constructor-location-mismatch"] as const;
export const currentPcb209RatlineOriginSummarySchema = z.object({ profile: z.literal("private.pcb209-ratline-origin-observation.v1"),
  reason: z.enum(reasons), externalIdObserved: z.boolean(), parentDebuggerMatched: z.boolean(), stackLookupObserved: z.boolean(),
  constructorLocationMatched: z.boolean(), nativeWorkerTargetIdentityVerified: z.literal(false), executionAuthorized: z.literal(false),
  evidenceSha256: z.string().regex(/^[a-f\d]{64}$/u) }).strict().refine(value =>
  (!value.parentDebuggerMatched || value.externalIdObserved) && (!value.stackLookupObserved || value.parentDebuggerMatched) &&
  (value.reason === "matched") === value.constructorLocationMatched && (!value.constructorLocationMatched || value.stackLookupObserved), "Origin observation flags disagree.");
export type CurrentPcb209RatlineOriginSummary = z.infer<typeof currentPcb209RatlineOriginSummarySchema>;
interface FirstScript { readonly debuggerId: string; readonly uniqueContextId: string; readonly scriptId: string; readonly url: string; readonly pause: unknown }
interface Constructor { readonly before: unknown; readonly after: unknown; readonly parentSessionId: string; readonly scriptId: string }
interface Inputs { readonly parentDebuggerId: string; readonly first: FirstScript; readonly constructor: Constructor }
function boundedStack(value: Stack | undefined): boolean {
  let count = 0, current = value;
  while (current !== undefined) { count += 1; if (count > 2 || current.parent !== undefined && current.parentId !== undefined) { return false; } current = current.parent; }
  return true;
}
function at(actual: z.infer<typeof location>, scriptId: string, point: Readonly<{ lineNumber: number; columnNumber: number }>): boolean {
  return actual.scriptId === scriptId && actual.lineNumber === point.lineNumber && actual.columnNumber === point.columnNumber;
}
function constructorFrame(raw: unknown, scriptId: string, side: "before" | "after"): z.infer<typeof pausedFrame> | null {
  const result = paused.safeParse(raw); if (!result.success || result.data.reason !== "other" || result.data.hitBreakpoints.length !== 1 ||
    !boundedStack(result.data.asyncStackTrace)) { return null; }
  const frame = result.data.callFrames[0], point = CURRENT_PCB_209_RATLINE_CREATION_PROFILES.pcb[side];
  if (frame === undefined || frame.functionName !== "addWorker" || !at(frame.location, scriptId, point) || frame.functionLocation === undefined ||
    frame.functionLocation.scriptId !== scriptId || frame.functionLocation.lineNumber !== point.lineNumber ||
    frame.this.type !== "object" || frame.this.objectId === undefined) { return null; }
  // Fixed syntactic function start and exclusive end in the pinned pcb.js.
  // The custom runtime may report another shape; retain it and refuse this
  // Comparison rather than widening a column or scope interval.
  const end = 167_972, start = 167_735;
  if (frame.functionLocation.columnNumber !== start) { return null; }
  const locals = frame.scopeChain.filter(value => value.type === "local");
  if (locals.length !== 1) { return null; } const local = locals[0];
  if (local === undefined || local.object.type !== "object" || local.object.objectId === undefined || local.startLocation === undefined ||
    local.endLocation === undefined || !at(local.startLocation, scriptId, frame.functionLocation) ||
    !at(local.endLocation, scriptId, { lineNumber: point.lineNumber, columnNumber: end })) { return null; }
  for (const item of frame.scopeChain) {
    if ((item.startLocation === undefined) !== (item.endLocation === undefined)) { return null; }
    if (item.startLocation !== undefined && item.endLocation !== undefined &&
      (item.startLocation.scriptId !== scriptId || item.endLocation.scriptId !== scriptId ||
        item.startLocation.lineNumber > item.endLocation.lineNumber || item.startLocation.lineNumber === item.endLocation.lineNumber &&
        item.startLocation.columnNumber > item.endLocation.columnNumber)) { return null; }
  }
  return frame;
}
function classify(input: Inputs, lookup: unknown): typeof reasons[number] {
  const child = paused.safeParse(input.first.pause);
  if (!child.success || child.data.reason !== "instrumentation" || !boundedStack(child.data.asyncStackTrace) ||
    child.data.callFrames.length !== 1 || child.data.callFrames[0]?.location.scriptId !== input.first.scriptId ||
    child.data.callFrames[0].location.lineNumber !== 0 || child.data.callFrames[0].location.columnNumber !== 0) { return "first-pause-unqualified"; }
  const before = constructorFrame(input.constructor.before, input.constructor.scriptId, "before");
  const after = constructorFrame(input.constructor.after, input.constructor.scriptId, "after");
  if (before === null || after === null || JSON.stringify(before.functionLocation) !== JSON.stringify(after.functionLocation)) { return "constructor-frame-unqualified"; }
  const parsed = z.object({ stackTrace: stack }).strict().safeParse(lookup);
  if (!parsed.success || !boundedStack(parsed.data.stackTrace) || parsed.data.stackTrace.description !== "Worker Created" ||
    parsed.data.stackTrace.callFrames.length === 0) { return "native-stack-unqualified"; }
  const frame = parsed.data.stackTrace.callFrames[0];
  if (frame === undefined || frame.functionName !== "addWorker" ||
    !at(frame, input.constructor.scriptId, CURRENT_PCB_209_RATLINE_CREATION_PROFILES.pcb.before)) { return "native-constructor-location-mismatch"; }
  return "matched";
}

const metadata = z.object({ parentDebuggerId: token, childDebuggerId: token, childUniqueContextId: token, childScriptId: token,
  childUrl: z.string().max(4096), parentSessionId: token, parentScriptId: token }).strict();
export const CURRENT_PCB_209_RATLINE_ORIGIN_OBSERVATION_BYTES = 65_536;
export const CURRENT_PCB_209_RATLINE_ORIGIN_EVIDENCE_BYTES = 4 * CURRENT_PCB_209_RATLINE_ORIGIN_OBSERVATION_BYTES + 8192;
export const currentPcb209RatlineOriginEvidenceSchema = z.object({ metadata, firstPause: z.unknown(), constructorBefore: z.unknown(),
  constructorAfter: z.unknown(), stackReply: z.unknown() }).strict().superRefine((value, context) => {
  try {
    for (const observation of [value.firstPause, value.constructorBefore, value.constructorAfter, value.stackReply]) {
      if (Buffer.byteLength(captureCurrentPcbStringClockReply(observation).text) > CURRENT_PCB_209_RATLINE_ORIGIN_OBSERVATION_BYTES) { throw new Error("Origin observation size"); }
    }
    if (Buffer.byteLength(JSON.stringify(value)) > CURRENT_PCB_209_RATLINE_ORIGIN_EVIDENCE_BYTES) { throw new Error("Origin evidence size"); }
  } catch { context.addIssue({ code: "custom", message: "Origin evidence exceeds its complete capture bounds." }); }
});
export type CurrentPcb209RatlineOriginEvidence = z.infer<typeof currentPcb209RatlineOriginEvidenceSchema>;
export function captureCurrentPcb209RatlineOriginEvidence(input: Readonly<{ metadata: z.infer<typeof metadata>; firstPause: unknown;
  constructorBefore: unknown; constructorAfter: unknown; stackReply: unknown }>): CurrentPcb209RatlineOriginEvidence {
  const value = { metadata: metadata.parse(captureCurrentPcbStringClockReply(input.metadata).value),
    firstPause: captureCurrentPcbStringClockReply(input.firstPause).value,
    constructorBefore: captureCurrentPcbStringClockReply(input.constructorBefore).value,
    constructorAfter: captureCurrentPcbStringClockReply(input.constructorAfter).value,
    stackReply: captureCurrentPcbStringClockReply(input.stackReply).value };
  return freezeDeep(currentPcb209RatlineOriginEvidenceSchema.parse(value));
}
export function currentPcb209RatlineObservedExternalId(evidence: CurrentPcb209RatlineOriginEvidence): Readonly<{ id: string; debuggerId: string }> | null {
  const observed = z.looseObject({ asyncStackTraceId: z.unknown().optional() }).safeParse(evidence.firstPause);
  if (!observed.success) { return null; } const parsed = externalId.safeParse(observed.data.asyncStackTraceId);
  return parsed.success && parsed.data.debuggerId === evidence.metadata.parentDebuggerId ? Object.freeze(parsed.data) : null;
}
export function inspectCurrentPcb209RatlineOriginEvidence(input: CurrentPcb209RatlineOriginEvidence): CurrentPcb209RatlineOriginSummary {
  const evidence = captureCurrentPcb209RatlineOriginEvidence(input); const observed = z.looseObject({ asyncStackTraceId: z.unknown().optional() }).safeParse(evidence.firstPause);
  const value = observed.success ? observed.data.asyncStackTraceId : undefined; const parsed = externalId.safeParse(value);
  const matched = parsed.success && parsed.data.debuggerId === evidence.metadata.parentDebuggerId, present = value !== undefined;
  let reason: typeof reasons[number] = "external-id-missing";
  if (!observed.success) { reason = "first-pause-unqualified"; }
  else if (present && !parsed.success) { reason = "external-id-unqualified"; }
  else if (parsed.success && !matched) { reason = "external-debugger-mismatch"; }
  else if (parsed.success && matched) {
    reason = evidence.stackReply === null ? "stack-lookup-unavailable" : classify({ parentDebuggerId: evidence.metadata.parentDebuggerId,
      first: { debuggerId: evidence.metadata.childDebuggerId, uniqueContextId: evidence.metadata.childUniqueContextId,
        scriptId: evidence.metadata.childScriptId, url: evidence.metadata.childUrl, pause: evidence.firstPause },
      constructor: { before: evidence.constructorBefore, after: evidence.constructorAfter,
        parentSessionId: evidence.metadata.parentSessionId, scriptId: evidence.metadata.parentScriptId } }, evidence.stackReply);
  }
  return freezeDeep(currentPcb209RatlineOriginSummarySchema.parse({ profile: "private.pcb209-ratline-origin-observation.v1", reason,
    externalIdObserved: present, parentDebuggerMatched: matched, stackLookupObserved: evidence.stackReply !== null,
    constructorLocationMatched: reason === "matched", nativeWorkerTargetIdentityVerified: false, executionAuthorized: false,
    evidenceSha256: sha256Json(evidence) }));
}

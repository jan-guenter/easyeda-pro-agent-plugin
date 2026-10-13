/** Fixed public schema/projection proposal. No runtime, registry, or native authority. */
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { exactData, parseClosedSymbolValidationRequest } from "./closed-symbol-validation-request.ts";
import type { ClosedSymbolValidationRequest } from "./closed-symbol-validation-request.ts";

const NEXT = "Inspect retained evidence. Do not repeat this request or any native phase.";
const MAX_RESPONSE_BYTES = 16_384;
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const documentUuid = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const projectUuid = z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u);

const targetInput = z.object({
  projectPath: z.string().min(1).max(2058).regex(/^(?:\/|[A-Za-z]:[\\/])[^\0\r\n]{1,2048}\.eprj2$/u),
  projectUuid, branchUuid: uuid, ownerUuid: uuid, symbolUuid: documentUuid, companionPcbUuid: documentUuid,
}).strict();
const metadataInput = z.object({ name: z.string().min(1).max(512), description: z.string().max(65_536) }).strict();
const requestInput = z.object({
  action: z.literal("run-disposable-once"), target: targetInput, metadata: metadataInput,
  confirmDisposableMetadataEdit: z.literal(true),
}).strict();
/** The SDK must receive this whole strict object, never its raw shape. */
export const closedSymbolDisposableInputSchema = z.object({ request: requestInput }).strict();

/** Required again in the actual callback, before reservation or any await. */
export function parseClosedSymbolDisposableInput(input: unknown): Readonly<{
  originalRequest: unknown; request: ClosedSymbolValidationRequest;
}> {
  const outer = exactData(input, ["request"]);
  const originalRequest = outer["request"];
  const request = parseClosedSymbolValidationRequest(originalRequest);
  if (request.metadata.name.trim().length === 0) { throw new Error("Disposable title is blank."); }
  return Object.freeze({ originalRequest, request });
}

const artifact = z.object({
  path: z.string().min(1).max(4096).startsWith("/").regex(/^[^\0\r\n]*$/u),
  bytes: z.number().int().min(1).max(131_072), sha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict();
const operationId = z.string().regex(/^easyeda-[a-z0-9-]{1,100}$/u);
const common = {
  profile: z.literal("easyeda-pro-control.closed-symbol-disposable-result.v1"),
  action: z.literal("run-disposable-once"), replayAllowed: z.literal(false),
  executionAuthorized: z.literal(false), saved: z.literal(false), reopened: z.literal(false),
};
const stopped = z.object({
  ...common, outcome: z.literal("stopped"),
  phase: z.enum(["request", "queue", "admission", "sql-runtime", "expectation", "construction", "claim", "coordinator", "terminal", "projection"]),
  reason: z.enum(["entry-already-used", "validation-stopped"]), operationId: operationId.nullable(),
  claimState: z.enum(["not-attempted", "publication-unknown", "acknowledged"]),
  claimArtifact: artifact.nullable(), terminalArtifact: artifact.nullable(),
  completionProved: z.literal(false), historicalCompletionRecorded: z.literal("not-checked"), nextSafeAction: z.literal(NEXT),
}).strict();
const completed = z.object({
  ...common, outcome: z.literal("completed"), operationId, headEligibility: z.enum(["locked", "aged-unlocked"]),
  claimState: z.literal("acknowledged"), claimArtifact: artifact, terminalArtifact: artifact,
  bodySha256: z.string().regex(/^[a-f0-9]{64}$/u), completionProved: z.literal(true),
  historicalCompletionRecorded: z.literal(true), explicitSavePerformed: z.literal(false), targetEditorOpened: z.literal(false),
}).strict();
const entryResult = z.discriminatedUnion("outcome", [stopped, completed]);
const entryObservation = z.discriminatedUnion("originalOutcome", [
  z.object({ originalOutcome: z.literal("completed"), operationId, claimState: z.literal("acknowledged"),
    claimArtifact: artifact, terminalArtifact: artifact, headEligibility: z.enum(["locked", "aged-unlocked"]),
    bodySha256: z.string().regex(/^[a-f0-9]{64}$/u),
  }).strict(),
  z.object({ originalOutcome: z.literal("stopped"), operationId: operationId.nullable(),
    claimState: z.enum(["not-attempted", "publication-unknown", "acknowledged"]),
    claimArtifact: artifact.nullable(), terminalArtifact: artifact.nullable(),
    originalPhase: stopped.shape.phase, originalReason: stopped.shape.reason,
  }).strict(),
]);

export type ClosedSymbolIndexPhase = "request" | "reservation" | "facade" | "entry-import" | "construction" | "entry" | "projection";
export type ClosedSymbolIndexReason = "invalid-request" | "attempt-unavailable" | "setup-refused" | "entry-boundary-refused" | "result-refused";
const indexRefusal = z.object({
  profile: z.literal("easyeda-pro-control.closed-symbol-disposable-index-refusal.v1"), action: z.literal("run-disposable-once"),
  outcome: z.literal("stopped"), phase: z.enum(["request", "reservation", "facade", "entry-import", "construction", "entry", "projection"]),
  reason: z.enum(["invalid-request", "attempt-unavailable", "setup-refused", "entry-boundary-refused", "result-refused"]),
  attemptReserved: z.boolean(), entryInvocationAttempted: z.boolean(), entryReturnObserved: z.boolean(),
  entryObservation: entryObservation.nullable(),
  replayAllowed: z.literal(false), executionAuthorized: z.literal(false), completionProved: z.literal(false),
  historicalCompletionRecorded: z.literal("not-checked"), nextSafeAction: z.literal(NEXT),
}).strict().refine(value => (!value.entryInvocationAttempted || value.attemptReserved) &&
  (!value.entryReturnObserved || value.entryInvocationAttempted) && (value.entryObservation === null || value.entryReturnObserved),
"Disposable index observation facts are inconsistent.");
const disposableResult = z.union([entryResult, indexRefusal]);
// The installed SDK normalizes output schemas to objects. Keep the exact union
// Beneath one strict object field instead of relying on an unsupported root union.
export const closedSymbolDisposableOutputSchema = z.object({ result: disposableResult }).strict();

/** Bound and inspect own data before schema parsing or JSON serialization. */
function boundedOwnData(input: unknown): unknown {
  let nodes = 0, textBytes = 0;
  const visited = new Set<object>();
  function text(value: string): void {
    if (value.length > MAX_RESPONSE_BYTES || !value.isWellFormed()) { throw new Error("Disposable response string refused."); }
    textBytes += Buffer.byteLength(value);
    if (textBytes > MAX_RESPONSE_BYTES) { throw new Error("Disposable response strings exceed their bound."); }
  }
  function visit(value: unknown, depth: number): void {
    nodes += 1;
    if (depth > 8 || nodes > 256) { throw new Error("Disposable response structure refused."); }
    if (typeof value === "string") { text(value); return; }
    if (value === null || typeof value === "boolean") { return; }
    if (typeof value === "number" && Number.isSafeInteger(value) && !Object.is(value, -0)) { return; }
    if (typeof value !== "object" || visited.has(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)) {
      throw new Error("Disposable response requires unaliased own data.");
    }
    visited.add(value);
    const keys = Reflect.ownKeys(value);
    if (keys.length > 32) { throw new Error("Disposable response object exceeds its field bound."); }
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (typeof key !== "string" || descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) {
        throw new Error("Disposable response accessors or hidden fields refused.");
      }
      text(key); visit(descriptor.value as unknown, depth + 1);
    }
  }
  visit(input, 0);
  return input;
}

/** Current SDK skips its output schema for isError:true; enforce both branches here. */
export function formatClosedSymbolDisposableResult(input: unknown): CallToolResult {
  const result = disposableResult.parse(boundedOwnData(input));
  const structuredContent = closedSymbolDisposableOutputSchema.parse({ result });
  const encoded = JSON.stringify(structuredContent), jsonBytes = Buffer.byteLength(encoded);
  if (jsonBytes > MAX_RESPONSE_BYTES) { throw new Error("Disposable response exceeds 16 KiB."); }
  const ok = result.outcome === "completed";
  return {
    isError: !ok,
    content: [{ type: "text", text: JSON.stringify({ ok, structuredContent: true, jsonBytes, sha256: sha256Text(encoded) }) }],
    structuredContent,
  };
}

/** Never forwards error messages, raw diagnostics, or a post-refusal completion claim. */
export function closedSymbolDisposableIndexRefusal(input: Readonly<{
  phase: ClosedSymbolIndexPhase; reason: ClosedSymbolIndexReason;
  attemptReserved: boolean; entryInvocationAttempted: boolean; entryReturnObserved: boolean; originalEntryResult?: unknown;
}>): CallToolResult {
  let observation: z.infer<typeof entryObservation> | null = null;
  if (input.entryReturnObserved) {
    try {
      const original = entryResult.parse(boundedOwnData(input.originalEntryResult));
      observation = original.outcome === "completed" ? {
        originalOutcome: "completed", operationId: original.operationId, claimState: original.claimState,
        claimArtifact: original.claimArtifact, terminalArtifact: original.terminalArtifact,
        headEligibility: original.headEligibility, bodySha256: original.bodySha256,
      } : {
        originalOutcome: "stopped", operationId: original.operationId, claimState: original.claimState,
        claimArtifact: original.claimArtifact, terminalArtifact: original.terminalArtifact,
        originalPhase: original.phase, originalReason: original.reason,
      };
    } catch {
      // An invalid return stays private; it cannot contribute public fields.
    }
  }
  const result = {
    profile: "easyeda-pro-control.closed-symbol-disposable-index-refusal.v1", action: "run-disposable-once",
    outcome: "stopped", phase: input.phase, reason: input.reason, attemptReserved: input.attemptReserved,
    entryInvocationAttempted: input.entryInvocationAttempted, entryReturnObserved: input.entryReturnObserved,
    entryObservation: observation, replayAllowed: false,
    executionAuthorized: false, completionProved: false, historicalCompletionRecorded: "not-checked", nextSafeAction: NEXT,
  };
  try { return formatClosedSymbolDisposableResult(result); }
  catch {
    // The wrapper overhead can exceed the bound even when the entry value fits.
    // Preserve the original privately; do not truncate descriptors or expand limits.
    return formatClosedSymbolDisposableResult({ ...result, entryObservation: null });
  }
}

/** Disposable-only copy contract. Parsing cannot issue ownership or write authority. */
import { z } from "zod";
import { currentSymbolMetadataPreparationRequestSchema } from "./current-symbol-metadata-preparation.ts";

export const CURRENT_SYMBOL_COPY_OPERATION_PURPOSE = "disposable-symbol-copy";
const operationId = z.string().min(8).max(96).regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);
const source = currentSymbolMetadataPreparationRequestSchema.shape.target.omit({ ownerUuid: true });

export const currentSymbolCopyOperationStepSchema = z.discriminatedUnion("expectedPhase", [
  z.object({ expectedPhase: z.literal("copy-write"), confirmWrite: z.literal(true), acceptSymbolCopy: z.literal(true), confirmDisposableProject: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["copy-close", "verification-close", "cleanup-close"]),
    confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["verification-start", "verification-open"]), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["copy-observe-termination", "verification-admit", "verification-caches",
    "verification-read", "verification-finish", "cleanup-observe-termination"]) }).strict(),
]);
export type CurrentSymbolCopyOperationStep = z.infer<typeof currentSymbolCopyOperationStepSchema>;
export type CurrentSymbolCopyOperationPhase = CurrentSymbolCopyOperationStep["expectedPhase"];

export const currentSymbolCopyOperationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("baseline-begin"), operationId, openingOperationId: operationId, source,
    confirmDisposableProject: z.literal(true), confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-observe-termination"), operationId }).strict(),
  z.object({ action: z.literal("baseline-prepare-clock"), operationId, acceptScratchProcessEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-relaunch"), operationId, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-admit"), operationId }).strict(),
  z.object({ action: z.literal("baseline-observe-caches"), operationId }).strict(),
  z.object({ action: z.literal("baseline-open-project"), operationId, acceptNormalOpenEffects: z.literal(true),
    acceptUnqualifiedSchematicStartupEffects: z.literal(true).optional() }).strict(),
  z.object({ action: z.literal("baseline-observe-clock"), operationId }).strict(),
  z.object({ action: z.literal("baseline-finish-close"), operationId, confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("baseline-observe-finish"), operationId }).strict(),
  z.object({ action: z.literal("baseline-inspect"), operationId }).strict(),
  z.object({ action: z.literal("copy-begin"), operationId, acceptSymbolCopy: z.literal(true), confirmDisposableProject: z.literal(true) }).strict(),
  z.object({ action: z.literal("copy-advance"), operationId, step: currentSymbolCopyOperationStepSchema }).strict(),
  z.object({ action: z.literal("copy-cleanup"), operationId, confirmAbort: z.literal(true) }).strict(),
  z.object({ action: z.literal("copy-inspect"), operationId }).strict(),
]).refine(value => value.action !== "baseline-begin" || value.operationId !== value.openingOperationId,
  "The copy baseline needs a distinct operation ID.");
export type CurrentSymbolCopyOperationRequest = z.infer<typeof currentSymbolCopyOperationRequestSchema>;
export function parseCurrentSymbolCopyOperationRequest(input: unknown): CurrentSymbolCopyOperationRequest {
  return currentSymbolCopyOperationRequestSchema.parse(input);
}
export const currentSymbolCopyOperationQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();

export function queryCurrentSymbolCopyOperation(input: unknown = {}): Record<string, unknown> {
  const query = currentSymbolCopyOperationQuerySchema.parse(input);
  return { offline: true, tool: "easyeda_control_disposable_symbol_copy", purpose: CURRENT_SYMBOL_COPY_OPERATION_PURPOSE,
    registrationEnabled: true, invocationEnabledByDiscovery: false, executionAuthorized: false, connectedValidation: false,
    forwardOnly: true, inverseSupported: false, replayAllowed: false, ordinaryProjectsSupported: false,
    actions: ["baseline-begin", "baseline-observe-termination", "baseline-prepare-clock", "baseline-relaunch", "baseline-admit",
      "baseline-observe-caches", "baseline-open-project", "baseline-observe-clock", "baseline-finish-close", "baseline-observe-finish",
      "baseline-inspect", "copy-begin", "copy-advance", "copy-cleanup", "copy-inspect"],
    limitations: [
      "Start with the existing easyeda_control_project_open disposable opening. Only that original retained disposable owner, sealed local path and checkpoint-member PCB can transfer into this separate copy baseline. There is no ordinary-project opening or replacement-runtime input here.",
      "Copy one supported project-local symbol into the same project and branch through the fixed native cloneData operation: renameKey true, keepSource false. The app chooses the destination UUID and collision-free title. No caller destination, title, metadata patch, executable code or callback is accepted.",
      "Complete original history, source metadata and raw canvas bytes must match the original managed checkpoint and closed SQL inventory. Initial scope supports one live PART and bounded self-contained PART/CANVAS/ATTR/ELLIPSE/PIN/RECT/ARC/CIRCLE/POLY/TEXT/BEZIER records, plus exact document-level ELE_PLACEHOLDER counters for supported numbered families. Counters preserve raw bodies and IDs, not part ownership. External resources, malformed/deleted/unsafe counters, unsupported records and unsafe native object-key IDs refuse.",
      "All active symbol titles must be printable ASCII. Default and Turkish/Azeri lowercase inventories must each be unique and agree at every rename collision; uppercase I is not accepted by assuming a locale. Non-ASCII, locale-dependent collisions, non-finite numeric suffixes and exhausted name searches refuse.",
      "Fresh startup, original backend/UI actors, dual clocks, the unchanged unlocked-head age gate, raw/cache saved-content budgets and complete SQL effect proof are required before execution. Schema acceptance and offline tests do not validate live execution.",
      "Opening and normal closure may migrate storage, restore state and automatically persist changes. Each effectful stage requires its own acknowledgement. An optional unqualified schematic-startup acceptance permits observation only; the later copy startup qualification remains mandatory.",
      "copy-begin retains the original ready generation. copy-advance requires the exact next phase. Lost responses never permit write, navigation or closure replay; only explicitly pending observations may repeat. Native return identity is retained before post-read checks, never rediscovered by title.",
      "Before copy-write, copy-cleanup permanently abandons the ready copy and selects cleanup-close without dispatching it. The next explicit cleanup-close/cleanup-observe-termination steps close the original baseline; the copy cannot then resume.",
      "Completion requires one acknowledged copy, retained normal process closure, complete closed SQL comparison, cache-excluded reopening, exact reopened destination content and unchanged source/peer SQL, final closure and complete SQL equality. Conservative baseline structure-byte preservation may reject legitimate changes from stale native structure; native tree projection is not claimed.",
      "Failures expose only retained original-owner cleanup and inspection. Saved journal JSON cannot restore continuation. No explicit Save, Save/Discard choice, forced exit, delete, inverse, restoration or generic lib_Symbol.copy enablement is provided. Current live validation is unclaimed.",
    ],
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentSymbolCopyOperationRequestSchema),
      stepSchema: z.toJSONSchema(currentSymbolCopyOperationStepSchema) } : {}) };
}
export function validateCurrentSymbolCopyOperationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentSymbolCopyOperationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, registrationEnabled: true, executionAuthorized: false } : {
    valid: false, registrationEnabled: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

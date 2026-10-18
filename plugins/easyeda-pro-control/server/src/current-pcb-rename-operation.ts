/** Disposable title-only contract. Parsing and discovery confer no authority. */
import { z } from "zod";
import { currentPcbRenameOwnerRequestSchema } from "./current-pcb-rename-owner.ts";

export const CURRENT_PCB_RENAME_OPERATION_PURPOSE = "disposable-pcb-rename";
const operationId = z.string().min(8).max(96).regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);
export const currentPcbRenameOperationStepSchema = z.discriminatedUnion("expectedPhase", [
  z.object({ expectedPhase: z.literal("rename-write"), confirmWrite: z.literal(true), acceptPcbRename: z.literal(true), confirmDisposableProject: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["baseline-close", "rename-close", "verification-close", "cleanup-close"]),
    confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["baseline-relaunch", "verification-start", "verification-open"]), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.literal("baseline-open-project"), acceptNormalOpenEffects: z.literal(true),
    acceptUnqualifiedSchematicStartupEffects: z.literal(true).optional() }).strict(),
  z.object({ expectedPhase: z.literal("baseline-prepare-clock"), acceptScratchProcessEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["baseline-observe-termination", "baseline-admit", "baseline-observe-caches", "baseline-observe-clock",
    "rename-observe-termination", "verification-admit", "verification-caches", "verification-read", "verification-finish",
    "cleanup-capture", "cleanup-observe-termination", "cleanup-retire-closed"]) }).strict(),
]);
export type CurrentPcbRenameOperationStep = z.infer<typeof currentPcbRenameOperationStepSchema>;
export type CurrentPcbRenameOperationPhase = CurrentPcbRenameOperationStep["expectedPhase"];
export const currentPcbRenameOperationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("baseline-begin"), operationId, openingOperationId: operationId,
    target: currentPcbRenameOwnerRequestSchema.shape.target, desiredTitle: currentPcbRenameOwnerRequestSchema.shape.desiredTitle,
    confirmDisposableProject: z.literal(true), acceptPcbRename: z.literal(true) }).strict(),
  z.object({ action: z.literal("advance"), operationId, step: currentPcbRenameOperationStepSchema }).strict(),
  z.object({ action: z.literal("cleanup"), operationId, confirmAbort: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId }).strict(),
]).refine(value => value.action !== "baseline-begin" || value.operationId !== value.openingOperationId,
  "The PCB baseline needs a distinct operation ID.");
export type CurrentPcbRenameOperationRequest = z.infer<typeof currentPcbRenameOperationRequestSchema>;
export const currentPcbRenameOperationQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryCurrentPcbRenameOperation(input: unknown = {}): Record<string, unknown> {
  const query = currentPcbRenameOperationQuerySchema.parse(input);
  return { offline: true, tool: "easyeda_control_disposable_pcb_rename", purpose: CURRENT_PCB_RENAME_OPERATION_PURPOSE,
    registrationEnabled: true, invocationEnabledByDiscovery: false, executionAuthorized: false, connectedValidation: false,
    historicalConnectedValidation: "installed121700-read-only-preflight-only", ordinaryProjectsSupported: false,
    forwardOnly: true, inverseSupported: false, replayAllowed: false, explicitSaveDispatched: false,
    actions: ["baseline-begin", "advance", "cleanup", "inspect"],
    limitations: [
      "Begin only from this facade's retained disposable easyeda_control_project_open opening. The sealed local path and checkpoint-member PCB cannot be replaced. No ordinary project, replacement runtime, supplied clock, executable code or verifier is accepted.",
      "Rename exactly one project-local PCB display title with the pinned project-qualified PCB updateData path. Linked PCB/reuse propagation, drawing edits, schema repair and generic dmt_Pcb.modifyPcbName enablement are excluded. Supported titles are trimmed printable ASCII without capital I; native locale-dependent collisions refuse.",
      "Initial normal closure captures the complete raw SQL/native baseline. Record the original ordinary launch's termination with easyeda_control_launch observe-termination before baseline-relaunch. Merely seeing no process or reading saved JSON cannot replace that original record.",
      "Replacement launch, inactive caches, project-only opening, settled startup holders, inactive supplier/standardization panels, both actors and original backend/document clocks must qualify. Settled AST holders are not proof of complete canvas/source equality. Closed SQL comparisons provide saved-data evidence.",
      "The aged unlocked-head clock reference runs only once while the original baseline remains closed. baseline-observe-clock retains one startup/metadata sample and renderer clock. No supplied observations can manufacture authority.",
      "Every advance names and acknowledges the exact next phase. Lost responses never permit navigation, write, close or scratch-process replay. Normal observation polls repeat only when explicitly pending; separately offered cleanup phases can continue from partial retained evidence without replaying consumed work. Inspection reports retained originals; journals do not restore continuation after a facade restart.",
      "Opening and normal closure may migrate or automatically persist files. The fixed write makes one title update and awaits its native response; that response alone is not saved completion. No explicit Save, Save/Discard choice, force exit, delete, inverse or restoration is dispatched.",
      "Completion requires the native acknowledgment, original process/Job closure, exact title-only full SQL effect, cache-excluded fresh reopening, matching PCB metadata and all PCB peers, final normal closure and complete SQL equality. Native reopened verification is metadata-only, not a complete PCB canvas read.",
      "Cleanup permanently abandons continuation and selects only a retained original-owner close/termination/closed-retirement phase. Uncertain ownership or consumed unacknowledged actions remain stopped; no recovery bypass is provided.",
      "The installed121700 read-only preflight passed on one disposable project with unchanged raw bytes, all35 SQL tables and all20 native documents after normal closure. This does not validate the new rename writer or other project histories.",
    ], ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcbRenameOperationRequestSchema),
      stepSchema: z.toJSONSchema(currentPcbRenameOperationStepSchema) } : {}) };
}
export function validateCurrentPcbRenameOperationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcbRenameOperationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, registrationEnabled: true, executionAuthorized: false } : {
    valid: false, registrationEnabled: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

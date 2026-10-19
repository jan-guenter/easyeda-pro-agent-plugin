/** Disposable title-only contract. Parsing and discovery confer no authority. */
import { z } from "zod";
import { currentSchematicRenameOwnerRequestSchema } from "./current-schematic-rename-owner.ts";

export const CURRENT_SCHEMATIC_RENAME_OPERATION_PURPOSE = "disposable-schematic-rename";
const operationId = z.string().min(8).max(96).regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);
export const currentSchematicRenameOperationStepSchema = z.discriminatedUnion("expectedPhase", [
  z.object({ expectedPhase: z.literal("rename-write"), confirmWrite: z.literal(true), acceptSchematicRename: z.literal(true), confirmDisposableProject: z.literal(true) }).strict(),
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
export type CurrentSchematicRenameOperationStep = z.infer<typeof currentSchematicRenameOperationStepSchema>;
export type CurrentSchematicRenameOperationPhase = CurrentSchematicRenameOperationStep["expectedPhase"];
export const currentSchematicRenameOperationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("baseline-begin"), operationId, openingOperationId: operationId,
    target: currentSchematicRenameOwnerRequestSchema.shape.target, desiredTitle: currentSchematicRenameOwnerRequestSchema.shape.desiredTitle,
    confirmDisposableProject: z.literal(true), acceptSchematicRename: z.literal(true) }).strict(),
  z.object({ action: z.literal("advance"), operationId, step: currentSchematicRenameOperationStepSchema }).strict(),
  z.object({ action: z.literal("cleanup"), operationId, confirmAbort: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId }).strict(),
]).refine(value => value.action !== "baseline-begin" || value.operationId !== value.openingOperationId,
  "The SCHEMATIC baseline needs a distinct operation ID.");
export type CurrentSchematicRenameOperationRequest = z.infer<typeof currentSchematicRenameOperationRequestSchema>;
export const currentSchematicRenameOperationQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryCurrentSchematicRenameOperation(input: unknown = {}): Record<string, unknown> {
  const query = currentSchematicRenameOperationQuerySchema.parse(input);
  return { offline: true, tool: "easyeda_control_disposable_schematic_rename", purpose: CURRENT_SCHEMATIC_RENAME_OPERATION_PURPOSE,
    registrationEnabled: true, invocationEnabledByDiscovery: false, executionAuthorized: false, connectedValidation: false,
    historicalConnectedValidation: "not-recorded", ordinaryProjectsSupported: false,
    forwardOnly: true, inverseSupported: false, replayAllowed: false, explicitSaveDispatched: false,
    actions: ["baseline-begin", "advance", "cleanup", "inspect"],
    limitations: [
      "Begin only from this facade's retained disposable easyeda_control_project_open opening. That opener's selected PCB binds the project path; a separate existing SCH container and its owner must match the complete closed SQL baseline. No ordinary project, replacement runtime, supplied clock, executable code or verifier is accepted.",
      "Rename exactly one ordinary project-local schematic container with the pinned project-qualified schematic updateData path. Child sheets, all other containers and every unrelated SQL cell must remain unchanged. Imported/reuse/block-symbol branches, child reparenting, child-derived container clocks and generic dmt_Schematic.modifySchematicName enablement are excluded. Titles are trimmed printable ASCII without capital I; case-only renames and collisions refuse. The original normalized name must be unique for the saved absence query.",
      "Initial normal closure captures the complete raw SQL/native baseline. Record the original ordinary launch's termination with easyeda_control_launch observe-termination before baseline-relaunch. Merely seeing no process or reading saved JSON cannot replace that original record.",
      "Replacement launch, inactive caches, project-only opening, settled startup holders, inactive supplier/standardization panels, both actors and original backend/document clocks must qualify. Settled AST holders are not proof of complete canvas/source equality. Closed SQL comparisons provide saved-data evidence.",
      "The aged unlocked-head clock reference runs only once while the original baseline remains closed. baseline-observe-clock retains one startup/metadata sample and renderer clock. No supplied observations can manufacture authority.",
      "Every advance names and acknowledges the exact next phase. Lost responses never permit navigation, write, close or scratch-process replay. Normal observation polls repeat only when explicitly pending; separately offered cleanup phases can continue from partial retained evidence without replaying consumed work. Inspection reports retained originals; journals do not restore continuation after a facade restart.",
      "Opening and normal closure may migrate or automatically persist files. The fixed write makes one title update and awaits its native response; that response alone is not saved completion. No explicit Save, Save/Discard choice, force exit, delete, inverse or restoration is dispatched.",
      "Completion requires the native acknowledgment, original process/Job closure, exact title-only full SQL effect, cache-excluded fresh reopening, matching container metadata, all schematic peers and the complete child roster with both AST memberships and order, then final normal closure and complete SQL equality. Native reopened verification is metadata/roster-only, not a sheet canvas or connectivity read.",
      "Cleanup permanently abandons continuation and selects only a retained original-owner close/termination/closed-retirement phase. Uncertain ownership or consumed unacknowledged actions remain stopped; no recovery bypass is provided.",
      "The delayed schematic subscriber need not have run before normal closure. Original root exit plus an empty retained Job ends the reviewed contained producers; the subsequent exact stored effect decides whether they persisted the intended result. Subscriber completion itself remains unproved. A missing effect or unexpected actor fails without another mutation or Save.",
      "No connected schematic rename lifecycle has been recorded. Synthetic control-flow and SQL tests do not establish live execution, ordinary-project safety or saved canvas/connectivity coverage.",
    ], ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentSchematicRenameOperationRequestSchema),
      stepSchema: z.toJSONSchema(currentSchematicRenameOperationStepSchema) } : {}) };
}
export function validateCurrentSchematicRenameOperationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentSchematicRenameOperationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, registrationEnabled: true, executionAuthorized: false } : {
    valid: false, registrationEnabled: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** Ordinary SCH-container title route. Parsing never supplies a retained owner. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { currentSchematicRenameOwnerRequestSchema } from "./current-schematic-rename-owner.ts";
import { CURRENT_SCHEMATIC_RENAME_NEXT_PHASES } from "./current-schematic-rename-operation.ts";

export const CURRENT_SCHEMATIC_OPERATION_PURPOSE = "ordinary-schematic-rename";
const operationId = z.string().min(8).max(96).regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);
export const currentSchematicOperationIntentSchema = currentSchematicRenameOwnerRequestSchema.omit({ operationId: true });
export const currentSchematicOperationStepSchema = z.discriminatedUnion("expectedPhase", [
  z.object({ expectedPhase: z.literal("rename-write"), confirmWrite: z.literal(true), acceptSchematicRename: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["baseline-close", "rename-close", "verification-close", "cleanup-close"]),
    confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["baseline-relaunch", "verification-start", "verification-open", "baseline-open-project"]),
    acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.literal("baseline-prepare-clock"), acceptScratchProcessEffects: z.literal(true) }).strict(),
  z.object({ expectedPhase: z.enum(["baseline-observe-termination", "baseline-admit", "baseline-observe-caches", "baseline-observe-clock",
    "rename-observe-termination", "verification-admit", "verification-caches", "verification-read", "verification-finish",
    "cleanup-capture", "cleanup-observe-termination", "cleanup-retire-closed"]) }).strict(),
]);
export type CurrentSchematicOperationStep = z.infer<typeof currentSchematicOperationStepSchema>;
const batchSteps = z.array(currentSchematicOperationStepSchema).min(2).max(4).refine(steps => steps.every((step, index) => {
  if (step.expectedPhase.startsWith("cleanup-")) { return false; }
  const previous = steps[index - 1];
  return previous === undefined || previous.expectedPhase !== "baseline-prepare-clock" &&
    CURRENT_SCHEMATIC_RENAME_NEXT_PHASES[previous.expectedPhase] === step.expectedPhase;
}), "A batch needs adjacent forward phases and cannot cross the original-launch termination record or include cleanup.");
export const currentSchematicOperationOpeningRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("open"), operationId, ...currentDisposableOpenTargetSchema.shape,
    rename: currentSchematicOperationIntentSchema, acceptNormalOpenEffects: z.literal(true),
    // Preserve old sealed opening journals without injecting an acknowledgment into new requests.
    confirmDisposableProject: z.literal(true).optional() }).strict(),
  z.object({ action: z.literal("observe"), operationId }).strict(),
  z.object({ action: z.literal("inspect-opening"), operationId }).strict(),
  z.object({ action: z.literal("request-normal-close"), operationId, confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("retire-after-termination"), operationId, confirmRetire: z.literal(true), acceptUnknownFileEffects: z.literal(true) }).strict(),
]).refine(value => value.action !== "open" || currentDisposableOpenTargetSchema.safeParse({ rawWindowsPath: value.rawWindowsPath,
  projectUuid: value.projectUuid, documentUuid: value.documentUuid, expectedSourceSha256: value.expectedSourceSha256 }).success &&
  value.rename.target.projectUuid === value.projectUuid, "Opening path and rename project must identify the same project.");
export type CurrentSchematicOperationOpeningRequest = z.infer<typeof currentSchematicOperationOpeningRequestSchema>;
export const currentSchematicOperationLifecycleRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("baseline-begin"), operationId, openingOperationId: operationId,
    target: currentSchematicOperationIntentSchema.shape.target, desiredTitle: currentSchematicOperationIntentSchema.shape.desiredTitle,
    acceptSchematicRename: z.literal(true) }).strict(),
  z.object({ action: z.literal("advance"), operationId, step: currentSchematicOperationStepSchema }).strict(),
  z.object({ action: z.literal("advance-batch"), operationId, steps: batchSteps }).strict(),
  z.object({ action: z.literal("cleanup"), operationId, confirmAbort: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId }).strict(),
]).refine(value => value.action !== "baseline-begin" || value.operationId !== value.openingOperationId,
  "The SCH baseline needs a distinct operation ID.");
export type CurrentSchematicOperationLifecycleRequest = z.infer<typeof currentSchematicOperationLifecycleRequestSchema>;
export const currentSchematicOperationRequestSchema = z.union([currentSchematicOperationOpeningRequestSchema, currentSchematicOperationLifecycleRequestSchema]);
export const currentSchematicOperationQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryCurrentSchematicOperation(input: unknown = {}): Record<string, unknown> {
  const query = currentSchematicOperationQuerySchema.parse(input);
  return { offline: true, tool: "easyeda_control_project_schematic_rename", purpose: CURRENT_SCHEMATIC_OPERATION_PURPOSE,
    registrationEnabled: true, invocationEnabledByDiscovery: false, executionAuthorized: false, connectedValidation: false,
    historicalConnectedValidation: "installed203733-ordinary-schematic-title-only-lifecycle",
    ordinaryProjectsSupported: true, validationOnly: false, forwardOnly: true, inverseSupported: false, replayAllowed: false, explicitSaveDispatched: false,
    limitations: [
      "One ordinary local SCH-container title in an already registered project, its default branch and an existing PCB opening target. The open request seals the exact rename target/title and supported startup, metadata and complete child projections from the managed pre-navigation checkpoint. A changed baseline refuses before writing. Legacy confirmDisposableProject:true is optional for old opening journals; omission stays omitted and false is rejected. The separate disposable route keeps its required confirmations and scope.",
      "Original ordinary purpose is retained through opening, baseline, clock, one write, closed full SQL comparison, fresh cache-excluded metadata/peer/child-roster verification and final closed SQL equality. Disposable/symbol owners and journal copies cannot supply continuation.",
      "No unqualified schematic startup acknowledgment is accepted. Imported/reuse/block-symbol containers, reparented children, unsupported histories/names and ambiguous order refuse. Live startup, both AST holders, actors, clocks and inactive panels remain mandatory.",
      "Opening and normal closure may persist or migrate data. There is no explicit Save, Save/Discard choice, force close, inverse or restoration. Lost replies consume the original step; inspect instead of replaying. Batch steps are explicit, adjacent and bounded to two through four, stopping on failure or a pending observation.",
      "Installed203733 passed this ordinary-purpose title-only lifecycle on a disposable fixture, including bounded batching, complete closed SQL effect, cache-excluded fresh metadata/peer/child-roster and both AST readback, final normal closure and complete SQL equality. That historical result does not admit another payload, project history or invocation. Saved validation covers metadata/child roster and complete SQL preservation, not a canvas or connectivity read.",
    ], ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentSchematicOperationRequestSchema) } : {}) };
}
export function validateCurrentSchematicOperationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentSchematicOperationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, registrationEnabled: true, executionAuthorized: false } : {
    valid: false, registrationEnabled: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

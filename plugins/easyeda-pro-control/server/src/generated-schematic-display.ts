import { z } from "zod";
import { schematicTextDisplayPatchSchema } from "./schematic-layout-schema.ts";

export const GENERATED_SCHEMATIC_DISPLAY_PURPOSE = "schematic-display-write209";
export const GENERATED_SCHEMATIC_DISPLAY_PROFILE = "generated-schematic-display209-v1";
export const GENERATED_SCHEMATIC_DISPLAY_STAGES = ["capture", "preflight", "modify", "observe", "save"] as const;
export const generatedSchematicDisplayOperationIdSchema = z.string().min(20).max(80).regex(/^sch209-display-[a-z0-9][a-z0-9-]*$/u);
export const generatedSchematicDisplayPatchSchema = schematicTextDisplayPatchSchema.refine(patch => Object.entries(patch).every(([field, value]) => {
  if (typeof value === "number" && (Object.is(value, -0) || Math.abs(value) > 1_000_000 || field === "fontSize" && value > 1000)) { return false; }
  if (typeof value === "string" && (value.length > 64 || !value.isWellFormed() || /[\r\n\t]/u.test(value))) { return false; }
  return field !== "rotation" || value === null || typeof value === "number" && [0, 90, 180, 270].includes(value);
}), "Generated display patch exceeds the fixed literal field bounds.");
export type GeneratedSchematicDisplayPatch = z.infer<typeof generatedSchematicDisplayPatchSchema>;
const operationId = generatedSchematicDisplayOperationIdSchema;
export const generatedSchematicDisplayRequestSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("prepare"), operationId, patch: generatedSchematicDisplayPatchSchema }),
  z.strictObject({ action: z.literal("execute"), operationId, confirmDisposableDisplayTransaction: z.literal(true), confirmOneSave: z.literal(true),
    confirmForwardOnly: z.literal(true), acceptNormalOpenEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("abort"), operationId, confirmOriginalJobOnly: z.literal(true) }),
  z.strictObject({ action: z.enum(["inspect", "observe-termination", "capture-closed", "qualify-closed", "release", "settle-publication"]), operationId }),
]);
export type GeneratedSchematicDisplayRequest = z.infer<typeof generatedSchematicDisplayRequestSchema>;
export function validateGeneratedSchematicDisplayArguments(input: unknown): Record<string, unknown> {
  const parsed = generatedSchematicDisplayRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : { valid: false, executionAuthorized: false,
    issues: parsed.error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) };
}

export const generatedSchematicDisplayStageResultSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.generated-schematic-display-stage.v1"), stage: z.enum(GENERATED_SCHEMATIC_DISPLAY_STAGES), ok: z.boolean(),
  dispatchAttempted: z.boolean(), originalPromiseSettled: z.boolean(), modifyAttempted: z.boolean(), modifyAcknowledged: z.boolean(),
  saveAttempted: z.boolean(), saveAcknowledged: z.boolean(), savePromiseSettled: z.boolean(), source: z.string().max(16_384).nullable(),
  windowTabId: z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/u), originalContextIntact: z.boolean(),
  connectivityVerified: z.literal(false), sourceVersionAliased: z.literal(false), workerCompletionVerified: z.literal(false),
  structureCompletionVerified: z.literal(false), persistenceVerified: z.literal(false), inverseAvailable: z.literal(false),
}).refine(value => (!value.modifyAcknowledged || value.modifyAttempted) && (!value.saveAttempted || value.modifyAcknowledged) &&
  (!value.savePromiseSettled || value.saveAttempted) && (!value.saveAcknowledged || value.saveAttempted && value.savePromiseSettled) &&
  (!value.originalPromiseSettled || value.dispatchAttempted) && (!value.ok || value.stage !== "capture" && value.originalContextIntact && value.source !== null) &&
  (!value.ok || value.stage !== "modify" || value.modifyAcknowledged && value.dispatchAttempted && value.originalPromiseSettled) &&
  (!value.ok || value.stage !== "save" || value.saveAcknowledged && value.dispatchAttempted && value.originalPromiseSettled) &&
  (!value.ok || !["preflight", "observe"].includes(value.stage) || !value.dispatchAttempted && !value.originalPromiseSettled),
"Display stage fields do not describe one coherent original attempt.");
export type GeneratedSchematicDisplayStageResult = z.infer<typeof generatedSchematicDisplayStageResultSchema>;

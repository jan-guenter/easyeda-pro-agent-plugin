/** Separate original-main diagnostic purpose. No project navigation or writer. */
import { z } from "zod";

export const CURRENT_FOOTPRINT_MAIN_OPERATION_PREFIX = "footprint-main-";
export const currentFootprintMainIdSchema = z.string().max(80).regex(/^footprint-main-[a-z0-9][a-z0-9_-]*(?![\s\S])/u);
const operationId = currentFootprintMainIdSchema;
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const bound = { operationId, expectedBindingSha256: digest };
export const currentFootprintMainLifecycleRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId, confirmValidationOnly: z.literal(true),
    confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true), acceptDebuggerPauseEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId }).strict(),
  ...(["settle-records", "cleanup-unlaunched", "cleanup-no-process"] as const).map(action =>
    z.object({ action: z.literal(action), operationId, expectedIntentSha256: digest }).strict()),
  ...(["observe-termination", "release-closed"] as const).map(action => z.object({ action: z.literal(action), ...bound }).strict()),
]);
export const currentFootprintMainValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentFootprintMainLifecycleRequestSchema.options,
  z.object({ action: z.literal("observe-main-construction"), ...bound }).strict(),
  z.object({ action: z.literal("terminate-main"), ...bound, confirmTerminateOriginalDiagnosticJob: z.literal(true) }).strict(),
]);
export type CurrentFootprintMainValidationRequest = z.infer<typeof currentFootprintMainValidationRequestSchema>;
export function queryCurrentFootprintMain(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "footprint-main", toolWrapperAction: "footprint-main", validationOnly: true,
    connectedValidation: false, executionAuthorized: false, saveAuthorized: false,
    actions: currentFootprintMainValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a distinct footprint-main-* original owner. Existing renderer, worker or preparation owners cannot be upgraded or adopted.",
      "The original application starts paused for its owned main inspector. The helper owns stderr and the connection, checks the retained root and Job and reciprocal kernel TCP endpoints. A published URL alone does not establish ownership or exclusive debugging.",
      "Observe-main-construction is consumed once. It qualifies the original runtime app.js and captures original protocol registration owners without invoking a backend request or opening a project.",
      "Construction capture does not prove a future request context, project SQL service, actor, native document-clock result, responder exclusivity or copy/delete completion. No writer, project opening or explicit Save is exposed.",
      "Existing-profile startup can use the network and restore or automatically persist files. Debugger pauses alter timing and may precede window creation.",
      "Terminate-main requests termination only of this retained diagnostic Job, requires explicit confirmation and is consumed once. The request is separate from observed original-root exit and empty Job. Release only after those observations; inspection and historical JSON cannot recreate handles.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintMainValidationRequestSchema) } : {}) };
}
export function validateCurrentFootprintMainArguments(input: unknown): Record<string, unknown> {
  const parsed = currentFootprintMainValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

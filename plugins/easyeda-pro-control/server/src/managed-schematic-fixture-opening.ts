import { z } from "zod";

export const GENERATED_SCHEMATIC_OPEN_PROFILE = "generated-schematic-open209-v1";
export const GENERATED_SCHEMATIC_OPEN_PHASE = "generated-schematic-open";
export const generatedSchematicOpeningIdSchema = z.string().min(20).max(80).regex(/^sch209-generated-[a-z0-9][a-z0-9-]*$/u);
const cleanup = { operationId: generatedSchematicOpeningIdSchema, cleanupNonce: z.string().min(32).max(512) };
export const generatedSchematicOpeningRequestSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("open-generated-schematic"), operationId: generatedSchematicOpeningIdSchema,
    confirmGeneratedDisposableFixture: z.literal(true), acceptRecentPathRegistration: z.literal(true), acceptNormalOpenEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-text-wire-bus"), operationId: generatedSchematicOpeningIdSchema, confirmGeneratedReadOnly: z.literal(true) }),
  z.strictObject({ action: z.literal("inspect"), operationId: generatedSchematicOpeningIdSchema }),
  z.strictObject({ action: z.literal("settle-records"), operationId: generatedSchematicOpeningIdSchema }),
  z.strictObject({ action: z.literal("release-owner"), operationId: generatedSchematicOpeningIdSchema, confirmReleaseGeneratedSchematicOwner: z.literal(true) }),
  z.strictObject({ action: z.literal("request-cleanup-close"), ...cleanup, confirmNormalClose: z.literal(true), acceptUnknownFileEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-cleanup-termination"), ...cleanup }),
  z.strictObject({ action: z.literal("finish-cleanup"), ...cleanup }),
  z.strictObject({ action: z.literal("settle-cleanup-records"), ...cleanup }),
]);
export type GeneratedSchematicOpeningRequest = z.infer<typeof generatedSchematicOpeningRequestSchema>;
export const generatedSchematicTargetSchema = z.strictObject({ rawWindowsPath: z.string().min(32).max(1024),
  projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  schematicUuid: z.string().regex(/^[a-f0-9]{32}$/u), pageUuid: z.string().regex(/^[a-f0-9]{32}$/u), expectedSourceSha256: z.string().regex(/^[a-f0-9]{64}$/u),
});
export function queryGeneratedSchematicOpening(input: unknown = {}): Record<string, unknown> {
  const query = z.strictObject({ includeSchemas: z.boolean().default(false) }).parse(input);
  return { offline: true, tool: "easyeda_control_pcb209_opening", wrapperAction: "generated-schematic", profile: GENERATED_SCHEMATIC_OPEN_PROFILE,
    originalStagedSourceRequired: true, freshOriginalOrdinaryRuntimeRequired: true, callerTargetAccepted: false,
    executionAuthorized: false, saveAuthorized: false, connectedValidation: "not-recorded",
    limitations: ["Consumes one original schematic data token in this same facade and a different fresh original ordinary runtime. No caller path, target, document ID, code or historical owner is accepted.",
      "Registers only the exact original generated path, opens its project and then its real SCH_PAGE once. Native startup/opening/closure may persist shared state and the generated file. One recent-path row may change; no explicit Save or CAD writer is admitted.",
      "The opening receipt and independent page/parent readiness sample are separate. Immediate readiness refusal never retries navigation. A separately requested one-shot Text/Wire/Bus batch uses the existing guarded synchronous native readers with derived identities.",
      "Original tracked journal, Promise, process tree and HMAC custody remain through normal close, root/empty Job observation and cleanup. Local settlement publishes only retained exact bytes. Native source membership, connectivity and persistent effects stay unproved."],
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(generatedSchematicOpeningRequestSchema) } : {}) };
}
export function validateGeneratedSchematicOpeningArguments(input: unknown): Record<string, unknown> {
  const parsed = generatedSchematicOpeningRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : { valid: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

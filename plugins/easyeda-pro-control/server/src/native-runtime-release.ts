import { z } from "zod";

const family = z.enum(["project-opening", "pcb-rename", "schematic-rename", "symbol-metadata", "symbol-copy"]);
const operationId = z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);
export const nativeRuntimeReleaseRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("release-completed"), kind: family, operationId,
    confirmReleaseOriginalRuntime: z.literal(true) }).strict(),
  z.object({ action: z.literal("settle-release-records"), kind: family, operationId }).strict(),
]);
export type NativeRuntimeReleaseRequest = z.infer<typeof nativeRuntimeReleaseRequestSchema>;

const artifact = z.object({ path: z.string().min(1).max(8192), sha256: z.string().regex(/^[a-f0-9]{64}$/u),
  bytes: z.number().int().positive().max(16_384) }).strict();
const originalDisposal = z.object({
  profile: z.literal("easyeda-pro-control.original-terminal-runtime-disposal.v1"),
  operationId, family, intentArtifact: artifact, releaseArtifact: artifact,
  helperReleaseAcknowledged: z.literal(true), indexAllocationReleased: z.literal(true),
  executionAuthorized: z.literal(false), replayAllowed: z.literal(false),
}).strict();
export const nativeRuntimeReleaseResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.native-runtime-release-result.v1"),
  requestedOperationId: operationId, kind: family, disposal: originalDisposal,
}).strict().refine(result => result.kind === result.disposal.family, "Native release result families must match.");

/** This is schema discovery only. JSON cannot recover a retained workflow owner. */
export function queryNativeRuntimeRelease(includeSchemas = false): Record<string, unknown> {
  return { tool: "easyeda_control_native_release", actions: ["release-completed", "settle-release-records"],
    families: family.options, originalOwnerRequired: true, originalLatestRootAndEmptyJobRequired: true,
    completedWorkflowRequired: true, nativeCloseOrTerminationOffered: false, historicalAdoption: false,
    executionAuthorized: false, replayAllowed: false,
    ...(includeSchemas ? { requestSchema: z.toJSONSchema(nativeRuntimeReleaseRequestSchema),
      resultSchema: z.toJSONSchema(nativeRuntimeReleaseResultSchema) } : {}) };
}

/** Validate before any owner lookup, release reservation or native operation. */
export function validateNativeRuntimeReleaseArguments(input: unknown): Record<string, unknown> {
  const parsed = nativeRuntimeReleaseRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.join("."), message: issue.message.slice(0, 512) })),
  };
}

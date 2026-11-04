import { z } from "zod";
import { currentDisposableOpenRequestSchema } from "./current-disposable-open.ts";
import { currentPcbRenameOperationRequestSchema } from "./current-pcb-rename-operation.ts";
import { currentSchematicRenameOperationRequestSchema } from "./current-schematic-rename-operation.ts";
import { currentSymbolBaselineRequestSchema } from "./current-symbol-baseline-runtime.ts";

const family = z.enum(["project-opening", "pcb-rename", "schematic-rename", "symbol-metadata", "symbol-copy"]);
/** Keep cleanup IDs on each producer's grammar without admitting another
 * family's broader baseline keys before the original-owner lookup.
 */
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve each literal family and strict nested action schema without widening the discriminated union.
function requestsForFamily<Family extends z.infer<typeof family>>(kind: Family, operationId: z.ZodString) {
  return z.discriminatedUnion("action", [
    z.object({ action: z.literal("release-completed"), kind: z.literal(kind), operationId,
      confirmReleaseOriginalRuntime: z.literal(true) }).strict(),
    z.object({ action: z.literal("settle-release-records"), kind: z.literal(kind), operationId }).strict(),
  ]);
}
const openingOperationId = currentDisposableOpenRequestSchema.options[0].shape.operationId;
const pcbOperationId = currentPcbRenameOperationRequestSchema.options[0].shape.operationId;
const schematicOperationId = currentSchematicRenameOperationRequestSchema.options[0].shape.operationId;
const symbolOperationId = currentSymbolBaselineRequestSchema.shape.operationId;
export const nativeRuntimeReleaseRequestSchema = z.discriminatedUnion("kind", [
  requestsForFamily("project-opening", openingOperationId),
  requestsForFamily("pcb-rename", pcbOperationId),
  requestsForFamily("schematic-rename", schematicOperationId),
  requestsForFamily("symbol-metadata", symbolOperationId),
  requestsForFamily("symbol-copy", symbolOperationId),
]);
export type NativeRuntimeReleaseRequest = z.infer<typeof nativeRuntimeReleaseRequestSchema>;

const artifact = z.object({ path: z.string().min(1).max(8192), sha256: z.string().regex(/^[a-f0-9]{64}$/u),
  bytes: z.number().int().positive().max(16_384) }).strict();
const originalDisposal = z.object({
  profile: z.literal("easyeda-pro-control.original-terminal-runtime-disposal.v1"),
  intentArtifact: artifact, releaseArtifact: artifact,
  helperReleaseAcknowledged: z.literal(true), indexAllocationReleased: z.literal(true),
  executionAuthorized: z.literal(false), replayAllowed: z.literal(false),
}).strict();
/** Preserve the issued receipt's final ID, which may be the metadata inverse's
 * derived key rather than the requested forward baseline key.
 */
// oxlint-disable-next-line typescript/explicit-function-return-type -- Preserve matching literal outer/receipt families and the strict receipt shape in the inferred schema.
function resultForFamily<Family extends z.infer<typeof family>>(kind: Family, operationId: z.ZodString) {
  return z.object({
    schema: z.literal("easyeda-pro-control.native-runtime-release-result.v1"),
    requestedOperationId: operationId, kind: z.literal(kind),
    disposal: originalDisposal.extend({ operationId, family: z.literal(kind) }),
  }).strict();
}
export const nativeRuntimeReleaseResultSchema = z.discriminatedUnion("kind", [
  resultForFamily("project-opening", openingOperationId),
  resultForFamily("pcb-rename", pcbOperationId),
  resultForFamily("schematic-rename", schematicOperationId),
  resultForFamily("symbol-metadata", symbolOperationId),
  resultForFamily("symbol-copy", symbolOperationId),
]);

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

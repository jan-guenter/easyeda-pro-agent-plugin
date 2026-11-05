/** Separate original-owner disposable spatial-reader grammar. No writer or Save. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { CURRENT_PCB_209_SPATIAL_MAX_BYTES, currentPcb209SpatialQuerySchema,
  currentPcb209SpatialResultSchema } from "./current-pcb-209-spatial-read.ts";
import type { CurrentPcb209SpatialQuery } from "./current-pcb-209-spatial-read.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_SPATIAL_OPERATION_PREFIX = "pcb209-spatial-";
export const CURRENT_PCB_SPATIAL_MAX_QUERIES = 16;
export const CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES = CURRENT_PCB_209_SPATIAL_MAX_BYTES * CURRENT_PCB_SPATIAL_MAX_QUERIES + 16_384;
export const currentPcbSpatialIdSchema = z.string().max(80).regex(/^pcb209-spatial-[a-z0-9][a-z0-9_-]*$/u);
export const currentPcbSpatialQueriesSchema = z.array(currentPcb209SpatialQuerySchema).min(1).max(CURRENT_PCB_SPATIAL_MAX_QUERIES);
const digest = z.string().regex(/^[a-f\d]{64}$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const bound = { operationId: currentPcbSpatialIdSchema, expectedBindingSha256: digest };
export const currentPcbSpatialRequestSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("launch"), operationId: currentPcbSpatialIdSchema,
    confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("inspect"), operationId: currentPcbSpatialIdSchema,
    observation: z.enum(["browser", "frames", "script", "pcb-opening", "spatial209"]).optional() }),
  z.strictObject({ action: z.literal("settle-records"), operationId: currentPcbSpatialIdSchema, expectedIntentSha256: digest }),
  z.strictObject({ action: z.literal("cleanup-unlaunched"), operationId: currentPcbSpatialIdSchema, expectedIntentSha256: digest }),
  z.strictObject({ action: z.literal("cleanup-no-process"), operationId: currentPcbSpatialIdSchema, expectedIntentSha256: digest }),
  z.strictObject({ action: z.literal("browser-observation"), ...bound }),
  z.strictObject({ action: z.literal("inspect-frames"), ...bound, targetId: token }),
  z.strictObject({ action: z.literal("inspect-script"), ...bound, frameId: token, family: z.literal("ui") }),
  z.strictObject({ action: z.literal("open-project"), ...bound, target: currentDisposableOpenTargetSchema,
    confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("open-pcb"), ...bound, acceptNormalOpenEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-pcb-opening"), ...bound }),
  z.strictObject({ action: z.literal("observe-spatial"), ...bound, queries: currentPcbSpatialQueriesSchema,
    acceptNativeScratchEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-window"), ...bound }),
  z.strictObject({ action: z.literal("normal-close"), ...bound, hwnd: z.string().regex(/^[1-9]\d{0,18}$/u), confirmNormalClose: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-termination"), ...bound }),
  z.strictObject({ action: z.literal("release-closed"), ...bound }),
]);
export type CurrentPcbSpatialRequest = z.infer<typeof currentPcbSpatialRequestSchema>;
export const currentPcbSpatialObservationSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-spatial-observation.v1"),
  results: z.array(currentPcb209SpatialResultSchema).min(1).max(CURRENT_PCB_SPATIAL_MAX_QUERIES),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => value.results.every(row => Buffer.byteLength(canonicalJson(row)) <= CURRENT_PCB_209_SPATIAL_MAX_BYTES) &&
  Buffer.byteLength(canonicalJson(value)) <= CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES);

/** A stored result remains data. The original lifecycle independently binds
 * its exact target and ordered request before dispatch and publication.
 */
export function requireCurrentPcbSpatialObservation(input: unknown, target: CurrentDisposableOpenSealedTarget,
  queries: readonly CurrentPcb209SpatialQuery[]): void {
  const result = currentPcbSpatialObservationSchema.parse(input);
  if (result.results.length !== queries.length || result.results.some((row, index) => row.documentUuid !== target.documentUuid ||
      canonicalJson(row.query) !== canonicalJson(queries[index]))) { throw new Error("PCB_SPATIAL_OBSERVATION_BINDING"); }
}
export function currentPcbSpatialObservation(input: unknown): Readonly<z.infer<typeof currentPcbSpatialObservationSchema>> {
  return freezeDeep(currentPcbSpatialObservationSchema.parse({ schema: "easyeda-pro-control.pcb209-spatial-observation.v1",
    results: input, executionAuthorized: false, saveAuthorized: false }));
}

export function queryCurrentPcbSpatial(input: unknown = {}): Record<string, unknown> {
  const request = z.strictObject({ includeSchemas: z.boolean().default(false) }).parse(input);
  return { offline: true, tool: "easyeda_control_pcb209_opening", wrapperAction: "spatial", validationOnly: true,
    connectedValidation: false, executionAuthorized: false, designExecutionAuthorized: false, saveAuthorized: false,
    actions: currentPcbSpatialRequestSchema.options.map(option => option.shape.action.value), maximumQueries: CURRENT_PCB_SPATIAL_MAX_QUERIES,
    limitations: [
      "Launch a separate pcb209-spatial-* original owner. Existing opening, visual, worker and model owners cannot upgrade into it.",
      "Only one ordered batch of 1-16 strict Via queries is admitted after the original disposable project/PCB opening and source qualification. Native hit ordering and each query are preserved; source membership and persistence remain unproved.",
      "observe-spatial requires acceptNativeScratchEffects:true for the exact documented native math scratch effects. No selection, geometry writer, explicit Save or production scope is enabled.",
      "Fixed application callees require full original source descriptions, script locations and same-reference rechecks before each native sample. Standard ECMAScript intrinsics in the admitted renderer are assumed, not identity-verified; this route is not a hostile-page JavaScript sandbox. Unsupported replacement hooks and source/state changes refuse.",
      "Large batches return a bounded journal summary. The complete original ordered result remains in the referenced record rather than exceeding the response envelope.",
      "Opening can restore tabs, migrate, replay caches and automatically persist files. Missing replies consume their original stages; record settlement never replays dispatch. Keep the original owner through normal closure, observed root/Job exit and acknowledged release.",
    ], ...(request.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcbSpatialRequestSchema) } : {}) };
}
export function validateCurrentPcbSpatialArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcbSpatialRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false, saveAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false, saveAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** Separate original-owner disposable spatial-reader grammar. No writer or Save. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { CURRENT_PCB_209_SPATIAL_MAX_BYTES, currentPcb209SpatialQuerySchema,
  currentPcb209SpatialResultSchema } from "./current-pcb-209-spatial-read.ts";
import type { CurrentPcb209SpatialQuery } from "./current-pcb-209-spatial-read.ts";
import { currentPcb209SpatialTrackQueriesSchema, currentPcb209SpatialTrackResultSchema } from "./current-pcb-209-spatial-track-read.ts";
import { currentPcb209SpatialArcQueriesSchema, currentPcb209SpatialArcResultSchema } from "./current-pcb-209-spatial-arc-read.ts";
import { currentPcb209SpatialPadQueriesSchema, currentPcb209SpatialPadResultSchema } from "./current-pcb-209-spatial-pad-read.ts";
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
  z.strictObject({ action: z.literal("open-generated-fixture"), ...bound, confirmGeneratedDisposableFixture: z.literal(true),
    acceptRecentPathRegistration: z.literal(true), acceptNormalOpenEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("open-pcb"), ...bound, acceptNormalOpenEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("capture-generated-closed"), ...bound, confirmReadClosedFixture: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-pcb-opening"), ...bound }),
  z.strictObject({ action: z.literal("observe-spatial"), ...bound, queries: currentPcbSpatialQueriesSchema,
    acceptNativeScratchEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-spatial-lines"), ...bound, queries: currentPcb209SpatialTrackQueriesSchema,
    acceptNativeScratchEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-spatial-arcs"), ...bound, queries: currentPcb209SpatialArcQueriesSchema,
    acceptNativeScratchEffects: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-spatial-pads"), ...bound, queries: currentPcb209SpatialPadQueriesSchema,
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
export const currentPcbSpatialTrackObservationSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-spatial-line-via-observation.v1"),
  results: z.array(currentPcb209SpatialTrackResultSchema).min(1).max(15),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => value.results.every(row => Buffer.byteLength(canonicalJson(row)) <= CURRENT_PCB_209_SPATIAL_MAX_BYTES) &&
  Buffer.byteLength(canonicalJson(value)) <= CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES);
export const currentPcbSpatialArcObservationSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-spatial-arc-line-via-observation.v1"),
  results: z.array(currentPcb209SpatialArcResultSchema).min(1).max(6),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => value.results.every(row => Buffer.byteLength(canonicalJson(row)) <= CURRENT_PCB_209_SPATIAL_MAX_BYTES) &&
  Buffer.byteLength(canonicalJson(value)) <= CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES);
export const currentPcbSpatialPadObservationSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.pcb209-spatial-pad-point-observation.v1"),
  results: z.array(currentPcb209SpatialPadResultSchema).min(1).max(16), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => value.results.every(row => Buffer.byteLength(canonicalJson(row)) <= CURRENT_PCB_209_SPATIAL_MAX_BYTES) &&
  Buffer.byteLength(canonicalJson(value)) <= CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES);
/** A new point-only schema cannot be reinterpreted as an older family result. */
export function currentPcbSpatialPadObservation(input: unknown): Readonly<z.infer<typeof currentPcbSpatialPadObservationSchema>> {
  return freezeDeep(currentPcbSpatialPadObservationSchema.parse({ schema: "easyeda-pro-control.pcb209-spatial-pad-point-observation.v1", results: input, executionAuthorized: false, saveAuthorized: false }));
}
export function requireCurrentPcbSpatialPadObservation(input: unknown, target: CurrentDisposableOpenSealedTarget, queries: readonly CurrentPcb209SpatialQuery[]): void {
  const result = currentPcbSpatialPadObservationSchema.parse(input);
  if (result.results.length !== queries.length || result.results.some((row, index) => row.documentUuid !== target.documentUuid || canonicalJson(row.query) !== canonicalJson(queries[index]))) { throw new Error("PCB_SPATIAL_PAD_OBSERVATION_BINDING"); }
}

/** A stored result remains data. The original lifecycle independently binds
 * its exact target and ordered request before dispatch and publication.
 */
export function requireCurrentPcbSpatialObservation(input: unknown, target: CurrentDisposableOpenSealedTarget,
  queries: readonly CurrentPcb209SpatialQuery[]): void {
  const result = currentPcbSpatialObservationSchema.parse(input);
  if (result.results.length !== queries.length || result.results.some((row, index) => row.documentUuid !== target.documentUuid ||
      canonicalJson(row.query) !== canonicalJson(queries[index]))) { throw new Error("PCB_SPATIAL_OBSERVATION_BINDING"); }
}
/** Bound and freeze the ordered batch for retention. Target/query custody is
 * Checked separately against the original lifecycle's consumed intent. */
export function currentPcbSpatialObservation(input: unknown): Readonly<z.infer<typeof currentPcbSpatialObservationSchema>> {
  return freezeDeep(currentPcbSpatialObservationSchema.parse({ schema: "easyeda-pro-control.pcb209-spatial-observation.v1",
    results: input, executionAuthorized: false, saveAuthorized: false }));
}
/** Preserve the new mixed-family schema rather than widening released results. */
export function currentPcbSpatialTrackObservation(input: unknown): Readonly<z.infer<typeof currentPcbSpatialTrackObservationSchema>> {
  return freezeDeep(currentPcbSpatialTrackObservationSchema.parse({ schema: "easyeda-pro-control.pcb209-spatial-line-via-observation.v1",
    results: input, executionAuthorized: false, saveAuthorized: false }));
}
/** Preserve the third geometry contract with its own schema and six-query cap. */
export function currentPcbSpatialArcObservation(input: unknown): Readonly<z.infer<typeof currentPcbSpatialArcObservationSchema>> {
  return freezeDeep(currentPcbSpatialArcObservationSchema.parse({ schema: "easyeda-pro-control.pcb209-spatial-arc-line-via-observation.v1",
    results: input, executionAuthorized: false, saveAuthorized: false }));
}
/** Compare a complete Arc/Line/Via batch to its original target and requests. */
export function requireCurrentPcbSpatialArcObservation(input: unknown, target: CurrentDisposableOpenSealedTarget,
  queries: readonly CurrentPcb209SpatialQuery[]): void {
  const result = currentPcbSpatialArcObservationSchema.parse(input);
  if (result.results.length !== queries.length || result.results.some((row, index) => row.documentUuid !== target.documentUuid ||
      canonicalJson(row.query) !== canonicalJson(queries[index]))) { throw new Error("PCB_SPATIAL_ARC_OBSERVATION_BINDING"); }
}
/** Bind every mixed query and document to the original consumed batch. */
export function requireCurrentPcbSpatialTrackObservation(input: unknown, target: CurrentDisposableOpenSealedTarget,
  queries: readonly CurrentPcb209SpatialQuery[]): void {
  const result = currentPcbSpatialTrackObservationSchema.parse(input);
  if (result.results.length !== queries.length || result.results.some((row, index) => row.documentUuid !== target.documentUuid ||
      canonicalJson(row.query) !== canonicalJson(queries[index]))) { throw new Error("PCB_SPATIAL_TRACK_OBSERVATION_BINDING"); }
}

/** Describe the spatial wrapper, strict grammar and evidence limits offline.
 * Schema discovery allocates no owner and authorizes no native request. */
export function queryCurrentPcbSpatial(input: unknown = {}): Record<string, unknown> {
  const request = z.strictObject({ includeSchemas: z.boolean().default(false) }).parse(input);
  return { offline: true, tool: "easyeda_control_pcb209_opening", wrapperAction: "spatial", validationOnly: true,
    connectedValidation: false, executionAuthorized: false, designExecutionAuthorized: false, saveAuthorized: false,
    actions: currentPcbSpatialRequestSchema.options.map(option => option.shape.action.value), maximumQueries: CURRENT_PCB_SPATIAL_MAX_QUERIES,
    limitations: [
      "Launch a separate pcb209-spatial-* original owner. Existing opening, visual, worker and model owners cannot upgrade into it.",
      "Only one ordered batch of 1-16 strict Via queries is admitted after the original disposable project/PCB opening and source qualification. Native hit ordering and each query are preserved; source membership and persistence remain unproved.",
      "The alternative observe-spatial-lines consumes that same batch slot for1-15 queries on ready standalone Line/Track and Via scenes. It qualifies256 original callees and keeps the384-ID transport ceiling, including original group release. Other object families and region border crossings refuse before native hit; connected mixed-family validation is pending.",
      "observe-spatial-arcs is a third mutually exclusive batch for1-6 queries over ordinary circular ArcTrack (SDK Arc), Track (SDK Line) and Via scenes. It qualifies265 original callees within the same384 IDs. Copper1/2, unlocked ready standalone models and no region border crossings remain required. Graphical native Arc and other families remain unsupported. Frozen4500 passed one six-query generated Arc/Line/Via case with exact results, complete closed raw/SQL/history invariance and original helper/facade cleanup; later payloads and separate variants need their own admission.",
      "observe-spatial-pads is a separate mutually exclusive batch of1-16 points on a standalone circular SMT Pad-only scene. Its215 original callees and group release fit344 of384 IDs. Only ready rotation-zero copper1/2 Mi/tE Pads without a parent or smart Pad are admitted. Component/Via/Line/Arc/Text, polygon or placed Pads, and every region request refuse before hits. Component point prefilter needs the exact Ji footprint cache, yqe/Ae transform chain and iE._modify scratch effect; region additionally needs Gs. Frozen4500 accepted five generated-Pad points and complete closed raw/SQL/history invariance. Its published Pad capture exposed an old report-schema defect that blocked original helper release before dispatch. That missing cleanup acknowledgment remains unknown; neither this partial historical case nor the source correction admits another runtime or writer.",
      "observe-spatial requires acceptNativeScratchEffects:true for the exact documented native math scratch effects. No selection, geometry writer, explicit Save or production scope is enabled.",
      "Fixed application callees require full original source descriptions, script locations and same-reference rechecks before each native sample. Standard ECMAScript intrinsics in the admitted renderer are assumed, not identity-verified; this route is not a hostile-page JavaScript sandbox. Unsupported replacement hooks and source/state changes refuse.",
      "Large batches return a bounded journal summary. The complete original ordered result remains in the referenced record rather than exceeding the response envelope.",
      "A generated-fixture owner can capture exact closed bytes, complete SQL and raw history once after original root/Job termination and before helper release. Capture retains qualification failures and grants no new opening, persistence or writer authority.",
      "Opening can restore tabs, migrate, replay caches and automatically persist files. Missing replies consume their original stages; record settlement never replays dispatch. Keep the original owner through normal closure, observed root/Job exit and acknowledged release.",
    ], ...(request.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcbSpatialRequestSchema) } : {}) };
}
/** Return bounded argument diagnostics without allocating or dispatching work.
 * Both valid and invalid responses retain false execution and Save authority. */
export function validateCurrentPcbSpatialArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcbSpatialRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false, saveAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false, saveAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

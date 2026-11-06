/** Strict new purpose; only an original issued generated Component target. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES, currentPcbSpatialRequestSchema } from "./current-pcb-spatial-validation.ts";
import { currentPcb209ComponentPointQueriesSchema, currentPcb209ComponentPointResultSchema } from "./current-pcb-209-component-point-read.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { CurrentPcb209SpatialQuery } from "./current-pcb-209-spatial-read.ts";

export const currentPcbComponentSpatialIdSchema = z.string().max(80).regex(/^pcb209-spatial-component-[a-z0-9][a-z0-9_-]*$/u);
const commonActions = new Set(["launch", "inspect", "settle-records", "cleanup-unlaunched", "cleanup-no-process", "browser-observation", "inspect-frames", "inspect-script", "open-generated-fixture", "open-pcb", "observe-pcb-opening", "observe-window", "normal-close", "observe-termination", "release-closed"]);
const observe = z.strictObject({ action: z.literal("observe-components"), operationId: currentPcbComponentSpatialIdSchema,
  expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u), queries: currentPcb209ComponentPointQueriesSchema, acceptNativeScratchEffects: z.literal(true) });
const abort = z.strictObject({ action: z.literal("abort-component"), operationId: currentPcbComponentSpatialIdSchema,
  expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u), confirmAbortOriginalComponentJob: z.literal(true) });
export const currentPcbComponentSpatialRequestSchema = z.discriminatedUnion("action", [observe, abort, ...currentPcbSpatialRequestSchema.options.filter(option => commonActions.has(option.shape.action.value))])
  .refine(value => currentPcbComponentSpatialIdSchema.safeParse(value.operationId).success && commonActions.has(value.action) || value.action === "observe-components" || value.action === "abort-component");
export type CurrentPcbComponentSpatialRequest = z.infer<typeof currentPcbComponentSpatialRequestSchema>;
export const currentPcbComponentSpatialObservationSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.pcb209-component-point-observation.v1"),
  results: z.array(currentPcb209ComponentPointResultSchema).min(1).max(16), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).refine(value => Buffer.byteLength(canonicalJson(value)) <= CURRENT_PCB_SPATIAL_RESULT_MAX_BYTES);
export function currentPcbComponentSpatialObservation(input: unknown): Readonly<z.infer<typeof currentPcbComponentSpatialObservationSchema>> {
  return freezeDeep(currentPcbComponentSpatialObservationSchema.parse({ schema: "easyeda-pro-control.pcb209-component-point-observation.v1", results: input, executionAuthorized: false, saveAuthorized: false }));
}
export function requireCurrentPcbComponentSpatialObservation(input: unknown, target: CurrentDisposableOpenSealedTarget, queries: readonly CurrentPcb209SpatialQuery[]): void {
  const value = currentPcbComponentSpatialObservationSchema.parse(input);
  if (value.results.length !== queries.length || value.results.some((row, index) => row.documentUuid !== target.documentUuid || canonicalJson(row.query) !== canonicalJson(queries[index]))) { throw new Error("COMPONENT_OBSERVATION_BINDING"); }
}
export function queryCurrentPcbComponentSpatial(): Record<string, unknown> {
  return { offline: true, wrapperAction: "component-spatial", requestSchema: z.toJSONSchema(currentPcbComponentSpatialRequestSchema), requestLimit: 419,
    maximumPoints: 16, connectedValidation: false, executionAuthorized: false, saveAuthorized: false,
    limitations: ["Fresh original Component-only birth consumes this facade's staged genuine component-circular-smt-pad data; no caller target or old owner upgrade.", "Exact top/origin/rotation-zero Component, retained original footprint cache, circular SMT owned Pad and two hidden indexed attributes only. All other families and regions refuse before hits.", "One ordered point batch, original source/callee/parent/index reproof and group release; no selection or writer. Source membership and persistence remain unproved.", "Normal opening may update caches or persist files. Cleanup retains original normal close/root and empty Job/helper release; no replay, Save or historical owner adoption. A separately confirmed once-only abort signals only the original retained Job, followed by independent termination and helper release."] };
}

/** Argument diagnostics only; parsing never issues a generated target or owner. */
export function validateCurrentPcbComponentSpatialArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcbComponentSpatialRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false, saveAuthorized: false } : {
    valid: false, executionAuthorized: false, saveAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

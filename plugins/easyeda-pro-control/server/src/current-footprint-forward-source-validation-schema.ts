/** Strict disposable v2 source-validation discovery. Importing this grammar
 * allocates no controller, helper, native owner or execution capability. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET, currentFootprintForwardExecutionOpeningIdSchema,
  currentFootprintForwardExecutionOpeningRequestSchema, currentFootprintForwardExecutionOpeningResultSchema } from "./current-footprint-forward-execution-opening-contract.ts";
import { diagnosticLifecycleBindingSchema } from "./current-pcb-diagnostic-binding-schema.ts";

const operation = { operationId: currentFootprintForwardExecutionOpeningIdSchema };
const digest = z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
const bound = { ...operation, expectedBindingSha256: digest };
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$(?![\s\S])/u);
const hwnd = z.string().regex(/^[1-9]\d{0,18}$(?![\s\S])/u);
export const currentFootprintForwardSourceValidationRequestSchema = z.discriminatedUnion("action", [
  currentFootprintForwardExecutionOpeningRequestSchema.extend({ action: z.literal("launch"),
    confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true) }),
  ...(["observe-main", "observe-browser", "capture-source", "observe-window", "observe-termination", "release-closed", "observe-release"] as const)
    .map(action => z.object({ action: z.literal(action), ...bound }).strict()),
  z.object({ action: z.literal("inspect-frames"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("inspect-ui"), ...bound, frameId: token }).strict(),
  z.object({ action: z.literal("normal-close"), ...bound, hwnd }).strict(),
  z.object({ action: z.literal("abort-generation"), ...bound, confirmAbortOriginalForwardJob: z.literal(true) }).strict(),
  ...(["inspect", "settle-records", "cleanup-before-launch", "cleanup-no-process"] as const)
    .map(action => z.object({ action: z.literal(action), ...operation }).strict()),
]);
export type CurrentFootprintForwardSourceValidationRequest = z.infer<typeof currentFootprintForwardSourceValidationRequestSchema>;
export const currentFootprintForwardSourceValidationInspectionSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-source-validation-inspection.v1"),
  operationId: currentFootprintForwardExecutionOpeningIdSchema.nullable(),
  state: z.enum(["new", "launched", "main", "browser", "frames", "ui-source", "sealed"]),
  busy: z.boolean(), cleanupBusy: z.boolean(), failed: z.boolean(), publicationPending: z.boolean(),
  publicationSettlementAvailable: z.boolean(), intentSha256: digest.nullable(),
  binding: diagnosticLifecycleBindingSchema.nullable(), bindingSha256: digest.nullable(), originalBindingRetained: z.boolean(),
  launchAcknowledged: z.boolean(), helperClosed: z.boolean(), terminationObserved: z.boolean(),
  releaseAttempted: z.boolean(), releaseObserved: z.boolean(), windowAttempted: z.boolean(), hwnd: hwnd.nullable(),
  windowOutcome: z.enum(["not-attempted", "pending", "returned", "unknown"]), windowFailureRetained: z.boolean(),
  source: currentFootprintForwardExecutionOpeningResultSchema.nullable(),
  opening: z.record(z.string(), z.unknown()).nullable(), channel: z.record(z.string(), z.unknown()).nullable(),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();

/** Describe the separate source-only route without allocating a helper or
 * interpreting schema data as current source, native or writer admission. */
export function queryCurrentFootprintForwardSourceValidation(includeSchemas = false): Readonly<Record<string, unknown>> {
  return { profile: "easyeda-pro-control.footprint-forward-source-validation.v1", tool: "easyeda_control_pcb209_worker_startup",
    wrapperAction: "footprint-forward-source-validation", operationPrefix: "footprint-forward-execution-", validationOnly: true,
    executionReady: false, executionAuthorized: false, saveAuthorized: false, wholeWriterReserved: false, routeAndClocksQualified: false,
    actions: currentFootprintForwardSourceValidationRequestSchema.options.map(option => option.shape.action.value),
    journal: CURRENT_FOOTPRINT_FORWARD_EXECUTION_OPENING_BUDGET,
    notes: ["A fresh disposable v2 birth retains its original main/browser/frame/UI, constructor capture, complete checkpoint/SQL and source seal. No existing v1 owner is upgraded.",
      "Launch/open may restore tabs, migrate, contact services and automatically persist files or shared profile settings. Requested source validation is not profile isolation.",
      "Capture-source is consumed once. Inspect and settle original records after uncertainty; no navigation, collector or source replay is allowed.",
      "Observe-window is consumed once and normal-close accepts only that exact original HWND. Confirmed abort-generation targets only the original v2 Job despite the historical Forward confirmation name.",
      "Original root/whole-Job termination and acknowledged helper release remain separate. Timeout, result JSON, physical absence or another facade cannot reconstruct ownership.",
      "No route/clock qualification, head/lock/frontier eligibility, execution capability, create, write, explicit Save, normal closed baseline or saved/reopened result is supplied."],
    ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentFootprintForwardSourceValidationRequestSchema),
      resultSchemas: { source: z.toJSONSchema(currentFootprintForwardExecutionOpeningResultSchema), inspection: z.toJSONSchema(currentFootprintForwardSourceValidationInspectionSchema) } } : {}) };
}
/** Exact offline validation performs no project read, journal publication,
 * process allocation or native admission. */
export function validateCurrentFootprintForwardSourceValidationArguments(input: unknown): Readonly<Record<string, unknown>> {
  const parsed = currentFootprintForwardSourceValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false, saveAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false, saveAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

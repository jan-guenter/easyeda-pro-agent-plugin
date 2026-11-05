/** Ordinary-project read owner. Its launch namespace and journal schemas stay
 * separate from disposable validation, visual effects and writer lifecycles. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { queryCurrentPcb209Opening } from "./current-pcb-209-opening-validation.ts";
import { currentPcb209SelectionRelationsComponentIdsSchema } from "./current-pcb-209-selection-relations.ts";
import { currentPcb209ObservationQuerySchema, currentPcb209ObservationQueryStageSchema } from "./current-pcb-209-observation-query.ts";

export const CURRENT_PCB_ORDINARY_READ_PREFIX = "pcb209-ordinary-";
export const currentPcbOrdinaryReadIdSchema = z.string().max(80).regex(/^pcb209-ordinary-[a-z0-9][a-z0-9_-]*$/u);
const operationId = currentPcbOrdinaryReadIdSchema;
const digest = z.string().regex(/^[a-f\d]{64}$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const bound = { operationId, expectedBindingSha256: digest };
export const currentPcbOrdinaryReadRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId, confirmOrdinaryReadOnly: z.literal(true),
    confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId, observation: z.enum(["browser", "frames", "script", "pcb-opening", "layers209", "primitives209", "extended-primitives209", "selection-relations209", "pad-shapes209", "image-shapes209", "arc-shapes209", "poured-shapes209"]).optional() }).strict(),
  z.object({ action: z.literal("query-observation"), operationId, observation: currentPcb209ObservationQueryStageSchema,
    expectedResultRecordSha256: digest, query: currentPcb209ObservationQuerySchema }).strict(),
  z.object({ action: z.literal("settle-records"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-unlaunched"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-no-process"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("browser-observation"), ...bound }).strict(),
  z.object({ action: z.literal("observe-pcb-opening"), ...bound }).strict(),
  z.object({ action: z.literal("observe-layers"), ...bound }).strict(),
  z.object({ action: z.literal("observe-primitives"), ...bound }).strict(),
  z.object({ action: z.literal("observe-extended-primitives"), ...bound }).strict(),
  z.object({ action: z.literal("observe-pad-shapes"), ...bound }).strict(),
  z.object({ action: z.literal("observe-image-shapes"), ...bound }).strict(),
  z.object({ action: z.literal("observe-arc-shapes"), ...bound }).strict(),
  z.object({ action: z.literal("observe-poured-shapes"), ...bound }).strict(),
  z.object({ action: z.literal("observe-selection-relations"), ...bound,
    componentIds: currentPcb209SelectionRelationsComponentIdsSchema.default([]) }).strict(),
  z.object({ action: z.literal("observe-window"), ...bound }).strict(),
  z.object({ action: z.literal("observe-termination"), ...bound }).strict(),
  z.object({ action: z.literal("release-closed"), ...bound }).strict(),
  z.object({ action: z.literal("inspect-frames"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("inspect-script"), ...bound, frameId: token, family: z.literal("ui") }).strict(),
  z.object({ action: z.literal("open-project"), ...bound, target: currentDisposableOpenTargetSchema,
    confirmOrdinaryProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("open-pcb"), ...bound, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("normal-close"), ...bound, hwnd: z.string().regex(/^[1-9]\d{0,18}$/u), confirmNormalClose: z.literal(true) }).strict(),
]);
export type CurrentPcbOrdinaryReadRequest = z.infer<typeof currentPcbOrdinaryReadRequestSchema>;

export function queryCurrentPcbOrdinaryRead(input: unknown = {}): Record<string, unknown> {
  const request = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  const inherited = queryCurrentPcb209Opening();
  return { offline: true, tool: "easyeda_control_pcb209_opening", wrapperAction: "ordinary",
    profile: "easyeda-pro-control.pcb209-ordinary-read-owner.v1", application: inherited["application"],
    validationOnly: false, ordinaryProjectReadOnly: true, connectedValidation: false,
    executionAuthorized: false, saveAuthorized: false, persistenceVerified: false,
    actions: currentPcbOrdinaryReadRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "One ordinary registered local project and one existing PCB, bound to an exact pre-open checkpoint, default branch and original native owner. Use pcb209-ordinary-* IDs. This does not admit a disposable writer, visual, spatial, compiler or worker purpose.",
      "Launch and normal public project/document opening can restore tabs, migrate files, replay caches, contact services, change shared settings and automatically persist or Save. Explicit existing-profile and normal-open effect confirmations are mandatory. Read-only describes the offered observations, not a zero-write promise for opening or normal closure.",
      "All eight fixed209 layer, object, selection and shape reader predicates, bounds and transport budgets are unchanged. Complete source, connectivity, physical stackup, assets, render freshness and saved membership remain unproved. There is no CAD edit, explicit Save, prompt choice, settings or arbitrary native-command action.",
      "Keep this original launch alive through one-shot project opening, PCB opening, source qualification, observations, normal close, separately observed original root/Job termination, helper release and receipt settlement. Lost replies consume their stages; historical JSON cannot recreate ownership or permit replay.",
      "Schematic page navigation and Text/Wire/Bus canvas readers are not exposed by this PCB owner. They require a separately qualified type-1 frame and current native implementation, rather than reuse of symbol/container metadata or older schematic pins.",
    ], ...(request.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcbOrdinaryReadRequestSchema) } : {}) };
}

export function validateCurrentPcbOrdinaryReadArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcbOrdinaryReadRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, ordinaryProjectReadOnly: true, executionAuthorized: false } : {
    valid: false, ordinaryProjectReadOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** Fixed disposable String baseline contract. No writer, Save or purpose knob. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";

export const CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX = "string-precreate-";
export const currentPcbStringPrecreateIdSchema = z.string().max(80).regex(/^string-precreate-[a-z0-9][a-z0-9_-]*$/u);
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const operationId = currentPcbStringPrecreateIdSchema;
const bound = { operationId, expectedBindingSha256: digest };
export const currentPcbStringPrecreateStages = ["browser", "frames", "script", "pcb-opening", "workers", "worker-script", "common-baseline", "string-precreate"] as const;
export const currentPcbStringPrecreateRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId, confirmValidationOnly: z.literal(true),
    confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId, observation: z.enum(currentPcbStringPrecreateStages).optional() }).strict(),
  z.object({ action: z.literal("settle-records"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-unlaunched"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-no-process"), operationId, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("browser-observation"), ...bound }).strict(),
  z.object({ action: z.literal("inspect-frames"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("inspect-script"), ...bound, frameId: token, family: z.literal("ui") }).strict(),
  z.object({ action: z.literal("open-project"), ...bound, target: currentDisposableOpenTargetSchema,
    confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("open-pcb"), ...bound, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe-pcb-opening"), ...bound }).strict(),
  z.object({ action: z.literal("inspect-workers"), ...bound }).strict(),
  z.object({ action: z.literal("inspect-worker-script"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("observe-common-baseline"), ...bound }).strict(),
  z.object({ action: z.literal("observe-string-precreate"), ...bound }).strict(),
  z.object({ action: z.literal("observe-window"), ...bound }).strict(),
  z.object({ action: z.literal("normal-close"), ...bound, hwnd: z.string().regex(/^[1-9]\d{0,18}$/u), confirmNormalClose: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe-termination"), ...bound }).strict(),
  z.object({ action: z.literal("release-closed"), ...bound }).strict(),
]);
export type CurrentPcbStringPrecreateRequest = z.infer<typeof currentPcbStringPrecreateRequestSchema>;
export const currentPcbStringPrecreateQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryCurrentPcbStringPrecreate(input: unknown = {}): Record<string, unknown> {
  const query = currentPcbStringPrecreateQuerySchema.parse(input);
  return { offline: true, tool: "easyeda_control_pcb_string_precreate_validation", registrationEnabled: true,
    validationOnly: true, invocationEnabledByDiscovery: false, connectedValidation: false,
    executionAuthorized: false, saveAuthorized: false, projectWorkerAssociationVerified: false,
    actions: currentPcbStringPrecreateRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "A distinct original-owner purpose is sealed at launch. It cannot upgrade a diagnostic owner, accept caller budgets or run arbitrary expressions. Use a unique string-precreate-* operation ID.",
      "Existing-profile launch and disposable opening can restore projects, migrate files, replay caches and automatically Save. They are not isolated, project-free or startup-qualified. No explicit Save or design edit is offered.",
      "After pinned UI admission, open the checkpoint-bound disposable project and its sealed PCB, then source-qualify that exact PCB frame before discovering and source-qualifying its retained project worker. Old diagnostic worker/PCB exclusivity is unchanged.",
      "Optional observe-common-baseline runs once after worker-source admission and before any precreate attempt. It compares five original fixed common/metadata/asset replies with the complete SQL inventory retained before opening. Missing defaults or unmodeled rows may produce an explicit comparison refusal after original context reproofs; independent precreate remains blocked until both failure and refusal result are published or settled. Native/header/cleanup failures remain fatal. No FileSource, initialization repair, common retry or writer token is provided.",
      "One observe-string-precreate call takes two versioned PCB/worker sweeps, preserving unavailable lazy managers and unmet baseline conditions, then collects original-worker producers and six paired UI/worker/PCB actor-clock samples. The complete route uses203 requests without common or225 with it. No initializer, callback, create or Save runs.",
      "V2 retains at most680KiB in its journal. Initial and inspect responses return a compact summary with record path, publication status, result hash and bytes. Local clocks and matched account values do not prove backend actor/clock provenance, future Save use, complete publishers, write destinations or queue completion.",
      "The sampled relation is non-atomic and does not establish complete live baseline, saved state, writer eligibility, publication or Save authority. A matching pair is not a writer token.",
      "Every effectful stage is consumed once. Inspect retained results after uncertainty; settlement only republishes original in-memory bytes. Historical JSON never recreates ownership. Shared launch exclusion includes both diagnostic and String operations, including partial reservations.",
      "Normal close, retained root/Job termination, helper release and durable settlement remain separate original-owner actions. No prompt choice, force termination, retry after uncertainty or historical cleanup ownership is available.",
    ], ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcbStringPrecreateRequestSchema) } : {}) };
}
export function validateCurrentPcbStringPrecreateArguments(input: unknown): Record<string, unknown> {
  const result = currentPcbStringPrecreateRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

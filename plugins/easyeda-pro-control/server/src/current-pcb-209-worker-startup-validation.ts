/** Offline fixed209 startup contract; importing it allocates no owner. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";

export const CURRENT_PCB_209_WORKER_STARTUP_OPERATION_PREFIX = "pcb209-startup-";
export const currentPcb209WorkerStartupLifecycleIdSchema = z.string().max(80).regex(/^pcb209-startup-[a-z0-9][a-z0-9_-]*$/u);
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const operationId = currentPcb209WorkerStartupLifecycleIdSchema;
const bound = { operationId, expectedBindingSha256: digest };
export const currentPcb209WorkerStartupLifecycleRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId, confirmValidationOnly: z.literal(true),
    confirmDiagnosticLaunch: z.literal(true), acceptExistingProfileEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId, observation: z.enum(["browser", "frames", "script"]).optional() }).strict(),
  ...(["settle-records", "cleanup-unlaunched", "cleanup-no-process"] as const).map(action => z.object({ action: z.literal(action), operationId, expectedIntentSha256: digest }).strict()),
  ...(["browser-observation", "observe-window", "observe-termination", "release-closed"] as const).map(action => z.object({ action: z.literal(action), ...bound }).strict()),
  z.object({ action: z.literal("inspect-frames"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("inspect-script"), ...bound, frameId: token, family: z.literal("ui") }).strict(),
  z.object({ action: z.literal("normal-close"), ...bound, hwnd: z.string().regex(/^[1-9]\d{0,18}$/u), confirmNormalClose: z.literal(true) }).strict(),
]);
export const currentPcb209WorkerStartupCaptureRequestSchema = z.object({ action: z.literal("capture-project"), ...bound,
  target: currentDisposableOpenTargetSchema, confirmDisposableProject: z.literal(true),
  acceptNormalOpenEffects: z.literal(true), acceptDebuggerPauseEffects: z.literal(true) }).strict();
export const currentPcb209WorkerStartupAssignmentsRequestSchema = z.object({ action: z.literal("observe-current-assignments"), ...bound }).strict();
export const currentPcb209WorkerStartupActorRequestSchema = z.object({ action: z.literal("observe-actor-clock"), ...bound }).strict();
export const currentPcb209WorkerStartupChannelRequestSchema = z.object({ action: z.literal("observe-current-channel"), ...bound }).strict();
export const currentPcb209WorkerStartupValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentPcb209WorkerStartupLifecycleRequestSchema.options, currentPcb209WorkerStartupCaptureRequestSchema,
  currentPcb209WorkerStartupAssignmentsRequestSchema, currentPcb209WorkerStartupActorRequestSchema, currentPcb209WorkerStartupChannelRequestSchema,
]);
export type CurrentPcb209WorkerStartupValidationRequest = z.infer<typeof currentPcb209WorkerStartupValidationRequestSchema>;
export function queryCurrentPcb209WorkerStartupValidation(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "pcb209-worker-startup", validationOnly: true, connectedValidation: false,
    executionAuthorized: false, saveAuthorized: false,
    actions: currentPcb209WorkerStartupValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a separate pcb209-startup-* original owner; ordinary diagnostic and String owners cannot be upgraded or adopted.",
      "After browser, frame and pinned UI-source admission, capture-project consumes one checkpoint-bound disposable opening. It durably hands off the original pipe, arms debugger auto-attachment before opening, captures constructors and checks the original worker project, branch and window. Debugger pauses affect application timing; explicit acceptance is mandatory.",
      "The worker target is a generated editor bootstrap, followed by pinned preload, four fixed helper-copy scripts and the project-worker import. Each paused script is source-qualified before normal resume; helper copies also require their original preload creator and ordered caller location. Constructor breakpoints are armed on the project script. Source snapshots are not continuous installation leases. Inspect retains bounded target, script and phase diagnostics after failure.",
      "Existing-profile launch and opening may restore designs, migrate files, replay caches, use the network and automatically persist data. No profile isolation or zero-write claim is made.",
      "After the original capture result is published, observe-current-assignments consumes one journaled read of the four current PROJECT wrappers and their original constructor callbacks. It rechecks those same assignments before publication; the result is a point-in-time, non-atomic observation, not an execution token.",
      "After the assignment result is published, observe-actor-clock consumes one UI/worker/worker/UI bracket on those original owners. It compares the retained account values and local Date readings, not a PCB realm, Windows/server clock, backend actor, future Save or continuous publication interval.",
      "After the assignment result is published, observe-current-channel independently consumes one bounded original-channel relation and publisher-method observation with paired gate samples. It does not call publisher methods or establish native channel peers, continuous ownership, contained destinations or queue completion; it does not require the actor stage.",
      "Constructor and current-assignment observations are not continuous channel/publisher ownership, destination containment, full startup completion, stable baseline, create/Save authority or saved-content proof. No writer or explicit Save is offered.",
      "Every stage is consumed once. Inspect retained outcomes after uncertainty; do not repeat capture-project. Original normal close, root/Job termination, helper release and exact record settlement remain separate. Historical records never recreate a native owner.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentPcb209WorkerStartupValidationRequestSchema) } : {}) };
}

export function validateCurrentPcb209WorkerStartupArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcb209WorkerStartupValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

/** Distinct launch purpose through the complete source-qualified diagnostic continuation. This
 * data contract never allocates or recreates an original native owner. */
import { z } from "zod";
import { currentPcb209WorkerStartupCaptureRequestSchema, currentPcb209WorkerStartupLifecycleRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";

export const CURRENT_PCB_209_RATLINE_CONTINUATION_OPERATION_PREFIX = "pcb209-continuation-";
export const currentPcb209RatlineContinuationIdSchema = z.string().max(80).regex(/^pcb209-continuation-[a-z0-9][a-z0-9_-]*$/u);
const operationId = currentPcb209RatlineContinuationIdSchema;
export const currentPcb209RatlineContinuationLifecycleRequestSchema = z.discriminatedUnion("action", [
  currentPcb209WorkerStartupLifecycleRequestSchema.options[0].extend({ operationId }),
  ...currentPcb209WorkerStartupLifecycleRequestSchema.options.slice(1).map(option => option.extend({ operationId })),
]);
export const currentPcb209RatlineContinuationValidationRequestSchema = z.discriminatedUnion("action", [
  ...currentPcb209RatlineContinuationLifecycleRequestSchema.options,
  currentPcb209WorkerStartupCaptureRequestSchema.extend({ operationId }),
  z.object({ action: z.literal("observe-ratline-continuation"), operationId,
    expectedBindingSha256: z.string().regex(/^[a-f0-9]{64}$/u), acceptNormalOpenEffects: z.literal(true), acceptDebuggerPause: z.literal(true) }).strict(),
]);
export type CurrentPcb209RatlineContinuationLifecycleRequest = z.infer<typeof currentPcb209RatlineContinuationLifecycleRequestSchema>;
export type CurrentPcb209RatlineContinuationValidationRequest = z.infer<typeof currentPcb209RatlineContinuationValidationRequestSchema>;
export function queryCurrentPcb209RatlineContinuationValidation(includeSchemas: boolean): Record<string, unknown> {
  return { wrapperAction: "pcb209-ratline-continuation", toolWrapperAction: "ratline-continuation", validationOnly: true,
    connectedValidation: false, executionAuthorized: false, saveAuthorized: false,
    actions: currentPcb209RatlineContinuationValidationRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a separate pcb209-continuation-* operation with its original fixed-purpose owner. No retained diagnostic, held-import or empty-baseline owner can be upgraded.",
      "After the original disposable project capture, observe-ratline-continuation opens the retained PCB once, qualifies its 29 source stages, and captures the complete fixed PCB and first-worker construction/callback sequences while qualifying both seven-stage worker imports before their sole continuation.",
      "The source-qualified event ancestry retains three original sessions, but does not prove a native JavaScript Worker to CDP target mapping, a subscribed canvas peer, callback completion, copper completion, complete startup or a complete live baseline.",
      "Launch, ordinary opening and resumed source can restore state, migrate or automatically persist files and use the network. Existing-profile effects and debugger pauses require explicit acceptance. Only the identified disposable fixture is allowed.",
      "The fixed callback profile requires empty ratline work and matching retained object relations. After its durable intent, a negative check of the original completed checkpoint rejects known physical PCB records before native session preparation or PCB navigation. Passing that filter proves no empty live baseline; native empty checks remain required. Even a queued serialized [] is outside this profile. Results grant no editing, Save, manufacturing or ordinary-project authority.",
      "One launch clock and cumulative request, byte and event budgets persist across handoffs. Ambiguous replies consume their operation; process/Job termination, helper release and durable record settlement remain separate.",
      "Historical JSON cannot recreate the original owner, continuation capabilities or runtime admission.",
    ], ...(includeSchemas ? { inputSchema: z.toJSONSchema(currentPcb209RatlineContinuationValidationRequestSchema) } : {}) };
}
export function validateCurrentPcb209RatlineContinuationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcb209RatlineContinuationValidationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, executionAuthorized: false } : {
    valid: false, validationOnly: true, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

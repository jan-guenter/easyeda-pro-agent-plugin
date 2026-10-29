/** Separate disposable visual-review purpose. No source writer or Save. */
import { z } from "zod";
import { currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
import { currentPcb209VisualOperationSchema } from "./current-pcb-209-visual-actions.ts";
import { currentPcb209SelectionRelationsComponentIdsSchema } from "./current-pcb-209-selection-relations.ts";

export const currentPcb209VisualIdSchema = z.string().max(80).regex(/^pcb209-visual-[a-z0-9][a-z0-9_-]*$/u);
const digest = z.string().regex(/^[a-f\d]{64}$/u);
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const bound = { operationId: currentPcb209VisualIdSchema, expectedBindingSha256: digest };
export const currentPcb209VisualRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("launch"), operationId: currentPcb209VisualIdSchema,
    confirmValidationOnly: z.literal(true), confirmDiagnosticLaunch: z.literal(true),
    acceptExistingProfileEffects: z.literal(true), acceptVisualStateChanges: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId: currentPcb209VisualIdSchema,
    observation: z.enum(["browser", "frames", "script", "pcb-opening", "selection-relations209", "visual-viewport209"]).optional() }).strict(),
  z.object({ action: z.literal("settle-records"), operationId: currentPcb209VisualIdSchema, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-unlaunched"), operationId: currentPcb209VisualIdSchema, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("cleanup-no-process"), operationId: currentPcb209VisualIdSchema, expectedIntentSha256: digest }).strict(),
  z.object({ action: z.literal("browser-observation"), ...bound }).strict(),
  z.object({ action: z.literal("inspect-frames"), ...bound, targetId: token }).strict(),
  z.object({ action: z.literal("inspect-script"), ...bound, frameId: token, family: z.literal("ui") }).strict(),
  z.object({ action: z.literal("open-project"), ...bound, target: currentDisposableOpenTargetSchema,
    confirmDisposableProject: z.literal(true), acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("open-pcb"), ...bound, acceptNormalOpenEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe-pcb-opening"), ...bound }).strict(),
  z.object({ action: z.literal("observe-selection-relations"), ...bound,
    componentIds: currentPcb209SelectionRelationsComponentIdsSchema.default([]) }).strict(),
  z.object({ action: z.literal("perform-visual"), ...bound, operation: currentPcb209VisualOperationSchema,
    confirmVisualStateChanges: z.literal(true) }).strict(),
  z.object({ action: z.literal("abort-visual"), ...bound, confirmAbortOriginalVisualJob: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe-window"), ...bound }).strict(),
  z.object({ action: z.literal("observe-termination"), ...bound }).strict(),
  z.object({ action: z.literal("release-closed"), ...bound }).strict(),
  z.object({ action: z.literal("normal-close"), ...bound, hwnd: z.string().regex(/^[1-9]\d{0,18}$/u), confirmNormalClose: z.literal(true) }).strict(),
]);
export type CurrentPcb209VisualRequest = z.infer<typeof currentPcb209VisualRequestSchema>;

export function queryCurrentPcb209Visual(input: unknown = {}): Record<string, unknown> {
  const request = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  return { offline: true, tool: "easyeda_control_pcb209_opening", wrapperAction: "visual", validationOnly: true,
    connectedValidation: false, executionAuthorized: false, designExecutionAuthorized: false, saveAuthorized: false,
    actions: currentPcb209VisualRequestSchema.options.map(option => option.shape.action.value),
    limitations: [
      "Launch a separate pcb209-visual-* original owner with explicit visual-state acceptance. Existing read, worker and main owners cannot upgrade into it.",
      "Only the sealed disposable project and original source-qualified PCB frame are eligible. Opening can restore tabs, migrate, replay caches and automatically persist files.",
      "One viewport operation is consumed before possible native dispatch. Missing replies or a failure grant no retry or automatic restoration.",
      "Selection writes remain unavailable: native selection dispatch can flush uploads and delete empty selected objects. The existing selection-relations reader can inspect prior IDs without choosing them.",
      "Viewport fit-all, fit-selected and bounded zoom-to use the original captured receiver. Returned native camera bounds are converted to mil. A returned camera box does not prove rendering completion or stable double-sampled camera state.",
      "No PNG, net highlighting, overlay timers, CAD source edit, explicit Save, complete-board baseline, production scope or saved-result proof is enabled. With explicit confirmation, abort-visual terminates only the original visual Job. It consumes intent before dispatch and blocks normal work. Acknowledgment is not exit; observe-termination and release-closed remain separate.",
    ], ...(request.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcb209VisualRequestSchema) } : {}) };
}

export function validateCurrentPcb209VisualArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcb209VisualRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, saveAuthorized: false } : {
    valid: false, validationOnly: true, saveAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

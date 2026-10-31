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
    observation: z.enum(["browser", "frames", "script", "pcb-opening", "selection-relations209", "visual-viewport209", "window-capture209", "renderer-capture209", "window-resize209", "window-restore209"]).optional() }).strict(),
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
  z.object({ action: z.literal("restore-window-for-capture"), ...bound, acceptWindowRestoreEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("resize-window-for-capture"), ...bound, acceptWindowResizeEffects: z.literal(true) }).strict(),
  z.object({ action: z.literal("observe-capture-readiness"), ...bound }).strict(),
  z.object({ action: z.literal("capture-renderer-viewport"), ...bound,
    acceptRendererCaptureEffects: z.literal(true), confirmLocalArtifact: z.literal(true) }).strict(),
  z.object({ action: z.literal("capture-window"), ...bound, hwnd: z.string().regex(/^[1-9][0-9]{0,18}$/u),
    acceptWindowPaintEffects: z.literal(true), confirmLocalArtifact: z.literal(true) }).strict(),
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
      "navigate-coordinates and navigate-region additionally require operation.acceptTransientOverlayEffects:true. They pass data-origin mil values to the exact native handlers, which may clear a prior overlay and schedule an animation frame, a 75ms timer and a 3s crossline/rectangle overlay. Their true acknowledgment proves neither camera bounds, rendering, callback execution nor timer settlement. Keep the original disposable owner through actual process/Job exit and release; no production navigation is enabled.",
      "restore-window-for-capture consumes one intent for fixed nonactivating ShowWindowAsync4 on the original visible maximized window. acceptWindowRestoreEffects:true includes possible system-restored position changes. Submission is not completion; later same-HWND nonmaximized readiness is required before resize/capture, which still reprove fresh state. No restore after resize/capture attempts, minimized-window support, caller geometry/show command, retry or inverse is enabled.",
      "resize-window-for-capture consumes one intent for a fixed1920x1080 asynchronous no-move/no-activate request to the original window. It does not restore maximized windows; only the separate restore action may precede it. Submission is not applied geometry or render completion. A new readiness query must observe the exact requested size and unchanged position before capture; capture still rechecks everything. No size/coordinates/caller HWND, retry or restoration is accepted.",
      "observe-capture-readiness makes at most eight read-only original-owner window/budget queries. It consumes no capture or paint intent, accepts no caller HWND, and returns a snapshot rather than authority for a later capture. Capture still performs its fresh owner/source/geometry checks.",
      "capture-renderer-viewport consumes the same once-only image slot as capture-window, using fixed PNG Page.captureScreenshot on the original source-qualified parent Page session. It accepts no target, clip, dimensions, flags, focus or arbitrary CDP input. The viewport can include application UI and child content; pixels are not a canvas-only export or rendering/persistence proof. No fallback after a failed/blank window capture or renderer capture is offered, and historical attempts remain consumed.",
      "A separate capture-window action requests WM_PRINT pixels only from the original unique application HWND. It retains its bounded native resources until actual root exit and empty Job, including after an acknowledged paint. A managed PNG is not an SDK canvas image, a stable render or a saved design. No net highlighting, overlay timers, CAD source edit, explicit Save, complete-board baseline, production scope or saved-result proof is enabled. With explicit confirmation, abort-visual terminates only the original visual Job. It consumes intent before dispatch and blocks normal work. Acknowledgment is not exit; observe-termination and release-closed remain separate.",
    ], ...(request.includeSchemas ? { inputSchema: z.toJSONSchema(currentPcb209VisualRequestSchema) } : {}) };
}

export function validateCurrentPcb209VisualArguments(input: unknown): Record<string, unknown> {
  const parsed = currentPcb209VisualRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, validationOnly: true, saveAuthorized: false } : {
    valid: false, validationOnly: true, saveAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

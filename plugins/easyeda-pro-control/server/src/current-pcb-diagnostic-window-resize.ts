/** One fixed original-window resize request. Submission and a later geometry
 * snapshot are distinct from stable rendering, CAD correctness or persistence. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_WINDOW_RESIZE_LIMITS = Object.freeze({ width: 1920, height: 1080, resultBytes: 8192 });
const coordinate = z.number().int().min(-1_000_000).max(1_000_000).refine(value => !Object.is(value, -0));
const bounds = z.object({ left: coordinate, top: coordinate, right: coordinate, bottom: coordinate }).strict()
  .refine(value => value.right > value.left && value.bottom > value.top);
const target = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  documentUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u), tabId: z.string().max(97) }).strict();
const native = z.object({ schema: z.literal("easyeda-pro-control.original-window-resize.v1"), hwnd: z.string().regex(/^[1-9][0-9]{0,18}$/u),
  previousBounds: bounds, requestedWidth: z.literal(1920), requestedHeight: z.literal(1080), requestSubmitted: z.literal(true),
  noMoveRequested: z.literal(true), noActivateRequested: z.literal(true), zOrderPreservationRequested: z.literal(true),
  geometryVerified: z.literal(false), renderCompletionVerified: z.literal(false),
}).strict();
export const currentWindowResizeResultSchema = native.extend({ schema: z.literal("easyeda-pro-control.window-resize-result.v1"), target,
  snapshotRequired: z.literal(true), resizeCompletionVerified: z.literal(false), sourceEditRequested: z.literal(false),
  explicitSaveRequested: z.literal(false), persistenceVerified: z.literal(false), executionAuthorized: z.literal(false) }).strict();
export function decodeCurrentWindowResize(input: unknown): Readonly<Record<string, unknown>> {
  const captured = captureCurrentPcbStringClockReply(input);
  if (Buffer.byteLength(captured.text) > CURRENT_WINDOW_RESIZE_LIMITS.resultBytes) { throw new Error("PCB_WINDOW_RESIZE_BOUND"); }
  return freezeDeep(native.parse(captured.value));
}
export function currentWindowResizeResult(input: unknown, selected: CurrentDisposableOpenSealedTarget): Readonly<Record<string, unknown>> {
  const original = currentDisposableOpenSealedTargetSchema.parse(selected);
  const decoded = decodeCurrentWindowResize(input);
  return freezeDeep(currentWindowResizeResultSchema.parse({ ...decoded, schema: "easyeda-pro-control.window-resize-result.v1",
    target: { projectUuid: original.projectUuid, branchUuid: original.branchUuid, documentUuid: original.documentUuid,
      tabId: `${original.documentUuid}@${original.projectUuid}` }, snapshotRequired: true, resizeCompletionVerified: false,
    sourceEditRequested: false, explicitSaveRequested: false, persistenceVerified: false, executionAuthorized: false }));
}
export function requireCurrentWindowResizeResult(input: unknown, selected: CurrentDisposableOpenSealedTarget): void {
  const result = currentWindowResizeResultSchema.parse(input);
  if (result.target.projectUuid !== selected.projectUuid || result.target.branchUuid !== selected.branchUuid ||
      result.target.documentUuid !== selected.documentUuid || result.target.tabId !== `${selected.documentUuid}@${selected.projectUuid}`) {
    throw new Error("PCB_WINDOW_RESIZE_TARGET");
  }
}

/** Independently join a later geometry sample to this exact retained request. */
export function requireCurrentWindowResizeReadiness(input: unknown, resizeInput: unknown): void {
  const request = native.parse(resizeInput);
  const observed = z.object({ hwnd: z.string(), bounds, maximized: z.literal(false), resizeGeometryObserved: z.literal(true) }).parse(input);
  if (observed.hwnd !== request.hwnd || observed.bounds.left !== request.previousBounds.left || observed.bounds.top !== request.previousBounds.top ||
      observed.bounds.right - observed.bounds.left !== CURRENT_WINDOW_RESIZE_LIMITS.width ||
      observed.bounds.bottom - observed.bounds.top !== CURRENT_WINDOW_RESIZE_LIMITS.height) { throw new Error("PCB_WINDOW_RESIZE_READINESS_TARGET"); }
}

/** Fixed nonactivating restore submission for the original maximized window.
 * Windows may restore its previous position; a new snapshot must observe normal
 * state before further resize/capture. Submission never proves completion. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_WINDOW_RESTORE_LIMITS = Object.freeze({ showCommand: 4, resultBytes: 8192, requiredCdpStages: 3, requiredQuerySlots: 2 });
const coordinate = z.number().int().min(-1_000_000).max(1_000_000).refine(value => !Object.is(value, -0));
const bounds = z.object({ left: coordinate, top: coordinate, right: coordinate, bottom: coordinate }).strict()
  .refine(value => value.right > value.left && value.bottom > value.top);
const target = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  documentUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u), tabId: z.string().max(97) }).strict();
const native = z.object({ schema: z.literal("easyeda-pro-control.original-window-restore.v1"), hwnd: z.string().regex(/^[1-9][0-9]{0,18}$/u),
  previousBounds: bounds, previousMaximized: z.literal(true), showCommand: z.literal(4), requestSubmitted: z.literal(true),
  activationRequested: z.literal(false), positionMayChange: z.literal(true), zOrderPreservationVerified: z.literal(false),
  geometryVerified: z.literal(false), renderCompletionVerified: z.literal(false),
}).strict();
export const currentWindowRestoreResultSchema = native.extend({ schema: z.literal("easyeda-pro-control.window-restore-result.v1"), target,
  snapshotRequired: z.literal(true), restoreCompletionVerified: z.literal(false), sourceEditRequested: z.literal(false),
  explicitSaveRequested: z.literal(false), persistenceVerified: z.literal(false), executionAuthorized: z.literal(false) }).strict();
export function decodeCurrentWindowRestore(input: unknown): Readonly<Record<string, unknown>> {
  const captured = captureCurrentPcbStringClockReply(input);
  if (Buffer.byteLength(captured.text) > CURRENT_WINDOW_RESTORE_LIMITS.resultBytes) { throw new Error("PCB_WINDOW_RESTORE_BOUND"); }
  return freezeDeep(native.parse(captured.value));
}
export function currentWindowRestoreResult(input: unknown, selected: CurrentDisposableOpenSealedTarget): Readonly<Record<string, unknown>> {
  const original = currentDisposableOpenSealedTargetSchema.parse(selected);
  const decoded = decodeCurrentWindowRestore(input);
  return freezeDeep(currentWindowRestoreResultSchema.parse({ ...decoded, schema: "easyeda-pro-control.window-restore-result.v1",
    target: { projectUuid: original.projectUuid, branchUuid: original.branchUuid, documentUuid: original.documentUuid,
      tabId: `${original.documentUuid}@${original.projectUuid}` }, snapshotRequired: true, restoreCompletionVerified: false,
    sourceEditRequested: false, explicitSaveRequested: false, persistenceVerified: false, executionAuthorized: false }));
}
export function requireCurrentWindowRestoreResult(input: unknown, selected: CurrentDisposableOpenSealedTarget): void {
  const result = currentWindowRestoreResultSchema.parse(input);
  if (result.target.projectUuid !== selected.projectUuid || result.target.branchUuid !== selected.branchUuid ||
      result.target.documentUuid !== selected.documentUuid || result.target.tabId !== `${selected.documentUuid}@${selected.projectUuid}`) {
    throw new Error("PCB_WINDOW_RESTORE_TARGET");
  }
}
/** Position is intentionally not compared: restoring can change it. */
export function requireCurrentWindowRestoreReadiness(input: unknown, restoreInput: unknown): void {
  const request = native.parse(restoreInput);
  const observed = z.object({ hwnd: z.string(), bounds, maximized: z.literal(false), restoreStateObserved: z.literal(true) }).parse(input);
  if (observed.hwnd !== request.hwnd) { throw new Error("PCB_WINDOW_RESTORE_READINESS_TARGET"); }
}

/** Read-only original-window and remaining-budget snapshot. A successful query
 * never reserves or authorizes a later capture; capture rechecks its own owner. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS as TRANSPORT } from "./current-pcb-diagnostic-transport-limits.ts";
import { DIAGNOSTIC_REQUEST_LIMIT } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION as BUDGET } from "./current-pcb-diagnostic-window-capture-budget.ts";
import { CURRENT_WINDOW_CAPTURE_LIMITS as IMAGE } from "./current-pcb-diagnostic-window-capture.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_WINDOW_CAPTURE_READINESS_LIMITS = Object.freeze({ queries: 8, nativeReplyBytes: 1024, resultBytes: 8192 });
const coordinate = z.number().int().min(-1_000_000).max(1_000_000).refine(value => !Object.is(value, -0));
const native = z.object({ hwnd: z.string().regex(/^[1-9][0-9]{0,18}$/u).nullable(),
  bounds: z.object({ left: coordinate, top: coordinate, right: coordinate, bottom: coordinate }).strict().nullable(),
  maximized: z.boolean().nullable(), resizeAttempted: z.boolean(), resizeRequestSubmitted: z.boolean(), resizeGeometryObserved: z.boolean(),
  queriesUsed: z.number().int().min(1).max(CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries), captureAttempted: z.boolean(),
  paintDispatched: z.boolean(), nativeResourcesRetained: z.boolean(),
}).strict().refine(value => (value.hwnd === null) === (value.bounds === null) &&
  (value.bounds === null || value.bounds.right > value.bounds.left && value.bounds.bottom > value.bounds.top) &&
  (!value.paintDispatched || value.captureAttempted) && (!value.nativeResourcesRetained || value.captureAttempted) && (!value.resizeRequestSubmitted || value.resizeAttempted) &&
  (!value.resizeGeometryObserved || value.resizeRequestSubmitted && value.hwnd !== null && value.maximized === false &&
    value.bounds !== null && value.bounds.right - value.bounds.left === 1920 && value.bounds.bottom - value.bounds.top === 1080) && (value.hwnd === null) === (value.maximized === null), "Contradictory original window readiness.");
const usage = z.object({ helperStdoutBytes: z.number().int().min(0).max(TRANSPORT.maximumHelperStdoutBytes),
  cdpRequests: z.number().int().min(0).max(DIAGNOSTIC_REQUEST_LIMIT), readerAvailable: z.boolean(),
  sourceQualified: z.boolean(), resizeConsumed: z.boolean().optional(), captureConsumed: z.boolean(), queriesUsed: z.number().int().min(1).max(CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries),
}).strict();
export type CurrentWindowCaptureReadinessUsage = z.infer<typeof usage>;

export function currentWindowCaptureReadiness(input: unknown, usageInput: CurrentWindowCaptureReadinessUsage): Readonly<Record<string, unknown>> {
  const captured = captureCurrentPcbStringClockReply(input);
  if (Buffer.byteLength(captured.text) > CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.nativeReplyBytes) { throw new Error("PCB_WINDOW_CAPTURE_READINESS_BOUND"); }
  const value = native.parse(captured.value); const used = usage.parse(usageInput);
  if (value.queriesUsed > used.queriesUsed) { throw new Error("PCB_WINDOW_CAPTURE_READINESS_SEQUENCE"); }
  const width = value.bounds === null ? null : value.bounds.right - value.bounds.left;
  const height = value.bounds === null ? null : value.bounds.bottom - value.bounds.top;
  const geometryEligible = width !== null && height !== null && width >= 320 && height >= 200 &&
    width <= IMAGE.maximumDimension && height <= IMAGE.maximumDimension && width * height <= IMAGE.maximumPixels;
  const remainingCdpRequests = DIAGNOSTIC_REQUEST_LIMIT - used.cdpRequests;
  const remainingHelperStdoutBytes = TRANSPORT.maximumHelperStdoutBytes - used.helperStdoutBytes;
  const transportEligible = remainingCdpRequests >= BUDGET.cdpRequests && remainingHelperStdoutBytes >= BUDGET.requiredHeadroomBytes;
  const captureAttemptConsumed = used.captureConsumed || value.captureAttempted;
  const resizeAttemptConsumed = used.resizeConsumed === true || value.resizeAttempted;
  const result = { schema: "easyeda-pro-control.window-capture-readiness.v1", hwnd: value.hwnd, bounds: value.bounds, width, height,
    geometryEligible, transportEligible, resizeTransportEligible: remainingCdpRequests >= 2 * BUDGET.cdpRequests &&
      remainingHelperStdoutBytes >= BUDGET.requiredHeadroomBytes && used.queriesUsed < CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries, capacityAvailable: geometryEligible && transportEligible && !captureAttemptConsumed && (!resizeAttemptConsumed || value.resizeGeometryObserved),
    originalPcbSourceRetained: used.sourceQualified, readerAvailable: used.readerAvailable, captureAttemptConsumed,
    maximized: value.maximized, resizeSupported: value.hwnd !== null && value.maximized === false && !captureAttemptConsumed && !resizeAttemptConsumed,
    resizeAttemptConsumed, resizeAttempted: value.resizeAttempted, resizeRequestSubmitted: value.resizeRequestSubmitted, resizeGeometryObserved: value.resizeGeometryObserved,
    nativePaintDispatched: value.paintDispatched, nativeResourcesRetained: value.nativeResourcesRetained,
    limits: { minimumWidth: 320, minimumHeight: 200, maximumDimension: IMAGE.maximumDimension, maximumPixels: IMAGE.maximumPixels,
      maximumPngBytes: IMAGE.maximumPngBytes, maximumNativePacketBytes: IMAGE.maximumReplyBytes },
    budgets: { remainingCdpRequests, requiredCdpRequests: BUDGET.cdpRequests, requiredResizeCdpRequests: 2 * BUDGET.cdpRequests, remainingHelperStdoutBytes,
      requiredHelperStdoutBytes: BUDGET.requiredHeadroomBytes, protectedCleanupBytes: BUDGET.cleanupReplyBytes,
      nativeQueriesUsed: value.queriesUsed, queriesUsed: used.queriesUsed, queriesRemaining: CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries - used.queriesUsed },
    snapshotOnly: true, activePcbRechecked: false, captureRequiresFreshReproof: true, paintIssued: false, executionAuthorized: false };
  if (Buffer.byteLength(JSON.stringify(result)) > CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.resultBytes) { throw new Error("PCB_WINDOW_CAPTURE_READINESS_RESULT_BOUND"); }
  return freezeDeep(result);
}

/** Pure consistency checks for captured data. A match supplies no original
 * owner, native Worker/CDP association, continuation or editing authority. */
import { z } from "zod";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const nativeId = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const payload = z.object({ ratlineRes: z.array(z.never()).length(0), workerName: nativeId }).strict();
const windowTabId = z.string().regex(/^[A-Za-z\d_-]{1,128}$/u);
export const currentPcb209RatlineContinuationPayloadSchema = z.string().min(1).max(256).refine(value => {
  try { return JSON.stringify(payload.parse(JSON.parse(value) as unknown)) === value; } catch { return false; }
}, "Only the original canonical empty-work payload is supported.");
export const currentPcb209RatlineContinuationWorldSchema = z.object({
  documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
  tabId: z.string().min(1).max(256), windowTabId,
}).strict().refine(value => value.tabId === `${value.documentUuid}@${value.projectUuid}`,
  "The captured world tab must identify its exact document and project.");

// Other capture metadata is validated by its complete packet schema or original
// Capture owner. This projection checks only the fields participating in joins.
const capture = z.object({ nativeWorkerId: nativeId, resultPayload: currentPcb209RatlineContinuationPayloadSchema,
  world: currentPcb209RatlineContinuationWorldSchema.nullable() });
type Capture = z.infer<typeof capture>;
function joined(pcbInput: unknown, workerInput: unknown): Readonly<{ pcb: Capture; worker: Capture }> | null {
  try {
    const pcb = capture.parse(captureCurrentPcbStringClockReply(pcbInput).value);
    const worker = capture.parse(captureCurrentPcbStringClockReply(workerInput).value);
    if (pcb.world !== null || worker.world === null || pcb.resultPayload !== worker.resultPayload) { return null; }
    const result = payload.parse(JSON.parse(worker.resultPayload) as unknown);
    // The worker's nativeWorkerId names its subordinate in a different local
    // Registry. Its published workerName identifies the PCB's captured child.
    if (result.workerName !== pcb.nativeWorkerId) { return null; }
    return { pcb, worker };
  } catch { return null; }
}

export function currentPcb209RatlineContinuationCapturesAgree(pcbInput: unknown, workerInput: unknown): boolean {
  return joined(pcbInput, workerInput) !== null;
}

/** The caller must retain and reprove the original sealed target and opening
 * window. Passing matching decoded JSON here creates no execution authority. */
export function currentPcb209RatlineContinuationMatchesTarget(pcbInput: unknown, workerInput: unknown,
  target: CurrentDisposableOpenSealedTarget, originalWindowTabId: string): boolean {
  try {
    const world = joined(pcbInput, workerInput)?.worker.world;
    if (world === undefined || world === null) { return false; }
    const selected = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(target).value);
    const originalWindow = windowTabId.parse(originalWindowTabId);
    return world.projectUuid === selected.projectUuid && world.documentUuid === selected.documentUuid &&
      world.tabId === `${selected.documentUuid}@${selected.projectUuid}` && world.windowTabId === originalWindow;
  } catch { return false; }
}

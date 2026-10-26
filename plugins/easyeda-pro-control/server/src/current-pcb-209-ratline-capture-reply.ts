/** Private diagnostic copies, never a reply decoder or runtime authority. */
import { captureCurrentPcb209RatlineStopRecord } from "./current-pcb-209-ratline-stop-observation.ts";
import type { CurrentPcb209RatlineStopCapture } from "./current-pcb-209-ratline-stop-observation.ts";
import type { CurrentPcb209RatlineCaptureCommand } from "./current-pcb-209-ratline-capture-runner.ts";
import type { CurrentPcb209RatlineCaptureRole, CurrentPcb209RatlineCaptureScope, CurrentPcb209RatlineCaptureSite } from "./current-pcb-209-ratline-capture-profile.ts";
import type { CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS } from "./current-pcb-209-ratline-capture-program.ts";

type Selection = Extract<CurrentPcb209RatlineCaptureCommand, { method: "Debugger.evaluateOnCallFrame" }>;
export interface CurrentPcb209RatlineCaptureReplyContext {
  readonly role: CurrentPcb209RatlineCaptureRole;
  readonly scope: CurrentPcb209RatlineCaptureScope;
  readonly pauseIndex: number | null;
  readonly site: CurrentPcb209RatlineCaptureSite | null;
  readonly requestNumber: number;
  readonly command: CurrentPcb209RatlineCaptureCommand["method"];
  readonly expression: Selection["params"]["expression"] | null;
  readonly program: keyof typeof CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS | null;
}
export interface CurrentPcb209RatlineCaptureReplyEvidence extends CurrentPcb209RatlineCaptureReplyContext {
  readonly profile: "private.pcb209-ratline-capture-reply.v1";
  readonly reply: CurrentPcb209RatlineStopCapture;
  readonly executionAuthorized: false;
}
/** Metadata comes only from the fixed original capture owner. The raw reply is
 * copied before strict decoding or any subsequent owner callback. Oversized or
 * hostile values remain explicit failures, never truncated successful copies. */
export function captureCurrentPcb209RatlineCaptureReply(input: unknown,
  context: CurrentPcb209RatlineCaptureReplyContext): CurrentPcb209RatlineCaptureReplyEvidence {
  return Object.freeze({ profile: "private.pcb209-ratline-capture-reply.v1", ...context,
    reply: captureCurrentPcb209RatlineStopRecord(input, 32_768), executionAuthorized: false });
}

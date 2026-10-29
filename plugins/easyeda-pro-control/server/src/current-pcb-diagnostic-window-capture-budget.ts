/** A single capture's finite helper-response reservation, including cleanup.
 * Arbitrarily fragmented/empty native polls need a count and envelope bound:
 * raw CDP bytes alone do not bound the cost of helper JSON responses. */
import { CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS as TRANSPORT } from "./current-pcb-diagnostic-transport-limits.ts";
import { CURRENT_WINDOW_RESIZE_LIMITS as RESIZE } from "./current-pcb-diagnostic-window-resize.ts";
import { CURRENT_WINDOW_CAPTURE_LIMITS as IMAGE } from "./current-pcb-diagnostic-window-capture.ts";

const cdpRequests = 10, cleanupControlReplies = 16, controlRequests = 16, pollRequests = 512;
const helperEnvelopeBytes = 512, nativeCaptureReplyBytes = IMAGE.maximumReplyBytes + 128;
const nativeResizeReplyBytes = RESIZE.resultBytes + 128;
const maximumCdpRawBytes = cdpRequests * (TRANSPORT.maximumFrameBytes + 1) + TRANSPORT.maximumEventBytes + TRANSPORT.maximumEventCount;
// Per-poll padding adds less than4 bytes beyond aggregate base64 encoding.
const maximumPollBase64Bytes = 4 * Math.ceil(maximumCdpRawBytes / 3) + 4 * pollRequests;
const stageReplyBytes = maximumPollBase64Bytes + (controlRequests + pollRequests) * helperEnvelopeBytes + nativeCaptureReplyBytes + TRANSPORT.maximumHelperLineBytes;
const cleanupReplyBytes = cleanupControlReplies * TRANSPORT.maximumHelperLineBytes;
const requiredHeadroomBytes = Math.ceil((stageReplyBytes + cleanupReplyBytes) / (16 * 1024 * 1024)) * 16 * 1024 * 1024;
export const CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION = Object.freeze({
  cdpRequests, controlRequests, pollRequests, cleanupControlReplies, helperEnvelopeBytes, nativeCaptureReplyBytes, nativeResizeReplyBytes,
  maximumCdpRawBytes, maximumPollBase64Bytes, stageReplyBytes, cleanupReplyBytes, requiredHeadroomBytes,
});

function refusal(reason: string): Error { return new Error(`PCB_DIAGNOSTIC_OWNER_WINDOW_CAPTURE209_${reason}`); }
/** A refused request has not reached the helper. A refused response is already
 * bounded by the ordinary100k line ceiling and consumes the invalid-line reserve. */
export class CurrentWindowCaptureTransportBudget {
  #controls = 0;
  #polls = 0;
  #rawBytes = 0;
  public constructor(usedStdoutBytes: number) {
    if (!Number.isSafeInteger(usedStdoutBytes) || usedStdoutBytes < 0 ||
        usedStdoutBytes > TRANSPORT.maximumHelperStdoutBytes - requiredHeadroomBytes) { throw refusal("STDOUT_HEADROOM"); }
  }
  public consume(poll: boolean): void {
    if (poll) {
      if (this.#polls >= pollRequests) { throw refusal("POLL_BUDGET"); } this.#polls += 1;
    } else {
      if (this.#controls >= controlRequests) { throw refusal("CONTROL_BUDGET"); } this.#controls += 1;
    }
  }
  public observeReply(kind: "poll" | "control" | "image" | "resize", lineBytes: number, result: Readonly<Record<string, unknown>>): void {
    if (!Number.isSafeInteger(lineBytes) || lineBytes < 1) { throw refusal("HELPER_ENVELOPE"); }
    if (kind !== "poll") {
      let maximum = helperEnvelopeBytes;
      if (kind === "image") { maximum = nativeCaptureReplyBytes; }
      else if (kind === "resize") { maximum = nativeResizeReplyBytes; }
      if (lineBytes > maximum) { throw refusal("HELPER_ENVELOPE"); } return;
    }
    const encoded = result["bytes"];
    if (Object.keys(result).length !== 1 || typeof encoded !== "string" || encoded.length > TRANSPORT.maximumNativePollBase64Units ||
        lineBytes < encoded.length || lineBytes - encoded.length > helperEnvelopeBytes ||
        !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(encoded)) { throw refusal("HELPER_ENVELOPE"); }
    const decoded = Buffer.from(encoded, "base64");
    if (decoded.toString("base64") !== encoded || decoded.length > TRANSPORT.maximumNativePollBytes ||
        this.#rawBytes + decoded.length > maximumCdpRawBytes) { throw refusal("RAW_REPLY_BUDGET"); }
    this.#rawBytes += decoded.length;
  }
}

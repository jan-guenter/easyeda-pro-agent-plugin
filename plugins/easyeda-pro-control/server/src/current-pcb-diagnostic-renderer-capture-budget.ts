/** Separate renderer-image transport envelope. It preserves existing shared
 * frame, event and helper ceilings and grants no capture or native ownership. */
import { CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS as TRANSPORT } from "./current-pcb-diagnostic-transport-limits.ts";

const cdpRequests = 11, cleanupControls = 16, controls = 16, envelopeBytes = 512, polls = 512;
const rawBytes = cdpRequests * (TRANSPORT.maximumFrameBytes + 1) + TRANSPORT.maximumEventBytes + TRANSPORT.maximumEventCount;
const stageReplyBytes = 4 * Math.ceil(rawBytes / 3) + 4 * polls + (controls + polls) * envelopeBytes + TRANSPORT.maximumHelperLineBytes;
const cleanupReplyBytes = cleanupControls * TRANSPORT.maximumHelperLineBytes;
const headroomBytes = Math.ceil((stageReplyBytes + cleanupReplyBytes) / (16 * 1024 * 1024)) * 16 * 1024 * 1024;
export const CURRENT_RENDERER_CAPTURE_TRANSPORT_RESERVATION = Object.freeze({ cdpRequests, controls, polls, envelopeBytes,
  cleanupControls, rawBytes, stageReplyBytes, cleanupReplyBytes, headroomBytes });
function fail(): never { throw new Error("RENDERER_CAPTURE_TRANSPORT_BOUND"); }

/** Charge helper controls and every fragmented poll before retention. The
 * original pipe owns the global CDP allocator and independently enforces its
 * one-reply/frame/event limits; this counter never resets those budgets. */
export class CurrentRendererCaptureTransportBudget {
  #controls = 0;
  #polls = 0;
  #rawBytes = 0;
  public constructor(used: number) {
    if (!Number.isSafeInteger(used) || Object.is(used, -0) || used < 0 || used > TRANSPORT.maximumHelperStdoutBytes - headroomBytes) { fail(); }
  }
  public consume(poll: boolean): void {
    if (typeof poll !== "boolean") { fail(); }
    if (poll) { if (this.#polls >= polls) { fail(); } this.#polls += 1; }
    else { if (this.#controls >= controls) { fail(); } this.#controls += 1; }
  }
  public observeReply(kind: "poll" | "control" | "image" | "resize" | "restore", lineBytes: number, result: Readonly<Record<string, unknown>>): void {
    if (!Number.isSafeInteger(lineBytes) || lineBytes < 1) { fail(); }
    if (kind !== "poll") { if (kind !== "control" || lineBytes > envelopeBytes) { fail(); } return; }
    const encoded = result["bytes"];
    if (Object.keys(result).length !== 1 || typeof encoded !== "string" || encoded.length > TRANSPORT.maximumNativePollBase64Units ||
        lineBytes < encoded.length || lineBytes - encoded.length > envelopeBytes ||
        !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(encoded)) { fail(); }
    const raw = Buffer.from(encoded, "base64");
    if (raw.toString("base64") !== encoded || raw.length > TRANSPORT.maximumNativePollBytes || this.#rawBytes + raw.length > rawBytes) { fail(); }
    this.#rawBytes += raw.length;
  }
}

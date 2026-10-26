/** Retain the first rejected raw source reply before strict capture. This
 * diagnostic cannot admit content, supply ownership or authorize execution. */
import { captureCurrentFootprintCopySourceReadReply } from "./current-footprint-copy-source-read.ts";
import { captureCurrentPcb209RatlineStopRecord } from "./current-pcb-209-ratline-stop-observation.ts";
import type { CurrentPcb209RatlineStopCapture } from "./current-pcb-209-ratline-stop-observation.ts";

export class CurrentFootprintSourceReplyCapture {
  #firstRejected: CurrentPcb209RatlineStopCapture | null = null;
  public firstRejected(): CurrentPcb209RatlineStopCapture | null { return this.#firstRejected; }
  public capture(input: unknown): ReturnType<typeof captureCurrentFootprintCopySourceReadReply> {
    // Reuse only the existing inert descriptor-copy algorithm. Its stop/event
    // Ownership and execution machinery is not involved. A large or hostile
    // Reply gets an explicit unavailable reason rather than truncated evidence.
    const snapshot = this.#firstRejected === null ? captureCurrentPcb209RatlineStopRecord(input, 32_768) : null;
    try { return captureCurrentFootprintCopySourceReadReply(input); }
    catch (error) { this.#firstRejected ??= snapshot; throw error; }
  }
}

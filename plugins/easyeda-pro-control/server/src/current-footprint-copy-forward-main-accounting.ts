/** Checks the original forward helper's cumulative main transport counters.
 * This adapter authenticates neither its supplied generation reference nor a
 * native connection. The original born-forward owner must supply both. */
import { types } from "node:util";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN } from "./current-footprint-copy-main-transport-contract.ts";
import { requireOriginalForwardLedgerBinding } from "./current-footprint-copy-forward-capacity.ts";
import type { CurrentFootprintCopyForwardLedgerBinding, CurrentFootprintCopyForwardResourceLedger } from "./current-footprint-copy-forward-capacity.ts";

interface Poll {
  readonly bytes: string;
  readonly receivedBytes: number;
  readonly frames: number;
  readonly payloadBytes: number;
}
function fail(code: string): never { throw new Error(`FOOTPRINT_FORWARD_MAIN_ACCOUNTING_${code}`); }
function count(value: unknown, maximum: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || Object.is(value, -0) || value > maximum) { fail("COUNT"); }
  return value;
}
function capture(raw: unknown): Poll {
  if (raw === null || typeof raw !== "object" || types.isProxy(raw) ||
      Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null) { fail("POLL_DATA"); }
  const keys = Reflect.ownKeys(raw), names = ["bytes", "receivedBytes", "frames"];
  if (keys.length !== names.length || keys.some(key => typeof key !== "string" || !names.includes(key))) { fail("POLL_FIELDS"); }
  function own(name: string): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(raw, name);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { fail("POLL_DATA"); }
    return descriptor.value as unknown;
  }
  const bytes = own("bytes"), frames = count(own("frames"), MAIN.frames), receivedBytes = count(own("receivedBytes"), MAIN.totalReceivedBytes);
  if (typeof bytes !== "string" || bytes.length > 43_692 || !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(bytes)) { fail("POLL_PAYLOAD"); }
  const payload = Buffer.from(bytes, "base64");
  if (payload.length > 32_768 || payload.toString("base64") !== bytes) { fail("POLL_PAYLOAD"); }
  return Object.freeze({ bytes, receivedBytes, frames, payloadBytes: payload.length });
}

export class CurrentFootprintCopyForwardMainAccounting {
  readonly #binding: CurrentFootprintCopyForwardLedgerBinding;
  readonly #original: object;
  #received = 0;
  #frames = 0;
  #delivered = 0;
  #failed = false;
  public readonly capture: (raw: unknown) => string;
  public readonly status: () => Readonly<{ failed: boolean; receivedBytes: number; frames: number; deliveredBytes: number; executionAuthorized: false }>;
  public constructor(ledger: CurrentFootprintCopyForwardResourceLedger, original: object) {
    this.#binding = requireOriginalForwardLedgerBinding(ledger); this.#original = original;
    // The ledger must already bind this exact original generation.
    // The zero-byte charge validates that reference without native traffic.
    this.#binding.consumeBytes("forward-writer", original, "main", 0);
    this.capture = (raw: unknown): string => this.#capture(raw);
    this.status = (): ReturnType<CurrentFootprintCopyForwardMainAccounting["status"]> => Object.freeze({
      failed: this.#failed, receivedBytes: this.#received, frames: this.#frames,
      deliveredBytes: this.#delivered, executionAuthorized: false });
    // Freeze both retained own functions against prototype substitution.
    // Private counters remain mutable.
    Object.freeze(this);
  }
  #capture(raw: unknown): string {
    if (this.#failed) { fail("UNAVAILABLE"); }
    try {
      this.#binding.requireOriginal(); const poll = capture(raw);
      if (poll.receivedBytes < this.#received || poll.frames < this.#frames ||
          poll.frames * 2 > poll.receivedBytes || poll.payloadBytes !== 0 && poll.frames === 0) { fail("COUNTER_DRIFT"); }
      const delivered = this.#delivered + poll.payloadBytes;
      // ReceivedBytes includes at least two header bytes for every wire frame.
      // PollMain adds one NUL per complete message, at most one per frame.
      // Removing both header bytes and adding that NUL costs at least one byte.
      // Buffered chunks may repeat counters, but cannot create more payload.
      if (!Number.isSafeInteger(delivered) || delivered > poll.receivedBytes - poll.frames) { fail("PAYLOAD_DRIFT"); }
      this.#binding.consumeBytes("forward-writer", this.#original, "main", poll.receivedBytes - this.#received);
      for (let frame = this.#frames; frame < poll.frames; frame += 1) {
        this.#binding.consumeMainFrame("forward-writer", this.#original, 0);
      }
      this.#binding.requireOriginal();
      this.#received = poll.receivedBytes; this.#frames = poll.frames; this.#delivered = delivered;
      return poll.bytes;
    } catch (error) { this.#failed = true; throw error; }
  }
}

/** Data-only first rejected parent stop. Complete bounded copies are available
 * only through the retained native owner's inspection; no packet is authority. */
import { types } from "node:util";
import { sha256Json, sha256Text } from "./core.ts";

type Failure = "malformed" | "oversized";
export type CurrentPcb209RatlineStopCapture = Readonly<{ status: "captured"; value: unknown; sha256: string; bytes: number }> |
  Readonly<{ status: Failure | "unavailable"; value: null; sha256: null; bytes: null }>;
export interface CurrentPcb209RatlineStopEvidence {
  readonly profile: "private.pcb209-ratline-rejected-stop.v1";
  readonly metadata: Readonly<{ transitionStarted: boolean; selectedContextObserved: boolean; originalUiUniqueContextId: string;
    selectedContextId: number | null; observedTopScriptContextId: number | null }>;
  readonly event: CurrentPcb209RatlineStopCapture;
  readonly script: CurrentPcb209RatlineStopCapture;
  readonly context: CurrentPcb209RatlineStopCapture;
  readonly executionAuthorized: false;
}
const malformed = new Error("PCB209_RATLINE_STOP_MALFORMED"), oversized = new Error("PCB209_RATLINE_STOP_OVERSIZED");
function refuse(status: Failure): never { throw status === "oversized" ? oversized : malformed; }
export function captureCurrentPcb209RatlineStopRecord(input: unknown, limit: number): CurrentPcb209RatlineStopCapture {
  let nodes = 0; const seen = new Set<object>();
  const copy = (value: unknown, depth: number): unknown => {
    nodes += 1; if (nodes > 1024 || depth > 12) { return refuse("oversized"); }
    if (value === null || typeof value === "boolean") { return value; }
    if (typeof value === "string") {
      if (value.length > limit) { return refuse("oversized"); } if (!value.isWellFormed()) { return refuse("malformed"); } return value;
    }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return refuse("malformed"); } return value; }
    if (typeof value !== "object" || types.isProxy(value) || seen.has(value)) { return refuse("malformed"); } seen.add(value);
    const own = (key: string): unknown => {
      const field = Object.getOwnPropertyDescriptor(value, key);
      if (field === undefined || !Object.hasOwn(field, "value") || field.enumerable !== true) { return refuse("malformed"); } return field.value as unknown;
    };
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || Reflect.ownKeys(value).length !== value.length + 1) { return refuse("malformed"); }
      if (value.length > 256) { return refuse("oversized"); }
      return Object.freeze(Array.from({ length: value.length }, (_, index) => copy(own(String(index)), depth + 1)));
    }
    const keys = Reflect.ownKeys(value), prototype: unknown = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) { return refuse("malformed"); }
    if (keys.length > 32) { return refuse("oversized"); }
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      if (typeof key !== "string" || !key.isWellFormed()) { return refuse("malformed"); }
      if (key.length > 128) { return refuse("oversized"); }
      Object.defineProperty(result, key, { value: copy(own(key), depth + 1), enumerable: true });
    }
    return Object.freeze(result);
  };
  try {
    const value = copy(input, 0); const text = JSON.stringify(value); const bytes = Buffer.byteLength(text);
    if (bytes > limit) { return refuse("oversized"); }
    return Object.freeze({ status: "captured", value, sha256: sha256Text(text), bytes });
  } catch (error) { return Object.freeze({ status: error === oversized ? "oversized" : "malformed", value: null, sha256: null, bytes: null }); }
}
const unavailable: CurrentPcb209RatlineStopCapture = Object.freeze({ status: "unavailable", value: null, sha256: null, bytes: null });
export function currentPcb209RatlineIsStop(input: unknown): boolean {
  if (input === null || typeof input !== "object" || types.isProxy(input)) { return false; }
  const descriptor = Object.getOwnPropertyDescriptor(input, "method");
  return descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "string" &&
    ["Debugger.paused", "Debugger.resumed", "Target.attachedToTarget"].includes(descriptor.value);
}
export function captureCurrentPcb209RatlineStop(input: unknown, script: CurrentPcb209RatlineStopCapture | null, context: CurrentPcb209RatlineStopCapture | null,
  metadata: CurrentPcb209RatlineStopEvidence["metadata"]): CurrentPcb209RatlineStopEvidence {
  return Object.freeze({ profile: "private.pcb209-ratline-rejected-stop.v1", metadata: Object.freeze({ ...metadata }),
    event: captureCurrentPcb209RatlineStopRecord(input, 32_768), script: script ?? unavailable,
    context: context ?? unavailable, executionAuthorized: false });
}
export function summarizeCurrentPcb209RatlineStop(value: CurrentPcb209RatlineStopEvidence): Readonly<{
  profile: "private.pcb209-ratline-rejected-stop-summary.v1"; evidenceSha256: string;
  eventStatus: CurrentPcb209RatlineStopCapture["status"]; scriptStatus: CurrentPcb209RatlineStopCapture["status"]; contextStatus: CurrentPcb209RatlineStopCapture["status"]; executionAuthorized: false;
}> {
  return Object.freeze({ profile: "private.pcb209-ratline-rejected-stop-summary.v1", evidenceSha256: sha256Json(value),
    eventStatus: value.event.status, scriptStatus: value.script.status, contextStatus: value.context.status, executionAuthorized: false });
}

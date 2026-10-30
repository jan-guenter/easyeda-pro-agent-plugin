/** Optional fixed window faults do not widen any other helper error envelope.
 * These snapshots grant no native ownership, retry or execution authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_WINDOW_FAILURE_ACTIONS, CURRENT_WINDOW_FAILURE_CHILD_REASONS, CURRENT_WINDOW_FAILURE_MAPPED_CODES, CURRENT_WINDOW_FAILURE_NATIVE_CODES, CURRENT_WINDOW_FAILURE_STAGES } from "./current-pcb-diagnostic-window-failure-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const coordinate = z.number().int().min(-1_000_000).max(1_000_000).refine(value => !Object.is(value, -0));
const count = z.number().int().min(0).refine(value => !Object.is(value, -0));
const childOwnershipSchema = z.object({ reason: z.enum(CURRENT_WINDOW_FAILURE_CHILD_REASONS),
  visited: count.min(1).max(257), visible: count.max(256), nativeError: count.max(4_294_967_295).nullable(),
}).strict().refine(value => {
  if (value.visible > value.visited) { return false; }
  if (value.reason === "descendant-limit") { return value.visited === 257 && value.nativeError === null; }
  if (value.visited > 256 || value.visible < 1) { return false; }
  if (["different-process", "process-not-live", "process-identity", "process-outside-job", "process-image", "window-linkage-changed"].includes(value.reason)) { return value.nativeError === null; }
  if (value.reason === "window-disappeared") { return value.nativeError === 1400; }
  return value.nativeError !== null && (value.reason !== "pid-query-failed" || value.nativeError !== 1400);
});
export const currentWindowFailureSchema = z.object({ schema: z.literal("easyeda-pro-control.window-failure.v1"),
  action: z.enum(CURRENT_WINDOW_FAILURE_ACTIONS), stage: z.enum(CURRENT_WINDOW_FAILURE_STAGES),
  code: z.enum([...CURRENT_WINDOW_FAILURE_NATIVE_CODES, ...CURRENT_WINDOW_FAILURE_MAPPED_CODES]),
  paintPhase: z.enum(["not-dispatched", "possibly-dispatched", "unknown"]), nativeResourcesRetained: z.boolean().nullable(),
  bounds: z.object({ left: coordinate, top: coordinate, right: coordinate, bottom: coordinate }).strict().nullable(),
  childOwnership: childOwnershipSchema.nullable().optional(),
  snapshotOnly: z.literal(true), executionAuthorized: z.literal(false),
}).strict();
export type CurrentWindowFailure = Readonly<z.infer<typeof currentWindowFailureSchema>>;
export type CurrentWindowFailureAction = typeof CURRENT_WINDOW_FAILURE_ACTIONS[number];
export function currentWindowFailureAction(value: unknown): CurrentWindowFailureAction | null {
  return CURRENT_WINDOW_FAILURE_ACTIONS.find(action => action === value) ?? null;
}
export function currentWindowReleaseFailure(code: string): boolean {
  return code === "pcb-diagnostic-window-capture-release-before-exit" || code === "pcb-diagnostic-window-capture-gdi-release" || code === "pcb-diagnostic-window-capture-child-release";
}
export function decodeCurrentWindowFailure(input: unknown, action: CurrentWindowFailureAction, nativeCode: string): CurrentWindowFailure {
  const captured = captureCurrentPcbStringClockReply(input);
  if (Buffer.byteLength(captured.text) > 4096) { throw new Error("PCB_WINDOW_FAILURE_BOUND"); }
  const value = currentWindowFailureSchema.parse(captured.value);
  const known = CURRENT_WINDOW_FAILURE_NATIVE_CODES.find(code => `pcb-diagnostic-${code}` === nativeCode);
  const children = value.childOwnership;
  if (value.action !== action || known !== undefined && value.code !== known ||
      known === undefined && !CURRENT_WINDOW_FAILURE_MAPPED_CODES.some(code => code === value.code) ||
      action === "release" && (!currentWindowReleaseFailure(nativeCode) || value.stage !== "cleanup" || value.bounds !== null) ||
      value.code.endsWith("-fields") && (value.stage !== "request" || value.bounds !== null) ||
      children !== undefined && children !== null && (action !== "capture-window" || value.code !== "window-capture-child-ownership" ||
        !["children", "before-paint", "after-paint", "after-encoding"].includes(value.stage)) ||
      (value.code === "encoding-capacity" || value.code === "encoding-io") && value.stage !== "encoding") {
    throw new Error("PCB_WINDOW_FAILURE_SCOPE");
  }
  return freezeDeep(value);
}
export function currentWindowFailureLabelOnly(action: CurrentWindowFailureAction, nativeCode: string): CurrentWindowFailure | null {
  if (action === "release" && !currentWindowReleaseFailure(nativeCode)) { return null; }
  const code = CURRENT_WINDOW_FAILURE_NATIVE_CODES.find(candidate => `pcb-diagnostic-${candidate}` === nativeCode) ?? "unclassified";
  return freezeDeep(currentWindowFailureSchema.parse({ schema: "easyeda-pro-control.window-failure.v1", action,
    stage: action === "release" ? "cleanup" : "unclassified", code, paintPhase: "unknown", nativeResourcesRetained: null,
    bounds: null, snapshotOnly: true, executionAuthorized: false }));
}

/** Pre-action finite envelope reservation for the complete writer's local
 * two-string proof. Data reservations cannot issue a native owner or resume. */
import { types } from "node:util";
import { requireCurrentFootprintForwardWriterCopyLocalBodyCapacity } from "./current-footprint-forward-writer-copy-local-wire.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_LOCAL_REQUESTS, currentFootprintForwardWriterCopyLocalNativeCases } from "./current-footprint-forward-writer-copy-local-protocol.ts";
import { requireCurrentFootprintForwardWriterMainRequestReservation } from "./current-footprint-forward-writer-main-request-plan.ts";
import type { CurrentFootprintForwardWriterMainRequestReservation } from "./current-footprint-forward-writer-main-request-plan.ts";

export interface CurrentFootprintForwardWriterCopyLocalReservation {
  readonly profile: "private.current-footprint-forward-writer-copy-local-reservation.v1";
  readonly commands: 21;
  readonly maximumInspectorBytes: number;
  readonly executionAuthorized: false;
}
interface Original { readonly request: CurrentFootprintForwardWriterMainRequestReservation; readonly maximumBodyBytes: number; readonly projectUuid: string; readonly branchUuid: string }
const originals = new WeakMap<CurrentFootprintForwardWriterCopyLocalReservation, Original>();
/** Maximal original handle widths and the already reserved exact source body
 * are checked before any native Create may be admitted by a later composer. */
export function reserveCurrentFootprintForwardWriterCopyLocal(request: CurrentFootprintForwardWriterMainRequestReservation): CurrentFootprintForwardWriterCopyLocalReservation {
  const plan = requireCurrentFootprintForwardWriterMainRequestReservation(request);
  let maximumInspectorBytes = requireCurrentFootprintForwardWriterCopyLocalBodyCapacity(plan.dataStr);
  for (const input of currentFootprintForwardWriterCopyLocalNativeCases()) {
    const params: Record<string, unknown> = { ...input.params };
    if (input.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = "x".repeat(256); }
    else if (input.method !== "Debugger.resume") { params["objectId"] = "x".repeat(256); }
    if (input.method === "Runtime.callFunctionOn") {
      params["arguments"] = input.params.arguments.map(argument => "objectId" in argument ? { objectId: "x".repeat(256) } :
        { value: argument.value.startsWith("https://client/upload/") ? `https://client/upload/${plan.branchUuid}?key=${"f".repeat(16)}` : plan.dataStr });
    }
    const message = `${JSON.stringify({ id: 2_147_483_647, method: input.method, params, sessionId: "x".repeat(128) })}\0`;
    maximumInspectorBytes = Math.max(maximumInspectorBytes, Buffer.byteLength(message));
  }
  if (maximumInspectorBytes > 16_384 || CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_LOCAL_REQUESTS.cdpRequests !== 21) { throw new Error("FORWARD_COPY_LOCAL_ENVELOPE_RESERVATION"); }
  const token: CurrentFootprintForwardWriterCopyLocalReservation = Object.freeze({ profile: "private.current-footprint-forward-writer-copy-local-reservation.v1", commands: 21, maximumInspectorBytes, executionAuthorized: false });
  originals.set(token, Object.freeze({ request, maximumBodyBytes: Buffer.byteLength(plan.dataStr), projectUuid: plan.projectUuid, branchUuid: plan.branchUuid })); return token;
}
/** Reproof keeps the original reservation reference after the Main plan has
 * consumed its late-binding slot; it never reopens that slot. */
export function requireCurrentFootprintForwardWriterCopyLocalReservation(token: CurrentFootprintForwardWriterCopyLocalReservation,
  request: CurrentFootprintForwardWriterMainRequestReservation): Readonly<Original> {
  const original = originals.get(token);
  if (types.isProxy(token) || original === undefined || original.request !== request) { throw new Error("FORWARD_COPY_LOCAL_ORIGINAL_RESERVATION"); }
  return original;
}

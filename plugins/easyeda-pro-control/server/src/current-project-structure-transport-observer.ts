/** Original structure XHR observations. A held send needs the same body grant;
 * its return needs the actual main publication. Failure never resumes either. */
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { consumeOriginalCurrentProjectStructureMainPublication, requireOriginalCurrentProjectStructureTransportBodyReservation,
  requireOriginalCurrentProjectStructureTransportMainPublication, requireOriginalCurrentProjectStructureTransportOrigin } from "./current-pcb-diagnostic-owner.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentProjectStructureBodyReservation, CurrentProjectStructureMainPublication, CurrentProjectStructureTransportBindings,
  CurrentProjectStructureTransportOrigin } from "./current-project-structure-transport-origin.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_CALL_FLAGS as CALL, CURRENT_PROJECT_STRUCTURE_TRANSPORT_CONDITION as CONDITION, CURRENT_PROJECT_STRUCTURE_TRANSPORT_FRAME_FLAGS as FRAME,
  CURRENT_PROJECT_STRUCTURE_TRANSPORT_PROGRAMS as PROGRAMS,
  CURRENT_PROJECT_STRUCTURE_TRANSPORT_REQUESTS as REQUESTS, CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES as SITES,
  validateCurrentProjectStructureTransportCommand } from "./current-project-structure-transport-protocol.ts";
import type { CurrentProjectStructureTransportRole as Role } from "./current-project-structure-transport-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), location, functionLocation: location });
const paused = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
const event = z.strictObject({ method: z.enum(["Debugger.paused", "Debugger.resumed"]), sessionId: handle, params: z.unknown() });
const value = z.strictObject({ projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
  ticket: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), structureText: z.string().min(1).max(9999).refine(text => text.isWellFormed()) });
type Value = z.infer<typeof value>;
export interface CurrentProjectStructureHeldTransport {
  readonly profile: "private.current-project-structure-held-transport.v1";
}
interface Original { readonly observer: CurrentProjectStructureTransportObserver; readonly value: Value }
const issued = new WeakMap<CurrentProjectStructureHeldTransport, Original>();
function need(condition: boolean, code: string): asserts condition { if (!condition) { throw new Error(`PROJECT_STRUCTURE_TRANSPORT_OBSERVER_${code}`); } }

export class CurrentProjectStructureTransportObserver {
  readonly #origin: CurrentProjectStructureTransportOrigin; readonly #owner: object; readonly #operation: object;
  readonly #binding: CurrentProjectStructureTransportBindings; readonly #points = new Map<Role, string>();
  #busy = false; #armAttempted = false; #armed = false; #failed = false; #retired = false;
  #normal = 0; #events = 0; #sendAttempted = false; #sendReleaseAttempted = false; #sendReleased = false;
  #returnAttempted = false; #returned = false; #returnReleaseAttempted = false; #completed = false;
  #capture: string | null = null; #packetHandle: string | null = null; #packet: CurrentProjectStructureHeldTransport | null = null;
  #body: CurrentProjectStructureBodyReservation | null = null; #publication: CurrentProjectStructureMainPublication | null = null;
  public constructor(origin: CurrentProjectStructureTransportOrigin, owner: object, operation: object) {
    this.#origin = origin; this.#owner = owner; this.#operation = operation;
    this.#binding = requireOriginalCurrentProjectStructureTransportOrigin(origin, owner, operation); Object.freeze(this);
  }
  async #current(observing: boolean): Promise<void> {
    need(!this.#failed && !this.#retired && requireOriginalCurrentProjectStructureTransportOrigin(this.#origin, this.#owner, this.#operation) === this.#binding, "ORIGINAL");
    if (observing) { this.#binding.assertOperationPending(); } await this.#binding.assertCurrent();
    need(!this.#failed && !this.#retired && requireOriginalCurrentProjectStructureTransportOrigin(this.#origin, this.#owner, this.#operation) === this.#binding, "CHANGED");
    if (observing) { this.#binding.assertOperationPending(); }
  }
  #fail(): void { if (!this.#failed) { this.#failed = true; this.#binding.fail(); } }
  async #send(input: unknown, observing: boolean): Promise<unknown> {
    await this.#current(observing); const command = validateCurrentProjectStructureTransportCommand(input);
    this.#normal += 1; need(this.#normal <= REQUESTS.normal, "REQUEST_BOUND");
    const reply = captureCurrentPcbStringClockReply(await this.#binding.request(command, false)).value;
    await this.#current(observing); return reply;
  }
  /** Before the project source resumes. No original application call or XHR
   * runs here, and the error site remains armed through the original exit. */
  public async arm(): Promise<void> {
    need(!this.#busy && !this.#armAttempted && !this.#retired, "ARM_CONSUMED"); this.#armAttempted = true; this.#busy = true;
    try {
      this.#capture = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "project-structure-transport-capture", method: "Runtime.callFunctionOn",
        params: { ...CALL, uniqueContextId: this.#binding.uniqueContextId, functionDeclaration: PROGRAMS.capture, arguments: [], returnByValue: false } }, false), 7);
      for (const role of ["send", "returned", "failed"] as const) {
        const site = SITES[role]; const expected = { scriptId: this.#binding.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber };
        const reply = z.strictObject({ breakpointId: handle, actualLocation: location }).parse(await this.#send({ phase: "project-structure-transport-arm", role,
          method: "Debugger.setBreakpoint", params: { location: expected, condition: CONDITION } }, false));
        need(reply.actualLocation.scriptId === expected.scriptId && reply.actualLocation.lineNumber === expected.lineNumber && reply.actualLocation.columnNumber === expected.columnNumber &&
          ![...this.#points.values()].includes(reply.breakpointId), "ORIGINAL_POINT"); this.#points.set(role, reply.breakpointId);
      }
      this.#armed = true;
    } catch (error) { this.#fail(); throw error; } finally { this.#busy = false; }
  }
  async #event(): Promise<z.infer<typeof event>> {
    await this.#current(true); this.#events += 1; need(this.#events <= REQUESTS.events, "EVENT_BOUND");
    const received = event.parse(captureCurrentPcbStringClockReply(await this.#binding.nextEvent()).value);
    await this.#current(true); need(received.sessionId === this.#binding.sessionId, "ORIGINAL_SESSION"); return received;
  }
  async #frame(role: "send" | "returned"): Promise<string> {
    const received = await this.#event(); need(received.method === "Debugger.paused", "ORIGINAL_PAUSE"); const pause = paused.parse(received.params), top = pause.callFrames[0];
    need(pause.hitBreakpoints[0] !== this.#points.get("failed"), "ORIGINAL_XHR_SEND_FAILED");
    const site = SITES[role]; need(top !== undefined && pause.hitBreakpoints[0] === this.#points.get(role) && top.functionName === site.name &&
      top.location.scriptId === this.#binding.scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber &&
      top.functionLocation.scriptId === this.#binding.scriptId && top.functionLocation.lineNumber === site.lineNumber && top.functionLocation.columnNumber === site.functionColumn, "ORIGINAL_FRAME");
    return decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "project-structure-transport-frame", role, method: "Debugger.evaluateOnCallFrame",
      params: { ...FRAME, callFrameId: top.callFrameId, expression: site.expression } }, true), site.length);
  }
  #original(packet: CurrentProjectStructureHeldTransport): Value {
    const original = issued.get(packet); need(this.#packet === packet && original?.observer === this, "ORIGINAL_PACKET"); return original.value;
  }
  public async observeSend(): Promise<CurrentProjectStructureHeldTransport> {
    need(this.#armed && !this.#busy && !this.#sendAttempted, "SEND_CONSUMED"); this.#sendAttempted = true; this.#busy = true;
    try {
      const originalFrame = await this.#frame("send"); need(this.#capture !== null, "ORIGINAL_INTRINSICS");
      this.#packetHandle = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "project-structure-transport-send", method: "Runtime.callFunctionOn",
        params: { ...CALL, objectId: originalFrame, functionDeclaration: PROGRAMS.send, arguments: [{ objectId: this.#capture }], returnByValue: false } }, true), 3);
      const result = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value }) }).parse(await this.#send({ phase: "project-structure-transport-value", method: "Runtime.callFunctionOn",
        params: { ...CALL, objectId: this.#packetHandle, functionDeclaration: PROGRAMS.value, arguments: [], returnByValue: true } }, true));
      const packet: CurrentProjectStructureHeldTransport = Object.freeze({ profile: "private.current-project-structure-held-transport.v1" });
      issued.set(packet, Object.freeze({ observer: this, value: Object.freeze(result.result.value) })); this.#packet = packet; return packet;
    } catch (error) { this.#fail(); throw error; } finally { this.#busy = false; }
  }
  async #resume(role: "send" | "returned"): Promise<void> {
    z.strictObject({}).parse(await this.#send({ phase: "project-structure-transport-resume", role, method: "Debugger.resume", params: {} }, true));
    const received = await this.#event(); need(received.method === "Debugger.resumed", "ORIGINAL_RESUME_ACK"); z.strictObject({}).parse(received.params);
  }
  /** The shared packet observer must first consume this same reservation.
   * Equality with a caller-supplied body cannot authorize the original send. */
  public async releaseSend(packet: CurrentProjectStructureHeldTransport, reservation: CurrentProjectStructureBodyReservation): Promise<void> {
    need(!this.#busy && !this.#sendReleaseAttempted, "SEND_RELEASE_CONSUMED"); const actual = this.#original(packet);
    this.#sendReleaseAttempted = true; this.#busy = true;
    try {
      const expected = requireOriginalCurrentProjectStructureTransportBodyReservation(reservation, this.#origin, this.#owner, this.#operation);
      need(actual.projectUuid === expected.projectUuid && actual.branchUuid === expected.branchUuid && actual.ticket === expected.saveHeadTicket && actual.structureText === expected.expectedStructureText, "EXACT_BODY");
      this.#body = reservation; await this.#resume("send"); this.#sendReleased = true;
    } catch (error) { this.#fail(); throw error; } finally { this.#busy = false; }
  }
  public async observeReturned(packet: CurrentProjectStructureHeldTransport): Promise<void> {
    this.#original(packet); need(!this.#busy && this.#sendReleased && !this.#returnAttempted, "RETURN_CONSUMED"); this.#returnAttempted = true; this.#busy = true;
    try {
      const originalFrame = await this.#frame("returned"); need(this.#packetHandle !== null, "ORIGINAL_SEND");
      decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "project-structure-transport-returned", method: "Runtime.callFunctionOn",
        params: { ...CALL, objectId: originalFrame, functionDeclaration: PROGRAMS.returned, arguments: [{ objectId: this.#packetHandle }], returnByValue: false } }, true), 2); this.#returned = true;
    } catch (error) { this.#fail(); throw error; } finally { this.#busy = false; }
  }
  /** Native main SQL and the actual original response finalizer supply the
   * publication. This does not claim full worker or durable completion. */
  public async releaseReturned(packet: CurrentProjectStructureHeldTransport, publication: CurrentProjectStructureMainPublication): Promise<void> {
    const actual = this.#original(packet); need(!this.#busy && this.#returned && !this.#returnReleaseAttempted && this.#body !== null, "RETURN_RELEASE_CONSUMED");
    this.#returnReleaseAttempted = true; this.#busy = true;
    try {
      const expected = consumeOriginalCurrentProjectStructureMainPublication(publication, this.#owner, this.#operation);
      need(requireOriginalCurrentProjectStructureTransportMainPublication(publication, this.#origin, this.#owner, this.#operation) === expected &&
        actual.projectUuid === expected.projectUuid && actual.branchUuid === expected.branchUuid && actual.ticket === expected.ticket && sha256Text(actual.structureText) === expected.structureSha256, "ORIGINAL_MAIN_PUBLICATION");
      this.#publication = publication; await this.#resume("returned"); this.#completed = true;
    } catch (error) { this.#fail(); throw error; } finally { this.#busy = false; }
  }
  /** Keep every observational guard installed through root/empty-Job proof.
   * An error or lost resume ACK is never converted into a cleanup resume. */
  public async retireAfterOriginalExit(): Promise<void> {
    need(!this.#busy && !this.#retired, "RETIRE_STATE"); await this.#binding.assertOriginalGenerationExited(); this.#retired = true;
  }
  public status(): Readonly<{ armed: boolean; failed: boolean; busy: boolean; sendHeld: boolean; sendResumed: boolean; returnHeld: boolean; completed: boolean; retired: boolean; publicationJoined: boolean; executionAuthorized: false; persistenceVerified: false }> {
    return Object.freeze({ armed: this.#armed, failed: this.#failed, busy: this.#busy, sendHeld: this.#packet !== null && !this.#sendReleased,
      sendResumed: this.#sendReleased, returnHeld: this.#returned && !this.#completed, completed: this.#completed, retired: this.#retired,
      publicationJoined: this.#publication !== null, executionAuthorized: false, persistenceVerified: false });
  }
}

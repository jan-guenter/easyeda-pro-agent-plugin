/** Fixed loading collector. Structural bindings issue no owner authority;
 * only the enclosing original saved reader may retain and qualify this instance. */
/* oxlint-disable import/max-dependencies -- This one finite collector joins independent source, native-function, tuple and history-data validators. */
import { z } from "zod";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as CACHE_PROFILES, decodeCurrentNativeCacheResponseIntrinsic } from "./current-native-cache-response-intrinsics.ts";
import { CURRENT_NATIVE_FETCH_BYTES_PROFILES as BYTES_PROFILES, decodeCurrentNativeFetchBytesIntrinsic } from "./current-native-fetch-bytes-intrinsics.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture as captureArray, decodeCurrentFootprintCopyClockRpcV2Array as decodeArray, currentFootprintCopyClockRpcV2ArrayObject as reference } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_CALL_FLAGS as FLAGS, CURRENT_PCB_VIA_SAVED_LOAD_FRAME_FLAGS as FRAME_FLAGS,
  CURRENT_PCB_VIA_SAVED_LOAD_INTRINSIC_CALLS as INTRINSICS, CURRENT_PCB_VIA_SAVED_LOAD_ARRAY_LENGTHS as LENGTHS, CURRENT_PCB_VIA_SAVED_LOAD_OBSERVATION_REQUESTS as REQUESTS, validateCurrentPcbViaSavedLoadObservationCommand } from "./current-pcb-via-saved-load-observation-protocol.ts";
import type { CurrentPcbViaSavedLoadIntrinsicRole, CurrentPcbViaSavedLoadObservationCommand } from "./current-pcb-via-saved-load-observation-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_CALLS as CALLS, CURRENT_PCB_VIA_SAVED_LOAD_FLOW_CALL as FLOW } from "./current-pcb-via-saved-load-programs.ts";
import { CurrentPcbViaSavedLoadProgress } from "./current-pcb-via-saved-load-progress.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_FLOW_METHODS as FLOW_METHODS, CURRENT_PCB_VIA_SAVED_LOAD_READ_ROLES as READ_ROLES, CURRENT_PCB_VIA_SAVED_LOAD_ROLES as ROLES, CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES, qualifyCurrentPcbViaSavedLoadSource } from "./current-pcb-via-saved-load-source.ts";
import type { CurrentPcbViaSavedLoadRole } from "./current-pcb-via-saved-load-source.ts";
import type { CurrentPcbViaSavedLoadData } from "./current-pcb-via-saved-load-plan.ts";
import type { CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaSavedLoadObserverBindings {
  readonly source: CurrentPcbViaSavedLoadProjectSourceHeld; readonly sessionId: string; readonly data: CurrentPcbViaSavedLoadData;
  readonly request: (command: CurrentPcbViaSavedLoadObservationCommand) => Promise<unknown>;
  /** Verifies the exact original scriptParsed event/source for the just-settled
   * fixed evaluation. It owns the original source request, never another poll. */
  readonly helper: (source: string) => Promise<void>;
  readonly registerPoint: (role: CurrentPcbViaSavedLoadRole, breakpointId: string) => void;
  readonly nextEvent: () => Promise<DiagnosticEvent>; readonly reserveResume: (role: CurrentPcbViaSavedLoadRole) => void;
  readonly whenProjectStarted: () => Promise<void>; readonly assertCurrent: () => Promise<void>; readonly fail: () => void;
}
const empty = z.strictObject({}), handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const booleanResult = z.strictObject({ type: z.literal("boolean"), value: z.literal(true) });
const booleanProof = z.strictObject({ result: booleanResult });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), functionLocation: location, location });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_READBACK_LOAD_OBSERVER"); } }
function flowMethod(input: unknown, role: keyof typeof FLOW_METHODS, scriptId: string): void {
  const remote = z.looseObject({ type: z.string(), value: z.unknown().optional(), objectId: handle.optional(), subtype: z.string().optional() });
  const property = z.looseObject({ name: z.string(), value: remote, writable: z.literal(false), configurable: z.literal(true), enumerable: z.literal(false), isOwn: z.literal(true) });
  const internal = z.strictObject({ name: z.string(), value: remote });
  const reply = z.strictObject({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).parse(captureCurrentPcbStringClockReply(input).value);
  const expected = FLOW_METHODS[role], fields = new Map(reply.result.map(item => [item.name, item.value])), parts = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  need(fields.size === 2 && fields.get("name")?.type === "string" && fields.get("name")?.value === expected.name && fields.get("length")?.type === "number" && fields.get("length")?.value === expected.arity && parts.size === 3);
  const at = location.parse(parts.get("[[FunctionLocation]]")?.value); need(at.scriptId === scriptId && at.lineNumber === expected.lineNumber && at.columnNumber === expected.columnNumber &&
    parts.get("[[FunctionLocation]]")?.subtype === "internal#location" && parts.get("[[Scopes]]")?.subtype === "internal#scopeList" && parts.get("[[Prototype]]")?.type === "function");
}
export interface CurrentPcbViaSavedLoadObservedData {
  readonly schema: "private.current-pcb-via-saved-cold-load-data.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly headHistoryUuid: string; readonly sourceSha256: string;
  readonly exactCipherAndPlaintextChunks: 2; readonly emptyLocalIndexObserved: true; readonly originalReadyAndResumeObserved: true;
  readonly nativeOwnershipVerified: false; readonly runtimeModelCompared: false; readonly reopenedVerified: false; readonly cachePublicationCompleted: false;
}
export class CurrentPcbViaSavedLoadObserver {
  readonly #bindings: CurrentPcbViaSavedLoadObserverBindings; readonly #progress: CurrentPcbViaSavedLoadProgress;
  readonly #points = new Map<CurrentPcbViaSavedLoadRole, string>();
  #arm: Promise<void> | null = null; #work: Promise<CurrentPcbViaSavedLoadObservedData> | null = null; #armed = false; #failed = false;
  #normal = 0; #continuation = 0; #helpers = 0; #cache: string | null = null; #bytes: string | null = null; #project: string | null = null;
  public constructor(bindings: CurrentPcbViaSavedLoadObserverBindings) {
    qualifyCurrentPcbViaSavedLoadSource(bindings.source.source); this.#bindings = bindings; this.#progress = new CurrentPcbViaSavedLoadProgress(bindings.data); Object.freeze(this);
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  async #send(command: CurrentPcbViaSavedLoadObservationCommand): Promise<unknown> {
    await this.#current(); validateCurrentPcbViaSavedLoadObservationCommand(command);
    if (command.phase === "saved-observe-resume" || command.phase === "saved-observe-start-project") { this.#continuation += 1; need(this.#continuation <= REQUESTS.continuation); }
    else { this.#normal += 1; need(this.#normal + this.#helpers <= REQUESTS.normal); }
    const reply = captureCurrentPcbStringClockReply(await this.#bindings.request(command)).value; await this.#current();
    if (command.method === "Runtime.callFunctionOn" || command.method === "Debugger.evaluateOnCallFrame") {
      const source = command.method === "Runtime.callFunctionOn" ? `(${command.params.functionDeclaration})` : command.params.expression;
      await this.#bindings.helper(source); await this.#current(); this.#helpers += 1; need(this.#helpers <= REQUESTS.helperSources && this.#normal + this.#helpers <= REQUESTS.normal);
    }
    return reply;
  }
  async #properties(objectId: string, role: keyof typeof LENGTHS): Promise<ReturnType<typeof decodeArray>> {
    return decodeArray(await this.#send({ phase: "saved-observe-array", role, method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), LENGTHS[role]);
  }
  #intrinsic(role: CurrentPcbViaSavedLoadIntrinsicRole, receiver?: string): Promise<unknown> {
    const call = INTRINSICS[role]; return this.#send(validateCurrentPcbViaSavedLoadObservationCommand({ phase: "saved-observe-intrinsic", role, method: "Runtime.callFunctionOn",
      params: { ...FLAGS, ...(role.endsWith("Constructors") ? { uniqueContextId: this.#bindings.source.uniqueContextId } : { objectId: receiver }), functionDeclaration: call.program, arguments: [], returnByValue: call.returnByValue } }));
  }
  async #metadata(role: "cache" | "bytes", tuple: ReturnType<typeof decodeArray>, constructors: boolean): Promise<void> {
    const profiles = (role === "cache" ? CACHE_PROFILES : BYTES_PROFILES).filter(profile => (profile.index <= 3) === constructors);
    for (const profile of profiles) {
      const reply = await this.#send({ phase: "saved-observe-native", role, index: profile.index, method: "Runtime.getProperties",
        params: { objectId: reference(tuple, profile.index), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
      if (role === "cache") { decodeCurrentNativeCacheResponseIntrinsic(reply, profile.index); } else { decodeCurrentNativeFetchBytesIntrinsic(reply, profile.index); }
    }
  }
  public arm(): Promise<void> {
    if (this.#arm !== null) { return this.#arm; }
    const arm = (async (): Promise<void> => {
      try {
        const cacheConstructors = captureArray(await this.#intrinsic("cacheConstructors"), LENGTHS.cacheConstructors);
        await this.#metadata("cache", await this.#properties(cacheConstructors, "cacheConstructors"), true);
        const cacheMembers = captureArray(await this.#intrinsic("cacheMembers", cacheConstructors), LENGTHS.cacheMembers);
        await this.#metadata("cache", await this.#properties(cacheMembers, "cacheMembers"), false);
        const cacheProof = await this.#intrinsic("cacheReprove", cacheMembers); need(booleanProof.safeParse(cacheProof).success); this.#cache = cacheMembers;
        const bytesConstructors = captureArray(await this.#intrinsic("bytesConstructors"), LENGTHS.bytesConstructors);
        await this.#metadata("bytes", await this.#properties(bytesConstructors, "bytesConstructors"), true);
        const bytesMembers = captureArray(await this.#intrinsic("bytesMembers", bytesConstructors), LENGTHS.bytesMembers);
        await this.#metadata("bytes", await this.#properties(bytesMembers, "bytesMembers"), false);
        const bytesProof = await this.#intrinsic("bytesReprove", bytesMembers); need(booleanProof.safeParse(bytesProof).success); this.#bytes = bytesMembers;
        for (const role of ROLES) { const site = SITES[role]; const armed = z.strictObject({ breakpointId: handle, actualLocation: location }).parse(await this.#send({ phase: "saved-observe-arm", role, method: "Debugger.setBreakpoint",
          params: { location: { scriptId: this.#bindings.source.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }));
          need(armed.actualLocation.scriptId === this.#bindings.source.scriptId && armed.actualLocation.lineNumber === site.lineNumber && armed.actualLocation.columnNumber === site.columnNumber && ![...this.#points.values()].includes(armed.breakpointId));
          this.#points.set(role, armed.breakpointId); this.#bindings.registerPoint(role, armed.breakpointId);
        }
        need(this.#points.size === ROLES.length && this.#helpers === REQUESTS.intrinsicCalls); await this.#current(); this.#armed = true;
      } catch (caughtError) { this.#failed = true; this.#bindings.fail(); throw caughtError; }
    })(); this.#arm = arm; return arm;
  }
  public observe(): Promise<CurrentPcbViaSavedLoadObservedData> {
    if (this.#work !== null) { return this.#work; } need(this.#armed);
    const work = (async (): Promise<CurrentPcbViaSavedLoadObservedData> => {
      try {
        await this.#bindings.whenProjectStarted(); await this.#current();
        for (let count = 0; count < REQUESTS.normalPauses; count += 1) {
          const event = await this.#bindings.nextEvent(); await this.#current(); need(event.sessionId === this.#bindings.sessionId && event.method === "Debugger.paused");
          const paused = pause.parse(captureCurrentPcbStringClockReply(event.params).value), role = READ_ROLES.find(item => this.#points.get(item) === paused.hitBreakpoints[0]); need(role !== undefined && SITES[role].count > 0);
          const site = SITES[role], top = paused.callFrames[0]; need(top !== undefined && top.functionName === site.functionName && top.location.scriptId === this.#bindings.source.scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber &&
            top.functionLocation.scriptId === this.#bindings.source.scriptId && top.functionLocation.lineNumber === site.functionLine && top.functionLocation.columnNumber === site.functionColumn);
          const objectId = captureArray(await this.#send({ phase: "saved-observe-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FRAME_FLAGS, callFrameId: top.callFrameId, expression: site.expression } }), site.length);
          if (role === "branch") { need(this.#project === null); this.#project = reference(await this.#properties(objectId, "project"), 0); }
          if (role === "fetchEntry") {
            await this.#properties(objectId, "flowEntry");
            const functions = captureArray(await this.#send({ phase: "saved-observe-flow-functions", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: FLOW, arguments: [], returnByValue: false } }), 2);
            const tuple = await this.#properties(functions, "flowFunctions");
            for (const [index, key] of (["update", "end"] as const).entries()) { flowMethod(await this.#send({ phase: "saved-observe-flow-method", role: key, method: "Runtime.getProperties",
              params: { objectId: reference(tuple, index), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), key, this.#bindings.source.scriptId); }
          }
          need(this.#cache !== null && this.#bytes !== null && this.#project !== null);
          const value = await this.#send({ phase: "saved-observe-value", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS[role],
            arguments: [{ objectId: this.#cache }, { objectId: this.#bytes }, { objectId: this.#project }], returnByValue: true } });
          this.#progress.accept(role, value); this.#bindings.reserveResume(role); empty.parse(await this.#send({ phase: "saved-observe-resume", role, method: "Debugger.resume", params: {} }));
          const resumed = await this.#bindings.nextEvent(); await this.#current(); need(resumed.sessionId === this.#bindings.sessionId && resumed.method === "Debugger.resumed"); empty.parse(resumed.params);
        }
        need(this.#progress.status().complete && !this.#progress.status().failed && this.#helpers === REQUESTS.helperSources && this.#normal + this.#helpers === REQUESTS.normal && this.#continuation === REQUESTS.normalPauses);
        return freezeDeep({ schema: "private.current-pcb-via-saved-cold-load-data.v1", projectUuid: this.#bindings.data.projectUuid, branchUuid: this.#bindings.data.branchUuid, documentUuid: this.#bindings.data.documentUuid,
          headHistoryUuid: this.#bindings.data.headHistoryUuid, sourceSha256: this.#bindings.data.sourceSha256, exactCipherAndPlaintextChunks: 2, emptyLocalIndexObserved: true, originalReadyAndResumeObserved: true,
          nativeOwnershipVerified: false, runtimeModelCompared: false, reopenedVerified: false, cachePublicationCompleted: false });
      } catch (caughtError) { this.#failed = true; this.#bindings.fail(); throw caughtError; }
    })(); this.#work = work; return work;
  }
  public status(): Readonly<{ armed: boolean; failed: boolean; complete: boolean; nativeOwnershipVerified: false }> { return Object.freeze({ armed: this.#armed, failed: this.#failed, complete: this.#progress.status().complete && this.#helpers === REQUESTS.helperSources && !this.#failed, nativeOwnershipVerified: false }); }
}

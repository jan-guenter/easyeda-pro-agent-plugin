/* oxlint-disable import/max-dependencies -- The single explicitly synthetic channel fixture covers the disjoint clock, local and upload fixed grammars without a native owner. */
/** Actual full channel/ledger/cursor over explicitly synthetic original birth,
 * clock and constructor prerequisites. No production origin or native owner is
 * allocated; only the documented test seed can write these private fields. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyClockRpcChannelReservation, CurrentFootprintCopyCreateClockStartupChannel,
  CurrentFootprintForwardWriterCreateClockChannelRoute, requireCurrentFootprintForwardColdTail, requireCurrentFootprintForwardWriterCreateClockChannelRoute } from "../../src/current-pcb-worker-startup-channel.ts";
import type { CurrentFootprintForwardColdTail } from "../../src/current-footprint-forward-cold-continuation.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "../../src/current-footprint-copy-create-bindings.ts";
import type { CurrentFootprintCopyClockRpcV2Command } from "../../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import type { CurrentFootprintForwardWriterBranchQueryCommand } from "../../src/current-footprint-forward-writer-branch-query-protocol.ts";
import type { CurrentPcbViaUploadRequestCommand } from "../../src/current-pcb-via-upload-request-protocol.ts";
import type { CurrentFootprintForwardWriterCopyLocalCommand } from "../../src/current-footprint-forward-writer-copy-local-protocol.ts";

import type {CurrentPcbViaSaveDrainCommand} from "../../src/current-pcb-via-save-drain-protocol.ts";
import type {CurrentPcbViaSaveTailDeleteControlCommand} from "../../src/current-pcb-via-save-tail-delete-control-protocol.ts";
import type {CurrentPcbViaSaveTailObservationCommand} from "../../src/current-pcb-via-save-tail-observation-protocol.ts";
import type {currentFootprintForwardWriterPostHistorySyncWire} from "../../src/current-footprint-forward-writer-post-history-sync-wire.ts";

import type {CurrentFootprintForwardWriterOwnDataCommand} from "../../src/current-footprint-forward-writer-own-data-protocol.ts";

export type CreateClockNativeCommand = (CurrentFootprintForwardWriterOwnDataCommand & Readonly<{sessionId:string}>) | ((CurrentPcbViaSaveDrainCommand|CurrentPcbViaSaveTailDeleteControlCommand|CurrentPcbViaSaveTailObservationCommand|ReturnType<typeof currentFootprintForwardWriterPostHistorySyncWire>["command"]) & Readonly<{sessionId:string}>) | (CurrentFootprintForwardWriterBranchQueryCommand & Readonly<{ sessionId: string }>) | CurrentFootprintCopyClockRpcV2Command | (CurrentPcbViaUploadRequestCommand & Readonly<{ sessionId: string }>) | (CurrentFootprintForwardWriterCopyLocalCommand & Readonly<{ sessionId: string }>);
export interface CreateClockNativeHooks {
  readonly begin: () => void;
  readonly retire: () => Promise<void>;
  readonly create: () => void;
  readonly nextCommand: () => CreateClockNativeCommand;
  readonly request: (command: CreateClockNativeCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: () => Promise<void>;
  readonly takeEvent: () => object | null;
}
type Dependency = Awaited<ReturnType<CurrentFootprintCopyCreateClockStartupChannel["start"]>>;
interface Channel {
  start: () => Promise<Dependency>;
  producerForTest: () => Promise<unknown>;
  seedCreateForTest: (dependency: Dependency, command: unknown, clockLease: object, cold: object) => Promise<CurrentFootprintCopyClockRpcChannelReservation>;
  beginFootprintCreateClockRpc: (dependency: Dependency, reservation: CurrentFootprintCopyClockRpcChannelReservation) => Promise<CurrentFootprintForwardWriterCreateClockChannelRoute>;
  prepareBranchQueryForTest: () => void;
  requestForwardWriterCopyDrain:(dependency:Dependency,command:CurrentPcbViaSaveDrainCommand)=>Promise<unknown>;
  requestForwardWriterCopyPost:(dependency:Dependency,command:Parameters<typeof currentFootprintForwardWriterPostHistorySyncWire>[0])=>Promise<unknown>;
  requestForwardWriterCopyDelete:(dependency:Dependency,command:CurrentPcbViaSaveTailDeleteControlCommand)=>Promise<unknown>;
  requestForwardWriterCopyTailObservation:(dependency:Dependency,command:CurrentPcbViaSaveTailObservationCommand)=>Promise<unknown>;
  requestForwardWriterOwnData:(dependency:Dependency,command:CurrentFootprintForwardWriterOwnDataCommand)=>Promise<unknown>;
  qualifyForwardWriterOwnDataHelper:(dependency:Dependency,command:CurrentFootprintForwardWriterOwnDataCommand,program:string)=>Promise<unknown>;
  requestForwardWriterBranchQuery: (dependency: Dependency, command: CurrentFootprintForwardWriterBranchQueryCommand) => Promise<unknown>;
  requestForwardWriterCopyUpload: (dependency: Dependency, command: CurrentPcbViaUploadRequestCommand) => Promise<unknown>;
  requestForwardWriterCopyLocal: (dependency: Dependency, command: CurrentFootprintForwardWriterCopyLocalCommand) => Promise<unknown>;
  retainedFootprintClockRpc: () => Readonly<Record<string, unknown>>;
  status: () => Readonly<{ pendingReplies: number; nextRequestId: number }>;
  releaseAfterTermination: () => Promise<void>;
  beginForwardColdTail: (dependency: Dependency, pending: Awaited<ReturnType<CurrentFootprintForwardWriterCreateClockChannelRoute["dispatchCreate"]>>) => Promise<CurrentFootprintForwardColdTail>;
}
function object(value: unknown): Record<string, unknown> {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This test reads only synthetic ordinary protocol records after the assertion above.
  return value as Record<string, unknown>;
}
function createCommand(): object {
  return { method: "Runtime.callFunctionOn", sessionId: "worker", params: { objectId: "project",
    functionDeclaration: CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL.program,
    arguments: [...["bus", "manager", "consistency", "constructors", "methods"].map(objectId => ({ objectId })),
      { value: "a".repeat(64) }, { value: JSON.stringify({ uuid: "b".repeat(16), path: "a".repeat(64), isProject: true, docType: 4,
        title: "Copy", display_title: "Copy", description: "", custom_tags: "[]", source: "", version: "" }) },
      ...["prewrite-scope", "prewrite-original", "prewrite-upload"].map(objectId => ({ objectId }))],
    objectGroup: "easyeda-pro-control-worker-construction-v1", silent: true, returnByValue: true,
    generatePreview: false, throwOnSideEffect: false, awaitPromise: true, userGesture: false } };
}
export async function forwardWriterClockChannelFixture(early: boolean, clockLease: object, hooks: CreateClockNativeHooks, allocation = false,
  forward = false, firstRequestId = 100, startupCommand?: object): Promise<Readonly<{
  channel: Channel; dependency: Dependency; reservation: CurrentFootprintCopyClockRpcChannelReservation;
  requireRoute: typeof requireCurrentFootprintForwardWriterCreateClockChannelRoute;
  requireColdTail: typeof requireCurrentFootprintForwardColdTail;
  cold: { events: object[]; attached: object | null };
  state: { exited: boolean; lostWrite: boolean; createFrame: object | null; frames: object[]; sent: Record<string, unknown>[]; consumed: number };
}>> {
  const url = new URL("../../src/current-pcb-worker-startup-channel.ts", import.meta.url);
  const initial = await readFile(url, "utf8");
  const seed = `public prepareBranchQueryForTest():void{this.#clockRpc=null;this.#fullClock=null;this.#clockRpcHandoffPending=false;}
  public async seedCreateForTest(dependency: CurrentPcbWorkerStartupDependency, command: CurrentFootprintCopyNativeCreateCommand, clockLease: object, coldState: {events:object[];attached:object|null;startupCommand?:object}): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
    this.#openingConsumed=true;this.#footprintUiStarted=true;this.#footprintClockRegistrationStarted=true;
    this.#executionWorkerSession="worker";this.#executionChildContext="worker-context";this.#executionChildContextNumber=42;this.#workers.set("worker","worker-target");this.#forwardWriterProducerBound=true;
    const fullBinding={dependency,workerLease:clockLease,invocationLease:{},copyPlan:{},events:{acceptsPause:p=>p.hitBreakpoints?.[0]==="producer-point",paused:p=>coldState.events.push(p),resumed:()=>coldState.events.push({resumed:true}),lost:()=>{}},assertOriginal:async()=>{await dependency.assertOriginalOwner();},assertCleanup:()=>{},observeExited:async()=>{await this.retireForwardWriterClockAfterOriginalExit(dependency);}};
    this.#fullClock={origin:{profile:"private.current-footprint-forward-writer-clock-channel-origin.v1"},binding:fullBinding,reprove:()=>fullBinding};
    const binding = Object.freeze({issuer:{},clockLease,projectObjectId:"project",handles:[],prewriteHandles:["prewrite-scope","prewrite-original","prewrite-upload"],
      assertOriginal:async()=>{await dependency.assertOriginalOwner();},assertCleanup:()=>{},consumeBeforeInvocation:()=>{},requireInvocationConsumed:()=>{if(this.#clockRpc?.create?.dispatchAttempted!==true)throw Error("synthetic invocation not consumed");}});
    const create={allocation:true,binding,command,token:Object.freeze({profile:"private.current-footprint-copy-pending-create.v1"}),dispatchAttempted:false,pending:null,rejectedFrame:null};
    if(this.#wire===currentFootprintForwardExecutionStartupWire)this.#coldContinuation={lease:{profile:"synthetic"},dependency,workerSessionId:"worker",binding:{issuer:{},dependency,workerLease:clockLease,
      assertCleanup:()=>{},remainingRequests:()=>({normal:0,cleanup:0,total:0}),acceptsPause:p=>p.hitBreakpoints?.[0]==="cold-point",
      paused:p=>coldState.events.push(p),resumed:()=>coldState.events.push({resumed:true}),lost:()=>coldState.events.push({lost:true}),attach:t=>{coldState.attached=t;},observeExited:async()=>{}}};
    if(coldState.startupCommand!==undefined)await this.#request({...coldState.startupCommand,sessionId:"worker"},false,false,undefined,false,false,false,true);
    return this.#prepareClockRpc(dependency,"worker",create);
  }\n  public producerForTest():Promise<unknown>{return this.#request({phase:"project-save-producer-properties",method:"Runtime.getProperties",sessionId:"worker",params:{objectId:"producer-original",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},false,false,undefined,false,false,false,true);}
  public status():`;
  const source = initial.replace("public status():", seed); assert.notEqual(source, initial);
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, output = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [createRequire(url), loaded, loaded.exports]);
  assert.ok(!forward || allocation);
  let className = allocation ? "CurrentFootprintCopyAllocatedCreateClockStartupChannel" : "CurrentFootprintCopyCreateClockStartupChannel";
  if (forward) { className = "CurrentFootprintForwardWriterStartupChannel"; }
  const candidate = loaded.exports[className]; assert.ok(typeof candidate === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- VM adds only the explicitly synthetic prerequisite seed to the actual retained channel implementation.
  const Constructor = candidate as new (native: object, observeEventBytes: (bytes: number) => void, priorUsage: object, prepare: () => Promise<void>) => Channel;
  const state = { exited: false, lostWrite: false, createFrame: null as object | null, frames: [] as object[], sent: [] as Record<string, unknown>[], consumed: 0 };
  const parent = Object.freeze({ targetId: "parent", sessionId: "ui", nextRequestId: firstRequestId });
  const channel = new Constructor(Object.freeze({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => state.exited ? Promise.resolve() : Promise.reject(new Error("synthetic original still live")),
    observeOriginalParentEvent: (): void => { throw new Error("event reached retired construction observer"); },
    exchange: async (raw: unknown): Promise<unknown> => {
      const request = object(raw); state.sent.push(request);
      if (request["action"] === "footprint-forward-writer-clock-begin" || request["action"] === "footprint-copy-create-clock-begin" || request["action"] === "footprint-copy-allocated-create-clock-begin" || request["action"] === "footprint-forward-allocated-clock-begin") { hooks.begin(); return { begun: true }; }
      if (request["action"] === "footprint-forward-cold-begin") { return { begun: true }; }
      if (request["action"] === "footprint-forward-cold-send") {
        state.frames.push({ id: request["requestId"], sessionId: "worker", result: {} });
        if (request["phase"] === "tail-resume") { state.frames.push({ method: "Debugger.resumed", sessionId: "worker", params: {} }); }
        return { written: true };
      }
      if (request["action"] === "footprint-forward-writer-clock-retire") { await hooks.retire(); return { retired: true, disposition: "retired" }; }
      if (request["action"] === "footprint-forward-producer-observe" || request["action"] === "footprint-forward-startup-frontier-send") { state.frames.push({id:request["requestId"],sessionId:"worker",result:{}});return {written:true}; }
      if (request["action"] === "footprint-copy-create-clock-retire") { await hooks.retire(); return { retired: true }; }
      if (request["action"] === "footprint-clock-rpc-v2-send" || request["action"] === "footprint-copy-allocation-send" || request["action"] === "footprint-forward-copy-local" || request["action"] === "footprint-forward-copy-upload" || request["action"] === "footprint-forward-branch-query" || ["footprint-forward-own-data","footprint-forward-copy-drain","footprint-forward-copy-post-sync","footprint-forward-copy-delete","footprint-forward-copy-tail-observe"].includes(String(request["action"]))) {
        const command = hooks.nextCommand();
        const result = await hooks.request(command, request["cleanup"] === true);
        state.frames.push({ id: request["requestId"], sessionId: command.sessionId, result }); return { written: true };
      }
      if (request["action"] === "footprint-copy-native-create") {
        hooks.create(); state.consumed += 1; state.createFrame = { id: request["requestId"], sessionId: "worker", result: { result: { type: "string", value: '{"success":true}' } } };
        if (early) { state.frames.push(state.createFrame); }
        if (state.lostWrite) { throw new Error("synthetic lost create write ACK"); }
        return { written: true };
      }
      assert.equal(request["action"], "poll"); await hooks.pump();
      for (let event = hooks.takeEvent(); event !== null; event = hooks.takeEvent()) { state.frames.push(event); }
      return { bytes: Buffer.from(state.frames.splice(0).map(frame => `${JSON.stringify(frame)}\0`).join("")).toString("base64") };
    } }), (): void => {
      // Synthetic event accounting is not original native-owner custody.
    }, {receivedBytes:0,eventCount:0,eventBytes:0}, ():Promise<void>=>Promise.resolve());
  const dependency = await channel.start(); dependency.subscribe(() => { throw new Error("post-clock event reached old observer"); });
  const cold: { events: object[]; attached: object | null; startupCommand?: object } = { events: [], attached: null, ...(startupCommand === undefined ? {} : {startupCommand}) };
  const reservation = await channel.seedCreateForTest(dependency, createCommand(), clockLease, cold);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This lookup belongs to the same VM-loaded real route registry, with explicit synthetic construction/native prerequisites.
  const requireRoute = loaded.exports["requireCurrentFootprintForwardWriterCreateClockChannelRoute"] as typeof requireCurrentFootprintForwardWriterCreateClockChannelRoute;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The lookup and token belong to the same VM-loaded channel; prerequisites remain explicitly synthetic.
  const requireColdTail = loaded.exports["requireCurrentFootprintForwardColdTail"] as typeof requireCurrentFootprintForwardColdTail;
  return { channel, dependency, reservation, state, requireRoute, requireColdTail, cold };
}

/** Actual channel/ledger/cursor with explicitly synthetic native and original
 * construction prerequisites for the composed scheduler regression. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyClockRpcChannelReservation, CurrentFootprintCopyCreateClockChannelRoute,
  CurrentFootprintCopyCreateClockStartupChannel, requireCurrentFootprintCopyCreateClockChannelRoute } from "../../src/current-pcb-worker-startup-channel.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "../../src/current-footprint-copy-create-bindings.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "../../src/current-footprint-copy-clock-rpc-protocol.ts";

export interface CreateClockNativeHooks {
  readonly begin: () => void;
  readonly retire: () => Promise<void>;
  readonly create: () => void;
  readonly nextCommand: () => CurrentFootprintCopyClockRpcCommand;
  readonly request: (command: CurrentFootprintCopyClockRpcCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: () => Promise<void>;
  readonly takeEvent: () => object | null;
}
type Dependency = Awaited<ReturnType<CurrentFootprintCopyCreateClockStartupChannel["start"]>>;
interface Channel {
  start: () => Promise<Dependency>;
  seedCreateForTest: (dependency: Dependency, command: unknown, clockLease: object) => Promise<CurrentFootprintCopyClockRpcChannelReservation>;
  beginFootprintCreateClockRpc: (dependency: Dependency, reservation: CurrentFootprintCopyClockRpcChannelReservation) => Promise<CurrentFootprintCopyCreateClockChannelRoute>;
  retainedFootprintClockRpc: () => Readonly<Record<string, unknown>>;
  status: () => Readonly<{ pendingReplies: number; nextRequestId: number }>;
  releaseAfterTermination: () => Promise<void>;
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
        title: "Copy", display_title: "Copy", description: "", custom_tags: "[]", source: "", version: "" }) }],
    objectGroup: "easyeda-pro-control-worker-construction-v1", silent: true, returnByValue: true,
    generatePreview: false, throwOnSideEffect: false, awaitPromise: true, userGesture: false } };
}
export async function createClockChannelFixture(early: boolean, clockLease: object, hooks: CreateClockNativeHooks): Promise<Readonly<{
  channel: Channel; dependency: Dependency; reservation: CurrentFootprintCopyClockRpcChannelReservation;
  requireRoute: typeof requireCurrentFootprintCopyCreateClockChannelRoute;
  state: { exited: boolean; lostWrite: boolean; createFrame: object | null; frames: object[]; sent: Record<string, unknown>[]; consumed: number };
}>> {
  const url = new URL("../../src/current-pcb-worker-startup-channel.ts", import.meta.url);
  const initial = await readFile(url, "utf8");
  const seed = `public seedCreateForTest(dependency: CurrentPcbWorkerStartupDependency, command: CurrentFootprintCopyNativeCreateCommand, clockLease: object): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
    this.#openingConsumed=true;this.#footprintUiStarted=true;this.#footprintClockRegistrationStarted=true;
    this.#executionWorkerSession="worker";this.#workers.set("worker","worker-target");
    const binding = Object.freeze({issuer:{},clockLease,projectObjectId:"project",handles:[],
      assertOriginal:async()=>{await dependency.assertOriginalOwner();},assertCleanup:()=>{},consumeBeforeInvocation:()=>{}});
    const create={binding,command,token:Object.freeze({profile:"private.current-footprint-copy-pending-create.v1"}),dispatchAttempted:false,pending:null,rejectedFrame:null};
    return this.#prepareClockRpc(dependency,"worker",create);
  }\n  public status():`;
  const source = initial.replace("public status():", seed); assert.notEqual(source, initial);
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, output = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [createRequire(url), loaded, loaded.exports]);
  const candidate = loaded.exports["CurrentFootprintCopyCreateClockStartupChannel"]; assert.ok(typeof candidate === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- VM adds only the explicitly synthetic prerequisite seed to the actual retained channel implementation.
  const Constructor = candidate as new (native: object) => Channel;
  const state = { exited: false, lostWrite: false, createFrame: null as object | null, frames: [] as object[], sent: [] as Record<string, unknown>[], consumed: 0 };
  const parent = Object.freeze({ targetId: "parent", sessionId: "ui", nextRequestId: 100 });
  const channel = new Constructor(Object.freeze({ requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => state.exited ? Promise.resolve() : Promise.reject(new Error("synthetic original still live")),
    observeOriginalParentEvent: (): void => { throw new Error("event reached retired construction observer"); },
    exchange: async (raw: unknown): Promise<unknown> => {
      const request = object(raw); state.sent.push(request);
      if (request["action"] === "footprint-copy-create-clock-begin") { hooks.begin(); return { begun: true }; }
      if (request["action"] === "footprint-copy-create-clock-retire") { await hooks.retire(); return { retired: true }; }
      if (request["action"] === "footprint-clock-rpc-send") {
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
    } }));
  const dependency = await channel.start(); dependency.subscribe(() => { throw new Error("post-clock event reached old observer"); });
  const reservation = await channel.seedCreateForTest(dependency, createCommand(), clockLease);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This lookup belongs to the same VM-loaded real route registry, with explicit synthetic construction/native prerequisites.
  const requireRoute = loaded.exports["requireCurrentFootprintCopyCreateClockChannelRoute"] as typeof requireCurrentFootprintCopyCreateClockChannelRoute;
  return { channel, dependency, reservation, state, requireRoute };
}

/* oxlint-disable import/max-dependencies -- This focused transport regression joins the actual fixed command, opaque issuer, clock grammar and VM/native collaborators. */
/** Real original queue/framing over explicit synthetic native capacity and a
 * test-only construction seed. No genuine writer issuer or application runs. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyClockRpcChannelReservation, CurrentFootprintCopyCreateClockChannelRoute,
  CurrentFootprintCopyCreateClockStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_CALL } from "../src/current-footprint-copy-create-bindings.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP } from "../src/current-footprint-copy-clock-rpc-programs.ts";
import { requireCurrentFootprintCopyCreateInvocationLease } from "../src/current-pcb-worker-construction-runner.ts";

type Dependency = Awaited<ReturnType<CurrentFootprintCopyCreateClockStartupChannel["start"]>>;
interface Channel {
  start: () => Promise<Dependency>;
  seedCreateForTest: (dependency: Dependency, command: unknown) => Promise<CurrentFootprintCopyClockRpcChannelReservation>;
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
        title: "Copy", display_title: "Copy", description: "", custom_tags: "[]", source: "", version: "" }) },
      ...["prewrite-scope", "prewrite-original", "prewrite-upload"].map(objectId => ({ objectId }))],
    objectGroup: "easyeda-pro-control-worker-construction-v1", silent: true, returnByValue: true,
    generatePreview: false, throwOnSideEffect: false, awaitPromise: true, userGesture: false } };
}
function clock(cleanup: boolean): CurrentFootprintCopyClockRpcCommand {
  return cleanup ? { phase: "rpc-release", method: "Runtime.releaseObjectGroup", sessionId: "worker", params: { objectGroup: CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP } } :
    { phase: "rpc-properties", method: "Runtime.getProperties", sessionId: "worker", params: { objectId: "original", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
}
async function fixture(early: boolean): Promise<Readonly<{
  channel: Channel; dependency: Dependency; reservation: CurrentFootprintCopyClockRpcChannelReservation;
  state: { exited: boolean; lostWrite: boolean; createFrame: object | null; frames: object[]; sent: Record<string, unknown>[]; consumed: number };
}>> {
  const url = new URL("../src/current-pcb-worker-startup-channel.ts", import.meta.url);
  const initial = await readFile(url, "utf8");
  const seed = `public seedCreateForTest(dependency: CurrentPcbWorkerStartupDependency, command: CurrentFootprintCopyNativeCreateCommand): Promise<CurrentFootprintCopyClockRpcChannelReservation> {
    this.#openingConsumed=true;this.#footprintUiStarted=true;this.#footprintClockRegistrationStarted=true;
    this.#executionWorkerSession="worker";this.#workers.set("worker","worker-target");
    const binding = Object.freeze({issuer:{},clockLease:{profile:"synthetic"},projectObjectId:"project",handles:[],prewriteHandles:["prewrite-scope","prewrite-original","prewrite-upload"],
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
    exchange: (raw: unknown): Promise<unknown> => {
      const request = object(raw); state.sent.push(request);
      if (request["action"] === "footprint-copy-create-clock-begin") { return Promise.resolve({ begun: true }); }
      if (request["action"] === "footprint-copy-create-clock-retire") { return Promise.resolve({ retired: true }); }
      if (request["action"] === "footprint-clock-rpc-send") {
        state.frames.push({ id: request["requestId"], sessionId: "worker", result: {} }); return Promise.resolve({ written: true });
      }
      if (request["action"] === "footprint-copy-native-create") {
        state.consumed += 1; state.createFrame = { id: request["requestId"], sessionId: "worker", result: { result: { type: "string", value: '{"success":true}' } } };
        if (early) { state.frames.push(state.createFrame); }
        if (state.lostWrite) { return Promise.reject(new Error("synthetic lost create write ACK")); }
        return Promise.resolve({ written: true });
      }
      assert.equal(request["action"], "poll");
      return Promise.resolve({ bytes: Buffer.from(state.frames.splice(0).map(frame => `${JSON.stringify(frame)}\0`).join("")).toString("base64") });
    } }));
  const dependency = await channel.start(); dependency.subscribe(() => { throw new Error("post-clock event reached old observer"); });
  const reservation = await channel.seedCreateForTest(dependency, createCommand());
  return { channel, dependency, reservation, state };
}
async function finish(f: Awaited<ReturnType<typeof fixture>>): Promise<void> { f.state.exited = true; await f.channel.releaseAfterTermination(); }
async function arms(route: CurrentFootprintCopyCreateClockChannelRoute): Promise<void> {
  for (let index = 0; index < 13; index += 1) { await route.request(clock(false), false); }
}
async function completeClocks(route: CurrentFootprintCopyCreateClockChannelRoute): Promise<void> {
  for (let index = 0; index < 36; index += 1) { await route.request(clock(false), false); }
  for (let index = 0; index < 18; index += 1) { await route.request(clock(true), true); }
  await route.retire();
}
for (const early of [true, false]) {
  void test(`clock retirement retains the exact ${early ? "early completed" : "still pending"} original create without restoring renderer sends`, async () => {
    const f = await fixture(early);
    try {
      const route = await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation); await arms(route);
      const pending = await route.dispatchCreate(); assert.equal(f.state.consumed, 1);
      await completeClocks(route);
      assert.equal(f.channel.status().nextRequestId, 168); assert.equal(f.channel.status().pendingReplies, early ? 0 : 1);
      await assert.rejects(route.dispatchCreate(), /CONSUMED/u);
      await assert.rejects(f.dependency.request({ method: "Debugger.resume", sessionId: "worker", params: {} }), /EXCLUSIVE/u);
      await assert.rejects(route.request(clock(false), false), /ORIGINAL/u);
      await assert.rejects(route.joinCreate({ ...pending }), /PENDING/u);
      if (!early) { assert.ok(f.state.createFrame !== null); f.state.frames.push(f.state.createFrame); }
      assert.equal(await route.joinCreate(pending), '{"success":true}');
      const retained = object(f.channel.retainedFootprintClockRpc()["create"]);
      assert.equal(retained["requestId"], 113); assert.match(String(retained["commandSha256"]), /^[a-f\d]{64}$/u);
      assert.equal(retained["rawFrame"], JSON.stringify(f.state.createFrame));
      assert.equal(f.state.sent.filter(request => request["action"] === "footprint-copy-native-create").length, 1);
    } finally { await finish(f); }
  });
}
void test("lost create write ACK consumes the original entry and cannot retire or invoke a replacement", async () => {
  const f = await fixture(true); f.state.lostWrite = true;
  try {
    const route = await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation); await arms(route);
    await assert.rejects(route.dispatchCreate(), /lost create write ACK/u);
    await assert.rejects(route.dispatchCreate()); await assert.rejects(route.retire());
    assert.equal(f.state.consumed, 1); assert.equal(f.channel.status().nextRequestId, 114);
    await assert.rejects(route.assertOriginalGenerationExited(), /still live/u);
    f.state.exited = true; await route.assertOriginalGenerationExited(); await route.retire();
    assert.equal(f.channel.status().pendingReplies, 0);
  } finally { await finish(f); }
});
void test("serializable invocation receipts cannot issue original construction custody", () => {
  assert.throws(() => requireCurrentFootprintCopyCreateInvocationLease({ profile: "private.current-footprint-copy-create-invocation-lease.v1" }), /INVOCATION_LEASE/u);
});
void test("a rejected unmatched frame survives original exit as unattributed bytes without becoming a create ACK", async () => {
  const f = await fixture(false);
  try {
    const route = await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation); await arms(route);
    await route.dispatchCreate();
    const rejected = { id: 113, sessionId: "foreign", result: { unexpected: true } };
    f.state.frames.push(rejected);
    await assert.rejects(route.request(clock(false), false), /REPLY/u);
    f.state.exited = true; await route.assertOriginalGenerationExited();
    const retained = object(f.channel.retainedFootprintClockRpc()["create"]);
    const frame = object(retained["rejectedFrame"]);
    assert.equal(frame["classification"], "unattributed-rejected-native-frame");
    assert.equal(frame["base64"], Buffer.from(JSON.stringify(rejected)).toString("base64"));
    assert.equal(frame["bytes"], Buffer.byteLength(JSON.stringify(rejected))); assert.equal(retained["rawFrame"], null);
    assert.equal(retained["replied"], false); assert.equal(retained["executionAuthorized"], false);
  } finally { await finish(f); }
});

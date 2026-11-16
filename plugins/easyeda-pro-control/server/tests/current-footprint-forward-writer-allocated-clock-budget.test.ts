/** The actual old phase ledger and new full physical cursor remain separate;
 * these counters issue no native source, owner or command authority. */
/* oxlint-disable import/max-dependencies -- Exercise the actual channel/ledger, both fixed grammars and separate full versus historical origin readers in one inert composed regression. */
import {currentPcbViaSaveDrainNativeCases} from "../src/current-pcb-via-save-drain-protocol.ts";
import {currentPcbViaPostHistorySyncNativeCases} from "../src/current-pcb-via-post-history-sync-protocol.ts";
import {currentPcbViaSaveTailDeleteControlNativeCases} from "../src/current-pcb-via-save-tail-delete-control-protocol.ts";
import {currentPcbViaSaveTailObservationNativeCases} from "../src/current-pcb-via-save-tail-observation-protocol.ts";
import {currentFootprintForwardWriterPostHistorySyncWire} from "../src/current-footprint-forward-writer-post-history-sync-wire.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyAllocatedCreateClockBudget, CURRENT_FOOTPRINT_COPY_ALLOCATION_NATIVE_ORDER as ORDER } from "../src/current-footprint-copy-allocated-create-clock-budget.ts";
import { CurrentFootprintForwardWriterAllocatedCreateClockBudget } from "../src/current-footprint-forward-writer-allocated-clock-budget.ts";
import { forwardWriterClockChannelFixture } from "./helpers/footprint-forward-writer-clock-channel-fixture.ts";
import type { CreateClockNativeCommand } from "./helpers/footprint-forward-writer-clock-channel-fixture.ts";
import { currentFootprintCopyAllocationNativeCases } from "../src/current-footprint-copy-allocation-native.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_GROUP } from "../src/current-footprint-copy-clock-rpc-v2-profile.ts";
import type { CurrentFootprintCopyClockRpcV2Command } from "../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentFootprintForwardWriterFrontierArms, currentFootprintForwardWriterFrontierChannelCommand } from "../src/current-footprint-forward-writer-frontier-protocol.ts";
import { CurrentFootprintForwardWriterClockRpcRunner } from "../src/current-footprint-forward-writer-clock-rpc-runner.ts";
import { CurrentFootprintForwardWriterAllocationRunner } from "../src/current-footprint-forward-writer-allocation-runner.ts";
import { requireCurrentFootprintCopyClockRpcOrigin } from "../src/current-footprint-copy-clock-rpc-origin.ts";
import { currentPcbViaUploadRequestNativeCases } from "../src/current-pcb-via-upload-request-protocol.ts";
import { currentFootprintForwardWriterCopyLocalNativeCases } from "../src/current-footprint-forward-writer-copy-local-protocol.ts";

void test("the full cursor records original producer IDs while preserving every original allocation/clock phase", () => {
  const value = new CurrentFootprintForwardWriterAllocatedCreateClockBudget(9000);
  const id = (): number => value.snapshot().nextId;
  value.consumeAllocation(id(), ORDER[0], false);
  for (let n = 0; n < 13; n += 1) { value.consumeOriginalProducerRequest(id()); value.consume(id(), false); }
  value.consumeCreate(id());
  for (let n = 1; n < 9; n += 1) { const phase = ORDER[n]; assert.ok(phase !== undefined); value.consumeOriginalProducerRequest(id()); value.consumeAllocation(id(), phase, n >= 7); }
  for (let n = 13; n < 49; n += 1) { value.consumeOriginalProducerRequest(id()); value.consume(id(), false); }
  for (let n = 0; n < 10; n += 1) { value.consume(id(), true); }
  value.consumeAllocation(id(), ORDER[9], true);
  for (let n = 10; n < 18; n += 1) { value.consume(id(), true); }
  value.requireCompleted();
  const completed = value.snapshot(); assert.equal(completed.consumed, 78); assert.equal(completed.interleavedProducerRequests, 57); assert.equal(completed.nextId, 9135); assert.equal(completed.logicalNextId, 79);
  assert.equal(completed.normalConsumed, 57); assert.equal(completed.cleanupConsumed, 21); value.retire();
  assert.throws(() => { value.consumeOriginalProducerRequest(id()); }, /ORIGINAL_PHYSICAL_ID/u);
});
void test("a skipped physical ID, wrong class or phase cannot be converted into a producer request or refunded", () => {
  const gap = new CurrentFootprintForwardWriterAllocatedCreateClockBudget(9000); assert.throws(() => { gap.consumeAllocation(9001, ORDER[0], false); }, /ORIGINAL_PHYSICAL_ID/u);
  assert.throws(() => { gap.consumeAllocation(9000, ORDER[0], false); }, /ORIGINAL_PHYSICAL_ID/u);
  const phase = new CurrentFootprintForwardWriterAllocatedCreateClockBudget(9000); assert.throws(() => { phase.consumeAllocation(9000, ORDER[1], false); }, /ALLOCATION_PHASE/u);
  assert.throws(() => { phase.consumeOriginalProducerRequest(9000); }, /ORIGINAL_PHYSICAL_ID/u);
  const old = new CurrentFootprintCopyAllocatedCreateClockBudget(1); old.consumeAllocation(1, ORDER[0], false);
  assert.throws(() => { old.consume(3, false); }, /CONTIGUOUS_ID/u);
});
function clock(cleanup: boolean): CurrentFootprintCopyClockRpcV2Command {
  return cleanup ? { phase: "rpc-release", method: "Runtime.releaseObjectGroup", sessionId: "worker", params: { objectGroup: CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_GROUP } } :
    { phase: "rpc-properties", method: "Runtime.getProperties", sessionId: "worker", params: { objectId: "original", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
}
void test("the actual full channel keeps producer events and physical requests separate from its complete clock unit", async () => {
  let current = clock(false); const events: object[] = [];
  const arm = currentFootprintForwardWriterFrontierArms()[0]; assert.ok(arm !== undefined);
  const startup = currentFootprintForwardWriterFrontierChannelCommand({ phase: "forward-startup-frontier", lane: "callback", command: arm });
  const f = await forwardWriterClockChannelFixture(true, {}, {
    begin: (): void => {
      // Original prerequisites are explicitly synthetic; this is the actual channel engine only.
    }, retire: (): Promise<void> => Promise.resolve(), create: (): void => {
      events.push({ method: "Debugger.paused", sessionId: "worker", params: { hitBreakpoints: ["producer-point"] } }, { method: "Debugger.resumed", sessionId: "worker", params: {} });
    }, nextCommand: (): CurrentFootprintCopyClockRpcV2Command => current, request: (): Promise<unknown> => Promise.resolve({}), pump: (): Promise<void> => Promise.resolve(), takeEvent: (): object | null => events.shift() ?? null,
  }, true, true, 9000, startup);
  try {
    const route = await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation); f.requireRoute(route);
    const cases = structuredClone([...currentFootprintCopyAllocationNativeCases()]);
    for (const command of cases) { Object.assign(command, { sessionId: "worker" }); }
    const send = async (command: CurrentFootprintCopyClockRpcV2Command, cleanup: boolean): Promise<void> => { current = command; await route.request(command, cleanup); };
    assert.ok(cases[0] !== undefined); await send(cases[0], false);
    for (let n = 0; n < 13; n += 1) { await f.channel.producerForTest(); await send(clock(false), false); }
    const pending = await route.dispatchCreate();
    for (let n = 1; n < 9; n += 1) { const selected = cases[n]; assert.ok(selected !== undefined); await send(selected, n >= 7); }
    for (let n = 13; n < 49; n += 1) { await send(clock(false), false); }
    for (let n = 0; n < 10; n += 1) { await send(clock(true), true); }
    assert.ok(cases[9] !== undefined); await send(cases[9], true);
    for (let n = 10; n < 18; n += 1) { await send(clock(true), true); }
    await route.retire(); assert.equal(await route.joinCreate(pending), '{"success":true}');
    assert.deepEqual(f.cold.events, [{ hitBreakpoints: ["producer-point"] }, { resumed: true }]);
    const budget: unknown = f.channel.retainedFootprintClockRpc()["budget"]; assert.ok(budget !== null && typeof budget === "object");
    assert.equal(Reflect.get(budget, "consumed"), 78); assert.equal(Reflect.get(budget, "interleavedProducerRequests"), 13); assert.equal(f.channel.status().nextRequestId, 9092);
    const ids = f.state.sent.flatMap(row => typeof row["requestId"] === "number" ? [row["requestId"]] : []);
    assert.deepEqual(ids, Array.from({ length: 92 }, (_, n) => 9000 + n)); assert.equal(f.state.consumed, 1);
    await assert.rejects(route.dispatchCreate()); assert.equal(f.state.consumed, 1);
  } finally { f.state.exited = true; await f.channel.releaseAfterTermination(); }
});
void test("a lost full create acknowledgement keeps its single dispatch consumed until the original root and Job exit", async () => {
  let current = clock(false), retirements = 0;
  const f = await forwardWriterClockChannelFixture(false, {}, {
    begin: (): void => {
      // No native process exists; this labelled fixture models only the original reply stream.
    }, retire: (): Promise<void> => { retirements += 1; return Promise.resolve(); }, create: (): void => {
      // The actual channel's native dispatch is counted by the inert peer.
    }, nextCommand: (): CurrentFootprintCopyClockRpcV2Command => current, request: (): Promise<unknown> => Promise.resolve({}), pump: (): Promise<void> => Promise.resolve(), takeEvent: (): null => null,
  }, true, true, 9000);
  try {
    const arm = currentFootprintCopyAllocationNativeCases()[0], route = await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation); assert.ok(arm !== undefined);
    current = { ...arm, sessionId: "worker" }; await route.request(current, false); current = clock(false);
    for (let n = 0; n < 13; n += 1) { await route.request(current, false); }
    f.state.lostWrite = true; await assert.rejects(route.dispatchCreate(), /lost create write ACK/u); assert.equal(f.state.consumed, 1);
    await assert.rejects(route.dispatchCreate()); assert.equal(f.state.consumed, 1); assert.equal(f.channel.status().pendingReplies, 1);
    await assert.rejects(route.assertOriginalGenerationExited(), /original still live/u); assert.equal(f.channel.status().pendingReplies, 1);
    f.state.exited = true; await route.assertOriginalGenerationExited(); assert.equal(f.channel.status().pendingReplies, 0);
    assert.equal(retirements, 1); assert.equal(f.state.consumed, 1); await assert.rejects(route.retire()); assert.equal(retirements, 1);
  } finally { f.state.exited = true; await f.channel.releaseAfterTermination(); }
});
void test("the full sequencers and historical clock reader reject data-only origins before collector effects", () => {
  const full = Object.freeze({ profile: "private.current-footprint-forward-writer-clock-rpc-origin.v1" as const });
  assert.throws(() => new CurrentFootprintForwardWriterClockRpcRunner(full, "a".repeat(16)), /FORWARD_WRITER_CLOCK_ORIGINAL_ORIGIN/u);
  assert.throws(() => Reflect.construct(CurrentFootprintForwardWriterAllocationRunner, [full, {}, {}]), /FORWARD_WRITER_CLOCK_ORIGINAL_ORIGIN/u);
  assert.throws(() => Reflect.apply(requireCurrentFootprintCopyClockRpcOrigin, undefined, [full]), /FOOTPRINT_CLOCK_RPC_ORIGINAL_ORIGIN/u);
});
void test("full channel release joins one original-exit retirement of a partially armed unit before releasing its stream", async () => {
  let retirements = 0;
  const command = clock(false);
  const f = await forwardWriterClockChannelFixture(false, {}, {
    begin: (): void => { assert.equal(retirements, 0); }, retire: (): Promise<void> => { retirements += 1; return Promise.resolve(); }, create: (): void => { assert.fail("no Create in this exit-only case"); },
    nextCommand: (): CurrentFootprintCopyClockRpcV2Command => command, request: (): Promise<unknown> => Promise.resolve({}), pump: (): Promise<void> => Promise.resolve(), takeEvent: (): null => null,
  }, true, true, 9000);
  await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation); f.state.exited = true;
  await f.channel.releaseAfterTermination(); assert.equal(retirements, 1); assert.equal(f.state.consumed, 0); assert.equal(f.channel.status().pendingReplies, 0);
  await assert.rejects(f.channel.releaseAfterTermination()); assert.equal(retirements, 1);
});
void test("separate local and upload channels refuse before Create and retain normal request classification afterward", async () => {
  let current: CreateClockNativeCommand = clock(false);
  const f = await forwardWriterClockChannelFixture(false, {}, {
    begin: (): void => { assert.equal(current.method, "Runtime.getProperties"); }, retire: (): Promise<void> => Promise.resolve(), create: (): void => { assert.equal(current.method, "Runtime.getProperties"); },
    nextCommand: (): CreateClockNativeCommand => current, request: (): Promise<unknown> => Promise.resolve({}), pump: (): Promise<void> => Promise.resolve(), takeEvent: (): null => null,
  }, true, true, 9000);
  try {
    const command = currentFootprintForwardWriterCopyLocalNativeCases()[0]; assert.ok(command !== undefined);
    const route = await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation); const before = f.state.sent.length;
    await assert.rejects(f.channel.requestForwardWriterCopyLocal(f.dependency, command), /ORIGINAL_CREATE/u); assert.equal(f.state.sent.length, before);
    const uploads = currentPcbViaUploadRequestNativeCases();
    for (const upload of uploads) { await assert.rejects(f.channel.requestForwardWriterCopyUpload(f.dependency, upload), /ORIGINAL_CREATE/u); }
    const drain=currentPcbViaSaveDrainNativeCases().find(row=>row.method==="Debugger.resume");
    const post=currentPcbViaPostHistorySyncNativeCases().find(row=>row.phase==="via-post-sync-resume");
    const deletion=currentPcbViaSaveTailDeleteControlNativeCases().find(row=>row.method==="Debugger.resume");
    assert.ok(drain!==undefined&&post!==undefined&&deletion!==undefined);
    await assert.rejects(f.channel.requestForwardWriterCopyDrain(f.dependency,drain),/ORIGINAL_CREATE/u);
    await assert.rejects(f.channel.requestForwardWriterCopyPost(f.dependency,post),/ORIGINAL_CREATE/u);
    await assert.rejects(f.channel.requestForwardWriterCopyDelete(f.dependency,deletion),/ORIGINAL_CREATE/u);
    assert.equal(f.state.sent.length, before);
    const arm = currentFootprintCopyAllocationNativeCases()[0]; assert.ok(arm !== undefined); current = { ...arm, sessionId: "worker" }; await route.request(current, false);
    current = clock(false); for (let index = 0; index < 13; index += 1) { await route.request(current, false); }
    await route.dispatchCreate(); current = { ...command, sessionId: "worker" }; await f.channel.requestForwardWriterCopyLocal(f.dependency, command);
    const sent = f.state.sent.findLast(row => row["action"] === "footprint-forward-copy-local"); assert.ok(sent !== undefined);
    assert.equal(Object.hasOwn(sent ?? {}, "functionDeclaration"), false); assert.equal(Object.hasOwn(sent ?? {}, "sessionId"), false);
    for (const upload of uploads) { current = { ...upload, sessionId: "worker" }; await f.channel.requestForwardWriterCopyUpload(f.dependency, upload); }
    const fullUpload = f.state.sent.filter(row => row["action"] === "footprint-forward-copy-upload"); assert.equal(fullUpload.length, 9);
    assert.ok(fullUpload.every(row => row["cleanup"] === undefined && !Object.hasOwn(row, "functionDeclaration") && !Object.hasOwn(row, "sessionId")));
    current={...drain,sessionId:"worker"};await f.channel.requestForwardWriterCopyDrain(f.dependency,drain);
    current={...currentFootprintForwardWriterPostHistorySyncWire(post,1).command,sessionId:"worker"};await f.channel.requestForwardWriterCopyPost(f.dependency,post);
    current={...deletion,sessionId:"worker"};await f.channel.requestForwardWriterCopyDelete(f.dependency,deletion);
    const tails=f.state.sent.filter(row=>["footprint-forward-copy-drain","footprint-forward-copy-post-sync","footprint-forward-copy-delete"].includes(String(row["action"])));
    assert.equal(tails.length,3);assert.ok(tails.every(row=>row["cleanup"]===undefined&&!Object.hasOwn(row,"functionDeclaration")&&!Object.hasOwn(row,"sessionId")));
    const budget = f.channel.retainedFootprintClockRpc()["budget"]; assert.ok(budget !== null && typeof budget === "object"); assert.equal(Reflect.get(budget, "interleavedProducerRequests"), 13);
    assert.equal(f.state.consumed, 1);
  } finally { f.state.exited = true; await f.channel.releaseAfterTermination(); }
});

void test("only fixed readonly delete arms may use the complete worker before its clock/Create unit",async()=>{
 let current:CreateClockNativeCommand=clock(false);
 const f=await forwardWriterClockChannelFixture(false,{},{
  begin:():void=>{assert.fail("no clock begin");},retire:():Promise<void>=>Promise.resolve(),create:():void=>{assert.fail("no Create");},
  nextCommand:()=>current,request:():Promise<unknown>=>Promise.resolve({}),pump:():Promise<void>=>Promise.resolve(),takeEvent:():null=>null,
 },true,true,9000);
 try{f.channel.prepareBranchQueryForTest();const arms=currentPcbViaSaveTailObservationNativeCases().filter(row=>row.phase==="via-tail-arm");assert.equal(arms.length,3);
  for(const command of arms){current={...command,sessionId:"worker"};await f.channel.requestForwardWriterCopyTailObservation(f.dependency,command);}
  assert.equal(f.state.sent.filter(row=>row["action"]==="footprint-forward-copy-tail-observe").length,3);assert.equal(f.state.consumed,0);
 }finally{f.state.exited=true;await f.channel.releaseAfterTermination();}
});

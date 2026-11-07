/** Actual finite phase ledger and channel over explicit synthetic prerequisites.
 * No original writer-v2 factory, Windows resource or writer admission is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyAllocatedCreateClockBudget as LegacyBudget, CURRENT_FOOTPRINT_COPY_ALLOCATION_NATIVE_ORDER as ORDER,
  CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as UNIT } from "../src/current-footprint-copy-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE as FORWARD } from "../src/current-footprint-copy-forward-profile.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_LIMITS as NATIVE } from "../src/current-footprint-forward-cold-native-limits.ts";
import { CurrentFootprintForwardColdAllocatedCreateClockBudget as Budget,
  requireCurrentFootprintForwardColdAllocatedClockHandoffHeadroom } from "../src/current-footprint-forward-cold-allocated-create-clock-budget.ts";
import { currentFootprintCopyAllocationNativeCases } from "../src/current-footprint-copy-allocation-native.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP } from "../src/current-footprint-copy-clock-rpc-programs.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { createClockChannelFixture } from "./helpers/footprint-create-clock-channel-fixture.ts";

/** Drive the same original phase ordering, including cleanup before a later
 * normal command, while retaining the caller's physical request IDs. */
function complete(budget: Budget): void {
  const nextId = (): number => budget.snapshot().nextId;
  budget.consumeAllocation(nextId(), ORDER[0], false);
  for (let index = 0; index < 13; index += 1) { budget.consume(nextId(), false); }
  budget.consumeCreate(nextId());
  for (let index = 1; index < 9; index += 1) { budget.consumeAllocation(nextId(), ORDER[index] ?? "", index >= 7); }
  for (let index = 13; index < UNIT.clockNormal; index += 1) { budget.consume(nextId(), false); }
  for (let index = 0; index < 10; index += 1) { budget.consume(nextId(), true); }
  budget.consumeAllocation(nextId(), ORDER[9], true);
  for (let index = 10; index < UNIT.clockCleanup; index += 1) { budget.consume(nextId(), true); }
}

void test("forward execution allocation/clock unit retains physical IDs through1175 and leaves legacy ceilings unchanged", () => {
  const ceiling = NATIVE.requestLimit, first = ceiling - UNIT.total + 1;
  assert.equal(ceiling, 1175); assert.equal(first, 1098); assert.equal(first + UNIT.createOffset, 1112);
  assert.equal(NATIVE.normalClass, 1105); assert.equal(NATIVE.cleanupClass, 70);
  assert.equal(FORWARD.renderer.requestLimit, 1002); assert.equal(FORWARD.renderer.normalClassLimit, 941); assert.equal(FORWARD.renderer.cleanupClassLimit, 61);
  assert.equal(UNIT.maximumNormalId, 811); assert.equal(UNIT.maximumRequestId, 856);
  const budget = new Budget(first); complete(budget); budget.requireCompleted(); budget.retire();
  const state = budget.snapshot();
  assert.equal(state.startId, first); assert.equal(state.lastReservedId, ceiling); assert.equal(state.nextId, ceiling + 1);
  assert.equal(state.consumed, UNIT.total); assert.equal(state.normalConsumed, 57); assert.equal(state.cleanupConsumed, 21);
  assert.equal(state.createConsumed, 1); assert.equal(state.allocationPhase, 10); assert.equal(state.retired, true);
  assert.equal(state.executionAuthorized, false); assert.throws(() => { budget.consumeCreate(state.nextId); }, /UNAVAILABLE/u);
  assert.equal(new LegacyBudget(811 - UNIT.total + 1).snapshot().lastReservedId, 811);
  assert.throws(() => new LegacyBudget(811 - UNIT.total + 2), /HEADROOM/u);
});

void test("forward headroom reserves the original handoff and rejects malformed or overflowing physical IDs", () => {
  const first = NATIVE.requestLimit - UNIT.total + 1;
  const handoff = first - UNIT.handoffMaximum;
  assert.deepEqual(requireCurrentFootprintForwardColdAllocatedClockHandoffHeadroom(handoff), {
    nextId: handoff, lastReservedId: NATIVE.requestLimit, handoffMaximum: UNIT.handoffMaximum, reservedIds: UNIT.handoffAndUnit });
  assert.equal(handoff, 1096);
  assert.throws(() => requireCurrentFootprintForwardColdAllocatedClockHandoffHeadroom(handoff + 1), /HEADROOM/u);
  assert.throws(() => new Budget(first + 1), /HEADROOM/u);
  for (const id of [0, -0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => new Budget(id), /START_ID/u);
    assert.throws(() => requireCurrentFootprintForwardColdAllocatedClockHandoffHeadroom(id), /START_ID/u);
  }
});

void test("forward counter delegates phase/class poisoning and cannot refund duplicate or uncertain create IDs", () => {
  const wrong = new Budget(900);
  assert.throws(() => { wrong.consume(900, false); }, /ALLOCATION_SEQUENCE/u);
  assert.equal(wrong.snapshot().consumed, 0); assert.equal(wrong.snapshot().originalGenerationExitRequired, true);
  const gap = new Budget(900);
  assert.throws(() => { gap.consumeAllocation(901, ORDER[0], false); }, /CONTIGUOUS_ID/u);
  assert.equal(gap.snapshot().firstFailure, "CONTIGUOUS_ID"); assert.equal(gap.snapshot().nextId, 900);
  assert.throws(() => { gap.consumeAllocation(900, ORDER[0], false); }, /UNAVAILABLE/u);
  const created = new Budget(900); created.consumeAllocation(900, ORDER[0], false);
  for (let index = 0; index < 13; index += 1) { created.consume(created.snapshot().nextId, false); }
  created.consumeCreate(created.snapshot().nextId); created.fail(); const failed = created.snapshot();
  assert.equal(failed.createConsumed, 1); assert.equal(failed.nextId, 915);
  assert.throws(() => { created.consumeCreate(failed.nextId); }, /UNAVAILABLE/u);
  assert.throws(() => { created.retire(); }, /UNAVAILABLE/u); assert.deepEqual(created.snapshot(), failed);
});

function clock(cleanup: boolean): CurrentFootprintCopyClockRpcCommand {
  return cleanup ? { phase: "rpc-release", method: "Runtime.releaseObjectGroup", sessionId: "worker", params: { objectGroup: CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP } } :
    { phase: "rpc-properties", method: "Runtime.getProperties", sessionId: "worker", params: { objectId: "original", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
}

void test("original cold events and pending create continue on the same cursor after all78 clock IDs retire", async () => {
  const first = NATIVE.requestLimit - UNIT.total - 2 + 1;
  let created = 0, current = clock(false), retired = 0;
  const events: object[] = [];
  const f = await createClockChannelFixture(false, {}, {
    begin: (): void => {
      // Native birth and original invocation prerequisites remain synthetic.
    },
    retire: (): Promise<void> => { retired += 1; return Promise.resolve(); },
    create: (): void => {
      created += 1;
      for (let index = 0; index < 11; index += 1) { events.push({ method: "Debugger.paused", sessionId: "worker", params: {} }, { method: "Debugger.resumed", sessionId: "worker", params: {} }); }
      events.push({ method: "Debugger.paused", sessionId: "worker", params: { hitBreakpoints: ["cold-point"] } });
    },
    nextCommand: (): CurrentFootprintCopyClockRpcCommand => current,
    request: (): Promise<unknown> => Promise.resolve({}), pump: (): Promise<void> => Promise.resolve(),
    takeEvent: (): object | null => events.shift() ?? null,
  }, true, true, first);
  try {
    const route = await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation);
    const allocation = structuredClone([...currentFootprintCopyAllocationNativeCases()]);
    for (const command of allocation) { Object.assign(command, { sessionId: "worker" }); }
    const send = async (command: CurrentFootprintCopyClockRpcCommand, cleanup: boolean): Promise<void> => { current = command; await route.request(command, cleanup); };
    assert.ok(allocation[0]); await send(allocation[0], false);
    for (let index = 0; index < 13; index += 1) { await send(clock(false), false); }
    const pending = await route.dispatchCreate();
    await assert.rejects(f.channel.beginForwardColdTail(f.dependency, pending), /TAIL_UNAVAILABLE/u);
    for (let index = 1; index < 9; index += 1) { const command = allocation[index]; assert.ok(command); await send(command, index >= 7); }
    for (let index = 13; index < UNIT.clockNormal; index += 1) { await send(clock(false), false); }
    for (let index = 0; index < 10; index += 1) { await send(clock(true), true); }
    assert.ok(allocation[9]); await send(allocation[9], true);
    for (let index = 10; index < UNIT.clockCleanup; index += 1) { await send(clock(true), true); }
    for (let index = 0; index < 22; index += 1) { assert.ok(route.takeEvent() !== null); }
    assert.equal(route.takeEvent(), null); assert.equal(f.cold.events.length, 1); await route.retire();
    assert.equal(f.channel.status().pendingReplies, 1);
    const tail = await f.channel.beginForwardColdTail(f.dependency, pending);
    const original = f.requireColdTail(tail);
    assert.equal(f.cold.attached, tail); assert.throws(() => f.requireColdTail({ ...tail }), /TAIL_ORIGINAL/u);
    await assert.rejects(f.channel.beginForwardColdTail(f.dependency, pending), /TAIL_UNAVAILABLE/u);
    await original.assertOriginal();
    await original.request({ method: "Runtime.getProperties", params: { objectId: "original-cache-promise", ownProperties: true, generatePreview: false } }, false);
    await original.request({ method: "Debugger.resume", params: {} }, true);
    assert.deepEqual(f.cold.events.at(-1), { resumed: true });
    assert.ok(f.state.createFrame !== null); f.state.frames.push(f.state.createFrame);
    assert.equal(await route.joinCreate(pending), '{"success":true}');
    const ids = f.state.sent.flatMap(request => typeof request["requestId"] === "number" ? [request["requestId"]] : []);
    assert.deepEqual(ids, Array.from({ length: UNIT.total + 2 }, (_, index) => first + index));
    assert.equal(f.channel.status().nextRequestId, NATIVE.requestLimit + 1); assert.equal(created, 1); assert.equal(retired, 1);
    assert.equal(f.state.sent.filter(request => request["action"] === "footprint-copy-native-create").length, 1);
    await assert.rejects(route.dispatchCreate()); await assert.rejects(route.request(allocation[0], false));
  } finally { f.state.exited = true; await f.channel.releaseAfterTermination(); }
});

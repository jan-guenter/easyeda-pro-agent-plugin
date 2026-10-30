/** Fixed codecs and actual channel/ledger with explicit synthetic original
 * prerequisites. No native owner, application or writer issuer is created. */
import assert from "node:assert/strict";
import { decodeFixedNativeTable } from "./helpers/fixed-native-table.ts";
import { test } from "node:test";
import { CurrentFootprintCopyAllocatedCreateClockBudget, CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as LIMITS,
  CURRENT_FOOTPRINT_COPY_ALLOCATION_NATIVE_ORDER as ORDER, requireCurrentFootprintCopyAllocatedCreateClockHandoffHeadroom } from "../src/current-footprint-copy-allocated-create-clock-budget.ts";
import { currentFootprintCopyAllocationNativeCases, currentFootprintCopyAllocationNativeSource } from "../src/current-footprint-copy-allocation-native.ts";
import { currentFootprintCopyAllocationWire } from "../src/current-footprint-copy-allocation-wire.ts";
import { currentFootprintCopyClockRpcWire } from "../src/current-footprint-copy-clock-rpc-wire.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP } from "../src/current-footprint-copy-clock-rpc-programs.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { createClockChannelFixture } from "./helpers/footprint-create-clock-channel-fixture.ts";

function clock(cleanup: boolean): CurrentFootprintCopyClockRpcCommand {
  return cleanup ? { phase: "rpc-release", method: "Runtime.releaseObjectGroup", sessionId: "worker", params: { objectGroup: CURRENT_FOOTPRINT_COPY_CLOCK_RPC_GROUP } } :
    { phase: "rpc-properties", method: "Runtime.getProperties", sessionId: "worker", params: { objectId: "original", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
}
void test("allocation fixed native table retains exact commands while data wires cannot forward programs or sessions", async () => {
  const cases = currentFootprintCopyAllocationNativeCases(), source = currentFootprintCopyAllocationNativeSource(); assert.equal(cases.length, 10);
  const { rows } = await decodeFixedNativeTable(source, 10, 4);
  for (const [index, command] of cases.entries()) {
    const wire = currentFootprintCopyAllocationWire(command, 73, command.sessionId); const row = rows[index]?.split("\t"); assert.ok(row);
    const { phase: _phase, ...native } = command; assert.deepEqual(JSON.parse(row[3] ?? ""), native);
    assert.equal(row[0], wire.request["phase"]); assert.equal(row[1], command.method);
    for (const forbidden of ["sessionId", "functionDeclaration", "expression", "condition", "realm"]) { assert.equal(Object.hasOwn(wire.request, forbidden), false); }
    assert.throws(() => currentFootprintCopyAllocationWire(command, 73, "foreign"), /ORIGINAL/u);
    assert.throws(() => currentFootprintCopyClockRpcWire(command, 73, command.sessionId, "ui"));
    assert.throws(() => currentFootprintCopyAllocationWire({ ...command, extra: true }, 73, command.sessionId));
  }
});
void test("the78-ID ledger reserves all allocation/create/clock operations without changing the old clock allowance", () => {
  assert.equal(LIMITS.total, 78); assert.equal(LIMITS.normal, 57); assert.equal(LIMITS.cleanup, 21);
  const first = LIMITS.maximumNormalId - LIMITS.total + 1; const budget = new CurrentFootprintCopyAllocatedCreateClockBudget(first);
  assert.equal(requireCurrentFootprintCopyAllocatedCreateClockHandoffHeadroom(first - 2).lastReservedId, LIMITS.maximumNormalId);
  assert.throws(() => new CurrentFootprintCopyAllocatedCreateClockBudget(first + 1), /HEADROOM/u);
  budget.consumeAllocation(first, ORDER[0], false);
  for (let i = 0; i < 13; i += 1) { budget.consume(budget.snapshot().nextId, false); }
  budget.consumeCreate(budget.snapshot().nextId); assert.equal(budget.snapshot().nextId, first + 15);
  for (let i = 1; i < 9; i += 1) { budget.consumeAllocation(budget.snapshot().nextId, ORDER[i] ?? "", i >= 7); }
  for (let i = 13; i < 49; i += 1) { budget.consume(budget.snapshot().nextId, false); }
  for (let i = 0; i < 10; i += 1) { budget.consume(budget.snapshot().nextId, true); }
  budget.consumeAllocation(budget.snapshot().nextId, ORDER[9], true);
  for (let i = 10; i < 18; i += 1) { budget.consume(budget.snapshot().nextId, true); }
  budget.requireCompleted(); budget.retire(); assert.equal(budget.snapshot().nextId, LIMITS.maximumNormalId + 1);
  assert.equal(budget.snapshot().allocationNormalConsumed, 7); assert.equal(budget.snapshot().allocationCleanupConsumed, 3);
  assert.equal(budget.snapshot().normalConsumed, 57); assert.equal(budget.snapshot().cleanupConsumed, 21);
  assert.throws(() => { budget.consumeAllocation(budget.snapshot().nextId, ORDER[0], false); }, /UNAVAILABLE/u);
  const missing = new CurrentFootprintCopyAllocatedCreateClockBudget(1); assert.throws(() => { missing.consume(1, false); }, /ALLOCATION_SEQUENCE/u);
  assert.equal(missing.snapshot().consumed, 0); assert.throws(() => { missing.consumeAllocation(1, ORDER[0], false); }, /UNAVAILABLE/u);
  const early = new CurrentFootprintCopyAllocatedCreateClockBudget(1); early.consumeAllocation(1, ORDER[0], false);
  assert.throws(() => { early.consumeCreate(2); }, /CREATE_SLOT/u); assert.equal(early.snapshot().createConsumed, 0);
  const incomplete = new CurrentFootprintCopyAllocatedCreateClockBudget(1); assert.throws(() => { incomplete.retire(); }, /INCOMPLETE/u);
  assert.equal(incomplete.snapshot().originalGenerationExitRequired, true);
});
void test("born allocated channel charges the exact78-ID native sequence and retains its original create across retirement", async () => {
  let began = 0, created = 0, current = clock(false), retired = 0;
  const events: object[] = [];
  const f = await createClockChannelFixture(true, {}, { begin: (): void => { began += 1; }, retire: (): Promise<void> => { retired += 1; return Promise.resolve(); },
    create: (): void => {
      created += 1;
      for (let i = 0; i < 11; i += 1) { events.push({ method: "Debugger.paused", sessionId: "worker", params: {} }, { method: "Debugger.resumed", sessionId: "worker", params: {} }); }
    }, nextCommand: (): CurrentFootprintCopyClockRpcCommand => current, request: (): Promise<unknown> => Promise.resolve({}),
    pump: (): Promise<void> => Promise.resolve(), takeEvent: (): object | null => events.shift() ?? null }, true);
  try {
    const route = await f.channel.beginFootprintCreateClockRpc(f.dependency, f.reservation);
    const allocation = structuredClone([...currentFootprintCopyAllocationNativeCases()]);
    for (const command of allocation) { Object.assign(command, { sessionId: "worker" }); }
    const send = async (command: CurrentFootprintCopyClockRpcCommand, cleanup: boolean): Promise<void> => { current = command; await route.request(command, cleanup); };
    assert.ok(allocation[0]); await send(allocation[0], false);
    for (let i = 0; i < 13; i += 1) { await send(clock(false), false); }
    const pending = await route.dispatchCreate(); assert.equal(f.state.consumed, 1);
    for (let i = 1; i < 9; i += 1) { const command = allocation[i]; assert.ok(command); await send(command, i >= 7); }
    for (let i = 13; i < 49; i += 1) { await send(clock(false), false); }
    for (let i = 0; i < 10; i += 1) { await send(clock(true), true); }
    assert.ok(allocation[9]); await send(allocation[9], true);
    for (let i = 10; i < 18; i += 1) { await send(clock(true), true); }
    for (let i = 0; i < 22; i += 1) { assert.ok(route.takeEvent() !== null); }
    assert.equal(route.takeEvent(), null);
    await route.retire(); assert.equal(await route.joinCreate(pending), '{"success":true}');
    assert.equal(f.channel.status().nextRequestId, 178); assert.equal(began, 1); assert.equal(retired, 1); assert.equal(created, 1);
    assert.equal(f.state.sent.filter(request => request["action"] === "footprint-copy-allocation-send").length, 10);
    assert.ok(f.state.sent.some(request => request["action"] === "footprint-copy-allocated-create-clock-begin"));
    await assert.rejects(route.dispatchCreate()); await assert.rejects(route.request(allocation[0], false));
  } finally { f.state.exited = true; await f.channel.releaseAfterTermination(); }
});

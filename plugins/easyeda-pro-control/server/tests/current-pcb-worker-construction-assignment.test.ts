import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { z } from "zod";
import { CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS,
  CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_FIELDS, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK,
  CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_REQUEST_COUNT } from "../src/current-pcb-worker-construction-assignment.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../src/current-pcb-worker-construction-contract.ts";
import { CurrentPcb209WorkerConstructionRunner, CurrentPcbWorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { construction209Inspector, constructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

async function retainRejection(promise: Promise<unknown>): Promise<void> {
  try { await promise; } catch {
    // The original capture remains the sole reported result.
  }
}
async function construction(context: TestContext,
  wrap: (transport: CurrentPcbWorkerConstructionTransport) => CurrentPcbWorkerConstructionTransport = transport => transport):
Promise<Readonly<{ fixture: Awaited<ReturnType<typeof constructionInspector>>; runner: CurrentPcbWorkerConstructionRunner;
  packet: Awaited<ReturnType<CurrentPcbWorkerConstructionRunner["capture"]>> }>> {
  const fixture = await constructionInspector(context), runner = new CurrentPcbWorkerConstructionRunner(wrap(fixture.transport));
  const capture = runner.capture();
  // Observe rejection while waiting for the fixed arming boundary. The awaited
  // Original capture remains the sole reported result.
  void retainRejection(capture);
  await runner.whenArmed(); const running = fixture.run();
  const packet = await capture; await running; return { fixture, runner, packet };
}

void test("real construction events bind all current source-qualified wrappers to the original hidden receivers", { timeout: 30_000 }, async context => {
  const calls: Readonly<{ declaration: string; count: number; byValue: boolean }>[] = [];
  const { fixture, runner, packet } = await construction(context, transport => ({ ...transport, request: (command): Promise<unknown> => {
    if (command.method === "Runtime.callFunctionOn") {
      calls.push({ declaration: command.params.functionDeclaration, count: command.params.arguments.length, byValue: command.params.returnByValue });
      assert.equal(command.params.throwOnSideEffect, true); assert.equal(command.params.awaitPromise, false);
    }
    return transport.request(command);
  } }));
  const before = fixture.commands.length, beforeCalls = calls.length;
  const assignments = await runner.proveCurrentAssignments(packet);
  assert.equal(fixture.commands.length - before, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_REQUEST_COUNT);
  assert.equal(assignments.originalCallbackReceiversVerified, true); assert.equal(assignments.currentProjectWrapperRelationsVerified, true);
  assert.deepEqual(assignments.callbackKinds, ["uploadStructure", "structure", "cooperation", "upload"]);
  assert.equal(assignments.continuousAssignmentOwnershipVerified, false); assert.equal(assignments.completePublishersVerified, false);
  assert.equal(assignments.queueCompletionVerified, false); assert.equal(assignments.atomicSnapshotVerified, false);
  assert.equal(assignments.writeDestinationsContained, false); assert.equal(assignments.executionAuthorized, false);
  assert.equal(packet.wrapperAssignmentRelationVerified, false);
  const signatures = Object.values(CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_CALLS);
  assert.equal(calls.length - beforeCalls, signatures.length);
  for (const call of calls.slice(beforeCalls)) {
    const match = signatures.find(signature => signature.program === call.declaration); assert.ok(match);
    assert.equal(call.count, match.arguments); assert.equal(call.byValue, match.returnByValue);
  }
  await runner.requireCurrentAssignments(packet, assignments);
  await assert.rejects(runner.requireCurrentAssignments(packet, { ...assignments }), /ORIGINAL_ASSIGNMENTS/u);
  await assert.rejects(runner.proveCurrentAssignments(packet), /ASSIGNMENTS_CONSUMED/u);
  assert.deepEqual(fixture.counts(), { pauses: 9, resumes: 9 });
  await runner.release(); await assert.rejects(runner.requireCurrentAssignments(packet, assignments), /RELEASED/u);
});

for (const [name, field] of Object.entries(CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_FIELDS)) {
  void test(`current ${name} wrapper from another genuine constructor is rejected despite identical function bytes`, { timeout: 30_000 }, async context => {
    const { fixture, runner, packet } = await construction(context);
    await fixture.syntheticEvaluate(`PROJECT[${JSON.stringify(field)}]=new (Object.getPrototypeOf(PROJECT).constructor)({},PROJECT.workerBus)[${JSON.stringify(field)}]`);
    await assert.rejects(runner.proveCurrentAssignments(packet));
    const count = fixture.commands.length;
    await assert.rejects(runner.proveCurrentAssignments(packet)); assert.equal(fixture.commands.length, count);
    await runner.release();
  });
}

void test("assignment reads refuse accessor substitution without invoking the getter", { timeout: 30_000 }, async context => {
  const { fixture, runner, packet } = await construction(context);
  await fixture.syntheticEvaluate('globalThis.GETTER_CALLS=0;Object.defineProperty(PROJECT,"uploadStructure",{get(){GETTER_CALLS++;return ()=>{};}});void 0');
  await assert.rejects(runner.proveCurrentAssignments(packet));
  assert.deepEqual(await fixture.syntheticEvaluate("GETTER_CALLS"), { result: { type: "number", value: 0, description: "0" } });
  await runner.release();
});

void test("a changed global PROJECT cannot inherit original constructor provenance", { timeout: 30_000 }, async context => {
  const { fixture, runner, packet } = await construction(context);
  await fixture.syntheticEvaluate("globalThis.PROJECT=Object.assign(Object.create(Object.getPrototypeOf(PROJECT)),PROJECT)");
  await assert.rejects(runner.proveCurrentAssignments(packet)); await runner.release();
});

void test("current assignment reproof rejects replacement after observation and permanently poisons the owner", { timeout: 30_000 }, async context => {
  const { fixture, runner, packet } = await construction(context);
  const assignments = await runner.proveCurrentAssignments(packet);
  await fixture.syntheticEvaluate("globalThis.ORIGINAL_UPLOAD=PROJECT.bufferedUploadCloud;PROJECT.bufferedUploadCloud=()=>{}");
  await assert.rejects(runner.requireCurrentAssignments(packet, assignments));
  await fixture.syntheticEvaluate("PROJECT.bufferedUploadCloud=ORIGINAL_UPLOAD");
  await assert.rejects(runner.requireCurrentAssignments(packet, assignments), /ASSIGNMENTS_CHANGED/u);
  await runner.release();
});

void test("original owner loss after the final identity reply prevents issuing the assignment observation", { timeout: 30_000 }, async context => {
  const lost = { value: false };
  const state = await construction(context, transport => ({ ...transport,
    assertOriginalPinnedWorker: async (): Promise<void> => { await transport.assertOriginalPinnedWorker(); assert.equal(lost.value, false); },
    request: async (command): Promise<unknown> => {
      const result = await transport.request(command);
      if (command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_RECHECK) { lost.value = true; }
      return result;
    },
  }));
  await assert.rejects(state.runner.proveCurrentAssignments(state.packet));
  assert.equal(state.runner.status().failed, true); await state.runner.release();
});

void test("209 exact three-own-property QA completes current assignments and excludes replay", { timeout: 30_000 }, async context => {
  const fixture = await construction209Inspector(context);
  let observing = false, qaObserved = false, requests = 0;
  const descriptor = z.looseObject({ name: z.string() });
  const metadataSchema = z.looseObject({ result: z.array(descriptor).length(3) });
  const runner = new CurrentPcb209WorkerConstructionRunner({ ...fixture.transport, request: async (command): Promise<unknown> => {
    const reply = await fixture.transport.request(command);
    if (observing) { requests += 1; }
    if (observing && requests === 9) {
      assert.equal(command.method, "Runtime.getProperties");
      const metadata = metadataSchema.parse(reply);
      assert.deepEqual(metadata.result.map(item => item.name), ["length", "name", "prototype"]); qaObserved = true;
    }
    return reply;
  } });
  const captured = runner.capture(); void retainRejection(captured); await runner.whenArmed();
  const running = fixture.run(); const packet = await captured; await running; observing = true;
  const before = fixture.commands.length; const assignments = await runner.proveCurrentAssignments(packet);
  assert.equal(qaObserved, true); assert.equal(requests, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_REQUEST_COUNT);
  assert.equal(fixture.commands.length - before, CURRENT_PCB_WORKER_CONSTRUCTION_ASSIGNMENT_REQUEST_COUNT);
  assert.equal(assignments.currentProjectWrapperRelationsVerified, true); assert.equal(assignments.originalCallbackReceiversVerified, true);
  assert.equal(runner.status().assignments.completed, true); assert.equal(runner.status().failed, false);
  assert.equal(assignments.queueCompletionVerified, false); assert.equal(assignments.executionAuthorized, false);
  const consumedCount = fixture.commands.length;
  await assert.rejects(runner.proveCurrentAssignments(packet), /ASSIGNMENTS_CONSUMED/u);
  assert.equal(fixture.commands.length, consumedCount);
  await runner.requireCurrentAssignments(packet, assignments); await runner.release();
});

void test("209 malformed three-property QA metadata remains inspectable without relaxing descriptors or retrying", { timeout: 30_000 }, async context => {
  const fixture = await construction209Inspector(context);
  let observing = false, replacement: unknown = null, requests = 0;
  const descriptor = z.looseObject({ name: z.string() });
  const metadata = z.looseObject({ result: z.array(descriptor) });
  const runner = new CurrentPcb209WorkerConstructionRunner({ ...fixture.transport, request: async (command): Promise<unknown> => {
    const reply = await fixture.transport.request(command);
    if (observing) { requests += 1; }
    if (!observing || requests !== 9) { return reply; }
    assert.equal(command.method, "Runtime.getProperties");
    const changed = metadata.parse(reply);
    // Three own fields are the pinned current V8 shape. The prototype still
    // Must be the exact writable own data property, never a looser equivalent.
    const prototype = changed.result.find(item => item.name === "prototype"); assert.ok(prototype);
    prototype["writable"] = false;
    assert.equal(changed.result.length, 3); replacement = changed; return changed;
  } });
  const captured = runner.capture(); void retainRejection(captured);
  await runner.whenArmed(); const running = fixture.run();
  const packet = await captured; await running;
  const before = fixture.commands.length; observing = true;
  await assert.rejects(runner.proveCurrentAssignments(packet), /PCB_STRING_PRODUCER_SCOPE/u);
  const status = runner.status();
  const observed = status.assignments;
  const last = observed.lastReply;
  assert.equal(status.failed, true); assert.equal(status.firstFailure?.step, "debounce-function-metadata");
  assert.equal(observed.attempted, true); assert.equal(observed.completed, false);
  assert.equal(observed.step, "debounce-function-metadata"); assert.equal(observed.replyCount, 9);
  assert.equal(fixture.commands.length - before, 9); assert.ok(last);
  const text = JSON.stringify(replacement);
  assert.equal(last.step, "debounce-function-metadata"); assert.equal(last.method, "Runtime.getProperties");
  assert.equal(last.sha256, createHash("sha256").update(text).digest("hex")); assert.equal(last.bytes, Buffer.byteLength(text));
  assert.equal(JSON.stringify(last.value), text); assert.equal(Object.isFrozen(last.value), true);
  assert.notEqual(last.value, replacement);
  await assert.rejects(runner.proveCurrentAssignments(packet), /ASSIGNMENTS_FAILED/u);
  assert.equal(fixture.commands.length - before, 9); assert.equal(runner.status().assignments.lastReply, last);
  await runner.release();
});

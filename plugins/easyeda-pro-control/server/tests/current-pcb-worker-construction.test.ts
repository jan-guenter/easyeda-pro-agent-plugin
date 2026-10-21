import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SITES } from "../src/current-pcb-worker-construction-contract.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../src/current-pcb-worker-construction-contract.ts";
import { CurrentPcbWorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { WORKER_CONSTRUCTION_EXCERPTS, workerConstructionFixtureSource } from "./helpers/current-pcb-worker-construction-fixture.ts";
import { constructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

async function retainRejection(promise: Promise<unknown>): Promise<void> {
  try { await promise; } catch {
    // The original awaited promise supplies the test's failure, not this observer.
  }
}

void test("construction fixture retains exact inert excerpts at pinned source positions", () => {
  const source = workerConstructionFixtureSource();
  for (const kind of ["channel", "base", "project", "serial", "cooperation", "debounce", "upload"] as const) {
    const target = CURRENT_PCB_WORKER_CONSTRUCTION_SITES[kind];
    const excerpt = source.slice(target.start, target.end);
    assert.equal(excerpt, WORKER_CONSTRUCTION_EXCERPTS[kind]);
    assert.equal(Buffer.byteLength(excerpt), target.bytes);
    assert.equal(createHash("sha256").update(excerpt).digest("hex"), target.sha256);
    const lines = source.slice(0, target.offset).split("\n");
    assert.equal(lines.length - 1, target.lineNumber); assert.equal(lines.at(-1)?.length, target.columnNumber);
  }
});
void test("actual inspector constructor events retain original receivers and four hidden arrows", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context), runner = new CurrentPcbWorkerConstructionRunner(fixture.transport);
  const capture = runner.capture(); void retainRejection(capture);
  await runner.whenArmed(); const running = fixture.run(); void retainRejection(running);
  const packet = await capture; await running;
  assert.deepEqual(fixture.counts(), { pauses: 9, resumes: 9 });
  assert.equal(await fixture.completed(), true); assert.equal(packet.executionAuthorized, false);
  const identities = await runner.requireOriginal(packet); assert.equal(Object.keys(identities).length, 9);
  await assert.rejects(runner.requireOriginal({ ...packet }), /ORIGINAL_PACKET/u);
  await assert.rejects(runner.capture(), /CONSUMED/u);
  await runner.release(); await assert.rejects(runner.requireOriginal(packet), /RELEASED/u);
});
void test("original owner loss during an actual pause removes breakpoints and resumes once", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context, 2), runner = new CurrentPcbWorkerConstructionRunner(fixture.transport);
  const capture = runner.capture(); const stopped = assert.rejects(capture); await runner.whenArmed(); const running = fixture.run();
  await stopped; await running;
  assert.deepEqual(fixture.counts(), { pauses: 2, resumes: 2 });
  assert.equal(await fixture.completed(), true); assert.equal(runner.status().paused, false);
  assert.equal(runner.status().failed, true); await assert.rejects(runner.capture(), /CONSUMED/u);
  await runner.release();
});
void test("owner loss immediately after breakpoint reply retains and removes the original breakpoint", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context);
  const transport: CurrentPcbWorkerConstructionTransport = { ...fixture.transport, request: async command => {
    const reply = await fixture.transport.request(command);
    if (command.method === "Debugger.setBreakpoint") { fixture.lose(); }
    return reply;
  } };
  const runner = new CurrentPcbWorkerConstructionRunner(transport);
  await assert.rejects(runner.capture());
  assert.equal(fixture.commands.filter(command => command === "Debugger.removeBreakpoint").length, 1);
  assert.equal(runner.status().unresolvedBreakpoints, false);
  await runner.release();
});
void test("transport substitution poisons capture but cannot redirect cleanup", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context); let redirected = 0;
  const transport: CurrentPcbWorkerConstructionTransport = { ...fixture.transport, request: async command => {
    const reply = await fixture.transport.request(command);
    if (command.method === "Debugger.setBreakpoint") {
      Object.defineProperty(transport, "request", { value: (): Promise<unknown> => { redirected += 1; return Promise.resolve({}); } });
    }
    return reply;
  } };
  const runner = new CurrentPcbWorkerConstructionRunner(transport);
  await assert.rejects(runner.capture(), /TRANSPORT_CHANGED/u);
  await runner.release();
  assert.equal(redirected, 0);
  assert.equal(fixture.commands.filter(command => command === "Debugger.removeBreakpoint").length, 1);
});
void test("late actual pause during group release resumes before listener release", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context);
  const transport: CurrentPcbWorkerConstructionTransport = { ...fixture.transport, request: async command => {
    const reply = await fixture.transport.request(command);
    if (command.method === "Runtime.releaseObjectGroup") { await fixture.interrupt(); }
    return reply;
  } };
  const runner = new CurrentPcbWorkerConstructionRunner(transport);
  const capture = runner.capture(); void retainRejection(capture); await runner.whenArmed(); const running = fixture.run();
  await capture; await running; await runner.release();
  assert.deepEqual(fixture.counts(), { pauses: 10, resumes: 10 });
  assert.equal(runner.status().paused, false); assert.equal(runner.status().released, true);
});
void test("actual pause envelopes are frozen before subscriber code can mutate them", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context);
  const transport: CurrentPcbWorkerConstructionTransport = { ...fixture.transport, subscribe: events => fixture.transport.subscribe({
    ...events, paused: raw => {
      events.paused(raw);
      assert.ok(typeof raw === "object" && raw !== null);
      Object.defineProperty(raw, "reason", { value: "exception" });
    },
  }) };
  const runner = new CurrentPcbWorkerConstructionRunner(transport);
  const capture = runner.capture(); void retainRejection(capture); await runner.whenArmed(); const running = fixture.run();
  const packet = await capture; await running;
  assert.equal(packet.originalConstructorAndFactoryEventsRetained, true); await runner.release();
});
void test("lost resume acknowledgement is consumed even when original resume later arrives", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context);
  const transport: CurrentPcbWorkerConstructionTransport = { ...fixture.transport, request: async command => {
    const reply = await fixture.transport.request(command);
    if (command.method === "Debugger.resume") { throw new Error("Synthetic lost resume acknowledgement"); }
    return reply;
  } };
  const runner = new CurrentPcbWorkerConstructionRunner(transport);
  const stopped = assert.rejects(runner.capture()); await runner.whenArmed(); const running = fixture.run();
  await stopped; await running;
  const counts = fixture.counts();
  // The actual first resume can reach the next fixed breakpoint before its
  // Lost acknowledgement is reported. That new pause also needs cleanup.
  assert.ok(counts.pauses >= 1 && counts.pauses <= 2);
  assert.equal(counts.resumes, counts.pauses);
  assert.equal(fixture.commands.filter(command => command === "Debugger.resume").length, counts.pauses);
  assert.equal(runner.status().paused, false); await runner.release();
});

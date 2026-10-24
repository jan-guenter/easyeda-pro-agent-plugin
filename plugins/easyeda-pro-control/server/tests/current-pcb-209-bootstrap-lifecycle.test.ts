import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import { bootstrapLifecycleFixture } from "./helpers/current-pcb-209-bootstrap-lifecycle-fixture.ts";

const roles = ["bootstrap", "preload", "preload-copy-1", "preload-copy-2", "preload-copy-3", "preload-copy-4", "project"] as const;

void test("unsupported worker events stay refused and retain bounded literal or hashed diagnostics without event data", async () => {
  for (const method of ["Debugger.breakpointResolved", "Debugger.scriptFailedToParse", "Runtime.exceptionRevoked", "Private.secret-design-event"]) {
    const value = await bootstrapLifecycleFixture(); const packet = await value.owner.capture();
    value.emit(method, { breakpointId: "private-breakpoint", location: { scriptId: "private-script", lineNumber: 9, columnNumber: 5 },
      privateData: "secret-design-contents" });
    const first = value.owner.status().firstEventFailure;
    assert.equal(first?.method, method.startsWith("Private.") ? "other" : method);
    assert.equal(first.reason, "UNEXPECTED_EVENT");
    assert.deepEqual(first.unhandled, { methodSha256: createHash("sha256").update(method).digest("hex"), methodBytes: Buffer.byteLength(method),
      session: "selected-worker", bootstrapStage: null, sourceQualified: true, constructionStarted: true,
      constructionSubscribed: false, lastCommand: "Debugger.resume", requestCount: 20 });
    assert.doesNotMatch(JSON.stringify(first), /private-breakpoint|private-script|secret-design|Private\./u);
    value.emit("Runtime.bindingCalled", { name: "another-private-field" });
    assert.equal(value.owner.status().firstEventFailure, first);
    await assert.rejects(value.owner.requireOriginal(packet), /EVENT/u);
    const requests = value.commands.length; await value.owner.cleanup(); assert.equal(value.commands.length, requests);
    value.terminate(); await value.owner.releaseAfterTermination();
  }
});

void test("209 original transport binds all seven script roles before arming construction and consumes each pause once", async () => {
  const value = await bootstrapLifecycleFixture();
  const packet = await value.owner.capture();
  assert.deepEqual(value.qualified, roles);
  assert.equal(value.constructed(), 1); assert.equal(value.owner.status().sourceQualified, true);
  assert.equal(value.owner.status().preloadLogSeen, true);
  assert.deepEqual(value.owner.status().bootstrapStages.map(stage => [stage.role, stage.sourceQualified, stage.resumeSeen]),
    roles.map(role => [role, true, true]));
  assert.equal(value.commands.length, 20);
  assert.deepEqual(value.commands.filter(command => command.method === "Debugger.getScriptSource").map(command => command.params.scriptId),
    roles.map(role => `${role}-script`));
  assert.equal(value.commands.filter(command => command.method === "Debugger.resume").length, 7);
  assert.equal(value.commands.filter(command => command.method === "Debugger.removeBreakpoint").length, 1);
  await value.owner.requireOriginal(packet); await value.owner.cleanup();
  assert.equal(value.commands.length, 20);
  await assert.rejects(value.owner.releaseAfterTermination()); value.terminate(); await value.owner.releaseAfterTermination();
});

void test("209 source refusal and post-source owner loss never reach construction or replay cleanup", async () => {
  for (const role of roles) {
    for (const mode of ["source", "owner"] as const) {
      const value = await bootstrapLifecycleFixture(mode === "source" ? { badSource: role } : { ownerLossAt: role });
      await assert.rejects(value.owner.capture(), /SOURCE_REFUSAL|OWNER_LOST/u);
      assert.equal(value.constructed(), 0); const count = value.commands.length;
      await value.owner.cleanup(); assert.equal(value.commands.length, count);
      assert.equal(value.commands.filter(command => command.method === "Debugger.removeBreakpoint").length, 1);
      assert.equal(value.commands.filter(command => command.method === "Debugger.resume").length,
        roles.indexOf(role) + 1);
      await assert.rejects(value.owner.capture(), /CONSUMED/u);
      value.terminate(); await value.owner.releaseAfterTermination();
    }
  }
});

void test("209 lost resume acknowledgement cannot resume the same original stage twice", async () => {
  for (const role of [0, 1, 2, 3, 4, 5, 6]) {
    const value = await bootstrapLifecycleFixture({ loseResumeReply: role });
    await assert.rejects(value.owner.capture(), /LOST_RESUME_REPLY/u);
    const count = value.commands.filter(command => command.method === "Debugger.resume").length;
    await value.owner.cleanup(); assert.equal(value.commands.filter(command => command.method === "Debugger.resume").length, count);
    assert.ok(count <= 7); value.terminate(); await value.owner.releaseAfterTermination();
  }
});

void test("209 delayed source reply after timeout grants no source or construction and cannot repeat resume", { timeout: 10_000 }, async () => {
  const value = await bootstrapLifecycleFixture({ lateSource: true });
  await assert.rejects(value.owner.capture(), /DEADLINE/u);
  const count = value.commands.length; value.settleLateSource(); await delay(10);
  assert.deepEqual(value.qualified, []); assert.equal(value.constructed(), 0);
  assert.equal(value.owner.status().sourceQualified, false);
  await value.owner.cleanup(); assert.equal(value.commands.length, count);
  assert.equal(value.commands.filter(command => command.method === "Debugger.resume").length, 1);
  value.terminate(); await value.owner.releaseAfterTermination();
});

void test("209 rejects foreign or duplicate preload logs and retains bounded target refusal metadata", async () => {
  for (const options of [{ logContext: 8 }, { duplicateLog: true }]) {
    const value = await bootstrapLifecycleFixture(options); await assert.rejects(value.owner.capture(), /EVENT/u);
    assert.equal(value.constructed(), 0); assert.equal(value.owner.status().firstEventFailure?.method, "Runtime.consoleAPICalled");
    value.terminate(); await value.owner.releaseAfterTermination();
  }
  const value = await bootstrapLifecycleFixture({ targetUrl: "https://private.example/project-secret?key=private-value" });
  await assert.rejects(value.owner.capture(), /EVENT/u);
  const diagnostic = value.owner.status().firstEventFailure;
  assert.equal(diagnostic?.reason, "WORKER_URL"); assert.equal(diagnostic.target?.urlRole, "other");
  assert.equal(diagnostic.target?.urlHostname, "other"); assert.equal(diagnostic.target?.urlPathname, "other");
  assert.equal(diagnostic.target?.titleMatchesExpected, true);
  assert.doesNotMatch(JSON.stringify(diagnostic), /private\.example|project-secret|private-value/u);
  assert.equal(value.commands.some(command => command.method === "Debugger.enable"), false);
  value.terminate(); await value.owner.releaseAfterTermination();
});

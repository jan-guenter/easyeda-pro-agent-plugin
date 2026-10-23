import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { CurrentPcbDiagnosticOwner, CurrentPcbStringPrecreateOwner, CurrentPcbWorkerStartupOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";

const SOURCE = "const syntheticIdentity = true;\n";
const UI_PROFILE = { family: "ui", relativePath: "pro-ui/test-version/js/ui.js",
  scriptSha256: createHash("sha256").update(SOURCE).digest("hex"), scriptBytes: Buffer.byteLength(SOURCE) } as const;
const LAUNCH = { executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "c".repeat(64), confirmDiagnosticLaunch: true } as const;
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function fixture(context: TestContext, scenario = "opening-worker-startup",
  Owner = CurrentPcbWorkerStartupOwner): Readonly<{ owner: CurrentPcbWorkerStartupOwner; source: { valid: boolean };
    proof: { full: number; facade: number; valid: boolean; nativeProofsAtFacade: number[] }; requests: Record<string, unknown>[] }> {
  const child = spawn(process.execPath, [fileURLToPath(new URL("helpers/current-pcb-diagnostic-helper-fixture.ts", import.meta.url)), scenario],
    { stdio: ["pipe", "pipe", "pipe"] });
  const requests: Record<string, unknown>[] = [], source = { valid: true };
  const proof = { full: 0, facade: 0, valid: true, nativeProofsAtFacade: [] as number[] };
  const originalWrite = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>) => {
    const first: unknown = args[0];
    if (typeof first === "string") {
      const parsed: unknown = JSON.parse(first);
      assert.ok(record(parsed)); requests.push(parsed);
    }
    return originalWrite(...args);
  });
  const owner = new Owner(child, () => source.valid ? Promise.resolve() : Promise.reject(new Error("synthetic source changed")), null,
    (): Promise<void> => { proof.full += 1; return Promise.resolve(); },
    (): Promise<void> => {
      proof.facade += 1; proof.nativeProofsAtFacade.push(requests.filter(request => request["action"] === "worker-startup-reprove").length);
      return proof.valid ? Promise.resolve() : Promise.reject(new Error("synthetic facade changed"));
    });
  owner.start();
  context.after(async () => {
    if (!owner.status().helperClosed) {
      const closed = once(child, "close");
      // Synthetic child only. A real retained owner cannot close live pipes.
      child.stdin.end(); await closed;
    }
  });
  return { owner, source, proof, requests };
}
async function qualify(value: ReturnType<typeof fixture>): Promise<void> {
  await value.owner.launch(LAUNCH);
  await value.owner.browserObservation(); await value.owner.inspectFrames("target-1");
  await value.owner.inspectScript("frame-1", UI_PROFILE);
}
async function close(owner: CurrentPcbWorkerStartupOwner): Promise<void> {
  await owner.requestNormalClose("456");
  assert.equal(await owner.observeTermination(), true);
  await owner.releaseClosed(); assert.equal(owner.status().helperClosed, true);
}

void test("startup owner irreversibly hands off one original source-qualified parent and shared request counter", async context => {
  const value = fixture(context); await qualify(value);
  assert.equal(value.owner.status().workerStartupChannel, null);
  const handoff = await value.owner.handoffWorkerStartup();
  assert.equal(Object.isFrozen(handoff), true); assert.equal(Object.isFrozen(handoff.opening), true);
  assert.equal(value.owner.status().profile, "worker-startup");
  const count = value.requests.filter(request => request["action"] === "send").length;
  assert.equal(handoff.channel.status().nextRequestId, count + 1);
  assert.ok(handoff.channel.status().receivedBytes > Buffer.byteLength(SOURCE));
  assert.deepEqual(value.owner.status().workerStartupChannel, handoff.channel.status());
  const events: string[] = [];
  handoff.dependency.subscribe(event => { events.push(event.method); });
  assert.deepEqual(await handoff.dependency.request({ method: "Target.setAutoAttach", sessionId: "session-1", params: CURRENT_PCB_WORKER_STARTUP_ATTACH }), {});
  assert.deepEqual(events, ["Target.attachedToTarget"]);
  assert.equal(value.requests.find(request => request["action"] === "worker-startup-send")?.["requestId"], count + 1);
  await assert.rejects(value.owner.getTargets(), /LEGACY_TRANSFER_DISABLED/u);
  await assert.rejects(value.owner.handoffWorkerStartup(), /HANDOFF_UNAVAILABLE/u);
  await assert.rejects(value.owner.inspectWorkers(), /STARTUP_LEGACY_ROUTE/u);
  await assert.rejects(handoff.channel.releaseAfterTermination(), /RETAIN_LIVE_OWNER/u);
  assert.equal(handoff.channel.status().released, false);
  await close(value.owner); assert.equal(handoff.channel.status().released, true);
  assert.equal(value.owner.status().workerStartupChannel?.released, true);
});

void test("startup owner refuses unqualified handoff and cannot upgrade either older purpose", async context => {
  for (const Owner of [CurrentPcbWorkerStartupOwner, CurrentPcbDiagnosticOwner, CurrentPcbStringPrecreateOwner]) {
    const value = fixture(context, "opening-worker-startup", Owner); await value.owner.launch(LAUNCH);
    const count = value.requests.length;
    await assert.rejects(value.owner.handoffWorkerStartup(), /HANDOFF_UNAVAILABLE/u);
    assert.equal(value.requests.length, count); await close(value.owner);
  }
});

void test("startup discovery refuses PCB profiles and old worker/model/opening branches before native dispatch", async context => {
  const value = fixture(context); await value.owner.launch(LAUNCH);
  await value.owner.browserObservation(); await value.owner.inspectFrames("target-1");
  const count = value.requests.length;
  await assert.rejects(value.owner.inspectScript("frame-1", { ...UI_PROFILE, family: "pcb" }), /STARTUP_UI_SOURCE_ONLY/u);
  await assert.rejects(value.owner.inspectWorkers(), /STARTUP_LEGACY_ROUTE/u);
  await assert.rejects(value.owner.observeWorkerState(), /STARTUP_LEGACY_ROUTE/u);
  await assert.rejects(value.owner.observeModelState(), /STARTUP_LEGACY_ROUTE/u);
  assert.equal(value.requests.length, count); await close(value.owner);
});

void test("original parent context loss poisons startup work while retained normal cleanup remains available", async context => {
  const value = fixture(context, "opening-worker-startup-context-loss"); await qualify(value);
  const handoff = await value.owner.handoffWorkerStartup();
  handoff.dependency.subscribe(event => { assert.equal(event.method, "Target.attachedToTarget"); });
  await assert.rejects(handoff.dependency.request({ method: "Target.setAutoAttach", sessionId: "session-1", params: CURRENT_PCB_WORKER_STARTUP_ATTACH }), /PARENT_EVENT/u);
  await assert.rejects(handoff.dependency.assertOriginalOwner(), /PARENT_EVENT/u);
  assert.throws(() => handoff.opening.context(), /CONTEXT_IDENTITY/u);
  assert.equal(handoff.channel.status().released, false);
  await close(value.owner); assert.equal(handoff.channel.status().released, true);
});

void test("startup capability rechecks original helper source before later work without native dispatch", async context => {
  const value = fixture(context); await qualify(value);
  const handoff = await value.owner.handoffWorkerStartup();
  const count = value.requests.length;
  value.source.valid = false;
  await assert.rejects(handoff.opening.reprove(), /synthetic source changed/u);
  await assert.rejects(handoff.dependency.assertOriginalOwner(), /synthetic source changed/u);
  assert.equal(value.requests.length, count); value.source.valid = true;
  await close(value.owner);
});

void test("startup reproof brackets each fresh facade check with active native leases without repeating full installation reads", async context => {
  const value = fixture(context); await qualify(value);
  const fullBeforeHandoff = value.proof.full;
  const handoff = await value.owner.handoffWorkerStartup();
  assert.equal(value.proof.full, fullBeforeHandoff + 1);
  assert.ok(value.proof.facade > 0);
  const facade = value.proof.facade, full = value.proof.full, sent = value.requests.length;
  await handoff.opening.reprove();
  assert.equal(value.proof.full, full); assert.equal(value.proof.facade, facade + 1);
  assert.deepEqual(value.requests.slice(sent).map(request => request["action"]), ["worker-startup-reprove", "worker-startup-reprove"]);
  assert.equal(value.proof.nativeProofsAtFacade.at(-1), value.requests.filter(request => request["action"] === "worker-startup-reprove").length - 1);
  await close(value.owner);
});

void test("changed facade refuses startup continuation after one live lease assertion and before any CDP dispatch", async context => {
  const value = fixture(context); await qualify(value);
  const handoff = await value.owner.handoffWorkerStartup();
  value.proof.valid = false;
  const sent = value.requests.length;
  await assert.rejects(handoff.opening.reprove(), /synthetic facade changed/u);
  assert.deepEqual(value.requests.slice(sent).map(request => request["action"]), ["worker-startup-reprove"]);
  value.proof.valid = true; await close(value.owner);
});

void test("native startup reproof refusal prevents fresh facade checks and retains normal cleanup", async context => {
  const value = fixture(context, "opening-worker-startup-reproof-refused"); await qualify(value);
  await assert.rejects(value.owner.handoffWorkerStartup(), /STARTUP_NATIVE_REPROOF/u);
  assert.equal(value.proof.facade, 0);
  assert.equal(value.requests.filter(request => request["action"] === "worker-startup-reprove").length, 1);
  assert.equal(value.requests.some(request => request["action"] === "worker-startup-send"), false);
  await close(value.owner);
});

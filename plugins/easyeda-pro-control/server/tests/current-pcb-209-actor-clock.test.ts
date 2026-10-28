import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE, qualifyCurrentPcb209ActorClockSources,
  requireCurrentPcb209ActorClockSourceQualification } from "../src/current-pcb-209-actor-clock-source.ts";
import type { CurrentPcb209ActorClockSourceQualification } from "../src/current-pcb-209-actor-clock-source.ts";
import { CurrentPcb209ActorClockRunner } from "../src/current-pcb-209-actor-clock.ts";
import { CurrentPcb209WorkerStartupActorRunner } from "../src/current-pcb-209-worker-startup-actor.ts";
import { CurrentPcb209StartupActorCollection } from "../src/current-pcb-209-worker-startup-actor-runner.ts";

const fakeQualification: CurrentPcb209ActorClockSourceQualification = Object.freeze({
  profile: "private.pcb209-actor-clock-source.v1", application: "3.2.209.8a704eab",
  sourceSha256: Object.freeze({ ui: CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.ui.sha256,
    worker: CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.worker.sha256, pcb: CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.pcb.sha256,
    wsService: CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.wsService.sha256, backend: CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.backend.sha256 }),
  sourceClosureSha256: "a".repeat(64), suppliedSourceBytesOnly: true, nativeSourceContextsOwned: false,
  responderOwnershipVerified: false, nativeIntrinsicsVerified: false, clockProvenanceVerified: false,
  futureSaveClockVerified: false, compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false,
});
const identity = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32),
  documentUuid: "d".repeat(16), windowTabId: "window_1" });

void test("209 actor source closure includes the actual responder and separate backend clock", () => {
  assert.deepEqual(Object.keys(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE), ["ui", "worker", "wsService", "backend", "pcb"]);
  assert.equal(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.wsService.relativePath, "pro-mgr/3.2.185.bf63a159/js/ws-service.js");
  assert.equal(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.wsService.sha256,
    "7adb29ba4ea0bee9729caadc01c154d9299b1fc42e12f1c3f46e4343b5040e00");
  assert.equal(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.worker.spans.rpcCall.bytes, 273);
  assert.equal(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.wsService.spans.serverOffsetInitial.bytes, 4);
  assert.equal(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.backend.spans.backendActor.bytes, 353);
  assert.ok(Object.isFrozen(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE));
  assert.ok(Object.isFrozen(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE.wsService.spans.serverTimeService));
});

void test("source qualification refuses incomplete, proxy and accessor records without invoking getters", () => {
  let calls = 0;
  const empty = { ui: "", worker: "", pcb: "", wsService: "", backend: "" };
  const accessor = { ...empty };
  Object.defineProperty(accessor, "ui", { get(): string { calls += 1; return ""; } });
  const inherited: unknown = Object.create(empty);
  const proxied = new Proxy(empty, { ownKeys(): string[] { calls += 1; return []; } });
  for (const input of [empty, accessor, inherited, proxied, null, [], { ...empty, extra: "" }, { ui: "" }]) {
    assert.throws(() => Reflect.apply(qualifyCurrentPcb209ActorClockSources, undefined, [input]), /PCB209_ACTOR_CLOCK_SOURCE/u);
  }
  assert.equal(calls, 0);
  assert.throws(() => { requireCurrentPcb209ActorClockSourceQualification(fakeQualification); }, /PCB209_ACTOR_CLOCK_SOURCE/u);
  assert.throws(() => { requireCurrentPcb209ActorClockSourceQualification(structuredClone(fakeQualification)); }, /PCB209_ACTOR_CLOCK_SOURCE/u);
});

void test("copied source metadata cannot construct either 209 collector or dispatch an observation", () => {
  let requests = 0;
  const request = async (): Promise<unknown> => { requests += 1; await Promise.resolve(); return {}; };
  const assertCurrent = (): void => { requests += 1; };
  assert.throws(() => new CurrentPcb209ActorClockRunner(fakeQualification, { request, assertCurrent },
    { ui: "ui-context", worker: "worker-context", pcb: "pcb-context" }, identity), /PCB209_ACTOR_CLOCK_SOURCE/u);
  const startupIdentity = { projectUuid: identity.projectUuid, branchUuid: identity.branchUuid, windowTabId: identity.windowTabId };
  assert.throws(() => new CurrentPcb209WorkerStartupActorRunner(fakeQualification,
    { observeUi: request, observeWorker: request, async assertCurrent(): Promise<void> { await Promise.resolve(); requests += 1; } },
    startupIdentity), /PCB209_ACTOR_CLOCK_SOURCE/u);
  assert.equal(requests, 0);
});

void test("startup actor extraction bypasses method shadows and still checks the original inner lifetime", async () => {
  // Only the full vendor-source qualification boundary is inert here. The
  // Actual wrapper, inner four-sample issuer and async lifetime checks run.
  const path = new URL("../src/current-pcb-209-worker-startup-actor.ts", import.meta.url);
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const program = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`);
  assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => specifier === "./current-pcb-209-actor-clock-source.ts" ? {
    requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, fakeQualification); },
  } : actualRequire(specifier) as unknown, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209WorkerStartupActorRunner"]; assert.ok(typeof Constructor === "function");
  let current = true, ownerChecks = 0, shadowCalls = 0;
  const target = { projectUuid: identity.projectUuid, branchUuid: identity.branchUuid, windowTabId: identity.windowTabId };
  const user = { uuid: "f".repeat(32), nickname: "nick", username: "user", avatar: "" };
  const actor = { uuid: user.uuid, username: user.username, nickname: user.nickname };
  const stamp = { milliseconds: 1_700_000_000_000, iso: "2023-11-14T22:13:20.000Z", timezoneOffsetMinutes: 0 };
  const reply = (phase: "ui" | "worker"): Promise<unknown> => Promise.resolve({ result: { type: "string", value: JSON.stringify({
    schema: "easyeda-pro-control.pcb-worker-startup-actor.v1", phase, identity: target, workerUser: user, workerUserText: JSON.stringify(user),
    clock: { before: stamp, after: stamp }, ...(phase === "ui" ? { cachedActor: actor, startupActor: actor } :
      { originalProjectReceiverMatched: true, originalWorkerBusMatched: true }),
  }) } });
  const transport = { observeUi: (): Promise<unknown> => reply("ui"), observeWorker: (): Promise<unknown> => reply("worker"),
    assertCurrent: (): Promise<void> => { ownerChecks += 1; assert.ok(current, "original inner owner expired"); return Promise.resolve(); } };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual wrapper is loaded with only the independently tested vendor-source issuer boundary replaced above.
  const owner = Reflect.construct(Constructor, [fakeQualification, transport, target]) as CurrentPcb209WorkerStartupActorRunner;
  const packet = await owner.observe(), requireOriginal = owner.requireOriginal.bind(owner);
  Object.defineProperty(owner, "requireOriginal", { value: (): Promise<unknown> => { shadowCalls += 1; return Promise.resolve(packet); } });
  const checksBefore = ownerChecks, original = await owner.originalObservation(packet);
  assert.equal(ownerChecks, checksBefore + 1); assert.equal(original.packet, packet.originalActorPacket);
  Object.defineProperty(original.runner, "requireOriginal", { value: (): Promise<unknown> => { shadowCalls += 1; return Promise.resolve(original.packet); } });
  assert.equal(await requireOriginal(packet), packet); assert.equal(ownerChecks, checksBefore + 2);
  const descriptor = Object.getOwnPropertyDescriptor(CurrentPcb209StartupActorCollection.prototype, "requireOriginal"); assert.ok(descriptor);
  try {
    Object.defineProperty(CurrentPcb209StartupActorCollection.prototype, "requireOriginal", { ...descriptor,
      value: (): Promise<unknown> => { shadowCalls += 1; return Promise.resolve(original.packet); } });
    await assert.rejects(owner.originalObservation(packet), /ORIGINAL_METHOD/u);
  } finally { Object.defineProperty(CurrentPcb209StartupActorCollection.prototype, "requireOriginal", descriptor); }
  current = false; await assert.rejects(owner.originalObservation(packet), /original inner owner expired/u);
  assert.equal(shadowCalls, 0);
});

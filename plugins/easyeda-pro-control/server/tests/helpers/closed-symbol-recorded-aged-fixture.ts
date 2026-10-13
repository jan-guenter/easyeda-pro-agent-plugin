/** Actual original stages and SQL; only fixed synthetic child/gateway responses. */
/* oxlint-disable import/max-dependencies -- Compose the real stage graph and original issuers; no authority factory is mocked. */
import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { runInNewContext } from "node:vm";
import { ClosedSymbolAdmissionStage } from "../../src/closed-symbol-admission.ts";
import { ClosedSymbolRelaunchStage } from "../../src/closed-symbol-relaunch.ts";
import { ClosedSymbolStartupStage } from "../../src/closed-symbol-startup.ts";
import { ClosedSymbolWitnessStage } from "../../src/closed-symbol-witness.ts";
import { appendClosedSymbolEvent } from "../../src/closed-symbol-journal.ts";
import { extractToolPayload, isRecord } from "../../src/core.ts";
import { validateActorProjection } from "../../src/symbol-dual-actor.ts";
import { validateStartupResult } from "../../src/closed-symbol-startup-program.ts";
import { buildRendererClockControls, validateClockControls } from "../../src/symbol-clock-controls.ts";
import type { ClockControls } from "../../src/symbol-clock-controls.ts";
import { fixture as clockFixture } from "./symbol-clock-fixture.ts";
import { mainReferenceFixture } from "./closed-symbol-recorded-reference-fixture.ts";
import type { MainReferenceFixture } from "./closed-symbol-recorded-reference-fixture.ts";
import type { OriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { transportFixture as referenceTransportFixture } from "./closed-symbol-recorded-reference-transport-fixture.ts";
import { AGED_WITNESS_PROFILE } from "../../src/aged-symbol-witness.ts";

type Bag = Record<string, unknown>;
interface AgedState { calls: number; before?: () => void | Promise<void>; after?: (value: Bag) => void | Promise<void>; raw?: unknown }
interface AgedWitnessFixture extends MainReferenceFixture {
  reference: OriginalMainReference; transport: { calls: number }; admission: ClosedSymbolAdmissionStage;
  startup: ClosedSymbolStartupStage; relaunch: ClosedSymbolRelaunchStage; collector: ClosedSymbolWitnessStage; agedState: AgedState;
  collectInput: Parameters<ClosedSymbolWitnessStage["collect"]>[0] & { mainReference: OriginalMainReference };
}
export async function agedWitnessFixture(context: TestContext, recent = false): Promise<AgedWitnessFixture> {
  const f = await mainReferenceFixture(context, recent), transport = await referenceTransportFixture(context, f);
  const reference = await f.stage.runOnce(f.input);
  // The native wrapper samples capturedAt inside its clock envelope. The old
  // General stream fixture used a fixed timestamp; keep this correction local.
  const mutateResponse = f.owner.behavior.mutateResponse;
  f.owner.behavior.mutateResponse = (request, response): void => {
    mutateResponse?.(request, response);
    const clock = response["clock"]; const base = response["base"];
    if (request["action"] === "clocked-capture" && isRecord(base) && isRecord(clock) && isRecord(clock["after"])) {
      const time = Number((BigInt(String(clock["after"]["utcBeforeTicks"])) - 621_355_968_000_000_000n) / 10_000n);
      base["capturedAt"] = new Date(time).toISOString().replace(/Z$/u, "0000Z");
    }
  };
  const relaunch = new ClosedSymbolRelaunchStage(f.engine, f.runtime);
  await relaunch.launch({ journal: f.journal, phase: "edit-launch", proof: f.input.baselineProof, copy: f.copied.copy, checkpoint: f.copied.checkpoint });
  f.state.scope = true; f.state.sequence += 1; f.state.generation = "synthetic-aged-witness-runtime-0002";
  const admission = new ClosedSymbolAdmissionStage(f.engine, f.runtime), admitted = await admission.admit(f.journal, "edit-admission");
  const startup = new ClosedSymbolStartupStage(f.engine, f.runtime, admission); await startup.observe(f.journal, "edit-marker-read");
  for (const kind of ["intent", "result"] as const) {
    await appendClosedSymbolEvent(f.journal, { step: "edit-open", kind, generation: admitted.generation, requestSha256: "b".repeat(64), data: { syntheticOnly: true } });
  }
  const observed = validateStartupResult(extractToolPayload(startup.originalReturn(f.journal.operationId, "edit-marker-read")), {
    phase: "edit-marker-read", projectUuid: f.journal.plan.projectUuid, branchUuid: f.journal.plan.branchUuid, ownerUuid: f.journal.plan.ownerUuid, marker: f.journal.plan.marker });
  assert.ok(Array.isArray(observed["observations"]));
  const first: unknown = observed["observations"][0]; assert.ok(isRecord(first) && isRecord(first["observation"]));
  const actor = validateActorProjection(first["observation"]["startupActor"]);
  const controlScope = { createdAtLiteral: reference.request.createdAtLiteral, referenceUtcMs: reference.request.referenceUtcMs };
  const upstream = f.engine.upstream;
  const bundleReader = upstream.installedEasyedaBundles, original = upstream.callTool; assert.ok(bundleReader !== undefined);
  const bundles = await bundleReader.call(upstream);
  upstream.installedEasyedaBundles = (): ReturnType<typeof bundleReader> => Promise.resolve({ ...bundles, assetsRoot: "/synthetic/easyeda/resources/app/assets" });
  context.after(() => { upstream.installedEasyedaBundles = bundleReader; });
  const state: AgedState = { calls: 0 };
  context.mock.method(upstream, "callTool", async (...args: Parameters<typeof original>): Promise<Awaited<ReturnType<typeof original>>> => {
    if (!String(args[1]?.["code"]).includes(AGED_WITNESS_PROFILE)) { return original.call(upstream, ...args); }
    assert.equal(args[0], "easyeda_execute"); assert.equal(args[1]?.["confirmWrite"], false); assert.ok(args[3] !== undefined);
    state.calls += 1; f.state.witnessCalls += 1; await state.before?.();
    const time = f.state.clockMs + 100;
    function controls(offset: number): ClockControls {
      const fixture = clockFixture("renderer"); Object.assign(fixture.startup, actor); Object.assign(fixture.cached, actor);
      Object.defineProperty(fixture.date, "now", { value: (): number => time + offset });
      const raw: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${buildRendererClockControls(controlScope, actor)}`, fixture.sandbox, { timeout: 1000 });
      return validateClockControls(structuredClone(raw), controlScope, "renderer");
    }
    const controlsBefore = controls(0);
    const controlsAfter = controls(20), parsed = controlsBefore.sql[0]; assert.ok(parsed !== undefined);
    const witness = { profile: "easyeda-pro-control.symbol-predispatch-observation.v2", projectUuid: f.journal.plan.projectUuid,
      branchUuid: f.journal.plan.branchUuid, ownerUuid: f.journal.plan.ownerUuid, targetUuid: f.journal.plan.targetUuid, activeUuid: f.journal.plan.activeUuid,
      createdAtLiteral: reference.request.createdAtLiteral, workerClient: "a".repeat(16), workerMaxTicket: 100, workerTimeBeforeMs: time + 10, workerTimeAfterMs: time + 11,
      cachedActorUuid: actor.uuid, startupActor: actor, cachedActor: actor, rendererParsedCreatedAtMs: parsed.epochMs,
      rendererTimezoneOffsetMinutes: controlsBefore.clockBefore.offsetMinutes, rendererClockBeforeMs: time + 10, rendererClockAfterMs: time + 11,
      scope: "point-in-time-read-only-observation", appActorVerified: false, appClockVerified: false, workerFreshOfflineClockVerified: false,
      producerBindingVerified: false, executionAuthorized: false };
    const value: Bag = { profile: AGED_WITNESS_PROFILE, witness, controlsBefore: structuredClone(controlsBefore), controlsAfter: structuredClone(controlsAfter), executionAuthorized: false, producerBindingVerified: false };
    await state.after?.(value);
    const raw = { content: [{ type: "text" as const, text: JSON.stringify(value) }] }; state.raw = raw; f.state.returned = raw; return raw;
  });
  const status = await f.engine.status();
  const collector = new ClosedSymbolWitnessStage(f.engine, f.runtime, admission, startup, relaunch, status.stableFingerprint);
  return { ...f, reference, transport, admission, startup, relaunch, collector, agedState: state,
    collectInput: { journal: f.journal, baselineCopy: f.copied.copy, baselineInventory: f.copied.inventory, mainReference: reference } };
}

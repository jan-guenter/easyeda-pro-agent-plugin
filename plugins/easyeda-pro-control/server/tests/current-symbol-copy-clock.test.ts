/** Original source-qualified issuer with synthetic child streams; no connected validation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { isRecord } from "../src/core.ts";
import { completedCurrentSymbolCopyClockSource, prepareCurrentSymbolCopyClock, recordCurrentSymbolCopyClockPost, verifyCurrentSymbolCopyClock } from "../src/current-symbol-copy-clock.ts";
import type { CurrentSymbolCopyClockInput, CurrentSymbolCopyDocumentClockSample } from "../src/current-symbol-copy-clock.ts";
import { prepareCurrentSymbolCopyPlan } from "../src/current-symbol-copy-plan.ts";
import { prepareCurrentSymbolTransactionClock } from "../src/current-symbol-transaction-clock.ts";
import { windowsClockObservationForResult } from "../src/windows-authority.ts";
import { IDS, OPERATION, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";

const BASE = Date.parse("2026-10-12T12:34:55.000Z"), EPOCH = 621_355_968_000_000_000n;
const ACTOR = Object.freeze({ uuid: IDS.actor, username: "UI name", nickname: "UI nickname" });
const DESTINATION = "e".repeat(16);
const META = { title: "Source", description: "Preserve Ω", tags: ["tag"], docType: 2, source: "source-reference" };
type Bag = Record<string, unknown>;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function row(type: string, ticket: number, id: string, body: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${JSON.stringify(body)}`;
}
function header(ticket: number, time: number, uuid: string): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: WITNESS.client, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.206" })}`;
}
function edit(time: number): string {
  return `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", updateTime: time })}`;
}
const CANVAS = [row("PART", 3, "part", { title: "A" }), row("RECT", 4, "rect", { partId: "part", x: 0, y: 0 })];
function complete(path: string): void {
  const append = [edit(TIMES.edit), header(101, TIMES.document, DESTINATION), row("META", 101, "META", { ...META, title: "Source_1", source: "" }),
    header(102, TIMES.document + 1, DESTINATION), ...CANVAS].join("|\n");
  applyEffect(path, append);
  mutate(path, `UPDATE project_structures SET ticket=102 WHERE branch_uuid='${IDS.branch}';
    INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures WHERE branch_uuid='${IDS.branch}' LIMIT 1`);
}
function sample(milliseconds: number): Bag {
  const ticks = EPOCH + BigInt(milliseconds) * 10_000n;
  const qpc = 10_000_000_000_000_000n + BigInt(milliseconds - BASE) * 1000n;
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10_000n),
    qpcBefore: String(qpc), qpcAfter: String(qpc + 1000n), qpcFrequency: "1000000", highResolution: true,
    localOffsetMinutes: 120, zoneRulesSha256: "f".repeat(64) };
}
function document(first: number, server: number, last: number): CurrentSymbolCopyDocumentClockSample {
  return { rendererBeforeMs: BASE + first, serverTimeMs: BASE + server, rendererAfterMs: BASE + last,
    rendererBeforeIso: new Date(BASE + first).toISOString(), rendererAfterIso: new Date(BASE + last).toISOString(),
    rendererTimezoneOffsetMinutes: -120, notifyTabId: "a".repeat(16) };
}
function utc(milliseconds: number): string { return new Date(milliseconds).toISOString().replace(/Z$/u, "0000Z"); }
async function setup(context: TestContext): Promise<{
  path: string; input: CurrentSymbolCopyClockInput;
  nextClock: () => ReturnType<NonNullable<Awaited<ReturnType<typeof qualifiedClockFixture>>["supervisor"]["observeCurrentClock"]>>;
  terminate: (otherCapture?: typeof INPUT) => ReturnType<Awaited<ReturnType<typeof qualifiedClockFixture>>["supervisor"]["proveClosedSession"]>;
}> {
  const original = await fixture();
  const raw = [edit(1), header(100, 100, IDS.target), row("META", 100, "META", META), ...CANVAS].join("|\n");
  mutate(original.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(original.path);
  const copyPlan = await prepareCurrentSymbolCopyPlan(before, { projectUuid: IDS.project, branchUuid: IDS.branch, symbolUuid: IDS.target });
  const native = await qualifiedClockFixture(context);
  let time = BASE - 10_000;
  native.behavior.mutateResponse = (_request, response): void => {
    if (response["clock"] !== undefined) {
      response["clock"] = { status: "observed", tzAbsentBefore: true, tzAbsentAfter: true, before: sample(time), after: sample(time + 2) };
      const base = bag(response["base"]);
      for (const key of ["capturedAt", "observedAt", "checkedAt"]) { if (key in base) { base[key] = utc(time + 1); } }
    }
  };
  const launch = await native.supervisor.launch({ confirmLaunch: true });
  const launchClock = await windowsClockObservationForResult(launch, "launch");
  time = BASE - 5000;
  const executionAuthority = await native.supervisor.capture(INPUT);
  const captureClock = await windowsClockObservationForResult(executionAuthority, "capture");
  const observe = native.supervisor.observeCurrentClock; assert.ok(observe !== undefined);
  time = BASE; const beforeClock = await observe(executionAuthority);
  time = BASE + 100; const armedClock = await observe(executionAuthority);
  const input: CurrentSymbolCopyClockInput = { before, copyPlan, startupActor: ACTOR, cachedActor: ACTOR,
    comparisonIdentity: { projectUuid: IDS.project, branchUuid: IDS.branch, client: WITNESS.client, preDispatchMaxTicket: WITNESS.preDispatchMaxTicket },
    dispatchOwner: Object.freeze({ syntheticOnly: true }), launchClock, captureClock, beforeClock, armedClock,
    documentBefore: document(10, 20, 30) };
  return { path: original.path, input,
    nextClock() { time = BASE + 2100; return observe(executionAuthority); },
    async terminate(otherCapture) {
      time = BASE + 3000;
      const selected = otherCapture ?? INPUT;
      const selectedAuthority = otherCapture === undefined ? executionAuthority : await native.supervisor.capture(selected);
      time = BASE + 180_000;
      const binding = { operationId: selected.operationId, phase: selected.orphanPhase, challengeAttempt: selected.challengeAttempt,
        bridgeSession: selected.bridgeSession, runtimeIdentity: selected.runtimeIdentity, launch, executionAuthority: selectedAuthority };
      const intent = await native.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
      const closeReceipt = await native.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
      return native.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
    },
  };
}
function metadataInput(input: CurrentSymbolCopyClockInput): Parameters<typeof prepareCurrentSymbolTransactionClock>[0] {
  const { copyPlan: _copyPlan, ...common } = input;
  return { ...common, operation: OPERATION };
}
async function completed(context: TestContext, returnedUuid = DESTINATION): Promise<Awaited<ReturnType<typeof setup>> & {
  plan: Awaited<ReturnType<typeof prepareCurrentSymbolCopyClock>>;
  proof: Awaited<ReturnType<Awaited<ReturnType<typeof setup>>["terminate"]>>;
}> {
  const f = await setup(context), plan = await prepareCurrentSymbolCopyClock(f.input);
  const afterClock = await f.nextClock();
  await recordCurrentSymbolCopyClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010), returnedUuid });
  const proof = await f.terminate(); complete(f.path);
  return { ...f, plan, proof };
}

void test("copy clocks retain original completion and created-source handoff with immutable independent windows", async (context) => {
  const f = await completed(context);
  const after = await inventory(f.path);
  assert.deepEqual(f.plan.backendWindow, { minimumMs: BASE, maximumMs: BASE + 60_000 });
  assert.deepEqual(f.plan.documentWindow, { minimumMs: BASE + 20, maximumMs: BASE + 60_020 });
  assert.ok(Date.parse(f.proof.closedAt) > f.plan.backendWindow.maximumMs);
  assert.throws(() => completedCurrentSymbolCopyClockSource(f.plan, f.input.dispatchOwner, after), /original successful/u);
  const result = await verifyCurrentSymbolCopyClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after });
  const actor = bag(result["fullActorSqlEffect"]), sql = bag(actor["fullSqlEffect"]);
  assert.equal(actor["expectedActorUuid"], IDS.actor); assert.equal(actor["transactionActorMatchesExpected"], true);
  assert.equal(sql["exactLogicalSqlEffect"], true); assert.equal(sql["expectedTicket"], 102);
  for (const key of ["dispatchOwnershipVerified", "documentSampleProvenanceVerified", "sourceOwnershipVerified", "startupQualified",
    "producerBindingVerified", "appClockDirectlyObserved", "continuousClockStabilityProved", "futureWriteClockVerified",
    "entireJobExitedWithinOriginalWindow", "persistentUploadReplayExcluded", "reopened", "writerReady", "executionAuthorized"]) {
    assert.equal(result[key], false); assert.equal(Reflect.get(f.plan, key), false);
  }
  assert.equal(result["transactionTimestampsWithinPlannedWindows"], true);
  assert.ok(Object.isFrozen(f.plan) && Object.isFrozen(f.plan.backendWindow) && Object.isFrozen(result));
  const source = completedCurrentSymbolCopyClockSource(f.plan, f.input.dispatchOwner, after);
  assert.equal(source.copyPlan, f.input.copyPlan); assert.equal(source.copyPlan.metadataTicket, 101); assert.equal(source.append.targetUuid, DESTINATION);
  assert.equal(source.comparison, result); assert.deepEqual(source.expectedActor, ACTOR); assert.ok(Object.isFrozen(source));
  assert.throws(() => completedCurrentSymbolCopyClockSource(f.plan, {}, after), /original successful/u);
  assert.throws(() => completedCurrentSymbolCopyClockSource(structuredClone(f.plan), f.input.dispatchOwner, after), /original successful/u);
  assert.throws(() => completedCurrentSymbolCopyClockSource(f.plan, f.input.dispatchOwner, structuredClone(after)), /original successful/u);
  const equivalentAfter = await inventory(f.path);
  assert.equal(equivalentAfter.logicalSha256, after.logicalSha256);
  assert.throws(() => completedCurrentSymbolCopyClockSource(f.plan, f.input.dispatchOwner, equivalentAfter), /original successful/u);
  await assert.rejects(verifyCurrentSymbolCopyClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after }), /unconsumed/u);
});

void test("copy and metadata share one-shot owner reservations even when token preparation fails", async (context) => {
  const f = await setup(context);
  await assert.rejects(prepareCurrentSymbolCopyClock({ ...f.input, beforeClock: structuredClone(f.input.beforeClock) }), /not issued/u);
  await assert.rejects(prepareCurrentSymbolCopyClock(f.input), /reservation already consumed/u);
  await assert.rejects(prepareCurrentSymbolTransactionClock(metadataInput(f.input)), /reservation already consumed/u);
  const reverse = { ...f.input, dispatchOwner: Object.freeze({ reverse: true }) };
  await assert.rejects(prepareCurrentSymbolTransactionClock({ ...metadataInput(reverse), beforeClock: structuredClone(reverse.beforeClock) }), /not issued/u);
  await assert.rejects(prepareCurrentSymbolCopyClock(reverse), /reservation already consumed/u);
});

void test("copy clock snapshots actor, document and identity before its first await", async (context) => {
  const f = await setup(context);
  const actor = { ...ACTOR }, identity = { ...f.input.comparisonIdentity }, rawDocument = { ...f.input.documentBefore };
  const pending = prepareCurrentSymbolCopyClock({ ...f.input, startupActor: actor, cachedActor: actor, documentBefore: rawDocument, comparisonIdentity: identity });
  actor.uuid = IDS.peer; rawDocument.serverTimeMs = 0; identity.preDispatchMaxTicket = 0;
  const plan = await pending; assert.equal(plan.documentWindow.minimumMs, BASE + 20);
  const afterClock = await f.nextClock();
  await recordCurrentSymbolCopyClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010), returnedUuid: DESTINATION });
  const proof = await f.terminate(); complete(f.path);
  await verifyCurrentSymbolCopyClock(plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: proof, after: await inventory(f.path) });
});

void test("copy post rejects copied plans, tokens, wrong owners and occupied destinations without retry", async (context) => {
  const f = await setup(context);
  const afterClock = await f.nextClock();
  for (const mode of ["owner", "token", "destination"] as const) {
    const input: CurrentSymbolCopyClockInput = { ...f.input, dispatchOwner: Object.freeze({ mode }) };
    const plan = await prepareCurrentSymbolCopyClock(input);
    const post = { dispatchOwner: input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010), returnedUuid: DESTINATION };
    await assert.rejects(recordCurrentSymbolCopyClockPost(structuredClone(plan), post), /original unconsumed/u);
    let changed = { ...post, returnedUuid: IDS.target };
    if (mode === "owner") { changed = { ...post, dispatchOwner: {} }; }
    else if (mode === "token") { changed = { ...post, afterClock: structuredClone(afterClock) }; }
    await assert.rejects(recordCurrentSymbolCopyClockPost(plan, changed));
    await assert.rejects(recordCurrentSymbolCopyClockPost(plan, post), /unconsumed/u);
  }
});

void test("copy comparison binds the original returned UUID to the full SQL append", async (context) => {
  const f = await completed(context, "f".repeat(16));
  const after = await inventory(f.path);
  await assert.rejects(verifyCurrentSymbolCopyClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after }));
  assert.throws(() => completedCurrentSymbolCopyClockSource(f.plan, f.input.dispatchOwner, after), /original successful/u);
  await assert.rejects(verifyCurrentSymbolCopyClock(f.plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: f.proof, after }), /unconsumed/u);
});

for (const mode of ["copied-termination", "copied-after", "different-capture"] as const) {
  void test(`copy completion rejects ${mode} without issuing a completed source`, async (context) => {
    const f = await setup(context), plan = await prepareCurrentSymbolCopyClock(f.input);
    const afterClock = await f.nextClock();
    await recordCurrentSymbolCopyClockPost(plan, { dispatchOwner: f.input.dispatchOwner, afterClock, documentAfter: document(2000, 2005, 2010), returnedUuid: DESTINATION });
    const proof = await f.terminate(mode === "different-capture" ? { ...INPUT, bindingSha256: "9".repeat(64), operationId: "other-copy-capture" } : undefined);
    complete(f.path); const after = await inventory(f.path);
    await assert.rejects(verifyCurrentSymbolCopyClock(plan, { dispatchOwner: f.input.dispatchOwner,
      terminationProof: mode === "copied-termination" ? structuredClone(proof) : proof, after: mode === "copied-after" ? structuredClone(after) : after }));
    assert.throws(() => completedCurrentSymbolCopyClockSource(plan, f.input.dispatchOwner, after), /original successful/u);
    await assert.rejects(verifyCurrentSymbolCopyClock(plan, { dispatchOwner: f.input.dispatchOwner, terminationProof: proof, after }), /unconsumed/u);
  });
}

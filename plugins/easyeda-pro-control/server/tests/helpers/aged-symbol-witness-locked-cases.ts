import assert from "node:assert/strict";
import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { isRecord, sha256Text } from "../../src/core.ts";
import { buildSymbolWitnessReadExpression } from "../../src/symbol-predispatch-witness.ts";
import { witnessFixture } from "./closed-symbol-witness-fixture.ts";
import { mainReferenceBaseline } from "../../src/closed-symbol-main-reference-baseline.ts";
import { agedWitnessFixture } from "./aged-symbol-witness-fixture.ts";

void test("locked collector preserves exact legacy compiled bytes and evidence field order", async (context) => {
  const f = await witnessFixture(context), original = f.engine.upstream.callTool; let dispatched: unknown;
  context.mock.method(f.engine.upstream, "callTool", (...args: Parameters<typeof original>): ReturnType<typeof original> => {
    if (String(args[1]?.["code"]).includes("symbol-predispatch-observation.v2")) { dispatched = args[1]?.["code"]; }
    return original.call(f.engine.upstream, ...args);
  });
  const result = await f.stage.collect(f.input);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId);
  const request = loaded.events.find((event) => event.step === "edit-witness" && event.kind === "intent")?.data; assert.ok(isRecord(request));
  const plan = f.journal.plan;
  const expected = `return await ${buildSymbolWitnessReadExpression({ projectUuid: plan.projectUuid, branchUuid: plan.branchUuid, ownerUuid: plan.ownerUuid,
    targetUuid: plan.targetUuid, activeUuid: plan.activeUuid, createdAtLiteral: "2020-01-01 00:00:00" })}`;
  assert.equal(dispatched, expected); assert.equal(request["codeSha256"], sha256Text(expected));
  assert.deepEqual(Object.keys(request), ["profile", "scope", "plannedWindow", "expectedActor", "codeSha256", "qualificationPath", "baselineCopyReceiptSha256",
    "baselineLogicalSha256", "operationSha256", "launchClock", "beforeCapture", "beforeClock"]);
  const qualification: unknown = JSON.parse(await readFile(result.clockArtifact.path, "utf8")); assert.ok(isRecord(qualification));
  assert.deepEqual(Object.keys(qualification), ["profile", "operationId", "generation", "rawResultArtifactSha256", "requestSha256", "plannedWindow", "beforeCapture",
    "afterCapture", "launchClock", "beforeClock", "afterClock", "relation", "witness", "completionProved", "executionAuthorized"]);
  assert.deepEqual(Object.keys(result.witness), ["projectUuid", "branchUuid", "actorUuid", "client", "preDispatchMaxTicket", "serverClockMinMs", "serverClockMaxMs", "serverLocalOffsetMinutes"]);
  assert.equal(Object.hasOwn(result.witness, "agedHead"), false); assert.equal(f.state.witnessCalls, 1);
});

void test("locked original baseline cannot be selected as an aged reference baseline", async (context) => {
  const f = await witnessFixture(context), loaded = await loadClosedSymbolJournal(f.journal.operationId);
  await assert.rejects(mainReferenceBaseline(f.journal, loaded.events, f.input.baselineCopy, f.input.baselineInventory), /unlocked/u);
  assert.equal(f.state.witnessCalls, 0);
});

void test("locked collector with an unrelated original main reference refuses instead of ignoring it", async (context) => {
  const referenceOwner = await agedWitnessFixture(context);
  // End this unrelated synthetic fixture's scope before constructing a second
  // Owner; otherwise the real global recovery-isolation guard correctly refuses.
  await retireSyntheticJournal(referenceOwner.journal.operationId);
  const f = await witnessFixture(context);
  const input = { ...f.input, mainReference: referenceOwner.reference };
  await assert.rejects(f.stage.collect(input), /not issued/u);
  assert.equal(f.state.witnessCalls, 0); assert.equal(referenceOwner.agedState.calls, 0);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { assertConsumed, fixture, phase } from "./closed-symbol-coordinator-automatic-fixture.ts";
import { selectionCalls } from "./closed-symbol-coordinator-automatic-observer.ts";
import { assertOriginalAgedClosedSymbolFullEvidence, assertOriginalClosedSymbolFullEvidence, originalClosedSymbolFullEvidenceKind } from "../../src/closed-symbol-coordinator.ts";
import { ClosedSymbolTerminalStage } from "../../src/closed-symbol-terminal.ts";
import { ClosedSymbolAgedTerminalStage } from "../../src/closed-symbol-aged-terminal.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import { readExactUtf8Artifact } from "../../src/artifacts.ts";
import { INPUT } from "./windows-closed-session-fixture.ts";

export function registerPositive(kind: "locked" | "aged"): void {
  void test(`automatic ${kind} graph selects once inside its original full attempt`, async (context) => {
    const f = await fixture(context, kind); const beforeCalls = selectionCalls();
    assert.throws(() => originalClosedSymbolFullEvidenceKind(f.stage.retained(), f.engine, "unissued"), /original successful/u);
    const result = await f.stage.recordAutomaticFullEvidence(f.plan);
    assert.equal(result.sequence, 44); assert.equal(result.completionProved, false);
    assert.equal(result.saved, false); assert.equal(result.reopened, false); assert.equal(selectionCalls() - beforeCalls, 1);
    assert.equal(await phase(f, 44), result.operationId);
    assert.equal(originalClosedSymbolFullEvidenceKind(result, f.engine, result.operationId), kind === "locked" ? "locked" : "aged-unlocked");
    assert.equal(f.events.filter((value) => value === "launch").length, 3); assert.equal(f.events.filter((value) => value === "normal-close").length, 3);
    assert.equal(f.events.filter((value) => value === "scope-enter").length, 3); assert.equal(f.events.filter((value) => value === "scope-exit").length, 3);
    assert.equal(f.state.writes, 1); assert.equal(f.state.opens, 2); assert.equal(f.state.reads, 1); assert.equal(f.events.includes("save"), false);
    assert.equal(f.transport.calls, kind === "locked" ? 0 : 1); assert.equal(f.transport.rendererCalls, kind === "locked" ? 0 : 1);
    const original = kind === "locked" ? assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId) : assertOriginalAgedClosedSymbolFullEvidence(result, f.engine, result.operationId);
    if (kind === "locked") {
      assert.equal(Object.hasOwn(original, "mainReference"), false);
      assert.throws(() => assertOriginalAgedClosedSymbolFullEvidence(result, f.engine, result.operationId), /original successful/u);
      await assert.rejects(new ClosedSymbolAgedTerminalStage(f.engine, f.machine).complete(result), /original/iu);
    } else {
      assert.throws(() => assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId), /original successful/u);
      const launches = f.events.flatMap((value, index) => value === "launch" ? [index] : []), reference = f.events.indexOf("main-reference");
      assert.ok(launches[0] !== undefined && launches[1] !== undefined && launches[0] < reference && reference < launches[1]);
      await assert.rejects(new ClosedSymbolTerminalStage(f.engine, f.machine).complete(result), /original/iu);
    }
    // oxlint-disable-next-line unicorn/prefer-structured-clone -- JSON reconstruction is a separate original-token forgery from structuredClone.
    for (const counterfeit of [f.stage.retained(), { ...result }, structuredClone(result), JSON.parse(JSON.stringify(result)) as unknown]) {
      assert.throws(() => originalClosedSymbolFullEvidenceKind(counterfeit, f.engine, result.operationId), /original successful/u);
    }
    assert.throws(() => originalClosedSymbolFullEvidenceKind(result, f.engine, `${result.operationId}-other`), /original successful/u);
    const other = new EasyedaControlEngine(f.upstream); await other.controlFingerprintPromise;
    assert.throws(() => originalClosedSymbolFullEvidenceKind(result, other, result.operationId), /original successful/u);
    const advice = original.journal.nextSafeAction; original.journal.nextSafeAction = "synthetic original mutation";
    assert.throws(() => originalClosedSymbolFullEvidenceKind(result, f.engine, result.operationId), /retained values changed/u);
    original.journal.nextSafeAction = advice;
    await assertConsumed(f);
    const terminal = kind === "locked" ? await new ClosedSymbolTerminalStage(f.engine, f.machine).complete(result) : await new ClosedSymbolAgedTerminalStage(f.engine, f.machine).complete(result);
    const content = await readExactUtf8Artifact(terminal.terminalArtifact);
    const envelope: unknown = JSON.parse(content.text);
    assert.ok(envelope !== null && typeof envelope === "object" && "profile" in envelope);
    assert.equal(envelope.profile, kind === "locked" ? "easyeda-pro-control.closed-symbol-terminal.v1" : "easyeda-pro-control.closed-symbol-terminal.v2");
    await f.owner.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 4 });
    assert.throws(() => originalClosedSymbolFullEvidenceKind(result, f.engine, result.operationId), /invalidated|lifecycle/u);
  });
}

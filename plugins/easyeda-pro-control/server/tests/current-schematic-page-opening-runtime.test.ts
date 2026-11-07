import assert from "node:assert/strict";
import { test } from "node:test";
import { loadOperation, updateOperation } from "../src/artifacts.ts";
import { CurrentSchematicPageOpeningCoordinator } from "../src/current-schematic-page-opening-runtime.ts";
import type { CurrentSchematicPageOpeningEngine } from "../src/current-schematic-page-opening-runtime.ts";
import type { CurrentSchematicPageOpeningCheckpoint } from "../src/current-schematic-page-opening-checkpoint.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { canonicalJson } from "../src/core.ts";
import { currentSchematicPageOpeningFixture, schematicOpeningTarget } from "./helpers/current-schematic-page-opening-fixture.ts";
import { schematicPageRuntimeFingerprint } from "./helpers/schematic-page-runtime-fingerprint.ts";

function packet(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } }; }

function fixture(id: string, options: { lostReply?: boolean; sourceDrift?: boolean; postDrift?: boolean; launchDrift?: boolean } = {}): {
  coordinator: CurrentSchematicPageOpeningCoordinator; calls: string[]; request: Record<string, unknown>; expected: Record<string, unknown>;
} {
  const calls: string[] = [], expected = schematicPageRuntimeFingerprint(), native = currentSchematicPageOpeningFixture();
  let launchRetained = true, statuses = 0, verifies = 0;
  const prepared: CurrentSchematicPageOpeningCheckpoint = {
    profile: "easyeda-pro-control.schematic-page-opening-checkpoint.v1",
    preparationCheckpoint: { path: "/fixture/backup.eprj2", bytes: 8192, sha256: "a".repeat(64) },
    checkpoint: { schema: "easyeda-pro-control.checkpoint.v2", source: "/fixture/source.eprj2", checkpoint: "/fixture/backup.eprj2",
      receiptPath: "/fixture/receipt.json", createdAt: "2026-01-01T00:00:00Z", sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" },
      checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" }, sourceSha256: "a".repeat(64), checkpointSha256: "a".repeat(64),
      sourceDumpSha256: "a".repeat(64), checkpointDumpSha256: "a".repeat(64), receiptSha256: "a".repeat(64) },
    evidence: { projectUuid: schematicOpeningTarget.projectUuid, branchUuid: schematicOpeningTarget.branchUuid,
      documentUuid: schematicOpeningTarget.documentUuid, schematicUuid: schematicOpeningTarget.schematicUuid,
      pageSemanticSha256: "b".repeat(64), parentSemanticSha256: "c".repeat(64), historySemanticSha256: "d".repeat(64) },
  };
  const engine: CurrentSchematicPageOpeningEngine = {
    assertBridgeDispatchAllowed: (): Promise<true> => { calls.push("guard"); return Promise.resolve(true); },
    status: () => { statuses += 1; calls.push("status"); return Promise.resolve({ stableFingerprint: statuses > 1 && options.postDrift === true
      ? { ...expected, syntheticDrift: true } : expected }); },
    upstream: { callTool: async (_name, args): Promise<unknown> => {
      calls.push("preflight"); assert.ok(args); assert.equal(args["confirmWrite"], true);
      const result = packet(await native.run("preflight"));
      if (options.launchDrift === true) { launchRetained = false; }
      return result;
    } },
    dispatchWithOrphanTracking: async (journal, phase, name, args, _timeout, before, retain, beforeClear): Promise<unknown> => {
      calls.push("tracked-authority"); assert.equal(phase, "schematic-page-open209"); assert.equal(name, "easyeda_execute"); assert.equal(args["confirmWrite"], true);
      assert.equal(canonicalJson(await loadOperation(id)), canonicalJson(journal));
      journal.orphanedCallPossible = true; journal.orphanedCallPhase = phase; await updateOperation(journal);
      await before?.(); calls.push("native-open");
      if (options.lostReply === true) { throw new Error("synthetic lost native acknowledgment"); }
      const reply = packet(await native.run("open", "original-window"));
      await retain?.(reply); await beforeClear?.();
      journal.orphanedCallPossible = false; await updateOperation(journal); return reply;
    },
  };
  const coordinator = new CurrentSchematicPageOpeningCoordinator(engine, (): void => { assert.equal(launchRetained, true, "synthetic original launch changed"); }, {
    prepareCheckpoint: (): Promise<CurrentSchematicPageOpeningCheckpoint> => { calls.push("prepare"); return Promise.resolve(prepared); },
    verifyCheckpoint: (): Promise<void> => { verifies += 1; calls.push("verify"); if (options.sourceDrift === true && verifies > 1) { return Promise.reject(new Error("synthetic source drift")); } return Promise.resolve(); },
    verifyImplementation: (): Promise<void> => { calls.push("pins"); return Promise.resolve(); },
  });
  const request = { action: "open", operationId: id, target: schematicOpeningTarget, confirmOrdinaryProject: true, acceptNormalOpenEffects: true };
  return { coordinator, calls, request, expected };
}

void test("schematic opening original coordinator journals intent before tracked native dispatch and never repeats", async () => {
  const id = "sch209-open-runtime-success", value = fixture(id);
  const result = await value.coordinator.run(value.request, value.expected);
  assert.equal(result["replayAllowed"], false); assert.equal(result["explicitSaveDispatched"], false);
  const journal = await loadOperation(id);
  assert.equal(journal["state"], "completed"); assert.equal(journal["orphanedCallPossible"], false);
  assert.equal(journal["saved"], false); assert.equal(journal.artifacts?.length, 1);
  await assert.rejects(value.coordinator.run(value.request, value.expected));
  const replacement = fixture(id); await assert.rejects(replacement.coordinator.run(replacement.request, replacement.expected));
  assert.equal(replacement.calls.includes("native-open"), false);
  const inspection = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspection["originalOwnerRecreated"], false); assert.equal(inspection["replayAllowed"], false);
  assert.equal(value.calls.filter(call => call === "native-open").length, 1);
});

void test("schematic opening lost acknowledgment keeps tracked quarantine and local inspection never replays", async () => {
  const id = "sch209-open-runtime-lost", value = fixture(id, { lostReply: true });
  await assert.rejects(value.coordinator.run(value.request, value.expected), /lost native acknowledgment/u);
  const journal = await loadOperation(id); assert.equal(journal["orphanedCallPossible"], true); assert.equal(journal["state"], "prepared");
  const before = [...value.calls]; const inspection = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspection["orphanedCallPossible"], true); assert.deepEqual(value.calls, before);
  await assert.rejects(value.coordinator.run(value.request, value.expected));
  assert.equal(value.calls.filter(call => call === "native-open").length, 1);
});

void test("schematic opening revalidates original source before native navigation and refuses post-open runtime drift", async () => {
  const drift = fixture("sch209-open-runtime-source-drift", { sourceDrift: true });
  await assert.rejects(drift.coordinator.run(drift.request, drift.expected), /source drift/u);
  assert.equal(drift.calls.includes("native-open"), false);
  const post = fixture("sch209-open-runtime-post-drift", { postDrift: true });
  await assert.rejects(post.coordinator.run(post.request, post.expected));
  assert.equal(post.calls.filter(call => call === "native-open").length, 1);
  const postJournal = await loadOperation("sch209-open-runtime-post-drift");
  assert.equal(postJournal["state"], "prepared");
});

void test("schematic navigation cannot outlive the facade's original ordinary launch allocation", async () => {
  const value = fixture("sch209-open-runtime-launch-drift", { launchDrift: true });
  await assert.rejects(value.coordinator.run(value.request, value.expected), /original launch changed/u);
  assert.equal(value.calls.includes("tracked-authority"), false); assert.equal(value.calls.includes("native-open"), false);
});

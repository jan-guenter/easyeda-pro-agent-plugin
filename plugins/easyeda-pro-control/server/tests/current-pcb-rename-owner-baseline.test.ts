/** Synthetic original-owner/capture seams with actual closed-Job authority,
 * checkpoint/raw-copy/SQL readers and complete history decoding. No live CAD.
 */
/* oxlint-disable import/max-dependencies -- Exercise maintained storage and closure together; only original opener/capture issuer seams use a private test realm. */
import assert from "node:assert/strict";
import { lstat, mkdir, readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, operationPath, readArtifact, verifyExactManagedArtifact } from "../src/artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "../src/checkpoint.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "../src/closed-file-copy.ts";
import { readClosedCopySqlInventory } from "../src/closed-file-sql.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { parseCurrentPcbRenameOwnerRequest } from "../src/current-pcb-rename-owner.ts";
import type { CurrentPcbRenameBaseline, CurrentPcbRenameBaselineEvidence, CurrentPcbRenameBaselineInput,
  assertOriginalCurrentPcbRenameBaseline, captureCurrentPcbRenameBaseline, currentPcbRenameBaselineClockBinding, currentPcbRenameBaselineOrigin,
  revalidateCurrentPcbRenameBaseline } from "../src/current-pcb-rename-owner-baseline.ts";
import { currentPcbStoredHeaderSchema } from "../src/current-pcb-stored-header.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "../src/engine.ts";
import { decodeNativeHistoryChunk, isNativeDocumentDeleted } from "../src/native-history.ts";
import { freezeDeep } from "../src/sqlite-inventory-core.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "../src/symbol-sql-comparator.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority } from "../src/windows-authority.ts";
import { IDS, encrypted, mutate, fixture as sqlFixture } from "./helpers/symbol-sql-fixture.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { INPUT, closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

const RAW = String.raw`C:\SyntheticOnly\PcbOwner.eprj2`;
const TARGET = { projectUuid: sha256Text(RAW), branchUuid: IDS.branch, ownerUuid: IDS.actor, pcbUuid: IDS.target };
const META = { title: "Original PCB", parent: "", source: "", board: "", zIndex: null };
interface Api {
  capture: typeof captureCurrentPcbRenameBaseline;
  clockBinding: typeof currentPcbRenameBaselineClockBinding;
  original: typeof assertOriginalCurrentPcbRenameBaseline;
  origin: typeof currentPcbRenameBaselineOrigin;
  revalidate: typeof revalidateCurrentPcbRenameBaseline;
}
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
async function fixture(): Promise<{
  source: string; engine: EasyedaControlEngine; input: CurrentPcbRenameBaselineInput; api: Api;
  events: CurrentPcbRenameBaselineEvidence[];
  state: { current: boolean; completed: boolean; scoped: boolean; captureValid: boolean; cloneReader: boolean };
  run: (hook?: (event: CurrentPcbRenameBaselineEvidence) => void) => Promise<CurrentPcbRenameBaseline>;
  replaceLaunch: () => void;
}> {
  const original = await sqlFixture(), source = original.path;
  const table = original.before.tables.find(value => value.name === "history_data"); assert.ok(table);
  const cell = table.rows[0]?.cells[table.columns.findIndex(value => value["name"] === "dataStr")]; assert.ok(cell?.kind === "text");
  const raw = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(cell.hex, "hex").toString("utf8") });
  const lines = raw.split("|\n");
  lines[1] = `{"type":"DOCHEAD","ticket":1}||${JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" })}`;
  lines[2] = `{"type":"META","ticket":1,"id":"META"}||${JSON.stringify(META)}`;
  const encoded = encrypted(lines.join("|\n"), IDS.oldHead, IDS.oldKey);
  mutate(source, `UPDATE history_data SET dataStr=${literal(encoded)} WHERE id=7;
    UPDATE projects SET uuid=${literal(TARGET.projectUuid)};
    UPDATE branches SET project_uuid=${literal(TARGET.projectUuid)};
    UPDATE project_structures SET project_uuid=${literal(TARGET.projectUuid)};
    UPDATE project_images SET project_uuid=${literal(TARGET.projectUuid)};`);
  const checkpoint = await createCheckpoint({ source, outputDir: join(controlDataDirectory(), "checkpoints"), label: "synthetic-pcb-opening" },
    { expectedSource: source, artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: await controlRootCapability(), maximumSourceBytes: 268_435_456 });
  // Ordinary opening effects can change bytes. This stage records them but
  // Does not qualify startup or claim they were the intended rename.
  mutate(source, "INSERT INTO resources(hash,dataStr) VALUES('synthetic-opening-effect','retained')");
  const owner = Object.freeze({ profile: "private.current-pcb-rename-opening-owner.v1" as const,
    operationId: `pcb-baseline-${source.split("/").at(-2) ?? "missing"}`, openingOperationId: "synthetic-original-opening" });
  await mkdir(operationPath(owner.operationId).slice(0, -5), { recursive: true, mode: 0o700 });
  const runtime = closedSessionFixture();
  const binding = await runtime.capture({ ...INPUT, operationId: owner.operationId, orphanPhase: "closed-baseline" });
  const capture: ClosedSessionAuthorityCapture = { operationId: owner.operationId, phase: "closed-baseline", challengeAttempt: 1,
    bridgeSession: binding.bridgeSession, runtimeIdentity: binding.runtimeIdentity, executionAuthority: binding.executionAuthority };
  const intent = await runtime.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await runtime.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await runtime.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  const state = { current: true, completed: true, scoped: false, captureValid: true, cloneReader: false };
  const clock = Object.freeze({ syntheticOriginalCaptureClock: true });
  const syntheticEngine = {
    upstream: { currentAuthenticatedBridgeDispatchBinding: (): unknown => state.scoped ? { synthetic: "scope" } : undefined },
    clockObservationForClosedCapture: (value: unknown): Promise<typeof clock> => {
      assert.equal(state.captureValid, true, "Synthetic original capture released"); assert.equal(value, capture, "Synthetic original capture required");
      return Promise.resolve(clock);
    },
  };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Private source realm only; the production owner issuer rejects this synthetic engine.
  const engine = syntheticEngine as unknown as EasyedaControlEngine;
  const retained = { source: { purpose: "disposable-validation", target: { rawWindowsPath: RAW, projectUuid: TARGET.projectUuid,
    branchUuid: TARGET.branchUuid, documentUuid: TARGET.pcbUuid }, preNavigationCheckpoint: { checkpoint },
  launchProjection: binding.launch, bridgeSession: binding.bridgeSession }, intent: { target: TARGET, desiredTitle: "Renamed PCB" } };
  const assertOwner = (value: unknown, candidate: unknown): typeof retained => {
    assert.equal(value, owner, "Synthetic original PCB owner required"); assert.equal(candidate, engine);
    assert.equal(state.current, true, "Synthetic owner changed"); assert.equal(state.completed, true, "Synthetic transfer cleanup-only"); return retained;
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-pcb-rename-owner-baseline.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  const context = createContext({ z, Object, String, Number, Buffer, structuredClone, lstat, join, controlDataDirectory, controlRootCapability,
    operationPath, readArtifact, verifyExactManagedArtifact, createCheckpoint, verifyCheckpoint, assertIssuedClosedFileCopy, copyClosedProjectBytes,
    readClosedCopySqlInventory: async (input: Parameters<typeof readClosedCopySqlInventory>[0]): ReturnType<typeof readClosedCopySqlInventory> => {
      const result = await readClosedCopySqlInventory(input); return state.cloneReader ? structuredClone(result) : result;
    },
    canonicalJson, isRecord, sha256Json, normalizeEasyedaProjectPath: (value: string): string => { assert.equal(value, RAW); return source; },
    assertCompletedCurrentPcbRenameOpeningTransfer: assertOwner,
    revalidateCurrentPcbRenameOpeningOwner: (value: unknown, candidate: unknown): Promise<typeof retained> => Promise.resolve(assertOwner(value, candidate)),
    currentPcbStoredHeaderSchema, isNativeDocumentDeleted, freezeDeep, readerCompletion, decodeCurrentSymbolPreEditHistory,
    assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority,
    assertIssuedWindowsClockObservation: (value: unknown): Promise<typeof clock> => { assert.equal(value, clock); return Promise.resolve(clock); },
  });
  const exported: unknown = runInContext(`${program}\n({capture:captureCurrentPcbRenameBaseline,clockBinding:currentPcbRenameBaselineClockBinding,original:assertOriginalCurrentPcbRenameBaseline,origin:currentPcbRenameBaselineOrigin,revalidate:revalidateCurrentPcbRenameBaseline});`, context);
  assert.ok(isRecord(exported) && ["capture", "clockBinding", "original", "origin", "revalidate"].every(key => typeof exported[key] === "function"));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained source exports above are checked functions in a private test realm.
  const api = exported as unknown as Api;
  const events: CurrentPcbRenameBaselineEvidence[] = [], input = { owner, capture, intent, closeReceipt, proof, runtime: await syntheticSqlRuntime() };
  return { source, engine, input, api, events, state,
    replaceLaunch: (): void => { retained.source.launchProjection = structuredClone(retained.source.launchProjection); },
    run: (hook): Promise<CurrentPcbRenameBaseline> => api.capture(engine, input, event => { events.push(event); hook?.(event); }) };
}

void test("PCB owner intention requires strict own data without invoking getters", () => {
  const request = { operationId: "pcb-owner", target: TARGET, desiredTitle: "Renamed PCB" };
  const parsed = parseCurrentPcbRenameOwnerRequest(request); assert.ok(Object.isFrozen(parsed)); assert.ok(Object.isFrozen(parsed.target));
  for (const value of [{ ...request, code: "ignored" }, { ...request, target: { ...TARGET, symbolUuid: IDS.peer } },
    { ...request, desiredTitle: " padded " }, { ...request, operationId: "" }, { ...request, desiredTitle: "INPUT" },
    { ...request, desiredTitle: "Résumé PCB" }]) { assert.throws(() => parseCurrentPcbRenameOwnerRequest(value)); }
  let accessed = false;
  const value = Object.defineProperty({ ...request }, "desiredTitle", { get: (): string => { accessed = true; return "Renamed PCB"; } });
  assert.throws(() => parseCurrentPcbRenameOwnerRequest(value), /accessors/u); assert.equal(accessed, false);
});

void test("PCB baseline binds original normal closure to complete raw SQL and preserves unknown opening effects", async () => {
  const value = await fixture(); const result = await value.run();
  assert.deepEqual(value.events.map(event => event.kind), ["checkpoint", "copy", "inventory"]);
  assert.equal(result.inventory.checkpointSha256, result.copy.sha256); assert.equal(result.history.checkpointSha256, result.copy.sha256);
  assert.equal(result.checkpoint.sourceSha256, result.copy.sha256); assert.equal(result.maximumTicket, 100);
  assert.equal(result.history.documents.length, 2); assert.equal(result.targetMetadata.title, META.title);
  assert.equal(result.intent.target.pcbUuid, IDS.target); assert.equal(result.intent.desiredTitle, "Renamed PCB");
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.history)); assert.ok(Object.isFrozen(result.targetMetadata));
  for (const key of ["openingEffectsVerified", "producerBindingVerified", "startupQualified", "writerAuthority", "executionAuthorized"] as const) {
    assert.equal(result[key], false);
  }
  assert.equal(value.api.original(result, value.engine), result); await value.api.revalidate(result, value.engine);
  const origin = value.api.origin(result, value.engine); assert.equal(origin.capture, value.input.capture); assert.ok(Object.isFrozen(origin));
  assert.throws(() => value.api.original(structuredClone(result), value.engine), /issued unchanged/u);
  await assert.rejects(value.run(), /already consumed/u);
  value.state.captureValid = false;
  assert.equal(value.api.original(result, value.engine), result, "Historical identity is not revived live authority");
  assert.equal(value.api.origin(result, value.engine).launch, origin.launch, "Original launch identity survives held-capture retirement");
  await assert.rejects(value.api.revalidate(result, value.engine), /capture released/u);
  value.replaceLaunch(); assert.throws(() => value.api.origin(result, value.engine), /issued unchanged/u);
});

void test("PCB baseline refuses copied capture or closure proof before any filesystem evidence", async () => {
  for (const key of ["capture", "proof"] as const) {
    const value = await fixture();
    await assert.rejects(value.api.capture(value.engine, { ...value.input, [key]: structuredClone(value.input[key]) }, event => { value.events.push(event); }),
      /original capture|retained authority/u);
    assert.equal(value.events.length, 0); await assert.rejects(value.run(), /already consumed/u);
  }
});

void test("PCB historical clock binding never substitutes same-JSON proof or capture identities", async () => {
  const value = await fixture(); const result = await value.run();
  const originalInputText = canonicalJson(value.input), proof = value.input.proof;
  assert.equal(value.api.clockBinding(result, value.engine).proof, proof);
  for (const key of ["proof", "capture"] as const) {
    const original = value.input[key]; assert.equal(Reflect.set(value.input, key, structuredClone(original)), true);
    assert.equal(canonicalJson(value.input), originalInputText);
    assert.throws(() => value.api.original(result, value.engine), /issued unchanged/u);
    assert.throws(() => value.api.clockBinding(result, value.engine), /issued unchanged/u);
    await assert.rejects(value.api.revalidate(result, value.engine), /issued unchanged/u);
    assert.equal(Reflect.set(value.input, key, original), true);
    assert.equal(value.api.clockBinding(result, value.engine).proof, proof);
  }
  const pending = await fixture();
  await assert.rejects(pending.run(event => {
    if (event.kind === "checkpoint") { assert.equal(Reflect.set(pending.input, "proof", structuredClone(pending.input.proof)), true); }
  }), /original owner, input/u);
  assert.deepEqual(pending.events.map(event => event.kind), ["checkpoint"]);
  await assert.rejects(pending.run(), /already consumed/u);
});

void test("PCB baseline rejects incomplete transfer and another owner without consuming the real owner", async () => {
  const value = await fixture(); value.state.completed = false;
  await assert.rejects(value.run(), /cleanup-only/u); assert.equal(value.events.length, 0);
  value.state.completed = true;
  await assert.rejects(value.api.capture(value.engine, { ...value.input, owner: { ...value.input.owner } }, event => { value.events.push(event); }), /original PCB owner/u);
  const result = await value.run(); assert.equal(result.originalOpeningBound, true);
});

void test("PCB baseline stops at owner drift after retaining evidence and consumes its attempted capture", async () => {
  const value = await fixture();
  await assert.rejects(value.run(event => { if (event.kind === "checkpoint") { value.state.current = false; } }), /owner changed/u);
  assert.deepEqual(value.events.map(event => event.kind), ["checkpoint"]); value.state.current = true;
  await assert.rejects(value.run(), /already consumed/u);
});

void test("PCB baseline rejects a cloned complete SQL reader instead of trusting matching JSON", async () => {
  const value = await fixture(); value.state.cloneReader = true;
  await assert.rejects(value.run(), /original inventory/u);
  assert.deepEqual(value.events.map(event => event.kind), ["checkpoint", "copy", "inventory"]);
});

void test("PCB baseline source revalidation detects later durable changes before relaunch", async () => {
  const value = await fixture(); const result = await value.run();
  mutate(value.source, "UPDATE resources SET dataStr='later unauthorized bytes' WHERE hash='synthetic-resource'");
  await assert.rejects(value.api.revalidate(result, value.engine), /source\/checkpoint|changed/u);
});

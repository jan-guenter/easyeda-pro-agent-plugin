/** Synthetic original-owner/capture seams with actual closed-Job authority,
 * checkpoint/raw-copy/SQL readers and complete history decoding. No live CAD.
 */
/* oxlint-disable import/max-dependencies -- Exercise maintained storage and closure together; only original opener/capture issuer seams use a private test realm. */
import assert from "node:assert/strict";
import type { BigIntStats, Stats } from "node:fs";
import { lstat, mkdir, open, readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, operationPath, readArtifact, verifyExactManagedArtifact } from "../src/artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "../src/checkpoint.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "../src/closed-file-copy.ts";
import { readClosedCopySqlInventory } from "../src/closed-file-sql.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { parseCurrentSchematicRenameOwnerRequest } from "../src/current-schematic-rename-owner.ts";
import type { CurrentSchematicRenameBaseline, CurrentSchematicRenameBaselineEvidence, CurrentSchematicRenameBaselineInput,
  assertOriginalCurrentSchematicRenameBaseline, captureCurrentSchematicRenameBaseline, currentSchematicRenameBaselineClockBinding, currentSchematicRenameBaselineOrigin,
  revalidateCurrentSchematicRenameBaseline, revalidateCurrentSchematicRenameClosedClockEvidence } from "../src/current-schematic-rename-owner-baseline.ts";
import { assertOriginalCurrentSchematicChildRoster, prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import { assertOriginalCurrentSchematicNativeMetadata, prepareCurrentSchematicNativeMetadata } from "../src/current-schematic-native-metadata.ts";
import { currentSchematicStoredHeaderSchema } from "../src/current-schematic-stored-header.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine } from "../src/engine.ts";
import { isNativeDocumentDeleted } from "../src/native-history.ts";
import { freezeDeep } from "../src/sqlite-inventory-core.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "../src/symbol-sql-comparator.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority } from "../src/windows-authority.ts";
import { IDS, mutate } from "./helpers/symbol-sql-fixture.ts";
import { schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { INPUT, closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

const RAW = String.raw`C:\SyntheticOnly\SchematicOwner.eprj2`;
const TARGET = { projectUuid: sha256Text(RAW), branchUuid: IDS.branch, ownerUuid: IDS.actor, schematicUuid: IDS.target };
const META = { title: "Source SCH", source: "", board: "", zIndex: null };
interface Api {
  certify: (value: unknown) => void;
  capture: typeof captureCurrentSchematicRenameBaseline;
  clockBinding: typeof currentSchematicRenameBaselineClockBinding;
  original: typeof assertOriginalCurrentSchematicRenameBaseline;
  origin: typeof currentSchematicRenameBaselineOrigin;
  revalidate: typeof revalidateCurrentSchematicRenameBaseline;
  clockEvidence: typeof revalidateCurrentSchematicRenameClosedClockEvidence;
}
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
async function fixture(sidecarMutation?: "clock-reader" | "scope-reader" | "scope"): Promise<{
  source: string; engine: EasyedaControlEngine; input: CurrentSchematicRenameBaselineInput; api: Api;
  events: CurrentSchematicRenameBaselineEvidence[];
  state: { current: boolean; completed: boolean; scoped: boolean; captureValid: boolean; cloneReader: boolean;
    fullOpeningChecks: number; targetedOpeningChecks: number; baselineSerializations: number };
  run: (hook?: (event: CurrentSchematicRenameBaselineEvidence) => void) => Promise<CurrentSchematicRenameBaseline>;
  replaceLaunch: () => void;
}> {
  const original = await schematicBaseline(), source = original.path;
  mutate(source, `UPDATE projects SET uuid=${literal(TARGET.projectUuid)};
    UPDATE branches SET project_uuid=${literal(TARGET.projectUuid)};
    UPDATE project_structures SET project_uuid=${literal(TARGET.projectUuid)};
    UPDATE project_images SET project_uuid=${literal(TARGET.projectUuid)};`);
  const checkpoint = await createCheckpoint({ source, outputDir: join(controlDataDirectory(), "checkpoints"), label: "synthetic-schematic-opening" },
    { expectedSource: source, artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: await controlRootCapability(), maximumSourceBytes: 268_435_456 });
  // Ordinary opening effects can change bytes. This stage records them but
  // Does not qualify startup or claim they were the intended rename.
  mutate(source, "INSERT INTO resources(hash,dataStr) VALUES('synthetic-opening-effect','retained')");
  const owner = Object.freeze({ profile: "private.current-schematic-rename-opening-owner.v1" as const,
    operationId: `schematic-baseline-${source.split("/").at(-2) ?? "missing"}`, openingOperationId: "synthetic-original-opening" });
  await mkdir(operationPath(owner.operationId).slice(0, -5), { recursive: true, mode: 0o700 });
  const runtime = closedSessionFixture();
  const binding = await runtime.capture({ ...INPUT, operationId: owner.operationId, orphanPhase: "closed-baseline" });
  const capture: ClosedSessionAuthorityCapture = { operationId: owner.operationId, phase: "closed-baseline", challengeAttempt: 1,
    bridgeSession: binding.bridgeSession, runtimeIdentity: binding.runtimeIdentity, executionAuthority: binding.executionAuthority };
  const intent = await runtime.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await runtime.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await runtime.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  const state = { current: true, completed: true, scoped: false, captureValid: true, cloneReader: false,
    fullOpeningChecks: 0, targetedOpeningChecks: 0, baselineSerializations: 0 };
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
    branchUuid: TARGET.branchUuid, documentUuid: "f".repeat(16) }, preNavigationCheckpoint: { checkpoint },
  launchProjection: binding.launch, bridgeSession: binding.bridgeSession }, intent: { target: TARGET, desiredTitle: "Renamed SCH" } };
  const assertOwner = (value: unknown, candidate: unknown): typeof retained => {
    assert.equal(value, owner, "Synthetic original SCH owner required"); assert.equal(candidate, engine);
    assert.equal(state.current, true, "Synthetic owner changed"); assert.equal(state.completed, true, "Synthetic transfer cleanup-only"); return retained;
  };
  let sidecarReads = 0;
  const observeStat = async (path: string, options?: { bigint: true }): Promise<Stats | BigIntStats> => {
    try { return options === undefined ? await lstat(path) : await lstat(path, options); }
    finally {
      if (/-wal$|-shm$|-journal$/u.test(path)) {
        sidecarReads += 1;
        if (sidecarReads === 18) {
          if (sidecarMutation === "clock-reader") {
            syntheticEngine.clockObservationForClosedCapture = (): Promise<typeof clock> => Promise.resolve(clock);
          } else if (sidecarMutation === "scope-reader") {
            syntheticEngine.upstream.currentAuthenticatedBridgeDispatchBinding = (): unknown => undefined;
          } else if (sidecarMutation === "scope") { state.scoped = true; }
        }
      }
    }
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-rename-owner-baseline.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  const context = createContext({ z, Object, Array, String, Number, Buffer, Error, types, structuredClone, lstat: observeStat, join, controlDataDirectory, controlRootCapability,
    CURRENT_SCHEMATIC_OPERATION_PURPOSE: "ordinary-schematic-rename",
    operationPath, readArtifact, verifyExactManagedArtifact, createCheckpoint, verifyCheckpoint, assertIssuedClosedFileCopy, copyClosedProjectBytes,
    readClosedCopySqlInventory: async (input: Parameters<typeof readClosedCopySqlInventory>[0]): ReturnType<typeof readClosedCopySqlInventory> => {
      const result = await readClosedCopySqlInventory(input); return state.cloneReader ? structuredClone(result) : result;
    },
    canonicalJson: (value: unknown): string => {
      if (isRecord(value) && value["profile"] === "private.current-schematic-rename-baseline.v1") { state.baselineSerializations += 1; }
      return canonicalJson(value);
    }, isRecord, sha256Json, normalizeEasyedaProjectPath: (value: string): string => { assert.equal(value, RAW); return source; },
    assertCompletedCurrentSchematicRenameOpeningTransfer: assertOwner,
    revalidateCurrentSchematicRenameOpeningOwner: (value: unknown, candidate: unknown): Promise<typeof retained> => {
      state.fullOpeningChecks += 1; return Promise.resolve(assertOwner(value, candidate));
    },
    revalidateCurrentSchematicRenameOpeningEvidence: (value: unknown, candidate: unknown): Promise<typeof retained> => {
      state.targetedOpeningChecks += 1; return Promise.resolve(assertOwner(value, candidate));
    },
    currentSchematicStoredHeaderSchema, isNativeDocumentDeleted, assertOriginalCurrentSchematicChildRoster, prepareCurrentSchematicChildRoster,
    assertOriginalCurrentSchematicNativeMetadata,
    // The coordinator's fresh input shell is from the VM. Normalize only that
    // Shell while retaining the actual completed reader and SCH target objects.
    prepareCurrentSchematicNativeMetadata: (input: Parameters<typeof prepareCurrentSchematicNativeMetadata>[0]): ReturnType<typeof prepareCurrentSchematicNativeMetadata> =>
      prepareCurrentSchematicNativeMetadata({ ...input }),
    // Only the newly built root shell comes from the VM. Normalize that shell
    // To the production realm; retain original SQL/owner child identities.
    freezeDeep: (value: Record<string, unknown>): Readonly<Record<string, unknown>> => freezeDeep({ ...value }),
    readerCompletion, decodeCurrentSymbolPreEditHistory,
    assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority,
    assertIssuedWindowsClockObservation: (value: unknown): Promise<typeof clock> => { assert.equal(value, clock); return Promise.resolve(clock); },
  });
  const exported: unknown = runInContext(`${program}\n({certify:certifyFrozenBaselineData,capture:captureCurrentSchematicRenameBaseline,clockBinding:currentSchematicRenameBaselineClockBinding,original:assertOriginalCurrentSchematicRenameBaseline,origin:currentSchematicRenameBaselineOrigin,revalidate:revalidateCurrentSchematicRenameBaseline,clockEvidence:revalidateCurrentSchematicRenameClosedClockEvidence});`, context);
  assert.ok(isRecord(exported) && ["certify", "capture", "clockBinding", "original", "origin", "revalidate", "clockEvidence"].every(key => typeof exported[key] === "function"));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained source exports above are checked functions in a private test realm.
  const api = exported as unknown as Api;
  const events: CurrentSchematicRenameBaselineEvidence[] = [], input = { owner, capture, intent, closeReceipt, proof, runtime: await syntheticSqlRuntime() };
  return { source, engine, input, api, events, state,
    replaceLaunch: (): void => { retained.source.launchProjection = structuredClone(retained.source.launchProjection); },
    run: (hook): Promise<CurrentSchematicRenameBaseline> => api.capture(engine, input, event => { events.push(event); hook?.(event); }) };
}

void test("SCH owner intention requires strict own data without invoking getters", () => {
  const request = { operationId: "schematic-owner", target: TARGET, desiredTitle: "Renamed SCH" };
  const parsed = parseCurrentSchematicRenameOwnerRequest(request); assert.ok(Object.isFrozen(parsed)); assert.ok(Object.isFrozen(parsed.target));
  for (const value of [{ ...request, code: "ignored" }, { ...request, target: { ...TARGET, symbolUuid: IDS.peer } },
    { ...request, desiredTitle: " padded " }, { ...request, operationId: "" }, { ...request, desiredTitle: "INPUT" },
    { ...request, desiredTitle: "Résumé SCH" }]) { assert.throws(() => parseCurrentSchematicRenameOwnerRequest(value)); }
  let accessed = false;
  const value = Object.defineProperty({ ...request }, "desiredTitle", { get: (): string => { accessed = true; return "Renamed SCH"; } });
  assert.throws(() => parseCurrentSchematicRenameOwnerRequest(value), /accessors/u); assert.equal(accessed, false);
});

void test("SCH baseline binds original normal closure to complete raw SQL and preserves unknown opening effects", async () => {
  const value = await fixture(); const result = await value.run();
  assert.deepEqual(value.events.map(event => event.kind), ["checkpoint", "copy", "inventory"]);
  assert.equal(result.inventory.checkpointSha256, result.copy.sha256); assert.equal(result.history.checkpointSha256, result.copy.sha256);
  assert.equal(result.checkpoint.sourceSha256, result.copy.sha256); assert.equal(result.maximumTicket, 100);
  assert.equal(result.history.documents.length, 3); assert.equal(result.targetMetadata.title, META.title);
  assert.equal(result.metadata.request.target.schematicUuid, IDS.target);
  assertOriginalCurrentSchematicNativeMetadata(result.metadata, result.inventory);
  assertOriginalCurrentSchematicChildRoster(result.children, result.inventory, result.metadata);
  assert.equal(result.intent.target.schematicUuid, IDS.target); assert.equal(result.intent.desiredTitle, "Renamed SCH");
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

void test("SCH baseline refuses copied capture or closure proof before any filesystem evidence", async () => {
  for (const key of ["capture", "proof"] as const) {
    const value = await fixture();
    await assert.rejects(value.api.capture(value.engine, { ...value.input, [key]: structuredClone(value.input[key]) }, event => { value.events.push(event); }),
      /original capture|retained authority/u);
    assert.equal(value.events.length, 0); await assert.rejects(value.run(), /already consumed/u);
  }
});

void test("SCH historical clock binding never substitutes same-JSON proof or capture identities", async () => {
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

void test("SCH baseline rejects incomplete transfer and another owner without consuming the real owner", async () => {
  const value = await fixture(); value.state.completed = false;
  await assert.rejects(value.run(), /cleanup-only/u); assert.equal(value.events.length, 0);
  value.state.completed = true;
  await assert.rejects(value.api.capture(value.engine, { ...value.input, owner: { ...value.input.owner } }, event => { value.events.push(event); }), /original SCH owner/u);
  const result = await value.run(); assert.equal(result.originalOpeningBound, true);
});

void test("SCH baseline stops at owner drift after retaining evidence and consumes its attempted capture", async () => {
  const value = await fixture();
  await assert.rejects(value.run(event => { if (event.kind === "checkpoint") { value.state.current = false; } }), /owner changed/u);
  assert.deepEqual(value.events.map(event => event.kind), ["checkpoint"]); value.state.current = true;
  await assert.rejects(value.run(), /already consumed/u);
});

void test("SCH baseline rejects a cloned complete SQL reader instead of trusting matching JSON", async () => {
  const value = await fixture(); value.state.cloneReader = true;
  await assert.rejects(value.run(), /original inventory/u);
  assert.deepEqual(value.events.map(event => event.kind), ["checkpoint", "copy", "inventory"]);
});

void test("SCH baseline retains full SQL but refuses a missing child or reuse structure before issuing authority", async () => {
  for (const sql of ["UPDATE project_structures SET structure=json_remove(structure,'$.sheets.cccccccccccccccc')",
    "UPDATE project_structures SET structure=json_set(structure,'$.blockSymbols.ffffffffffffffff',json('{}'))"]) {
    const value = await fixture(); mutate(value.source, sql);
    await assert.rejects(value.run(), /child roster/u);
    assert.deepEqual(value.events.map(event => event.kind), ["checkpoint", "copy", "inventory"]);
    await assert.rejects(value.run(), /already consumed/u);
  }
});

void test("SCH baseline source revalidation detects later durable changes before relaunch", async () => {
  const value = await fixture(); const result = await value.run();
  mutate(value.source, "UPDATE resources SET dataStr='later unauthorized bytes' WHERE hash='synthetic-resource'");
  await assert.rejects(value.api.revalidate(result, value.engine), /source\/checkpoint|changed/u);
});

void test("SCH closed-clock reader preserves full targeted checks without recursively invoking admission", async () => {
  const value = await fixture();
  const result = await value.run();
  const fullBefore = value.state.fullOpeningChecks;
  await value.api.clockEvidence(result, value.engine);
  assert.equal(value.state.fullOpeningChecks, fullBefore); assert.equal(value.state.targetedOpeningChecks, 7);
  await value.api.revalidate(result, value.engine);
  assert.equal(value.state.fullOpeningChecks, fullBefore + 7, "Other callers retain the full original revalidator");
  for (let index = 0; index < 20; index += 1) {
    assert.equal(value.api.original(result, value.engine), result); assert.equal(value.api.clockBinding(result, value.engine).proof, value.input.proof);
  }
  assert.equal(value.state.baselineSerializations, 0, "Frozen baseline data is certified once, never repeatedly serialized as a live check");
  value.state.captureValid = false;
  await assert.rejects(value.api.clockEvidence(result, value.engine), /capture released/u);
});

void test("SCH baseline certificate rejects mutable or executable graphs without getters, Proxy traps or toJSON", async () => {
  const { api } = await fixture(); let calls = 0;
  const trap = (): never => { calls += 1; throw new Error("getter, Proxy trap or toJSON invoked"); };
  const proxy = new Proxy(Object.freeze({}), { get: trap, getPrototypeOf: trap, ownKeys: trap, getOwnPropertyDescriptor: trap, isExtensible: trap });
  const accessor = Object.freeze(Object.defineProperty({}, "value", { get: trap, enumerable: true }));
  const cyclic: Record<string, unknown> = {}; cyclic["self"] = cyclic; Object.freeze(cyclic);
  const sparse: unknown[] = []; sparse.length = 1; Object.freeze(sparse);
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  const exotic: unknown = Object.create({ inherited: true }); Object.freeze(exotic);
  for (const value of [proxy, revoked.proxy, accessor, Object.freeze({ nested: accessor }), Object.freeze({ toJSON: trap }),
    Object.freeze({ nested: {} }), Object.freeze(new Map()), Object.freeze(new Set()), Object.freeze(new Date(0)),
    exotic, Object.freeze({ [Symbol("hidden")]: true }),
    Object.freeze(Object.defineProperty({}, "hidden", { value: true })), Object.freeze({ nested: undefined }),
    Object.freeze({ nested: Symbol("value") }), Object.freeze({ nested: 1n }), Object.freeze({ nested: Infinity }),
    Object.freeze({ nested: Number.NaN }), Object.freeze(Object.assign([], { extra: true })), sparse, cyclic]) {
    assert.throws(() => { api.certify(value); }, /frozen baseline/u);
  }
  assert.equal(calls, 0);
  const nullPrototype: unknown = Object.setPrototypeOf({ value: "safe" }, null); Object.freeze(nullPrototype);
  const shared = Object.freeze({ value: 1 });
  assert.doesNotThrow(() => { api.certify(Object.freeze({ first: shared, second: shared, list: Object.freeze([shared, nullPrototype, null, false]) })); });
});

void test("SCH closed-clock reader refuses target bytes or SQLite sidecars before scratch acceptance", async () => {
  const changed = await fixture(), changedResult = await changed.run();
  mutate(changed.source, "UPDATE resources SET dataStr='later unauthorized bytes' WHERE hash='synthetic-resource'");
  await assert.rejects(changed.api.clockEvidence(changedResult, changed.engine), /source\/checkpoint|changed/u);
  for (const kind of ["source", "checkpoint", "copy"] as const) {
    const value = await fixture();
    const result = await value.run();
    const path = kind === "copy" ? result.copy.artifact : result.checkpoint[kind];
    const handle = await open(`${path}-wal`, "wx", 0o600); await handle.close();
    await assert.rejects(value.api.clockEvidence(result, value.engine), /SQLite sidecar/u);
  }
});

for (const mutation of ["clock-reader", "scope-reader", "scope"] as const) {
  void test(`SCH closed-clock reader detects ${mutation} drift during its final sidecar await`, async () => {
    const value = await fixture(mutation);
    const result = await value.run();
    await assert.rejects(value.api.clockEvidence(result, value.engine), /capture reader or no-dispatch scope changed/u);
    assert.equal(value.state.targetedOpeningChecks, 7, "The drift occurs after all targeted file proof completed");
  });
}


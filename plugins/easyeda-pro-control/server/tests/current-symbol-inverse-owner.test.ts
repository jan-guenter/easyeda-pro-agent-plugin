/** Actual inverse-owner source with synthetic original issuer and I/O boundaries.
 * No production registration hook, Windows owner or connected validation.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";

type Bag = Record<string, unknown>;
function record(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(purpose: "disposable-validation" | "ordinary-symbol-metadata" = "disposable-validation"): Promise<{
  prepare: (predecessor?: unknown) => Promise<unknown>;
  original: (owner: unknown, engine?: unknown) => Bag;
  revalidate: (owner: unknown) => Promise<unknown>;
  transfer: (owner: unknown) => Promise<unknown>;
  transferred: (owner: unknown) => unknown;
  predecessor: object; initial: Bag; after: Bag; snapshot: Bag; launch: object; session: object;
  state: { closedChecks: number; stats: number; preparations: number; transfers: number; journalReads: number;
    decodeFails: boolean; transferFails: boolean; issuerCurrent: boolean; beforeMismatch: boolean; afterMismatch: boolean };
  requests: Bag[];
  drift: (where: "memory" | "disk" | "both") => void;
}> {
  const engine = Object.freeze({ synthetic: "engine" });
  const predecessor = Object.freeze({ profile: "private.current-symbol-verification-result.v1", operationId: "original-forward" });
  const initial = { name: "Initial name", description: "Initial description", tags: ["retained"], source: "retained-source" };
  const after = { ...initial, name: "Forward name", description: "Forward description" };
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), symbolUuid: "d".repeat(16) };
  const launch = Object.freeze({ synthetic: "verification-launch" }), session = Object.freeze({ synthetic: "verification-session" });
  const checkpoint = { checkpoint: "/synthetic/checkpoints/verified.eprj2", checkpointSha256: "e".repeat(64), sourceSha256: "f".repeat(64) };
  const snapshot = { checkpoint, copy: { receiptSha256: "1".repeat(64) } };
  const journal: Bag = { operationId: predecessor.operationId, state: "verification-retained-for-inverse", sequence: 12 };
  let closureTransferred = false, disk = structuredClone(journal);
  const state = { closedChecks: 0, stats: 0, preparations: 0, transfers: 0, journalReads: 0,
    decodeFails: false, transferFails: false, issuerCurrent: true, beforeMismatch: false, afterMismatch: false };
  const requests: Bag[] = [];
  const result = {
    snapshot, initialMetadata: initial, journal,
    writer: { original: { source: { purpose, runtime: { synthetic: "runtime" }, target: { ...target, documentUuid: "2".repeat(16), expectedSourceSha256: "3".repeat(64) },
      expectedFingerprint: { synthetic: "pinned" }, launchProjection: { synthetic: "old-launch" }, bridgeSession: { synthetic: "old-session" } },
    baseline: { preparation: { target, metadata: { before: initial, after } } } } },
    originalSnapshot: { launch, capture: { bridgeSession: session } },
    saved: { observation: { target, expectedBefore: { name: after.name, description: after.description, source: after.source,
      tagsJson: JSON.stringify(after.tags), version: "2026-10-16T17:30:00.000Z", ticket: 41 },
    expectedActor: { uuid: "4".repeat(32), username: "Fixture", nickname: "Fixture" } } },
    revalidateClosed: (): Promise<void> => {
      state.closedChecks += 1; assert.equal(closureTransferred, false, "Retired closure must not be revived"); return Promise.resolve();
    },
    transfer: (): Promise<void> => {
      state.transfers += 1;
      if (state.transferFails) { return Promise.reject(new Error("Synthetic transfer failure")); }
      assert.equal(closureTransferred, false); closureTransferred = true;
      journal["state"] = "plan-invalidated"; journal["sequence"] = 13; disk = structuredClone(journal);
      return Promise.resolve();
    },
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-inverse-owner.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const prepareMetadata = (input: unknown): Promise<Bag> => {
    state.preparations += 1; const request = record(input); requests.push(structuredClone(request));
    if (state.decodeFails) { return Promise.reject(new Error("Synthetic checkpoint decoder refusal")); }
    return Promise.resolve({ target, patch: request["patch"], metadata: {
      before: { ...after, ...(state.beforeMismatch ? { name: "Foreign before" } : {}) },
      after: { ...initial, ...(state.afterMismatch ? { description: "Wrong inverse" } : {}) },
    } });
  };
  const context = createContext({ Object, Promise, structuredClone, canonicalJson, sha256Json,
    assertCurrentSymbolVerificationResult: (value: unknown, candidateEngine: unknown): typeof result => {
      assert.equal(value, predecessor, "Original verification issuer required"); assert.equal(candidateEngine, engine);
      assert.equal(state.issuerCurrent, true, "Original verification owner changed"); return result;
    },
    loadOperation: (operationId: string): Promise<Bag> => {
      assert.equal(operationId, predecessor.operationId); state.journalReads += 1; return Promise.resolve(structuredClone(disk));
    },
    lstat: (path: string, options: unknown): Promise<unknown> => {
      assert.equal(path, checkpoint.checkpoint); assert.equal(record(options)["bigint"], true); state.stats += 1;
      return Promise.resolve({ size: 481n });
    },
    prepareCurrentInverseSymbolMetadata: prepareMetadata,
  });
  const api = record(runInContext(`${program}\n({prepareCurrentSymbolInverseOwner, assertCurrentSymbolInverseBaselineOwner,
    revalidateCurrentSymbolInverseBaselineOwner, transferCurrentSymbolInverseBaselineOwner, currentSymbolInverseOwnershipTransferred});`, context));
  const invoke = (name: string, args: unknown[]): unknown => {
    const method = api[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, undefined, args) as unknown;
  };
  return {
    prepare: async (value = predecessor): Promise<unknown> => await invoke("prepareCurrentSymbolInverseOwner", [engine, value]),
    original: (owner, candidateEngine = engine): Bag => record(invoke("assertCurrentSymbolInverseBaselineOwner", [owner, candidateEngine])),
    revalidate: async (owner): Promise<unknown> => await invoke("revalidateCurrentSymbolInverseBaselineOwner", [owner, engine]),
    transfer: async (owner): Promise<unknown> => await invoke("transferCurrentSymbolInverseBaselineOwner", [owner, engine]),
    transferred: (owner): unknown => invoke("currentSymbolInverseOwnershipTransferred", [owner, engine]),
    predecessor, initial, after, snapshot, launch, session, state, requests,
    drift: (where): void => {
      if (where !== "disk") { journal["foreignMarker"] = "unrelated change"; }
      if (where !== "memory") { disk["foreignMarker"] = "unrelated change"; }
    },
  };
}

void test("inverse owner requires the genuine predecessor and derives only the initial metadata patch", async () => {
  const f = await fixture();
  await assert.rejects(f.prepare(structuredClone(f.predecessor)), /Original verification issuer/u);
  await assert.rejects(f.prepare({ profile: "private.current-symbol-verification-result.v1", operationId: "fabricated" }), /Original verification issuer/u);
  assert.equal(f.state.preparations, 0); assert.equal(f.state.stats, 0);
  const owner = await f.prepare();
  const original = f.original(owner), source = record(original["source"]);
  assert.equal(source["purpose"], "disposable-validation");
  assert.equal(record(owner)["openingOperationId"], record(f.predecessor)["operationId"]);
  assert.equal(record(owner)["operationId"], `inverse-${sha256Json({ operationId: "original-forward", snapshot: "1".repeat(64) })}`);
  assert.equal(f.state.preparations, 1); assert.equal(f.state.stats, 1); assert.equal(f.state.transfers, 0);
  const request = f.requests[0]; assert.ok(request !== undefined);
  assert.deepEqual(request["patch"], { name: f.initial["name"], description: f.initial["description"] });
  assert.deepEqual(request["checkpoint"], { path: "/synthetic/checkpoints/verified.eprj2", bytes: 481, sha256: "e".repeat(64) });
  assert.equal(record(source["target"])["expectedSourceSha256"], "f".repeat(64));
  assert.equal(source["launchProjection"], f.launch); assert.equal(source["bridgeSession"], f.session);
  const preparation = record(original["preparation"]);
  const observation = record(record(preparation["closedTargetWitness"])["observation"]);
  assert.equal(record(observation["value"])["name"], f.after["name"]);
  assert.equal(record(observation["value"])["ticket"], 41);
  assert.throws(() => f.original(structuredClone(owner)), /original successful verification/u);
  assert.throws(() => f.original(owner, {}), /original successful verification/u);
  await assert.rejects(f.prepare(), /original successful verification/u); assert.equal(f.state.preparations, 1);
  f.state.issuerCurrent = false;
  assert.throws(() => f.original(owner), /Original verification owner/u);
});

void test("ordinary verification cannot provide inverse ownership", async () => {
  const f = await fixture("ordinary-symbol-metadata");
  await assert.rejects(f.prepare(), /original successful verification/u);
  assert.equal(f.state.closedChecks, 0); assert.equal(f.state.stats, 0); assert.equal(f.state.preparations, 0);
});

void test("failed inverse preparation consumes its attempt without transferring closure", async () => {
  const f = await fixture(); f.state.decodeFails = true;
  await assert.rejects(f.prepare(), /Synthetic checkpoint decoder/u);
  f.state.decodeFails = false;
  await assert.rejects(f.prepare(), /original successful verification/u);
  assert.equal(f.state.preparations, 1); assert.equal(f.state.transfers, 0);
});

for (const mismatch of ["beforeMismatch", "afterMismatch"] as const) {
  void test(`inverse preparation refuses ${mismatch} in the actual verified checkpoint`, async () => {
    const f = await fixture(); f.state[mismatch] = true;
    await assert.rejects(f.prepare(), /original successful verification/u);
    assert.equal(f.state.transfers, 0);
  });
}

void test("inverse closure transfer is one-shot and later revalidation does not revive the old proof", async () => {
  const f = await fixture(), owner = await f.prepare();
  assert.equal(f.transferred(owner), false); await f.revalidate(owner);
  await f.transfer(owner); assert.equal(f.transferred(owner), true);
  const checks = f.state.closedChecks;
  await f.revalidate(owner); assert.equal(f.state.closedChecks, checks); assert.equal(f.state.journalReads, 1);
  await assert.rejects(f.transfer(owner), /original successful verification/u); assert.equal(f.state.transfers, 1);
});

void test("failed inverse transfer cannot replay or claim completed ownership", async () => {
  const f = await fixture(), owner = await f.prepare(); f.state.transferFails = true;
  await assert.rejects(f.transfer(owner), /Synthetic transfer/u); assert.equal(f.transferred(owner), false);
  f.state.transferFails = false;
  await assert.rejects(f.transfer(owner), /original successful verification/u); assert.equal(f.state.transfers, 1);
});

for (const where of ["memory", "disk", "both"] as const) {
  void test(`inverse owner refuses ${where} drift from its frozen transferred journal`, async () => {
    const f = await fixture(), owner = await f.prepare(); await f.transfer(owner); f.drift(where);
    await assert.rejects(f.revalidate(owner), /original successful verification/u);
    assert.equal(f.state.transfers, 1);
  });
}

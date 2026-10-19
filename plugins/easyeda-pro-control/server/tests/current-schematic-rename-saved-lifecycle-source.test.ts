/** Actual lifecycle-source wrapper with explicit synthetic dependency seams.
 * The separate saved-source tests use real SQL readers; this file proves wiring,
 * retained identity and failure behavior, not native continuation issuance.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "wrong-phase" | "wrong-ack" | "owner-after-copy" | "changed-history";
interface Api {
  prepare: (continuation: unknown, engine: unknown) => Promise<unknown>;
  assert: (value: unknown, engine: unknown, continuation: unknown) => unknown;
  revalidate: (value: unknown, engine: unknown, continuation: unknown) => Promise<unknown>;
  compare: (value: unknown, engine: unknown, continuation: unknown, metadata: unknown, children: unknown) => unknown;
}
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(failure: Failure = "none"): Promise<{
  api: Api; continuation: object; engine: object;
  state: { valid: boolean; data: number; copy: number; history: number; comparisons: number };
}> {
  const continuation = Object.freeze({ profile: "synthetic-original-sch-continuation", operationId: "synthetic-saved-sch" }), engine = {};
  const before = Object.freeze({ original: "before" }), inventory = Object.freeze({ original: "after", logicalSha256: "a".repeat(64) });
  const actor = Object.freeze({ uuid: "1".repeat(32), username: "synthetic-user", nickname: "" });
  const expectedBefore = Object.freeze({ name: "after", displayName: "After", ticket: 101, updateTime: 3000, version: "3000", source: "", boardUuid: "" });
  const startupInput = Object.freeze({ sheetUuids: ["3".repeat(16)], templates: [] }), targetUuid = "2".repeat(16);
  const baseline = Object.freeze({ inventory: before, metadata: { original: "metadata" }, children: { original: "children", startupInput },
    intent: { target: { schematicUuid: targetUuid }, desiredTitle: "After" } });
  const snapshot = Object.freeze({ phase: failure === "wrong-phase" ? "closed-verification" : "closed-edit",
    checkpoint: { checkpoint: "/synthetic/sch-checkpoint.eprj2", checkpointSha256: "b".repeat(64) },
    copy: { artifact: "/synthetic/sch-raw.eprj2", bytes: 4096, sha256: "c".repeat(64) },
    native: { schematicUuid: targetUuid, projectUuid: "4".repeat(64), branchUuid: "5".repeat(32), ownerUuid: "6".repeat(32), historySemanticSha256: "d".repeat(64) } });
  const snapshotSource = Object.freeze({ inventory, baseline });
  const source = Object.freeze({ operationId: continuation.operationId, snapshot, original: { baseline },
    preparation: { original: "preparation" }, storedEffect: { original: "effect" },
    writeInput: { expectedActor: actor }, writeResult: { after: { uuid: targetUuid, ...expectedBefore,
      ...(failure === "wrong-ack" ? { displayName: "Wrong" } : {}) }, afterMaxTicket: 101, actor } });
  const dataSource = Object.freeze({ sourceSha256: "e".repeat(64), maximumTicket: 101 });
  const data = Object.freeze({ metadata: { request: { expectedBefore } }, children: { startupInput } });
  const state = { valid: true, data: 0, copy: 0, history: 0, comparisons: 0 };
  const current = (): void => { assert.equal(state.valid, true, "original continuation changed"); };
  const original = (value: unknown, received: unknown): typeof source => {
    current(); assert.equal(value, continuation); assert.equal(received, engine); return source;
  };
  const readSource = (value: unknown, after: unknown): typeof data => { current(); assert.equal(value, dataSource); assert.equal(after, inventory); return data; };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-rename-saved-lifecycle-source.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const))/gu, "");
  const context = createContext({ Object, WeakMap, Error, Promise, canonicalJson, sha256Json,
    assertOriginalCurrentSchematicRenameWriterContinuation: original,
    assertOriginalCurrentSchematicRenameSnapshot: (value: unknown, received: unknown): typeof snapshotSource => {
      current(); assert.equal(value, snapshot); assert.equal(received, engine); return snapshotSource;
    },
    prepareCurrentSchematicRenameSavedSource: (...values: unknown[]): Promise<typeof dataSource> => {
      assert.deepEqual(values, [source.preparation, before, baseline.metadata, baseline.children, source.storedEffect, inventory]);
      current(); state.data += 1; return Promise.resolve(dataSource);
    },
    originalCurrentSchematicRenameSavedSource: readSource,
    verifyExactManagedArtifact: (value: unknown): Promise<void> => {
      assert.equal(canonicalJson(value), canonicalJson({ path: snapshot.copy.artifact, bytes: snapshot.copy.bytes, sha256: snapshot.copy.sha256 }));
      state.copy += 1; if (failure === "owner-after-copy") { state.valid = false; } return Promise.resolve();
    },
    readNativeHistoryCheckpoint: (value: unknown): Promise<unknown> => {
      assert.equal(bag(value)["checkpointPath"], snapshot.checkpoint.checkpoint); assert.equal(bag(value)["expectedSha256"], snapshot.checkpoint.checkpointSha256);
      state.history += 1; return Promise.resolve({ semanticSha256: failure === "changed-history" ? "f".repeat(64) : snapshot.native.historySemanticSha256,
        branchUuid: snapshot.native.branchUuid, projectOwnerUuid: snapshot.native.ownerUuid });
    },
    compareCurrentSchematicRenameSavedObservations: (value: unknown, after: unknown, metadata: unknown, children: unknown): unknown => {
      readSource(value, after); assert.deepEqual(metadata, { observed: "metadata" }); assert.deepEqual(children, { observed: "children" });
      state.comparisons += 1; return Object.freeze({ suppliedSavedMetadataMatched: true, suppliedSavedChildRosterMatched: true, executionAuthorized: false, reopened: false });
    },
  });
  const api: unknown = runInContext(`${program}\n({prepare:prepareCurrentSchematicRenameSavedLifecycleSource,assert:assertCurrentSchematicRenameSavedLifecycleSource,revalidate:revalidateCurrentSchematicRenameSavedLifecycleSource,compare:verifyCurrentSchematicRenameSavedMetadataAndChildren})`, context);
  assert.ok(isRecord(api));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only four maintained functions are exposed from this private synthetic realm, with no production injection port.
  return { api: api as unknown as Api, continuation, engine, state };
}

void test("SCH lifecycle source binds the original writer, snapshot and stored relation without new runtime authority", async () => {
  const f = await fixture();
  const descriptor = await f.api.prepare(f.continuation, f.engine);
  assert.equal(bag(descriptor)["executionAuthorized"], false); assert.equal(bag(descriptor)["completionProved"], false);
  assert.equal(bag(descriptor)["metadataAndChildRosterOnly"], true); assert.equal(f.state.data, 1);
  f.api.assert(descriptor, f.engine, f.continuation);
  await f.api.revalidate(descriptor, f.engine, f.continuation); assert.equal(f.state.copy, 2); assert.equal(f.state.history, 2);
  const relation = bag(f.api.compare(descriptor, f.engine, f.continuation, { observed: "metadata" }, { observed: "children" }));
  assert.equal(relation["suppliedSavedChildRosterMatched"], true); assert.equal(relation["reopened"], false); assert.equal(f.state.comparisons, 1);
  assert.throws(() => f.api.assert(structuredClone(descriptor), f.engine, f.continuation));
  assert.throws(() => f.api.assert(descriptor, f.engine, structuredClone(f.continuation)));
  assert.throws(() => f.api.assert(descriptor, {}, f.continuation));
});
void test("SCH lifecycle source refuses wrong phase, acknowledgment, changed original owner and retained history", async () => {
  for (const failure of ["wrong-phase", "wrong-ack", "owner-after-copy", "changed-history"] as const) {
    const f = await fixture(failure); await assert.rejects(f.api.prepare(f.continuation, f.engine));
    assert.equal(f.state.comparisons, 0);
    if (failure === "wrong-phase") { assert.equal(f.state.data, 0); assert.equal(f.state.copy, 0); }
    if (failure === "wrong-ack") { assert.equal(f.state.copy, 0); }
    if (failure === "owner-after-copy") { assert.equal(f.state.history, 0); }
  }
});

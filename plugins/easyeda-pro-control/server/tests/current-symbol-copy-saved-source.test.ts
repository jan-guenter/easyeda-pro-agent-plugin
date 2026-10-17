/** Actual saved-source logic with synthetic original owners and pure history.
 * No file or application authority is granted by these fixtures.
 */
/* oxlint-disable import/max-dependencies -- Exercise the maintained schema, pin, native decoder and both real projection encodings without replacing their checks with mocks. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { currentSymbolCopySavedReadRequestSchema } from "../src/current-symbol-copy-saved-read-program.ts";
import { CURRENT_SAVED_SYMBOL_CONTENT_LIMIT } from "../src/current-symbol-saved-read-program.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import { CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION, expectedSavedSymbolContent, prepareCurrentCreatedCopySavedSymbolProjection,
  verifyCurrentCreatedCopySavedSymbolProjectionAlternatives } from "../src/saved-symbol-projection.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "returned-id" | "plan-copy" | "append-plan-copy" | "metadata-ticket" | "version" | "actor" | "startup" | "retained-history" | "owner";
const CLIENT = "a".repeat(16), FRESH = "b".repeat(16), SOURCE = "1".repeat(16), TARGET = "2".repeat(16);
const ACTOR = Object.freeze({ uuid: "4".repeat(32), username: "Synthetic", nickname: "Actor" });
const META = Object.freeze({ title: "Copied", description: "Exact description", tags: ["synthetic"], docType: 2, source: "" });
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function head(ticket: number, time: number, uuid: string): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: CLIENT, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.206" })}`;
}
function edit(time: number): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: time })}`; }
function metadata(ticket: number): string { return `${JSON.stringify({ type: "META", ticket, id: "META" })}||${JSON.stringify(META)}`; }
async function fixture(failure: Failure = "none"): Promise<{
  prepare: (copied?: boolean) => Promise<Bag>; verify: (value: unknown, content: string, targetUuid?: string) => Bag;
  raw: string; cached: string; state: { live: boolean; checkpointReads: number; historyIdentities: Bag[] };
}> {
  const continuation = Object.freeze({ synthetic: "original-continuation" }), engine = Object.freeze({ synthetic: "engine" });
  const sourceTarget = { projectUuid: "1".repeat(64), branchUuid: "3".repeat(32), symbolUuid: SOURCE };
  const canvas = ['{"type":"PART","ticket":5,"id":"p"}||{"partId":"p"}', '{"type":"RECT","ticket":11,"id":"r"}||{ "partId":"p", "x": 1 }'];
  const chunks = [[edit(50), head(40, 50, SOURCE), metadata(40), ...canvas].join("|\n"),
    [edit(3000), head(41, 2000, TARGET), metadata(41), head(42, 2001, TARGET), ...canvas].join("|\n")];
  const projection = await prepareCurrentCreatedCopySavedSymbolProjection({ chunks, targetUuid: TARGET, beforeMaximumTicket: 40, currentEditVersion: "3.2.206" });
  const documents = materializeNativeHistory(chunks);
  const history = { ...sourceTarget, projectOwnerUuid: ACTOR.uuid, documents, semanticSha256: sha256Json(documents) };
  const snapshot = { checkpoint: { checkpoint: "/synthetic/closed.eprj2", checkpointSha256: "5".repeat(64) },
    native: { ...sourceTarget, ownerUuid: ACTOR.uuid, historySemanticSha256: history.semanticSha256 } };
  const inventory = Object.freeze({ logicalSha256: "6".repeat(64) }), originalSnapshot = Object.freeze({ inventory });
  const startup = Object.freeze({ sheetUuids: ["8".repeat(16)], templates: [] });
  const plan = Object.freeze({ source: sourceTarget, ownerUuid: ACTOR.uuid, destinationMetadata: META, metadataTicket: 41, canvasHeaderTicket: 42 });
  const source = Object.freeze({ operationId: "synthetic-copy-saved-source", snapshot, clockPlan: Object.freeze({}), dispatchOwner: Object.freeze({}),
    original: Object.freeze({ baseline: { preparation: failure === "plan-copy" ? structuredClone(plan) : plan } }),
    writeResult: { createdUuid: failure === "returned-id" ? SOURCE : TARGET,
      created: { version: failure === "version" ? "2000" : "2001", ticket: failure === "metadata-ticket" ? 42 : 41 } },
    writeInput: { expectedActor: failure === "actor" ? { ...ACTOR, nickname: "Changed" } : ACTOR,
      startup: failure === "startup" ? { ...startup, sheetUuids: [] } : startup } });
  const completed = Object.freeze({ copyPlan: plan, append: { plan: failure === "append-plan-copy" ? structuredClone(plan) : plan,
    targetUuid: TARGET, projection }, expectedActor: ACTOR, comparison: { synthetic: "complete-original-comparison" } });
  const state = { live: true, checkpointReads: 0, historyIdentities: [] as Bag[] };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-copy-saved-source.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Buffer, JSON, WeakMap, Error, Promise, canonicalJson, sha256Json,
    CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION, CURRENT_SAVED_SYMBOL_CONTENT_LIMIT,
    currentSymbolCopySavedReadRequestSchema, expectedSavedSymbolContent, verifyCurrentCreatedCopySavedSymbolProjectionAlternatives,
    assertOriginalCurrentSymbolCopyWriterContinuation: (value: unknown, received: unknown): typeof source => {
      assert.equal(value, continuation, "original continuation"); assert.equal(received, engine); assert.equal(state.live, true); return source;
    },
    assertOriginalCurrentSymbolCopyFinishSnapshot: (value: unknown, received: unknown): typeof originalSnapshot => {
      assert.equal(value, snapshot); assert.equal(received, engine); return originalSnapshot;
    },
    completedCurrentSymbolCopyClockSource: (clock: unknown, owner: unknown, received: unknown): typeof completed => {
      assert.equal(clock, source.clockPlan); assert.equal(owner, source.dispatchOwner); assert.equal(received, inventory); return completed;
    },
    decodeCurrentSymbolPreEditHistory: (received: unknown, target: unknown): Promise<unknown> => {
      assert.equal(received, inventory);
      // The real decoder accepts exactly these two fields, not the symbol target.
      assert.equal(canonicalJson(target), canonicalJson({ projectUuid: sourceTarget.projectUuid, branchUuid: sourceTarget.branchUuid }));
      state.historyIdentities.push(structuredClone(bag(target)));
      return Promise.resolve({ history: failure === "owner" ? { ...history, projectOwnerUuid: "7".repeat(32) } : history, maximumTicket: 42 });
    },
    selectCurrentSymbolStartupExpectation: (): typeof startup => startup,
    readNativeHistoryCheckpoint: (input: Bag): Promise<unknown> => {
      state.checkpointReads += 1; assert.equal(input["checkpointPath"], snapshot.checkpoint.checkpoint);
      assert.equal(input["expectedSha256"], snapshot.checkpoint.checkpointSha256);
      return Promise.resolve(failure === "retained-history" ? { ...history, semanticSha256: "7".repeat(64) } : history);
    },
  });
  const api = bag(runInContext(`${program}\n({prepareCurrentCopiedSymbolSource,verifyCurrentCopiedSymbolContent});`, context));
  const invoke = (name: string, args: unknown[]): unknown => { const fn = api[name]; assert.ok(typeof fn === "function"); return Reflect.apply(fn, undefined, args) as unknown; };
  return {
    prepare: async (copied = false): Promise<Bag> => bag(await invoke("prepareCurrentCopiedSymbolSource", [copied ? structuredClone(continuation) : continuation, engine])),
    verify: (value, content, targetUuid = TARGET): Bag => bag(invoke("verifyCurrentCopiedSymbolContent", [value, engine, continuation,
      { profile: "private.saved-symbol-content-observation.v1", targetUuid, maximumTicket: 42, workerClient: FRESH, content }])),
    raw: expectedSavedSymbolContent(projection.raw, FRESH), cached: expectedSavedSymbolContent(projection.documentCache, FRESH), state,
  };
}

void test("copy saved source projects the exact two-field history identity from its three-field symbol source", async () => {
  const f = await fixture(); const source = await f.prepare();
  assert.deepEqual(f.state.historyIdentities, [{ projectUuid: "1".repeat(64), branchUuid: "3".repeat(32) }]);
  assert.equal(source["sourceUuid"], SOURCE); assert.equal(source["destinationUuid"], TARGET);
  assert.equal(f.state.checkpointReads, 1);
});

void test("copy saved source binds the original returned UUID and both exact content encodings", async () => {
  const f = await fixture(); await assert.rejects(f.prepare(true), /original continuation/u);
  const source = await f.prepare(); assert.equal(source["sourceUuid"], SOURCE); assert.equal(source["destinationUuid"], TARGET);
  assert.equal(source["maximumTicket"], 42); assert.equal(source["metadataTicket"], 41); assert.equal(source["completionProved"], false);
  assert.equal(f.state.checkpointReads, 1); assert.notEqual(f.raw, f.cached);
  for (const content of [f.raw, f.cached]) {
    assert.equal(f.verify(source, content)["exactContent"], true); assert.equal(f.verify(source, content)["executionAuthorized"], false);
  }
  assert.throws(() => f.verify(source, f.raw, SOURCE));
  assert.throws(() => f.verify(source, f.cached.replace('{ "partId":"p", "x": 1 }', '{"partId":"p","x":1}')));
  assert.throws(() => f.verify(structuredClone(source), f.raw));
  f.state.live = false; assert.throws(() => f.verify(source, f.raw));
});

void test("copy saved source refuses substituted ownership, ACK and retained history", async () => {
  for (const failure of ["returned-id", "plan-copy", "append-plan-copy", "metadata-ticket", "version", "actor", "startup", "retained-history", "owner"] as const) {
    const f = await fixture(failure); await assert.rejects(f.prepare(), /original successful copy/u);
  }
});

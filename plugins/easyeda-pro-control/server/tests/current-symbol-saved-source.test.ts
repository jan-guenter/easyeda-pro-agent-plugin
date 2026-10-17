/** Maintained saved-source code with synthetic original owners and pure projectors. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { CURRENT_SAVED_SYMBOL_CONTENT_LIMIT, currentSavedSymbolReadRequestSchema } from "../src/current-symbol-saved-read-program.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import { CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION, expectedSavedSymbolContent, prepareCurrentCanvasSegmentsSavedSymbolProjection,
  prepareCurrentDocumentCacheSavedSymbolProjection, prepareSavedSymbolProjection, verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives,
  verifyCurrentSavedSymbolProjectionAlternatives } from "../src/saved-symbol-projection.ts";

type Bag = Record<string, unknown>;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
const CLIENT = "a".repeat(16), FRESH = "b".repeat(16), TARGET = "2".repeat(16);
const ACTOR = Object.freeze({ uuid: "4".repeat(32), username: "Synthetic", nickname: "Actor" });
function chunk(ticket: number, stamp: number, canvas: boolean): string {
  return [`{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: stamp })}`,
    `{"type":"DOCHEAD","ticket":${ticket}}||${JSON.stringify({ docType: "SYMBOL", uuid: TARGET, client: CLIENT, updateTime: stamp, version: String(stamp), editVersion: "3.2.206" })}`,
    `{"type":"META","ticket":${ticket},"id":"META"}||${JSON.stringify({ title: "After", description: "Description", tags: [], source: "", docType: 2 })}`,
    ...(canvas ? [`{"type":"LINE","ticket":${ticket + 1},"id":"shape-${ticket}"}||{ "x":1 }`] : [])].join("|\n");
}
async function fixture(purpose: "disposable-validation" | "ordinary-symbol-metadata", canvas: boolean | "multi"): Promise<{
  prepare: (copied?: boolean) => Promise<Bag>; verify: (value: unknown, content: string) => Bag;
  content: () => string;
  state: { cachePreparations: number; checkpointReads: number; live: boolean };
}> {
  const continuation = Object.freeze({ synthetic: "original-continuation" }), engine = Object.freeze({ synthetic: "engine" });
  const target = { projectUuid: "1".repeat(64), branchUuid: "3".repeat(32), symbolUuid: TARGET, ownerUuid: ACTOR.uuid };
  const chunks = canvas === "multi" ? [chunk(1, 100, true), chunk(3, 200, true), chunk(5, 300, false)]
    : [chunk(1, 100, canvas), chunk(3, 200, false)];
  const documents = materializeNativeHistory(chunks), maximumTicket = canvas === "multi" ? 5 : 3;
  const history = { ...target, projectOwnerUuid: ACTOR.uuid, documents, semanticSha256: sha256Json(documents) };
  const snapshot = { checkpoint: { checkpoint: "/synthetic/closed.eprj2", checkpointSha256: "5".repeat(64) },
    native: { ...target, historySemanticSha256: history.semanticSha256 } };
  const originalSnapshot = Object.freeze({ inventory: { logicalSha256: "6".repeat(64) } });
  const source = Object.freeze({ operationId: "synthetic-saved-source", snapshot, clockPlan: Object.freeze({}), dispatchOwner: Object.freeze({}),
    original: Object.freeze({ source: Object.freeze({ purpose }) }), writeInput: { target, expectedActor: ACTOR } });
  const decoded = { decoded: { chunks, history, maximumTicket }, expectedTicket: maximumTicket, expectedDocumentEditVersion: "3.2.206", expectedActor: ACTOR,
    comparison: { synthetic: "complete-original-comparison" }, metadataPlan: { ...target, targetUuid: TARGET,
      desiredTitle: "After", desiredDescription: "Description", beforeTags: [], beforeSource: "" } };
  const state = { cachePreparations: 0, checkpointReads: 0, live: true };
  let cache: Awaited<ReturnType<typeof prepareCurrentCanvasSegmentsSavedSymbolProjection>> | Awaited<ReturnType<typeof prepareCurrentDocumentCacheSavedSymbolProjection>> | undefined;
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-saved-source.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Buffer, JSON, WeakMap, Error, Promise, canonicalJson, sha256Json,
    CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION, CURRENT_SAVED_SYMBOL_CONTENT_LIMIT,
    currentSavedSymbolReadRequestSchema, expectedSavedSymbolContent, prepareSavedSymbolProjection,
    verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives, verifyCurrentSavedSymbolProjectionAlternatives,
    assertOriginalCurrentSymbolWriterContinuation: (value: unknown, received: unknown): typeof source => {
      assert.equal(value, continuation, "original continuation"); assert.equal(received, engine); assert.equal(state.live, true); return source;
    },
    assertOriginalCurrentSymbolFinishSnapshot: (value: unknown, received: unknown): typeof originalSnapshot => {
      assert.equal(value, snapshot); assert.equal(received, engine); return originalSnapshot;
    },
    decodeCompletedCurrentSymbolTransactionHistory: (plan: unknown, owner: unknown, inventory: unknown): Promise<typeof decoded> => {
      assert.equal(plan, source.clockPlan); assert.equal(owner, source.dispatchOwner); assert.equal(inventory, originalSnapshot.inventory);
      return Promise.resolve(decoded);
    },
    selectCurrentSymbolStartupExpectation: (): Bag => ({ sheetUuids: ["8".repeat(16)], templates: [] }),
    readNativeHistoryCheckpoint: (): Promise<typeof history> => { state.checkpointReads += 1; return Promise.resolve(history); },
    prepareCurrentDocumentCacheSavedSymbolProjection: async (input: Parameters<typeof prepareCurrentDocumentCacheSavedSymbolProjection>[0]): Promise<typeof cache> => {
      state.cachePreparations += 1; cache = await prepareCurrentDocumentCacheSavedSymbolProjection(input); return cache;
    },
    prepareCurrentCanvasSegmentsSavedSymbolProjection: async (input: Parameters<typeof prepareCurrentCanvasSegmentsSavedSymbolProjection>[0]): Promise<typeof cache> => {
      state.cachePreparations += 1; cache = await prepareCurrentCanvasSegmentsSavedSymbolProjection(input); return cache;
    },
  });
  const api = bag(runInContext(`${program}\n({prepareCurrentSavedSymbolSource,verifyCurrentSavedSymbolContent});`, context));
  const invoke = (name: string, args: unknown[]): unknown => { const fn = api[name]; assert.ok(typeof fn === "function"); return Reflect.apply(fn, undefined, args) as unknown; };
  return {
    prepare: async (copied = false): Promise<Bag> => bag(await invoke("prepareCurrentSavedSymbolSource", [copied ? structuredClone(continuation) : continuation, engine])),
    verify: (value, content): Bag => bag(invoke("verifyCurrentSavedSymbolContent", [value, engine, continuation,
      { profile: "private.saved-symbol-content-observation.v1", targetUuid: TARGET, maximumTicket, workerClient: FRESH, content }])),
    content: (): string => { assert.ok(cache !== undefined); return expectedSavedSymbolContent(cache, FRESH); }, state,
  };
}

void test("original disposable saved-source verifies exact canvas output without exposing that alternative to ordinary owners", async () => {
  const f = await fixture("disposable-validation", true);
  await assert.rejects(f.prepare(true), /original continuation/u);
  const source = await f.prepare(); assert.equal(source["purpose"], "disposable-validation");
  assert.equal(source["cacheProjectionProfile"], "private.current-canvas-segments-saved-symbol-getstr-projection.v1");
  const content = f.content(), relation = f.verify(source, content);
  assert.equal(relation["matchedProjection"], "current-canvas-segments-cache");
  assert.equal(relation["exactContent"], true); assert.equal(relation["cacheBranchObserved"], false);
  assert.throws(() => f.verify(source, content.replace('{ "x":1 }', '{"x":1}')), /differs/u);
  assert.throws(() => f.verify(structuredClone(source), content), /original complete post-edit/u);
  f.state.live = false; assert.throws(() => f.verify(source, content));
  const ordinary = await fixture("ordinary-symbol-metadata", true);
  await assert.rejects(ordinary.prepare(), /original complete post-edit/u);
  assert.equal(ordinary.state.cachePreparations, 0); assert.equal(ordinary.state.checkpointReads, 0);
});

void test("original disposable saved-source admits exact multi-segment order variants without ordinary-owner fallback", async () => {
  const f = await fixture("disposable-validation", "multi"), source = await f.prepare();
  assert.equal(source["cacheProjectionProfile"], "private.current-canvas-segments-saved-symbol-getstr-projection.v1");
  const records = f.content().split("|\n");
  assert.equal(records.length, 5);
  const reordered = [...records.slice(0, 3), ...records.slice(3).toReversed()].join("|\n");
  assert.notEqual(reordered, f.content());
  const result = f.verify(source, reordered);
  assert.equal(result["exactContent"], true);
  assert.equal(result["cacheBranchObserved"], false);
  assert.equal(result["matchedProjection"], "current-canvas-segments-cache");
  assert.throws(() => f.verify(source, reordered.replace('{ "x":1 }', '{"x":1}')), /differs|exact/u);
  assert.throws(() => f.verify(structuredClone(source), reordered), /original complete post-edit/u);
  const ordinary = await fixture("ordinary-symbol-metadata", "multi");
  await assert.rejects(ordinary.prepare(), /original complete post-edit/u);
  assert.equal(ordinary.state.cachePreparations, 0); assert.equal(ordinary.state.checkpointReads, 0);
});

void test("both purposes retain the original exact META-only saved-source selector", async () => {
  for (const purpose of ["ordinary-symbol-metadata", "disposable-validation"] as const) {
    const f = await fixture(purpose, false), source = await f.prepare();
    assert.equal(source["cacheProjectionProfile"], "private.current-document-cache-saved-symbol-getstr-projection.v1");
    assert.equal(f.verify(source, f.content())["matchedProjection"], "current-document-cache");
  }
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { PCB_SELECTED_OBJECTS_IDS_METHOD, PCB_SELECTED_OBJECTS_METHOD, PCB_SELECTED_OBJECTS_PROFILE } from "../src/pcb-selected-objects.ts";
import { readPcbSelectedObjects } from "../src/pcb-selected-objects-read.ts";
import type { PcbSelectedObjectsEngine } from "../src/pcb-selected-objects-read.ts";
import { context, exact, fingerprint, fixture, sourceRow, sourceString } from "./pcb-selected-objects-fixture.ts";
import type { Value } from "./pcb-selected-objects-fixture.ts";

const request = { method: PCB_SELECTED_OBJECTS_METHOD, arguments: {} };
const sequence = ["pcb-source", "selected-ids", "pcb-inventory", "selected-ids", "pcb-source", "pcb-source", "selected-ids", "pcb-inventory", "selected-ids", "pcb-source"];
interface Options { failRead?: number; badHash?: number; failContext?: number; failGate?: number; contextDriftAfterRead?: number; gateFailureAfterRead?: number; selectionDrift?: number; sourceDrift?: number; inventoryDrift?: boolean;
  metadataDrift?: boolean; runtimeDrift?: boolean; selected?: string[]; }
function runtime(options: Options = {}): { engine: PcbSelectedObjectsEngine; calls: string[]; events: string[]; counts: { contexts: number; gates: number; statuses: number } } {
  const state = fixture(); const originalFingerprint = fingerprint(); const calls: string[] = [], counts = { contexts: 0, gates: 0, statuses: 0 }, events: string[] = [];
  let selected = options.selected ?? ["text", "component", "line"];
  const observe = (kind: string): Value => {
    calls.push(kind);
    events.push(kind);
    if (calls.length === options.failRead) { throw new Error("fixture read failed"); }
    if (calls.length === options.selectionDrift) { selected = selected.toReversed(); }
    if (calls.length === options.sourceDrift) { sourceRow(state, "text").body["text"] = "changed"; }
    let payload: Value;
    if (kind === "selected-ids") {
      const sample = validatePublicSdkReadPayload({ ok: true, kind: "public-sdk-read", method: PCB_SELECTED_OBJECTS_IDS_METHOD, present: true, value: selected, undefinedPaths: [] },
        { method: PCB_SELECTED_OBJECTS_IDS_METHOD, arguments: {} });
      payload = { ...exact(sample), authority: "public-sdk-observation-not-complete-design-proof" };
      if (options.metadataDrift === true) { payload["liveValidation"] = "fabricated"; const { read_consistency: consistency, authority: _authority, ...wrong } = payload;
        assert.ok(isRecord(consistency)); consistency["snapshotSha256"] = sha256Json(wrong); }
    } else {
      payload = exact(kind === "pcb-source" ? { ok: true, kind, documentType: 3, source: sourceString(state.objects) }
        : { ...state.inventory, ...(options.inventoryDrift === true && calls.length > 5 ? { unexpectedMetadata: "changed" } : {}) });
    }
    if (calls.length === options.badHash) { payload["substitution"] = true; }
    return payload;
  };
  return { calls, counts, events, engine: {
    checkpoint: (): Promise<never> => Promise.reject(new Error("Unexpected inherited-Line checkpoint.")),
    assertBridgeDispatchAllowed: (): Promise<true> => { counts.gates += 1; events.push("gate"); return counts.gates === options.failGate || calls.length === options.gateFailureAfterRead ? Promise.reject(new Error("quarantined")) : Promise.resolve(true); },
    status: (): Promise<{ stableFingerprint: Value }> => { counts.statuses += 1; events.push("status"); return Promise.resolve({ stableFingerprint: options.runtimeDrift === true && counts.statuses > 1 ? { ...originalFingerprint, toolCount: 0 } : structuredClone(originalFingerprint) }); },
    assertContext: (): Promise<typeof context> => { counts.contexts += 1; events.push("context"); return Promise.resolve(counts.contexts === options.failContext || calls.length === options.contextDriftAfterRead ? { ...structuredClone(context), document: { ...context.document, tabId: "other" } } : structuredClone(context)); },
    exactRead: (query): ReturnType<PcbSelectedObjectsEngine["exactRead"]> => {
      assert.ok(isRecord(query)); const kind = query["kind"]; assert.ok(kind === "pcb-source" || kind === "pcb-inventory"); return Promise.resolve(observe(kind));
    },
    publicSdkRead: (query): ReturnType<PcbSelectedObjectsEngine["publicSdkRead"]> => {
      assert.deepEqual(query, { method: PCB_SELECTED_OBJECTS_IDS_METHOD, arguments: {} }); return Promise.resolve(observe("selected-ids"));
    },
  } };
}
void test("selected source coordinator returns complete ordered native DTOs after two independent five-read cycles", async () => {
  const current = runtime(), result = await readPcbSelectedObjects(current.engine, request, context, fingerprint());
  assert.deepEqual(current.calls, sequence);
  assert.equal(result["method"], PCB_SELECTED_OBJECTS_METHOD); assert.equal(result["implementationKind"], "native-task-equivalent");
  assert.equal(result["liveValidation"], "not-yet-validated"); assert.equal(result["encoding"], "unchanged-native-pcb-source-not-sdk-getter-units");
  assert.ok(Array.isArray(result["value"])); assert.deepEqual(result["value"].map((row: unknown) => { assert.ok(isRecord(row)); return row["primitiveId"]; }), ["text", "component", "line"]);
  const { read_consistency: consistency, ...sample } = result; assert.ok(isRecord(consistency)); assert.equal(consistency["snapshotSha256"], sha256Json(sample));
  assert.ok(isRecord(result["proof"])); assert.equal(result["proof"]["profile"], PCB_SELECTED_OBJECTS_PROFILE);
  assert.deepEqual(result["proof"]["selectedPrimitiveIds"], ["text", "component", "line"]);
  assert.deepEqual(current.counts, { contexts: 13, gates: 13, statuses: 2 });
  assert.deepEqual(current.events, ["gate", "status", "context", "gate", "context",
    ...sequence.flatMap((kind) => [kind, "gate", "context"]), "status", "gate", "context"]);
});
void test("a genuinely empty selection returns an empty stable source DTO array", async () => {
  const current = runtime({ selected: [] }); const result = await readPcbSelectedObjects(current.engine, request, context, fingerprint());
  assert.deepEqual(result["value"], []); assert.deepEqual(current.calls, sequence);
});
for (const option of [...Array.from({ length: 10 }, (_, index) => ({ failRead: index + 1 })), ...Array.from({ length: 10 }, (_, index) => ({ badHash: index + 1 })),
  ...Array.from({ length: 13 }, (_, index) => ({ failContext: index + 1 })), ...Array.from({ length: 13 }, (_, index) => ({ failGate: index + 1 })),
  { selectionDrift: 4 }, { selectionDrift: 7 }, { sourceDrift: 5 }, { sourceDrift: 6 }, { inventoryDrift: true }, { metadataDrift: true }, { runtimeDrift: true },
  { selected: ["text", "componentlocal"] }, { selected: ["text", "text"] }]) {
  void test(`selected source coordinator refuses ${JSON.stringify(option)} without writes or retries`, async () => {
    const current = runtime(option); await assert.rejects(readPcbSelectedObjects(current.engine, request, context, fingerprint()));
    assert.ok(current.calls.length <= 10); assert.deepEqual(current.calls, sequence.slice(0, current.calls.length));
  });
}
for (const count of Array.from({ length: 10 }, (_, index) => index + 1)) {
  for (const option of [{ contextDriftAfterRead: count }, { gateFailureAfterRead: count }]) {
    void test(`selected source shared boundary refuses ${JSON.stringify(option)} before any subsequent reader`, async () => {
      const current = runtime(option);
      await assert.rejects(readPcbSelectedObjects(current.engine, request, context, fingerprint()), /context changed|quarantined/u);
      assert.deepEqual(current.calls, sequence.slice(0, count));
      assert.equal(current.counts.statuses, 1);
    });
  }
}
void test("selected source validates scope, selectors and private runtime before any call", async () => {
  for (const document of [{ ...context.document, documentType: 4 }, { ...context.document, parentProjectUuid: "foreign" },
    { ...context.document, parentLibraryUuid: "library" }, { ...context.document, documentUuid: "other" }, { ...context.document, tabId: "other" }]) {
    const current = runtime(); await assert.rejects(readPcbSelectedObjects(current.engine, request, { ...context, document }, fingerprint()));
    assert.equal(current.counts.gates, 0); assert.equal(current.calls.length, 0);
  }
  const current = runtime(); await assert.rejects(readPcbSelectedObjects(current.engine, { ...request, arguments: { code: "anything" } }, context, fingerprint()));
  await assert.rejects(readPcbSelectedObjects(current.engine, request, context, {})); assert.equal(current.counts.gates, 0);
});
void test("selected source registration is discoverable but cannot fall through to the lossy generic mapper", async () => {
  const descriptor = publicSdkReadDescriptors().find((row) => row.path === PCB_SELECTED_OBJECTS_METHOD); assert.ok(descriptor);
  assert.equal(descriptor.implementation.source, "server/src/pcb-selected-objects-read.ts"); assert.deepEqual(descriptor.documentTypes, [3]);
  assert.equal(descriptor.implementation.kind, "native-task-equivalent"); assert.equal(descriptor.parameterSupport, "narrowed");
  assert.deepEqual(validatePublicSdkReadRequest(request, 3), request);
  for (const type of [1, 2, 4, 15]) { assert.throws(() => validatePublicSdkReadRequest(request, type)); }
  assert.throws(() => buildPublicSdkReadCode(request), /specialized reader/u);
  assert.throws(() => validatePublicSdkReadPayload({ ok: true, kind: "public-sdk-read", method: request.method, present: true, value: [], undefinedPaths: [] }, request), /specialized verifier/u);
  let calls = 0;
  const engine = new EasyedaControlEngine({ callTool: (): Promise<unknown> => { calls += 1; return Promise.reject(new Error("Lossy public selected-object method must not dispatch.")); } });
  await assert.rejects(engine.publicSdkRead(request, context), /coordinator/u); assert.equal(calls, 0);
});

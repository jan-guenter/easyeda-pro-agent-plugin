import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { queryPublicSdkReads, validatePublicSdkArguments } from "../src/public-sdk-catalog.ts";
import { PCB_SOURCE_OBJECTS_METHOD, PCB_SOURCE_OBJECTS_PROFILE, PCB_SOURCE_OBJECT_METHOD } from "../src/pcb-source-objects.ts";
import { readPcbSourceObjects } from "../src/pcb-source-objects-read.ts";
import type { PcbSourceObjectsEngine } from "../src/pcb-source-objects-read.ts";
import { context, exact, fingerprint, fixture, sourceRow, sourceString } from "./pcb-selected-objects-fixture.ts";
import type { Value } from "./pcb-selected-objects-fixture.ts";

const request = { method: PCB_SOURCE_OBJECTS_METHOD, arguments: { ids: ["text", "component", "line"] } };
const sequence = ["pcb-source", "pcb-inventory", "pcb-source", "pcb-source", "pcb-inventory", "pcb-source"];
interface Options { failRead?: number; badHash?: number; failContext?: number; failGate?: number; contextDriftAfterRead?: number; gateFailureAfterRead?: number;
  sourceDrift?: number; inventoryDrift?: boolean; runtimeDrift?: boolean; failStatus?: number; }
function runtime(options: Options = {}): { engine: PcbSourceObjectsEngine; calls: string[]; events: string[]; counts: { contexts: number; gates: number; statuses: number } } {
  const calls: string[] = [], events: string[] = [], originalFingerprint = fingerprint(), state = fixture();
  const counts = { contexts: 0, gates: 0, statuses: 0 };
  return { calls, events, counts, engine: {
    checkpoint: (): Promise<never> => Promise.reject(new Error("Unexpected inherited-Line checkpoint.")),
    assertBridgeDispatchAllowed: (): Promise<true> => { counts.gates += 1; events.push("gate");
      return counts.gates === options.failGate || calls.length === options.gateFailureAfterRead ? Promise.reject(new Error("quarantined")) : Promise.resolve(true); },
    status: (): Promise<{ stableFingerprint: Value }> => { counts.statuses += 1; events.push("status");
      if (counts.statuses === options.failStatus) { return Promise.reject(new Error("status failed")); }
      return Promise.resolve({ stableFingerprint: options.runtimeDrift === true && counts.statuses > 1 ? { ...originalFingerprint, toolCount: 0 } : structuredClone(originalFingerprint) }); },
    assertContext: (): Promise<typeof context> => { counts.contexts += 1; events.push("context");
      return Promise.resolve(counts.contexts === options.failContext || calls.length === options.contextDriftAfterRead ? { ...structuredClone(context), document: { ...context.document, tabId: "other" } } : structuredClone(context)); },
    exactRead: (query): ReturnType<PcbSourceObjectsEngine["exactRead"]> => {
      assert.ok(isRecord(query)); const kind = query["kind"]; assert.ok(kind === "pcb-source" || kind === "pcb-inventory");
      calls.push(kind); events.push(kind);
      if (calls.length === options.failRead) { return Promise.reject(new Error("read failed")); }
      if (calls.length === options.sourceDrift) { sourceRow(state, "text").body["text"] = "changed"; }
      const payload = exact(kind === "pcb-source" ? { ok: true, kind, documentType: 3, source: sourceString(state.objects) }
        : { ...state.inventory, ...(options.inventoryDrift === true && calls.length > 3 ? { unexpectedMetadata: "changed" } : {}) });
      if (calls.length === options.badHash) { payload["substitution"] = true; }
      return Promise.resolve(payload);
    },
  } };
}
for (const single of [false, true]) {
  void test(`explicit source coordinator returns exact ${single ? "single DTO" : "ordered DTO array"} without selection calls`, async () => {
    const current = runtime(), input = single ? { method: PCB_SOURCE_OBJECT_METHOD, arguments: { id: "text" } } : request;
    const result = await readPcbSourceObjects(current.engine, input, context, fingerprint());
    assert.deepEqual(current.calls, sequence); assert.deepEqual(current.counts, { contexts: 9, gates: 9, statuses: 2 });
    assert.deepEqual(current.events, ["gate", "status", "context", "gate", "context", ...sequence.flatMap((kind) => [kind, "gate", "context"]), "status", "gate", "context"]);
    assert.equal(result["method"], input.method); assert.equal(result["implementationKind"], "native-task-equivalent");
    assert.equal(result["authority"], "native-explicit-source-objects-not-public-instance-or-persistence-proof");
    assert.equal(result["liveValidation"], "not-yet-validated"); assert.equal(result["encoding"], "unchanged-native-pcb-source-not-sdk-getter-units");
    const rows = single ? [result["value"]] : result["value"]; assert.ok(Array.isArray(rows));
    assert.deepEqual(rows.map((row: unknown) => { assert.ok(isRecord(row)); return row["primitiveId"]; }), single ? ["text"] : request.arguments.ids);
    const { read_consistency: consistency, ...sample } = result; assert.ok(isRecord(consistency)); assert.equal(consistency["snapshotSha256"], sha256Json(sample));
    assert.ok(isRecord(result["proof"])); assert.equal(result["proof"]["profile"], PCB_SOURCE_OBJECTS_PROFILE);
    assert.deepEqual(result["proof"]["requestedPrimitiveIds"], single ? ["text"] : request.arguments.ids);
    assert.equal(Object.hasOwn(result["proof"], "selectedPrimitiveIds"), false);
  });
}
for (const option of [...Array.from({ length: 6 }, (_, index) => ({ failRead: index + 1 })), ...Array.from({ length: 6 }, (_, index) => ({ badHash: index + 1 })),
  ...Array.from({ length: 9 }, (_, index) => ({ failContext: index + 1 })), ...Array.from({ length: 9 }, (_, index) => ({ failGate: index + 1 })),
  { sourceDrift: 3 }, { sourceDrift: 4 }, { inventoryDrift: true }, { runtimeDrift: true }, { failStatus: 1 }, { failStatus: 2 }]) {
  void test(`explicit source coordinator refuses ${JSON.stringify(option)} without writes or retries`, async () => {
    const current = runtime(option); await assert.rejects(readPcbSourceObjects(current.engine, request, context, fingerprint()));
    assert.ok(current.calls.length <= 6); assert.deepEqual(current.calls, sequence.slice(0, current.calls.length));
  });
}
for (const count of Array.from({ length: 6 }, (_, index) => index + 1)) {
  for (const option of [{ contextDriftAfterRead: count }, { gateFailureAfterRead: count }]) {
    void test(`explicit source post-read boundary refuses ${JSON.stringify(option)} before another read`, async () => {
      const current = runtime(option); await assert.rejects(readPcbSourceObjects(current.engine, request, context, fingerprint()), /context changed|quarantined/u);
      assert.deepEqual(current.calls, sequence.slice(0, count)); assert.equal(current.counts.statuses, 1);
    });
  }
}
void test("explicit source validates ownership, arguments and private runtime before any call", async () => {
  for (const document of [{ ...context.document, documentType: 4 }, { ...context.document, parentProjectUuid: "foreign" },
    { ...context.document, parentLibraryUuid: "library" }, { ...context.document, documentUuid: "other" }, { ...context.document, tabId: "other" }]) {
    const current = runtime(); await assert.rejects(readPcbSourceObjects(current.engine, request, { ...context, document }, fingerprint())); assert.equal(current.counts.gates, 0);
  }
  const current = runtime(); await assert.rejects(readPcbSourceObjects(current.engine, { ...request, arguments: { ids: [] } }, context, fingerprint()));
  await assert.rejects(readPcbSourceObjects(current.engine, request, context, {})); assert.equal(current.counts.gates, 0);
});
void test("explicit source never returns partial, undefined or unsupported results", async () => {
  for (const input of [{ method: PCB_SOURCE_OBJECT_METHOD, arguments: { id: "missing" } },
    { method: PCB_SOURCE_OBJECTS_METHOD, arguments: { ids: ["text", "missing"] } }, { method: PCB_SOURCE_OBJECTS_METHOD, arguments: { ids: ["text", "componentlocal"] } }]) {
    const current = runtime(); await assert.rejects(readPcbSourceObjects(current.engine, input, context, fingerprint()));
    assert.deepEqual(current.calls, sequence.slice(0, 3));
  }
});
for (const method of [PCB_SOURCE_OBJECT_METHOD, PCB_SOURCE_OBJECTS_METHOD]) {
  void test(`explicit source route ${method} cannot fall through to the empty public wrapper`, async () => {
    const input = { method, arguments: method === PCB_SOURCE_OBJECT_METHOD ? { id: "text" } : { ids: ["text"] } };
    const descriptor = publicSdkReadDescriptors().find((row) => row.path === method); assert.ok(descriptor);
    assert.equal(descriptor.implementation.source, "server/src/pcb-source-objects-read.ts"); assert.deepEqual(descriptor.documentTypes, [3]);
    assert.equal(descriptor.implementation.kind, "native-task-equivalent"); assert.equal(descriptor.parameterSupport, "narrowed");
    assert.equal(descriptor.result.optional, false); assert.equal(descriptor.result.kind, method === PCB_SOURCE_OBJECT_METHOD ? "record" : "records");
    assert.deepEqual(validatePublicSdkReadRequest(input, 3), input);
    assert.equal(queryPublicSdkReads({ method })["authority"], "native-explicit-source-objects-not-public-instance-or-persistence-proof");
    assert.equal(validatePublicSdkArguments({ request: input })["executionAuthorized"], false);
    for (const type of [1, 2, 4, 15]) { assert.throws(() => validatePublicSdkReadRequest(input, type)); }
    assert.throws(() => buildPublicSdkReadCode(input), /specialized reader/u);
    assert.throws(() => validatePublicSdkReadPayload({ ok: true, kind: "public-sdk-read", method, present: true, value: [], undefinedPaths: [] }, input), /specialized verifier/u);
    let calls = 0;
    const engine = new EasyedaControlEngine({ callTool: (): Promise<unknown> => { calls += 1; return Promise.reject(new Error("Public stub must not dispatch.")); } });
    await assert.rejects(engine.publicSdkRead(input, context), /coordinator/u); assert.equal(calls, 0);
  });
}

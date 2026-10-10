import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { buildDesignNativeAdapter, buildReviewedNativeSourceMerge } from "../src/design-native-adapter.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";

const BASE = {
  schema: "easyeda-pro-control.document-source.v1" as const,
  document: { docType: "PCB", uuid: "fixture", editVersion: "3.2.149.88089769" },
  objects: [
    { id: "future", type: "OPAQUE", body: { value: ["preserve", { exact: 1 }] } },
    { id: "region", type: "REGION", body: { layerId: 12, width: 0, path: [["R", 0, 0, 40, 50, 0, 0]], prohibitType: ["COMPONENT"], regionType: "PROHIBIT", locked: false, zIndex: -1 } },
  ],
};
const BEFORE: NativeSourceSnapshot = { ...BASE, sha256: sha256Json(BASE) };
const OPERATION = { id: "restriction", action: "pcb.region.modify", target: { primitiveId: "region" }, patch: { ruleType: [2, 5, 7] } };

function source(snapshot: NativeSourceSnapshot): string {
  return `${JSON.stringify({ type: "DOCHEAD" })}||${JSON.stringify({ ...snapshot.document, client: "1234567890abcdef", updateTime: 123, version: "123" })}|\n${
    snapshot.objects.map((object, index) => `${JSON.stringify({ type: object.type, id: object.id, ticket: index + 1 })}||${JSON.stringify(object.body)}|\n`).join("")}`;
}

async function execute(code: string, text: string, tabId = "fixture-tab"): Promise<{ calls: string[]; result: unknown }> {
  const calls: string[] = [];
  const result: unknown = runInNewContext(`(async () => {
    const EXPECTED_DOCUMENT_UUID='fixture', EXPECTED_TAB_ID='fixture-tab', EXPECTED_DOCUMENT_TYPE=3;
    ${code}
  })()`, { eda: {
    dmt_SelectControl: { getCurrentDocumentInfo: () => Promise.resolve({ uuid: "fixture", documentType: 3, tabId }) },
    sys_FileManager: { getDocumentSource: () => Promise.resolve(text), setDocumentSource: (next: string) => { calls.push(next); return Promise.resolve(true); } },
  } });
  try {return { calls, result: await result };}
  catch (error) {assert.equal(calls.length, 0, "A failed precondition must never reach the native setter."); throw error;}
}

void test("source repair derives only typed fields and invokes one native history setter with intact opaque rows", async () => {
  const adapter = buildDesignNativeAdapter(OPERATION, BEFORE);
  assert.ok(adapter);
  const result = await execute(adapter.code, source(BEFORE));
  assert.equal(result.result, true);
  assert.equal(result.calls.length, 1);
  const saved = result.calls[0];
  assert.ok(saved !== undefined && saved.length > 0);
  assert.equal(parseDocumentSource(saved).sha256, adapter.expected.sha256);
  assert.equal(saved.split("|\n")[1], source(BEFORE).split("|\n")[1]);
  assert.deepEqual(adapter.expected.objects[1]?.body["prohibitType"], ["TRACK", "COMPONENT", "COPPER"]);
});

void test("source baseline/context drift and native-unrepresentable fields stop before dispatch", async () => {
  const adapter = buildDesignNativeAdapter(OPERATION, BEFORE);
  assert.ok(adapter);
  await assert.rejects(execute(adapter.code, source(BEFORE).replace('"exact":1', '"exact":2')), /baseline drift/u);
  await assert.rejects(execute(adapter.code, source(BEFORE), "other-tab"), /context changed/u);
  assert.throws(() => buildDesignNativeAdapter({ ...OPERATION, patch: { ruleType: [3] } }, BEFORE), /NO_VIAS/u);
  assert.throws(() => buildDesignNativeAdapter({ id: "bad-mode", action: "pcb.fill.create", properties: { layer: 1, complexPolygon: ["R", 0, 0, 10, 10, 0, 0], net: "", fillMode: 1, lineWidth: 0, primitiveLock: false } }, BEFORE), /grid POUR/u);
  assert.throws(() => buildDesignNativeAdapter({ ...OPERATION, source: "caller source" }, BEFORE));
});

void test("footprint source merge selects one exact native frame and never uses the public dialog setter", async () => {
  const reference = buildDesignNativeAdapter(OPERATION, BEFORE);
  assert.ok(reference);
  const adapter = buildReviewedNativeSourceMerge(BEFORE, reference.expected, undefined, 4);
  const executeFootprint = async (options: { duplicate?: boolean; wrongTab?: boolean; drift?: boolean; acknowledgment?: boolean | null; reject?: boolean; ignoreWrite?: boolean } = {}): Promise<number> => {
    let writes = 0;
    let currentSource = options.drift === true ? source(BEFORE).replace('"exact":1', '"exact":2') : source(BEFORE);
    const bus = { messageBus: { rpcCall: (method: string, value: unknown): Promise<unknown> => {
      if (method === "getTabIdAndDocType") { return Promise.resolve({ message: { tabId: options.wrongTab === true ? "other" : "fixture-tab", docType: 4 } }); }
      if (method === "FileSource") { return Promise.resolve({ message: currentSource }); }
      assert.equal(method, "pcb/decode");
      writes += 1;
      assert.equal(parseDocumentSource(String(value)).sha256, reference.expected.sha256);
      if (options.reject === true) { return Promise.reject(new Error("private native detail")); }
      if (options.ignoreWrite !== true) { currentSource = String(value); }
      return Promise.resolve({ message: options.acknowledgment === undefined ? true : options.acknowledgment });
    } } };
    const top = { MSG_BUS_PCB: bus, frames: options.duplicate === true ? [{ MSG_BUS_PCB: { ...bus }, frames: [] }] : [] };
    const result: unknown = runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='fixture',EXPECTED_TAB_ID='fixture-tab',EXPECTED_DOCUMENT_TYPE=4;${adapter.code}})()`, {
      window: { top }, eda: {
        sys_FileManager: { getDocumentSource: (): never => assert.fail("Use exact frame source"), setDocumentSource: (): never => assert.fail("Do not close unrelated file dialog") },
        dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: "fixture", tabId: "fixture-tab", documentType: 4 }) },
      },
    });
    try { const returned = await result; assert.deepEqual(structuredClone(returned), { nativeSourceMerge: { profile: "footprint-exact-frame.v1", acknowledgment: options.acknowledgment ?? true, liveSourceVerified: true }, value: true }); } catch (error) {
      assert.equal(writes, options.acknowledgment === null || options.ignoreWrite === true || options.reject === true ? 1 : 0, "Never retry or write through a failed guard");
      throw error;
    }
    return writes;
  };
  assert.equal(await executeFootprint(), 1);
  await assert.rejects(executeFootprint({ duplicate: true }), /Native source merge refused: footprint:frame/u);
  await assert.rejects(executeFootprint({ wrongTab: true }), /Native source merge refused: footprint:frame/u);
  await assert.rejects(executeFootprint({ drift: true }), /Native source merge refused: footprint:baseline/u);
  assert.equal(await executeFootprint({ acknowledgment: false }), 1);
  await assert.rejects(executeFootprint({ acknowledgment: false, ignoreWrite: true }), /Native source merge refused: footprint:readback/u);
  await assert.rejects(executeFootprint({ acknowledgment: null }), /Native source merge refused: footprint:acknowledgment/u);
  await assert.rejects(executeFootprint({ reject: true }), /Native source merge refused: footprint:dispatch/u);
});

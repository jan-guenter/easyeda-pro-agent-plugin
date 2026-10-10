import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { DESIGN_COPPER_ADAPTER_PROFILE, buildDesignCopperAdapter, buildDesignCopperClearAdapter, expectedCopperClearSource, expectedCopperRebuildSource } from "../src/design-copper-adapter.ts";
import { buildDesignOperationCallExpression, compileDesignOperation } from "../src/design-operations.ts";
import { assertDesignSourceProfileSupported, buildExpectedDesignSource, buildInverseDesignOperation, verifyDesignSourceEffect } from "../src/design-source-proof.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";

const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "PCB", uuid: "fixture", editVersion: "3.2.149.88089769" }, objects: [{ id: "pour", type: "POUR", body: { netName: "GND", layerId: 1, name: "ground", order: 0, locked: true } }] };
const before: NativeSourceSnapshot = { ...base, sha256: sha256Json(base) };
const operation = { id: "copper", action: "pcb.pour.rebuild", target: { primitiveId: "pour" } };
const native = [{ globalIndex: "fill-one", pourPrimitiveId: "pour", net: "GND", layerId: 1, style: "45grid", gridLineWidth: 0.8, copperPath: [[0, 0, "L", 10, 10]] }];
const derivedResult = { profile: DESIGN_COPPER_ADAPTER_PROFILE, targetId: "pour", coppers: [{ id: "fill-one", parentId: "pour", net: "GND", layerId: 1, strokeWidth: 0.8, fill: false, path: [[0, 0, "L", 10, 10]] }] };

void test("copper rebuild binds exact native worker output and preserves all base net/shape/rule records", () => {
  assertDesignSourceProfileSupported(operation, before);
  const after = expectedCopperRebuildSource(operation, before, { derivedResult });
  const delta = verifyDesignSourceEffect(compileDesignOperation(operation), before, after, { derivedResult });
  assert.equal(delta.added[0]?.id, '["POURED","pour"]');
  assert.equal(buildInverseDesignOperation(operation, before), undefined);
  assert.match(buildDesignOperationCallExpression(operation), /\.get\("pour"\)\)\.rebuildCopperRegion\(\)/u);
  assert.throws(() => expectedCopperRebuildSource(operation, before, { derivedResult: { ...derivedResult, coppers: derivedResult.coppers.map((entry) => ({ ...entry, net: "OTHER" })) } }), /connected net/u);
  const changed = { ...base, objects: base.objects.map((entry) => ({ ...entry, body: { ...entry.body, netName: "OTHER" } })) };
  const wrong = { ...changed, sha256: sha256Json(changed) };
  assert.throws(() => verifyDesignSourceEffect(compileDesignOperation(operation), before, wrong, { derivedResult }), /unrelated/u);
});

void test("fixed native RPC is awaited and grid45 remains grid; changed baseline never dispatches", async () => {
  const adapter = buildDesignCopperAdapter(operation, before);
  let calls = 0;
  const source = `{"type":"DOCHEAD"}||${JSON.stringify(before.document)}|\n${before.objects.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
  const execute = async (text: string): Promise<unknown> => {
    const result: unknown = runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='fixture',EXPECTED_TAB_ID='tab',EXPECTED_DOCUMENT_TYPE=3;${adapter.code}})()`, {
      eda: { dmt_SelectControl: { getCurrentDocumentInfo: () => Promise.resolve({ uuid: "fixture", tabId: "tab", documentType: 3 }) }, sys_FileManager: { getDocumentSource: () => Promise.resolve(text) } },
      window: { top: { _MSG_BUS2_EXTAPI_: { rpcCall: (method: string, args: unknown) => { calls += 1; assert.equal(method, "extensionApi.PCB_PrimitivePour.rebuildCopperRegion"); assert.equal(JSON.stringify(args), '{"ids":["pour"],"isLast":false}'); return Promise.resolve(native); } } } },
    });
    return await result;
  };
  assert.equal(JSON.stringify(await execute(source)), JSON.stringify(derivedResult));
  assert.equal(calls, 1);
  await assert.rejects(execute(source.replace('"GND"', '"OTHER"')), /baseline drift/u);
  assert.equal(calls, 1);
});

void test("solid and grid pour creation have deterministic native styles and reversible style edits", () => {
  const emptyBase = { ...base, objects: [] };
  const empty = { ...emptyBase, sha256: sha256Json(emptyBase) };
  const properties = { net: "GND", layer: 1, complexPolygon: ["R", 0, 0, 500, 500, 0, 0], pourFillMethod: "solid", preserveSilos: false, pourName: "ground", pourPriority: 0, lineWidth: 0, primitiveLock: false };
  const create = { id: "new-pour", action: "pcb.pour.create", properties };
  const created = buildExpectedDesignSource(create, empty, { createdId: "a".repeat(16) });
  assert.deepEqual(created.objects[0]?.body["pourType"], { pourType: "SOLID", fineness: 0 });
  const modify = { id: "grid", action: "pcb.pour.modify", target: { primitiveId: "a".repeat(16) }, patch: { pourFillMethod: "45grid", gridLineWidth: 8, gridSpacing: 20 } };
  const modified = buildExpectedDesignSource(modify, created);
  assert.deepEqual(modified.objects[0]?.body["pourType"], { pourType: "GRID_LINE", angle: 45, strokeWidth: 8, strokeSpacing: 20 });
  const inverse = buildInverseDesignOperation(modify, created);
  assert.ok(inverse);
  verifyDesignSourceEffect(compileDesignOperation(inverse), modified, created);
  assert.throws(() => buildExpectedDesignSource({ ...create, properties: { ...properties, pourFillMethod: "90grid" } }, empty, { createdId: "b".repeat(16) }), /grid/u);
});

void test("clear-derived deletes exactly the selected parent geometry and rejects automatic repour", async () => {
  const poured = expectedCopperRebuildSource(operation, before, { derivedResult });
  const clear = { id: "clear", action: "pcb.pour.clear-derived", target: { primitiveId: "pour" } };
  assertDesignSourceProfileSupported(clear, poured);
  assert.deepEqual(expectedCopperClearSource(clear, poured), before);
  assert.equal(verifyDesignSourceEffect(compileDesignOperation(clear), poured, before).removed.length, 1);
  assert.equal(buildInverseDesignOperation(clear, poured), undefined);
  assert.throws(() =>{  assertDesignSourceProfileSupported(clear, before); }, /nonempty/u);
  assert.throws(() => verifyDesignSourceEffect(compileDesignOperation(clear), poured, poured), /beyond/u);
  assert.equal(buildDesignOperationCallExpression(clear), 'eda.pcb_PrimitivePoured.delete("pour")');
  const adapter = buildDesignCopperClearAdapter(clear, poured);
  let calls = 0;
  const source = `{"type":"DOCHEAD"}||${JSON.stringify(poured.document)}|\n${poured.objects.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
  const execute = async (text: string): Promise<unknown> => {
    const result: unknown = runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='fixture',EXPECTED_TAB_ID='tab',EXPECTED_DOCUMENT_TYPE=3;${adapter.code}})()`, {
      eda: { dmt_SelectControl: { getCurrentDocumentInfo: () => Promise.resolve({ uuid: "fixture", tabId: "tab", documentType: 3 }) }, sys_FileManager: { getDocumentSource: () => Promise.resolve(text) }, pcb_PrimitivePoured: { delete: (id: string) => { calls += 1; assert.equal(id, "pour"); return Promise.resolve(true); } } },
    });
    return await result;
  };
  assert.equal(await execute(source), true);
  await assert.rejects(execute(source.replace('"GND"', '"OTHER"')), /baseline drift/u);
  assert.equal(calls, 1);
});

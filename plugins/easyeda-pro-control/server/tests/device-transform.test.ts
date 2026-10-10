import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { buildDeviceTransformExpression, deviceTransformInheritedInstances, inverseDeviceTransformOperation, prepareDeviceTransform, verifyDeviceTransformEffect } from "../src/device-transform.ts";
import { sha256Json } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { compileLibraryOperation, libraryOperationSchema } from "../src/library-operations.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";

function document(uuid: string, docType: string, bodies: { id: string; type: string; body: Record<string, unknown> }[]): NativeDocumentSnapshot {
  const records = bodies.map((entry, index) => ({ ...entry, ticket: index + 1, client: null }));
  const value = { uuid, docType, metadata: { uuid, docType, editVersion: "3.2.149.88089769", client: "a".repeat(16), updateTime: 1, version: "1" }, records };
  return { ...value, semanticSha256: sha256Json(value) };
}
const deviceMeta = { title: "Part", source: "source", tags: ["Tag"], images: ["image"], attributes: { Symbol: "symbol", Footprint: "footprint", "3D Model": `${"1".repeat(32)}|${"2".repeat(32)}`, "3D Model Title": "Model", "3D Model Transform": "31.8897,63.7794,0,90,0,0,0,0,0", Count: 0, Enabled: false } };
const page = document("page", "SCH_PAGE", [
  { id: "component", type: "COMPONENT", body: { x: 10, y: 20, attrs: {} } },
  { id: "device-ref", type: "ATTR", body: { parentId: "component", key: "Device", value: "device" } },
  { id: "inherited-transform", type: "ATTR", body: { parentId: "component", key: "3D Model Transform", value: null } },
]);
const pcb = document("pcb", "PCB", [
  { id: "placed", type: "COMPONENT", body: { x: 100, y: 200, locked: false, attrs: { Device: "device" } } },
  { id: "own-transform", type: "COMPONENT", body: { x: 300, y: 400, locked: true, attrs: { Device: "device", "3D Model Transform": "0,0,0,0,0,0,0,0,0" } } },
  { id: "pad", type: "PAD", body: { parentId: "placed", number: "1", net: "GND" } },
]);
const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: "b".repeat(64), documents: [document("device", "DEVICE", [{ id: "META", type: "META", body: deviceMeta }]), page, pcb] };
const operation = { id: "transform", action: "library.device.model-transform", libraryUuid: "project", target: { uuid: "device" }, transform: { format: "legacy", dimensionsMil: { x: 31.8897, y: 63.7794, z: 0 }, rotationDegrees: { x: 0, y: 0, z: 90 }, offsetMil: { x: 0, y: 0, z: 10 } }, inheritedInstances: [{ documentUuid: "page", documentType: "SCH_PAGE", componentUuid: "component" }, { documentUuid: "pcb", documentType: "PCB", componentUuid: "placed" }] };

void test("inactive instances need no transform authority but remain immutable in the full project proof", () => {
  const before = { ...history, documents: history.documents.map((entry) => entry.uuid === "page" ? { ...entry,
    records: [...entry.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 100, client: null, body: { isDelete: true } }] } : entry) };
  const scoped = { ...operation, inheritedInstances: operation.inheritedInstances.filter((entry) => entry.documentUuid !== "page") };
  const plan = prepareDeviceTransform(scoped, before);
  assert.equal(deviceTransformInheritedInstances(before, "device").length, 1);
  const after = structuredClone(before), target = after.documents[0]; assert.ok(target?.records[0]);
  target.records[0].body["attributes"] = plan.afterMeta["attributes"];
  verifyDeviceTransformEffect(plan, before, after);
  const collateral = after.documents[1]?.records[0]; assert.ok(collateral); collateral.body["x"] = 999;
  assert.throws(() => verifyDeviceTransformEffect(plan, before, after), /unrelated/u);
  const inactiveDevice = { ...history, documents: history.documents.map((entry) => entry.uuid === "device" ? { ...entry,
    records: [...entry.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 100, client: null, body: { isDelete: true } }] } : entry) };
  assert.throws(() => prepareDeviceTransform(operation, inactiveDevice), /unavailable/u);
});

void test("device transform preserves binding and every placed record with exact acknowledged inheritance", () => {
  assert.equal(libraryExecutionKind(operation), "project-device-transform");
  assert.equal(compileLibraryOperation(operation).call.method, "/PrjDB/device/updateData");
  assert.doesNotThrow(() => z.toJSONSchema(libraryOperationSchema));
  assert.throws(() => buildLibraryExecutionExpression(operation), /checkpoint-bound/u);
  const plan = prepareDeviceTransform(operation, history);
  assert.equal(deviceTransformInheritedInstances(history, "device").length, 2);
  const after = structuredClone(history);
  const selected = after.documents[0];
  assert.ok(selected?.records[0]);
  selected.records[0].body["attributes"] = structuredClone(plan.afterMeta["attributes"]);
  selected.metadata["updateTime"] = 2; selected.metadata["version"] = "2";
  const proof = verifyDeviceTransformEffect(plan, history, after);
  assert.equal(proof["saved"], true);
  assert.equal(proof["storedInstanceRecordsChanged"], false);
  const inverse = inverseDeviceTransformOperation(plan);
  assert.ok(inverse);
  assert.deepEqual(prepareDeviceTransform(inverse, after).afterMeta, deviceMeta);
  assert.throws(() => prepareDeviceTransform({ ...operation, inheritedInstances: [] }, history), /authority/u);
  assert.throws(() => prepareDeviceTransform({ ...operation, inheritedInstances: [...operation.inheritedInstances, operation.inheritedInstances[0]] }, history), /authority/u);
  const changed = structuredClone(history);
  const component = changed.documents[2]?.records[0];
  assert.ok(component); component.body["locked"] = true;
  assert.throws(() => prepareDeviceTransform(operation, changed), /locked/u);
  const pad = after.documents[2]?.records[2];
  assert.ok(pad); pad.body["net"] = "OTHER";
  assert.throws(() => verifyDeviceTransformEffect(plan, history, after), /unrelated/u);
});

void test("device transform native program writes one META attribute once and refuses stale metadata", async () => {
  const plan = prepareDeviceTransform(operation, history);
  const raw = { uuid: "device", project_uuid: "project", owner: { uuid: "owner" }, display_title: "Part", attributes: deviceMeta.attributes, images: deviceMeta.images, source: "source", custom_tags: '["Tag"]' };
  let writes = 0;
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall(topic: string, args: unknown[]): Promise<unknown> {
    if (topic === "/PrjDB/device/getData") { return Promise.resolve({ message: raw }); }
    assert.equal(topic, "/PrjDB/device/updateData"); writes += 1;
    assert.equal(JSON.stringify(args), JSON.stringify([{ uuid: "device", attributes: plan.afterMeta["attributes"] }, "project"]));
    return Promise.resolve({ message: { ...raw, attributes: plan.afterMeta["attributes"] } });
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) } };
  const execute = async (): Promise<unknown> => await runInNewContext(buildDeviceTransformExpression(plan), { eda, top: { gVars: host }, TextEncoder });
  assert.deepEqual(decodeExactReadEnvelope(await execute()), { kind: "project-device-transform", targetId: "device", createdId: null });
  assert.equal(writes, 1);
  raw.images = ["changed"];
  await assert.rejects(execute(), /METADATA_DRIFT/u);
  assert.equal(writes, 1);
  const tampered = structuredClone(plan); tampered.afterMeta["images"] = [];
  assert.throws(() => buildDeviceTransformExpression(tampered), /single-value/u);
});

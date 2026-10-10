import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildDeviceAssociationExpression, prepareDeviceAssociation, verifyDeviceAssociationEffect } from "../src/device-association.ts";
import { isRecord, sha256Json } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind, validateLibraryMetadata } from "../src/library-runtime.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";

function document(uuid: string, docType: string, body: Record<string, unknown>): NativeDocumentSnapshot {
  const records = [{ id: "META", type: "META", ticket: 1, client: null, body }];
  const value = { uuid, docType, metadata: { uuid, docType, editVersion: "3.2.149.88089769", client: "a".repeat(16), updateTime: 1, version: "1" }, records };
  return { ...value, semanticSha256: sha256Json(value) };
}
const deviceMeta = { title: "Part", source: "original", tags: ["Tag"], images: ["image"], attributes: { Symbol: "symbol", Footprint: "old-footprint", "3D Model": "existing-model|collection", Count: 0, Enabled: false } };
const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: "b".repeat(64), documents: [document("device", "DEVICE", deviceMeta), document("symbol", "SYMBOL", { title: "Symbol" }), document("new-footprint", "FOOTPRINT", { title: "New" })] };
const operation = { id: "associate", action: "library.device.modify", libraryUuid: "project", target: { uuid: "device" }, patch: { association: { footprint: { libraryUuid: "project", uuid: "new-footprint" } } } };

void test("association rejects inactive target or binding but ignores inactive page inheritance without erasing history", () => {
  for (const id of ["device", "new-footprint"]) {
    const inactive = { ...history, documents: history.documents.map((entry) => entry.uuid === id ? { ...entry,
      records: [...entry.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 100, client: null, body: { isDelete: true } }] } : entry) };
    assert.throws(() => prepareDeviceAssociation(operation, inactive), /unavailable|absent/u);
  }
  const page = { ...document("deleted-page", "SCH_PAGE", {}), records: [{ id: "device", type: "ATTR", ticket: 2, client: null, body: { parentId: "component", key: "Device", value: "device" } },
    { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 100, client: null, body: { isDelete: true } }] };
  assert.doesNotThrow(() => prepareDeviceAssociation(operation, { ...history, documents: [...history.documents, page] }));
});

void test("project device association updates only the requested binding through one guarded native API", async () => {
  const plan = prepareDeviceAssociation(operation, history);
  const calls: string[] = [];
  const raw = { uuid: "device", project_uuid: "project", owner: { uuid: "owner" }, display_title: "Part", attributes: deviceMeta.attributes, images: deviceMeta.images, source: "original", custom_tags: '["Tag"]' };
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall(topic: string, args: unknown[]): Promise<unknown> {
    calls.push(topic);
    if (topic === "/PrjDB/footprint/getData") { return Promise.resolve({ message: { uuid: "new-footprint", project_uuid: "project", owner: { uuid: "owner" }, display_title: "New" } }); }
    if (topic.endsWith("getData")) { return Promise.resolve({ message: raw }); }
    assert.equal(topic, "/PrjDB/device/updateData");
    assert.equal(JSON.stringify(args), JSON.stringify([{ uuid: "device", attributes: { ...deviceMeta.attributes, Footprint: "new-footprint" } }, "project"]));
    return Promise.resolve({ message: { ...raw, attributes: plan.afterMeta["attributes"] } });
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) }, lib_Footprint: { get: (): Promise<unknown> => Promise.resolve({ uuid: "new-footprint", libraryUuid: "owner", name: "New" }) } };
  const execute = async (): Promise<unknown> => await runInNewContext(buildDeviceAssociationExpression(plan), { eda, top: { gVars: host }, TextEncoder });
  assert.deepEqual(decodeExactReadEnvelope(await execute()), { kind: "project-device-association", targetId: "device", createdId: null });
  assert.deepEqual(calls, ["/PrjDB/footprint/getData", "/PrjDB/device/getData", "/PrjDB/device/updateData"]);
  raw.images = ["changed"];
  await assert.rejects(execute(), /METADATA_DRIFT/u);
  assert.equal(calls.filter((entry) => entry.endsWith("updateData")).length, 1);
});

void test("association proof preserves all project records and refuses external asset lookup or hidden metadata loss", () => {
  assert.equal(libraryExecutionKind(operation), "project-device-association");
  assert.throws(() => buildLibraryExecutionExpression(operation), /checkpoint-bound/u);
  const plan = prepareDeviceAssociation(operation, history);
  const changed = structuredClone(history);
  const device = changed.documents.find((entry) => entry.uuid === "device");
  const meta = device?.records[0];
  assert.ok(device && meta);
  meta.body["attributes"] = plan.afterMeta["attributes"];
  device.metadata["updateTime"] = 2; device.metadata["version"] = "2";
  assert.equal(verifyDeviceAssociationEffect(plan, history, changed)["saved"], true);
  meta.body["images"] = [];
  assert.throws(() => verifyDeviceAssociationEffect(plan, history, changed), /unrelated/u);
  assert.throws(() => prepareDeviceAssociation({ ...operation, patch: { association: { symbol: { uuid: "symbol", libraryUuid: "external" } } } }, history), /off-project/u);
  const cleared = prepareDeviceAssociation({ ...operation, patch: { association: { model3D: null } } }, history);
  const clearedAttributes = cleared.afterMeta["attributes"];
  assert.ok(isRecord(clearedAttributes));
  assert.equal(clearedAttributes["3D Model"], "");
  assert.throws(() => prepareDeviceAssociation({ ...operation, patch: { association: { model3D: { uuid: "model", libraryUuid: "project" } } } }, history), /32-hex/u);
  const get = libraryOperationSchema.parse({ id: "get", action: "library.device.get", libraryUuid: "project", target: { uuid: "device" } });
  assert.equal(validateLibraryMetadata({ uuid: "device", libraryUuid: "owner", libraryType: "3", name: "Part" }, get)["libraryType"], "3");
  assert.throws(() => validateLibraryMetadata({ uuid: "device", libraryUuid: "owner", libraryType: "1", name: "Part" }, get), /family/u);
});

void test("device association refuses an implicit placed-instance change and preserves explicit overrides", () => {
  const page = document("page", "SCH_PAGE", { title: "Page" });
  const reference = { id: "device-attr", type: "ATTR", ticket: 2, client: null, body: { parentId: "component", key: "Device", value: "device" } };
  const withInstance = { ...history, documents: [...history.documents, { ...page, records: [reference] }] };
  assert.throws(() => prepareDeviceAssociation(operation, withInstance), /inherits/u);
  const explicit = { id: "footprint-attr", type: "ATTR", ticket: 3, client: null, body: { parentId: "component", key: "Footprint", value: "old-footprint" } };
  assert.equal(prepareDeviceAssociation(operation, { ...withInstance, documents: [...history.documents, { ...page, records: [reference, explicit] }] }).deviceUuid, "device");
});

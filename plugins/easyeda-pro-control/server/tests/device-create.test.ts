import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord, sha256Json } from "../src/core.ts";
import { buildDeviceCreateExpression, prepareDeviceCreate, verifyDeviceCreateEffect } from "../src/device-create.ts";
import { buildDeviceAssociationExpression, prepareDeviceAssociation } from "../src/device-association.ts";
import { deviceRequestedModel, validateDeviceModelMetadata } from "../src/device-model.ts";
import { libraryExecutionKind, validateLibraryMetadata } from "../src/library-runtime.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";

function document(uuid: string, docType: string, body: Record<string, unknown>): NativeDocumentSnapshot {
  const value = { uuid, docType, metadata: { uuid, docType, editVersion: "3.2.149.88089769", client: "a".repeat(16), updateTime: 1, version: "1" }, records: [{ id: "META", type: "META", ticket: 1, client: null, body }] };
  return { ...value, semanticSha256: sha256Json(value) };
}
const before: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: "b".repeat(64), documents: [document("symbol", "SYMBOL", { title: "Symbol" }), document("footprint", "FOOTPRINT", { title: "Footprint" })] };
const operation = { id: "create", action: "library.device.create", libraryUuid: "project", name: "Disposable Device", association: { symbol: { uuid: "symbol", libraryUuid: "project" }, footprint: { uuid: "footprint", libraryUuid: "project" } }, property: { addIntoBom: false, otherProperty: { Count: 0, Enabled: false } } };
const createdId = "d".repeat(16);
const modelIdentity = { uuid: "e".repeat(32), libraryUuid: "f".repeat(32) };
const model = { ...modelIdentity, libraryType: "5", name: "Existing Model" };

void test("device creation never binds inactive symbol/footprint records and retains deleted-name history", () => {
  for (const id of ["symbol", "footprint"]) {
    const inactive = { ...before, documents: before.documents.map((entry) => entry.uuid === id ? { ...entry,
      records: [...entry.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 100, client: null, body: { isDelete: true } }] } : entry) };
    assert.throws(() => prepareDeviceCreate(operation, inactive), /binding is absent/u);
  }
  const original = document("deleted", "DEVICE", { title: operation.name });
  const deleted = { ...original, records: [...original.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 100, client: null, body: { isDelete: true } }] };
  assert.doesNotThrow(() => prepareDeviceCreate(operation, { ...before, documents: [...before.documents, deleted] }));
});

void test("device create binds existing assets once and proves one exact durable addition", async () => {
  assert.equal(libraryExecutionKind(operation), "project-device-create");
  const plan = prepareDeviceCreate(operation, before);
  const attributes = plan.expectedMeta["attributes"];
  assert.ok(isRecord(attributes));
  assert.equal(attributes["Count"], 0); assert.equal(attributes["Enabled"], false); assert.equal(attributes["Add into BOM"], "no");
  const calls: string[] = [];
  let duplicate = false;
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall(topic: string, args: unknown[]): Promise<unknown> {
    calls.push(topic);
    if (topic === "/PrjDB/symbol/getData" || topic === "/PrjDB/footprint/getData") {
      const family = topic === "/PrjDB/symbol/getData" ? "symbol" : "footprint";
      return Promise.resolve({ message: { uuid: family, project_uuid: "project", owner: { uuid: "owner" }, display_title: family === "symbol" ? "Symbol" : "Footprint" } });
    }
    if (topic.endsWith("getDataByTitle")) { return Promise.resolve({ message: duplicate ? [{}] : [] }); }
    assert.equal(topic, "/PrjDB/device/createData");
    const request = args[0]; assert.ok(isRecord(request)); assert.deepEqual(Object.keys(request), ["device"]);
    return Promise.resolve({ message: { success: true, result: { device: { uuid: createdId, project_uuid: "project", owner: { uuid: "owner" }, attributes, display_title: operation.name } } } });
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) }, lib_Symbol: { get: (): Promise<unknown> => Promise.resolve({ uuid: "symbol", libraryUuid: "owner", name: "Symbol" }) }, lib_Footprint: { get: (): Promise<unknown> => Promise.resolve({ uuid: "footprint", libraryUuid: "owner", name: "Footprint" }) } };
  const execute = async (): Promise<unknown> => await runInNewContext(buildDeviceCreateExpression(plan), { eda, top: { gVars: host }, TextEncoder });
  assert.deepEqual(decodeExactReadEnvelope(await execute()), { kind: "project-device-create", createdId });
  duplicate = true;
  await assert.rejects(execute(), /NAME_EXISTS/u);
  assert.equal(calls.filter((entry) => entry.endsWith("createData")).length, 1);
  const after = { ...before, documents: [...before.documents, document(createdId, "DEVICE", plan.expectedMeta)] };
  assert.equal(verifyDeviceCreateEffect(plan, before, after, createdId)["saved"], true);
  const drift = structuredClone(after); const unrelated = drift.documents[0]; assert.ok(unrelated); unrelated.metadata["updateTime"] = 2;
  assert.throws(() => verifyDeviceCreateEffect(plan, before, drift, createdId), /unrelated/u);
  assert.throws(() => prepareDeviceCreate(operation, after), /already exists/u);
  assert.throws(() => prepareDeviceCreate({ ...operation, property: { otherProperty: { Symbol: "other" } } }, before), /reserved/u);
});

void test("external model assignment requires exact metadata and refuses drift before device mutation", async () => {
  const device = document("device", "DEVICE", { title: "Part", source: "", images: ["retained"], tags: [], attributes: { Symbol: "symbol", Footprint: "footprint", "3D Model": "old-model", "3D Model Title": "Old", "3D Model Transform": "1,2,3,4,5,6,7,8,9" } });
  const history = { ...before, documents: [...before.documents, device] };
  const modify = { id: "model", action: "library.device.modify", libraryUuid: "project", target: { uuid: "device" }, patch: { association: { model3D: modelIdentity } } };
  const plan = prepareDeviceAssociation(modify, history, model);
  const attributes = plan.afterMeta["attributes"]; assert.ok(isRecord(attributes));
  assert.equal(attributes["3D Model"], `${modelIdentity.uuid}|${modelIdentity.libraryUuid}`);
  assert.equal(attributes["3D Model Title"], "Existing Model");
  assert.equal(attributes["3D Model Transform"], "1,2,3,4,5,6,7,8,9");
  let name = "Changed Model";
  let writes = 0;
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall(topic: string): Promise<unknown> {
    if (topic.endsWith("updateData")) { writes += 1; return Promise.resolve({ message: { uuid: "device", project_uuid: "project", attributes } }); }
    return Promise.resolve({ message: { uuid: "device", project_uuid: "project", owner: { uuid: "owner" }, display_title: "Part", attributes: device.records[0]?.body["attributes"], images: ["retained"], custom_tags: "[]", source: "" } });
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) }, lib_3DModel: { get: (): Promise<unknown> => Promise.resolve({ ...model, name, description: undefined }) } };
  const execute = async (): Promise<unknown> => await runInNewContext(buildDeviceAssociationExpression(plan), { eda, top: { gVars: host }, TextEncoder });
  await assert.rejects(execute(), /MODEL_METADATA_DRIFT/u); assert.equal(writes, 0);
  name = "Existing Model"; await execute(); assert.equal(writes, 1);
  assert.throws(() => validateDeviceModelMetadata({ ...model, libraryUuid: "a".repeat(32) }, modelIdentity), /owner/u);
  assert.throws(() => deviceRequestedModel({ ...modify, patch: { association: { model3D: { uuid: "file.step", libraryUuid: "/tmp" } } } }), /32-hex/u);
  const get = { id: "get", action: "library.model3d.get" as const, libraryUuid: modelIdentity.libraryUuid, target: { uuid: modelIdentity.uuid } };
  assert.equal(validateLibraryMetadata(model, get)["libraryType"], "5");
  assert.throws(() => validateLibraryMetadata({ ...model, libraryType: "16" }, get), /family/u);
  const create = prepareDeviceCreate({ ...operation, association: { ...operation.association, model3D: modelIdentity } }, before, model);
  assert.equal(create.model?.uuid, modelIdentity.uuid);
});

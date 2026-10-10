import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { libraryExecutionKind } from "../src/library-runtime.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { buildProjectSymbolMetadataExpression, prepareProjectSymbolMetadata, verifyProjectSymbolMetadataEffect } from "../src/project-symbol-metadata.ts";
import type { ProjectSymbolMetadataPlan } from "../src/project-symbol-metadata.ts";

const OPERATION = { id: "modify-symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { description: "changed" } };
function document(uuid = "symbol", title = "MixedCase"): NativeDocumentSnapshot {
  const records = [
    { id: "META", type: "META", body: { title, description: "old", docType: 2, source: "", tags: [], future: { retain: true } }, ticket: 1, client: null },
    { id: "part", type: "PART", body: { title: "A" }, ticket: 2, client: null },
    { id: "pin", type: "PIN", body: { partId: "part", number: "1", x: 20, locked: true }, ticket: 3, client: null },
  ];
  return { uuid, docType: "SYMBOL", metadata: { uuid, docType: "SYMBOL", editVersion: "3.2.149.88089769", client: "a".repeat(16), updateTime: 1, version: "1" }, records, semanticSha256: sha256Json(records) };
}
function history(documents: readonly NativeDocumentSnapshot[] = [document()]): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: "0".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, semanticSha256: sha256Json(documents), documents };
}
function desired(before: NativeHistorySnapshot, title = "MixedCase"): NativeHistorySnapshot {
  const documents = before.documents.map((entry) => entry.uuid === "symbol" ? { ...entry,
    metadata: { ...entry.metadata, updateTime: 2, version: "2" },
    records: entry.records.map((record) => record.type === "META" ? { ...record, body: { ...record.body, title, description: "changed" } } : record) } : entry);
  return history(documents);
}
function execute(plan: ProjectSymbolMetadataPlan, eda: unknown, nativeGlobal: unknown): Promise<unknown> {
  // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed candidate compiler against isolated test doubles.
  const run = new Function("eda", "globalThis", `return ${buildProjectSymbolMetadataExpression(plan)};`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- The compiler-owned function result is immediately confined to unknown.
  const result: unknown = run(eda, nativeGlobal);
  return Promise.resolve(result);
}

void test("symbol metadata candidate refuses unproven families and stays execution-disabled", () => {
  const before = history();
  const plan = prepareProjectSymbolMetadata(OPERATION, before);
  assert.equal(plan.desiredTitle, "MixedCase");
  assert.throws(() => libraryExecutionKind(OPERATION), /proof profile/u);
  for (const operation of [
    { ...OPERATION, libraryUuid: "cloud" },
    { ...OPERATION, target: { resultOf: "create" } },
    { ...OPERATION, patch: { classification: [] } },
    { ...OPERATION, patch: { description: null } },
    { ...OPERATION, code: "raw code" },
  ]) { assert.throws(() => prepareProjectSymbolMetadata(operation, before)); }
  const nonordinary = structuredClone(before);
  const meta = nonordinary.documents[0]?.records[0]; assert.ok(meta); meta.body["docType"] = 18;
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, nonordinary), /META.docType/u);
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, history([document(), document("peer", "mixedcase")])), /already exists/u);
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, history([document(), document()])), /one active SYMBOL/u);
});

void test("symbol metadata proof admits only the exact requested fields and all peer records", () => {
  const before = history([document(), document("peer", "Other")]);
  const plan = prepareProjectSymbolMetadata(OPERATION, before);
  const after = desired(before);
  const proof = verifyProjectSymbolMetadataEffect(plan, before, after);
  assert.equal(proof["effectVerified"], true); assert.equal(proof["persistenceEvidence"], "supplied-history-comparison");
  assert.equal(Object.hasOwn(proof, "saved"), false); assert.equal(proof["reopened"], false);
  assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, desired(before, "mixedcase")), /unrequested/u);
  assert.throws(() => verifyProjectSymbolMetadataEffect(plan, { ...before, branchUuid: "other" }, after), /branch/u);
  assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, { ...after, projectOwnerUuid: "other" }), /owner/u);
  for (const [index, recordIndex, field, value] of [[0, 2, "x", 21], [0, 0, "source", "changed"], [1, 0, "description", "collateral"]] as const) {
    const altered = structuredClone(after);
    const record = altered.documents[index]?.records[recordIndex]; assert.ok(record); record.body[field] = value;
    assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, altered), /geometry|unrelated/u);
  }
  const headerDrift = structuredClone(after);
  const target = headerDrift.documents[0]; assert.ok(target); target.metadata["user"] = { uuid: "other" };
  assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, headerDrift), /header/u);
});

void test("symbol candidate supplies the exact display title and explicit empty classification once", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  let calls = 0, description = "old";
  const native = (): unknown => ({ uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, title: "mixedcase", display_title: "MixedCase", description });
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: native() }) } };
  const api = { marker: true, modify(uuid: string, library: string, title: string, classification: unknown, value: string): Promise<boolean> {
    assert.equal(this.marker, true); assert.equal(uuid, "symbol"); assert.equal(library, "project"); assert.equal(title, "MixedCase"); assert.deepEqual(classification, {});
    calls += 1; description = value; return Promise.resolve(true);
  } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) }, lib_Symbol: api };
  assert.deepEqual(decodeExactReadEnvelope(await execute(plan, eda, { gVars: host })), { kind: "project-symbol-metadata", targetId: "symbol", createdId: null });
  assert.equal(calls, 1);
});

void test("symbol candidate refuses owner drift before mutation and never retries an ambiguous native result", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  let calls = 0, owner = "other";
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: { uuid: "symbol", project_uuid: "project", owner: { uuid: owner }, docType: 2, display_title: "MixedCase", description: "old" } }) } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) }, lib_Symbol: {
    modify(): never { calls += 1; throw new Error("Private design secret"); },
  } };
  await assert.rejects(execute(plan, eda, { gVars: host }), /refused at before-read/u); assert.equal(calls, 0);
  owner = "owner";
  await assert.rejects(execute(plan, eda, { gVars: host }), { message: "Symbol metadata candidate refused at modify" }); assert.equal(calls, 1);
});

void test("symbol candidate reproves context after the awaited metadata read before modifying", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  let calls = 0;
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => {
    host.currentProject.projectId = "other";
    return Promise.resolve({ message: { uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old" } });
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: host.currentProject.projectId }) }, lib_Symbol: {
    modify(): Promise<boolean> { calls += 1; return Promise.resolve(true); },
  } };
  await assert.rejects(execute(plan, eda, { gVars: host }), /refused at before-read/u);
  assert.equal(calls, 0);
});

void test("symbol candidate treats false acknowledgment and post-modify context drift as single consumed calls", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const acknowledgment of [false, true]) {
    let calls = 0;
    const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: {
      uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old",
    } }) } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: host.currentProject.projectId }) }, lib_Symbol: {
      modify(): Promise<boolean> { calls += 1; host.currentProject.projectId = "other"; return Promise.resolve(acknowledgment); },
    } };
    await assert.rejects(execute(plan, eda, { gVars: host }), acknowledgment ? /refused at after-read/u : /refused at modify/u);
    assert.equal(calls, 1);
  }
});

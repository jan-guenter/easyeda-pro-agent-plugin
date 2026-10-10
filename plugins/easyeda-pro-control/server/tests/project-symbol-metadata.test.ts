import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";
import { libraryMutationReceipt, verifyRecoveredLibraryMutation } from "../src/library-recovery-state.ts";
import { LibraryExecutor } from "../src/library-execution.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { buildProjectSymbolMetadataExpression, prepareProjectSymbolMetadata, projectSymbolMetadataInverse, verifyProjectSymbolMetadataEffect } from "../src/project-symbol-metadata.ts";
import type { ProjectSymbolMetadataPlan } from "../src/project-symbol-metadata.ts";

const OPERATION = { id: "modify-symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { description: "changed" } };
const CONTEXT = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project" } };
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
function execute(plan: ProjectSymbolMetadataPlan, eda: unknown, nativeGlobal: unknown, context: ExpectedContext = CONTEXT): Promise<unknown> {
  assert.ok(isRecord(eda));
  // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed candidate compiler against isolated test doubles.
  const run = new Function("eda", "globalThis", `return ${buildProjectSymbolMetadataExpression(plan, context)};`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- The compiler-owned function result is immediately confined to unknown.
  const result: unknown = run({ dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) },
    dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => Promise.resolve({ tabs: [{ ...context.document, parentProjectUuid: "project" }] }) }, ...eda }, nativeGlobal);
  return Promise.resolve(result);
}

void test("symbol metadata execution refuses unproven families and requires a checkpoint-bound native plan", () => {
  const before = history();
  const plan = prepareProjectSymbolMetadata(OPERATION, before);
  assert.equal(plan.desiredTitle, "MixedCase");
  assert.equal(libraryExecutionKind(OPERATION), "project-symbol-metadata");
  assert.throws(() => buildLibraryExecutionExpression(OPERATION), /checkpoint-bound native plan/u);
  for (const operation of [
    { ...OPERATION, libraryUuid: "cloud" },
    { ...OPERATION, target: { resultOf: "create" } },
    { ...OPERATION, patch: { classification: [] } },
    { ...OPERATION, patch: { description: null } },
    { ...OPERATION, patch: { name: " \t\n" } },
    { ...OPERATION, code: "raw code" },
  ]) { assert.throws(() => prepareProjectSymbolMetadata(operation, before)); }
  const nonordinary = structuredClone(before);
  const meta = nonordinary.documents[0]?.records[0]; assert.ok(meta); meta.body["docType"] = 18;
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, nonordinary), /META.docType/u);
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, history([document(), document("peer", "mixedcase")])), /already exists/u);
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, history([document(), document()])), /one active SYMBOL/u);
});

void test("symbol compiler requires an exact bounded inactive-target editor context", () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const context of [
    { ...CONTEXT, project: { ...CONTEXT.project, uuid: "other" } },
    { ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, uuid: "symbol", tabId: "symbol@project" } },
    { ...CONTEXT, document: { ...CONTEXT.document, tabId: "" } },
    { ...CONTEXT, document: { ...CONTEXT.document, tabId: "x".repeat(513) } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentType: 18 } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentProjectUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentLibraryUuid: "owner" } },
  ]) { assert.throws(() => buildProjectSymbolMetadataExpression(plan, context)); }
});

void test("symbol modifier refuses same-project document drift after awaited metadata or tab reads", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const switchAt of ["metadata", "tree"]) {
    let calls = 0, selected = CONTEXT.document;
    const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => {
      if (switchAt === "metadata") { selected = { ...CONTEXT.document, uuid: "other", tabId: "other@project" }; }
      return Promise.resolve({ message: { uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old" } });
    } } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(selected) },
      dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => {
        if (switchAt === "tree") { selected = { ...CONTEXT.document, uuid: "other", tabId: "other@project" }; }
        return Promise.resolve({ tabs: [{ ...CONTEXT.document, parentProjectUuid: "project" }] });
      } }, lib_Symbol: { modify(): Promise<boolean> { calls += 1; return Promise.resolve(true); } } };
    await assert.rejects(execute(plan, eda, { gVars: host }), /before-read|target-closed/u);
    assert.equal(calls, 0);
  }
});

void test("symbol modifier makes its last awaited pre-write read the exact active document proof", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const drift of [{ uuid: "other" }, { documentUuid: "other" }, { documentType: 1 }, { tabId: "other@project" },
    { parentProjectUuid: "other" }, { parentLibraryUuid: "other" }]) {
    let calls = 0, documentReads = 0;
    const events: string[] = [];
    const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: {
      uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old",
    } }) } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => { events.push("project"); return Promise.resolve(CONTEXT.project); } },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
        documentReads += 1; events.push("document");
        return Promise.resolve(documentReads === 3 ? { ...CONTEXT.document, ...drift } : CONTEXT.document);
      } }, lib_Symbol: { modify(): Promise<boolean> { calls += 1; return Promise.resolve(true); } } };
    await assert.rejects(execute(plan, eda, { gVars: host }), /target-closed/u);
    assert.equal(calls, 0); assert.equal(events.at(-1), "document");
  }
});

void test("symbol modifier retains required active ownership and rechecks host identity after the last await", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  const context = { ...CONTEXT, document: { ...CONTEXT.document, documentType: 2, parentProjectUuid: "project", parentLibraryUuid: "owner" } };
  for (const fault of ["missing-project", "missing-library", "project-alias", "host-project"]) {
    let calls = 0, documentReads = 0, projectReads = 0;
    const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: {
      uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old",
    } }) } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => {
      projectReads += 1;
      return Promise.resolve(projectReads === 3 && fault === "project-alias" ? { ...CONTEXT.project, projectUuid: "other" } : CONTEXT.project);
    } }, dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
      documentReads += 1;
      if (documentReads !== 3) { return Promise.resolve(context.document); }
      if (fault === "host-project") { host.currentProject.projectId = "other"; }
      return Promise.resolve({ ...context.document, ...(fault === "missing-project" ? { parentProjectUuid: undefined } : {}),
        ...(fault === "missing-library" ? { parentLibraryUuid: undefined } : {}) });
    } }, lib_Symbol: { modify(): Promise<boolean> { calls += 1; return Promise.resolve(true); } } };
    await assert.rejects(execute(plan, eda, { gVars: host }, context), /target-closed/u);
    assert.equal(calls, 0);
  }
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
  await assert.rejects(execute(plan, eda, { gVars: host }), { message: "Symbol metadata operation refused at modify" }); assert.equal(calls, 1);
});

void test("symbol inverse requires the complete proved forward effect and prepares a new exact patch", () => {
  const before = history([document(), document("peer", "Other")]);
  const operation = { ...OPERATION, patch: { name: "RenamedSymbol", description: "changed" } };
  const plan = prepareProjectSymbolMetadata(operation, before);
  const after = desired(before, "RenamedSymbol");
  const inverse = projectSymbolMetadataInverse(plan, before, after, "inverse-symbol");
  assert.deepEqual(inverse, { id: "inverse-symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { name: "MixedCase", description: "old" } });
  const inversePlan = prepareProjectSymbolMetadata(inverse, after);
  assert.notEqual(inversePlan.beforeProjectSha256, plan.beforeProjectSha256);
  const restored = structuredClone(before);
  const target = restored.documents[0]; assert.ok(target);
  target.metadata["updateTime"] = 3; target.metadata["version"] = "3";
  assert.equal(verifyProjectSymbolMetadataEffect(inversePlan, after, restored)["effectVerified"], true);
  assert.throws(() => projectSymbolMetadataInverse(plan, before, desired(before, "Other"), "inverse-symbol"), /unrequested/u);
});

void test("symbol mutation recovery binds the immutable prepared plan and exact returned target", () => {
  const before = history();
  const after = desired(before), preparedSymbol = prepareProjectSymbolMetadata(OPERATION, before);
  const nativeReturn = { kind: "project-symbol-metadata", targetId: "symbol", createdId: null };
  const retainedReceipt = libraryMutationReceipt(OPERATION, nativeReturn);
  const verified = verifyRecoveredLibraryMutation({ operation: OPERATION, before, after, nativeReturn, retainedReceipt, preparedSymbol });
  assert.equal(verified.proof["effectVerified"], true);
  assert.equal(verified.proof["reopened"], false);
  for (const changed of [{ ...nativeReturn, targetId: "other" }, { ...nativeReturn, createdId: "a".repeat(16) }, { ...nativeReturn, targetId: null }]) {
    assert.throws(() => libraryMutationReceipt(OPERATION, changed), /identity/u);
  }
  assert.throws(() => verifyRecoveredLibraryMutation({ operation: OPERATION, before, after, nativeReturn, preparedSymbol: { ...preparedSymbol, beforeTitle: "changed" } }), /immutable operation/u);
  assert.throws(() => verifyRecoveredLibraryMutation({ operation: OPERATION, before, after, nativeReturn }), /immutable operation/u);
  assert.throws(() => verifyRecoveredLibraryMutation({ operation: OPERATION, before, after, nativeReturn, preparedSymbol, retainedReceipt: { ...retainedReceipt, nativeReturnSha256: "0".repeat(64) } }), /rebound/u);
});

void test("symbol transaction refuses active targets and missing write confirmation before any upstream access", async () => {
  let calls = 0;
  const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => { calls += 1; return Promise.reject(new Error("Unexpected upstream call")); } });
  const executor = new LibraryExecutor(engine);
  const request = { operation: OPERATION, expectedContext: { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "symbol", documentType: 2, tabId: "symbol@project" } }, expectedFingerprint: {}, confirmWrite: true as const };
  await assert.rejects(executor.execute(request), /inactive target/u);
  const { confirmWrite: _confirmWrite, ...unconfirmed } = request;
  await assert.rejects(executor.execute(unconfirmed), /explicit confirmation/u);
  assert.equal(calls, 0);
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

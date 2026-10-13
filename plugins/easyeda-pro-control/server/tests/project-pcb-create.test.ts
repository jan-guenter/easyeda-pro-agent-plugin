import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { assertProjectPcbCreateContext, isProjectPcbCreateProjectUnchanged, prepareProjectPcbCreate, projectPcbCreateOperation, verifyProjectPcbCreateEffect } from "../src/project-pcb-create.ts";
import { libraryMutationReceipt, verifyRecoveredLibraryMutation } from "../src/library-recovery-state.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";
import { PCB_CREATE_CONTEXT as CONTEXT, PCB_CREATE_ID as CREATED, PCB_CREATE_OPERATION as OPERATION, pcbCreateHistory, pcbCreateRehash } from "./project-pcb-create-fixture.ts";

function mutate(history: NativeHistorySnapshot, uuid: string, update: (document: NativeDocumentSnapshot) => void): NativeHistorySnapshot {
  const documents = structuredClone(history.documents), target = documents.find((entry) => entry.uuid === uuid); assert.ok(target);
  update(target); return pcbCreateRehash(documents, history.checkpointSha256);
}
function bind(history: NativeHistorySnapshot, headerTicket = 1): NativeHistorySnapshot {
  return mutate(history, "page", (entry) => {
    const body = { profile: "easyeda.native-history.schematic-header-lineage.v1", checkpointSha256: history.checkpointSha256,
      documentUuid: "page", headers: [{ ticket: headerTicket, metadata: entry.metadata }] };
    Reflect.set(entry, "headerHistory", { ...body, sha256: sha256Json(body) });
    Reflect.set(entry, "records", [...entry.records, { id: "attr", type: "ATTR", ticket: 1, client: "a".repeat(16), firstTicket: 0, firstClient: "a".repeat(16), body: {} }]);
  });
}
void test("closed free PCB creation adds one retained identity with exact defaults and complete peer clocks", () => {
  const after = pcbCreateHistory(true), before = pcbCreateHistory(), plan = prepareProjectPcbCreate(OPERATION, before, CONTEXT);
  assert.equal(plan.desiredTitle, "PCB8"); assert.equal(libraryExecutionKind(OPERATION), "project-pcb-create");
  assert.throws(() => buildLibraryExecutionExpression(OPERATION), /checkpoint-bound/u);
  const proof = verifyProjectPcbCreateEffect(plan, before, after, CREATED);
  for (const field of ["effectVerified", "emptyPcb", "freePcb"]) { assert.equal(proof[field], true); }
  for (const field of ["saveInvoked", "reopened", "editorOpened", "canvasInitialized", "automaticInverseAvailable", "currentGenerationLiveValidated"]) { assert.equal(proof[field], false); }
  assert.equal(isProjectPcbCreateProjectUnchanged(plan, before, before), true);
  assert.equal(isProjectPcbCreateProjectUnchanged(plan, before, after), false);
  assert.equal(isProjectPcbCreateProjectUnchanged(plan, before, pcbCreateHistory(false, true)), false);
  assert.throws(() => verifyProjectPcbCreateEffect(plan, before, pcbCreateHistory(true, true), CREATED), /pre-existing/u);
  for (const returned of [undefined, "unknown", "d".repeat(16), "active"]) { assert.throws(() => verifyProjectPcbCreateEffect(plan, before, after, returned)); }
  assert.throws(() => verifyProjectPcbCreateEffect({ ...plan, desiredTitle: "Forged" }, before, after, CREATED), /original checkpoint/u);
  assert.throws(() => verifyProjectPcbCreateEffect(plan, before, before, CREATED), /exactly one/u);
});
void test("creation names match public PCB suffix numbering including gaps, separators, case and leading zeros", () => {
  for (const [name, expected] of [["PCB1", "PCB2"], ["pcb_0042", "PCB43"], ["PCB 99", "PCB100"], ["PCB0", "PCB2"], ["notPCB900", "PCB2"], ["PCB7extra", "PCB2"]]) {
    const before = mutate(pcbCreateHistory(), "peer", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["title"] = name; });
    assert.equal(prepareProjectPcbCreate(OPERATION, before, CONTEXT).desiredTitle, expected);
  }
  for (const name of ["PCB9007199254740991", "PCB9007199254740992", `PCB${"9".repeat(300)}`]) {
    assert.throws(() => prepareProjectPcbCreate(OPERATION, mutate(pcbCreateHistory(), "peer", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["title"] = name; }), CONTEXT), /integer range/u);
  }
  const deleted = mutate(pcbCreateHistory(), "peer", (entry) => { Reflect.set(entry, "records", [...entry.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 1, client: null, body: { isDelete: true } }]); });
  assert.equal(prepareProjectPcbCreate(OPERATION, deleted, CONTEXT).desiredTitle, "PCB2");
});
void test("creation rejects board binding, unsupported baselines, inconsistent identities and incomplete checkpoint integrity", () => {
  const before = pcbCreateHistory(), plan = prepareProjectPcbCreate(OPERATION, before, CONTEXT);
  for (const patch of [{ boardName: "Board" }, { boardName: undefined }, { boardName: "" }, { title: "caller title" }, { action: "document.page.create" }]) {
    assert.throws(() => projectPcbCreateOperation({ ...OPERATION, ...patch }));
  }
  for (const context of [{ ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "foreign" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "foreign" } }, { ...CONTEXT, document: { ...CONTEXT.document, parentLibraryUuid: "library" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentType: 1 } }, { ...CONTEXT, document: { ...CONTEXT.document, tabId: "unknown" } }]) {
    assert.throws(() => prepareProjectPcbCreate(OPERATION, before, context)); assert.throws(() => { assertProjectPcbCreateContext(plan, context); });
  }
  for (const docType of ["INSTANCE", "VARIANT", "COMPONENT_GROUP", "COMPONENT_GROUP_DATA"]) {
    assert.throws(() => prepareProjectPcbCreate(OPERATION, mutate(before, "peer", (entry) => { Reflect.set(entry, "docType", docType); entry.metadata["docType"] = docType; }), CONTEXT), /hierarchy/u);
  }
  for (const patch of [{ source: "inherited" }, { parent: "parent" }, { blockSymbolUuid: "cbb" }, { zIndex: 9 }, { board: "unknown" }, { future: true }]) {
    assert.throws(() => prepareProjectPcbCreate(OPERATION, mutate(before, "peer", (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); }), CONTEXT));
  }
  assert.throws(() => prepareProjectPcbCreate(OPERATION, mutate(before, "page", (entry) => { Object.assign(entry.records[0]?.body ?? {}, { schematic: "missing" }); }), CONTEXT));
  assert.throws(() => prepareProjectPcbCreate(OPERATION, mutate(before, "peer", (entry) => { Reflect.set(entry, "atomHeaderHistory", []); }), CONTEXT), /provenance/u);
  assert.throws(() => prepareProjectPcbCreate(OPERATION, { ...before, semanticSha256: "0".repeat(64) }, CONTEXT), /integrity/u);
  const first = before.documents[0]; assert.ok(first);
  assert.throws(() => prepareProjectPcbCreate(OPERATION, pcbCreateRehash([...before.documents, first]), CONTEXT), /integrity/u);
});
void test("creation refuses extra documents, canvas, changed metadata, headers and clocks despite matching semantic records", () => {
  const after = pcbCreateHistory(true), before = pcbCreateHistory(), plan = prepareProjectPcbCreate(OPERATION, before, CONTEXT);
  for (const patch of [{ source: "copy" }, { board: "board" }, { parent: "peer" }, { zIndex: 0 }, { title: "Other" }, { future: true }]) {
    assert.throws(() => verifyProjectPcbCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); }), CREATED));
  }
  for (const patch of [{ user: {} }, { version: "1" }, { editVersion: "future" }, { client: "bad" }, { future: true }]) {
    assert.throws(() => verifyProjectPcbCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.metadata, patch); }), CREATED));
  }
  for (const patch of [{ ticket: 1 }, { ticket: 1.5 }, { client: null }, { client: "b".repeat(16) }, { firstTicket: 0, firstClient: null }, { future: true }]) {
    assert.throws(() => verifyProjectPcbCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.records[0] ?? {}, patch); }), CREATED));
  }
  for (const uuid of ["active", "peer", "parent", "page"]) {
    for (const patch of [{ ticket: 9 }, { client: "b".repeat(16) }]) {
      assert.throws(() => verifyProjectPcbCreateEffect(plan, before, mutate(after, uuid, (entry) => { Object.assign(entry.records[0] ?? {}, patch); }), CREATED), /pre-existing/u);
    }
  }
  assert.throws(() => verifyProjectPcbCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Reflect.set(entry, "records", [...entry.records, { id: "CANVAS", type: "CANVAS", ticket: 2, client: "a".repeat(16), body: {} }]); }), CREATED));
  const created = after.documents.at(-1); assert.ok(created);
  const extra = { ...created, uuid: "d".repeat(16), metadata: { ...created.metadata, uuid: "d".repeat(16) } };
  assert.throws(() => verifyProjectPcbCreateEffect(plan, before, pcbCreateRehash([...after.documents, extra]), CREATED), /exactly one/u);
});
void test("creation preserves complete schematic header lineage and insertion provenance across receipt rebinding", () => {
  const after = bind({ ...pcbCreateHistory(true), checkpointSha256: "b".repeat(64) }), before = bind(pcbCreateHistory());
  const plan = prepareProjectPcbCreate(OPERATION, before, CONTEXT);
  assert.equal(verifyProjectPcbCreateEffect(plan, before, after, CREATED)["effectVerified"], true);
  for (const patch of [{ firstTicket: 1 }, { firstClient: "b".repeat(16) }]) {
    assert.throws(() => verifyProjectPcbCreateEffect(plan, before, mutate(after, "page", (entry) => { Object.assign(entry.records[1] ?? {}, patch); }), CREATED), /pre-existing/u);
  }
  assert.throws(() => verifyProjectPcbCreateEffect(plan, before, bind(pcbCreateHistory(true), 2), CREATED), /pre-existing/u);
});
void test("changed-result recovery binds the original native UUID and complete original plan", () => {
  const after = pcbCreateHistory(true), before = pcbCreateHistory(), preparedPcbCreate = prepareProjectPcbCreate(OPERATION, before, CONTEXT);
  const nativeReturn = { kind: "project-pcb-create", targetId: CREATED, createdId: CREATED }, retainedReceipt = libraryMutationReceipt(OPERATION, nativeReturn);
  const input = { operation: OPERATION, before, after, nativeReturn, retainedReceipt, preparedPcbCreate, expectedContext: CONTEXT };
  assert.equal(verifyRecoveredLibraryMutation(input).proof["effectVerified"], true);
  assert.throws(() => verifyRecoveredLibraryMutation({ ...input, preparedPcbCreate: { ...preparedPcbCreate, desiredTitle: "changed" } }), /immutable/u);
  assert.throws(() => verifyRecoveredLibraryMutation({ ...input, nativeReturn: { ...nativeReturn, createdId: "d".repeat(16), targetId: "d".repeat(16) } }), /rebound/u);
  assert.throws(() => libraryMutationReceipt(OPERATION, { ...nativeReturn, targetId: "active" }), /disagree/u);
});

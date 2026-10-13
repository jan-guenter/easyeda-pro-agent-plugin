import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { assertProjectSchematicCreateContext, isProjectSchematicCreateProjectUnchanged, prepareProjectSchematicCreate, projectSchematicCreateOperation, verifyProjectSchematicCreateEffect } from "../src/project-schematic-create.ts";
import { libraryMutationReceipt, verifyRecoveredLibraryMutation } from "../src/library-recovery-state.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";
import { appendNativeDocumentRecordChain, nativeDocumentRecordHistoryProjection, sealNativeDocumentRecordHistory } from "../src/native-document-record-history.ts";
import { fixtureDocumentRecordHistory } from "./document-record-history-fixture.ts";
import { SCHEMATIC_CREATE_CONTEXT as CONTEXT, SCHEMATIC_CREATE_ID as CREATED, SCHEMATIC_CREATE_OPERATION as OPERATION, schematicCreateHistory, schematicCreateRehash } from "./project-schematic-create-fixture.ts";

function mutate(history: NativeHistorySnapshot, uuid: string, update: (document: NativeDocumentSnapshot) => void): NativeHistorySnapshot {
  const documents = structuredClone(history.documents), target = documents.find((entry) => entry.uuid === uuid); assert.ok(target);
  update(target); return schematicCreateRehash(documents, history.checkpointSha256);
}
function bind(history: NativeHistorySnapshot, headerTicket = 1): NativeHistorySnapshot {
  return mutate(history, "page", (entry) => {
    const body = { profile: "easyeda.native-history.schematic-header-lineage.v1", checkpointSha256: history.checkpointSha256,
      documentUuid: "page", headers: [{ ticket: headerTicket, metadata: entry.metadata }] };
    Reflect.set(entry, "headerHistory", { ...body, sha256: sha256Json(body) });
    Reflect.set(entry, "records", [...entry.records, { id: "attr", type: "ATTR", ticket: 1, client: "a".repeat(16), firstTicket: 0, firstClient: "a".repeat(16), body: {} }]);
  });
}
void test("closed free schematic creation adds one retained identity with exact defaults and complete peer clocks", () => {
  const after = schematicCreateHistory(true), before = schematicCreateHistory(), plan = prepareProjectSchematicCreate(OPERATION, before, CONTEXT);
  assert.equal(plan.desiredTitle, "Schematic8"); assert.equal(libraryExecutionKind(OPERATION), "project-schematic-create");
  assert.throws(() => buildLibraryExecutionExpression(OPERATION), /checkpoint-bound/u);
  const proof = verifyProjectSchematicCreateEffect(plan, before, after, CREATED);
  for (const field of ["effectVerified", "emptySchematic", "freeSchematic"]) { assert.equal(proof[field], true); }
  for (const field of ["saveInvoked", "reopened", "editorOpened", "canvasInitialized", "automaticInverseAvailable", "currentGenerationLiveValidated"]) { assert.equal(proof[field], false); }
  assert.equal(isProjectSchematicCreateProjectUnchanged(plan, before, before), true);
  assert.equal(isProjectSchematicCreateProjectUnchanged(plan, before, after), false);
  assert.equal(isProjectSchematicCreateProjectUnchanged(plan, before, schematicCreateHistory(false, true)), false);
  assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, schematicCreateHistory(true, true), CREATED), /pre-existing/u);
  for (const returned of [undefined, "unknown", "d".repeat(16), "active"]) { assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, after, returned)); }
  assert.throws(() => verifyProjectSchematicCreateEffect({ ...plan, desiredTitle: "Forged" }, before, after, CREATED), /original checkpoint/u);
  assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, before, CREATED), /exactly one/u);
});
void test("creation names match public schematic suffix numbering including gaps, separators, case and leading zeros", () => {
  for (const [name, expected] of [["Schematic1", "Schematic2"], ["schematic_0042", "Schematic43"], ["Schematic 99", "Schematic100"], ["Schematic0", "Schematic2"], ["notSchematic900", "Schematic2"], ["Schematic7extra", "Schematic2"]]) {
    const before = mutate(schematicCreateHistory(), "peer", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["title"] = name; });
    assert.equal(prepareProjectSchematicCreate(OPERATION, before, CONTEXT).desiredTitle, expected);
  }
  for (const name of ["Schematic9007199254740991", "Schematic9007199254740992", `Schematic${"9".repeat(300)}`]) {
    assert.throws(() => prepareProjectSchematicCreate(OPERATION, mutate(schematicCreateHistory(), "peer", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["title"] = name; }), CONTEXT), /integer range/u);
  }
  const deleted = mutate(schematicCreateHistory(), "peer", (entry) => { Reflect.set(entry, "records", [...entry.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 1, client: null, body: { isDelete: true } }]); });
  assert.equal(prepareProjectSchematicCreate(OPERATION, deleted, CONTEXT).desiredTitle, "Schematic2");
});
void test("creation rejects board binding, unsupported baselines, inconsistent identities and incomplete checkpoint integrity", () => {
  const before = schematicCreateHistory(), plan = prepareProjectSchematicCreate(OPERATION, before, CONTEXT);
  for (const patch of [{ boardName: "Board" }, { boardName: undefined }, { boardName: "" }, { title: "caller title" }, { action: "document.page.create" }]) {
    assert.throws(() => projectSchematicCreateOperation({ ...OPERATION, ...patch }));
  }
  for (const context of [{ ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "foreign" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "foreign" } }, { ...CONTEXT, document: { ...CONTEXT.document, parentLibraryUuid: "library" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentType: 1 } }, { ...CONTEXT, document: { ...CONTEXT.document, tabId: "unknown" } }]) {
    assert.throws(() => prepareProjectSchematicCreate(OPERATION, before, context)); assert.throws(() => { assertProjectSchematicCreateContext(plan, context); });
  }
  for (const docType of ["INSTANCE", "VARIANT", "COMPONENT_GROUP", "COMPONENT_GROUP_DATA"]) {
    assert.throws(() => prepareProjectSchematicCreate(OPERATION, mutate(before, "peer", (entry) => { Reflect.set(entry, "docType", docType); entry.metadata["docType"] = docType; }), CONTEXT), /hierarchy/u);
  }
  for (const patch of [{ source: "inherited" }, { parent: "parent" }, { blockSymbolUuid: "cbb" }, { zIndex: 9 }, { board: "unknown" }, { future: true }]) {
    assert.throws(() => prepareProjectSchematicCreate(OPERATION, mutate(before, "peer", (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); }), CONTEXT));
  }
  assert.throws(() => prepareProjectSchematicCreate(OPERATION, mutate(before, "page", (entry) => { Object.assign(entry.records[0]?.body ?? {}, { schematic: "missing" }); }), CONTEXT));
  assert.throws(() => prepareProjectSchematicCreate(OPERATION, mutate(before, "peer", (entry) => { Reflect.set(entry, "atomHeaderHistory", []); }), CONTEXT), /provenance/u);
  assert.throws(() => prepareProjectSchematicCreate(OPERATION, { ...before, semanticSha256: "0".repeat(64) }, CONTEXT), /integrity/u);
  const first = before.documents[0]; assert.ok(first);
  assert.throws(() => prepareProjectSchematicCreate(OPERATION, schematicCreateRehash([...before.documents, first]), CONTEXT), /integrity/u);
});
void test("creation refuses extra documents, canvas, changed metadata, headers and clocks despite matching semantic records", () => {
  const after = schematicCreateHistory(true), before = schematicCreateHistory(), plan = prepareProjectSchematicCreate(OPERATION, before, CONTEXT);
  for (const patch of [{ source: "copy" }, { board: "board" }, { parent: "peer" }, { zIndex: 0 }, { title: "Other" }, { future: true }]) {
    assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); }), CREATED));
  }
  for (const patch of [{ user: {} }, { version: "1" }, { editVersion: "future" }, { client: "bad" }, { future: true }]) {
    assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.metadata, patch); }), CREATED));
  }
  for (const patch of [{ ticket: 1 }, { ticket: 1.5 }, { client: null }, { client: "b".repeat(16) }, { firstTicket: 0, firstClient: null }, { future: true }]) {
    assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.records[0] ?? {}, patch); }), CREATED));
  }
  for (const uuid of ["active", "peer", "parent", "page"]) {
    for (const patch of [{ ticket: 9 }, { client: "b".repeat(16) }]) {
      assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, mutate(after, uuid, (entry) => { Object.assign(entry.records[0] ?? {}, patch); }), CREATED), /pre-existing/u);
    }
  }
  assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Reflect.set(entry, "records", [...entry.records, { id: "CANVAS", type: "CANVAS", ticket: 2, client: "a".repeat(16), body: {} }]); }), CREATED));
  const created = after.documents.at(-1); assert.ok(created);
  const extra = { ...created, uuid: "d".repeat(16), metadata: { ...created.metadata, uuid: "d".repeat(16) } };
  assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, schematicCreateRehash([...after.documents, extra]), CREATED), /exactly one/u);
});
void test("creation preserves complete schematic header lineage and insertion provenance across receipt rebinding", () => {
  const after = bind({ ...schematicCreateHistory(true), checkpointSha256: "b".repeat(64) }), before = bind(schematicCreateHistory());
  const plan = prepareProjectSchematicCreate(OPERATION, before, CONTEXT);
  assert.equal(verifyProjectSchematicCreateEffect(plan, before, after, CREATED)["effectVerified"], true);
  for (const patch of [{ firstTicket: 1 }, { firstClient: "b".repeat(16) }]) {
    assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, mutate(after, "page", (entry) => { Object.assign(entry.records[1] ?? {}, patch); }), CREATED), /pre-existing/u);
  }
  assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, bind(schematicCreateHistory(true), 2), CREATED), /pre-existing/u);
});
void test("changed-result recovery binds the original native UUID and complete original plan", () => {
  const after = schematicCreateHistory(true), before = schematicCreateHistory(), preparedSchematicCreate = prepareProjectSchematicCreate(OPERATION, before, CONTEXT);
  const nativeReturn = { kind: "project-schematic-create", targetId: CREATED, createdId: CREATED }, retainedReceipt = libraryMutationReceipt(OPERATION, nativeReturn);
  const input = { operation: OPERATION, before, after, nativeReturn, retainedReceipt, preparedSchematicCreate, expectedContext: CONTEXT };
  assert.equal(verifyRecoveredLibraryMutation(input).proof["effectVerified"], true);
  assert.throws(() => verifyRecoveredLibraryMutation({ ...input, preparedSchematicCreate: { ...preparedSchematicCreate, desiredTitle: "changed" } }), /immutable/u);
  assert.throws(() => verifyRecoveredLibraryMutation({ ...input, nativeReturn: { ...nativeReturn, createdId: "d".repeat(16), targetId: "d".repeat(16) } }), /rebound/u);
  assert.throws(() => libraryMutationReceipt(OPERATION, { ...nativeReturn, targetId: "active" }), /disagree/u);
});

void test("schematic creation resolves every page component to an ordinary local symbol before admitting subscribers", () => {
  const base = schematicCreateHistory();
  const page = mutate(base, "page", (document) => {
    Reflect.set(document, "records", [...document.records,
      { id: "component", type: "COMPONENT", ticket: 1, client: null, body: { attrs: {}, partId: "part" } },
      { id: "symbol-reference", type: "ATTR", ticket: 1, client: null, body: { parentId: "component", key: "Symbol", value: "symbol" } }]);
  });
  const definition = fixtureDocumentRecordHistory({ uuid: "symbol", docType: "SYMBOL", metadata: { uuid: "symbol", docType: "SYMBOL" },
    records: [{ id: "META", type: "META", ticket: 1, client: null, body: { title: "Ordinary", docType: 2 } }], semanticSha256: "" }, base.checkpointSha256);
  const ordinary = schematicCreateRehash([...page.documents, definition]);
  assert.equal(prepareProjectSchematicCreate(OPERATION, ordinary, CONTEXT).desiredTitle, "Schematic8");
  assert.throws(() => prepareProjectSchematicCreate(OPERATION, page, CONTEXT), /ordinary checkpoint membership/u);
  for (const type of [17, 999]) {
    const changed = mutate(ordinary, "symbol", (document) => { const meta = document.records[0]; assert.ok(meta); meta.body["docType"] = type; });
    assert.throws(() => prepareProjectSchematicCreate(OPERATION, changed, CONTEXT), /block-symbol|unknown symbol/u);
  }
  const contradiction = mutate(ordinary, "page", (document) => { const part = document.records.find((record) => record.id === "component"); assert.ok(part); part.body["attrs"] = { Symbol: "foreign" }; });
  assert.throws(() => prepareProjectSchematicCreate(OPERATION, contradiction, CONTEXT), /contradictory/u);
  for (const [key, value] of [["cmdKey", "block_symbol"], ["symbolUuid", "foreign"], ["partId", "foreign"], ["Symbol", "symbol"], ["__proto__", {}], ["futureSetter", true]] as const) {
    const injected = mutate(ordinary, "page", (document) => {
      const part = document.records.find((record) => record.id === "component"); assert.ok(part); part.body["attrs"] = { [key]: value };
    });
    assert.throws(() => prepareProjectSchematicCreate(OPERATION, injected, CONTEXT), /unsupported inline/u);
  }
  const duplicate = mutate(ordinary, "page", (document) => {
    const reference = document.records.find((record) => record.id === "symbol-reference"); assert.ok(reference);
    Reflect.set(document, "records", [...document.records, { ...reference, id: "duplicate-reference" }]);
  });
  assert.throws(() => prepareProjectSchematicCreate(OPERATION, duplicate, CONTEXT), /one exact local symbol/u);
});

void test("schematic creation supports a first container and refuses raw peer occurrence changes invisible to semantic hashes", () => {
  const after = schematicCreateHistory(true), before = schematicCreateHistory(), plan = prepareProjectSchematicCreate(OPERATION, before, CONTEXT);
  const noSchematic = schematicCreateRehash(before.documents.filter((document) => document.docType === "PCB"));
  assert.equal(prepareProjectSchematicCreate(OPERATION, noSchematic, CONTEXT).desiredTitle, "Schematic1");
  const altered = mutate(after, "active", (document) => {
    const chain = appendNativeDocumentRecordChain(nativeDocumentRecordHistoryProjection(document), "f".repeat(64), 1);
    Reflect.set(document, "documentRecordHistory", sealNativeDocumentRecordHistory(chain, after.checkpointSha256, document.uuid));
  });
  assert.equal(altered.semanticSha256, after.semanticSha256);
  assert.throws(() => verifyProjectSchematicCreateEffect(plan, before, altered, CREATED), /pre-existing/u);
  const unchangedLooking = mutate(before, "active", (document) => {
    const chain = appendNativeDocumentRecordChain(nativeDocumentRecordHistoryProjection(document), "f".repeat(64), 1);
    Reflect.set(document, "documentRecordHistory", sealNativeDocumentRecordHistory(chain, before.checkpointSha256, document.uuid));
  });
  assert.equal(isProjectSchematicCreateProjectUnchanged(plan, before, unchangedLooking), false);
});

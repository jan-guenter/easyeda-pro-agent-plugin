// These coordinator tests enforce the current refusal boundary. The former
// Execute/late-failure cases remain in Git history, not as enabled lifecycle
// Claims. Pure planner, expression and effect suites remain separate.
import { sha256Json } from "../src/core.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { prepareDocumentContainerRename } from "../src/document-container-rename.ts";
import { fixtureDocumentRecordHistory } from "./document-record-history-fixture.ts";
import { registerStructureTransactionTests } from "./library-structure-transaction-fixture.ts";

type Value = Record<string, unknown>;
const HASH = "a".repeat(64);
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "active", documentType: 3,
  tabId: "active@project", parentProjectUuid: "project" } };
const OPERATION = { id: "rename-page", action: "document.pcb.rename", target: { uuid: "target" }, name: "Renamed" };
function history(kind: "pcb" | "schematic", renamed = false, peerChanged = false): NativeHistorySnapshot {
  const documents = ["active", "target", "child", "parent"].map((uuid) => {
    let docType = "PCB";
    if (uuid === "parent" || uuid === "target" && kind === "schematic") { docType = "SCH"; }
    else if (uuid === "child") { docType = "SCH_PAGE"; }
    const time = uuid === "target" && renamed ? 2 : 1;
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: time, version: String(time), editVersion: "3.2",
      ...(uuid === "target" && renamed ? {} : { user: { uuid: "original-author" } }) };
    const body: Value = { title: uuid === "target" && renamed ? "Renamed" : uuid, source: "", zIndex: docType === "SCH_PAGE" ? 1 : null,
      ...(docType === "SCH_PAGE" ? { schematic: kind === "schematic" ? "target" : "parent" } : { board: "" }), ...(docType === "PCB" ? { parent: "" } : {}) };
    const records = [{ id: "META", type: "META", body, ticket: peerChanged && uuid === "active" ? 99 : time, client: uuid === "target" && renamed ? "a".repeat(16) : null }];
    const baseline = uuid === "target" && renamed ? history(kind).documents.find((entry) => entry.uuid === uuid) : undefined;
    return fixtureDocumentRecordHistory({ uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata, records: records.map(({ id, type, body: content }) => ({ id, type, body: content })) }) }, HASH, baseline);
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

for (const kind of ["pcb", "schematic"] as const) {
  const operation = { ...OPERATION, action: `document.${kind}.rename` };
  registerStructureTransactionTests({ operation, context: CONTEXT, preparationPhase: "document-rename-prepared",
    prepare: () => ({ documentRenamePlan: prepareDocumentContainerRename(operation, history(kind), CONTEXT) }), targetId: "target", created: false });
}

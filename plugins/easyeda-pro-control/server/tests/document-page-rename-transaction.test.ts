// These coordinator tests enforce the current refusal boundary. The former
// Execute/late-failure cases remain in Git history, not as enabled lifecycle
// Claims. Pure planner, expression and effect suites remain separate.
import { prepareDocumentPageRename } from "../src/document-page-rename.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { sha256Json } from "../src/core.ts";
import type { ExpectedContext } from "../src/engine.ts";
import { registerStructureTransactionTests } from "./library-structure-transaction-fixture.ts";

type Value = Record<string, unknown>;
const HASH = "a".repeat(64);
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "active", documentType: 1,
  tabId: "active@project", parentProjectUuid: "project" }, schematic: { uuid: "parent" } };
const OPERATION = { id: "rename-page", action: "document.page.rename", target: { uuid: "page" }, name: "Renamed" };
function history(renamed = false, peerChanged = false): NativeHistorySnapshot {
  const documents = ["parent", "active", "page"].map((uuid) => {
    const docType = uuid === "parent" ? "SCH" : "SCH_PAGE", time = uuid === "page" && renamed ? 2 : 1;
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: time, version: String(time), editVersion: "3.2",
      ...(uuid === "page" && renamed ? {} : { user: { uuid: "original-author" } }) };
    const body: Value = uuid === "parent" ? { title: "Container", source: "", board: "" } : { title: uuid === "page" && renamed ? "Renamed" : uuid,
      schematic: "parent", source: "", zIndex: peerChanged && uuid === "active" ? 2 : 1 };
    const records = [{ id: "META", type: "META", body, ticket: time, client: null }];
    return { uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata, records: records.map(({ id, type, body: content }) => ({ id, type, body: content })) }) };
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

registerStructureTransactionTests({ operation: OPERATION, context: CONTEXT, preparationPhase: "page-rename-prepared",
  prepare: () => ({ pageRenamePlan: prepareDocumentPageRename(OPERATION, history(), CONTEXT) }), targetId: "page", created: false });

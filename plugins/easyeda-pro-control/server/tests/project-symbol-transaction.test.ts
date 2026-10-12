// These coordinator tests enforce the current refusal boundary. The former
// Execute/late-failure cases remain in Git history, not as enabled lifecycle
// Claims. Pure planner, expression and effect suites remain separate.
import { prepareProjectSymbolMetadata } from "../src/project-symbol-metadata.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { registerStructureTransactionTests } from "./library-structure-transaction-fixture.ts";

type Value = Record<string, unknown>;
const CONTEXT = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project" } };
const OPERATION = { id: "modify-symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { description: "changed" } };
const HASH = "a".repeat(64);
function document(uuid: string, docType: string, body: Value): NativeDocumentSnapshot {
  return { uuid, docType, metadata: { uuid, docType, editVersion: "3.2.149.88089769", client: "a".repeat(16), updateTime: 1, version: "1", user: { uuid: "previous-actor" } },
    records: [{ id: "META", type: "META", ticket: 1, client: null, body }, { id: "pin", type: "PIN", ticket: 2, client: null, body: { number: "1", x: 20 } }], semanticSha256: HASH };
}
function history(): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: HASH,
    documents: [document("board", "PCB", { title: "Board" }), document("symbol", "SYMBOL", { title: "MixedCase", description: "before", docType: 2, source: "", tags: ["Primary", "Secondary"] })] };
}

registerStructureTransactionTests({ operation: OPERATION, context: CONTEXT, preparationPhase: "symbol-prepared",
  prepare: () => ({ symbolPlan: prepareProjectSymbolMetadata(OPERATION, history()) }), targetId: "symbol", created: false });

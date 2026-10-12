// These coordinator tests enforce the current refusal boundary. The former
// Execute/late-failure cases remain in Git history, not as enabled lifecycle
// Claims. Pure planner, expression and effect suites remain separate.
import { prepareProjectSymbolCreate } from "../src/project-symbol-create.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { sha256Json } from "../src/core.ts";
import type { ExpectedContext } from "../src/engine.ts";
import { registerStructureTransactionTests } from "./library-structure-transaction-fixture.ts";

type Value = Record<string, unknown>;
const CREATED = "c".repeat(16), HASH = "a".repeat(64);
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" },
  document: { uuid: "active", documentType: 3, tabId: "active@project", parentProjectUuid: "project" } };
const OPERATION = { id: "create-empty-symbol", action: "library.symbol.create", libraryUuid: "project", name: "Empty symbol", symbolType: 2, description: "Fixture" };
function history(created = false, peerChanged = false, extra = false, unsupported = false): NativeHistorySnapshot {
  const ids = ["active", "symbol", ...(created ? [CREATED] : []), ...(extra ? ["f".repeat(16)] : []), ...(unsupported ? ["instance"] : [])];
  const documents = ids.map((uuid) => {
    const docType = { active: "PCB", instance: "INSTANCE" }[uuid] ?? "SYMBOL";
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2" };
    const body: Value = uuid === "active" ? { title: peerChanged ? "Changed" : "PCB", source: "" }
      : { title: uuid === "symbol" ? "Existing" : OPERATION.name, description: uuid === "symbol" ? "Original" : OPERATION.description, docType: 2, source: "", tags: [] };
    const records = [{ id: "META", type: "META", body, ticket: 1, client: null }];
    return { uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata, records: records.map(({ id, type, body: content }) => ({ id, type, body: content })) }) };
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

registerStructureTransactionTests({ operation: OPERATION, context: CONTEXT, preparationPhase: "symbol-create-prepared",
  prepare: () => ({ symbolCreatePlan: prepareProjectSymbolCreate(OPERATION, history(), CONTEXT) }), targetId: CREATED, created: true });

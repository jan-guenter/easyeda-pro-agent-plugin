import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { compareGeneratedFixtureClosedSources } from "../src/managed-fixture-closed-snapshot.ts";
import { generateManagedFixtureArchiveData } from "../src/managed-fixture-generator.ts";
import { readManagedLibraryZip } from "../src/managed-library-files-zip.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";

const row = z.object({ header: z.object({ type: z.string(), id: z.string().optional() }), body: z.record(z.string(), z.unknown()) });
function fixture(): { archive: Buffer; history: NativeHistorySnapshot } {
  const generated = generateManagedFixtureArchiveData("line-and-via"); const source = readManagedLibraryZip(generated.bytes).get("Fixture.epru"); assert.ok(source !== undefined);
  const records = source.toString("utf8").slice(0, -2).split("|\n").map((text) => {
    const position = text.indexOf("||"); return row.parse({ header: JSON.parse(text.slice(0, position)) as unknown, body: JSON.parse(text.slice(position + 2)) as unknown });
  });
  const head = records[0], meta = records[1]; assert.ok(head !== undefined && meta !== undefined);
  return { archive: generated.bytes, history: { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "1".repeat(64), branchUuid: "2".repeat(32),
    headHistoryUuid: "3".repeat(32), checkpointSha256: "4".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: source.length,
    semanticSha256: "5".repeat(64), documents: [{ uuid: String(head.body["uuid"]), docType: "PCB", metadata: head.body, semanticSha256: "6".repeat(64),
      records: records.slice(1).map((entry) => ({ id: String(entry.header.id), type: entry.header.type, body: entry.body, ticket: 1, client: null })) }] } };
}
void test("closed generated source comparison binds every document and body/ID while leaving clocks, SQL and registration unaccepted", () => {
  const value = fixture(); const result = compareGeneratedFixtureClosedSources(value.archive, value.history);
  assert.equal(result["completeDocumentAndBodyRosterMatched"], true);
  for (const field of ["docHeadClocksAccepted", "uploadTicketsAccepted", "completeSqlEffectsAccepted", "registrationVerified", "importedFixtureAccepted", "designExecutionAuthorized"]) { assert.equal(result[field], false); }
  const original = value.history.documents[0]; assert.ok(original !== undefined);
  for (const documents of [[...value.history.documents, { ...original, uuid: "7".repeat(32) }],
    [{ ...original, metadata: { ...original.metadata, title: "unexpected" } }],
    [{ ...original, records: original.records.map((record, index) => index === 0 ? { id: record.id, type: record.type, ticket: record.ticket, client: record.client, body: { ...record.body, centerX: 99 } } : record) }]]) {
    assert.equal(compareGeneratedFixtureClosedSources(value.archive, { ...value.history, documents })["completeDocumentAndBodyRosterMatched"], false);
  }
});

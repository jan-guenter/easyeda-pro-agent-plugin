/** Synthetic data relation only. No native owner, worker origin, clock/body
 * issuer, SQL continuation or persistence authority is constructed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGeneratedSchematicDisplayPendingSaveDelta, compareGeneratedSchematicDisplaySaveDelta } from "../src/generated-schematic-display-save-delta.ts";
import { prepareGeneratedSchematicDisplayBodyPlan } from "../src/generated-schematic-display-source.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "../src/generated-schematic-display-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import type { GeneratedSchematicDisplayPendingSaveBodyValue, GeneratedSchematicDisplaySaveBodyValue } from "../src/generated-schematic-display-save-delta.ts";

function record(id: string, type: string, ticket: number, body: Record<string, unknown>): NativeHistorySnapshot["documents"][number]["records"][number] {
  return { id, type, ticket, client: "7".repeat(16), body };
}
function fixture(): Readonly<{ argumentsValue: GeneratedSchematicDisplayNativeArguments; history: NativeHistorySnapshot; value: GeneratedSchematicDisplaySaveBodyValue }> {
  const body = prepareGeneratedSchematicDisplayBodyPlan({ x: 10 }); const pageUuid = "2".repeat(32), schematicUuid = "1".repeat(32), textId = `0${"3".repeat(15)}`;
  const argumentsValue: GeneratedSchematicDisplayNativeArguments = { target: { rawWindowsPath: "C:\\Synthetic\\fixture.eprj2", projectUuid: "4".repeat(64),
    branchUuid: "5".repeat(32), schematicUuid, pageUuid, expectedSourceSha256: "6".repeat(64) }, operation: { operationId: "sch209-display-delta-test", textId,
    beforeBody: body.nativeBeforeBody, afterBody: body.nativeAfterBody, peers: [] } };
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: argumentsValue.target.projectUuid,
    branchUuid: argumentsValue.target.branchUuid, headHistoryUuid: "8".repeat(32), checkpointSha256: "9".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1024,
    semanticSha256: "a".repeat(64), documents: [{ uuid: schematicUuid, docType: "SCH", metadata: {}, semanticSha256: "b".repeat(64), records: [record("META", "META", 1, {})] },
      { uuid: pageUuid, docType: "SCH_PAGE", metadata: {}, semanticSha256: "c".repeat(64), records: [record("META", "META", 1, { schematic: schematicUuid }), record(textId, "TEXT", 2, {}),
        ...[3, 4, 5, 6].map(ticket => record(`0${String(ticket + 1).repeat(15)}`, ticket % 2 === 0 ? "LINE" : "WIRE", ticket, {}))] }] };
  const value: GeneratedSchematicDisplaySaveBodyValue = { documentUuid: pageUuid, projectUuid: argumentsValue.target.projectUuid, uniqueId: "original-unique-id", client: "7".repeat(16), clock: 1_800_000_000_000,
    headTicket: 20, body: "", userUndefined: true, userJson: null };
  const head = { docType: "SCH_PAGE", client: value.client, uuid: pageUuid, updateTime: value.clock, version: String(value.clock), editVersion: "3.2.209-observed" };
  value.body = `${JSON.stringify({ type: "DOCHEAD", ticket: value.headTicket })}||${JSON.stringify(head)}|\n${JSON.stringify({ type: "TEXT", ticket: 13, id: textId })}||${JSON.stringify(body.nativeAfterBody)}`;
  return { argumentsValue, history, value };
}
void test("exact SCH Text Save relation retains observed ticket gaps and worker version without granting original provenance", () => {
  const input = fixture(); const delta = compareGeneratedSchematicDisplaySaveDelta(input.argumentsValue, input.history, "3.2.209-observed", input.value);
  assert.equal(delta.textTicket, 13); assert.equal(delta.headTicket, 20); assert.equal(delta.exactSoleTextBodyVerified, true);
  assert.equal(delta.originalClockProvenanceVerified, false); assert.equal(delta.originalEffectProvenanceVerified, false); assert.equal(delta.selectedSqlAuthorized, false); assert.equal(delta.persistenceVerified, false);
  assert.throws(() => compareGeneratedSchematicDisplaySaveDelta(input.argumentsValue, input.history, "3.2.149.88089769", input.value));
});
void test("unexpected pending records, stale tickets, duplicate keys and altered literal Text refuse", () => {
  const input = fixture(); const compare = (body: string): void => { compareGeneratedSchematicDisplaySaveDelta(input.argumentsValue, input.history, "3.2.209-observed", { ...input.value, body }); };
  assert.throws(() => { compare(`${input.value.body}|\n${JSON.stringify({ type: "META", ticket: 14, id: "META" })}||{}`); });
  assert.throws(() => { compare(input.value.body.replace('"ticket":13', '"ticket":6')); });
  assert.throws(() => { compare(input.value.body.replace('"ticket":13', '"ticket":20')); });
  assert.throws(() => { compare(input.value.body.replace('"type":"TEXT"', '"type":"WIRE"')); });
  assert.throws(() => { compare(input.value.body.replace('"type":"TEXT"', '"type":"WIRE","type":"TEXT"')); });
  assert.throws(() => { compare(input.value.body.replace("Disposable schematic fixture", "Different literal")); });
  assert.throws(() => { compare(`${input.value.body}|\n`); });
});
function pendingFixture(): ReturnType<typeof fixture> & { pendingValue: GeneratedSchematicDisplayPendingSaveBodyValue } {
  const input = fixture(), value = input.value;
  const pendingValue: GeneratedSchematicDisplayPendingSaveBodyValue = { ...value, schema: "private.generated-schematic-display-save-body-value.v2",
    pending: { maximumTicket: 19, primitiveId: input.argumentsValue.operation.textId, ticket: 13, client: value.client, dataType: "TEXT",
      data: JSON.stringify(input.argumentsValue.operation.afterBody), canvasUuid: value.documentUuid, workerEditVersion: null, priorVersion: "retained-prior-version",
      priorUserUndefined: false, priorUserJson: '{"nickname":"N","uuid":"original-actor","username":"U"}' },
    userUndefined: false, userJson: '{"nickname":"N","uuid":"original-actor","username":"U"}' };
  const head = { docType: "SCH_PAGE", client: value.client, uuid: value.documentUuid, updateTime: value.clock, version: String(value.clock),
    user: { nickname: "N", uuid: "original-actor", username: "U" } };
  pendingValue.body = `${JSON.stringify({ type: "DOCHEAD", ticket: 20 })}||${JSON.stringify(head)}|\n${JSON.stringify({ type: "TEXT", ticket: 13, id: pendingValue.pending.primitiveId })}||${pendingValue.pending.data}`;
  return { ...input, pendingValue };
}
void test("v2 matches actual pending tickets, absent worker version and effective prior user in original key order", () => {
  const input = pendingFixture(); const delta = compareGeneratedSchematicDisplayPendingSaveDelta(input.argumentsValue, input.history, input.pendingValue);
  assert.equal(delta.schema, "private.generated-schematic-display-save-delta.v2"); assert.equal(delta.textTicket, 13); assert.equal(delta.maximumTicketBeforeSave, 19);
  assert.equal(delta.workerEditVersion, null); assert.equal(delta.actualPendingDataMatched, true); assert.equal(delta.originalPendingNodeProvenanceVerified, false);
  assert.equal(delta.selectedSqlAuthorized, false); assert.equal(delta.persistenceVerified, false);
});
void test("v2 refuses a borrowed pending document, altered data/ticket and reordered effective actor", () => {
  const input = pendingFixture(); const compare = (value: GeneratedSchematicDisplayPendingSaveBodyValue): void => { compareGeneratedSchematicDisplayPendingSaveDelta(input.argumentsValue, input.history, value); };
  assert.throws(() => { compare({ ...input.pendingValue, pending: { ...input.pendingValue.pending, canvasUuid: input.argumentsValue.target.schematicUuid } }); });
  assert.throws(() => { compare({ ...input.pendingValue, pending: { ...input.pendingValue.pending, ticket: 12 } }); });
  assert.throws(() => { compare({ ...input.pendingValue, pending: { ...input.pendingValue.pending, maximumTicket: 20 } }); });
  assert.throws(() => { compare({ ...input.pendingValue, pending: { ...input.pendingValue.pending, data: input.pendingValue.pending.data.replace('"x":10', '"x":11') } }); });
  assert.throws(() => { compare({ ...input.pendingValue, userJson: '{"uuid":"original-actor","username":"U","nickname":"N"}' }); });
});

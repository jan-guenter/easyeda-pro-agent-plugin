/** Exact three-node data relation, without worker, clock, Save or SQL
 * ownership. The historical LINE-only comparator remains unchanged. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGeneratedSchematicWireGroupPendingSaveDelta as compare, generatedSchematicWireGroupPendingSaveBodyValueSchema as schema } from "../src/generated-schematic-wire-group-save-delta.ts";
import type { GeneratedSchematicWireGroupPendingSaveBodyValue as Value } from "../src/generated-schematic-wire-group-save-delta.ts";
import { compareGeneratedSchematicWirePendingSaveDelta as oldCompare, generatedSchematicWirePendingSaveBodyValueSchema as oldSchema } from "../src/generated-schematic-wire-save-delta.ts";
import { currentProjectCanvasPendingValueSchema as shared } from "../src/current-project-canvas-pending-value.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { wireData } from "./generated-schematic-wire-edit-fixture.ts";

function body(value: Value): string {
  const first = value.pending[0]; assert.ok(first !== undefined); const user: unknown = value.userJson === null ? undefined : JSON.parse(value.userJson);
  const head = { docType: "SCH_PAGE", client: value.client, uuid: value.documentUuid, updateTime: value.clock, version: String(value.clock),
    ...(first.workerEditVersion === null || first.workerEditVersion === "" ? {} : { editVersion: first.workerEditVersion }), ...(user === undefined ? {} : { user }) };
  return [`${JSON.stringify({ type: "DOCHEAD", ticket: value.headTicket })}||${JSON.stringify(head)}`, ...value.pending.map(node => `${JSON.stringify({ type: node.dataType, ticket: node.ticket, id: node.primitiveId })}||${node.data}`)].join("|\n");
}
function fixture(rawUser: string | null = null): Readonly<{ args: ReturnType<typeof wireData>["args"]; history: ReturnType<typeof data>["history"]; value: Value }> {
  const { args } = wireData(), { history } = data(); const page = history.documents.find(document => document.uuid === args.target.pageUuid); assert.ok(page !== undefined);
  const wire = page.records.find(row => row.type === "WIRE" && row.id === args.operation.wireId); const line = page.records.find(row => row.type === "LINE" && row.id === args.operation.lineId); const attr = page.records.find(row => row.type === "ATTR" && row.body["parentId"] === args.operation.wireId);
  assert.ok(wire !== undefined && line !== undefined && attr !== undefined);
  const selected = [[attr, "ATTR"], [wire, "WIRE"], [line, "LINE"]] as const;
  const pending: Value["pending"] = selected.map(([row, type], index) => ({ maximumTicket: 26, primitiveId: row.id, ticket: 20 + index * 2, client: "client", dataType: type, data: JSON.stringify(type === "LINE" ? args.operation.afterBody : row.body), canvasUuid: args.target.pageUuid, workerEditVersion: "wire-worker", priorVersion: "prior", priorUserUndefined: true, priorUserJson: null }));
  const value: Value = { schema: "private.generated-schematic-wire-group-save-body-value.v1", documentUuid: args.target.pageUuid, projectUuid: args.target.projectUuid, uniqueId: "unique", client: "client", clock: 1_800_000_000_000, headTicket: 27, body: "", userUndefined: rawUser === null, userJson: rawUser, pending };
  value.body = body(value); return { args, history, value };
}
void test("separate GROUP delta matches actual traversal order, LINE geometry and complete unchanged WIRE/ATTR bodies", () => {
  const { args, history, value } = fixture('{"nickname":"Native actor","uuid":"actor","username":"native"}'); const delta = compare(args, history, value);
  assert.equal(delta.wireTicket, 22); assert.equal(delta.lineTicket, 24); assert.equal(delta.attributeTicket, 20); assert.equal(delta.headTicket, 27); assert.equal(delta.exactThreePendingBodiesMatched, true); assert.equal(delta.republishedPeerBodiesPreserved, true);
  assert.equal(delta.originalGroupUploadJoined, false); assert.equal(delta.originalPendingNodeProvenanceVerified, false); assert.equal(delta.selectedSqlAuthorized, false); assert.equal(delta.persistenceVerified, false);
  assert.deepEqual(delta.orderedIds, value.pending.map(node => node.primitiveId));
  assert.equal(oldSchema.safeParse(value).success, false); for (const node of value.pending) { assert.equal(shared.safeParse(node).success, false); }
  const line = value.pending.find(node => node.dataType === "LINE"); assert.ok(line !== undefined);
  assert.throws(() => oldCompare(args, history, { ...value, schema: "private.generated-schematic-wire-save-body-value.v1", pending: line }), /EXACT_TWO_ROWS/u);
});
void test("GROUP delta refuses duplicates, extra records, clock/context drift and every changed peer field", () => {
  const { args, history, value } = fixture();
  for (const mutation of [
    (candidate: Value): void => { const first = candidate.pending[0], second = candidate.pending[1]; assert.ok(first !== undefined && second !== undefined); second.ticket = first.ticket; },
    (candidate: Value): void => { const first = candidate.pending[0]; assert.ok(first !== undefined); first.maximumTicket += 1; },
    (candidate: Value): void => { candidate.pending.reverse(); },
    (candidate: Value): void => { const first = candidate.pending[0]; assert.ok(first !== undefined); first.canvasUuid = "foreign"; },
    (candidate: Value): void => { const first = candidate.pending[0]; assert.ok(first !== undefined); first.client = "foreign"; },
    (candidate: Value): void => { const first = candidate.pending[0]; assert.ok(first !== undefined); first.data = '{"key":"Relevance","value":"changed"}'; candidate.body = body(candidate); },
    (candidate: Value): void => { const row = candidate.pending.find(node => node.dataType === "WIRE"); assert.ok(row !== undefined); row.data = '{"type":"wire","unknown":"changed"}'; candidate.body = body(candidate); },
    (candidate: Value): void => { const row = candidate.pending.find(node => node.dataType === "LINE"); assert.ok(row !== undefined); row.data = JSON.stringify(args.operation.beforeBody); candidate.body = body(candidate); },
  ]) { const candidate = structuredClone(value); mutation(candidate); assert.throws(() => compare(args, history, candidate)); }
  assert.equal(schema.safeParse({ ...value, pending: [...value.pending, value.pending[0]] }).success, false);
  assert.throws(() => compare(args, history, { ...value, body: `${value.body}|\n{"type":"META","ticket":28,"id":"META"}||{}` }));
  const enriched = structuredClone(history); const page = enriched.documents.find(document => document.uuid === args.target.pageUuid); const attr = page?.records.find(row => row.type === "ATTR" && row.body["parentId"] === args.operation.wireId); assert.ok(attr !== undefined); attr.body["unknownPreserved"] = "retained";
  assert.throws(() => compare(args, enriched, value), /UNCHANGED_RELEVANCE_BODY/u);
});
void test("GROUP delta retains the actual raw actor field order", () => {
  const { args, history, value } = fixture('{"nickname":"Native actor","uuid":"actor","username":"native"}');
  assert.throws(() => compare(args, history, { ...value, userJson: '{"uuid":"actor","username":"native","nickname":"Native actor"}' }), /RAW_BODY/u);
});

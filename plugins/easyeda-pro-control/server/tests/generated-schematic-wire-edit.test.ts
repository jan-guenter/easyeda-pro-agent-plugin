/** Pure geometry/full-record proof and the genuine checkpoint's refusal seam.
 * Synthetic source packets supply no native or saved-content authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGeneratedSchematicWireEditEffect } from "../src/generated-schematic-wire-edit-effect.ts";
import { buildGeneratedSchematicWireEditNativeArguments, generatedSchematicWireEditRequestSchema } from "../src/generated-schematic-wire-edit.ts";
import { compareGeneratedSchematicWirePendingSaveDelta, generatedSchematicWirePendingSaveBodyValueSchema } from "../src/generated-schematic-wire-save-delta.ts";
import { currentProjectCanvasPendingValueSchema } from "../src/current-project-canvas-pending-value.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { wireData as fixture } from "./generated-schematic-wire-edit-fixture.ts";

void test("single wire projection uses public Y and refuses ambiguous geometry or contact with BUS", () => {
  const value = fixture(); assert.equal(value.args.operation.afterBody["startY"], -30); assert.equal(value.args.operation.afterBody["endY"], -30);
  for (const line of [[0, 0, 0, 0], [0, 0, 10, 10], [0, -100, 100, -100], [0, -80, 100, -80], [0, 0, 100, 0], [-0, 0, 50, 0]]) {
    assert.equal(generatedSchematicWireEditRequestSchema.safeParse({ operationId: "sch209-wire-edit-pure-test", line }).success, false);
  }
  let touched = false;
  const fake = { get history(): never { touched = true; throw new Error("untrusted getter"); } };
  assert.throws(() => Reflect.apply(buildGeneratedSchematicWireEditNativeArguments, undefined, [fake, {}])); assert.equal(touched, false);
});
void test("complete seven-row wire proof preserves peers, root order, unknown headers and Relevance", () => {
  const { args, before, after } = fixture(); const effect = compareGeneratedSchematicWireEditEffect(args, before, after, after);
  assert.equal(effect.exactLineGeometryVerified, true); assert.equal(effect.persistenceVerified, false); assert.equal(effect.nativeInvocationVerified, false); assert.equal(effect.connectivityVerified, false);
  assert.throws(() => compareGeneratedSchematicWireEditEffect(args, before, after, after.replace('"key":"Relevance"', '"key":"Other"')), /PEER_CHANGED/u);
  assert.throws(() => compareGeneratedSchematicWireEditEffect(args, before, after, after.replace('"endX":120', '"endX":121')), /EXACT_LINE_BODY/u);
  assert.throws(() => compareGeneratedSchematicWireEditEffect(args, before, after, after.replace('"ticket":1', '"ticket":99')), /BOOKKEEPING_CHANGED/u);
  assert.throws(() => compareGeneratedSchematicWireEditEffect(args, before, after, after.replace('"zIndex":0', '"zIndex":2')), /ROOT_ROSTER/u);
});
void test("separate pending LINE delta refuses a peer append and leaves the shared pending grammar closed", () => {
  const { args } = fixture(); const { history } = data(); const { lineId: targetId } = args.operation;
  const node = { maximumTicket: 19, primitiveId: targetId, ticket: 13, client: "client", dataType: "LINE", data: JSON.stringify(args.operation.afterBody),
    canvasUuid: args.target.pageUuid, workerEditVersion: null, priorVersion: "prior", priorUserUndefined: true, priorUserJson: null };
  const value = { schema: "private.generated-schematic-wire-save-body-value.v1", documentUuid: args.target.pageUuid, projectUuid: args.target.projectUuid,
    uniqueId: "unique", client: "client", clock: 1_800_000_000_000, headTicket: 20, body: "", userUndefined: true, userJson: null, pending: node };
  value.body = `${JSON.stringify({ type: "DOCHEAD", ticket: 20 })}||${JSON.stringify({ docType: "SCH_PAGE", client: value.client, uuid: value.documentUuid, updateTime: value.clock, version: String(value.clock) })}|\n${JSON.stringify({ type: "LINE", ticket: 13, id: targetId })}||${node.data}`;
  const delta = compareGeneratedSchematicWirePendingSaveDelta(args, history, value); assert.equal(delta.lineTicket, 13); assert.equal(delta.selectedSqlAuthorized, false);
  assert.equal(currentProjectCanvasPendingValueSchema.safeParse(node).success, false);
  assert.equal(generatedSchematicWirePendingSaveBodyValueSchema.safeParse({ ...value, pending: { ...node, dataType: "TEXT" } }).success, false);
  assert.throws(() => compareGeneratedSchematicWirePendingSaveDelta(args, history, { ...value, body: `${value.body}|\n${JSON.stringify({ type: "ATTR", ticket: 14, id: "peer" })}||{}` }));
  assert.throws(() => compareGeneratedSchematicWirePendingSaveDelta(args, history, { ...value, pending: { ...node, data: JSON.stringify(args.operation.beforeBody) } }));
});

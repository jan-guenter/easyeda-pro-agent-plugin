/** Inert actual-pending data relation only, no worker/clock/SQL authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGeneratedSchematicRelevanceDisplayEffect } from "../src/generated-schematic-relevance-display-effect-data.ts";
import { compareGeneratedSchematicRelevanceDisplayPendingSaveDelta, generatedSchematicRelevanceDisplayPendingSaveBodyValueSchema } from "../src/generated-schematic-relevance-display-save-delta.ts";
import type { GeneratedSchematicRelevanceDisplayPendingSaveBodyValue } from "../src/generated-schematic-relevance-display-save-delta.ts";
import { data, textId } from "./generated-schematic-relevance-display-fixture.ts";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";

void test("new pending body uses the retained native Text index, actual ticket/version and original user order", async () => {
  const vm = fixture(), { args, history } = data(); await vm.call("capture"); const before = await vm.call("preflight"); const modified = await vm.call("modify"); const observed = await vm.call("observe"); const effect = compareGeneratedSchematicRelevanceDisplayEffect(args, before, modified, observed);
  const value: GeneratedSchematicRelevanceDisplayPendingSaveBodyValue = { schema: "private.generated-schematic-relevance-display-save-body-value.v1", documentUuid: args.target.pageUuid, projectUuid: args.target.projectUuid, uniqueId: "unique", client: "client", clock: 1_800_000_000_000, headTicket: 20, body: "", userUndefined: false, userJson: '{"nickname":"N","uuid":"actor","username":"U"}', pending: { maximumTicket: 19, primitiveId: textId, ticket: 13, client: "client", dataType: "TEXT", data: JSON.stringify({ ...args.operation.afterBody, zIndex: 1 }), canvasUuid: args.target.pageUuid, workerEditVersion: null, priorVersion: "prior", priorUserUndefined: false, priorUserJson: '{"nickname":"N","uuid":"actor","username":"U"}' } };
  value.body = `${JSON.stringify({ type: "DOCHEAD", ticket: 20 })}||${JSON.stringify({ docType: "SCH_PAGE", client: value.client, uuid: value.documentUuid, updateTime: value.clock, version: String(value.clock), user: { nickname: "N", uuid: "actor", username: "U" } })}|\n${JSON.stringify({ type: "TEXT", ticket: 13, id: textId })}||${value.pending.data}`;
  const delta = compareGeneratedSchematicRelevanceDisplayPendingSaveDelta(args, history, effect, value); assert.equal(delta.normalizedTextZIndex, 1); assert.equal(delta.workerEditVersion, null); assert.equal(delta.selectedSqlAuthorized, false);
  assert.throws(() => compareGeneratedSchematicRelevanceDisplayPendingSaveDelta(args, history, effect, { ...value, pending: { ...value.pending, data: JSON.stringify(args.operation.afterBody) } }));
  assert.throws(() => compareGeneratedSchematicRelevanceDisplayPendingSaveDelta(args, history, effect, { ...value, userJson: '{"uuid":"actor","username":"U","nickname":"N"}' }));
  assert.equal(generatedSchematicRelevanceDisplayPendingSaveBodyValueSchema.safeParse({ ...value, schema: "private.generated-schematic-display-save-body-value.v2" }).success, false);
});

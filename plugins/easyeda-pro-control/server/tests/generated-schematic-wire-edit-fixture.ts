/** Synthetic complete source data only; no checkpoint or original owner. */
import assert from "node:assert/strict";
import { projectGeneratedSchematicWireEditBody } from "../src/generated-schematic-wire-edit.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "../src/generated-schematic-wire-edit.ts";
import { data, textId } from "./generated-schematic-relevance-display-fixture.ts";

export function wireData(): Readonly<{ args: GeneratedSchematicWireEditNativeArguments; before: string; after: string }> {
  const original = data().args, wireId = original.operation.peers.find(row => row.type === "WIRE")?.id;
  assert.ok(wireId !== undefined); const lineId = original.operation.peers.find(row => row.type === "LINE" && row.body["lineGroup"] === wireId)?.id;
  assert.ok(lineId !== undefined); const plan = projectGeneratedSchematicWireEditBody(wireId, { operationId: "sch209-wire-edit-pure-test", line: [20, 30, 120, 30] });
  const text: GeneratedSchematicWireEditNativeArguments["operation"]["peers"][number] = { id: textId, type: "TEXT", body: original.operation.beforeBody };
  const peers = [...original.operation.peers.filter(row => row.id !== lineId).map(row => {
    if (row.type !== "ATTR") { return row; } const body = structuredClone(row.body); Object.defineProperty(body, "zIndex", { value: 3, enumerable: true, writable: true, configurable: true });
    return { id: row.id, type: row.type, body };
  }), text].toSorted((left, right) => left.id.localeCompare(right.id));
  const args: GeneratedSchematicWireEditNativeArguments = { schema: "private.generated-schematic-wire-edit-args.v1", target: original.target,
    operation: { operationId: plan.request.operationId, wireId, lineId, rootIds: original.operation.rootIds, beforeBody: plan.beforeBody, afterBody: plan.afterBody, peers } };
  const source = (body: Readonly<Record<string, unknown>>): string => {
    const rows = [{ id: lineId, type: "LINE", body }];
    for (const row of peers) { rows.push({ ...row, body: args.operation.rootIds.includes(row.id) ? { ...row.body, zIndex: args.operation.rootIds.indexOf(row.id) } : row.body }); }
    return `${JSON.stringify({ type: "DOCHEAD" })}||${JSON.stringify({ uuid: args.target.pageUuid, docType: "SCH_PAGE" })}|\n${rows.map((row, index) => `${JSON.stringify({ type: row.type, id: row.id, ticket: index + 1 })}||${JSON.stringify(row.body)}|\n`).join("")}`;
  };
  return { args, before: source(plan.beforeBody), after: source(plan.afterBody) };
}

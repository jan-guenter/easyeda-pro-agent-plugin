/** One existing LINE in the generated Relevance fixture. These arguments are
 * data only; they cannot select a project or issue an editing capability. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import { MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE } from "./managed-schematic-fixture-generator.ts";
import { projectGeneratedSchematicInitialNativeTextBody } from "./generated-schematic-display-source.ts";
import { projectGeneratedSchematicRelevanceNativeAttributeBody } from "./generated-schematic-relevance-display-source.ts";

const coordinate = z.number().min(-10_000).max(10_000).refine(value => !Object.is(value, -0));
export const generatedSchematicWireEditRequestSchema = z.strictObject({
  operationId: z.string().min(20).max(80).regex(/^sch209-wire-edit-[a-z\d][a-z\d-]*$(?![\s\S])/u),
  line: z.tuple([coordinate, coordinate, coordinate, coordinate]),
}).superRefine(({ line }, context) => {
  const [x1, y1, x2, y2] = line;
  if ((x1 === x2) === (y1 === y2)) { context.addIssue({ code: "custom", path: ["line"], message: "One nonzero cardinal segment is required." }); }
  // The fixed peer BUS occupies native (0,100)..(100,100). Keep a twenty-unit
  // Gap includes endpoints; the profile has no bus-entry or junction editor.
  const left = Math.min(x1, x2); const right = Math.max(x1, x2); const top = Math.min(-y1, -y2); const bottom = Math.max(-y1, -y2);
  if (!(right < -20 || left > 120 || bottom < 80 || top > 120)) {
    context.addIssue({ code: "custom", path: ["line"], message: "The segment must remain separate from the fixed peer BUS." });
  }
  if (x1 === 0 && y1 === 0 && x2 === 100 && y2 === 0) {
    context.addIssue({ code: "custom", path: ["line"], message: "The segment must change its literal geometry." });
  }
});
export type GeneratedSchematicWireEditRequest = z.infer<typeof generatedSchematicWireEditRequestSchema>;
type Body = Readonly<Record<string, unknown>>;
type Peer = Readonly<{ id: string; type: "CANVAS" | "TEXT" | "WIRE" | "LINE" | "BUS" | "ATTR"; body: Body }>;
export interface GeneratedSchematicWireEditNativeArguments {
  readonly schema: "private.generated-schematic-wire-edit-args.v1";
  readonly target: GeneratedSchematicRelevanceFixtureOpenCheckpoint["qualification"]["target"];
  readonly operation: Readonly<{ operationId: string; wireId: string; lineId: string; rootIds: readonly string[];
    beforeBody: Body; afterBody: Body; peers: readonly Peer[] }>;
}
const originals = new WeakMap<GeneratedSchematicWireEditNativeArguments, Readonly<{ prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint; text: string }>>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCH209_WIRE_EDIT_${code}`); } }
/** Public API Y is opposite native source Y. Only four coordinates change;
 * styles, IDs, parent and every other body field remain explicit and exact. */
export function projectGeneratedSchematicWireEditBody(wireId: string, input: unknown): Readonly<{ request: GeneratedSchematicWireEditRequest; beforeBody: Body; afterBody: Body }> {
  need(/^0[a-f\d]{15}$(?![\s\S])/u.test(wireId), "WIRE_ID");
  const request = generatedSchematicWireEditRequestSchema.parse(input);
  const [startX, y1, endX, y2] = request.line;
  const beforeBody = { ...MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE, lineGroup: wireId };
  const afterBody = { ...beforeBody, startX, startY: y1 === 0 ? 0 : -y1, endX, endY: y2 === 0 ? 0 : -y2 };
  need(canonicalJson(beforeBody) !== canonicalJson(afterBody), "NO_CHANGE");
  return freezeDeep({ request, beforeBody, afterBody });
}
/** Require the actual original generated checkpoint before accessing history.
 * No supplied path, primitive ID, history JSON or caller verifier is accepted. */
export function buildGeneratedSchematicWireEditNativeArguments(prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint, input: unknown): GeneratedSchematicWireEditNativeArguments {
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
  const target = prepared.qualification.target;
  const page = prepared.history.documents.find(document => document.uuid === target.pageUuid && document.docType === "SCH_PAGE"); need(page !== undefined, "PAGE");
  const wires = page.records.filter(row => row.type === "WIRE"); const wire = wires[0]; need(wires.length === 1 && wire !== undefined, "WIRE_ROSTER");
  const lines = page.records.filter(row => row.type === "LINE" && row.body["lineGroup"] === wire.id); const line = lines[0];
  need(lines.length === 1 && line !== undefined && page.records.length === 7, "LINE_ROSTER");
  const plan = projectGeneratedSchematicWireEditBody(wire.id, input);
  need(canonicalJson(line.body) === canonicalJson(plan.beforeBody), "INITIAL_LINE_BODY");
  const peers: Peer[] = [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }], rootIds: string[] = [];
  for (const row of page.records.filter(record => record.id !== "META" && record.id !== line.id)) {
    need(row.type === "TEXT" || row.type === "WIRE" || row.type === "BUS" || row.type === "LINE" || row.type === "ATTR", "PEER_TYPE");
    let body = structuredClone(row.body);
    if (row.type === "TEXT") { body = { ...projectGeneratedSchematicInitialNativeTextBody(body) }; }
    // The original archive stores index1. NetPointManager.init creates the two
    // Isolated endpoint dots; the source-pinned category sort places ATTR at3.
    // This is a fixed native baseline, not an arbitrary observed peer value.
    else if (row.type === "ATTR") { body = { ...projectGeneratedSchematicRelevanceNativeAttributeBody(body, wire.id), zIndex: 3 }; }
    if (row.type === "TEXT" || row.type === "WIRE" || row.type === "BUS") {
      need(body["zIndex"] === null, "INITIAL_ROOT_INDEX"); rootIds.push(row.id);
      const { groupId: _group, zIndex: _index, ...rest } = body; body = rest;
    }
    peers.push({ id: row.id, type: row.type, body });
  }
  need(peers.length === 6 && rootIds.length === 3 && new Set(peers.map(row => row.id)).size === 6 &&
    peers.filter(row => row.type === "ATTR").length === 1 && peers.filter(row => row.type === "BUS").length === 1 &&
    peers.filter(row => row.type === "TEXT").length === 1 && peers.filter(row => row.type === "LINE").length === 1, "COMPLETE_PEERS");
  const result: GeneratedSchematicWireEditNativeArguments = freezeDeep({ schema: "private.generated-schematic-wire-edit-args.v1", target: structuredClone(target),
    operation: { operationId: plan.request.operationId, wireId: wire.id, lineId: line.id, rootIds: rootIds.toSorted(), beforeBody: plan.beforeBody,
      afterBody: plan.afterBody, peers: peers.toSorted((left, right) => left.id.localeCompare(right.id)) } });
  originals.set(result, Object.freeze({ prepared, text: canonicalJson(result) })); return result;
}
export function requireOriginalGeneratedSchematicWireEditNativeArguments(args: GeneratedSchematicWireEditNativeArguments, prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint): void {
  const original = originals.get(args); need(original !== undefined && original.prepared === prepared && original.text === canonicalJson(args), "ORIGINAL_ARGUMENTS");
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
}

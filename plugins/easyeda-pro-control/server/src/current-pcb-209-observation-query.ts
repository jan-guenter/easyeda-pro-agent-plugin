/** Pure queries of a published observation. The lifecycle supplies and verifies
 * record provenance; this module has no live receiver, filesystem or clock. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_ROWS } from "./current-pcb-geometry.ts";
import { decodeCurrentPcb209PrimitivesReply } from "./current-pcb-209-primitives.ts";
import { decodeCurrentPcb209ExtendedPrimitivesReply } from "./current-pcb-209-extended-primitives.ts";
import { currentPcb209SelectionRelationsComponentIdsSchema, decodeCurrentPcb209SelectionRelationsReply } from "./current-pcb-209-selection-relations.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const text = (max: number): z.ZodString => z.string().max(max).check(context => {
  if (context.value.length > max || !context.value.isWellFormed()) {
    context.issues.push({ code: "custom", message: "Invalid bounded UTF-16 string.", input: context.value });
  }
});
const id = text(256).min(1);
const ids = z.array(id).min(1).max(CURRENT_PCB_GEOMETRY_MAX_ROWS).refine(value => new Set(value).size === value.length, "Duplicate requested IDs.");
const primitiveLock = z.boolean().optional();
const layer = z.number().int().min(0).max(65_535).refine(value => !Object.is(value, -0), "Negative zero is not a layer ID.").optional();
const net = text(1024).nullable().optional();
const locked = { primitiveLock };
const layered = { ...locked, layer };
const routed = { ...layered, net };
const componentWhere = z.object({ ...layered, designator: text(1024).optional() }).strict().optional();
const padWhere = z.object({ ...routed, padNumber: text(1024).optional(),
  padType: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional() }).strict().optional();
const attributeWhere = z.object({ ...layered, parentPrimitiveId: id.optional() }).strict().optional();
const familyBase = { kind: z.literal("family"), primitiveIds: ids.optional() };
const familyQuery = z.discriminatedUnion("family", [
  z.object({ ...familyBase, family: z.literal("Line"), where: z.object(routed).strict().optional() }).strict(),
  z.object({ ...familyBase, family: z.literal("Arc"), where: z.object(routed).strict().optional() }).strict(),
  z.object({ ...familyBase, family: z.literal("Via"), where: z.object({ ...locked, net }).strict().optional() }).strict(),
  z.object({ ...familyBase, family: z.literal("Component"), where: componentWhere }).strict(),
  z.object({ ...familyBase, family: z.literal("Pad"), where: padWhere }).strict(),
  z.object({ ...familyBase, family: z.literal("String"), where: z.object(layered).strict().optional() }).strict(),
  z.object({ ...familyBase, family: z.literal("Attribute"), where: attributeWhere }).strict(),
  z.object({ ...familyBase, family: z.literal("Dimension"), where: z.object(layered).strict().optional() }).strict(),
  z.object({ ...familyBase, family: z.literal("Image"), where: z.object(layered).strict().optional() }).strict(),
]);
export const currentPcb209ObservationQuerySchema = z.union([familyQuery,
  z.object({ kind: z.literal("selection") }).strict(), z.object({ kind: z.literal("component-pads"), componentId: id }).strict()]);
export const currentPcb209ObservationQueryStageSchema = z.enum(["primitives209", "extended-primitives209", "selection-relations209"]);
export const currentPcb209ObservationQueryProvenanceSchema = z.object({ operationId: z.string().max(80).regex(/^pcb209-[a-z0-9][a-z0-9_-]*$/u),
  stage: currentPcb209ObservationQueryStageSchema, resultRecordSha256: z.string().regex(/^[a-f\d]{64}$/u), observedAt: z.iso.datetime() }).strict();
const recordSchema = z.record(z.string(), z.unknown());
const recordsSchema = z.array(recordSchema).max(CURRENT_PCB_GEOMETRY_MAX_ROWS);
type RecordValue = z.infer<typeof recordSchema>;

function reconstruct(result: RecordValue, target: unknown, stage: z.infer<typeof currentPcb209ObservationQueryStageSchema>,
  originalComponentIds: unknown): Readonly<RecordValue> {
  const families = recordsSchema.parse(result["families"]);
  const observations = families.map(family => {
    const observation: RecordValue = { ok: true, kind: "current-pcb-geometry-observation", method: family["method"],
      target: result["target"], rows: family["rows"], samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false,
      persistenceVerified: false, sourceMembershipVerified: false };
    if (family["family"] === "Attribute") {
      Object.assign(observation, { attributeParentGroups: family["attributeParentGroups"],
        relationshipEvidence: family["relationshipEvidence"], reciprocalParentVerified: family["reciprocalParentVerified"] });
    }
    return observation;
  });
  const base = { ok: true, target: result["target"], observations };
  let packet: RecordValue;
  if (stage === "primitives209") { packet = { ...base, kind: "pcb209-original-primitives-observation" }; }
  else if (stage === "extended-primitives209") {
    packet = { ...base, kind: "pcb209-original-extended-primitives-observation", componentMetadataStates: result["componentMetadataStates"] };
  } else {
    // IDs come from the original published intent independently of this result.
    // An empty list is still explicit.
    currentPcb209SelectionRelationsComponentIdsSchema.parse(originalComponentIds);
    packet = { ...base, kind: "pcb209-original-selection-relations-observation", componentMetadataStates: result["componentMetadataStates"],
      selectedPrimitiveIds: result["selectedPrimitiveIds"], requestedComponentIds: result["requestedComponentIds"], componentPadGroups: result["componentPadGroups"] };
  }
  if (stage !== "selection-relations209" && originalComponentIds !== undefined) { throw new Error("PCB209_QUERY_UNEXPECTED_COMPONENT_INTENT"); }
  const reply = { result: { type: "string", value: JSON.stringify(packet) } };
  let decoded: Readonly<RecordValue>;
  if (stage === "primitives209") { decoded = decodeCurrentPcb209PrimitivesReply(reply, target); }
  else if (stage === "extended-primitives209") { decoded = decodeCurrentPcb209ExtendedPrimitivesReply(reply, target); }
  else { decoded = decodeCurrentPcb209SelectionRelationsReply(reply, target, originalComponentIds); }
  if (canonicalJson(decoded) !== canonicalJson(result)) { throw new Error("PCB209_QUERY_RECONSTRUCTION_MISMATCH"); }
  return decoded;
}

/** Provenance is supplied by the bounded journal reader, not authenticated here.
 * Reconstruction proves consistency with the reviewed decoder, never freshness. */
export function queryCurrentPcb209Observation(resultInput: unknown, targetInput: unknown, queryInput: unknown, provenanceInput: unknown,
  originalComponentIds?: unknown): Readonly<RecordValue> {
  const provenance = currentPcb209ObservationQueryProvenanceSchema.parse(provenanceInput);
  const query = currentPcb209ObservationQuerySchema.parse(queryInput), target = currentDisposableOpenSealedTargetSchema.parse(targetInput);
  if (Buffer.byteLength(canonicalJson(resultInput)) > CURRENT_PCB_GEOMETRY_MAX_BYTES) { throw new Error("PCB209_QUERY_SOURCE_BOUND"); }
  const source = reconstruct(recordSchema.parse(resultInput), target, provenance.stage, originalComponentIds);
  const families = recordsSchema.parse(source["families"]);
  const completeRows = families.flatMap(family => recordsSchema.parse(family["rows"]));
  let candidateRowCount: number, rows: RecordValue[];
  let includeAttributes = false, requestedIdCount: number | null = null;
  let componentPadGroups: RecordValue[] = [];
  const metadataIds = new Set<string>();
  if (query.kind === "family") {
    const family = families.find(value => value["family"] === query.family);
    if (family === undefined) { throw new Error("PCB209_QUERY_FAMILY_UNAVAILABLE"); }
    const observed = recordsSchema.parse(family["rows"]);
    const byId = new Map(observed.map(row => [row["primitiveId"], row]));
    candidateRowCount = observed.length;
    // Resolve every requested ID before filtering; missing rows always refuse.
    // A filter cannot conceal a missing or foreign-family exact ID.
    rows = query.primitiveIds === undefined ? observed : query.primitiveIds.map(primitiveId => {
      const row = byId.get(primitiveId); if (row === undefined) { throw new Error("PCB209_QUERY_ID_MISSING"); } return row;
    });
    requestedIdCount = query.primitiveIds?.length ?? null;
    if (query.where !== undefined) {
      const filters = Object.entries(query.where);
      if (filters.some(([, value]) => value === undefined)) { throw new Error("PCB209_QUERY_UNDEFINED_FILTER"); }
      rows = rows.filter(row => filters.every(([field, value]) => Object.hasOwn(row, field) && row[field] === value));
    }
    includeAttributes = query.family === "Attribute";
  } else {
    if (provenance.stage !== "selection-relations209") { throw new Error("PCB209_QUERY_RELATIONS_UNAVAILABLE"); }
    if (query.kind === "selection") {
      rows = recordsSchema.parse(source["selectedRows"]); candidateRowCount = rows.length; includeAttributes = true;
    } else {
      const group = recordsSchema.parse(source["componentPadGroups"]).find(value => value["parentPrimitiveId"] === query.componentId);
      if (group === undefined) { throw new Error("PCB209_QUERY_COMPONENT_NOT_OBSERVED"); }
      const padFamily = families.find(value => value["family"] === "Pad");
      const observed = recordsSchema.parse(padFamily?.["rows"]);
      const byId = new Map(observed.map(row => [row["primitiveId"], row]));
      const childIds = z.array(id).max(CURRENT_PCB_GEOMETRY_MAX_ROWS).parse(group["ids"]);
      rows = childIds.map(primitiveId => {
        const row = byId.get(primitiveId); if (row === undefined) { throw new Error("PCB209_QUERY_CHILD_MISSING"); } return row;
      });
      candidateRowCount = rows.length; componentPadGroups = [group]; metadataIds.add(query.componentId);
    }
  }
  for (const row of rows) { if (row["primitiveType"] === "Component") { metadataIds.add(id.parse(row["primitiveId"])); } }
  const metadata = source["componentMetadataStates"] === undefined ? [] : recordsSchema.parse(source["componentMetadataStates"]);
  const attributes = families.find(family => family["family"] === "Attribute");
  const result = { schema: "easyeda-pro-control.pcb209-historical-query.v1", provenance, query, target: source["target"],
    sourceProjectionSha256: source["projectionSha256"], membershipScope: source["membershipScope"],
    sourceObservationRowCount: completeRows.length, candidateRowCount, requestedIdCount, returnedRowCount: rows.length,
    primitiveIds: rows.map(row => row["primitiveId"]), rows,
    componentMetadataStates: metadata.filter(entry => metadataIds.has(id.parse(entry["primitiveId"]))),
    attributeParentGroups: includeAttributes ? recordsSchema.parse(attributes?.["attributeParentGroups"]) : [],
    attributeGroupScope: includeAttributes ? "complete-observed-component-roster;returned-rows-may-be-filtered" : "not-requested",
    componentPadGroups, componentPadGroupScope: query.kind === "component-pads" ? "complete-observed-requested-child-list" : "not-requested",
    historical: true, freshObservation: false, implementationKind: "retained-observation-projection",
    sourceMembershipVerified: false, reciprocalParentVerified: false, symbolPinMappingVerified: false, connectivityVerified: false,
    persistenceVerified: false, executionAuthorized: false, saveAuthorized: false,
    limitations: ["This is a query of one accepted historical observation. It performs no live call and is not fresh public get/getAll execution or a current writer baseline.",
      "The lifecycle supplies published record provenance and original intent. Full decoder reconstruction checks stored consistency; this pure helper does not authenticate files or create native ownership.",
      "All source projection omissions, instantiated-view bounds and sequential-sampling limits remain. Complete Attribute groups and observed child lists retain their original scope even when returned rows are filtered."] };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_PCB_GEOMETRY_MAX_BYTES) { throw new Error("PCB209_QUERY_RESULT_BOUND"); }
  return freezeDeep(result);
}

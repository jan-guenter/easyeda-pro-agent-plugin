/** Independent data-only incidence proof for the current209 raw observer.
 * Matching geometry does not establish native cache freshness, effective nets,
 * full stored source, an original owner or permission to dispatch a writer. */
import { canonicalJson, sha256Text } from "./core.ts";
import { currentSchematicElectricalObservationSchema } from "./current-schematic-page-electrical-read.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Point = readonly [number, number];
const memberKeys = ["wirePrimitiveIds", "busPrimitiveIds", "pinPrimitiveIds", "wireGroupIds", "busGroupIds"] as const;
type Members = Record<(typeof memberKeys)[number], Set<string>>;
interface Node { readonly point: Point; readonly members: Members }
export interface CurrentSchematicEndpointMembership {
  readonly schema: "private.current-schematic209-endpoint-membership.v1";
  readonly documentUuid: string; readonly observationSha256: string;
  readonly lineCount: number; readonly pinCount: number;
  readonly contacts: readonly Readonly<{ point: Point; nativeContactIndex: number;
    wirePrimitiveIds: readonly string[]; busPrimitiveIds: readonly string[]; pinPrimitiveIds: readonly string[];
    wireGroupIds: readonly string[]; busGroupIds: readonly string[] }>[];
  readonly exactNativeGeometryAndContactMembershipAgree: true;
  readonly unequalNearPointAmbiguityExcluded: true;
  readonly scope: "bounded-integer-cardinal-endpoint-incidence-only";
  readonly nativeCacheFreshnessVerified: false; readonly effectivePinValuesVerified: false;
  readonly completeStoredSourceVerified: false; readonly completeTopologyVerified: false;
  readonly originalNativeOwnerVerified: false; readonly writerAuthorized: false; readonly persistenceVerified: false;
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_ENDPOINT_MEMBERSHIP_${reason}`); } }
function point(value: readonly [number, number]): Point {
  need(value.every(coordinate => Number.isSafeInteger(coordinate) && !Object.is(coordinate, -0) && Math.abs(coordinate) <= 1_000_000), "INTEGER_GRID");
  return [value[0], value[1]];
}
/** Accept serialized data, never caller objects with getters or proxy traps.
 * The complete raw observer still must be bound by the real operation owner.
 * SCH3.2.193/b88ad265 defines gu.HALF_EXT_EXPANSION=.25 at UTF16:1994858
 * and passes it to pointRangeRTree at4145960. Integer coordinates exclude
 * unequal neighbors within that square tolerance.
 * Interior crossings and BusEntry/effective-net semantics are not inferred. */
export function deriveCurrentSchematicEndpointMembership(serialized: string): CurrentSchematicEndpointMembership {
  need(typeof serialized === "string" && serialized.isWellFormed() && Buffer.byteLength(serialized) <= 2_097_152, "INPUT_BOUND");
  const observation = currentSchematicElectricalObservationSchema.parse(JSON.parse(serialized) as unknown);
  const nodes = new Map<string, Node>();
  const node = (coordinates: readonly [number, number]): Node => {
    const position = point(coordinates);
    const key = canonicalJson(position);
    const previous = nodes.get(key);
    if (previous !== undefined) { return previous; }
    need(nodes.size < 8192, "NODE_BOUND");
    const added: Node = { point: position, members: { wirePrimitiveIds: new Set(), busPrimitiveIds: new Set(), pinPrimitiveIds: new Set(), wireGroupIds: new Set(), busGroupIds: new Set() } };
    nodes.set(key, added); return added;
  };
  let lineCount = 0, pinCount = 0;
  for (const group of observation.groups) {
    for (const line of group.lines) {
      need(line.points.length === 2 && lineCount < 1024, "LINE_BOUND");
      const a = line.points[0], b = line.points[1]; need(a !== undefined && b !== undefined, "ENDPOINTS");
      const start = point(a);
      const end = point(b);
      need((start[0] === end[0]) !== (start[1] === end[1]), "NONZERO_CARDINAL_LINE");
      for (const coordinates of [start, end]) {
        const entry = node(coordinates);
        entry.members[group.kind === "wire" ? "wirePrimitiveIds" : "busPrimitiveIds"].add(line.primitiveId);
        entry.members[group.kind === "wire" ? "wireGroupIds" : "busGroupIds"].add(group.primitiveId);
      }
      lineCount += 1;
    }
  }
  for (const component of observation.components) {
    for (const pin of component.pins) {
      node(pin.origin).members.pinPrimitiveIds.add(pin.primitiveId); pinCount += 1;
    }
  }
  need(observation.contacts.length === nodes.size, "COMPLETE_CONTACT_ROSTER");
  const seen = new Set<string>();
  const contacts = observation.contacts.map((actual, nativeContactIndex) => {
    const position = point(actual.point);
    const key = canonicalJson(position);
    const expected = nodes.get(key);
    need(expected !== undefined && !seen.has(key), "CONTACT_POSITION"); seen.add(key);
    for (const field of memberKeys) {
      need(canonicalJson(actual[field].toSorted()) === canonicalJson([...expected.members[field]].toSorted()), "EXACT_ENDPOINT_MEMBERS");
    }
    return { point: position, nativeContactIndex, wirePrimitiveIds: [...expected.members.wirePrimitiveIds].toSorted(),
      busPrimitiveIds: [...expected.members.busPrimitiveIds].toSorted(), pinPrimitiveIds: [...expected.members.pinPrimitiveIds].toSorted(),
      wireGroupIds: [...expected.members.wireGroupIds].toSorted(), busGroupIds: [...expected.members.busGroupIds].toSorted() };
  });
  return freezeDeep({ schema: "private.current-schematic209-endpoint-membership.v1", documentUuid: observation.primitiveId,
    observationSha256: sha256Text(serialized), lineCount, pinCount, contacts,
    exactNativeGeometryAndContactMembershipAgree: true, unequalNearPointAmbiguityExcluded: true,
    scope: "bounded-integer-cardinal-endpoint-incidence-only", nativeCacheFreshnessVerified: false,
    effectivePinValuesVerified: false, completeStoredSourceVerified: false, completeTopologyVerified: false,
    originalNativeOwnerVerified: false, writerAuthorized: false, persistenceVerified: false });
}

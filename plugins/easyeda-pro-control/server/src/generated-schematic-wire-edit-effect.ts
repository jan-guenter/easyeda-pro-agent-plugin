/** Complete literal native-source comparison. This data result proves neither
 * original native invocation nor connectivity, selected SQL or durability. */
import { canonicalJson, sha256Text } from "./core.ts";
import { parseNativeRecords } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";

function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCH209_WIRE_EFFECT_${code}`); } }
/** Data comparison shared with the distinct cold reader. It issues no native
 * origin and accepts no caller callback, path or source normalization rule. */
export function compareGeneratedSchematicWireSourceData(args: GeneratedSchematicWireEditNativeArguments, source: string, expectedBody: Readonly<Record<string, unknown>>): Readonly<{ roots: readonly Readonly<{ id: string; zIndex: number }>[]; headers: string; document: string; order: string }> {
  need(source.isWellFormed() && Buffer.byteLength(source) <= 16_384 && source.endsWith("|\n"), "SOURCE_BOUND");
  const [head, ...rows] = parseNativeRecords(source), { operation } = args;
  need(head?.header["type"] === "DOCHEAD" && head.body?.["docType"] === "SCH_PAGE" && head.body["uuid"] === args.target.pageUuid && rows.length === 7, "DOCUMENT_ROSTER");
  const peers: { id: string; type: string; body: unknown }[] = [], roots: { id: string; zIndex: number }[] = [], seen = new Set<string>(); let targets = 0;
  for (const row of rows) {
    const id = row.header["id"], type = row.header["type"]; need(typeof id === "string" && typeof type === "string" && row.body !== null && !seen.has(id), "ROW"); seen.add(id);
    let body = row.body;
    if (operation.rootIds.includes(id)) {
      const { zIndex, ...rest } = body; need(typeof zIndex === "number" && Number.isSafeInteger(zIndex) && zIndex >= 0 && zIndex <= 2 && !Object.is(zIndex, -0), "ROOT_INDEX");
      roots.push({ id, zIndex }); body = rest;
    }
    if (id === operation.lineId) { need(type === "LINE" && canonicalJson(body) === canonicalJson(expectedBody), "EXACT_LINE_BODY"); targets += 1; }
    else { peers.push({ id, type, body }); }
  }
  need(targets === 1 && roots.length === 3 && new Set(roots.map(row => row.zIndex)).size === 3 && canonicalJson(roots.map(row => row.id).toSorted()) === canonicalJson(operation.rootIds), "ROOT_ROSTER");
  need(canonicalJson(peers.toSorted((left, right) => left.id.localeCompare(right.id))) === canonicalJson(operation.peers), "PEER_CHANGED");
  return freezeDeep({ roots: roots.toSorted((left, right) => left.id.localeCompare(right.id)), headers: canonicalJson(rows.map(row => row.header)), document: canonicalJson(head), order: canonicalJson(rows.map(row => row.header["id"])) });
}
export function compareGeneratedSchematicWireEditEffect(args: GeneratedSchematicWireEditNativeArguments, before: string, modified: string, observed: string): Readonly<{
  schema: "private.generated-schematic-wire-edit-effect.v1"; operationId: string; documentUuid: string; wireId: string; lineId: string;
  beforeSourceSha256: string; modifiedSourceSha256: string; observedSourceSha256: string;
  exactLineGeometryVerified: true; completePeerBodyRosterPreserved: true; explicitRelevanceAttributePreserved: true; originalRecordHeadersPreserved: true;
  nativeInvocationVerified: false; connectivityVerified: false; selectedSqlAuthorized: false; persistenceVerified: false; inverseAvailable: false;
}> {
  const initial = compareGeneratedSchematicWireSourceData(args, before, args.operation.beforeBody); const next = compareGeneratedSchematicWireSourceData(args, modified, args.operation.afterBody); const later = compareGeneratedSchematicWireSourceData(args, observed, args.operation.afterBody);
  need(canonicalJson(initial) === canonicalJson(next) && canonicalJson(initial) === canonicalJson(later), "NATIVE_BOOKKEEPING_CHANGED");
  return freezeDeep({ schema: "private.generated-schematic-wire-edit-effect.v1", operationId: args.operation.operationId, documentUuid: args.target.pageUuid,
    wireId: args.operation.wireId, lineId: args.operation.lineId, beforeSourceSha256: sha256Text(before), modifiedSourceSha256: sha256Text(modified), observedSourceSha256: sha256Text(observed),
    exactLineGeometryVerified: true, completePeerBodyRosterPreserved: true, explicitRelevanceAttributePreserved: true, originalRecordHeadersPreserved: true,
    nativeInvocationVerified: false, connectivityVerified: false, selectedSqlAuthorized: false, persistenceVerified: false, inverseAvailable: false });
}

import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";

export interface SchematicHiddenOrderProof {
  readonly componentId: string; readonly attributeId: string; readonly key: string; readonly order: number;
  readonly symbolSha256: string; readonly deviceSha256: string; readonly ticketOrderSha256: string;
}
const same = (a: unknown, b: unknown): boolean => canonicalJson({ value: a }) === canonicalJson({ value: b });
function fail(): never { throw new Error("Hidden null attribute order lacks exact native library reconstruction."); }
function library(history: NativeHistorySnapshot, uuid: unknown, type: string): NativeDocumentSnapshot {
  const matches = history.documents.filter((doc) => doc.uuid === uuid && doc.docType === type && !isNativeDocumentDeleted(doc));
  const doc = matches[0];
  if (matches.length !== 1 || doc === undefined || doc.semanticSha256 !== sha256Json({ uuid: doc.uuid, docType: doc.docType,
    metadata: doc.metadata, records: doc.records.map(({ id, type: recordType, body }) => ({ id, type: recordType, body })) })) { fail(); }
  return doc;
}

/** Pinned sch.js O7.createSchSymbolWithTemplate (4627070) clones library shapes
 * before root ATTRs, applies stored ATTRs in worker first-insertion order, then appends
 * missing DEVICE attributes. Its final recalculateChildrenZIndex (1929422)
 * assigns contiguous indices. PartSymbol (4296785) supplies the two default
 * BOM/PCB attributes absent from older library storage. Only the constructor's
 * hidden Unique ID / Relevance null orders are admitted, with the COMPLETE
 * reconstructed native root-attribute sequence checked against those inputs.
 */
export function schematicHiddenNullOrder(history: NativeHistorySnapshot, page: NativeDocumentSnapshot,
  source: NativeSourceSnapshot, native: SchematicNativeSnapshot, row: NativeSourceObject): SchematicHiddenOrderProof {
  const model = native.components.find((entry) => entry.id === row.body["parentId"]);
  const key = row.body["key"];
  if (model === undefined || !((model.kind === "part" && key === "Unique ID") || (model.kind === "netflag" && key === "Relevance")) ||
      row.body["zIndex"] !== null || ["x", "y", "rotation", "keyVisible", "valueVisible"].some((field) => row.body[field] !== null) ||
      (key === "Relevance" ? row.body["value"] !== "[]" : typeof row.body["value"] !== "string" || row.body["value"].length === 0) ||
      source.document["uuid"] !== page.uuid || source.document["editVersion"] !== "3.2.149.88089769") { fail(); }
  const deviceAttrs = model.attributes.filter((attr) => attr.key === "Device"), symbolAttrs = model.attributes.filter((attr) => attr.key === "Symbol");
  if (symbolAttrs.length !== 1 || deviceAttrs.length !== 1) { fail(); }
  const device = library(history, deviceAttrs[0]?.value, "DEVICE"), symbol = library(history, symbolAttrs[0]?.value, "SYMBOL");
  const symbolType = symbol.records.find((entry) => entry.type === "META")?.body["docType"];
  const deviceAttributes = device.records.find((entry) => entry.type === "META")?.body["attributes"];
  const partId = model.body["partId"];
  if (typeof partId !== "string" || !symbol.records.some((entry) => entry.type === "PART" && entry.id === partId) ||
      symbolType !== (model.kind === "part" ? 2 : 18) || !isRecord(deviceAttributes) || deviceAttributes["Symbol"] !== symbol.uuid) { fail(); }
  const children = symbol.records.filter((entry) => entry.body["partId"] === partId);
  const shapes = children.filter((entry) => entry.type !== "ATTR");
  if (shapes.some((entry) => !["PIN", "POLY", "LINE", "ARC", "RECT", "CIRCLE", "ELLIPSE", "TEXT"].includes(entry.type))) { fail(); }
  const roots = children.filter((entry) => entry.type === "ATTR" && [partId, ""].includes(String(entry.body["parentId"])));
  if (roots.some((entry) => typeof entry.body["key"] !== "string" || !Number.isSafeInteger(entry.body["zIndex"])) ||
      new Set(roots.map((entry) => entry.body["zIndex"])).size !== roots.length) { fail(); }
  const keys = roots.toSorted((a, b) => Number(a.body["zIndex"]) - Number(b.body["zIndex"])).map((entry) => String(entry.body["key"]));
  if (new Set(keys).size !== keys.length || keys.includes(key)) { fail(); }
  if (model.kind === "part") {
    // Existing Designator replaces the constructor default in its library slot.
    if (!keys.includes("Designator") || keys.includes("Add into BOM") || keys.includes("Convert to PCB")) { fail(); }
    keys.unshift("Add into BOM", "Convert to PCB");
  }
  const rootsStored = page.records.filter((entry) => entry.type === "ATTR" && entry.body["parentId"] === model.id);
  if (rootsStored.some((entry) => !Number.isSafeInteger(entry.firstTicket) || entry.firstTicket === undefined || entry.firstTicket < 0 ||
      entry.firstTicket > entry.ticket || !Object.hasOwn(entry, "firstClient") || (entry.firstClient !== null && typeof entry.firstClient !== "string"))) { fail(); }
  const stored = rootsStored.toSorted((a, b) => {
    const ticketOrder = Number(a.firstTicket) - Number(b.firstTicket);
    if (ticketOrder !== 0) { return ticketOrder; }
    const left = a.firstClient ?? "", right = b.firstClient ?? "";
    if (left < right) { return -1; }
    return left > right ? 1 : 0;
  });
  if (stored.some((entry) => !Number.isSafeInteger(entry.ticket) || typeof entry.body["key"] !== "string") ||
      stored.some((entry, index) => stored.slice(index + 1).some((peer) => peer.firstTicket === entry.firstTicket &&
        (peer.firstClient === entry.firstClient || peer.firstClient === null || entry.firstClient === null))) ||
      new Set(stored.map((entry) => entry.body["key"])).size !== stored.length ||
      !stored.some((entry) => entry.id === row.id && same(entry.body, row.body))) { fail(); }
  for (const entry of stored) { const attrKey = String(entry.body["key"]); if (!keys.includes(attrKey)) { keys.push(attrKey); } }
  for (const attrKey of Object.keys(deviceAttributes)) { if (!keys.includes(attrKey)) { keys.push(attrKey); } }
  if (!keys.includes("Name")) { keys.push("Name"); }
  if (model.attributes.length !== keys.length || new Set(model.attributes.map((attr) => attr.key)).size !== model.attributes.length ||
      model.attributes.some((attr) => attr.body["parentId"] !== model.id || attr.body["key"] !== attr.key || attr.instanceValue !== null ||
        attr.body["zIndex"] !== shapes.length + keys.indexOf(attr.key))) { fail(); }
  const attr = model.attributes.find((entry) => entry.id === row.id && entry.key === key);
  const exported = source.objects.find((entry) => entry.id === row.id);
  const order = shapes.length + keys.indexOf(key);
  if (attr === undefined || exported?.type !== "ATTR" || !same(attr.body, exported.body) || attr.body["zIndex"] !== order) { fail(); }
  return { componentId: model.id, attributeId: row.id, key, order, symbolSha256: symbol.semanticSha256,
    deviceSha256: device.semanticSha256, ticketOrderSha256: sha256Json(stored.map((entry) => ({ id: entry.id, ticket: entry.ticket,
      firstTicket: entry.firstTicket, firstClient: entry.firstClient, key: entry.body["key"] }))) };
}

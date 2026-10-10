import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceObject } from "./document-source.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";

export interface SchematicLibraryStyleProof {
  readonly componentId: string; readonly attributeId: string; readonly libraryAttributeId: string;
  readonly symbolSha256: string; readonly fields: readonly string[];
}
const same = (a: unknown, b: unknown): boolean => canonicalJson({ value: a }) === canonicalJson({ value: b });
function fail(): never { throw new Error("Schematic null style lacks exact native library reconstruction."); }
/** The pinned createSchSymbolWithTemplate clones root attributes first.
 * Its handleSchAttrCover (sch.js4630100) skips null rotation/fontSize/fontWeight/
 * Italic/underline overrides. Require the exact library value, not a guessed
 * Default, and bind every physical pin to the same unrotated library instance.
 */
export function schematicLibraryStyle(history: NativeHistorySnapshot, native: SchematicNativeSnapshot,
  stored: NativeSourceObject, exported: NativeSourceObject, fields: readonly string[]): SchematicLibraryStyleProof {
  const model = native.components.find((entry) => entry.id === stored.body["parentId"]);
  const symbolId = model?.attributes.find((entry) => entry.key === "Symbol")?.value;
  const symbol = history.documents.find((doc) => doc.uuid === symbolId && doc.docType === "SYMBOL" && !isNativeDocumentDeleted(doc));
  if (model?.kind !== "part" || model.body["rotation"] !== 0 || model.body["isMirror"] !== false || symbol === undefined ||
      symbol.semanticSha256 !== sha256Json({ uuid: symbol.uuid, docType: symbol.docType, metadata: symbol.metadata,
        records: symbol.records.map(({ id, type, body }) => ({ id, type, body })) }) ||
      !same(symbol.records.find((row) => row.type === "CANVAS")?.body, { originX: 0, originY: 0 })) { fail(); }
  const roots = symbol.records.filter((row) => row.type === "ATTR" && row.body["partId"] === model.body["partId"] &&
    (row.body["parentId"] === "" || row.body["parentId"] === model.body["partId"]) && row.body["key"] === stored.body["key"]);
  const attrs = model.attributes.filter((attr) => attr.id === stored.id && attr.key === stored.body["key"]), root = roots[0];
  if (roots.length !== 1 || root === undefined || attrs.length !== 1 || !same(attrs[0]?.body, exported.body) ||
      fields.length === 0 || fields.some((key) => !["rotation", "fontSize", "fontWeight", "italic", "underline"].includes(key) ||
        stored.body[key] !== null || !Object.hasOwn(root.body, key) || root.body[key] === null || root.body[key] === undefined ||
        !same(root.body[key], exported.body[key]) || (["rotation", "fontSize"].includes(key)
          ? typeof root.body[key] !== "number" || !Number.isFinite(root.body[key]) || (key === "fontSize" && root.body[key] <= 0)
          : typeof root.body[key] !== "boolean"))) { fail(); }
  const pins = symbol.records.filter((row) => row.type === "PIN" && row.body["partId"] === model.body["partId"]);
  if (pins.length !== model.pins.length || pins.some((row) => {
    const pin = model.pins.find((entry) => entry.id === `${model.id}-${row.id}`);
    return pin === undefined || pin.body["x"] !== Number(row.body["x"]) + Number(model.body["x"]) ||
      pin.body["y"] !== Number(row.body["y"]) + Number(model.body["y"]) || pin.body["rotation"] !== row.body["rotation"] || pin.body["length"] !== row.body["length"];
  })) { fail(); }
  return { componentId: model.id, attributeId: stored.id, libraryAttributeId: root.id, symbolSha256: symbol.semanticSha256, fields };
}

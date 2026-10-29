import { createHash } from "node:crypto";
import { isRecord } from "./core.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import type { ManagedSymbolSource } from "./managed-project-symbol-sources.ts";

export const MANAGED_SYMBOL_PIN_PAGE_ENTRIES = 16;
const MAX_RECORDS = 8192;
const MAX_PAGE_BYTES = 32 * 1024;
interface SourceRecord {
  readonly kind: string;
  readonly id: string | null;
  readonly partId: string | null;
  readonly body: Readonly<Record<string, unknown>> | readonly unknown[];
  readonly recordIndex: number;
  readonly recordSha256: string;
}
interface ParsedSource { readonly format: "json-lines-1.0" | "native-dochead"; readonly records: readonly SourceRecord[] }
function refuse(reason: string): never { throw new Error(`Supplied symbol pin inspection refused: ${reason}.`); }
function hash(text: string): string { return createHash("sha256").update(text, "utf8").digest("hex"); }
function string(value: unknown, maximum = 4096): string {
  if (typeof value !== "string" || value.length > maximum || !value.isWellFormed() || value.includes("\u0000")) { refuse("bounded exact string field"); }
  return value;
}
function id(value: unknown): string { const actual = string(value); if (actual.length === 0) { refuse("empty record identity"); } return actual; }
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) { refuse("finite raw coordinate or orientation"); } return value;
}
function boolean(value: unknown): boolean | null {
  if (value === null || value === undefined) { return null; }
  if (typeof value !== "boolean") { refuse("raw Boolean visibility"); } return value;
}
function flag(value: unknown): boolean | null {
  if (value === null || value === undefined) { return null; }
  if (value !== 0 && value !== 1) { refuse("raw 0/1 visibility"); } return value === 1;
}
function pinShape(value: unknown): string | number | null {
  if (value === null || value === undefined) { return null; }
  return typeof value === "number" ? number(value) : string(value);
}
function decode(text: string): unknown { return decodeCurrentPcbDiagnosticJson(Buffer.from(text, "utf8")); }
function jsonLines(source: string): ParsedSource {
  const lines = source.replace(/\r?\n$/u, "").split(/\r?\n/u);
  if (lines.length < 2 || lines.length > MAX_RECORDS || /\r(?!\n)/u.test(source)) { refuse("JSON-line record bound or framing"); }
  const records: SourceRecord[] = []; const parts = new Set<string>(), scoped = new Set<string>(); let partId: string | null = null;
  for (const [recordIndex, line] of lines.entries()) {
    const body = decode(line);
    if (!Array.isArray(body) || body.length < 2 || body.length > 128) { refuse("JSON-line row shape"); }
    const kind = string(body[0], 64); if (kind.length === 0) { refuse("empty record type"); }
    if (recordIndex === 0 && (line !== '["DOCTYPE","SYMBOL","1.0"]')) { refuse("ordinary SYMBOL1.0 header"); }
    if (recordIndex === 1 && (kind !== "HEAD" || body.length !== 2 || !isRecord(body[1]) || body[1]["symbolType"] !== 2)) { refuse("ordinary symbol HEAD type2"); }
    if (recordIndex > 1 && ["HEAD", "DOCTYPE", "DOCHEAD"].includes(kind)) { refuse("multiple source documents"); }
    if (kind === "PART") {
      partId = id(body[1]); if (parts.has(partId)) { refuse("duplicate part identity"); } parts.add(partId);
    }
    const recordId = ["PIN", "ATTR", "PART"].includes(kind) ? id(body[1]) : null;
    if ((kind === "PIN" || kind === "ATTR") && recordId !== null) {
      const identity = JSON.stringify([partId, recordId]);
      if (scoped.has(identity)) { refuse("duplicate pin or attribute identity within part"); } scoped.add(identity);
    }
    records.push({ kind, id: recordId, partId, body, recordIndex, recordSha256: hash(line) });
  }
  return { format: "json-lines-1.0", records };
}
function nativeSource(source: string, item: ManagedSymbolSource): ParsedSource {
  if (!source.endsWith("|\n")) { refuse("complete native source delimiter"); }
  const lines = source.slice(0, -2).split("|\n");
  if (lines.length === 0 || lines.length > MAX_RECORDS) { refuse("native record bound"); }
  const records: SourceRecord[] = []; const identities = new Set<string>();
  for (const [recordIndex, line] of lines.entries()) {
    const boundary = line.indexOf("||");
    if (boundary < 1) { refuse("native record separator"); }
    const header = decode(line.slice(0, boundary)); const body = decode(line.slice(boundary + 2));
    if (!isRecord(header) || !isRecord(body)) { refuse("native header/body objects, without tombstones"); }
    const kind = string(header["type"], 64); if (kind.length === 0) { refuse("empty record type"); }
    if (recordIndex === 0) {
      if (kind !== "DOCHEAD" || body["docType"] !== "SYMBOL" ||
          (item.identityKind === "archive-member-uuid" && body["uuid"] !== item.symbolId)) { refuse("native symbol header and member UUID agreement"); }
    } else if (["DOCHEAD", "DELETE_DOC", "DELETE", "EDIT_HEAD", "META_CREATE", "META_MODIFY"].includes(kind)) { refuse("exported source required, not mutable history"); }
    const recordId = recordIndex === 0 ? null : id(header["id"]);
    if (recordId !== null) { if (identities.has(recordId)) { refuse("duplicate native record identity"); } identities.add(recordId); }
    const partId = body["partId"] === undefined ? null : string(body["partId"]);
    records.push({ kind, id: recordId, partId, body, recordIndex, recordSha256: hash(line) });
  }
  return { format: "native-dochead", records };
}
function field(record: SourceRecord, key: string, index: number): unknown {
  return Array.isArray(record.body) ? record.body[index] : Reflect.get(record.body, key);
}
function reference(record: SourceRecord): Record<string, unknown> {
  return { recordIndex: record.recordIndex, recordSha256: record.recordSha256, recordType: record.kind, recordId: record.id };
}
function attributeKey(record: SourceRecord, format: ParsedSource["format"]): string {
  const key = string(field(record, "key", 3));
  if (format === "json-lines-1.0" && key === "NUMBER") { return "Pin Number"; }
  if (format === "json-lines-1.0" && key === "NAME") { return "Pin Name"; }
  return key;
}
function pinDto(pin: SourceRecord, attrs: readonly SourceRecord[], format: ParsedSource["format"]): Record<string, unknown> {
  const attributes: Record<string, unknown> = {};
  for (const [output, key] of [["number", "Pin Number"], ["name", "Pin Name"], ["electricalType", "Pin Type"]]) {
    if (output === undefined || key === undefined) { refuse("pin attribute definition"); }
    const matches = attrs.filter((row) => attributeKey(row, format) === key);
    if (matches.length > 1) { refuse("ambiguous pin attribute key"); }
    const attr = matches[0]; const value = attr === undefined ? undefined : field(attr, "value", 4);
    attributes[output] = value === null || value === undefined ? null : string(value);
    attributes[`${output}Present`] = attr !== undefined;
    attributes[`${output}Attribute`] = attr === undefined ? null : { ...reference(attr),
      keyVisiblePresent: field(attr, "keyVisible", 5) !== undefined, valueVisiblePresent: field(attr, "valueVisible", 6) !== undefined,
      keyVisible: format === "json-lines-1.0" ? flag(field(attr, "keyVisible", 5)) : boolean(field(attr, "keyVisible", 5)),
      valueVisible: format === "json-lines-1.0" ? flag(field(attr, "valueVisible", 6)) : boolean(field(attr, "valueVisible", 6)) };
  }
  return { ...reference(pin), id: pin.id, partId: pin.partId, ...attributes,
    x: number(field(pin, "x", 4)), y: number(field(pin, "y", 5)), length: number(field(pin, "length", 6)),
    orientation: number(field(pin, "rotation", 7)),
    visiblePresent: field(pin, "display", 2) !== undefined, visible: format === "json-lines-1.0" ? flag(field(pin, "display", 2)) : boolean(field(pin, "display", 2)),
    pinShapeRaw: pinShape(field(pin, "pinShape", 9)), attributeRecords: attrs.map((attr) => reference(attr)) };
}
/** Raw coordinates, orientation, pin type strings and visibility are reported
 * without unit conversion or ERC inference. Unknown fields/records remain in
 * the digest-bound full source and every projected row links its exact record. */
export function inspectManagedSymbolPins(item: ManagedSymbolSource, offset: number, length: number): Record<string, unknown> {
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(length) || length < 1 || length > MANAGED_SYMBOL_PIN_PAGE_ENTRIES) { refuse("pin page bounds"); }
  const source = item.documentSource.replace(/^\uFEFF/u, "");
  const parsed = source.startsWith("[") ? jsonLines(source) : nativeSource(source, item);
  const pins = parsed.records.filter((row) => row.kind === "PIN"); const identities = new Set<string>();
  // Validate every pin and its owned attributes before returning a page. A later
  // Malformed pin must not make an earlier partial page look like a valid set.
  const ownedAttributes = new Map<string, SourceRecord[]>();
  const nativePins = new Map(pins.map((pin) => [pin.id, pin]));
  for (const row of parsed.records) {
    if (row.kind === "ATTR") {
      const parent = string(field(row, "parentId", 2)), selected = nativePins.get(parent);
      if (parsed.format === "native-dochead" && selected !== undefined && selected.partId !== row.partId) { refuse("native pin attribute part differs from its parent"); }
      const key = JSON.stringify([row.partId, parent]);
      const rows = ownedAttributes.get(key) ?? []; rows.push(row); ownedAttributes.set(key, rows);
    }
  }
  const all = pins.map((pin) => {
    const identity = JSON.stringify([pin.partId, pin.id]);
    if (identities.has(identity)) { refuse("duplicate pin identity within part"); } identities.add(identity);
    return pinDto(pin, ownedAttributes.get(identity) ?? [], parsed.format);
  });
  if (offset > all.length) { refuse("pin page offset exceeds complete roster"); }
  const page: Record<string, unknown>[] = []; let nextOffset = offset;
  for (const pin of all.slice(offset, offset + length)) {
    const bytes = Buffer.byteLength(JSON.stringify([...page, pin]), "utf8");
    if (bytes > MAX_PAGE_BYTES) { if (page.length === 0) { refuse("one complete pin exceeds page byte bound; use raw source pages"); } break; }
    page.push(pin); nextOffset += 1;
  }
  const typeCounts = new Map<string, number>();
  for (const record of parsed.records) { typeCounts.set(record.kind, (typeCounts.get(record.kind) ?? 0) + 1); }
  const recordTypes = Object.fromEntries(typeCounts);
  return { symbolId: item.symbolId, member: item.member, sourceSha256: item.sha256, sourceFormat: parsed.format,
    coordinateConvention: "raw-file-coordinates", electricalRulesEvaluated: false, pinToPadMappingVerified: false,
    recordCount: parsed.records.length, recordTypes, unknownRecordsPreservedInSource: true,
    totalPins: all.length, offsetUnit: "pin-entry", offset, nextOffset, endOfPins: nextOffset === all.length,
    completePinsReturned: offset === 0 && nextOffset === all.length, pins: page };
}

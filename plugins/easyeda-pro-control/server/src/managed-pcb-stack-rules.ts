import { createHash } from "node:crypto";
import { isRecord } from "./core.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";

export const MANAGED_PCB_STACK_RULE_PAGE_ENTRIES = 16;
export const MANAGED_PCB_STACK_RULE_SECTIONS = ["stack", "rules", "selectors", "all"] as const;
export type ManagedPcbStackRuleSection = typeof MANAGED_PCB_STACK_RULE_SECTIONS[number];
export interface ManagedPcbStackRuleSource {
  readonly member: string;
  readonly documentSource: string;
  readonly sha256: string;
  readonly documentUuid?: string | null;
}
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const MAX_RECORDS = 32_768;
const MAX_PAGE_BYTES = 32 * 1024;
// Native stored rule IDs retain this spelling, including DIFFER_ENTAIL.
const RULE_FAMILIES = ["SAFE", "OTHER", "CREEPAGE", "TRACK", "NET_LENGTH", "NET_LENGTH_TOLERANCE", "DIFFER_ENTAIL",
  "BLIND", "RADIUS", "PLANE", "COPPER", "PASTE", "SOLDER", "AUTO_ROUTER"] as const;
// PCB a8405930 vRe@342389 accepts both legacy numeric codes and numeric strings.
// Classification does not run its migrations, create defaults or merge selectors.
const LEGACY_RULE_FAMILIES = new Map([["1", "SAFE"], ["2", "OTHER"], ["3", "TRACK"], ["4", "BLIND"],
  ["5", "RADIUS"], ["6", "PLANE"], ["7", "COPPER"], ["8", "PASTE"], ["9", "SOLDER"],
  ["10", "DIFFER_ENTAIL"], ["11", "NET_LENGTH"], ["12", "AUTO_ROUTER"], ["13", "NET_LENGTH_TOLERANCE"]]);
const STACK = new Set(["LAYER", "LAYER_PHYS", "ACTIVE_LAYER"]);
const RULES = new Set(["RULE_TEMPLATE", "RULE"]);
const SELECTORS = new Set(["NET", "RULE_SELECTOR", "EQLEN_GRP", "EQLEN"]);
const HISTORY = new Set(["EDIT_HEAD", "DELETE", "DELETE_DOC", "META_CREATE", "META_MODIFY"]);
interface RecordRow {
  readonly kind: string;
  readonly identityRaw: string | null;
  readonly raw: string;
  readonly recordIndex: number;
  readonly recordSha256: string;
  readonly ruleFamily: string | null;
  readonly ruleFamilyRaw: string | number | null;
  readonly ruleName: string | null;
}
interface ParsedSource { readonly format: "native-dochead" | "json-lines"; readonly version: string | null; readonly records: readonly RecordRow[] }
function refuse(reason: string): never { throw new Error(`Supplied PCB stack/rule inspection refused: ${reason}.`); }
function hash(sourceText: string): string { return createHash("sha256").update(sourceText, "utf8").digest("hex"); }
function decode(sourceText: string): unknown { return decodeCurrentPcbDiagnosticJson(Buffer.from(sourceText, "utf8")); }
function text(value: unknown, maximum = 4096): string {
  if (typeof value !== "string" || value.length > maximum || !value.isWellFormed() || value.includes("\u0000")) { refuse("bounded exact text field"); }
  return value;
}
function recordType(value: unknown): string {
  const kind = text(value, 64); if (!/^[A-Z][A-Z0-9_]*$/u.test(kind)) { refuse("record type"); } return kind;
}
function nonempty(value: unknown): string { const result = text(value); if (result.length === 0) { refuse("empty identity"); } return result; }
function family(value: unknown): { ruleFamily: string; ruleFamilyRaw: string | number } {
  let raw: string | number;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || Object.is(value, -0)) { refuse("raw legacy rule family code"); } raw = value;
  } else { raw = nonempty(value); }
  const key = String(raw); return { ruleFamily: LEGACY_RULE_FAMILIES.get(key) ?? key, ruleFamilyRaw: raw };
}
function nativeRuleIdentity(identity: string): { ruleFamily: string; ruleFamilyRaw: string | number; ruleName: string } {
  const value = decode(identity);
  if (!Array.isArray(value) || value.length !== 3 || value[0] !== "RULE") { refuse("native RULE identity tuple"); }
  return { ...family(value[1]), ruleName: text(value[2]) };
}
function native(source: string, expectedUuid: string | undefined): ParsedSource {
  const body = source.endsWith("|\n") ? source.slice(0, -2) : source;
  const lines = body.split("|\n"); if (lines.length > MAX_RECORDS) { refuse("record count bound"); }
  const records: RecordRow[] = []; const identities = new Set<string>();
  for (const [recordIndex, raw] of lines.entries()) {
    const separator = raw.indexOf("||"); if (separator < 1) { refuse("native header/body framing"); }
    const header = decode(raw.slice(0, separator)), value = decode(raw.slice(separator + 2));
    if (!isRecord(header) || !isRecord(value)) { refuse("materialized native header/body objects, without tombstones"); }
    const kind = recordType(header["type"]); let identityRaw: string | null = null;
    if (recordIndex === 0) {
      const uuid = value["uuid"];
      if (kind !== "DOCHEAD" || value["docType"] !== "PCB" || typeof uuid !== "string" ||
          !/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(uuid) || expectedUuid !== undefined && uuid !== expectedUuid) { refuse("native PCB header or source identity"); }
    } else {
      if (kind === "DOCHEAD" || HISTORY.has(kind)) { refuse("one materialized PCB document, not mutable history"); }
      identityRaw = nonempty(header["id"]);
      if (identities.has(identityRaw)) { refuse("duplicate native record identity"); } identities.add(identityRaw);
    }
    const rule = kind === "RULE" && identityRaw !== null ? nativeRuleIdentity(identityRaw) : { ruleFamily: null, ruleFamilyRaw: null, ruleName: null };
    records.push({ kind, identityRaw, raw, recordIndex, recordSha256: hash(raw), ...rule });
  }
  return { format: "native-dochead", version: null, records };
}
function jsonLines(source: string): ParsedSource {
  if (/\r(?!\n)/u.test(source)) { refuse("JSON-line framing"); }
  const lines = source.replace(/\r?\n$/u, "").split(/\r?\n/u);
  if (lines.length < 2 || lines.length > MAX_RECORDS) { refuse("JSON-line record count bound"); }
  const records: RecordRow[] = []; let version: string | null = null;
  for (const [recordIndex, raw] of lines.entries()) {
    const value = decode(raw);
    if (!Array.isArray(value) || value.length < 2 || value.length > 256) { refuse("JSON-line row shape"); }
    const kind = recordType(value[0]);
    if (recordIndex === 0) {
      version = text(value[2], 16);
      if (kind !== "DOCTYPE" || value.length !== 3 || value[1] !== "PCB" || !/^1\.[0-9]$/u.test(version)) { refuse("ordinary PCB1.x header"); }
    } else if (kind === "DOCTYPE" || kind === "DOCHEAD" || HISTORY.has(kind)) { refuse("one materialized PCB document, not mutable history"); }
    if (recordIndex === 1 && (kind !== "HEAD" || value.length !== 2 || !isRecord(value[1]))) { refuse("ordinary PCB HEAD"); }
    if (recordIndex > 1 && kind === "HEAD") { refuse("multiple ordinary PCB headers"); }
    const rule = kind === "RULE" ? { ...family(value[1]), ruleName: text(value[2]) } : { ruleFamily: null, ruleFamilyRaw: null, ruleName: null };
    records.push({ kind, identityRaw: null, raw, recordIndex, recordSha256: hash(raw), ...rule });
  }
  return { format: "json-lines", version, records };
}
function selected(row: RecordRow, section: ManagedPcbStackRuleSection): boolean {
  if (section === "stack") { return STACK.has(row.kind); }
  if (section === "rules") { return RULES.has(row.kind); }
  if (section === "selectors") { return SELECTORS.has(row.kind); }
  return STACK.has(row.kind) || RULES.has(row.kind) || SELECTORS.has(row.kind);
}
function overview(parsed: ParsedSource): Record<string, unknown> {
  const familyCounts = new Map<string, number>(RULE_FAMILIES.map(name => [name, 0])), recordTypes = new Map<string, number>();
  const unknownFamilies = new Map<string, number>();
  for (const row of parsed.records) {
    recordTypes.set(row.kind, (recordTypes.get(row.kind) ?? 0) + 1);
    if (recordTypes.size > 128) { refuse("record-type inventory bound"); }
    if (row.ruleFamily !== null) {
      const counts = familyCounts.has(row.ruleFamily) ? familyCounts : unknownFamilies;
      counts.set(row.ruleFamily, (counts.get(row.ruleFamily) ?? 0) + 1);
      if (unknownFamilies.size > 128) { refuse("unknown rule-family inventory bound"); }
    }
  }
  return { recordCount: parsed.records.length, recordTypes: Object.fromEntries(recordTypes), ruleFamilyCounts: Object.fromEntries(familyCounts),
    ruleFamilyCountUnit: "source-record", ruleFamilyClassification: "source-pinned-literal-and-legacy-code-map",
    unknownRuleFamilyCounts: Object.fromEntries(unknownFamilies) };
}
/** Supplied exported source only. It does not execute the native parser, repair
 * defaults, merge selectors or infer which rule applies to a pad/net. Exact raw
 * records retain unknown fields, ordering and numeric spellings, including -0.
 */
export function inspectManagedPcbStackRules(item: ManagedPcbStackRuleSource, offset: number, length: number,
  section: ManagedPcbStackRuleSection = "all"): Record<string, unknown> {
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(length) || length < 1 ||
      length > MANAGED_PCB_STACK_RULE_PAGE_ENTRIES || !MANAGED_PCB_STACK_RULE_SECTIONS.includes(section)) { refuse("record page bounds or section"); }
  const source = item.documentSource;
  if (typeof source !== "string" || source.length === 0 || !source.isWellFormed() || Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES ||
      !/^[a-f0-9]{64}$/u.test(item.sha256) || hash(source) !== item.sha256) { refuse("source byte bound or digest"); }
  text(item.member);
  const withoutBom = source.replace(/^\uFEFF/u, "");
  const parsed = withoutBom.startsWith("[") ? jsonLines(withoutBom) : native(withoutBom, item.documentUuid ?? undefined);
  const summary = overview(parsed); const rows = parsed.records.filter(row => selected(row, section));
  if (offset > rows.length) { refuse("record offset exceeds complete selected roster"); }
  const page: Record<string, unknown>[] = []; let nextOffset = offset;
  for (const row of rows.slice(offset, offset + length)) {
    const entry = { recordIndex: row.recordIndex, recordSha256: row.recordSha256, recordType: row.kind, identityRaw: row.identityRaw,
      ruleFamily: row.ruleFamily, ruleFamilyRaw: row.ruleFamilyRaw, ruleName: row.ruleName, recordText: row.raw };
    if (Buffer.byteLength(JSON.stringify([...page, entry]), "utf8") > MAX_PAGE_BYTES) {
      if (page.length === 0) { refuse("one complete record exceeds page byte bound; use source pages"); } break;
    }
    page.push(entry); nextOffset += 1;
  }
  const result = { schema: "easyeda-pro-control.supplied-pcb-stack-rules.v1", member: item.member, sourceSha256: item.sha256,
    sourceFormat: parsed.format, sourceVersion: parsed.version, ...summary, section, totalSelectedRecords: rows.length,
    offsetUnit: "selected-record-entry", offset, nextOffset, endOfRecords: nextOffset === rows.length,
    completeRecordsReturned: offset === 0 && nextOffset === rows.length, records: page,
    numericConvention: "exact-raw-record-text;no-unit-or-layer-id-normalization", unknownRecordsPreservedInSource: true,
    materializedSourceOnly: true, sourceCompletenessIndependentlyVerified: false, loadedStateVerified: false,
    physicalStackVerified: false, effectiveRulesEvaluated: false, electricalConnectivityVerified: false,
    executionAuthorized: false, saveAuthorized: false };
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > 64 * 1024) { refuse("complete report byte bound; use source pages"); }
  return result;
}

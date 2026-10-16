/** Exact data premises for the current fresh linked-sheet initialization path.
 * This is not a live startup issuer. The original generation and retained native
 * receiver checks must separately establish that this input was loaded.
 */
import { z } from "zod";
import { canonicalJson, isRecord } from "./core.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "./native-history.ts";

const uuid = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
// oxlint-disable-next-line no-control-regex -- Native part identifiers must exclude control characters, not interpret them as input commands.
const partId = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
const templateSchema = z.object({ uuid, docType: z.union([z.literal(2), z.literal(18), z.literal(20)]), partId }).strict();
export const currentSymbolStartupExpectationSchema = z.object({
  // A linked page has already instantiated SCH's otherwise lazy doc manager.
  sheetUuids: z.array(uuid).min(1).max(128),
  templates: z.array(templateSchema).max(128),
}).strict().superRefine((value, context) => {
  if (new Set(value.sheetUuids).size !== value.sheetUuids.length || new Set(value.templates.map((entry) => entry.uuid)).size !== value.templates.length) {
    context.addIssue({ code: "custom", message: "Startup identities must be unique." });
  }
});
export type CurrentSymbolStartupExpectation = z.infer<typeof currentSymbolStartupExpectationSchema>;

function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current symbol startup requires the supported no-repair input."); } }
function metadata(document: NativeDocumentSnapshot): Readonly<Record<string, unknown>> {
  const values = document.records.filter((entry) => entry.id === "META" || entry.type === "META");
  need(values.length === 1 && values[0]?.id === "META" && values[0].type === "META");
  return values[0].body;
}
function selected(documents: readonly NativeDocumentSnapshot[], id: unknown, type: string): NativeDocumentSnapshot {
  need(typeof id === "string" && uuid.safeParse(id).success);
  const values = documents.filter((entry) => entry.uuid === id);
  need(values.length === 1 && values[0]?.docType === type && !isNativeDocumentDeleted(values[0]));
  return values[0];
}
function reference(records: readonly NativeObjectSnapshot[], componentId: string, key: string, required: boolean): string | null {
  const values = records.filter((entry) => entry.type === "ATTR" && entry.body["parentId"] === componentId && entry.body["key"] === key);
  need(values.length <= 1 && (!required || values.length === 1));
  const value = values[0]?.body["value"];
  if (!required && (value === undefined || value === null || value === "")) { return null; }
  need(typeof value === "string" && uuid.safeParse(value).success); return value;
}

/** SCH4420061 only enqueues an initial component repair when its selected part
 * changes. Require a direct symbol, no COMPONENT attribute overrides, exactly
 * one explicitly stored PART and no foreign part memberships. Even an abnormal
 * single part has no alternate part to select. No symbol getter is evaluated.
 * Deletion is resolved by the maintained materializer, never raw type counts.
 * This deliberately excludes multipart, block symbols, simulation and imports.
 */
export function selectCurrentSymbolStartupExpectation(history: NativeHistorySnapshot): CurrentSymbolStartupExpectation {
  need(history.documents.length <= 4096 && new Set(history.documents.map((entry) => entry.uuid)).size === history.documents.length);
  const sheetUuids: string[] = [], templates = new Map<string, CurrentSymbolStartupExpectation["templates"][number]>();
  const active = history.documents.filter((document) => !isNativeDocumentDeleted(document));
  need(active.every((document) => document.docType !== "SIMULATION"));
  for (const page of active.filter((document) => document.docType === "SCH_PAGE")) {
    const meta = metadata(page);
    // Active unlinked pages are excluded too, so native skipped-page behavior
    // Cannot hide unsupported metadata from this complete fresh-page model.
    selected(history.documents, meta["schematic"], "SCH"); sheetUuids.push(page.uuid);
    need(page.records.length <= 100_000 && new Set(page.records.map((entry) => entry.id)).size === page.records.length);
    for (const component of page.records.filter((entry) => entry.type === "COMPONENT")) {
      need(isRecord(component.body["attrs"]) && Reflect.ownKeys(component.body["attrs"]).length === 0);
      const symbolId = reference(page.records, component.id, "Symbol", true);
      const symbol = selected(history.documents, symbolId, "SYMBOL"), symbolMeta = metadata(symbol);
      const type = symbolMeta["docType"];
      need(type === 2 || type === 18 || type === 20);
      const parts = symbol.records.filter((entry) => entry.type === "PART");
      const part = parts[0];
      need(parts.length === 1 && part !== undefined && partId.safeParse(part.id).success && component.body["partId"] === part.id);
      for (const record of symbol.records) {
        const membership = record.body["partId"];
        need(membership === undefined || membership === "" || membership === part.id);
      }
      const deviceId = reference(page.records, component.id, "Device", false);
      if (deviceId !== null) {
        const deviceMeta = metadata(selected(history.documents, deviceId, "DEVICE"));
        const attributes = deviceMeta["attributes"];
        need(isRecord(attributes) && attributes["Symbol"] === symbol.uuid);
        const footprint = attributes["Footprint"];
        if (footprint !== undefined && footprint !== "") { selected(history.documents, footprint, "FOOTPRINT"); }
      }
      const footprint = reference(page.records, component.id, "Footprint", false);
      if (footprint !== null) { selected(history.documents, footprint, "FOOTPRINT"); }
      const expected: CurrentSymbolStartupExpectation["templates"][number] = { uuid: symbol.uuid, docType: type, partId: part.id };
      need(!templates.has(symbol.uuid) || canonicalJson(templates.get(symbol.uuid)) === canonicalJson(expected));
      templates.set(symbol.uuid, expected);
    }
  }
  const result = currentSymbolStartupExpectationSchema.parse({ sheetUuids: sheetUuids.toSorted(), templates: [...templates.values()].toSorted((a, b) => a.uuid.localeCompare(b.uuid)) });
  for (const item of result.templates) { Object.freeze(item); }
  Object.freeze(result.sheetUuids); Object.freeze(result.templates); return Object.freeze(result);
}

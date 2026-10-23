import { z } from "zod";

import { extensionApiSnapshots } from "./extension-api-catalog-data.ts";
import type { ApiDeclarationMethod, ApiDeclarationNamespace, ApiDeclarationSnapshot } from "./extension-api-declarations.ts";

export const extensionApiCatalogInputSchema = z.object({
  reference: z.enum(["reviewed-installed", "official-latest", "installed-209"]).default("reviewed-installed"),
  namespace: z.string().regex(/^(?:dmt|lib|pcb|pnl|sch|sys)_[A-Za-z0-9]+$/u).optional(),
  search: z.string().min(1).max(100).optional(),
  kind: z.enum(["methods", "types"]).default("methods"),
  offset: z.number().int().min(0).max(10_000).default(0),
  limit: z.number().int().min(1).max(100).default(25),
  detail: z.boolean().default(false),
}).strict();

export const extensionApiCatalogQuerySchema = z.custom<Record<string, unknown>>((input) => {
  if (input === null || typeof input !== "object" || Array.isArray(input)) { return false; }
  const prototype: unknown = Object.getPrototypeOf(input);
  return (prototype === Object.prototype || prototype === null) && !["__proto__", "constructor", "prototype"].some((key) => Object.hasOwn(input, key));
}).pipe(extensionApiCatalogInputSchema);

type CatalogRisk = "unknown" | "read-candidate" | "design-write" | "navigation" | "export" | "calculation" | "system-resource";
const MAX_ENTRY_BYTES = 49_152;
const MAX_RESPONSE_BYTES = 65_536;

export interface ExtensionApiCatalogEntry {
  path: string;
  namespace?: string;
  className?: string;
  name?: string;
  kind?: string;
  risk?: CatalogRisk;
  riskBasis?: string;
  declared: true;
  executable: false;
  runtimeAvailability: "not-probed";
  validation: "declaration-only";
  documentationUrl: string;
  signature?: string;
  sourceLine?: number;
  stabilityTags?: string[];
  receiverClassAlternatives?: string[];
  inputSchema?: null;
  inputSchemaNote?: string;
}

export interface ExtensionApiCatalogResult {
  schema: string;
  edition: "pro";
  offline: true;
  invocationEnabled: false;
  provenance: Omit<ApiDeclarationSnapshot, "namespaces" | "types">;
  limitations: string[];
  totals: { namespaces: number; methods: number; types: number };
  namespaces: { name: string; classNames: string[]; declaredMethods: number }[];
  page: { kind: "methods" | "types"; offset: number; limit: number; totalMatched: number; returned: number; nextOffset: number | null; detail: boolean; maxEntryBytes: number; maxResponseBytes: number };
  entries: ExtensionApiCatalogEntry[];
}

/** Names classify documentation for triage, not native behavior or authority. */
function advisoryRisk(namespace: string, name: string): CatalogRisk {
  if (/^(?:request|send|register|publish|subscribe|execute|call|import|save|download|open|close|set|create|delete|remove)/u.test(name) && namespace.startsWith("sys_")) { return "system-resource"; }
  if (/^(?:get.*File|export|generate.*File)/u.test(name)) { return "export"; }
  if (/^(?:open|close|activate|zoom|moveDocument|createSplitScreen|mergeAllDocument|tileAllDocument)/u.test(name)) { return "navigation"; }
  if (/^(?:create|modify|delete|remove|set|update|clear|rebuild|import|copy|move|rotate|mirror|flip|align|distribute)/u.test(name)) { return "design-write"; }
  if (/^(?:calculate|check|run|compile|autoRoute|autoLayout|simulate)/u.test(name)) { return "calculation"; }
  if (/^(?:get|is|has|find|search|query|list)/u.test(name)) { return "read-candidate"; }
  return "unknown";
}

function methodEntry(namespace: ApiDeclarationNamespace, method: ApiDeclarationMethod, detail: boolean): ExtensionApiCatalogEntry {
  const entry: ExtensionApiCatalogEntry = {
    path: `eda.${namespace.name}.${method.name}`, namespace: namespace.name, className: method.className,
    risk: advisoryRisk(namespace.name, method.name), riskBasis: "method-name-heuristic-not-an-authorization",
    declared: true, executable: false, runtimeAvailability: "not-probed", validation: "declaration-only",
    documentationUrl: `https://prodocs.easyeda.com/en/api/reference/pro-api.${method.className.toLowerCase()}.${method.name.toLowerCase()}.html`,
  };
  if (detail) {
    entry.signature = method.signature;
    entry.sourceLine = method.sourceLine;
    entry.stabilityTags = [...method.tags];
    entry.receiverClassAlternatives = [...namespace.classNames];
    entry.inputSchema = null;
    entry.inputSchemaNote = "TypeScript signature, not a JSON argument schema; obtain the strict facade operation schema for execution.";
  }
  return entry;
}

function snapshotMetadata(snapshot: ApiDeclarationSnapshot): Omit<ApiDeclarationSnapshot, "namespaces" | "types"> {
  const { namespaces: _namespaces, types: _types, ...metadata } = snapshot;
  return metadata;
}

/** Offline, literal-search and bounded output; no native/bridge objects enter
 * this route. Catalog queries remain usable during connection quarantine.
 */
export function queryExtensionApiCatalog(input: unknown = {}): ExtensionApiCatalogResult {
  const query = extensionApiCatalogQuerySchema.parse(input);
  const snapshot = extensionApiSnapshots.find((entry) => entry.reference === query.reference);
  if (!snapshot) { throw new Error("Requested declaration snapshot is unavailable."); }
  if (query.namespace !== undefined && !snapshot.namespaces.some((entry) => entry.name === query.namespace)) { throw new Error("Namespace is absent from the selected declaration snapshot."); }
  if (query.kind === "types" && query.namespace !== undefined) { throw new Error("Type queries do not accept a namespace; use a literal search."); }
  const search = query.search?.toLowerCase();
  const entries: ExtensionApiCatalogEntry[] = query.kind === "types"
    ? snapshot.types.filter((entry) => search === undefined || entry.name.toLowerCase().includes(search)).map((entry) => ({ path: entry.name, name: entry.name, kind: entry.kind, sourceLine: entry.sourceLine,
      documentationUrl: `https://prodocs.easyeda.com/en/api/reference/pro-api.${entry.name.toLowerCase()}.html`, declared: true, executable: false, runtimeAvailability: "not-probed", validation: "declaration-only" }))
    : snapshot.namespaces.filter((entry) => query.namespace === undefined || entry.name === query.namespace).flatMap((namespace) => namespace.methods
      .filter((method) => search === undefined || `${namespace.name}.${method.name} ${method.signature}`.toLowerCase().includes(search))
      .map((method) => methodEntry(namespace, method, query.detail)));
  const page: ExtensionApiCatalogEntry[] = [];
  let bytes = 2;
  for (const entry of entries.slice(query.offset, query.offset + query.limit)) {
    const entryBytes = Buffer.byteLength(JSON.stringify(entry), "utf8") + (page.length === 0 ? 0 : 1);
    if (entryBytes + 2 > MAX_ENTRY_BYTES) { throw new Error("Declaration entry exceeds the catalog response budget."); }
    if (bytes + entryBytes > MAX_ENTRY_BYTES) { break; }
    page.push(entry);
    bytes += entryBytes;
  }
  const nextOffset = query.offset + page.length;
  const result: ExtensionApiCatalogResult = {
    schema: "easyeda-pro-control.extension-api-catalog.v1", edition: "pro", offline: true, invocationEnabled: false,
    provenance: snapshotMetadata(snapshot),
    limitations: ["Declaration metadata is not runtime availability, implementation correctness, execution support or live validation.",
      "official-latest is reference material only; it does not change the reviewed runtime compatibility tuple.",
      "installed-209 records the exact 3.2.209 declaration separately; its wrappers and declared methods do not admit any runtime or backend route.",
      "Heuristic risk labels do not authorize even getters; use supported typed facade routes and their strict schemas.",
      "Documentation URLs refer to the current official site, which can differ from every frozen declaration snapshot."],
    totals: { namespaces: snapshot.namespaces.length, methods: snapshot.namespaces.reduce((sum, entry) => sum + entry.methods.length, 0), types: snapshot.types.length },
    namespaces: snapshot.namespaces.filter((namespace) => query.kind === "methods" && (query.namespace === undefined || namespace.name === query.namespace) &&
      (search === undefined || namespace.methods.some((method) => `${namespace.name}.${method.name} ${method.signature}`.toLowerCase().includes(search))))
      .map((entry) => ({ name: entry.name, classNames: [...entry.classNames], declaredMethods: entry.methods.length })),
    page: { kind: query.kind, offset: query.offset, limit: query.limit, totalMatched: entries.length, returned: page.length,
      nextOffset: nextOffset < entries.length ? nextOffset : null, detail: query.detail, maxEntryBytes: MAX_ENTRY_BYTES, maxResponseBytes: MAX_RESPONSE_BYTES },
    entries: page,
  };
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > MAX_RESPONSE_BYTES) { throw new Error("Declaration metadata exceeds the catalog response budget."); }
  return result;
}

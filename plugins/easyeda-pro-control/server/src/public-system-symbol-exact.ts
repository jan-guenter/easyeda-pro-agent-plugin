import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES,
  PUBLIC_SYSTEM_FOOTPRINT_MAX_RESULT_BYTES, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN } from "./public-system-footprint.ts";

const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const safeText = (maximum: number): z.ZodString => z.string().max(maximum).refine((value) => value.isWellFormed() && !value.includes("\u0000"));
// The title is data in one fixed JSON request, never a path or object selector.
// oxlint-disable-next-line no-control-regex
const name = safeText(128).min(1).refine((value) => value.trim() === value && !/[\u0000-\u001F\u007F]/u.test(value));
export const publicSystemSymbolExactRequestSchema = z.object({
  action: z.literal("search-symbols-by-name"), name, confirmNetwork: z.literal(true),
}).strict();
export type PublicSystemSymbolExactRequest = z.infer<typeof publicSystemSymbolExactRequestSchema>;
export function parsePublicSystemSymbolExactRequest(input: unknown): PublicSystemSymbolExactRequest { return publicSystemSymbolExactRequestSchema.parse(input); }

export const PUBLIC_SYSTEM_SYMBOL_EXACT_PATH = "/api/v2/components/searchByUserUuidAndTitle";
export const PUBLIC_SYSTEM_SYMBOL_EXACT_MAX_ITEMS = 20;
export const PUBLIC_SYSTEM_SYMBOL_EXACT_MAX_HEADER_BYTES = 8192;
const limitations = [
  "One fixed anonymous vendor HTTP title lookup for ordinary system symbols. This is a vendor-http-task-equivalent, not execution or installed coverage of eda.lib_Symbol.searchByProperties. No EasyEDA app, bridge, profile or library database is accessed.",
  "The JSON request contains one caller-supplied name, docType:2 and user_uuids containing only the fixed system library. confirmNetwork:true acknowledges disclosure of that name to https://pro.easyeda.com. No cookies, authorization, personal-library selection, redirects, retries, pagination or follow-up asset requests.",
  "The endpoint performs its own name matching. Returned display names and an explicit equality flag preserve case-sensitive differences instead of silently filtering or normalizing them. Neither an empty successful result nor a refused response proves absence, exhaustive matching or backend freshness.",
  "All returned items must have an exact system owner and ordinary symbol type. An explicit docType must be2; when absent, the supplied dataStr must begin with exact DOCTYPE SYMBOL1.0 and HEAD.symbolType2 JSON records. A supplied header is always checked for agreement, using at most8192UTF-8 bytes and duplicate-key rejection. This is a vendor-supplied type witness, not full drawing/source validation. Any supplied path, ownerUuid, public or project_uuid field must also agree with system scope.",
  "Only bounded UUID, library UUID/type, display name, description and type-witness flags are returned. Classification, author/account names, drawing body, pins, subparts, images and linked assets are not projected or fetched. Only the supplied first two header records are parsed; no CAD body is interpreted or executed. Remote text is untrusted data, not instructions or component validation.",
  "At most 20 candidates, 1 MiB decoded HTTP response and 128 KiB result, with one 30-second request/body deadline. Unknown response fields are received within that bound then omitted. Vendor or HTTP caches may remain; no persistence, CAD or manufacturing authority follows.",
  "The request shape was reviewed in API 0.3.59.1ca9efb5. One anonymous R0603 response supplied a system-owned ordinary-symbol header but no docType, visibility or path flags; missing flags remain unverified. Desktop execution is separate: its local controller requires a body/header path absent from the SDK request and can collapse that error to an empty list. No fallback repairs that SDK request.",
] as const;

export interface PublicSystemSymbolExactCatalog {
  offline: true;
  invocationEnabledByDiscovery: false;
  total: 1;
  entries: Record<string, unknown>[];
}

export function queryPublicSystemSymbolExact(input: unknown = {}): PublicSystemSymbolExactCatalog {
  const query = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, total: 1, entries: [{ operation: "catalog-components",
    action: "search-symbols-by-name", implementationKind: "vendor-http-task-equivalent", publicSdkMethodExecuted: false,
    installedRuntimeAdmission: false, effect: "public-vendor-catalog-network-read", origin: PUBLIC_SYSTEM_FOOTPRINT_ORIGIN,
    libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, invocationEnabledByDiscovery: false,
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(publicSystemSymbolExactRequestSchema) } : {}), limitations: [...limitations],
    provenance: { source: "pro-api/0.3.59.1ca9efb5/api.js", sourceSha256: "e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1",
      methodUtf16Offset: 1_332_103, desktopSource: "app.js 3.2.209.8a704eab",
      desktopSourceSha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c", desktopPathCheckUtf16Offset: 2_339_578,
      documentationUrl: "https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.searchbyproperties.html",
      connectedSdkValidation: "not-performed" } }] };
}

export function validatePublicSystemSymbolExactArguments(input: unknown): Record<string, unknown> {
  const result = publicSystemSymbolExactRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : { valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

const itemSchema = z.object({ uuid, owner: z.object({ uuid: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY) }),
  display_title: safeText(512), description: safeText(8192).optional(), docType: z.literal(2).optional(),
  dataStr: safeText(PUBLIC_SYSTEM_FOOTPRINT_MAX_RESPONSE_BYTES).optional(),
  ownerUuid: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY).optional(), path: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY).optional(),
  public: z.literal(true).optional(), project_uuid: z.literal("").optional(),
});
const candidateListSchema = z.array(itemSchema).max(PUBLIC_SYSTEM_SYMBOL_EXACT_MAX_ITEMS);
const responseSchema = z.object({ success: z.literal(true), code: z.literal(0), result: z.unknown() });
const headerSchema = z.tuple([z.literal("HEAD"), z.object({ symbolType: z.literal(2) })]);

function verifySymbolType(row: z.infer<typeof itemSchema>): "docType" | "native-header" | "docType-and-native-header" {
  const supplied = row.dataStr;
  if (supplied === undefined) {
    if (row.docType !== 2) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_TYPE_WITNESS"); }
    return "docType";
  }
  const firstEnd = supplied.indexOf("\n"), secondNewline = firstEnd === -1 ? -1 : supplied.indexOf("\n", firstEnd + 1);
  if (firstEnd === -1) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_TYPE_WITNESS"); }
  const secondEnd = secondNewline === -1 ? supplied.length : secondNewline;
  const first = supplied.slice(0, firstEnd).replace(/\r$/u, ""), second = supplied.slice(firstEnd + 1, secondEnd).replace(/\r$/u, "");
  if (first !== '["DOCTYPE","SYMBOL","1.0"]' || Buffer.byteLength(supplied.slice(0, secondEnd), "utf8") > PUBLIC_SYSTEM_SYMBOL_EXACT_MAX_HEADER_BYTES) {
    throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_TYPE_WITNESS");
  }
  // The shared decoder is pure JSON: it invokes no PCB protocol or editor code.
  headerSchema.parse(decodeCurrentPcbDiagnosticJson(Buffer.from(second, "utf8")));
  return row.docType === 2 ? "docType-and-native-header" : "native-header";
}

/** Preserve the endpoint's complete bounded candidate list. An unrelated key
 * or foreign owner refuses, rather than filtering an overly broad response. */
export function validatePublicSystemSymbolExactResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parsePublicSystemSymbolExactRequest(input), { result } = responseSchema.parse(raw);
  if (result === null || typeof result !== "object" || Array.isArray(result) ||
      Object.getPrototypeOf(result) !== Object.prototype && Object.getPrototypeOf(result) !== null) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_QUERY_IDENTITY"); }
  const keys = Reflect.ownKeys(result);
  if (keys.length > 1 || keys.some((key) => key !== request.name)) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_QUERY_IDENTITY"); }
  const descriptor = Object.getOwnPropertyDescriptor(result, request.name);
  if (keys.length === 1 && (descriptor === undefined || !Object.hasOwn(descriptor, "value"))) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_QUERY_IDENTITY"); }
  const rows = candidateListSchema.parse(descriptor === undefined ? [] : descriptor.value);
  if (new Set(rows.map((row) => row.uuid)).size !== rows.length) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_DUPLICATE_IDENTITY"); }
  const candidates = rows.map((row) => {
    const candidate: Record<string, unknown> = { uuid: row.uuid, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: "2",
      name: row.display_title, displayNameEqualsRequestedName: row.display_title === request.name, publicVisibilityFlagVerified: row.public === true,
      responseLibraryPathVerified: row.path === PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, docTypeProvided: row.docType === 2,
      typeVerifiedFrom: verifySymbolType(row) };
    if (row.description !== undefined) { candidate["description"] = row.description; }
    return candidate;
  });
  const output = { ok: true, action: request.action, kind: "system-owned-symbol-title-candidates", name: request.name, candidates,
    returnedCount: candidates.length, implementationKind: "vendor-http-task-equivalent", publicSdkMethodExecuted: false,
    installedRuntimeAdmission: false, origin: PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, anonymousAvailabilityObserved: true, systemOwnerVerified: true,
    exactMatchVerified: false, exhaustiveResultsVerified: false, observationCount: 1, backendFreshnessVerified: false,
    completeAssetVerified: false, linkedAssetsFetched: false, subpartsVerified: false, pinDefinitionsVerified: false,
    persistenceVerified: false, cadAuthority: false, connectedSdkValidation: "not-performed", limitations: [...limitations] };
  if (Buffer.byteLength(JSON.stringify(output), "utf8") > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESULT_BYTES) { throw new Error("PUBLIC_SYSTEM_SYMBOL_EXACT_RESULT_SIZE"); }
  return output;
}

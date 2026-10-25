import { z } from "zod";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_ORIGIN } from "./public-system-footprint.ts";

export const PUBLIC_SYSTEM_LOOKUP_MAX_CANDIDATES = 5;
export const PUBLIC_SYSTEM_LOOKUP_MAX_REQUESTS = 6;
export const PUBLIC_SYSTEM_LOOKUP_FOOTPRINT_PATH = "/api/v2/components/searchByUserUuidAndTitle";
export const PUBLIC_SYSTEM_LOOKUP_LCSC_PATH = "/api/devices/searchByCodes";
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const text = (maximum: number): z.ZodString => z.string().max(maximum).refine((value) => value.isWellFormed() && !value.includes("\u0000"));
// The name is one JSON value, never a URL segment or library selector.
// oxlint-disable-next-line no-control-regex
const name = text(128).min(1).refine((value) => value.trim() === value && !/[\u0000-\u001F\u007F]/u.test(value));
const code = z.string().regex(/^C[1-9]\d{0,9}$/u);
export const publicSystemFootprintNameRequestSchema = z.object({ action: z.literal("search-footprints-by-name"),
  name, confirmNetwork: z.literal(true) }).strict();
export const publicSystemLcscRequestSchema = z.object({ action: z.literal("get-devices-by-lcsc-ids"),
  lcscIds: z.array(code).min(1).max(PUBLIC_SYSTEM_LOOKUP_MAX_CANDIDATES).refine((values) => new Set(values).size === values.length),
  confirmNetwork: z.literal(true) }).strict();
export const publicSystemLibraryLookupRequestSchema = z.discriminatedUnion("action", [publicSystemFootprintNameRequestSchema, publicSystemLcscRequestSchema]);
export type PublicSystemLibraryLookupRequest = z.infer<typeof publicSystemLibraryLookupRequestSchema>;

export const PUBLIC_SYSTEM_LIBRARY_LOOKUP_LIMITATIONS = [
  "Application-independent vendor HTTP task equivalents, not execution of lib_Footprint.searchByProperties or lib_Device.getByLcscIds. The app, bridge, desktop databases and user profile are not accessed.",
  "One explicitly confirmed name or one to five distinct uppercase LCSC C numbers is disclosed to fixed https://pro.easyeda.com. Requests have no cookies, credentials, arbitrary URL/library, redirects, retries, pagination, desktop fallback or automatic authentication.",
  "The initial lookup can omit type or ownership witnesses. Every returned UUID therefore requires a separate fixed metadata GET. At most five complete candidates and six total requests share one 30-second deadline and 1 MiB aggregate decoded-body budget. Any overflow, contradictory identity, missing witness or later failure refuses the entire result; no partial candidates are returned.",
  "Footprint lookup sends one title, docType4 and the fixed system owner, then requires exact system-owned public footprint metadata. LCSC lookup sends codes and the fixed system path, retains all returned matches, and requires exact code and symbol/footprint-reference agreement with system-owned ordinary device metadata. Duplicate candidate UUIDs refuse instead of being deduplicated.",
  "Metadata GETs fetch candidate metadata only; linked symbol/footprint assets, geometry, images, 3D, datasheets, prices and stock are not followed or projected. Inline source can be received within the aggregate bound but is not parsed as CAD or executed. References do not prove pin-to-pad mapping, component suitability or manufacturing readiness.",
  "Sequential vendor responses are not an atomic snapshot. Supported identity/name fields must agree, but backend freshness, exact footprint-name matching, exhaustive results, full asset correctness and persistence remain unverified. Empty results do not prove absence. Missing optional public/path flags on device metadata remain disclosed as unverified.",
  "Initial anonymous lookup responses were observed during development; they did not contain enough witnesses to establish the final result. The composed enrichment route and installed execution need separate live validation. Source and offline tests grant no CAD authority.",
] as const;

export function queryPublicSystemLibraryLookups(input: unknown = {}): { entries: Record<string, unknown>[] } {
  const query = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  const entries: Record<string, unknown>[] = [];
  for (const schema of [publicSystemFootprintNameRequestSchema, publicSystemLcscRequestSchema]) { entries.push({
    operation: "catalog-components", action: schema.shape.action.value, implementationKind: "vendor-http-task-equivalent",
    publicSdkMethodExecuted: false, installedRuntimeAdmission: false, effect: "public-vendor-catalog-network-read",
    origin: PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, invocationEnabledByDiscovery: false,
    maximumRequests: PUBLIC_SYSTEM_LOOKUP_MAX_REQUESTS, maximumCandidates: PUBLIC_SYSTEM_LOOKUP_MAX_CANDIDATES,
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(schema) } : {}), limitations: [...PUBLIC_SYSTEM_LIBRARY_LOOKUP_LIMITATIONS],
    provenance: { source: "pro-ui/3.2.198.2800f583/js/ui.js", sourceSha256: "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
      footprintLookupUtf16Offset: 17_393_752, lcscLookupUtf16Offset: 17_212_136, publicSdkMethodExecuted: false,
      documentationUrl: schema.shape.action.value === "search-footprints-by-name" ?
        "https://prodocs.easyeda.com/en/api/reference/pro-api.lib_footprint.searchbyproperties.html" :
        "https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.getbylcscids.html" },
  }); }
  return { entries };
}

const owner = z.object({ uuid: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY) });
const identity = { owner: owner.optional(), owner_uuid: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY).optional(),
  ownerUuid: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY).optional(), path: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY).optional(),
  project_uuid: z.literal("").optional(), public: z.literal(true).optional() };
const footprintCandidate = z.object({ uuid, ...identity, owner, display_title: text(512), description: text(8192).optional(), docType: z.literal(4).optional() });
const association = z.object({ uuid, ...identity, display_title: text(512).optional() });
const deviceCandidate = z.object({ uuid, ...identity, product_code: code, display_title: text(512).optional(),
  symbol_type: z.literal(2).optional(), footprint_type: z.literal(4).optional(),
  attributes: z.object({ "Supplier Part": code, Symbol: uuid, Footprint: uuid }),
  symbol: association.extend({ docType: z.literal(2).optional() }).optional(),
  footprint: association.extend({ docType: z.literal(4).optional() }).optional(),
  symbol_info: association.extend({ docType: z.literal(2).optional() }).optional(),
  footprint_info: association.extend({ docType: z.literal(4).optional() }).optional() });
const envelope = z.object({ success: z.literal(true), code: z.literal(0), result: z.unknown() });
export interface PublicSystemLookupCandidate { uuid: string; name?: string; description?: string; lcscId?: string; symbolUuid?: string; footprintUuid?: string }

/** This validates the complete initial list, but grants no owner/type proof
 * for its unwitnessed fields. Every candidate still needs exact metadata. */
export function parsePublicSystemLookupCandidates(input: unknown, raw: unknown): PublicSystemLookupCandidate[] {
  const request = publicSystemLibraryLookupRequestSchema.parse(input), { result } = envelope.parse(raw);
  const candidates: PublicSystemLookupCandidate[] = [];
  if (request.action === "search-footprints-by-name") {
    if (result === null || typeof result !== "object" || Array.isArray(result) ||
        Object.getPrototypeOf(result) !== Object.prototype && Object.getPrototypeOf(result) !== null) { throw new Error("PUBLIC_SYSTEM_LOOKUP_TITLE_IDENTITY"); }
    const keys = Reflect.ownKeys(result);
    const descriptor = Object.getOwnPropertyDescriptor(result, request.name);
    if (keys.length > 1 || keys.some((key) => key !== request.name) ||
        keys.length === 1 && (descriptor === undefined || !Object.hasOwn(descriptor, "value"))) { throw new Error("PUBLIC_SYSTEM_LOOKUP_TITLE_IDENTITY"); }
    const rows = z.array(footprintCandidate).max(PUBLIC_SYSTEM_LOOKUP_MAX_CANDIDATES).parse(descriptor === undefined ? [] : descriptor.value);
    for (const row of rows) { candidates.push({ uuid: row.uuid, name: row.display_title,
      ...(row.description === undefined ? {} : { description: row.description }) }); }
  } else {
    for (const row of z.array(deviceCandidate).max(PUBLIC_SYSTEM_LOOKUP_MAX_CANDIDATES).parse(result)) {
      if (!request.lcscIds.includes(row.product_code) || row.attributes["Supplier Part"] !== row.product_code ||
          row.symbol !== undefined && row.symbol.uuid !== row.attributes.Symbol ||
          row.footprint !== undefined && row.footprint.uuid !== row.attributes.Footprint ||
          row.symbol_info !== undefined && row.symbol_info.uuid !== row.attributes.Symbol ||
          row.footprint_info !== undefined && row.footprint_info.uuid !== row.attributes.Footprint) { throw new Error("PUBLIC_SYSTEM_LOOKUP_CODE_IDENTITY"); }
      candidates.push({ uuid: row.uuid, lcscId: row.product_code, symbolUuid: row.attributes.Symbol, footprintUuid: row.attributes.Footprint,
        ...(row.display_title === undefined ? {} : { name: row.display_title }) });
    }
  }
  if (new Set(candidates.map((candidate) => candidate.uuid)).size !== candidates.length) { throw new Error("PUBLIC_SYSTEM_LOOKUP_DUPLICATE_IDENTITY"); }
  return candidates;
}

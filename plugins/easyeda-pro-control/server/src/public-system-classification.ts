import { createHash } from "node:crypto";
import { z } from "zod";
import { PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, PUBLIC_SYSTEM_FOOTPRINT_MAX_RESULT_BYTES,
  PUBLIC_SYSTEM_FOOTPRINT_ORIGIN } from "./public-system-footprint.ts";

// The observed public footprint tree is 2,123,118 decoded bytes / 8,662 rows.
// This independent complete-tree envelope does not widen the catalog body cap.
export const PUBLIC_SYSTEM_CLASSIFICATION_MAX_RESPONSE_BYTES = 8_388_608;
export const PUBLIC_SYSTEM_CLASSIFICATION_MAX_ROWS = 32_768;
export const PUBLIC_SYSTEM_CLASSIFICATION_MAX_PAGE_ROWS = 100;
export const PUBLIC_SYSTEM_CLASSIFICATION_PATH = "/api/categories";
export const PUBLIC_SYSTEM_CLASSIFICATION_ACTIONS = Object.freeze([
  "get-classification-tree", "get-classification-index-by-name", "get-classification-name-by-uuid", "get-classification-name-by-index",
] as const);
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const libraryType = z.enum(["2", "3", "4", "5"]);
const text = (maximum: number): z.ZodString => z.string().max(maximum)
  .refine((value) => value.isWellFormed() && !value.includes("\u0000"));
const name = text(512).min(1);
const common = { libraryType, confirmNetwork: z.literal(true), expectedTreeSha256: digest.optional() };
const treeSchema = z.object({ action: z.literal("get-classification-tree"), ...common,
  offset: z.number().int().min(0).max(PUBLIC_SYSTEM_CLASSIFICATION_MAX_ROWS).default(0),
  limit: z.number().int().min(1).max(PUBLIC_SYSTEM_CLASSIFICATION_MAX_PAGE_ROWS).default(50) }).strict();
const indexSchema = z.object({ action: z.literal("get-classification-index-by-name"), ...common,
  primaryClassificationName: name, secondaryClassificationName: name.optional() }).strict();
const uuidSchema = z.object({ action: z.literal("get-classification-name-by-uuid"), ...common,
  primaryClassificationUuid: uuid, secondaryClassificationUuid: uuid.optional() }).strict();
const indexNameSchema = z.object({ action: z.literal("get-classification-name-by-index"), ...common,
  classificationIndex: z.object({ libraryUuid: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY).optional(), libraryType: libraryType.optional(),
    primaryClassificationUuid: uuid, secondaryClassificationUuid: uuid.optional() }).strict() }).strict().superRefine((value, context) => {
  if (value.classificationIndex.libraryType !== undefined && value.classificationIndex.libraryType !== value.libraryType) {
    context.addIssue({ code: "custom", path: ["classificationIndex", "libraryType"], message: "Index and requested library categories must agree." });
  }
});
export const publicSystemClassificationSchemas = Object.freeze([treeSchema, indexSchema, uuidSchema, indexNameSchema] as const);
export const publicSystemClassificationRequestSchema = z.discriminatedUnion("action", publicSystemClassificationSchemas);
export type PublicSystemClassificationRequest = z.infer<typeof publicSystemClassificationRequestSchema>;

const limitations = [
  "Fixed public system-library category metadata, not execution of an eda.lib_Classification method or admission of a desktop SDK receiver. Only library categories 2, 3, 4 and 5; no personal, team, favorite, project or extension-defined library.",
  "One explicitly confirmed anonymous GET to fixed https://pro.easyeda.com/api/categories with fixed system user_uuid/path, one type[] and the fixed path header. No credentials, cookies, redirects, retry, alternate endpoint, automatic pagination, app launch, file access, preference, navigation, CAD write or Save.",
  "The complete received two-level row set is recognized before projection: at most 8 MiB decoded body and 32768 rows, unique UUIDs, exact system owner/type and existing root parents. Unknown fields, orphaned or deeper rows and duplicate IDs refuse. This validates a received catalog, not backend freshness, completeness or manufacturing suitability.",
  "The tree action returns one page of at most 100 flattened parent/child rows plus the digest of the whole validated tree. It does not return the SDK's complete nested array. The optional expectedTreeSha256 rejects changed snapshots; separate requests are separate network observations, never an atomic cross-request snapshot. Names remain exact vendor names and are not translated or normalized.",
  "Name and UUID projections require a unique exact matching parent and optional child. A missing parent/child is reported explicitly and is not proof of permanent absence. Duplicate matching names refuse instead of choosing the SDK's first match. Unsupported or failed vendor replies never become an empty successful tree.",
  "Public HTTP availability was observed for footprint category 4. Other admitted category filters follow the same reviewed endpoint but have no recorded anonymous sample. Source, synthetic tests and an anonymous HTTP sample are separate from connected SDK execution or saved-state validation.",
] as const;
const provenance = Object.freeze({ source: "pro-ui/3.2.198.2800f583/js/ui.js",
  sourceSha256: "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
  endpointUtf16Offset: 6_073_931, fetchUtf16Offset: 6_131_412, encoderUtf16Offset: 6_061_646,
  handlersUtf16Offset: 17_197_243, publicSdkMethodExecuted: false });

/** Discovery uses the exact execution schemas and discloses the paged tree subset. */
export function queryPublicSystemClassification(input: unknown = {}): { entries: Record<string, unknown>[] } {
  const query = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  const entries: Record<string, unknown>[] = [];
  for (const schema of publicSystemClassificationSchemas) {
    entries.push({ operation: "catalog-components", action: schema.shape.action.value,
      implementationKind: "vendor-http-task-equivalent", publicSdkMethodExecuted: false, installedRuntimeAdmission: false,
      effect: "public-vendor-catalog-network-read", origin: PUBLIC_SYSTEM_FOOTPRINT_ORIGIN, libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
      invocationEnabledByDiscovery: false, ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(schema) } : {}),
      limits: { maximumResponseBytes: PUBLIC_SYSTEM_CLASSIFICATION_MAX_RESPONSE_BYTES, maximumRows: PUBLIC_SYSTEM_CLASSIFICATION_MAX_ROWS,
        maximumPageRows: PUBLIC_SYSTEM_CLASSIFICATION_MAX_PAGE_ROWS, maximumResultBytes: PUBLIC_SYSTEM_FOOTPRINT_MAX_RESULT_BYTES },
      limitations: [...limitations], provenance });
  }
  return { entries };
}

const rowSchema = z.object({ uuid, user_uuid: z.literal(PUBLIC_SYSTEM_FOOTPRINT_LIBRARY), type: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  parent_uuid: z.union([z.literal(""), uuid]), name, name_cn: text(512),
  szlcsc_id: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  // One row in the complete observed type4 response uses the literal string "0".
  // Admit only that witnessed string; never apply general provider coercion.
  order_no: z.union([z.number().min(-1_000_000_000).max(1_000_000_000), z.literal("0")]),
  updated_at: text(64), created_at: text(64) }).strict();
type CategoryRow = z.infer<typeof rowSchema>;
interface CategoryNode { uuid: string; name: string; parentUuid: string | null; order: number; }
interface CategoryTree { rows: CategoryRow[]; nodes: CategoryNode[]; sha256: string; }

/** Recognize the entire provider row set before any selected or paged result. */
function readTree(request: PublicSystemClassificationRequest, raw: unknown): CategoryTree {
  const envelope = z.object({ success: z.literal(true), code: z.literal(0), result: z.unknown() }).strict().parse(raw);
  if (!Array.isArray(envelope.result) || envelope.result.length > PUBLIC_SYSTEM_CLASSIFICATION_MAX_ROWS) {
    throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_ROWS");
  }
  const rows = z.array(rowSchema).max(PUBLIC_SYSTEM_CLASSIFICATION_MAX_ROWS).parse(envelope.result);
  const byUuid = new Map<string, CategoryRow>();
  for (const row of rows) {
    if (String(row.type) !== request.libraryType || byUuid.has(row.uuid) || Object.is(row.order_no, -0)) {
      throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_IDENTITY");
    }
    byUuid.set(row.uuid, row);
  }
  const children = new Map<string, CategoryRow[]>(), roots: CategoryRow[] = [];
  for (const row of rows) {
    if (row.parent_uuid === "") { roots.push(row); }
    else {
      const parent = byUuid.get(row.parent_uuid);
      if (parent === undefined || parent.parent_uuid !== "" || parent === row) { throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_PARENT"); }
      const siblings = children.get(parent.uuid) ?? []; siblings.push(row); children.set(parent.uuid, siblings);
    }
  }
  const order = (row: CategoryRow): number => row.order_no === "0" ? 0 : row.order_no;
  const byOrder = (left: CategoryRow, right: CategoryRow): number => {
    const compared = order(left) - order(right);
    if (compared !== 0) { return compared; }
    return left.uuid < right.uuid ? -1 : Number(left.uuid > right.uuid);
  };
  const nodes: CategoryNode[] = [];
  for (const root of roots.toSorted(byOrder)) {
    nodes.push({ uuid: root.uuid, name: root.name, parentUuid: null, order: order(root) });
    for (const child of (children.get(root.uuid) ?? []).toSorted(byOrder)) {
      nodes.push({ uuid: child.uuid, name: child.name, parentUuid: root.uuid, order: order(child) });
    }
  }
  const sha256 = createHash("sha256").update(JSON.stringify({ libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY,
    libraryType: request.libraryType, nodes })).digest("hex");
  if (request.expectedTreeSha256 !== undefined && request.expectedTreeSha256 !== sha256) {
    throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_CHANGED");
  }
  return { rows, nodes, sha256 };
}

/** Ambiguous names are refused, rather than silently choosing a provider row. */
function uniqueRow(rows: readonly CategoryRow[], predicate: (row: CategoryRow) => boolean): CategoryRow | undefined {
  const matched = rows.filter((row) => predicate(row));
  if (matched.length > 1) { throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_AMBIGUOUS"); }
  return matched[0];
}

/** Exact parent-child membership is shared by both UUID name selectors. */
function projectNames(request: Exclude<PublicSystemClassificationRequest, { action: "get-classification-tree" | "get-classification-index-by-name" }>,
  tree: CategoryTree): Record<string, unknown> {
  const index = request.action === "get-classification-name-by-index" ? request.classificationIndex : request;
  const parent = uniqueRow(tree.rows, (row) => row.parent_uuid === "" && row.uuid === index.primaryClassificationUuid);
  const child = parent === undefined || index.secondaryClassificationUuid === undefined ? undefined :
    uniqueRow(tree.rows, (row) => row.parent_uuid === parent.uuid && row.uuid === index.secondaryClassificationUuid);
  const found = parent !== undefined && (index.secondaryClassificationUuid === undefined || child !== undefined);
  return { found, ...(found ? { names: { primaryClassificationName: parent.name,
    ...(child === undefined ? {} : { secondaryClassificationName: child.name }) } } : {}) };
}

/** Produce a bounded task result after complete owner, type and tree checks. */
export function validatePublicSystemClassificationResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = publicSystemClassificationRequestSchema.parse(input), tree = readTree(request, raw);
  let projection: Record<string, unknown>;
  if (request.action === "get-classification-tree") {
    const rows = tree.nodes.slice(request.offset, request.offset + request.limit);
    const next = request.offset + rows.length;
    projection = { rows, offset: request.offset, returnedCount: rows.length, nextOffset: next < tree.nodes.length ? next : null,
      treeScope: "one-flattened-page-of-complete-validated-response", completeNestedSdkArrayReturned: false };
  } else if (request.action === "get-classification-index-by-name") {
    const parent = uniqueRow(tree.rows, (row) => row.parent_uuid === "" && row.name === request.primaryClassificationName);
    const child = parent === undefined || request.secondaryClassificationName === undefined ? undefined :
      uniqueRow(tree.rows, (row) => row.parent_uuid === parent.uuid && row.name === request.secondaryClassificationName);
    const found = parent !== undefined && (request.secondaryClassificationName === undefined || child !== undefined);
    projection = { found, ...(found ? { classificationIndex: { libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: request.libraryType,
      primaryClassificationUuid: parent.uuid, ...(child === undefined ? {} : { secondaryClassificationUuid: child.uuid }) } } : {}) };
  } else { projection = projectNames(request, tree); }
  const output = { ok: true, action: request.action, kind: "system-owned-classification-metadata", ...projection,
    libraryUuid: PUBLIC_SYSTEM_FOOTPRINT_LIBRARY, libraryType: request.libraryType, treeSha256: tree.sha256, totalRows: tree.rows.length,
    implementationKind: "vendor-http-task-equivalent", publicSdkMethodExecuted: false, installedRuntimeAdmission: false,
    observationCount: 1, requestCount: 1, systemOwnerVerified: true, completeReceivedTreeValidated: true,
    historicalAnonymousAvailabilitySampled: request.libraryType === "4", historicallySampledLibraryTypes: ["4"],
    backendFreshnessVerified: false, exhaustiveResultsVerified: false,
    atomicCrossRequestSnapshotVerified: false, persistenceVerified: false, cadAuthority: false, connectedSdkValidation: "not-performed",
    limitations: [...limitations] };
  if (Buffer.byteLength(JSON.stringify(output), "utf8") > PUBLIC_SYSTEM_FOOTPRINT_MAX_RESULT_BYTES) {
    throw new Error("PUBLIC_SYSTEM_CLASSIFICATION_RESULT_SIZE");
  }
  return output;
}

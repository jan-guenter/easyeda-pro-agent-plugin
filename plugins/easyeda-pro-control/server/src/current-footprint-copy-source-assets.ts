/** Narrow stored-source asset qualification. Unknown fields remain preserved by
 * the general copy plan but cannot qualify for this document-local subset. */
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE as SOURCE } from "./current-footprint-copy-create-source.ts";
import { assertCurrentFootprintCopyV2Inventory, currentFootprintCopyV2Before, currentFootprintCopyV2Rows } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const number = z.number().min(-1_000_000_000).max(1_000_000_000).refine(value => !Object.is(value, -0));
const flag = z.union([z.boolean(), z.literal(0), z.literal(1)]), size = number.nonnegative();
const emptyGroup = z.union([z.literal(0), z.literal(""), z.null()]);
const layer = z.number().int().min(0).max(65_535), scalarOrNull = number.nullable();
const text = (maximum: number): z.ZodString => z.string().max(maximum);
const color = z.string().regex(/^#[a-f\d]{6}(?:[a-f\d]{2})?$/iu).nullable();
const metadata = z.object({ title: text(512), description: text(65_536), tags: z.array(text(512)).max(256), source: text(4096) }).strict();
const canvas = z.object({ originX: number, originY: number, unit: z.enum(["mm", "mil", "inch"]).optional(),
  gridXSize: size.optional(), gridYSize: size.optional(), snapXSize: size.optional(), snapYSize: size.optional(),
  altSnapXSize: size.optional(), altSnapYSize: size.optional(), gridType: number.optional(), multiGridType: number.optional(),
  multiGridRatio: number.optional(), highlightValue: number.optional() }).strict();
const layerBody = z.object({ layerType: text(64), layerName: text(512), use: flag, show: flag, locked: flag,
  activeColor: color, activateTransparency: number, inactiveColor: color, inactiveTransparency: number }).strict();
const line = z.object({ groupId: emptyGroup, netName: z.literal(""), layerId: layer,
  startX: number, startY: number, endX: number, endY: number, width: size, locked: flag, zIndex: scalarOrNull }).strict();
const arc = line.extend({ angle: number, arcType: z.enum(["DOT", "CENT"]), specialColor: color.optional() }).strict();
const simplePad = z.discriminatedUnion("padType", [
  z.object({ padType: z.literal("ELLIPSE"), width: size, height: size }).strict(),
  z.object({ padType: z.literal("OVAL"), width: size, height: size }).strict(),
  z.object({ padType: z.literal("RECT"), width: size, height: size, radius: size }).strict(),
]);
const hole = z.object({ holeType: z.enum(["ROUND", "SLOT"]), width: size, height: size }).strict().nullable();
const pad = z.object({ groupId: emptyGroup, netName: z.literal(""), layerId: layer, num: text(64),
  centerX: number, centerY: number, padAngle: number, hole, defaultPad: simplePad, specialPad: z.array(z.never()).length(0),
  padOffsetX: number, padOffsetY: number, relativeAngle: scalarOrNull, plated: flag, padType: z.literal("NORMAL"),
  topSolderExpansion: scalarOrNull, bottomSolderExpansion: scalarOrNull, topPasteExpansion: scalarOrNull, bottomPasteExpansion: scalarOrNull,
  locked: flag, zIndex: scalarOrNull, connectMode: z.null(), spokeSpace: scalarOrNull, spokeWidth: scalarOrNull, spokeAngle: scalarOrNull,
  unusedInnerLayers: z.array(z.never()).length(0).optional(), padLen: size, attrsMap: z.object({}).strict().optional() }).strict();
const string = z.object({ groupId: emptyGroup, layerId: layer, x: number, y: number, text: text(4096),
  fontFamily: z.literal("default"), fontSize: size, strokeWidth: size, bold: flag, italic: flag,
  origin: text(32), angle: number, reverse: flag, expansion: number, mirror: flag, locked: flag, zIndex: scalarOrNull,
  specialColor: color.optional() }).strict();
const attribute = string.omit({ text: true }).extend({ parentId: z.union([z.literal(""), z.null()]),
  key: z.enum(["Footprint", "Designator"]), value: text(4096), keyVisible: flag, valueVisible: flag }).strict();
const schemas = { META: metadata, CANVAS: canvas, LAYER: layerBody, LINE: line, ARC: arc, PAD: pad, STRING: string, ATTR: attribute } as const;
type Family = keyof typeof schemas;

/** Audited source-only facts. Native method/callback identities remain a
 * separate requirement, including the own Nd-wrapped uploadStructure callback.
 * No opcode in these spans resolves an ordinary footprint row as an asset.
 */
export const CURRENT_FOOTPRINT_COPY_SOURCE_ASSET_PROFILE = freezeDeep({
  profile: "private.current-footprint-copy-source-assets.v1", workerSha256: SOURCE.worker.sha256,
  workerSpans: {
    onDataChange: { start: 1_878_825, end: 1_879_756, bytes: 931, sha256: "a6d8254ca882842724fc5ab8d35ddc8d90b6088d74828f23465cb26a9e842356" },
    publishCanvas: { start: 1_857_789, end: 1_858_943, bytes: 1154, sha256: "1f780d00b20987ba2eb3d9bbb561a51486dcef9fc8465f346a3c81d91a4443e0" },
    getCanvasData: SOURCE.worker.spans.getCanvasData, getStr: SOURCE.worker.spans.getStr,
  },
  recordFamilies: Object.keys(schemas), nestedPadShapes: ["ELLIPSE", "OVAL", "RECT"],
  fontFamily: "default", nonemptyGroups: false, nonemptyNets: false, opaqueNestedData: false,
  sourceAssetOnly: true, nativeCallbacksBound: false, executionAuthorized: false,
} as const);
interface Common {
  readonly profile: "private.current-footprint-copy-source-assets.v1";
  readonly copyPlanSha256: string; readonly copiedRowsSha256: string; readonly sourceAssetOnly: true;
  readonly nativeCallbacksBound: false; readonly uploadCompletionVerified: false; readonly executionAuthorized: false;
}
export type CurrentFootprintCopySourceAssetQualification = Readonly<Common & (
  { readonly status: "qualified"; readonly recordCount: number; readonly recordFamilies: readonly Family[];
    readonly effectiveAssetReferences: 0; readonly destinationSourceCleared: true } |
  { readonly status: "unsupported"; readonly reason: "record-family" | "record-body" | "metadata-winner";
    readonly recordId: string; readonly recordType: string }
)>;
interface Original { readonly copy: CurrentFootprintCopyV2Plan; readonly rows: readonly string[]; readonly copyTextSha256: string; }
const originals = new WeakMap<CurrentFootprintCopySourceAssetQualification, Original>();
function need(value: boolean, detail: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_COPY_SOURCE_ASSETS_${detail}`); } }
/** Retain original copy-plan/reader custody without changing the general
 * planner's broader lossless preservation contract or issuing writer authority.
 */
export function requireCurrentFootprintCopySourceAssets(qualification: CurrentFootprintCopySourceAssetQualification,
  copy: CurrentFootprintCopyV2Plan): CurrentFootprintCopySourceAssetQualification {
  const held = originals.get(qualification);
  need(held !== undefined && held.copy === copy && currentFootprintCopyV2Rows(copy) === held.rows && sha256Json(copy) === held.copyTextSha256,
    "ORIGINAL_QUALIFICATION");
  assertCurrentFootprintCopyV2Inventory(copy, currentFootprintCopyV2Before(copy)); return qualification;
}
/** Qualify only explicitly enumerated primitive bodies. JSON strings are read
 * from the original plan, never executed. Even a tombstone of an unknown family
 * refuses this subset; unsupported data remains available to other profiles.
 */
export async function qualifyCurrentFootprintCopySourceAssets(copy: CurrentFootprintCopyV2Plan): Promise<CurrentFootprintCopySourceAssetQualification> {
  const before = currentFootprintCopyV2Before(copy), copyTextSha256 = sha256Json(copy), rows = currentFootprintCopyV2Rows(copy);
  assertCurrentFootprintCopyV2Inventory(copy, before);
  const common: Common = { profile: "private.current-footprint-copy-source-assets.v1", copyPlanSha256: copyTextSha256,
    copiedRowsSha256: copy.copiedRowsSha256, sourceAssetOnly: true, nativeCallbacksBound: false, uploadCompletionVerified: false, executionAuthorized: false };
  const held: Original = Object.freeze({ copy, rows, copyTextSha256 });
  const publish = (qualification: CurrentFootprintCopySourceAssetQualification): CurrentFootprintCopySourceAssetQualification => {
    originals.set(qualification, held); return requireCurrentFootprintCopySourceAssets(qualification, copy);
  };
  if (copy.destinationMetadata.source !== "" || copy.metadataTicket !== copy.maximumTicket + 1) {
    return publish(freezeDeep({ ...common, status: "unsupported", reason: "metadata-winner", recordId: "META", recordType: "META" }));
  }
  const families = new Set<Family>();
  for (const [index, raw] of rows.entries()) {
    const split = raw.indexOf("||");
    const header = z.object({ id: z.string(), type: z.string(), ticket: z.number() }).strict().parse(JSON.parse(raw.slice(0, split)) as unknown);
    if (!Object.hasOwn(schemas, header.type)) {
      return publish(freezeDeep({ ...common, status: "unsupported", reason: "record-family", recordId: header.id, recordType: header.type }));
    }
    // Object.hasOwn has established this finite discriminant independently of
    // Caller input; the original planner already sealed every header and row.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Narrow a checked own key into the closed schema table, not arbitrary caller data.
    const family = header.type as Family;
    const body = raw.slice(split + 2);
    if (family === "META" && header.ticket >= copy.metadataTicket || body !== "" && !schemas[family].safeParse(JSON.parse(body) as unknown).success) {
      return publish(freezeDeep({ ...common, status: "unsupported", reason: "record-body", recordId: header.id, recordType: family }));
    }
    families.add(family);
    if (index % 128 === 127) { await yieldProofEventLoop(); assertCurrentFootprintCopyV2Inventory(copy, before); }
  }
  return publish(freezeDeep({ ...common, status: "qualified", recordCount: rows.length, recordFamilies: [...families].toSorted(),
    effectiveAssetReferences: 0, destinationSourceCleared: true }));
}

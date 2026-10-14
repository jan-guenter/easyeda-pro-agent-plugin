import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentPcbLayersRequestSchema } from "./current-pcb-layers.ts";
import { CURRENT_UI_IMPLEMENTATION } from "./current-ui-implementation.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";

export const CURRENT_PCB_GEOMETRY_MAX_BYTES = 384 * 1024;
export const CURRENT_PCB_GEOMETRY_MAX_ROWS = 256;
export const CURRENT_PCB_GEOMETRY_MAX_NUMBER = 1e12;
const methods = ["eda.pcb_PrimitiveLine.getAll", "eda.pcb_PrimitiveArc.getAll", "eda.pcb_PrimitiveVia.getAll"] as const;
const targetSchema = currentPcbLayersRequestSchema.shape.target;
const numberSchema = z.number().min(-CURRENT_PCB_GEOMETRY_MAX_NUMBER).max(CURRENT_PCB_GEOMETRY_MAX_NUMBER)
  .refine((value) => !Object.is(value, -0), "Signed zero is not supported by this JSON observation.");
const layerSchema = numberSchema.refine((value) => Number.isInteger(value) && value >= 0 && value <= 65_535, "Invalid native layer ID.");
const boundedText = z.string().max(1024);
const base = { primitiveId: z.string().min(1).max(256), net: boundedText.nullable(), primitiveLock: z.boolean() };
const track = { ...base, layer: layerSchema, startX: numberSchema, startY: numberSchema, endX: numberSchema,
  endY: numberSchema, lineWidth: numberSchema };
const lineSchema = z.object({ ...track, primitiveType: z.literal("Line") }).strict();
const arcSchema = z.object({ ...track, primitiveType: z.literal("Arc"), arcAngle: numberSchema,
  interactiveMode: z.union([z.literal(1), z.literal(2)]) }).strict();
const viaSchema = z.object({ ...base, primitiveType: z.literal("Via"), x: numberSchema, y: numberSchema,
  holeDiameter: numberSchema, diameter: numberSchema, viaType: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  designRuleBlindViaName: boundedText.nullable(), startLayer: layerSchema, endLayer: layerSchema,
  maskExpansionMode: numberSchema.refine(Number.isInteger, "Invalid native mask expansion mode."),
  topMaskExpansion: numberSchema, bottomMaskExpansion: numberSchema }).strict();
export const currentPcbGeometryRequestSchema = z.object({ method: z.enum(methods), arguments: z.object({}).strict(), target: targetSchema }).strict();
export type CurrentPcbGeometryRequest = z.infer<typeof currentPcbGeometryRequestSchema>;
export const currentPcbGeometryQuerySchema = z.object({ method: z.enum(methods).optional(), includeSchemas: z.boolean().default(false) }).strict();
export const currentPcbGeometryResultSchema = z.object({ ok: z.literal(true), kind: z.literal("current-pcb-geometry-observation"),
  method: z.enum(methods), target: targetSchema, rows: z.array(z.discriminatedUnion("primitiveType", [lineSchema, arcSchema, viaSchema])).max(CURRENT_PCB_GEOMETRY_MAX_ROWS),
  samples: z.literal(2), implementationKind: z.literal("native-task-equivalent"), cadAuthority: z.literal(false),
  persistenceVerified: z.literal(false), sourceMembershipVerified: z.literal(false) }).strict();

const limitations = [
  "Only the exact active ordinary project-owned type-3 PCB is admitted. The retained frame, local receiver and complete target are rechecked around awaits, with native tab/type identity bracketing each sample. This is not an atomic lock or proof against switching away and back between observations.",
  "This is an explicit native loaded-view geometry projection, not public class instances, complete native/source records, saved membership, ownership, connectivity, DRC or persistence proof. Loaded views may include inherited, generated and in-progress objects. Native display nets are copied without case conversion; empty string and null remain distinct, while undefined refuses.",
  "Only unfiltered getAll with empty arguments is supported. Fixed native family handlers replace mutable public active-tab routing. All reported scalar fields and ordered rows must match across two complete samples; omitted native fields are not compared. No direct getByIds or SDK object constructor is invoked.",
  "Positions, widths, diameters and mask expansions are in mil; arcAngle is in degrees. The native callback's scaled results are not rounded using the public wrapper. Arc endpoints/angle can therefore retain precision that the public wrapper rounds; Via diameters are twice the native callback radii, without public one-decimal radius rounding. Layer IDs and arc/via/mask modes are native values, not validated design rules.",
  "Coordinates use the data origin, not the displayed canvas origin. Arc endpoints and angle are incomplete shape data: a full-circle case can project to zero angle. Native center/radius/sweep and partition are omitted, as are Via unused-layer and is-suture fields. Mask expansion values are loaded model observations, not proof of saved overrides or current rule resolution.",
  "At most 256 rows, 256 characters per identity, 1024 characters per net/rule name, scalar magnitude 1e12 and 393216 UTF-8 bytes of evidence. Signed zero, non-finite values, malformed, duplicate, incomplete and oversized results refuse without truncation or coercion. Vendor enumeration and serialization precede these bounds; the observer deadline does not cancel vendor work.",
  "No selection, layer change, navigation, Save, source export, design mutation or project/library service is requested. Local RPC bookkeeping and reviewed native identity initialization remain incidental. Source review and offline tests are not current live validation.",
] as const;

export function parseCurrentPcbGeometryRequest(input: unknown): CurrentPcbGeometryRequest { return currentPcbGeometryRequestSchema.parse(input); }
export function currentPcbGeometryFamily(request: CurrentPcbGeometryRequest): "Line" | "Arc" | "Via" {
  switch (request.method) {
    case "eda.pcb_PrimitiveLine.getAll": { return "Line"; }
    case "eda.pcb_PrimitiveArc.getAll": { return "Arc"; }
    case "eda.pcb_PrimitiveVia.getAll": { return "Via"; }
    default: { throw new Error("Unsupported current PCB geometry method."); }
  }
}
export function queryCurrentPcbGeometry(input: unknown = {}): Record<string, unknown> {
  const query = currentPcbGeometryQuerySchema.parse(input);
  const entries = methods.filter((method) => query.method === undefined || query.method === method).map((method) => {
    const entry: Record<string, unknown> = { path: method, method, effect: "current-pcb-loaded-view-geometry-read", parameters: [],
      invocationEnabledByDiscovery: false, limitations: [...limitations], provenance: {
        apiVersion: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
        apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
        uiVersion: CURRENT_UI_IMPLEMENTATION.version, uiSha256: CURRENT_UI_IMPLEMENTATION.sha256,
        implementationKind: "native-task-equivalent", liveValidation: "not-recorded" } };
    if (query.includeSchemas) { entry["inputSchema"] = z.toJSONSchema(currentPcbGeometryRequestSchema); }
    return entry;
  });
  return { offline: true, invocationEnabledByDiscovery: false, total: entries.length, entries };
}
export function validateCurrentPcbGeometryArguments(input: unknown): Record<string, unknown> {
  const result = currentPcbGeometryRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}
export function validateCurrentPcbGeometryResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parseCurrentPcbGeometryRequest(input);
  const payload = currentPcbGeometryResultSchema.parse(raw);
  if (payload.method !== request.method || canonicalJson(payload.target) !== canonicalJson(request.target)) { throw new Error("PCB geometry result differs from its exact target request."); }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > CURRENT_PCB_GEOMETRY_MAX_BYTES) { throw new Error("PCB geometry result exceeds its byte bound."); }
  const expectedFamily = currentPcbGeometryFamily(request), seen = new Set<string>();
  for (const row of payload.rows) {
    if (row.primitiveType !== expectedFamily || seen.has(row.primitiveId)) { throw new Error("PCB geometry result contains duplicate or unexpected family identities."); }
    seen.add(row.primitiveId);
  }
  const { rows, ...metadata } = payload;
  return { ...metadata, value: rows, observedRowCount: rows.length, units: { linear: "mil", arcAngle: "degrees" },
    effect: "current-pcb-loaded-view-geometry-read", encoding: "native-getter-projection-without-public-wrapper-rounding",
    authority: "explicit-target-loaded-view-geometry-only;not-design-or-persistence-authority", liveValidation: "not-recorded", limitations: [...limitations] };
}

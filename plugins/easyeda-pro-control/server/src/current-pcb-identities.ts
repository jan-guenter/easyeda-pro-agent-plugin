import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentPcbLayersRequestSchema } from "./current-pcb-layers.ts";
import { CURRENT_UI_IMPLEMENTATION } from "./current-ui-implementation.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";

// Leave room inside the registered tool's 512 KiB inline-response ceiling.
export const CURRENT_PCB_IDENTITIES_MAX_BYTES = 384 * 1024;
export const CURRENT_PCB_IDENTITIES_MAX_IDS = 20_000;
export const CURRENT_PCB_IDENTITIES_MAX_SELECTED_IDS = 256;
export const CURRENT_PCB_IDENTITIES_MAX_ID_LENGTH = 256;
export const CURRENT_PCB_IDENTITY_TYPE_METHOD = "eda.pcb_Primitive.getPrimitiveTypeByPrimitiveId";
const collectionMethods = ["eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId",
  "eda.pcb_PrimitiveLine.getAllPrimitiveId", "eda.pcb_PrimitiveArc.getAllPrimitiveId", "eda.pcb_PrimitiveVia.getAllPrimitiveId",
  "eda.pcb_PrimitiveComponent.getAllPrimitiveId", "eda.pcb_PrimitivePad.getAllPrimitiveId"] as const;
const methods = [...collectionMethods, CURRENT_PCB_IDENTITY_TYPE_METHOD] as const;
const targetSchema = currentPcbLayersRequestSchema.shape.target;
const idSchema = z.string().min(1).max(CURRENT_PCB_IDENTITIES_MAX_ID_LENGTH);
const families = ["selected", "Line", "Arc", "Via", "Component", "Pad"] as const;
export type CurrentPcbIdentityFamily = typeof families[number];
export const currentPcbIdentitiesRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.enum(collectionMethods), arguments: z.object({}).strict(), target: targetSchema }).strict(),
  z.object({ method: z.literal(CURRENT_PCB_IDENTITY_TYPE_METHOD), arguments: z.object({ id: idSchema }).strict(), target: targetSchema }).strict(),
]);
export type CurrentPcbIdentitiesRequest = z.infer<typeof currentPcbIdentitiesRequestSchema>;
export function parseCurrentPcbIdentitiesRequest(input: unknown): CurrentPcbIdentitiesRequest { return currentPcbIdentitiesRequestSchema.parse(input); }
export const currentPcbIdentitiesQuerySchema = z.object({ method: z.enum(methods).optional(), includeSchemas: z.boolean().default(false) }).strict();
const observationSchema = z.object({ family: z.enum(families), ids: z.array(idSchema).max(CURRENT_PCB_IDENTITIES_MAX_IDS) }).strict();
export const currentPcbIdentitiesResultSchema = z.object({ ok: z.literal(true), kind: z.literal("current-pcb-identity-observation"),
  method: z.enum(methods), target: targetSchema, observations: z.array(observationSchema).min(1).max(3), samples: z.literal(2),
  implementationKind: z.literal("native-task-equivalent"), cadAuthority: z.literal(false), persistenceVerified: z.literal(false),
  sourceMembershipVerified: z.literal(false) }).strict();

const limitations = [
  "Exact active ordinary project-owned type-3 PCB only. The retained frame and local native receiver are rechecked around every await; native tab/type identity brackets each sample. This is not an atomic lock or proof against switching away and back between observations.",
  "Selected IDs preserve the native selection array. Line, Arc, Via, Component and Pad IDs preserve unfiltered native family enumeration order. These are loaded-view identities, which may include inherited, generated or in-progress objects; no root ownership, persisted membership, geometry, connectivity or saved-file claim is made. Pad IDs do not distinguish free pads from component pads or prove parent associations.",
  "Positive type lookup accepts one existing ID in exactly one of Line, Arc or Via. Missing IDs, other families, duplicate identities and cross-family collisions refuse; no undefined or absence claim is fabricated. The public type method is an empty body and is not invoked.",
  "Only empty collection arguments are supported. Fixed local native getter topics replace mutable public active-tab routing; these are native task equivalents, not complete public-method execution or return parity. Native family getters internally serialize view data, but only IDs leave this adapter.",
  "Two complete ordered ID samples must match. At most 20000 IDs per family, 256 selected IDs, 256 characters per ID and 393216 UTF-8 bytes total evidence. The byte bound can be reached before the count bound. Output bounds do not bound or cancel preceding vendor enumeration or serialization. Malformed, duplicate, incomplete and oversized results refuse without truncation.",
  "No selection change, layer change, geometry edit, navigation, Save, source export, project service or persistence operation is requested. Local RPC bookkeeping, reviewed native identity initialization and possible empty pad-length singleton allocation remain incidental. Component enumeration reads existing footprint/device/font caches; it does not fetch or enrich library data. Source review and offline tests do not establish current live validation.",
] as const;

export function currentPcbIdentityFamilies(request: CurrentPcbIdentitiesRequest): readonly CurrentPcbIdentityFamily[] {
  switch (request.method) {
    case "eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId": { return ["selected"]; }
    case "eda.pcb_PrimitiveLine.getAllPrimitiveId": { return ["Line"]; }
    case "eda.pcb_PrimitiveArc.getAllPrimitiveId": { return ["Arc"]; }
    case "eda.pcb_PrimitiveVia.getAllPrimitiveId": { return ["Via"]; }
    case "eda.pcb_PrimitiveComponent.getAllPrimitiveId": { return ["Component"]; }
    case "eda.pcb_PrimitivePad.getAllPrimitiveId": { return ["Pad"]; }
    case CURRENT_PCB_IDENTITY_TYPE_METHOD: { return ["Line", "Arc", "Via"]; }
    default: { throw new Error("Unsupported current PCB identity method."); }
  }
}

export function queryCurrentPcbIdentities(input: unknown = {}): Record<string, unknown> {
  const query = currentPcbIdentitiesQuerySchema.parse(input);
  const entries = methods.filter((method) => query.method === undefined || query.method === method).map((method) => {
    const entry: Record<string, unknown> = { path: method, method, effect: "current-pcb-loaded-view-identity-read",
      parameters: method === CURRENT_PCB_IDENTITY_TYPE_METHOD ? ["id"] : [], invocationEnabledByDiscovery: false,
      limitations: [...limitations], provenance: { apiVersion: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version,
        apiSha256: SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256,
        uiVersion: CURRENT_UI_IMPLEMENTATION.version, uiSha256: CURRENT_UI_IMPLEMENTATION.sha256,
        implementationKind: "native-task-equivalent", liveValidation: "not-recorded" } };
    if (query.includeSchemas) { entry["inputSchema"] = z.toJSONSchema(currentPcbIdentitiesRequestSchema); }
    return entry;
  });
  return { offline: true, invocationEnabledByDiscovery: false, total: entries.length, entries };
}

export function validateCurrentPcbIdentitiesArguments(input: unknown): Record<string, unknown> {
  const result = currentPcbIdentitiesRequestSchema.safeParse(input);
  return result.success ? { valid: true, request: result.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })),
  };
}

export function validateCurrentPcbIdentitiesResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parseCurrentPcbIdentitiesRequest(input);
  const payload = currentPcbIdentitiesResultSchema.parse(raw);
  if (payload.method !== request.method || canonicalJson(payload.target) !== canonicalJson(request.target)) { throw new Error("PCB identities result differs from its exact target request."); }
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > CURRENT_PCB_IDENTITIES_MAX_BYTES) { throw new Error("PCB identities result exceeds its byte bound."); }
  const { observations, ...metadata } = payload;
  if (canonicalJson(observations.map((entry) => entry.family)) !== canonicalJson(currentPcbIdentityFamilies(request))) { throw new Error("PCB identities result has unexpected family observations."); }
  const seen = new Set<string>();
  for (const entry of observations) {
    if (entry.family === "selected" && entry.ids.length > CURRENT_PCB_IDENTITIES_MAX_SELECTED_IDS) { throw new Error("PCB selection exceeds its identity bound."); }
    for (const id of entry.ids) {
      if (seen.has(id)) { throw new Error("PCB identities contain duplicate or cross-family identities."); }
      seen.add(id);
    }
  }
  let value: string | string[];
  const extra: Record<string, unknown> = {};
  if (request.method === CURRENT_PCB_IDENTITY_TYPE_METHOD) {
    const match = observations.find((entry) => entry.ids.includes(request.arguments.id));
    if (match === undefined || !["Line", "Arc", "Via"].includes(match.family)) { throw new Error("PCB identity is not in an observed supported family."); }
    value = match.family;
    extra["familyObservations"] = observations;
  } else {
    const first = observations[0];
    if (first === undefined) { throw new Error("PCB identities observation is missing."); }
    value = first.ids;
  }
  return { ...metadata, ...extra, value, observedIdentityCount: seen.size, effect: "current-pcb-loaded-view-identity-read",
    authority: "explicit-target-loaded-view-identities-only;not-design-or-persistence-authority", liveValidation: "not-recorded", limitations: [...limitations] };
}

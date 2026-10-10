import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { compileDesignOperation } from "./design-operations.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";

export const DESIGN_COPPER_ADAPTER_PROFILE = "easyeda-pro-control.pcb-copper-rebuild.v1";
export const DESIGN_COPPER_CLEAR_PROFILE = "easyeda-pro-control.pcb-copper-clear.v1";
interface CopperIds { readonly targetId?: string; readonly derivedResult?: unknown; }

function assertCopperTarget(operation: unknown, before: NativeSourceSnapshot, action: "pcb.pour.rebuild" | "pcb.pour.clear-derived", ids: CopperIds): NativeSourceObject {
  const compiled = compileDesignOperation(operation);
  if (compiled.action !== action || before.schema !== "easyeda-pro-control.document-source.v1" || new Set(before.objects.map((object) => object.id)).size !== before.objects.length || before.document["docType"] !== "PCB" || before.document["editVersion"] !== "3.2.149.88089769" || before.sha256 !== sha256Json({ schema: before.schema, document: before.document, objects: before.objects })) {throw new Error("Copper operation profile or baseline is invalid.");}
  const target = compiled.effect.target;
  const id = target !== null && "primitiveId" in target ? target.primitiveId : ids.targetId;
  if (ids.targetId !== undefined && id !== ids.targetId) {throw new Error("Copper rebuild resolved target contradicts its operation.");}
  const pour = before.objects.find((object) => object.id === id && object.type === "POUR");
  if (pour === undefined || typeof pour.body["netName"] !== "string" || typeof pour.body["layerId"] !== "number" || (pour.body["parentId"] !== undefined && pour.body["parentId"] !== null && pour.body["parentId"] !== "")) {throw new Error("Copper rebuild target is not one standalone pour with known net/layer.");}
  if (before.objects.some((object) => ["PARTITION", "PANELIZE_STAMP"].includes(object.type))) {throw new Error("Partitioned/panelized copper requires additional worker scope proof.");}
  return pour;
}

export function assertCopperRebuildProfile(operation: unknown, before: NativeSourceSnapshot, ids: CopperIds = {}): NativeSourceObject {
  return assertCopperTarget(operation, before, "pcb.pour.rebuild", ids);
}

export function assertCopperClearProfile(operation: unknown, before: NativeSourceSnapshot, ids: CopperIds = {}): NativeSourceObject {
  const target = assertCopperTarget(operation, before, "pcb.pour.clear-derived", ids);
  const derived = before.objects.find((object) => object.id === JSON.stringify(["POURED", target.id]));
  if (derived?.type !== "POURED" || !Array.isArray(derived.body["pourFill"]) || derived.body["pourFill"].length === 0) {throw new Error("Copper clear requires existing nonempty target-derived geometry.");}
  return target;
}

/** Native Poured.delete removes children of the requested POUR identity in
 * one history group. It does not remove the POUR or edit any other geometry.
 * Recomputed or unrelated derived state is not an allowed side effect.
 */
export function expectedCopperClearSource(operation: unknown, before: NativeSourceSnapshot, ids: CopperIds = {}): NativeSourceSnapshot {
  const target = assertCopperClearProfile(operation, before, ids);
  const objects = before.objects.filter((object) => object.id !== JSON.stringify(["POURED", target.id]));
  const base = { schema: before.schema, document: before.document, objects };
  return { ...base, sha256: sha256Json(base) };
}

/** Rebuild results are captured from the authenticated native RPC, never from
 * caller JSON or the SDK's lossy lM wrapper. The worker geometry is not an
 * independent electrical clearance approval; exact DRC is a separate gate.
 */
export function expectedCopperRebuildSource(operation: unknown, before: NativeSourceSnapshot, ids: CopperIds): NativeSourceSnapshot {
  const target = assertCopperRebuildProfile(operation, before, ids);
  if (!isRecord(ids.derivedResult) || ids.derivedResult["profile"] !== DESIGN_COPPER_ADAPTER_PROFILE || ids.derivedResult["targetId"] !== target.id || !Array.isArray(ids.derivedResult["coppers"])) {throw new Error("Copper proof requires its authenticated complete native worker result.");}
  const result: readonly unknown[] = ids.derivedResult["coppers"];
  if (result.length > 100_000) {throw new Error("Native copper result exceeds its bound.");}
  const grouped = new Map<string, Record<string, unknown>[]>(), seen = new Set<string>(), wanted: Record<string, unknown>[] = [];
  for (const entry of result) {
    if (!isRecord(entry) || typeof entry["id"] !== "string" || seen.has(entry["id"]) || typeof entry["parentId"] !== "string" || typeof entry["strokeWidth"] !== "number" || !Number.isFinite(entry["strokeWidth"]) || entry["strokeWidth"] < 0 || typeof entry["fill"] !== "boolean" || !Array.isArray(entry["path"])) {throw new Error("Native derived copper identity or geometry is malformed.");}
    seen.add(entry["id"]);
    const parent = before.objects.find((object) => object.type === "POUR" && object.id === entry["parentId"]);
    if (parent === undefined || parent.body["netName"] !== entry["net"] || parent.body["layerId"] !== entry["layerId"] || before.objects.some((object) => object.id === entry["id"])) {throw new Error("Derived copper parent, connected net, layer or identity changed unexpectedly.");}
    const geometry = { strokeWidth: entry["strokeWidth"], fill: entry["fill"], path: entry["path"], id: entry["id"] };
    const group = grouped.get(parent.id) ?? [];
    group.push(geometry); grouped.set(parent.id, group);
    if (parent.id === target.id) {wanted.push(geometry);}
  }
  for (const parent of before.objects.filter((object) => object.type === "POUR" && object.id !== target.id)) {
    const oldDerived = before.objects.find((object) => object.type === "POURED" && object.id === JSON.stringify(["POURED", parent.id]));
    if (canonicalJson(oldDerived?.body["pourFill"] ?? []) !== canonicalJson(grouped.get(parent.id) ?? [])) {throw new Error("Complete worker result changed or omitted another pour's derived copper.");}
  }
  const id = JSON.stringify(["POURED", target.id]);
  const existing = before.objects.find((object) => object.id === id);
  if (existing !== undefined && existing.type !== "POURED") {throw new Error("Derived copper identity collides with another native record.");}
  const objects = before.objects.filter((object) => object.id !== id);
  if (wanted.length > 0) {objects.push({ id, type: "POURED", body: { ...existing?.body, pourFill: wanted } });}
  objects.sort((left, right) => left.id.localeCompare(right.id));
  const base = { schema: before.schema, document: before.document, objects };
  return { ...base, sha256: sha256Json(base) };
}

/** Fixed same-renderer RPC route underlying the public instance method. The
 * exact native handler awaits pourDocument, nwt's thermals/islands/history,
 * then returns all board copper models. No event-driven completion guess.
 */
function copperBaselineGuard(before: NativeSourceSnapshot, target: NativeSourceObject): string {
  const baseline = canonicalJson({ document: before.document, objects: before.objects });
  if (baseline.length > 16 * 1024 * 1024) {throw new Error("Copper baseline exceeds its generated-code bound.");}
  return `
const COPPER_BASELINE = ${baseline};
const COPPER_TARGET = ${JSON.stringify(target.id)};
const copperCanonical = value => {
  if (Array.isArray(value)) return '[' + value.map(copperCanonical).join(',') + ']';
  if (value !== null && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + copperCanonical(value[key])).join(',') + '}';
  return JSON.stringify(value);
};
const copperInfo = await eda.dmt_SelectControl.getCurrentDocumentInfo();
if (EXPECTED_DOCUMENT_TYPE !== 3 || String(copperInfo?.uuid ?? copperInfo?.documentUuid ?? '') !== EXPECTED_DOCUMENT_UUID || String(copperInfo?.tabId ?? '') !== EXPECTED_TAB_ID || Number(copperInfo?.documentType ?? copperInfo?.docType) !== 3 || COPPER_BASELINE.document.uuid !== EXPECTED_DOCUMENT_UUID) throw new Error('Copper context drift');
const copperSource = await eda.sys_FileManager.getDocumentSource();
if (typeof copperSource !== 'string' || copperSource.length > 67108864) throw new Error('Incomplete copper source');
const copperRows = copperSource.split('|\\n').filter(line => line.length).map(line => {
  const split = line.indexOf('||'); if (split < 1) throw new Error('Invalid copper source record');
  return {header:JSON.parse(line.slice(0,split)),body:JSON.parse(line.slice(split+2))};
});
if (copperRows[0]?.header.type !== 'DOCHEAD' || copperRows.length > 500000) throw new Error('Invalid copper source header');
const copperDocument = {...copperRows[0].body}; delete copperDocument.client; delete copperDocument.version; delete copperDocument.updateTime;
const copperObjects = copperRows.slice(1).map(row => ({id:row.header.id,type:row.header.type,body:row.body})).sort((a,b)=>a.id.localeCompare(b.id));
if (new Set(copperObjects.map(object=>object.id)).size !== copperObjects.length || copperCanonical({document:copperDocument,objects:copperObjects}) !== copperCanonical(COPPER_BASELINE)) throw new Error('Copper source baseline drift');
`;
}

export function buildDesignCopperAdapter(operation: unknown, before: NativeSourceSnapshot, ids: CopperIds = {}): { profile: typeof DESIGN_COPPER_ADAPTER_PROFILE; beforeSha256: string; targetId: string; code: string } {
  const target = assertCopperRebuildProfile(operation, before, ids);
  const code = `${copperBaselineGuard(before, target)}
const copperBus = globalThis.window?.top?._MSG_BUS2_EXTAPI_;
if (typeof copperBus?.rpcCall !== 'function') throw new Error('Pinned native copper RPC unavailable');
const nativeCoppers = await copperBus.rpcCall('extensionApi.PCB_PrimitivePour.rebuildCopperRegion',{ids:[COPPER_TARGET],isLast:false});
if (!Array.isArray(nativeCoppers) || nativeCoppers.length > 100000) throw new Error('Native copper rebuild completion result is invalid');
const coppers = nativeCoppers.map(value => {
  if (!value || typeof value.globalIndex !== 'string' || typeof value.pourPrimitiveId !== 'string' || !['solid','90grid','45grid'].includes(value.style) || !Array.isArray(value.copperPath) || typeof value.net !== 'string' || !Number.isInteger(value.layerId)) throw new Error('Native copper result profile changed');
  const grid = value.style === '90grid' || value.style === '45grid';
  if (grid && (typeof value.gridLineWidth !== 'number' || !Number.isFinite(value.gridLineWidth) || value.gridLineWidth <= 0)) throw new Error('Native grid copper width is invalid');
  return {id:value.globalIndex,parentId:value.pourPrimitiveId,net:value.net,layerId:value.layerId,strokeWidth:grid?value.gridLineWidth:0,fill:!grid,path:value.copperPath};
});
return {profile:${JSON.stringify(DESIGN_COPPER_ADAPTER_PROFILE)},targetId:COPPER_TARGET,coppers};
`;
  return { profile: DESIGN_COPPER_ADAPTER_PROFILE, beforeSha256: before.sha256, targetId: target.id, code };
}

/** Current native pcb/extensionAPI/poured-delete accepts parent POUR IDs,
 * captures exactly the deleted child models, then executes one history group.
 * No source setter, rebuild, preference mutation or private caller code.
 */
export function buildDesignCopperClearAdapter(operation: unknown, before: NativeSourceSnapshot, ids: CopperIds = {}): { profile: typeof DESIGN_COPPER_CLEAR_PROFILE; beforeSha256: string; targetId: string; code: string } {
  const target = assertCopperClearProfile(operation, before, ids);
  const code = `${copperBaselineGuard(before, target)}
const copperDeleteApi = eda.pcb_PrimitivePoured;
if (typeof copperDeleteApi?.delete !== 'function') throw new Error('Pinned native copper delete unavailable');
return await copperDeleteApi.delete(COPPER_TARGET);
`;
  return { profile: DESIGN_COPPER_CLEAR_PROFILE, beforeSha256: before.sha256, targetId: target.id, code };
}

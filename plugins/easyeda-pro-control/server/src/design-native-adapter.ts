import { randomBytes } from "node:crypto";
import { canonicalJson, sha256Json } from "./core.ts";
import { compileDesignOperation } from "./design-operations.ts";
import { buildExpectedDesignSource, verifyDesignSourceEffect } from "./design-source-proof.ts";
import type { DesignSourceIds } from "./design-source-proof.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import { buildDesignRulePublicAdapter, isDesignRuleAction } from "./design-rule-public-adapter.ts";

export const DESIGN_NATIVE_ADAPTER_PROFILE = "easyeda-pro-control.pcb-source-merge.v1";
export interface DesignNativeAdapter {
  readonly profile: typeof DESIGN_NATIVE_ADAPTER_PROFILE | "easyeda-pro-control.pcb-rules-public.v1";
  readonly requiredVersions: { readonly editor: "3.2.149.88089769"; readonly pcb: "3.2.149.5378b690"; readonly api: "0.2.53.aee2f57a" };
  readonly beforeSha256: string;
  readonly expected: NativeSourceSnapshot;
  readonly createdId?: string;
  readonly code: string;
}

/** Reviewed native route: SYS_FileManager.setDocumentSource -> UI _Nt ->
 * pcb/decode -> xV.parseSourceByCompiler/build. The build creates one native
 * mi command group "modify by file source", computes vV's source difference,
 * then executes the group once. This is not a general source-write endpoint.
 * Call only from the version-pinned, journaled, supervised design executor.
 */
export function buildDesignNativeAdapter(operation: unknown, before: NativeSourceSnapshot, ids: DesignSourceIds = {}): DesignNativeAdapter | undefined {
  const compiled = compileDesignOperation(operation);
  if (isDesignRuleAction(compiled.action)) { return buildDesignRulePublicAdapter(operation, before); }
  if (compiled.effect.family === "line" || compiled.action === "pcb.pour.rebuild" || compiled.action === "pcb.pour.clear-derived") {return undefined;}
  const createdId = compiled.effect.identity === "create" ? randomBytes(8).toString("hex") : undefined;
  const resolved = createdId === undefined ? ids : { ...ids, createdId };
  const expected = buildExpectedDesignSource(operation, before, resolved);
  verifyDesignSourceEffect(compiled, before, expected, resolved);
  return buildReviewedNativeSourceMerge(before, expected, createdId);
}

/** Package-internal code generator shared by the strict design and stack
 * adapters. It is not registered as an MCP operation or caller-source API.
 */
export function buildReviewedNativeSourceMerge(before: NativeSourceSnapshot, expected: NativeSourceSnapshot, createdId?: string, documentType: 3 | 4 = 3): DesignNativeAdapter {
  for (const snapshot of [before, expected]) {
    if (snapshot.schema !== "easyeda-pro-control.document-source.v1" || snapshot.sha256 !== sha256Json({ schema: snapshot.schema, document: snapshot.document, objects: snapshot.objects })) {throw new Error("Invalid native merge source commitment.");}
  }
  if (canonicalJson(before.document) !== canonicalJson(expected.document)) {throw new Error("Native merge cannot replace document identity/metadata.");}
  // The pinned FileSource QR encoder constructs Wk(uuid), whose header is PCB
  // For both editor 3 and 4. Never rewrite it to fabricate a FOOTPRINT export.
  // The type-4 caller independently binds active library context and checkpoint.
  if (before.document["docType"] !== "PCB") {throw new Error("Native merge document type does not match the reviewed export representation.");}
  if (before.document["editVersion"] !== "3.2.149.88089769") {throw new Error("Native source merge editor profile mismatch.");}
  // Source apply triggers native autoFill/HistoryFlushService. A board with
  // Generated copper needs a separately modeled recomputation transaction.
  if (before.objects.some((object) => ["POURED", "LAYER_FILL", "TEARDROP", "PANELIZE_STAMP", "PARTITION"].includes(object.type))) {
    throw new Error("Clear existing POURED geometry with pcb.pour.clear-derived before native source edits, then rebuild. LAYER_FILL, TEARDROP, panelization and partition collateral remain unsupported.");
  }
  const baseline = canonicalJson({ document: before.document, objects: before.objects });
  const desired = canonicalJson({ document: expected.document, objects: expected.objects });
  if (baseline.length + desired.length > 16 * 1024 * 1024) {throw new Error("Native source merge exceeds the reviewed generated-program bound.");}
  const code = `
let mergeStage = 'setup';
try {
const MERGE_BASELINE = ${baseline};
const MERGE_DESIRED = ${desired};
const mergeCanonical = (value) => {
  if (Array.isArray(value)) return '[' + value.map(mergeCanonical).join(',') + ']';
  if (value !== null && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + mergeCanonical(value[key])).join(',') + '}';
  return JSON.stringify(value);
};
const parseMergeSource = (source) => {
  if (typeof source !== 'string' || source.length > 67108864) throw new Error('Incomplete native merge source');
  const lines = source.split('|\\n');
  if (lines.at(-1) === '') lines.pop();
  const rows = lines.map(line => {
    const split = line.indexOf('||');
    if (split <= 0) throw new Error('Invalid native record');
    return { header: JSON.parse(line.slice(0, split)), body: JSON.parse(line.slice(split + 2)), line };
  });
  if (rows[0]?.header.type !== 'DOCHEAD' || rows.length > 500000) throw new Error('Invalid native document header');
  const document = { ...rows[0].body };
  delete document.client; delete document.version; delete document.updateTime;
  const ids = new Set();
  const objects = rows.slice(1).map(row => {
    const { id, type } = row.header;
    if (typeof id !== 'string' || !id || ids.has(id) || typeof type !== 'string' || ['DOCHEAD','DELETE','DELETE_DOC'].includes(type) || row.body === null || Array.isArray(row.body) || typeof row.body !== 'object') throw new Error('Invalid native source identity');
    ids.add(id); return { id, type, body: row.body };
  }).sort((left, right) => left.id.localeCompare(right.id));
  return { document, objects, rows };
};
if (typeof EXPECTED_DOCUMENT_UUID !== 'string' || typeof EXPECTED_TAB_ID !== 'string' || EXPECTED_DOCUMENT_TYPE !== ${documentType} || MERGE_BASELINE.document.uuid !== EXPECTED_DOCUMENT_UUID) throw new Error('Native merge requires the outer context guard');
const mergeFileApi = eda.sys_FileManager;
if (typeof mergeFileApi?.getDocumentSource !== 'function' || (${documentType} === 3 && typeof mergeFileApi?.setDocumentSource !== 'function')) throw new Error('Native source merge APIs unavailable');
let mergeBus;
${documentType === 4 ? `
mergeStage = 'frame';
const mergeWindows = [globalThis.window?.top], mergeBuses = [], mergeSeen = new Set();
for (let index = 0; index < mergeWindows.length; index++) {
  if (mergeWindows.length > 64) throw new Error('Native merge frame bound exceeded');
  const frame = mergeWindows[index];
  if (!frame || mergeSeen.has(frame)) continue;
  mergeSeen.add(frame);
  let bus;
  try { bus = frame.MSG_BUS_PCB; for (let child = 0; child < frame.frames.length; child++) mergeWindows.push(frame.frames[child]); } catch { continue; }
  if (bus && typeof bus.messageBus?.rpcCall === 'function' && !mergeBuses.includes(bus)) mergeBuses.push(bus);
}
if (mergeBuses.length === 0 || mergeBuses.length > 8) throw new Error('Native merge frame scope unavailable');
for (const bus of mergeBuses) {
  const identity = (await bus.messageBus.rpcCall('getTabIdAndDocType', {}))?.message;
  if (identity?.tabId === EXPECTED_TAB_ID && identity?.docType === 4) {
    if (mergeBus) throw new Error('Native merge frame identity is duplicated');
    mergeBus = bus;
  }
}
if (!mergeBus) throw new Error('Exact native merge frame not found');
` : ""}
mergeStage = 'context';
const mergeDocument = await eda.dmt_SelectControl.getCurrentDocumentInfo();
if (String(mergeDocument?.uuid ?? mergeDocument?.documentUuid ?? mergeDocument?.id ?? '') !== EXPECTED_DOCUMENT_UUID || String(mergeDocument?.tabId ?? '') !== EXPECTED_TAB_ID || Number(mergeDocument?.documentType ?? mergeDocument?.docType) !== ${documentType}) throw new Error('Native merge context changed');
mergeStage = 'baseline';
const current = parseMergeSource(${documentType === 4 ? "(await mergeBus.messageBus.rpcCall('FileSource', {}))?.message" : "await mergeFileApi.getDocumentSource()"});
if (current.document.editVersion !== '3.2.149.88089769' || mergeCanonical({document:current.document, objects:current.objects}) !== mergeCanonical(MERGE_BASELINE)) throw new Error('Native merge baseline drift; nothing dispatched');
const wanted = new Map(MERGE_DESIRED.objects.map(object => [object.id, object]));
mergeStage = 'encode';
const existing = new Set(current.objects.map(object => object.id));
const output = [current.rows[0].line];
let ticket = 0;
for (const row of current.rows.slice(1)) {
  if (Number.isSafeInteger(row.header.ticket)) ticket = Math.max(ticket, row.header.ticket);
  const object = wanted.get(row.header.id);
  if (object === undefined) continue;
  output.push(mergeCanonical({id:row.header.id,type:row.header.type,body:row.body}) === mergeCanonical(object) ? row.line : JSON.stringify(row.header) + '||' + JSON.stringify(object.body));
}
for (const object of MERGE_DESIRED.objects) {
  if (!existing.has(object.id)) output.push(JSON.stringify({type:object.type,id:object.id,ticket:++ticket}) + '||' + JSON.stringify(object.body));
}
const merged = output.join('|\\n') + '|\\n';
const check = parseMergeSource(merged);
if (mergeCanonical({document:check.document,objects:check.objects}) !== mergeCanonical(MERGE_DESIRED)) throw new Error('Generated merge does not match its typed effect');
// No awaited boundary between the final complete baseline comparison and
// invoking the native history handler. The SDK has no atomic source compare-and-swap.
// Type 4 calls the exact decoder without UI file-dialog handling. Native false
// has been observed after a partial edit; retain it and prove the whole effect.
mergeStage = 'dispatch';
const applied = ${documentType === 4 ? "(await mergeBus.messageBus.rpcCall('pcb/decode', merged))?.message" : "await mergeFileApi.setDocumentSource(merged)"};
mergeStage = 'acknowledgment';
${documentType === 4 ? `
if (typeof applied !== 'boolean') throw new Error('Native source apply acknowledgment is malformed');
mergeStage = 'readback';
const mergeReadback = parseMergeSource((await mergeBus.messageBus.rpcCall('FileSource', {}))?.message);
if (mergeCanonical({document:mergeReadback.document,objects:mergeReadback.objects}) !== mergeCanonical(MERGE_DESIRED)) throw new Error('Native source effect differs from its typed commitment');
const mergeFinalContext = await eda.dmt_SelectControl.getCurrentDocumentInfo();
const mergeFinalIdentity = (await mergeBus.messageBus.rpcCall('getTabIdAndDocType', {}))?.message;
if (mergeFinalContext?.uuid !== EXPECTED_DOCUMENT_UUID || mergeFinalContext?.tabId !== EXPECTED_TAB_ID || mergeFinalContext?.documentType !== 4 || mergeFinalContext?.parentLibraryUuid !== mergeDocument?.parentLibraryUuid || mergeFinalIdentity?.tabId !== EXPECTED_TAB_ID || mergeFinalIdentity?.docType !== 4) throw new Error('Native merge final scope changed');
return { nativeSourceMerge: { profile:'footprint-exact-frame.v1', acknowledgment:applied, liveSourceVerified:true }, value:${createdId === undefined ? "true" : JSON.stringify({ primitiveId: createdId })} };
` : `if (applied !== true) throw new Error('Native source apply did not confirm completion');
return ${createdId === undefined ? "true" : JSON.stringify({ primitiveId: createdId })};`}
} catch (error) {
  ${documentType === 4 ? "throw new Error('Native source merge refused: footprint:' + mergeStage);" : "throw error;"}
}
`;
  return { profile: DESIGN_NATIVE_ADAPTER_PROFILE,
    requiredVersions: { editor: "3.2.149.88089769", pcb: "3.2.149.5378b690", api: "0.2.53.aee2f57a" },
    beforeSha256: before.sha256, expected, ...(createdId === undefined ? {} : { createdId }), code };
}

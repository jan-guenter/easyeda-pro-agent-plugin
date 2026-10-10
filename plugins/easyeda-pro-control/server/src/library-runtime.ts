/* oxlint-disable import/max-dependencies -- Catalog routing reuses each narrow adapter's operation validator instead of duplicating its admission contract. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { compileLibraryOperation, libraryOperationSchema } from "./library-operations.ts";
import type { LibraryArgument, LibraryOperation } from "./library-operations.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { deviceAssociationOperation } from "./device-association.ts";
import { deviceCreateOperation } from "./device-create.ts";
import { DEVICE_NATIVE_HOST_GUARD } from "./device-runtime-guard.ts";
import { libraryRuntimeCatchCode } from "./library-runtime-guard.ts";
import { projectSymbolMetadataOperation } from "./project-symbol-metadata.ts";
import { documentPageRenameOperation } from "./document-page-rename.ts";
import { documentPageCreateOperation } from "./document-page-create.ts";
import { projectSymbolCreateOperation } from "./project-symbol-create.ts";

/** Single-dispatch files stay below the existing escaped JSON transport limit. */
export const LIBRARY_FILE_EXECUTION_MAX_BYTES = 2 * 1024 * 1024;
export const LIBRARY_EXECUTION_PROFILE = "easyeda-pro-control.library-execution.v1";
export type LibraryExecutionKind = "metadata-read" | "file-export" | "project-footprint-write" | "project-device-association" | "project-device-create" | "project-device-transform" | "project-symbol-metadata" | "project-symbol-create" | "project-page-rename" | "project-page-create" | "document-open" | "document-activate" | "document-close";
const openScopeSchema = z.object({ projectUuid: z.string().min(1).max(256), uuid: z.string().min(1).max(256), documentType: z.number().int().min(1).max(4), metadataOwnerUuid: z.string().min(1).max(256).optional() }).strict();
export type LibraryOpenScope = z.infer<typeof openScopeSchema>;

// Returning a File does not make an export read-only. These installed paths
// Save unrelated dirty tabs (and schematic netlists can annotate parts first).
// A post-export comparison is too late to authorize or undo that hidden Save.
// Exact source chains and hashes: docs/api-coverage-review-2026-10-10.md.
const unsafeExportReasons = new Map<string, string>([
  ["export.schematic.netlist", "The installed schematic netlist exporter can annotate designators/Unique IDs and invoke SaveAll; no read-only or no-repeat Save lifecycle is implemented."],
  ["export.schematic.bom", "The installed schematic BOM exporter invokes SaveAll before generating the file; a project-scoped file export cannot authorize saving unrelated dirty tabs."],
  ["export.pcb.bom", "The installed PCB BOM exporter invokes SaveAll before generating the file; a project-scoped file export cannot authorize saving unrelated dirty tabs."],
  ["export.schematic.document", "The installed schematic document exporter invokes SaveAll before rendering; no explicit all-tab Save lifecycle is implemented."],
  ["export.pcb.pdf", "The installed PCB PDF exporter invokes SaveAll before rendering; no explicit all-tab Save lifecycle is implemented."],
  ["export.pcb.netlist", "The installed PCB netlist exporter invokes SaveAll whenever any editor tab is dirty; no atomic all-tab clean-state guard or Save lifecycle is implemented."],
  ["export.schematic.simulation", "The installed simulation-netlist exporter requires an NGSPICE document, outside the admitted schematic/symbol/PCB/footprint document types 1–4."],
]);

export function libraryExportRefusalReason(action: string): string | undefined {
  return unsafeExportReasons.get(action);
}

export function libraryExecutionKind(input: unknown): LibraryExecutionKind {
  const operation = libraryOperationSchema.parse(input);
  const exportRefusal = libraryExportRefusalReason(operation.action);
  if (exportRefusal !== undefined) { throw new Error(exportRefusal); }
  const compiled = compileLibraryOperation(operation);
  if (compiled.scope === "library" && compiled.effect.identity === "read") { return "metadata-read"; }
  if (compiled.scope === "export" && "maxBytes" in operation) {
    if (operation.maxBytes > LIBRARY_FILE_EXECUTION_MAX_BYTES) { throw new Error("File export execution currently accepts at most 2 MiB; larger chunked transfers are not implemented."); }
    if (operation.action === "export.pcb.model3d" && operation.autoGenerateModels) { throw new Error("Model-generating exports need a separate library-mutation proof."); }
    return "file-export";
  }
  if (operation.action === "library.footprint.create") {
    if ((operation.classification?.length ?? 0) > 0) { throw new Error("Native classification arrays are ignored; no classified create is admitted."); }
    return "project-footprint-write";
  }
  if (operation.action === "library.footprint.modify") {
    if (operation.patch.classification !== undefined || operation.patch.description === null) { throw new Error("Native classification/null-description behavior is not an exact metadata patch."); }
    return "project-footprint-write";
  }
  if (operation.action === "library.device.modify") { deviceAssociationOperation(operation); return "project-device-association"; }
  if (operation.action === "library.device.create") { deviceCreateOperation(operation); return "project-device-create"; }
  if (operation.action === "library.device.model-transform") { return "project-device-transform"; }
  if (operation.action === "library.symbol.modify") { projectSymbolMetadataOperation(operation); return "project-symbol-metadata"; }
  if (operation.action === "library.symbol.create") { projectSymbolCreateOperation(operation); return "project-symbol-create"; }
  if (operation.action === "document.page.rename") { documentPageRenameOperation(operation); return "project-page-rename"; }
  if (operation.action === "document.page.create") { documentPageCreateOperation(operation); return "project-page-create"; }
  if (operation.action === "document.open" || operation.action === "library.footprint.open" || operation.action === "library.symbol.open") { return "document-open"; }
  if (operation.action === "document.activate") { return "document-activate"; }
  if (operation.action === "document.close") { return "document-close"; }
  throw new Error("Typed catalog entry has no completed execution proof profile.");
}

function argumentCode(argument: LibraryArgument): string {
  if (argument.kind === "literal") { return JSON.stringify(argument.value); }
  if (argument.kind === "undefined") { return "undefined"; }
  if (argument.kind === "identity" && "uuid" in argument.target) { return JSON.stringify(argument.target.uuid); }
  throw new Error("Standalone library execution requires exact identities and no caller file/code arguments.");
}

export function buildLibraryExecutionExpression(input: unknown, projectSymbolMetadata = false, openScopeInput?: LibraryOpenScope): string {
  const operation = libraryOperationSchema.parse(input);
  if (projectSymbolMetadata && (operation.action !== "library.symbol.get" || !("uuid" in operation.target))) { throw new Error("Native symbol metadata evidence requires one exact symbol-get target."); }
  const kind = libraryExecutionKind(operation);
  const openScope = kind === "document-open" ? openScopeSchema.parse(openScopeInput) : undefined;
  if (openScope !== undefined && (!("target" in operation) || !("uuid" in operation.target) || operation.target.uuid !== openScope.uuid || ("libraryUuid" in operation && operation.libraryUuid !== openScope.projectUuid) || (operation.action === "library.symbol.open" && openScope.documentType !== 2) || (operation.action === "library.footprint.open" && openScope.documentType !== 4) || ([2, 4].includes(openScope.documentType) && openScope.metadataOwnerUuid === undefined))) { throw new Error("Library open scope contradicts its checkpoint-bound operation."); }
  if (kind === "project-device-association" || kind === "project-device-create" || kind === "project-device-transform") { throw new Error("Device mutation requires a checkpoint-bound native plan."); }
  if (kind === "project-symbol-metadata") { throw new Error("Symbol metadata mutation requires a checkpoint-bound native plan."); }
  if (kind === "project-symbol-create") { throw new Error("Empty symbol creation requires a checkpoint-bound local-origin plan."); }
  if (kind === "project-page-rename") { throw new Error("Page rename requires a checkpoint-bound closed-target plan."); }
  if (kind === "project-page-create") { throw new Error("Empty page creation requires a checkpoint-bound parent-only plan."); }
  if (kind === "document-activate") { throw new Error("Document activation requires a checkpoint-bound ownership plan."); }
  if (kind === "document-close") { throw new Error("Document close requires a checkpoint-bound inactive-clean-tab plan."); }
  const compiled = compileLibraryOperation(operation);
  const call = compiled.call;
  const args = call.args.map((argument) => argumentCode(argument)).join(",");
  const fileLimit = "maxBytes" in operation ? operation.maxBytes : 0;
  const nativeSymbolEvidence = projectSymbolMetadata && operation.action === "library.symbol.get" && "uuid" in operation.target ? `
${DEVICE_NATIVE_HOST_GUARD}
if(host.currentProject?.projectId!==${JSON.stringify(operation.libraryUuid)})throw new Error('LIBRARY_METADATA_MISSING');
const native=(await bus.rpcCall('/PrjDB/symbol/getData',[${JSON.stringify(operation.target.uuid)},${JSON.stringify(operation.libraryUuid)}])).message;
if(host.currentProject?.projectId!==${JSON.stringify(operation.libraryUuid)})throw new Error('LIBRARY_METADATA_MISSING');
payload.projectSymbolMetadata={uuid:native?.uuid,projectUuid:native?.project_uuid,ownerUuid:native?.owner?.uuid,searchTitle:native?.title,displayTitle:native?.display_title};` : "";
  return `(async () => {
let stage = 'api-lookup';
try {
const api = eda[${JSON.stringify(call.api)}];
const method = api?.[${JSON.stringify(call.method)}];
if (typeof method !== "function") throw new Error("LIBRARY_NATIVE_METHOD_MISSING");
stage = 'api-call';
const result = await method.call(api,${args});
stage = 'result-check';
let payload;
if (${JSON.stringify(kind)} === "file-export") {
  if (typeof File !== "function" || !(result instanceof File) || typeof result.name !== "string" || !result.name || result.name.length > 256 || /[\\/\\\\\\x00-\\x1f]/.test(result.name) ||
      !Number.isSafeInteger(result.size) || result.size < 1 || result.size > ${fileLimit} || typeof result.type !== "string" || result.type.length > 127) throw new Error("LIBRARY_EXPORT_FILE_INVALID");
  stage = 'file-read';
  const bytes = new Uint8Array(await result.arrayBuffer());
  if (bytes.byteLength !== result.size) throw new Error("LIBRARY_EXPORT_FILE_CHANGED");
  const chunks = [];
  for (let offset = 0; offset < bytes.length; offset += 262144) {
    let binary = "";
    for (const byte of bytes.subarray(offset, Math.min(offset+262144,bytes.length))) binary += String.fromCharCode(byte);
    chunks.push(btoa(binary));
  }
  stage = 'file-hash';
  const digest = await globalThis.crypto.subtle.digest("SHA-256",bytes);
  const sha256 = Array.from(new Uint8Array(digest),(byte)=>byte.toString(16).padStart(2,"0")).join("");
  payload = {kind:"file-export",name:result.name,mime:result.type,bytes:bytes.length,sha256,chunks};
} else if (${JSON.stringify(kind)} === "metadata-read") {
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("LIBRARY_METADATA_MISSING");
  payload = {kind:"metadata-read",metadata:result};
  ${nativeSymbolEvidence}
} else if (${JSON.stringify(kind)} === "document-open") {
  if (typeof result !== "string" || !result || result.length > 512) throw new Error("LIBRARY_OPEN_TAB_MISSING");
  const editor = eda.dmt_EditorControl;
  stage = 'activate';
  if (typeof editor?.activateDocument !== "function") throw new Error("LIBRARY_OPEN_ACTIVATION_FAILED");
  const activated = await editor.activateDocument(result);
  if (typeof activated !== 'boolean') throw new Error("LIBRARY_OPEN_ACTIVATION_FAILED");
  const scope = ${JSON.stringify(openScope ?? null)};
  const project = await eda.dmt_Project.getCurrentProjectInfo();
  const document = await eda.dmt_SelectControl.getCurrentDocumentInfo();
  if (project?.uuid !== scope.projectUuid || document?.uuid !== scope.uuid || document?.documentType !== scope.documentType || document?.tabId !== result || (scope.metadataOwnerUuid !== undefined && document?.parentLibraryUuid !== scope.metadataOwnerUuid)) throw new Error("LIBRARY_OPEN_ACTIVATION_FAILED");
  payload = {kind:"document-open",tabId:result,activation:{acknowledgment:activated,exactContextVerified:true}};
} else {
  if (${JSON.stringify(compiled.resultKind)} === "identity" ? typeof result !== "string" || !result || result.length > 256 : result !== true) throw new Error("LIBRARY_WRITE_ACK_INVALID");
  payload = {kind:"project-footprint-write",createdId:${JSON.stringify(compiled.resultKind)} === "identity" ? result : null};
}
stage = 'encode';
const json = JSON.stringify(payload);
const utf8Bytes = new TextEncoder().encode(json).byteLength;
const envelope = {schema:"easyeda-pro-control.exact-json.v1",utf8Bytes,json};
if (new TextEncoder().encode(JSON.stringify(envelope)).byteLength > 4194304) throw new Error("LIBRARY_OUTPUT_TOO_LARGE");
return envelope;
} catch (error) { ${libraryRuntimeCatchCode(kind)} }
})()`;
}

function safeFileName(value: string): boolean {
  if (value.includes("/") || value.includes("\\")) { return false; }
  for (const character of value) { if ((character.codePointAt(0) ?? 0) < 32) { return false; } }
  return true;
}
const fileResult = z.object({ kind: z.literal("file-export"), name: z.string().min(1).max(256).refine(safeFileName), mime: z.string().max(127), bytes: z.number().int().min(1).max(LIBRARY_FILE_EXECUTION_MAX_BYTES), sha256: z.string().regex(/^[a-f0-9]{64}$/u), chunks: z.array(z.string().max(349_528)).min(1).max(8) }).strict();
export interface DecodedLibraryFile { readonly name: string; readonly mime: string; readonly bytes: Buffer; readonly sha256: string }
export function decodeLibraryFileResult(envelope: unknown, maxBytes: number): DecodedLibraryFile {
  const result = fileResult.parse(decodeExactReadEnvelope(envelope));
  if (result.bytes > maxBytes || result.chunks.length !== Math.ceil(result.bytes / 262_144)) { throw new Error("File transfer count/size mismatch."); }
  const chunks = result.chunks.map((chunk, index) => {
    const bytes = Buffer.from(chunk, "base64");
    const expected = Math.min(262_144, result.bytes - index * 262_144);
    if (bytes.toString("base64") !== chunk || bytes.length !== expected) { throw new Error("Noncanonical or truncated file chunk."); }
    return bytes;
  });
  const bytes = Buffer.concat(chunks);
  if (createHash("sha256").update(bytes).digest("hex") !== result.sha256) { throw new Error("Export content hash mismatch."); }
  return { name: result.name, mime: result.mime, bytes, sha256: result.sha256 };
}

export function validateLibraryMetadata(input: unknown, operation: LibraryOperation): Record<string, unknown> {
  const compiled = compileLibraryOperation(operation);
  const target = compiled.target?.identity;
  const value = z.record(z.string(), z.json()).parse(input);
  if (target === undefined || !("uuid" in target) || value["uuid"] !== target.uuid || typeof value["libraryUuid"] !== "string" || value["libraryUuid"].length === 0 || typeof value["name"] !== "string" || value["name"].length === 0) { throw new Error("Library metadata does not prove the exact requested identity."); }
  const expectedType = { symbol: "2", footprint: "4", device: "3", model3d: "5" }[operation.action.split(".")[1] ?? ""];
  if (value["libraryType"] !== expectedType) { throw new Error("Library metadata family mismatch."); }
  return value;
}

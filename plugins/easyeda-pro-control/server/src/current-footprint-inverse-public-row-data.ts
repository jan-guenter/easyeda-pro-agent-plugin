/** Fixed source projection from supplied saved history and completed SQL.
 * Ordered tagged values preserve own undefined fields. No runtime is issued. */
import { Script } from "node:vm";
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as FLOW } from "./current-generated-initial-cache-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_SOURCE as SOURCE } from "./current-footprint-inverse-public-row-source.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory, SqlCell } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export type CurrentFootprintInversePublicRowValue = Readonly<{ kind: "undefined" | "null" }> |
  Readonly<{ kind: "string"; value: string }> | Readonly<{ kind: "number"; value: number }> | Readonly<{ kind: "boolean"; value: boolean }> |
  Readonly<{ kind: "array"; values: readonly CurrentFootprintInversePublicRowValue[] }> |
  Readonly<{ kind: "object"; entries: readonly (readonly [string, CurrentFootprintInversePublicRowValue])[] }>;
const valueSchema: z.ZodType<CurrentFootprintInversePublicRowValue> = z.lazy(() => {
  const entry = z.tuple([z.string().max(128), valueSchema]);
  const entries = z.array(entry).max(64);
  return z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.enum(["undefined", "null"]) }), z.strictObject({ kind: z.literal("string"), value: z.string().max(16_384) }),
  z.strictObject({ kind: z.literal("number"), value: z.number() }), z.strictObject({ kind: z.literal("boolean"), value: z.boolean() }),
  z.strictObject({ kind: z.literal("array"), values: z.array(valueSchema).max(128) }),
  z.strictObject({ kind: z.literal("object"), entries }),
]);
});
const outputSchema = z.strictObject({ workerRow: valueSchema, uiRow: valueSchema });
const PROGRAM = `(()=>{'use strict';
const input=JSON.parse(payload),Fe=true,ve=Object.fromEntries(['CONFIG','BOARD','SCH','SCH_PAGE','SIMULATION','PCB','PANEL','SYMBOL','FOOTPRINT','DEVICE','INSTANCE','BLOB'].map(k=>[k,k]));
const be={FOOTPRINT:{ON_ADD:'footprint-add',ON_UPDATE:'footprint-update',ON_DELETE:'footprint-delete'}},De={META:'META',DELETE_DOC:'DELETE_DOC'},Oe={FOOTPRINT:4},console={error(){throw Error('INVERSE_PUBLIC_ROW_FLOW');},warn(){throw Error('INVERSE_PUBLIC_ROW_TITLE');}};
${SOURCE.normalizeTitle.source}
${SOURCE.time.source};${SOURCE.path.source};${SOURCE.creator.source};${SOURCE.modifier.source};${SOURCE.owner.source};${SOURCE.rowBase.source};${SOURCE.projectRow.source};
const project={uuid:input.projectUuid,projectDetails:{owner:input.owner},notifyWatcher(){},publishMaxTicket(){},uploadStructure(){},localPublishTicket(){},canWsPublish(){return false;},${SOURCE.headChange.source}};
const footprint={data:Object.create(null),mainKey:'uuid',client:'inert-readonly-client',projectManager:project,publishUpdate(){},publishCanvas(){},${SOURCE.setEditData.source},${SOURCE.onDataChange.source},${SOURCE.rowGet.source},${SOURCE.dataGet.source}};project.footprint=footprint;
const metadata={docHead:Object.create(null),creators:Object.create(null),historyDocHead:Object.create(null),headCbArr:[(head,edit)=>{if(head.uuid===input.footprintUuid){if(head.docType!=='FOOTPRINT')throw Error('INVERSE_PUBLIC_ROW_DOCTYPE');project.onHeadChange(head,edit);}}],setMaxTicket(){},${SOURCE.docHead.source}};
project.consistencyManager={getDoctype(uuid){return metadata.docHead[uuid]?.docType;}};class BindChange{create(){return(${SOURCE.change.source});}}const change=BindChange.prototype.create.call(project);
${FLOW.Gu.source};${FLOW.Ro.source};let ${FLOW.groupTypes.source};${FLOW.Na.source};
const parser={throwError:true,onEditHead(){},onDocHead(head,edit,raw,history){metadata.onDocHead(head,edit,raw,history);},onLine(id,ticket,body,type,client,docType,uuid,firstTicket,pend,edit,num,raw,history){if(uuid===input.footprintUuid){if(docType!=='FOOTPRINT')throw Error('INVERSE_PUBLIC_ROW_DOCTYPE');change.call(project,uuid,id,body,type,client,ticket,undefined,firstTicket,pend,false,undefined,undefined,undefined);}},onEnd(){},${FLOW.flowParseFull.source}};
for(const chunk of input.chunks){const flow=parser.flowParseFull();flow.start();flow.update(chunk.plaintext);flow.end();}
const model=footprint.data[input.footprintUuid];if(!model||typeof model.title!=='string'||!/^[\\x20-\\x7e]{1,128}$/.test(model.title)||model.title.includes('I'))throw Error('INVERSE_PUBLIC_ROW_LOCALE_TITLE');
const result=footprint.getData(input.footprintUuid);if(result.success!==true||!result.result)throw Error('INVERSE_PUBLIC_ROW_ABSENT');const row=result.result,ui=tgt(input.projectUuid,row);
let nodes=0;const encode=(v,depth=0)=>{if(++nodes>512||depth>8)throw Error('INVERSE_PUBLIC_ROW_BOUND');if(v===undefined)return{kind:'undefined'};if(v===null)return{kind:'null'};if(typeof v==='string'){if(v.length>16384)throw Error('INVERSE_PUBLIC_ROW_STRING');return{kind:'string',value:v};}if(typeof v==='number'){if(!Number.isFinite(v))throw Error('INVERSE_PUBLIC_ROW_NUMBER');return{kind:'number',value:v};}if(typeof v==='boolean')return{kind:'boolean',value:v};if(typeof v!=='object')throw Error('INVERSE_PUBLIC_ROW_VALUE');const proto=Object.getPrototypeOf(v),descriptors=Object.getOwnPropertyDescriptors(v),keys=Reflect.ownKeys(v);if(keys.some(k=>typeof k!=='string'))throw Error('INVERSE_PUBLIC_ROW_SYMBOL');if(Array.isArray(v)){if(proto!==Array.prototype||v.length>128||keys.length!==v.length+1)throw Error('INVERSE_PUBLIC_ROW_ARRAY');return{kind:'array',values:Array.from({length:v.length},(_,i)=>{const d=descriptors[i];if(!d||!Object.hasOwn(d,'value'))throw Error('INVERSE_PUBLIC_ROW_GETTER');return encode(d.value,depth+1);})};}if(proto!==Object.prototype&&proto!==null||keys.length>64)throw Error('INVERSE_PUBLIC_ROW_OBJECT');return{kind:'object',entries:keys.map(k=>{const d=descriptors[k];if(k.length>128||!d||!Object.hasOwn(d,'value'))throw Error('INVERSE_PUBLIC_ROW_GETTER');return[k,encode(d.value,depth+1)];})};};
return JSON.stringify({workerRow:encode(row),uiRow:encode(ui)});
})()`;
const projection = new Script(PROGRAM, { filename: "current-footprint-inverse-public-row-data.js" });
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_PROJECTION_SHA256 = sha256Text(PROGRAM);
export const CURRENT_FOOTPRINT_INVERSE_GET_MODEL_READ_FIELDS=Object.freeze(["uuid","isDelete","title","creator","createTime","modifier","description","updateTime","tags","source","version","ticket"]as const);
const INPUT_RETURN=`const selected={};for(const key of ${JSON.stringify(CURRENT_FOOTPRINT_INVERSE_GET_MODEL_READ_FIELDS)})selected[key]=model[key];return JSON.stringify({model:encode(selected),owner:encode(project.projectDetails.owner)});`;
const INPUT_ANCHOR="return JSON.stringify({workerRow:encode(row),uiRow:encode(ui)});";
if(PROGRAM.split(INPUT_ANCHOR).length!==2){throw new Error("INVERSE_GET_MODEL_PROGRAM_ANCHOR");}
const INPUT_PROGRAM=PROGRAM.replace(INPUT_ANCHOR,INPUT_RETURN);
const inputProjection=new Script(INPUT_PROGRAM,{filename:"current-footprint-inverse-get-model-input.js"});
const inputOutputSchema=z.strictObject({model:valueSchema,owner:valueSchema});
export interface CurrentFootprintInverseGetModelInputData{
 readonly schema:"private.current-footprint-inverse-get-model-input.v1";
 readonly projectUuid:string;readonly branchUuid:string;readonly footprintUuid:string;
 readonly sourceSha256:string;readonly logicalSha256:string;readonly completeDecodedChunksSha256:string;readonly projectionSourceSha256:string;
 readonly model:CurrentFootprintInversePublicRowValue;readonly owner:CurrentFootprintInversePublicRowValue;
 readonly suppliedObservationsOnly:true;readonly nativeInputVerified:false;
}
export interface CurrentFootprintInversePublicRowData {
  readonly schema: "private.current-footprint-inverse-public-row-data.v1";
  readonly projectUuid: string; readonly branchUuid: string; readonly footprintUuid: string; readonly headHistoryUuid: string;
  readonly sourceSha256: string; readonly logicalSha256: string; readonly completeDecodedChunksSha256: string; readonly projectionSourceSha256: string;
  readonly workerRow: CurrentFootprintInversePublicRowValue; readonly uiRow: CurrentFootprintInversePublicRowValue;
  readonly suppliedObservationsOnly: true; readonly nativeRowVerified: false; readonly deletionAuthorized: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_PUBLIC_ROW_DATA"); } }
function scalar(cell: SqlCell | undefined): string | number | null {
  need(cell !== undefined); if (cell.kind === "null") { return null; }
  if (cell.kind === "integer") { const value = Number(cell.decimal); need(Number.isSafeInteger(value) && String(value) === cell.decimal); return value; }
  need(cell.kind === "text"); const bytes = Buffer.from(cell.hex, "hex"), text = bytes.toString("utf8"); need(Buffer.from(text).equals(bytes)); return text;
}
/** The source's projects.owner_uuid LEFT JOIN users is independent of the
 * directory owner in a project_structures content record. */
function projectOwner(inventory: NativeSqlInventory, projectUuid: string): Readonly<Record<string, string | number | null>> {
  const rows = (name: string): readonly Readonly<Record<string, string | number | null>>[] => {
    const tables = inventory.tables.filter(table => table.name === name); need(tables.length === 1 && tables[0] !== undefined); const table = tables[0];
    const names = table.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; }); need(new Set(names).size === names.length);
    return table.rows.map(row => { need(row.cells.length === names.length); return Object.fromEntries(names.map((key, index) => [key, scalar(row.cells[index])])); });
  };
  const projects = rows("projects"); need(projects.length === 1 && projects[0]?.["uuid"] === projectUuid); const owner = projects[0]["owner_uuid"]; need(typeof owner === "string");
  const users = rows("users").filter(user => user["uuid"] === owner); need(users.length <= 1);
  const joined = users[0]; const value = (key: string): string | number | null => { if (joined === undefined) { return null; } const found = joined[key]; need(found !== undefined); return found; };
  return Object.freeze({ uuid: owner, username: value("username"), nickname: value("nickname"), avatar: value("avatar") });
}
export function deriveCurrentFootprintInversePublicRowData(input: unknown, footprintUuid: string, inventory: NativeSqlInventory): CurrentFootprintInversePublicRowData {
  const completion = readerCompletion(inventory), source = captureCurrentFootprintSavedFlowCacheInput(input); deriveCurrentFootprintSavedFlowCacheData(source);
  need(/^[a-f\d]{32}$/u.test(footprintUuid)); const owner = projectOwner(inventory, source.projectUuid);
  let raw: unknown;
  try { raw = projection.runInNewContext({ payload: JSON.stringify({ projectUuid: source.projectUuid, footprintUuid, owner, chunks: source.chunks }) }, { timeout: 1000, microtaskMode: "afterEvaluate", contextCodeGeneration: { strings: false, wasm: false } }) as unknown; }
  catch { throw new Error("INVERSE_PUBLIC_ROW_PROJECTION"); }
  need(typeof raw === "string" && Buffer.byteLength(raw) <= 65_536); const parsed: unknown = JSON.parse(raw);
  const output = outputSchema.parse(captureCurrentPcbStringClockReply(parsed).value); need(output.workerRow.kind === "object" && output.uiRow.kind === "object" && readerCompletion(inventory) === completion);
  const data = freezeDeep({ schema: "private.current-footprint-inverse-public-row-data.v1" as const, projectUuid: source.projectUuid, branchUuid: source.branchUuid, footprintUuid,
    headHistoryUuid: source.headHistoryUuid, sourceSha256: inventory.checkpointSha256, logicalSha256: inventory.logicalSha256, completeDecodedChunksSha256: sha256Text(canonicalJson(source.chunks)),
    projectionSourceSha256: CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_PROJECTION_SHA256, ...output, suppliedObservationsOnly: true as const, nativeRowVerified: false as const, deletionAuthorized: false as const });
  need(canonicalJson(data).length <= 131_072); return data;
}

/** Separate read-input projection. The historical row program, hash, v1 shape
 * and expected row values remain unchanged. This pure data is no runtime grant. */
export function deriveCurrentFootprintInverseGetModelInputData(input:unknown,footprintUuid:string,inventory:NativeSqlInventory,expected:CurrentFootprintInversePublicRowData):CurrentFootprintInverseGetModelInputData{
 const row=deriveCurrentFootprintInversePublicRowData(input,footprintUuid,inventory);need(canonicalJson(row)===canonicalJson(expected));const completion=readerCompletion(inventory);const source=captureCurrentFootprintSavedFlowCacheInput(input);const owner=projectOwner(inventory,source.projectUuid);let raw:unknown;
 try{raw=inputProjection.runInNewContext({payload:JSON.stringify({projectUuid:source.projectUuid,footprintUuid,owner,chunks:source.chunks})},{timeout:1000,microtaskMode:"afterEvaluate",contextCodeGeneration:{strings:false,wasm:false}})as unknown;}catch{throw new Error("INVERSE_GET_MODEL_PROJECTION");}
 need(typeof raw==="string"&&Buffer.byteLength(raw)<=65_536);const parsed:unknown=JSON.parse(raw);const data=inputOutputSchema.parse(captureCurrentPcbStringClockReply(parsed).value);need(data.model.kind==="object"&&data.model.entries.length===CURRENT_FOOTPRINT_INVERSE_GET_MODEL_READ_FIELDS.length&&data.model.entries.every(([key],index)=>key===CURRENT_FOOTPRINT_INVERSE_GET_MODEL_READ_FIELDS[index])&&readerCompletion(inventory)===completion);
 return freezeDeep({schema:"private.current-footprint-inverse-get-model-input.v1",projectUuid:row.projectUuid,branchUuid:row.branchUuid,footprintUuid:row.footprintUuid,sourceSha256:row.sourceSha256,logicalSha256:row.logicalSha256,completeDecodedChunksSha256:row.completeDecodedChunksSha256,projectionSourceSha256:sha256Text(INPUT_PROGRAM),...data,suppliedObservationsOnly:true,nativeInputVerified:false});
}

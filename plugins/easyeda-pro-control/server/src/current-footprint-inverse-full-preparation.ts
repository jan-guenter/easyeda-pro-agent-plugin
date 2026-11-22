/** Full-writer saved data -> distinct inverse eligibility. This module
 * retains genuine closed source references and derives pure bounded data only;
 * no old checkpoint/plan registry, native owner or execution grant is issued. */
/* oxlint-disable import/max-dependencies -- One original full-successor issuer joins independently bounded SQL, parser, cache, row and reference algorithms before any native birth; each original owner remains in its existing private registry. */
import {canonicalJson} from "./core.ts";
import {readerCompletion} from "./sqlite-inventory.ts";
import type {NativeSqlInventory,SqlCell,SqlTable} from "./sqlite-inventory-core.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {decodeCurrentFootprintSourceHistory} from "./symbol-sql-comparator.ts";
import {requireOriginalCurrentFootprintForwardWriterSavedCheckpoint,verifyCurrentFootprintForwardWriterSavedCheckpoint} from "./current-footprint-forward-writer-held-saved-generation.ts";
import type {CurrentFootprintForwardWriterSavedCheckpoint} from "./current-footprint-forward-writer-held-saved-generation.ts";
import {currentFootprintCopyV2SavedTarget} from "./current-footprint-copy-v2-saved-source.ts";
import {captureCurrentFootprintSavedFlowCacheInput,deriveCurrentFootprintSavedFlowCacheData} from "./current-footprint-saved-flow-cache-data.ts";
import type {CurrentFootprintSavedFlowCacheData,CurrentFootprintSavedFlowCacheInput} from "./current-footprint-saved-flow-cache-data.ts";
import {deriveCurrentFootprintInverseStartupData} from "./current-footprint-inverse-startup-data.ts";
import type {CurrentFootprintInverseStartupData} from "./current-footprint-inverse-startup-data.ts";
import {deriveCurrentFootprintInverseInitialCacheData} from "./current-footprint-inverse-initial-cache-data.ts";
import type {CurrentFootprintInverseInitialCacheData} from "./current-footprint-inverse-initial-cache-data.ts";
import {deriveCurrentFootprintInverseInitialSyncData} from "./current-footprint-inverse-initial-sync-data.ts";
import type {CurrentFootprintInverseInitialSyncData} from "./current-footprint-inverse-initial-sync-data.ts";
import {deriveCurrentFootprintInverseColdLoadData} from "./current-footprint-inverse-cold-load-data.ts";
import type {CurrentFootprintInverseColdLoadData} from "./current-footprint-inverse-cold-load-data.ts";
import { deriveCurrentFootprintInverseFullProjectionData } from "./current-footprint-inverse-v4-public-row-data.ts";
import type {CurrentFootprintInverseGetModelInputData,CurrentFootprintInversePublicRowData,CurrentFootprintInverseReferenceData} from "./current-footprint-inverse-v4-public-row-data.ts";
import type {CurrentFootprintSavedFlowCachePlan} from "./current-footprint-saved-flow-cache-plan.ts";
import type {CurrentFootprintInverseStartupPlan} from "./current-footprint-inverse-startup-plan.ts";
import type {CurrentFootprintInversePublicRowPlan} from "./current-footprint-inverse-public-row-plan.ts";

export interface CurrentFootprintInverseFullPreparation{readonly profile:"private.current-footprint-inverse-full-preparation.v1"}
type Prior=ReturnType<typeof requireOriginalCurrentFootprintForwardWriterSavedCheckpoint>;
interface Data{
 readonly input:CurrentFootprintSavedFlowCacheInput;readonly flow:CurrentFootprintSavedFlowCacheData;
 readonly startup:CurrentFootprintInverseStartupData;readonly cache:CurrentFootprintInverseInitialCacheData;
 readonly sync:CurrentFootprintInverseInitialSyncData;readonly cold:CurrentFootprintInverseColdLoadData;
 readonly row:CurrentFootprintInversePublicRowData;readonly model:CurrentFootprintInverseGetModelInputData;
 readonly reference:CurrentFootprintInverseReferenceData;
}
interface Original{
 readonly checkpoint:CurrentFootprintForwardWriterSavedCheckpoint;readonly prior:Prior;
 readonly completion:ReturnType<typeof readerCompletion>;readonly data:Readonly<Data>;readonly text:string;
 readonly flowPlan:CurrentFootprintSavedFlowCachePlan;readonly startupPlan:CurrentFootprintInverseStartupPlan;readonly rowPlan:CurrentFootprintInversePublicRowPlan;
}
const attempts=new WeakMap<CurrentFootprintForwardWriterSavedCheckpoint,Promise<CurrentFootprintInverseFullPreparation>>();
const issued=new WeakMap<CurrentFootprintInverseFullPreparation,Readonly<Original>>();
const flowPlans=new WeakMap<CurrentFootprintSavedFlowCachePlan,CurrentFootprintInverseFullPreparation>();
const startupPlans=new WeakMap<CurrentFootprintInverseStartupPlan,CurrentFootprintInverseFullPreparation>();
const rowPlans=new WeakMap<CurrentFootprintInversePublicRowPlan,CurrentFootprintInverseFullPreparation>();
type Scalar=string|number|null;
const fields = ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_FULL_PREPARATION"); } }
function table(inventory: NativeSqlInventory, name: string): SqlTable { const matches = inventory.tables.filter(value => value.name === name); need(matches.length === 1 && matches[0] !== undefined); return matches[0]; }
function scalar(input: SqlCell | undefined): Scalar {
  need(input !== undefined); if (input.kind === "null") { return null; }
  if (input.kind === "integer") { const value = Number(input.decimal); need(Number.isSafeInteger(value) && String(value) === input.decimal); return value; }
  need(input.kind === "text"); const bytes = Buffer.from(input.hex, "hex"), text = bytes.toString("utf8"); need(Buffer.from(text).equals(bytes)); return text;
}
function rows(value: SqlTable): readonly Readonly<Record<string, Scalar>>[] {
  const names = value.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; }); need(new Set(names).size === names.length);
  return value.rows.map(row => { need(row.cells.length === names.length); return Object.freeze(Object.fromEntries(names.map((name, index) => [name, scalar(row.cells[index])]))); });
}
function one(values: readonly Readonly<Record<string, Scalar>>[], uuid: string): Readonly<Record<string, Scalar>> { const matches = values.filter(value => value["uuid"] === uuid); need(matches.length === 1 && matches[0] !== undefined); return matches[0]; }

function current(original:Pick<Original,"checkpoint"|"prior"|"completion">):void{
 const same=requireOriginalCurrentFootprintForwardWriterSavedCheckpoint(original.checkpoint);const prior=original.prior;
 need(same.writer===prior.writer&&same.owner===prior.owner&&same.writerAfter===prior.writerAfter&&same.inventory===prior.inventory&&same.projection===prior.projection&&same.savedRead===prior.savedRead&&same.paired===prior.paired&&same.snapshot===prior.snapshot);
 const writer=same.writer.status();const saved=same.owner.status();
 need(writer.released&&writer.helperClosed&&saved.released&&saved.helperClosed&&same.snapshot.inventory===same.inventory&&readerCompletion(same.inventory)===original.completion&&original.completion.observedChildClose&&original.completion.exitCode===0&&original.completion.exitSignal===null);
}
/** The complete source-derived projection is retained before its first await.
 * It cannot turn an old-shaped token or supplied SQL into a full checkpoint. */
export function prepareCurrentFootprintInverseFullPreparation(checkpoint:CurrentFootprintForwardWriterSavedCheckpoint):Promise<CurrentFootprintInverseFullPreparation>{
 const prior=requireOriginalCurrentFootprintForwardWriterSavedCheckpoint(checkpoint);const completion=readerCompletion(prior.inventory);
 const base={checkpoint,prior,completion};current(base);
 const previous=attempts.get(checkpoint);if(previous!==undefined){return previous;}
 const gate=Promise.withResolvers<null>();
 const pending=(async():Promise<CurrentFootprintInverseFullPreparation>=>{
  await gate.promise;current(base);await verifyCurrentFootprintForwardWriterSavedCheckpoint(checkpoint);current(base);
  const target=currentFootprintCopyV2SavedTarget(prior.projection);const branches=rows(table(prior.inventory,"branches"));const branch=one(branches,target.branchUuid);
  need(branch["project_uuid"]===target.projectUuid&&branch["node"]===0&&branch["delete_status"]===0);
  const parent=branch["parent_uuid"];need(parent===null||typeof parent==="string");
  if(parent!==null){const start=one(branches,parent);need(start["name"]==="start"&&start["node"]===1&&start["delete_status"]===0&&start["project_uuid"]===target.projectUuid&&start["parent_uuid"]===null&&start["history_uuid"]===null);}
  const decoded=await decodeCurrentFootprintSourceHistory(prior.inventory,{projectUuid:target.projectUuid,branchUuid:target.branchUuid});current(base);
  need(decoded.history.documents.some(document=>document.uuid===target.footprintUuid&&document.docType==="FOOTPRINT")&&decoded.links.length===decoded.chunks.length&&decoded.history.headHistoryUuid===branch["history_uuid"]);
  const heads=rows(table(prior.inventory,`project_history_${target.branchUuid}`)).map(row=>Object.fromEntries(fields.map(name=>{const value=row[name];need(value!==undefined);return[name,value];})));
  need(heads.every(row=>typeof row["id"]==="number"));heads.sort((left,right)=>Number(right["id"])-Number(left["id"]));
  const chunks=decoded.chunks.map((plaintext,index)=>{const link=decoded.links[index];need(link!==undefined);return Object.freeze({historyUuid:link.historyUuid,ordinal:link.ordinal,plaintext,plaintextSha256:link.plaintextSha256});});
  const input=captureCurrentFootprintSavedFlowCacheInput({projectUuid:target.projectUuid,branchUuid:target.branchUuid,headHistoryUuid:decoded.history.headHistoryUuid,heads,chunks});
  const flow=deriveCurrentFootprintSavedFlowCacheData(input);const startup=deriveCurrentFootprintInverseStartupData(input);
  const copied=startup.documentFamilies.find(document=>document.uuid===target.footprintUuid);
  need(copied!==undefined&&copied.families.length===1&&copied.families[0]?.docType==="FOOTPRINT"&&copied.families[0].rawRows>0);
  const projections=deriveCurrentFootprintInverseFullProjectionData(input,target.footprintUuid,prior.inventory);
  const data:Readonly<Data>=freezeDeep({input,flow,startup,cache:deriveCurrentFootprintInverseInitialCacheData(flow),sync:deriveCurrentFootprintInverseInitialSyncData(input,flow),
   cold:deriveCurrentFootprintInverseColdLoadData(input,flow,prior.inventory),...projections});
  current(base);await verifyCurrentFootprintForwardWriterSavedCheckpoint(checkpoint);current(base);
  const prepared:CurrentFootprintInverseFullPreparation=Object.freeze({profile:"private.current-footprint-inverse-full-preparation.v1"});
  // Factual opaque plan shapes are shared; original maps and issuers are not.
  const flowPlan:CurrentFootprintSavedFlowCachePlan=Object.freeze({profile:"private.current-footprint-saved-flow-cache-plan.v1"});
  const startupPlan:CurrentFootprintInverseStartupPlan=Object.freeze({profile:"private.current-footprint-inverse-startup-plan.v1"});
  const rowPlan:CurrentFootprintInversePublicRowPlan=Object.freeze({profile:"private.current-footprint-inverse-public-row-plan.v1"});
  issued.set(prepared,Object.freeze({...base,data,text:canonicalJson(data),flowPlan,startupPlan,rowPlan}));
  flowPlans.set(flowPlan,prepared);startupPlans.set(startupPlan,prepared);rowPlans.set(rowPlan,prepared);
  requireOriginalCurrentFootprintInverseFullPreparation(prepared);return prepared;
 })();
 attempts.set(checkpoint,pending);gate.resolve(null);return pending;
}
/** Complete historical source facts only. Native birth must use its own
 * explicit full-source factory, private options and from-birth reservation. */
export function requireOriginalCurrentFootprintInverseFullPreparation(prepared:CurrentFootprintInverseFullPreparation):Readonly<Original>{
 const original=issued.get(prepared);need(original!==undefined);current(original);need(canonicalJson(original.data)===original.text);return original;
}
export async function verifyCurrentFootprintInverseFullPreparation(prepared:CurrentFootprintInverseFullPreparation):Promise<void>{
 const original=requireOriginalCurrentFootprintInverseFullPreparation(prepared);
 await verifyCurrentFootprintForwardWriterSavedCheckpoint(original.checkpoint);
 need(requireOriginalCurrentFootprintInverseFullPreparation(prepared)===original);
}
export function currentFootprintInverseFullFlowPlan(prepared:CurrentFootprintInverseFullPreparation):CurrentFootprintSavedFlowCachePlan{return requireOriginalCurrentFootprintInverseFullPreparation(prepared).flowPlan;}
export function currentFootprintInverseFullStartupPlan(prepared:CurrentFootprintInverseFullPreparation):CurrentFootprintInverseStartupPlan{return requireOriginalCurrentFootprintInverseFullPreparation(prepared).startupPlan;}
export function currentFootprintInverseFullPublicRowPlan(prepared:CurrentFootprintInverseFullPreparation):CurrentFootprintInversePublicRowPlan{return requireOriginalCurrentFootprintInverseFullPreparation(prepared).rowPlan;}
export function requireCurrentFootprintInverseFullFlowData(prepared:CurrentFootprintInverseFullPreparation,plan:CurrentFootprintSavedFlowCachePlan):Readonly<Pick<Data,"input"|"flow">>{
 const original=requireOriginalCurrentFootprintInverseFullPreparation(prepared);need(flowPlans.get(plan)===prepared&&plan===original.flowPlan);return original.data;
}
export function requireCurrentFootprintInverseFullStartupData(prepared:CurrentFootprintInverseFullPreparation,plan:CurrentFootprintInverseStartupPlan):Readonly<Pick<Data,"startup"|"cache"|"sync"|"cold">>{
 const original=requireOriginalCurrentFootprintInverseFullPreparation(prepared);need(startupPlans.get(plan)===prepared&&plan===original.startupPlan);return original.data;
}
export function requireCurrentFootprintInverseFullPublicRowData(prepared:CurrentFootprintInverseFullPreparation,plan:CurrentFootprintInversePublicRowPlan):Readonly<Pick<Data,"row"|"model"|"reference">>{
 const original=requireOriginalCurrentFootprintInverseFullPreparation(prepared);need(rowPlans.get(plan)===prepared&&plan===original.rowPlan);return original.data;
}

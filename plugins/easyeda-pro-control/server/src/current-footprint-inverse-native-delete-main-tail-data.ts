/** Inert many-head natural DELETE post-sync model. Original Source and read
 * registries, never these comparisons, supply native request authority. */
import {z}from"zod";
import {canonicalJson,sha256Json,sha256Text}from"./core.ts";
import {freezeDeep}from"./sqlite-inventory-core.ts";
import type {NativeSqlInventory,SqlCell}from"./sqlite-inventory-core.ts";
import {readerCompletion}from"./sqlite-inventory.ts";
import {captureCurrentFootprintSavedFlowCacheInput,deriveCurrentFootprintSavedFlowCacheData}from"./current-footprint-saved-flow-cache-data.ts";
import type {CurrentFootprintSavedFlowCacheData,CurrentFootprintSavedFlowCacheInput}from"./current-footprint-saved-flow-cache-data.ts";
import {currentFootprintInverseMainHistoryValueSchema,deriveCurrentFootprintInverseMainHistoryBaseline}from"./current-footprint-inverse-main-history-baseline.ts";
import type {CurrentFootprintInverseMainHistoryBaseline}from"./current-footprint-inverse-main-history-baseline.ts";
import {deriveCurrentFootprintInverseNativeDeleteMainBaseline}from"./current-footprint-inverse-native-delete-main-baseline.ts";
import type {CurrentFootprintInverseNativeDeleteMainSourceOriginal}from"./current-footprint-inverse-native-delete-main-source.ts";
import type {CurrentProjectHistorySqlEffects}from"./current-project-history-sql-effects.ts";
import {CURRENT_GENERATED_INITIAL_BRANCH_API_FIELDS as BRANCH_FIELDS}from"./current-generated-initial-branch-source.ts";

type Original=Pick<CurrentFootprintInverseNativeDeleteMainSourceOriginal,"beforeInventory"|"flowInput"|"historyBaseline"|"bodyPlan"|"projectUuid"|"branchUuid">;
type Scalar=string|number|null;
export interface CurrentFootprintInverseNativeDeleteMainTailBranch{
 readonly projectUuid:string;readonly branchUuid:string;readonly historyUuid:string;readonly body:string;readonly sha256:string;
 readonly observedLocalOffsetMinutes:number;readonly writerClockAuthority:false;
}
export interface CurrentFootprintInverseNativeDeleteMainTailPreflight{
 readonly schema:"private.current-footprint-inverse-native-delete-main-tail-preflight.v1";
 readonly projectUuid:string;readonly branchUuid:string;readonly initialLogicalSha256:string;
 readonly before:CurrentFootprintSavedFlowCacheInput;readonly initial:CurrentFootprintSavedFlowCacheData;
 readonly headLastId:number;readonly headCount:number;readonly maximumCacheBytes:number;readonly selectedReadonlyQueries:8|9;
 readonly runtimeSegmentCompletenessVerified:false;readonly nativeTailAuthorized:false;
}
const actors=z.strictObject({uuid:z.string().regex(/^[a-f0-9]{32}$/u),username:z.string().max(1024),nickname:z.string().max(1024),updateTime:z.number().int().positive().max(8_640_000_000_000_000)});
const object=z.record(z.string(),z.unknown());
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_MAIN_TAIL_DATA_${code}`);}}
function cell(value:SqlCell|undefined):Scalar{
 need(value!==undefined,"CELL");if(value.kind==="null"){return null;}if(value.kind==="integer"){const n=Number(value.decimal);need(Number.isSafeInteger(n)&&String(n)===value.decimal,"INTEGER");return n;}
 need(value.kind==="text","TEXT");const bytes=Buffer.from(value.hex,"hex"),text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);need(Buffer.from(text).equals(bytes),"utf8");return text;
}
function rows(before:NativeSqlInventory,name:string):readonly Readonly<Record<string,Scalar>>[]{
 const matches=before.tables.filter(table=>table.name===name);need(matches.length===1&&matches[0]!==undefined,"TABLE");const table=matches[0];const names=table.columns.map(col=>{need(typeof col["name"]==="string","COLUMN");return col["name"];});
 return table.rows.map(row=>{need(row.cells.length===names.length,"ROW");return Object.fromEntries(names.map((key,i)=>[key,cell(row.cells[i])]));});
}
function rootBranch(before:NativeSqlInventory,projectUuid:string,branchUuid:string):Readonly<Record<string,Scalar>>{
 const selected=rows(before,"branches").filter(row=>row["uuid"]===branchUuid);const branch=selected[0];need(selected.length===1&&branch!==undefined&&branch["project_uuid"]===projectUuid&&branch["node"]===0&&branch["delete_status"]===0&&branch["name"]!=="start","ROOT_BRANCH");
 return branch;
}
function lineage(before:NativeSqlInventory,branch:Readonly<Record<string,Scalar>>):Readonly<{parentUuid:string|null;parentName:string|null;queries:8|9}>{
 const parentUuid=branch["parent_uuid"];if(parentUuid===null){return{parentUuid:null,parentName:null,queries:8};}
 need(typeof parentUuid==="string"&&parentUuid!==branch["uuid"],"PARENT_UUID");
 const matches=rows(before,"branches").filter(row=>row["uuid"]===parentUuid);const parent=matches[0];
 need(matches.length===1&&parent!==undefined&&parent["node"]===1&&parent["name"]==="start"&&parent["parent_uuid"]===null&&parent["project_uuid"]===branch["project_uuid"],"TERMINAL_START_PARENT");
 return{parentUuid,parentName:"start",queries:9};
}
function generatedDefaults(before:NativeSqlInventory,branchUuid:string):void{
 const name=`project_history_${branchUuid}`;const table=before.tables.find(row=>row.name===name);
 need(table!==undefined&&!before.schema.some(row=>row.type==="trigger"),"UNSUPPORTED_TRIGGER");
 for(const[key,expected]of Object.entries({created_at:"datetime('now')",updated_at:"datetime('now')",lock_time:"datetime('1970-01-01 08:00:00')",is_lock:"0",num:"0",snapshot_num:"0"})){
  const columns=table.columns.filter(row=>row["name"]===key);
  need(columns.length===1&&columns[0]?.["dflt_value"]===expected,"GENERATED_DEFAULT");
 }
}
function apiRows(value:CurrentFootprintInverseMainHistoryBaseline):readonly Readonly<Record<string,unknown>>[]{return value.rows.map(row=>({...row,dataStrUrl:`/api/v4/histories/dataStr?path=${value.projectUuid}&uuid=${row.uuid}`}));}
export const currentFootprintInverseNativeDeleteMainTailApiRows=apiRows;
function changedInput(before:CurrentFootprintSavedFlowCacheInput,native:CurrentFootprintInverseMainHistoryBaseline,plaintext:string):CurrentFootprintSavedFlowCacheInput{
 return captureCurrentFootprintSavedFlowCacheInput({projectUuid:before.projectUuid,branchUuid:before.branchUuid,headHistoryUuid:native.historyUuid,heads:native.rows.map(({iv:_iv,...row})=>row),chunks:[...before.chunks,{historyUuid:native.historyUuid,ordinal:0,plaintext,plaintextSha256:sha256Text(plaintext)}]});
}
function projection(before:CurrentFootprintSavedFlowCacheInput,initial:CurrentFootprintSavedFlowCacheData,native:CurrentFootprintInverseMainHistoryBaseline,plaintext:string):CurrentFootprintSavedFlowCacheData{
 const parsed=deriveCurrentFootprintSavedFlowCacheData(changedInput(before,native,plaintext));
 const next=z.array(object).parse(JSON.parse(parsed.headIndex.body)),old=z.array(object).parse(JSON.parse(initial.headIndex.body));need(next.length===old.length+1,"INDEX_COUNT");
 const first=next[0],raw=apiRows(native);need(first!==undefined,"INDEX_FIRST");
 const index=[first];
 for(const[i,row]of raw.slice(1).entries()){
  const original=old[i];need(original!==undefined&&row["uuid"]===original["uuid"],"INDEX_OLD_ORDER");
  for(const key of["docs","editHead","docIds"]){need(Object.hasOwn(original,key),"INDEX_OLD_FIELDS");}
  index.push({...row,docs:original["docs"],editHead:original["editHead"],docIds:original["docIds"]});
 }
 const body=JSON.stringify(index);need(Buffer.byteLength(body)<=8192,"INDEX_BYTES");
 const total=Buffer.byteLength(body)+parsed.bodies.reduce((sum,row)=>sum+Buffer.byteLength(row.body),0);need(parsed.bodies.length+1<=8&&total<=32_768,"CACHE_TOTAL");
 return freezeDeep({...parsed,headIndex:{url:initial.headIndex.url,body,sha256:sha256Text(body)}});
}
function maximumActor(before:NativeSqlInventory):Readonly<{uuid:string;username:string;nickname:string;updateTime:number}>{
 let best={uuid:"f".repeat(32),username:"",nickname:"",updateTime:8_640_000_000_000_000};
 for(const row of rows(before,"users")){need(typeof row["username"]==="string"&&typeof row["nickname"]==="string","ACTOR_LABELS");const value=actors.parse({...best,username:row["username"],nickname:row["nickname"]});if(Buffer.byteLength(JSON.stringify(value))>Buffer.byteLength(JSON.stringify(best))){best=value;}}
 return best;
}
export function deriveCurrentFootprintInverseNativeDeleteMainTailPreflight(original:Original):CurrentFootprintInverseNativeDeleteMainTailPreflight{
 readerCompletion(original.beforeInventory);const before=captureCurrentFootprintSavedFlowCacheInput(original.flowInput);const baseline=deriveCurrentFootprintInverseNativeDeleteMainBaseline(original.beforeInventory,original.historyBaseline,original.bodyPlan);
 need(before.projectUuid===original.projectUuid&&before.branchUuid===original.branchUuid&&canonicalJson(deriveCurrentFootprintInverseMainHistoryBaseline(before))===canonicalJson(original.historyBaseline),"ORIGINAL_BASELINE");
 const selectedReadonlyQueries=lineage(original.beforeInventory,rootBranch(original.beforeInventory,before.projectUuid,before.branchUuid)).queries;generatedDefaults(original.beforeInventory,before.branchUuid);need(before.heads.length<8,"HEAD_CAPACITY");
 const initial=deriveCurrentFootprintSavedFlowCacheData(before);need(initial.bodies.length+2<=8,"BODY_CAPACITY");const old=before.heads[0];need(old!==undefined,"FIRST_HEAD");
 let candidate="";for(let i=0;i<=before.heads.length;i+=1){const uuid=i.toString(16).padStart(32,"0");if(!before.heads.some(row=>row.uuid===uuid)){candidate=uuid;break;}}need(candidate.length===32,"CAPACITY_UUID");
 const head={id:baseline.headLastId,uuid:candidate,parent:old.uuid,key:"f".repeat(32),is_lock:0,num:0,snapshot_num:0,created_at:"9999-12-31 23:59:59",updated_at:"9999-12-31 23:59:59",lock_time:"1970-01-01 08:00:00",iv:candidate};
 const native=currentFootprintInverseMainHistoryValueSchema.parse({projectUuid:before.projectUuid,branchUuid:before.branchUuid,historyUuid:candidate,rows:[head,...original.historyBaseline.rows]});
 const plaintext=`${JSON.stringify({type:"EDIT_HEAD"})}||${JSON.stringify(maximumActor(original.beforeInventory))}|\n${original.bodyPlan.workerUpload}`;
 const maximum=projection(before,initial,native,plaintext),maximumCacheBytes=Buffer.byteLength(maximum.headIndex.body)+maximum.bodies.reduce((sum,row)=>sum+Buffer.byteLength(row.body),0);
 return freezeDeep({schema:"private.current-footprint-inverse-native-delete-main-tail-preflight.v1",projectUuid:before.projectUuid,branchUuid:before.branchUuid,initialLogicalSha256:original.beforeInventory.logicalSha256,before,initial,headLastId:baseline.headLastId,headCount:before.heads.length,maximumCacheBytes,selectedReadonlyQueries,runtimeSegmentCompletenessVerified:false,nativeTailAuthorized:false});
}
function date(value:unknown):number{need(typeof value==="string"&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(value),"DATE");const epoch=Date.parse(`${value.replace(" ","T")}Z`);need(Number.isFinite(epoch)&&new Date(epoch).toISOString().slice(0,19).replace("T"," ")===value,"DATE_ROUNDTRIP");return epoch;}
export function compareCurrentFootprintInverseNativeDeleteMainTailBranch(original:Original,preflight:CurrentFootprintInverseNativeDeleteMainTailPreflight,effects:CurrentProjectHistorySqlEffects,body:string):CurrentFootprintInverseNativeDeleteMainTailBranch{
 need(body.isWellFormed()&&Buffer.byteLength(body)<=4096,"BRANCH_BYTES");const value=object.parse(JSON.parse(body));need(JSON.stringify(value)===body&&canonicalJson(Object.keys(value))===canonicalJson(BRANCH_FIELDS),"BRANCH_FIELDS");
 const branch=rootBranch(original.beforeInventory,preflight.projectUuid,preflight.branchUuid),projects=rows(original.beforeInventory,"projects"),users=rows(original.beforeInventory,"users");need(projects.length===1&&projects[0]!==undefined,"PROJECT");
 const user=(uuid:Scalar|undefined):Readonly<Record<string,Scalar>>|undefined=>{const selected=users.filter(row=>row["uuid"]===uuid);need(selected.length<=1,"USER");return selected[0];};
 const ancestry=lineage(original.beforeInventory,branch),creator=user(branch["creator_uuid"]),modifier=user(branch["modifier_uuid"]);
 const offset=(date(value["created_at"])-date(branch["created_at"]))/60_000;need(Number.isInteger(offset)&&Math.abs(offset)<=840&&date(value["updated_at"])-date(branch["updated_at"])===offset*60_000,"OBSERVED_OFFSET");
 const expected={uuid:preflight.branchUuid,delete_status:0,name:branch["name"],project_uuid:preflight.projectUuid,branch_uuid:projects[0]["branch_uuid"],history_uuid:effects.historyUuid,description:branch["description"],node:false,created_at:value["created_at"],updated_at:value["updated_at"],parent_uuid:ancestry.parentUuid,parent_name:ancestry.parentName,creator_nickname:creator?.["nickname"]??null,creator_uuid:creator?.["uuid"]??null,modifier_nickname:modifier?.["nickname"]??null,default:preflight.branchUuid===projects[0]["branch_uuid"],project_histories_id:preflight.headLastId};
 need(effects.mode==="append"&&effects.projectUuid===preflight.projectUuid&&effects.branchUuid===preflight.branchUuid&&canonicalJson(value)===canonicalJson(expected),"BRANCH_VALUE");
 return freezeDeep({projectUuid:preflight.projectUuid,branchUuid:preflight.branchUuid,historyUuid:effects.historyUuid,body,sha256:sha256Text(body),observedLocalOffsetMinutes:Object.is(offset,-0)?0:offset,writerClockAuthority:false});
}
export function compareCurrentFootprintInverseNativeDeleteMainTailRows(original:Original,preflight:CurrentFootprintInverseNativeDeleteMainTailPreflight,effects:CurrentProjectHistorySqlEffects,branch:CurrentFootprintInverseNativeDeleteMainTailBranch,input:unknown):CurrentFootprintInverseMainHistoryBaseline{
 const value=currentFootprintInverseMainHistoryValueSchema.parse(input);const head=value.rows[0],old=preflight.before.heads[0];need(head!==undefined&&old!==undefined&&value.rows.length===preflight.headCount+1&&value.projectUuid===preflight.projectUuid&&value.branchUuid===preflight.branchUuid&&value.historyUuid===effects.historyUuid&&value.historyUuid===branch.historyUuid,"ROWS_IDENTITY");
 need(canonicalJson(value.rows.slice(1))===canonicalJson(original.historyBaseline.rows)&&head.id===preflight.headLastId&&head.uuid===effects.historyUuid&&head.iv===head.uuid&&head.parent===old.uuid&&head.key===effects.keyHex&&head.is_lock===0&&head.num===0&&head.snapshot_num===0&&head.lock_time==="1970-01-01 08:00:00","APPEND_ROW");
 const windows=effects.nativeCallbacks.filter(row=>row.slot==="head");const window=windows[0];need(windows.length===1&&window!==undefined&&window.changes===1&&window.lastID===head.id&&window.afterEpochMs>=window.beforeEpochMs,"HEAD_CALLBACK");
 for(const key of["created_at","updated_at"]as const){const epoch=date(head[key]);need(epoch>=Math.floor(window.beforeEpochMs/1000)*1000&&epoch<=Math.floor(window.afterEpochMs/1000)*1000,"HEAD_SQL_TIME");}
 return freezeDeep(value);
}
export function deriveCurrentFootprintInverseNativeDeleteMainTailCache(original:Original,preflight:CurrentFootprintInverseNativeDeleteMainTailPreflight,effects:CurrentProjectHistorySqlEffects,branch:CurrentFootprintInverseNativeDeleteMainTailBranch,raw:unknown):CurrentFootprintSavedFlowCacheData{
 const actor=actors.parse(effects.actor),body=original.bodyPlan.workerUpload,native=compareCurrentFootprintInverseNativeDeleteMainTailRows(original,preflight,effects,branch,raw);
 const plaintext=`${JSON.stringify({type:"EDIT_HEAD"})}||${JSON.stringify(actor)}|\n${body}`;need(effects.bodySha256===sha256Text(body)&&effects.plaintextSha256===sha256Text(plaintext),"ORIGINAL_PLAINTEXT");
 const value=projection(preflight.before,preflight.initial,native,plaintext);need(value.bodies.filter(row=>row.historyUuid===native.historyUuid).length===1,"ONE_BODY");
 const newBody=value.bodies.find(row=>row.historyUuid===native.historyUuid);need(newBody!==undefined&&newBody.body===body&&newBody.url===`https://client/dataStr/${native.historyUuid}-FOOTPRINT`,"EXACT_BODY");
 need(Buffer.byteLength(value.headIndex.body)+value.bodies.reduce((sum,row)=>sum+Buffer.byteLength(row.body),0)<=preflight.maximumCacheBytes,"RESERVED_CAPACITY");return freezeDeep({...value,projectionSourceSha256:sha256Json({parser:value.projectionSourceSha256,retainedOldFields:["docs","editHead","docIds"]})});
}

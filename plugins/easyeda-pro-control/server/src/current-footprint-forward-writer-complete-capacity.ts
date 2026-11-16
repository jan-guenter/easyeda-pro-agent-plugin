/** Complete-only inert capacity, tied to the original unconsumed request
 * reservation and copy inventory. No native owner, callback or writer grant. */
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { SqlCell, SqlTable } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { currentFootprintCopyV2Before, currentFootprintCopyV2Rows } from "./current-footprint-copy-v2-plan.ts";
// oxlint-disable-next-line import/no-cycle -- Late complete capacity resolves the genuine request reservation; module initialization issues no authority, and a caller-writable registry would lose original-owner custody.
import { requireCurrentFootprintForwardWriterMainRequestReservation, requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy } from "./current-footprint-forward-writer-main-request-plan.ts";
import type { CurrentFootprintForwardWriterMainRequestReservation } from "./current-footprint-forward-writer-main-request-plan.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import { deriveCurrentFootprintInverseStartupData } from "./current-footprint-inverse-startup-data.ts";
import { requireCurrentFootprintMutationPublicationData } from "./current-footprint-mutation-publication-data.ts";
import type { CurrentFootprintMutationPublicationData } from "./current-footprint-mutation-publication-data.ts";

export interface CurrentFootprintForwardWriterCompleteCapacity {
 readonly profile:"private.current-footprint-forward-writer-complete-capacity.v1";
 readonly maximumBodySha256:string; readonly copyPlanSha256:string; readonly projectionSha256:string;
 readonly maximumBodyUtf8Bytes:number; readonly maximumPlaintextUtf8Bytes:number;
 readonly maximumHeadIndexUtf8Bytes:number; readonly maximumActorUtf8Bytes:number;
 readonly bodyLineUpperBound:number; readonly rawCopyRows:number; readonly beforeRawRows:number;
 readonly startupCallbackUpperBound:number; readonly callbackRunUpperBound:number; readonly jointCallbackRunUpperBound:number;
 readonly closedSuccessorRawRows:number; readonly jointComponentRecords:number; readonly jointComponentManifestBytes:number;
 readonly jointRendererRequests:number; readonly jointControlRequests:number;
 readonly originalCopyPlanRetained:true; readonly selectedUsersReadonlyContinuityRequired:true;
 readonly suppliedObservationsOnly:true; readonly wholeWriterReserved:false; readonly nativeAllocationQualified:false;
 readonly executionAuthorized:false; readonly saveAuthorized:false;
}
type Reservation=CurrentFootprintForwardWriterMainRequestReservation;
type Maximum=ReturnType<typeof requireCurrentFootprintForwardWriterMainRequestReservation>;
type Copy=ReturnType<typeof requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy>;
interface Original { readonly reservation:Reservation; readonly copy:Copy; readonly maximum:Maximum; readonly input:unknown; readonly flow:unknown; readonly inputCanonical:string; readonly flowCanonical:string; readonly publication:CurrentFootprintMutationPublicationData }
const originals=new WeakMap<object,Original>();
function need(value:boolean):asserts value{if(!value){throw new Error("FORWARD_WRITER_COMPLETE_CAPACITY")}}
function columns(table:SqlTable):readonly string[]{const names=table.columns.map(column=>{need(typeof column["name"]==="string");return column["name"]});need(new Set(names).size===names.length);return names;}
function text(cell:SqlCell|undefined):string{need(cell!==undefined&&cell.kind==="text");const bytes=Buffer.from(cell.hex,"hex");const value=bytes.toString("utf8");need(Buffer.from(value).equals(bytes)&&value.isWellFormed());return value;}
function integer(cell:SqlCell|undefined):number{need(cell!==undefined&&cell.kind==="integer");const value=Number(cell.decimal);need(Number.isSafeInteger(value)&&String(value)===cell.decimal);return value;}
/** The Main L3 actor can select any current user row or the empty fallback.
 * Original selected-file SELECT-only custody must preserve this whole table
 * until sole Create; this local maximum is not proof that custody exists. */
function maximumActor(table:SqlTable):Readonly<{uuid:string;username:string;nickname:string;updateTime:number}>{
 const names=columns(table);const username=names.indexOf("username");const nickname=names.indexOf("nickname");need(username!==-1&&nickname!==-1);
 let result:ReturnType<typeof maximumActor>=Object.freeze({uuid:"f".repeat(32),username:"",nickname:"",updateTime:8_640_000_000_000_000});let bytes=Buffer.byteLength(JSON.stringify(result));
 for(const row of table.rows){need(row.cells.length===names.length);const user=text(row.cells[username]);const nick=text(row.cells[nickname]);need(user.length<=1024&&nick.length<=1024);const candidate=Object.freeze({...result,username:user,nickname:nick});const size=Buffer.byteLength(JSON.stringify(candidate));if(size>bytes){result=candidate;bytes=size;}}
 return result;
}
function freshPlaceholder(occupied:readonly string[]):string{for(const character of ["f","e","d","c","b","a","9","8"]){const candidate=character.repeat(32);if(!occupied.includes(candidate)){return candidate}}throw new Error("FORWARD_WRITER_COMPLETE_CAPACITY_PLACEHOLDER");}
export function deriveCurrentFootprintForwardWriterCompleteCapacity(reservation:Reservation,rawInput:unknown,rawFlow:unknown,publication:CurrentFootprintMutationPublicationData):CurrentFootprintForwardWriterCompleteCapacity{
 const copy=requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy(reservation);const maximum=requireCurrentFootprintForwardWriterMainRequestReservation(reservation);const before=currentFootprintCopyV2Before(copy);readerCompletion(before);requireCurrentFootprintMutationPublicationData(publication);
 const input=captureCurrentFootprintSavedFlowCacheInput(rawInput);const flow=deriveCurrentFootprintSavedFlowCacheData(input);need(canonicalJson(flow)===canonicalJson(captureCurrentPcbStringClockReply(rawFlow).value));
 need(input.projectUuid===copy.source.projectUuid&&input.branchUuid===copy.source.branchUuid&&input.heads.length===1&&publication.inputStrings===2&&publication.headCalls===2&&publication.joinedBodySha256===sha256Text(maximum.dataStr)&&publication.joinedBodyUtf8Bytes===Buffer.byteLength(maximum.dataStr));
 const bodyLineUpperBound=publication.lineCalls;const rawCopyRows=publication.trace.length;const beforeRawRows=input.chunks.reduce((sum,chunk)=>sum+chunk.plaintext.split("|\n").filter(row=>row.length>0).length,0);
 need(Buffer.byteLength(maximum.dataStr)<=8192&&maximum.dataStr.length<10_000&&bodyLineUpperBound>=1&&bodyLineUpperBound<=240&&rawCopyRows===bodyLineUpperBound+2&&beforeRawRows+rawCopyRows+1<=512);
 const startup=deriveCurrentFootprintInverseStartupData(input);const callbackRunUpperBound=2*bodyLineUpperBound;const jointCallbackRunUpperBound=startup.sourceRecordUpperBound+callbackRunUpperBound;need(jointCallbackRunUpperBound<=752);
 const tables=new Map(before.tables.map(table=>[table.name,table]));need(tables.size===before.tables.length);const users=tables.get("users");need(users!==undefined);const actor=maximumActor(users);const head=input.heads[0];need(head!==undefined&&head.id<Number.MAX_SAFE_INTEGER);
 const sequence=tables.get("sqlite_sequence");if(sequence!==undefined){const names=columns(sequence);const name=names.indexOf("name");const seq=names.indexOf("seq");need(name!==-1&&seq!==-1);let matches=0;for(const row of sequence.rows){need(row.cells.length===names.length);if(text(row.cells[name])===`project_history_${input.branchUuid}`){matches+=1;const value=integer(row.cells[seq]);need(value>=head.id&&value<Number.MAX_SAFE_INTEGER)}}need(matches<=1);}
 const historyUuid=freshPlaceholder(input.heads.map(row=>row.uuid));const key=freshPlaceholder(input.heads.map(row=>row.key));
 const plaintext=`${JSON.stringify({type:"EDIT_HEAD"})}||${JSON.stringify(actor)}|\n${maximum.dataStr}`;
 const candidate=captureCurrentFootprintSavedFlowCacheInput({projectUuid:input.projectUuid,branchUuid:input.branchUuid,headHistoryUuid:historyUuid,heads:[{id:Number.MAX_SAFE_INTEGER,uuid:historyUuid,parent:head.uuid,key,is_lock:0,num:0,snapshot_num:0,created_at:"9999-12-31 23:59:59",updated_at:"9999-12-31 23:59:59",lock_time:"9999-12-31 23:59:59"},...input.heads],chunks:[...input.chunks,{historyUuid,ordinal:0,plaintext,plaintextSha256:sha256Text(plaintext)}]});
 const projected=deriveCurrentFootprintSavedFlowCacheData(candidate);const maximumHeadIndexUtf8Bytes=Buffer.byteLength(projected.headIndex.body);need(maximumHeadIndexUtf8Bytes<=8192);
 const jointComponentRecords=6*jointCallbackRunUpperBound+24;const jointComponentManifestBytes=jointComponentRecords*(4096+8192+512)+2*65_536;need(jointComponentManifestBytes<64*1024*1024);
 const result:CurrentFootprintForwardWriterCompleteCapacity=freezeDeep({profile:"private.current-footprint-forward-writer-complete-capacity.v1",maximumBodySha256:sha256Text(maximum.dataStr),copyPlanSha256:sha256Json(copy),projectionSha256:publication.projectionSourceSha256,maximumBodyUtf8Bytes:Buffer.byteLength(maximum.dataStr),maximumPlaintextUtf8Bytes:Buffer.byteLength(plaintext),maximumHeadIndexUtf8Bytes,maximumActorUtf8Bytes:Buffer.byteLength(JSON.stringify(actor)),bodyLineUpperBound,rawCopyRows,beforeRawRows,startupCallbackUpperBound:startup.sourceRecordUpperBound,callbackRunUpperBound,jointCallbackRunUpperBound,closedSuccessorRawRows:beforeRawRows+rawCopyRows+1,jointComponentRecords,jointComponentManifestBytes,jointRendererRequests:21*jointCallbackRunUpperBound+38,jointControlRequests:3*jointCallbackRunUpperBound+10,originalCopyPlanRetained:true,selectedUsersReadonlyContinuityRequired:true,suppliedObservationsOnly:true,wholeWriterReserved:false,nativeAllocationQualified:false,executionAuthorized:false,saveAuthorized:false});
 originals.set(result,Object.freeze({reservation,copy,maximum,input:rawInput,flow:rawFlow,inputCanonical:canonicalJson(input),flowCanonical:canonicalJson(flow),publication}));return result;
}
/** Retained data identity only. The separate native complete factory must
 * join its original SQL fence, body plan and graph before any writer dispatch. */
export function requireOriginalCurrentFootprintForwardWriterCompleteCapacity(packet:CurrentFootprintForwardWriterCompleteCapacity,reservation:Reservation,input:unknown,flow:unknown,publication:CurrentFootprintMutationPublicationData):CurrentFootprintForwardWriterCompleteCapacity{
 const original=originals.get(packet);need(original!==undefined&&original.reservation===reservation&&original.input===input&&original.flow===flow&&original.publication===publication);need(canonicalJson(captureCurrentFootprintSavedFlowCacheInput(input))===original.inputCanonical&&canonicalJson(captureCurrentPcbStringClockReply(flow).value)===original.flowCanonical);currentFootprintCopyV2Rows(original.copy);requireCurrentFootprintMutationPublicationData(publication);readerCompletion(currentFootprintCopyV2Before(original.copy));return packet;
}
/** Strict original pre-Create reservation, unlike retained post-copy data. */
export function requirePrecreateCurrentFootprintForwardWriterCompleteCapacity(packet:CurrentFootprintForwardWriterCompleteCapacity,reservation:Reservation,input:unknown,flow:unknown,publication:CurrentFootprintMutationPublicationData):void{
 requireOriginalCurrentFootprintForwardWriterCompleteCapacity(packet,reservation,input,flow,publication);const original=originals.get(packet);need(original!==undefined&&requireCurrentFootprintForwardWriterMainRequestReservation(reservation)===original.maximum&&requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy(reservation)===original.copy);
}

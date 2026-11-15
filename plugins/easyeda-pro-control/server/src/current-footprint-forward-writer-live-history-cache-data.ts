/** Complete inert append-cache projection for one observed full footprint
 * copy. The genuine Main/worker issuers remain separate from this data model. */
import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import type { CurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import { currentFootprintInverseMainHistoryValueSchema } from "./current-footprint-inverse-main-history-baseline.ts";
import type { CurrentFootprintForwardWriterBranchData } from "./current-footprint-forward-writer-branch-data.ts";
import { compareCurrentFootprintForwardWriterPostBranchData } from "./current-footprint-forward-writer-post-branch-data.ts";
import type { CurrentPcbViaLiveHistoryCacheData } from "./current-pcb-via-live-history-cache-data.ts";

export interface CurrentFootprintForwardWriterLiveHistoryCacheData extends CurrentPcbViaLiveHistoryCacheData { readonly schema: "private.current-footprint-forward-writer-live-history-cache-data.v1"; readonly mode: "append"; readonly historyNum: 0 }
const actorSchema=z.strictObject({uuid:z.string().regex(/^[a-f\d]{32}$/u),username:z.string().max(1024),nickname:z.string().max(1024),updateTime:z.number().int().positive().max(8_640_000_000_000_000)});
function need(value:boolean):asserts value{if(!value){throw new Error("FORWARD_WRITER_LIVE_HISTORY_CACHE_DATA")}}
function object(text:string):Record<string,unknown>{const raw:unknown=JSON.parse(text);return z.record(z.string(),z.unknown()).parse(captureCurrentPcbStringClockReply(raw).value)}
/** Real captured native rows still need their own original DB receipt. This
 * structural comparator cannot promote a supplied row into that receipt. */
export function compareCurrentFootprintForwardWriterChangedHistory(input:unknown,post:CurrentFootprintForwardWriterBranchData,raw:unknown):ReturnType<typeof currentFootprintInverseMainHistoryValueSchema.parse>{
 const before=captureCurrentFootprintSavedFlowCacheInput(input); const value=currentFootprintInverseMainHistoryValueSchema.parse(captureCurrentPcbStringClockReply(raw).value); const branch=object(post.body);
 need(before.heads.length===1&&value.projectUuid===before.projectUuid&&value.branchUuid===before.branchUuid&&post.projectUuid===before.projectUuid&&post.branchUuid===before.branchUuid&&sha256Text(post.body)===post.sha256&&value.historyUuid===post.historyUuid&&value.rows.length===2);
 const head=value.rows[0],old=value.rows[1],original=before.heads[0];need(head!==undefined&&old!==undefined&&original!==undefined);
 need(canonicalJson(old)===canonicalJson({...original,iv:original.uuid})&&head.uuid===post.historyUuid&&head.uuid!==old.uuid&&head.iv===head.uuid&&head.id===branch["project_histories_id"]&&branch["history_uuid"]===head.uuid&&head.id>old.id&&head.parent===old.uuid&&head.key!==old.key&&head.is_lock===0&&head.num===0&&head.snapshot_num===0);
 for(const field of ["created_at","updated_at","lock_time"] as const){const text=head[field];need(typeof text==="string"&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(text));const epoch=Date.parse(`${text.replace(" ","T")}Z`);need(Number.isFinite(epoch)&&new Date(epoch).toISOString().slice(0,19).replace("T"," ")===text);}
 return freezeDeep(value);
}
export function currentFootprintForwardWriterCopyDocumentUuid(body:string):string{
 need(body.isWellFormed()&&Buffer.byteLength(body)<=8192&&body.length<10_000);
 const records=body.split("|\n");const heads=records.filter(line=>line.startsWith('{"type":"DOCHEAD"')).map(line=>{const divider=line.indexOf("||");need(divider>0);return object(line.slice(divider+2))});
 const documentUuid=heads[0]?.["uuid"];need(heads.length===2&&typeof documentUuid==="string"&&/^[a-f\d]{16}$/u.test(documentUuid)&&heads.every(head=>head["uuid"]===documentUuid&&head["docType"]==="FOOTPRINT"));
 return documentUuid;
}
/** Execute the already pinned parser on exact old plaintext and new actor/body.
 * Preserve ag's old docs/editHead/docIds insertion order separately. */
export function deriveCurrentFootprintForwardWriterLiveHistoryCacheData(input:Readonly<{initialInput:unknown;initialFlow:CurrentFootprintSavedFlowCacheData;beforeBranch:CurrentFootprintForwardWriterBranchData;postBranch:CurrentFootprintForwardWriterBranchData;actor:unknown;body:string;nativeRows:unknown}>):CurrentFootprintForwardWriterLiveHistoryCacheData{
 const before=captureCurrentFootprintSavedFlowCacheInput(input.initialInput); const actor=actorSchema.parse(captureCurrentPcbStringClockReply(input.actor).value); const native=compareCurrentFootprintForwardWriterChangedHistory(before,input.postBranch,input.nativeRows); const initial=deriveCurrentFootprintSavedFlowCacheData(before);
 need(canonicalJson(initial)===canonicalJson(input.initialFlow)&&input.beforeBranch.historyUuid===before.headHistoryUuid&&input.body.isWellFormed()&&Buffer.byteLength(input.body)<=8192&&input.body.length<10_000);
 const validatedBranch=compareCurrentFootprintForwardWriterPostBranchData(input.beforeBranch,native.historyUuid,input.postBranch.body);
 const documentUuid=currentFootprintForwardWriterCopyDocumentUuid(input.body);
 const plaintext=`${JSON.stringify({type:"EDIT_HEAD"})}||${JSON.stringify(actor)}|\n${input.body}`;
 const changedInput=captureCurrentFootprintSavedFlowCacheInput({projectUuid:before.projectUuid,branchUuid:before.branchUuid,headHistoryUuid:native.historyUuid,heads:native.rows.map(({iv: _iv,...row})=>row),chunks:[...before.chunks,{historyUuid:native.historyUuid,ordinal:0,plaintext,plaintextSha256:sha256Text(plaintext)}]});
 const projected=deriveCurrentFootprintSavedFlowCacheData(changedInput); const parsed:unknown=JSON.parse(projected.headIndex.body); const index=z.array(z.record(z.string(),z.unknown())).length(2).parse(captureCurrentPcbStringClockReply(parsed).value);
 const previousRaw:unknown=JSON.parse(initial.headIndex.body); const previous=z.array(z.record(z.string(),z.unknown())).length(1).parse(captureCurrentPcbStringClockReply(previousRaw).value)[0];need(previous!==undefined);
 const historyApiRows=native.rows.map(row=>({...row,dataStrUrl:`/api/v4/histories/dataStr?path=${before.projectUuid}&uuid=${row.uuid}`}));
 const current=index[0],older=historyApiRows[1];need(current!==undefined&&older!==undefined&&current["uuid"]===native.historyUuid&&previous["uuid"]===before.headHistoryUuid);
 const oldIndex={...older,docs:previous["docs"],editHead:previous["editHead"],docIds:previous["docIds"]};need(oldIndex.docs!==undefined&&oldIndex.editHead!==undefined&&oldIndex.docIds!==undefined);
 const indexBody=JSON.stringify([current,oldIndex]);need(Buffer.byteLength(indexBody)<=8192);
 const bodies=projected.bodies.filter(row=>row.historyUuid===native.historyUuid);need(bodies.length===1);const body=bodies[0];need(body!==undefined&&body.url===`https://client/dataStr/${native.historyUuid}-FOOTPRINT`&&body.body===input.body);
 return freezeDeep({schema:"private.current-footprint-forward-writer-live-history-cache-data.v1",projectUuid:before.projectUuid,branchUuid:before.branchUuid,documentUuid,historyUuid:native.historyUuid,chunkUuid:native.historyUuid,namespace:initial.namespace,historyNum:0,mode:"append",historyApiRows,documents:[{documentUuid,url:body.url,body:body.body,sha256:body.sha256}],headIndex:{url:initial.headIndex.url,body:indexBody,sha256:sha256Text(indexBody)},branch:{body:input.postBranch.body,sha256:input.postBranch.sha256,importLocalOffsetMinutes:validatedBranch.observedLocalOffsetMinutes,nativeCurrentTimezoneVerified:false,writerClockAuthority:false},historyBodySha256:sha256Text(input.body),projectionSourceSha256:sha256Json({flow:projected.projectionSourceSha256,oldCopiedFields:["docs","editHead","docIds"]}),nativeWorkerOwnershipVerified:false,cacheContinuationAuthorized:false,completeUploadFrontierVerified:false});
}

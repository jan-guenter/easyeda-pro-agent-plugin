/** Complete mixed saved-branch data for the separate inverse cold ingress.
 * These observations carry no native owner, callback or continuation grant. */
import { createHash } from "node:crypto";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentFootprintSavedFlowCacheInput } from "./current-footprint-saved-flow-cache-data.ts";
import type { CurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell } from "./sqlite-inventory-core.ts";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentFootprintInverseColdLoadData {
  readonly schema:"private.current-footprint-inverse-cold-load-data.v1";
  readonly projectUuid:string; readonly branchUuid:string; readonly headHistoryUuid:string;
  readonly sourceSha256:string; readonly logicalSha256:string; readonly completeDecodedChunksSha256:string;
  readonly histories:readonly Readonly<Record<string,string|number|null>>[];
  readonly parsedHistories:readonly Readonly<Record<string,unknown>>[];
  readonly chunks:readonly Readonly<{historyUuid:string;ordinal:number;dataUuid:string;fetchUrl:string;dataBase64:string;cipherSha256:string;plaintext:string;plaintextSha256:string}>[];
  readonly suppliedObservationsOnly:true;readonly nativeLoadingVerified:false;readonly cachePublicationCompleted:false;readonly bootstrapResumeAuthorized:false;
}
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_COLD_DATA");}}
function scalar(cell:SqlCell|undefined):string|number|null{
  need(cell!==undefined);if(cell.kind==="null"){return null;}if(cell.kind==="integer"){const n=Number(cell.decimal);need(Number.isSafeInteger(n)&&String(n)===cell.decimal);return n;}
  need(cell.kind==="text");const bytes=Buffer.from(cell.hex,"hex"),text=bytes.toString("utf8");need(Buffer.from(text).equals(bytes));return text;
}
/** The enclosing private startup issuer supplies its exact original finished
 * inventory and immutable input. Direct calls issue data only. */
export function deriveCurrentFootprintInverseColdLoadData(input:unknown,cache:CurrentFootprintSavedFlowCacheData,inventory:NativeSqlInventory):CurrentFootprintInverseColdLoadData{
  const completion=readerCompletion(inventory),source=captureCurrentFootprintSavedFlowCacheInput(input);
  need(cache.projectUuid===source.projectUuid&&cache.branchUuid===source.branchUuid&&cache.headHistoryUuid===source.headHistoryUuid);
  const matching=inventory.tables.filter(table=>table.name==="history_data");need(matching.length===1&&matching[0]!==undefined);const table=matching[0];
  const names=table.columns.map(column=>{need(typeof column["name"]==="string");return column["name"];});need(new Set(names).size===names.length);
  const rows=table.rows.map(row=>{need(row.cells.length===names.length);return Object.fromEntries(names.map((name,index)=>[name,scalar(row.cells[index]) ]));});
  const seen=new Set<string>();let total=0;
  const chunks=source.chunks.map(chunk=>{
    const dataUuid=`${chunk.historyUuid}${chunk.ordinal===0?"":`-${String(chunk.ordinal)}`}`,matches=rows.filter(row=>row["uuid"]===dataUuid);need(!seen.has(dataUuid)&&matches.length===1&&matches[0]!==undefined);seen.add(dataUuid);
    const row=matches[0];const dataBase64=row["dataStr"];need(row["history_uuid"]===chunk.historyUuid&&typeof dataBase64==="string");const bytes=Buffer.from(dataBase64,"base64");
    need(bytes.toString("base64")===dataBase64&&bytes.length>0&&bytes.length<=8192&&sha256Text(chunk.plaintext)===chunk.plaintextSha256);total+=bytes.length;need(total<=32_768);
    return Object.freeze({...chunk,dataUuid,fetchUrl:`/api/v4/histories/dataStr?path=${source.projectUuid}&uuid=${dataUuid}`,dataBase64,cipherSha256:createHash("sha256").update(bytes).digest("hex")});
  });
  const histories=source.heads.map(row=>Object.freeze({...row,iv:row.uuid,dataStrUrl:`/api/v4/histories/dataStr?path=${source.projectUuid}&uuid=${row.uuid}`}));
  const raw:unknown=JSON.parse(cache.headIndex.body);need(Array.isArray(raw)&&raw.length===histories.length);
  const parsedHistories=z.array(z.record(z.string(),z.unknown())).parse(raw).map((fields,index)=>{const expected=histories[index];need(expected!==undefined);
    const keys=Object.keys(fields);const base=Object.fromEntries(Object.keys(expected).map(key=>[key,fields[key]]));need(keys.every(key=>Object.hasOwn(expected,key)||["editHead","docs","docIds"].includes(key))&&canonicalJson(base)===canonicalJson(expected));return fields;});
  need(readerCompletion(inventory)===completion);
  return freezeDeep({schema:"private.current-footprint-inverse-cold-load-data.v1",projectUuid:source.projectUuid,branchUuid:source.branchUuid,headHistoryUuid:source.headHistoryUuid,
    sourceSha256:inventory.checkpointSha256,logicalSha256:inventory.logicalSha256,completeDecodedChunksSha256:sha256Text(JSON.stringify(source.chunks)),histories,parsedHistories,chunks,
    suppliedObservationsOnly:true,nativeLoadingVerified:false,cachePublicationCompleted:false,bootstrapResumeAuthorized:false});
}

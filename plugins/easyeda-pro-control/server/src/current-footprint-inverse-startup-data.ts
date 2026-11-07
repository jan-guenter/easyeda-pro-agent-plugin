/** Fixed source parser over supplied immutable plaintext only. The exact raw
 * row count bounds potential onChange calls before native ID filtering. */
import { Script } from "node:vm";
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "./current-generated-initial-cache-source.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_STARTUP_DATA_LIMITS=Object.freeze({chunks:8,records:512,documents:32});
const PROGRAM=`(()=>{'use strict';const input=JSON.parse(payload),console={error(){throw new Error('FOOTPRINT_STARTUP_PARSE');}};
${SOURCE.Gu.source};${SOURCE.Ro.source};let ${SOURCE.groupTypes.source};${SOURCE.Na.source};
let records=0,headers=0,nonFootprintRows=0;const documents=new Map(),manager={throwError:true,onEditHead(){},onDocHead(doc){if(typeof doc.docType!=='string'||!doc.docType||doc.docType.length>64||typeof doc.uuid!=='string'||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(doc.uuid))throw new Error('FOOTPRINT_STARTUP_HEADER');headers++;if(headers>512)throw new Error('FOOTPRINT_STARTUP_HEADER_BOUND');let row=documents.get(doc.uuid);if(!row){row=new Map();documents.set(doc.uuid,row);}if(!row.has(doc.docType))row.set(doc.docType,0);if(documents.size>32)throw new Error('FOOTPRINT_STARTUP_DOCUMENT_BOUND');},onLine(id,ticket,body,type,client,docType,docUuid){const families=documents.get(docUuid);if(!families||!families.has(docType)||typeof id!=='string'||!id||id.length>128||!Number.isSafeInteger(ticket)||ticket<0||typeof type!=='string'||!type)throw new Error('FOOTPRINT_STARTUP_ROW');if(++records>512)throw new Error('FOOTPRINT_STARTUP_RECORD_BOUND');families.set(docType,families.get(docType)+1);if(docType!=='FOOTPRINT')nonFootprintRows++;},onEnd(){},${SOURCE.flowParseFull.source}};
for(const chunk of input.chunks){const parser=manager.flowParseFull();parser.start();parser.update(chunk.plaintext);parser.end();}
return JSON.stringify({records,headers,nonFootprintRows,documents:[...documents].map(([uuid,families])=>({uuid,families:[...families].map(([docType,rawRows])=>({docType,rawRows}))}))});})()`;
const parser=new Script(PROGRAM,{filename:"current-footprint-inverse-startup-data.js"});
export const CURRENT_FOOTPRINT_INVERSE_STARTUP_PROJECTION_SHA256=sha256Text(PROGRAM);
const family=z.strictObject({docType:z.string().min(1).max(64),rawRows:z.number().int().min(0).max(512)});
const families=z.array(family).min(1).max(32),uuid=z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u);
const document=z.strictObject({uuid,families});
const output=z.strictObject({records:z.number().int().min(1).max(512),headers:z.number().int().min(1).max(512),nonFootprintRows:z.number().int().min(0).max(512),documents:z.array(document).min(1).max(32)});
export interface CurrentFootprintInverseStartupData {
  readonly schema:"private.current-footprint-inverse-startup-data.v1";readonly projectUuid:string;readonly branchUuid:string;readonly headHistoryUuid:string;
  readonly completeDecodedChunksSha256:string;readonly projectionSourceSha256:string;readonly chunkCount:number;readonly sourceRecordUpperBound:number;readonly rawDocumentHeaders:number;readonly documentUuids:readonly string[];readonly documentFamilies:readonly Readonly<{uuid:string;families:readonly Readonly<{docType:string;rawRows:number}>[]}>[];readonly nonFootprintRawRows:number;readonly nonFootprintDocumentUuids:readonly string[];
  readonly allDocumentTypesFootprint:boolean;readonly suppliedObservationsOnly:true;readonly originalNativeCallbackQualified:false;readonly originalQueuedPromisesCompleted:false;readonly bootstrapResumeAuthorized:false;
}
export function deriveCurrentFootprintInverseStartupData(input:unknown):CurrentFootprintInverseStartupData {
  const source=captureCurrentFootprintSavedFlowCacheInput(input);deriveCurrentFootprintSavedFlowCacheData(source);let raw:unknown;
  try{raw=parser.runInNewContext(Object.freeze({payload:JSON.stringify(source)}),{timeout:1000,microtaskMode:"afterEvaluate",contextCodeGeneration:{strings:false,wasm:false}}) as unknown;}catch{throw new Error("FOOTPRINT_INVERSE_STARTUP_SOURCE_DOMAIN");}
  if(typeof raw!=="string"){throw new TypeError("FOOTPRINT_INVERSE_STARTUP_SOURCE_DOMAIN");}const parsed:unknown=JSON.parse(raw);const actual=output.parse(captureCurrentPcbStringClockReply(parsed).value);
  if(new Set(actual.documents.map(row=>row.uuid)).size!==actual.documents.length||actual.documents.some(row=>new Set(row.families.map(value=>value.docType)).size!==row.families.length)||actual.documents.reduce((sum,row)=>sum+row.families.reduce((count,value)=>count+value.rawRows,0),0)!==actual.records||actual.documents.reduce((sum,row)=>sum+row.families.filter(value=>value.docType!=="FOOTPRINT").reduce((count,value)=>count+value.rawRows,0),0)!==actual.nonFootprintRows){throw new Error("FOOTPRINT_INVERSE_STARTUP_SOURCE_DOMAIN");}
  const nonFootprint=actual.documents.filter(row=>row.families.some(value=>value.docType!=="FOOTPRINT")).map(row=>row.uuid);
  return freezeDeep({schema:"private.current-footprint-inverse-startup-data.v1",projectUuid:source.projectUuid,branchUuid:source.branchUuid,headHistoryUuid:source.headHistoryUuid,
    completeDecodedChunksSha256:sha256Text(JSON.stringify(source.chunks)),projectionSourceSha256:CURRENT_FOOTPRINT_INVERSE_STARTUP_PROJECTION_SHA256,chunkCount:source.chunks.length,
    sourceRecordUpperBound:actual.records,rawDocumentHeaders:actual.headers,documentUuids:actual.documents.map(row=>row.uuid),documentFamilies:actual.documents,nonFootprintRawRows:actual.nonFootprintRows,nonFootprintDocumentUuids:nonFootprint,allDocumentTypesFootprint:nonFootprint.length===0,suppliedObservationsOnly:true,originalNativeCallbackQualified:false,originalQueuedPromisesCompleted:false,bootstrapResumeAuthorized:false});
}

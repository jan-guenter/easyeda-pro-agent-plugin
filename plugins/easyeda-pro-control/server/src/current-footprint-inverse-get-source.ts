/** The actual worker metadata GET path. Source/method metadata alone issues
 * no runtime request, rearm, native delivery, deletion or clock permission. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { qualifyCurrentFootprintInverseClockWorkerSource } from "./current-footprint-inverse-clock-worker-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_SOURCE as ROW } from "./current-footprint-inverse-public-row-source.ts";
import { qualifyCurrentFootprintSourceFunctionMetadata } from "./current-footprint-source-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_GET_TOPIC="/mgr/projectWorker/footprint/get";
export const CURRENT_FOOTPRINT_INVERSE_GET_FUNCTIONS=freezeDeep({
 handler:{key:"handler",name:"",kind:"arrow",async:false,strict:false,arity:1,parent:null,start:2_152_118,end:2_152_159,bytes:41,sha256:"7a01fc9ab8e18b9f7cf1225c4b6a3b3bfc0c508a55b6c2ac8ff0ddff8156697e",lineNumber:110,columnNumber:137_908,source:"t=>e.footprint.getNeedData(t.uuid,t.need)"},
 getNeedData:{key:"getNeedData",name:"getNeedData",kind:"method",async:true,strict:true,arity:2,parent:null,start:1_881_816,end:1_881_977,bytes:161,sha256:"cbb4781dc5a81df92b5ed06d8ed41b959f5ff084852ac9581371be2e849f2a27",lineNumber:109,columnNumber:34_520,source:"async getNeedData(s,r){let i=this.getData(s);if(!i.success)return i;if(r){let n=(await this.getCanvasData(s)).result;Object.assign(i.result,{canvas:n})}return i}"},
 getData:{...ROW.dataGet,key:"getData",name:"getData",kind:"method",async:false,strict:true,arity:1,parent:null,lineNumber:109,columnNumber:34_359},
 get:{...ROW.rowGet,key:"get",name:"get",kind:"method",async:false,strict:true,arity:1,parent:null,lineNumber:109,columnNumber:33_452},
 normalizeTitle:{...ROW.normalizeTitle,key:"normalizeTitle",name:"Ne",kind:"function",async:false,strict:false,arity:1,parent:null,lineNumber:108,columnNumber:143_596},
}as const);
export type CurrentFootprintInverseGetFunction=keyof typeof CURRENT_FOOTPRINT_INVERSE_GET_FUNCTIONS;
const topic={start:1_663_247,end:1_663_281,bytes:34,sha256:"80ac3de448720294f6a3ecfd32017ea3ea8648e8f63b6900277d1603f151f9ef"}as const;
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_GET_SOURCE");}}
export function qualifyCurrentFootprintInverseGetSource(input:unknown):string{const source=qualifyCurrentFootprintInverseClockWorkerSource(input);for(const row of[topic,...Object.values(CURRENT_FOOTPRINT_INVERSE_GET_FUNCTIONS)]){const text=source.slice(row.start,row.end);need(Buffer.byteLength(text)===row.bytes&&createHash("sha256").update(text).digest("hex")===row.sha256);}return source;}
export function currentFootprintInverseGetCallable(input:unknown,role:CurrentFootprintInverseGetFunction):string{const row=CURRENT_FOOTPRINT_INVERSE_GET_FUNCTIONS[role];const value=z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.literal(row.async?"AsyncFunction":"Function"),description:z.string().max(2048),objectId:z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u)})}).parse(capture(input)).result;need(value.description===row.source&&Buffer.byteLength(value.description)===row.bytes);return value.objectId;}
export function qualifyCurrentFootprintInverseGetFunction(input:unknown,role:CurrentFootprintInverseGetFunction,scriptId:string,fullSource:string):string{qualifyCurrentFootprintInverseGetSource(fullSource);return qualifyCurrentFootprintSourceFunctionMetadata(input,CURRENT_FOOTPRINT_INVERSE_GET_FUNCTIONS[role],scriptId);}

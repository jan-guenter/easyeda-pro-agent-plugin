/** Original uploadLocal lexical helpers, distinct from the compression library's other Qe. */
import { createHash } from "node:crypto";
import { qualifyCurrentProjectSaveProducerSource } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_LOCAL_KEY_CALLEES=freezeDeep([
{name:"Qe",arity:0,async:false,regular:true,lineNumber:4,columnNumber:1915,start:241_316,end:241_441,bytes:125,sha256:"bd26e2e718003585daa64a23a098dabdee5d73bdf0cb0a05b8d9e8b8ffdf4017"},
{name:"cg",arity:1,async:false,regular:true,lineNumber:109,columnNumber:1853,start:1_849_155,end:1_849_303,bytes:148,sha256:"309b1a971cfb75b19acb84450acad146788f253e5844ca0d3bbdecc88ee8ee3f"},
]);
export function qualifyCurrentPcbViaLocalKeySource(source:string):void{qualifyCurrentProjectSaveProducerSource(source);if(source.slice(241_293,241_316)!=="},ry=new Uint8Array(8);"){throw new Error("VIA_LOCAL_KEY_BUFFER_SOURCE");}for(const pin of CURRENT_PCB_VIA_LOCAL_KEY_CALLEES){const text=source.slice(pin.start,pin.end);if(Buffer.byteLength(text)!==pin.bytes||createHash("sha256").update(text).digest("hex")!==pin.sha256){throw new Error("VIA_LOCAL_KEY_HELPER_SOURCE");}}}

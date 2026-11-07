/** Complete successful metadata-GET tail plus failure stops. Source locations
 * issue no resume or completion; the original cursor must join each receipt. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintInverseGetSource } from "./current-footprint-inverse-get-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_GET_CALLBACKS=freezeDeep({
 success:{source:"o=>{this.publish(n,{success:!0,result:o})}",start:8464,end:8506,sha256:"df1f3bfe070ae83dd8be6ce33ed9ba8bd825cf30668282f9e113266b9207baca",lineNumber:0,columnNumber:8464,arity:1},
 failure:{source:"o=>{console.error(o),this.publish(n,{success:!1,err:String(o)})}",start:8514,end:8578,sha256:"543db97cc6effa439953ac0e4a3c7d612fdba69546ceb6ba01f20c6fe130952e",lineNumber:0,columnNumber:8514,arity:1},
 local:{source:"()=>{this.onMessage(e)}",start:12_692,end:12_715,sha256:"966efdb4584faac7f762d1c028df318cddaf74bdde0a648bc1c2af6c18cc941b",lineNumber:0,columnNumber:12_692,arity:0},
}as const);
const site=(role:string,columnNumber:number,functionName:string,functionColumn:number,expression:string):Readonly<{role:string;lineNumber:0;columnNumber:number;functionName:string;functionLine:0;functionColumn:number;expression:string}>=>Object.freeze({role,lineNumber:0,columnNumber,functionName,functionLine:0,functionColumn,expression});
export const CURRENT_FOOTPRINT_INVERSE_GET_COMPLETION_SITES=freezeDeep({
 returned:site("returned",8449,"s",8383,"[this,r,e,t,s,i,n,a]"),
 serviceReturn:site("serviceReturn",8694,"s",8383,"[this,r,e,t,s]"),
 success:site("success",8468,"",8464,"[this,o,n]"),
 successReturn:site("successReturn",8505,"",8464,"[this,o,n]"),
 failure:site("failure",8518,"",8514,"[this,o,n]"),
 outerFailure:site("outerFailure",8627,"s",8383,"[this,r,e,t,s,a]"),
 post:site("post",12_646,"post",12_642,"[this,e]"),
 posted:site("posted",12_677,"post",12_642,"[this,e]"),
 postReturn:site("postReturn",12_716,"post",12_642,"[this,e]"),
 local:site("local",12_697,"",12_692,"[this,e]"),
 localReturn:site("localReturn",12_714,"",12_692,"[this,e]"),
 taskFailure:site("taskFailure",8146,"execute",8090,"[this,e,t]"),
 taskReturn:site("taskReturn",8163,"execute",8090,"[this,e]"),
 eventReturn:site("eventReturn",11_811,"JP.bc.onmessage",11_785,"[this,s]"),
}as const);
export const CURRENT_FOOTPRINT_INVERSE_GET_COMPLETION_ROLES=Object.freeze(["returned","serviceReturn","success","successReturn","failure","outerFailure","post","posted","postReturn","local","localReturn","taskFailure","taskReturn","eventReturn"]as const);
export type CurrentFootprintInverseGetCompletionRole=keyof typeof CURRENT_FOOTPRINT_INVERSE_GET_COMPLETION_SITES;
export function qualifyCurrentFootprintInverseGetCompletionSource(input:unknown):string{const source=qualifyCurrentFootprintInverseGetSource(input);for(const row of Object.values(CURRENT_FOOTPRINT_INVERSE_GET_CALLBACKS)){const text=source.slice(row.start,row.end);if(text!==row.source||createHash("sha256").update(text).digest("hex")!==row.sha256){throw new Error("FOOTPRINT_INVERSE_GET_COMPLETION_SOURCE");}}return source;}
/** Native microtask ordering after one successful nonawaiting getNeedData:
 * finally schedules WHOHAS; success was queued first and publishes PUBLISH,
 * followed by WHOHAS local delivery then PUBLISH local delivery. */
export const CURRENT_FOOTPRINT_INVERSE_GET_COMPLETION_ORDER=Object.freeze([
 "returned","post-whohas","posted-whohas","postReturn-whohas","serviceReturn","taskReturn","eventReturn","success","post-publish","posted-publish","postReturn-publish","successReturn","local-whohas","localReturn-whohas","local-publish","localReturn-publish",
]as const);

/** Additional original Via points. The old shared producer roster and ceilings stay exact. */
import { createHash } from "node:crypto";
import { qualifyCurrentProjectSaveProducerSource } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SOURCE=Object.freeze({start:1_685_979,end:1_686_224,bytes:245,sha256:"225b955f2d4671c055291a40525fbbf2600401de8d8a57fe57b53b070ad0e499",functionLineNumber:106,functionColumnNumber:57_531});
export const CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES=freezeDeep({
  cacheDeleteCall:{lineNumber:106,columnNumber:57_581,expression:"[this,t,s,r]",length:4},
  cacheDeleteReturned:{lineNumber:106,columnNumber:57_586,expression:"[this,t,s,r]",length:4},
  cacheDeleteFailed:{lineNumber:106,columnNumber:57_596,expression:"[this,t,s,r]",length:4},
});
export const CURRENT_PCB_VIA_SAVE_TAIL_DELETE_ROLES=Object.freeze(["cacheDeleteCall","cacheDeleteReturned","cacheDeleteFailed"] as const);
export type CurrentPcbViaSaveTailDeleteRole=keyof typeof CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES;
export const CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CALLER=Object.freeze({lineNumber:110,columnNumber:10_319,functionLineNumber:110,functionColumnNumber:10_008,expression:"[this,l,t,f,u,E]",length:6} as const);
export const CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CONDITION=String.raw`(()=>{try{const d=Object.getOwnPropertyDescriptor(globalThis,"PROJECT");if(!d||!Object.hasOwn(d,"value"))return true;const p=d.value,a=Object.getOwnPropertyDescriptor(p,"cache"),b=Object.getOwnPropertyDescriptor(p,"localCache");if(!a||!b||!Object.hasOwn(a,"value")||!Object.hasOwn(b,"value"))return true;return this===a.value||this===b.value;}catch{return true;}})()`;
export function qualifyCurrentPcbViaSaveTailDeleteSource(source:string):void{qualifyCurrentProjectSaveProducerSource(source);const pin=CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SOURCE,text=source.slice(pin.start,pin.end);if(Buffer.byteLength(text)!==pin.bytes||createHash("sha256").update(text).digest("hex")!==pin.sha256){throw new Error("VIA_SAVE_TAIL_DELETE_SOURCE");}}

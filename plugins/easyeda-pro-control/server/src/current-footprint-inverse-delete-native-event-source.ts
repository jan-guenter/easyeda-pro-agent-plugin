/** Exact original worker native-message callback and its synchronous caller
 * chain. These are source/paused-frame facts, not native delivery authority. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintInverseDeleteRpcSource } from "./current-footprint-inverse-delete-rpc-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_SOURCE=freezeDeep({start:11_785,end:11_812,bytes:27,sha256:"d257238e1366dbd0132b6a8f3445117f2db2c2c2daa50815aaacf4de8506d4b7",source:"s=>{this.onMessage(s.data)}",functionName:"JP.bc.onmessage",lineNumber:0,columnNumber:11_785,pausedColumn:11_794,expression:"[this,s]"}as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_CALLERS=freezeDeep([
 {index:4,functionName:"execute",lineNumber:0,columnNumber:8090,pausedColumn:8125},
 {index:5,functionName:"onReceivedIGive",lineNumber:0,columnNumber:11_387,pausedColumn:11_589},
 {index:6,functionName:"onMessage",lineNumber:0,columnNumber:11_822,pausedColumn:12_158},
 {index:7,...CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_SOURCE},
]as const);
export function qualifyCurrentFootprintInverseDeleteNativeEventSource(full:string):void{qualifyCurrentFootprintInverseDeleteRpcSource(full);const row=CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_SOURCE,source=full.slice(row.start,row.end);if(source!==row.source||Buffer.byteLength(source)!==row.bytes||createHash("sha256").update(source).digest("hex")!==row.sha256){throw new Error("FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_SOURCE");}}

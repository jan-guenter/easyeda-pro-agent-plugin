/** Actual original worker service/EP handler source. This is an inert source
 * qualification, never a forwarded job, callback or clock permit. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintInverseClockWorkerSource } from "./current-footprint-inverse-clock-worker-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_TOPIC="/mgr/projectWorker/footprint/delete";
export const CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_FUNCTIONS=freezeDeep({
 service:{name:"s",arity:1,start:8383,end:8695,lineNumber:0,columnNumber:8383,bytes:312,sha256:"c6546a1b802699793873a9bc6cc53b50d74f21ff17dc3dcc688839cef4444824"},
 handler:{name:"",arity:1,start:2_152_907,end:2_152_935,lineNumber:110,columnNumber:138_697,bytes:28,sha256:"aed5da05b4c2e65abe46fc3fd2d5b0ec87b783dc9036f63438a5c91fd89e8d5b"},
}as const);
const topic={start:1_663_748,end:1_663_792,bytes:44,sha256:"a894ed8006dc8a3ee14b60431ba854e9fca63c110371f90b0dd9dc16d019290f"}as const;
export type CurrentFootprintInverseDeleteRpcRole=keyof typeof CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_FUNCTIONS;
export function qualifyCurrentFootprintInverseDeleteRpcSource(input:unknown):string{const source=qualifyCurrentFootprintInverseClockWorkerSource(input);for(const row of[topic,...Object.values(CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_FUNCTIONS)]){const fragment=source.slice(row.start,row.end);if(Buffer.byteLength(fragment)!==row.bytes||createHash("sha256").update(fragment).digest("hex")!==row.sha256){throw new Error("FOOTPRINT_INVERSE_DELETE_RPC_SOURCE");}}return source;}

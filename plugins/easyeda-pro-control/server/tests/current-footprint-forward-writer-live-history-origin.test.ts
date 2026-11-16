/** Negative admission only. No original owner or native process is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { requireCurrentFootprintForwardWriterLiveHistoryOrigin } from "../src/current-footprint-forward-writer-live-history-origin.ts";

void test("matching full/Via labels, caller callbacks and Proxy traps cannot issue a full live history origin",()=>{
 let calls=0;const proxy=new Proxy({}, {get():never{calls+=1;throw new Error("caller trap")},getPrototypeOf():never{calls+=1;throw new Error("caller trap")}});
 for(const value of [proxy,{profile:"private.current-footprint-forward-writer-live-history-origin.v1",assertCurrent:():never=>{calls+=1;throw new Error("caller callback")}}, {profile:"private.current-pcb-via-live-history-origin.v1"}]){assert.throws(()=>Reflect.apply(requireCurrentFootprintForwardWriterLiveHistoryOrigin,undefined,[value,proxy,proxy]),/FORWARD_WRITER_LIVE_HISTORY_ORIGINAL_ORIGIN/u)}assert.equal(calls,0);
});

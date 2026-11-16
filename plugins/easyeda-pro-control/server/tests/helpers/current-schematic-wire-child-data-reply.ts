/** Test-only raw reply capture. Delivery precedes optional persistence, and
 * closure waits for the original write attempt even when that attempt fails. */
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import type {MessagePort} from "node:worker_threads";

export async function deliverWireChildDataReply(port:MessagePort,value:unknown,root:string|undefined,variant:0|1,mode:string):Promise<void>{
 try{
  port.postMessage(value);
  if(root===undefined||!mode.includes("-points-data")){return;}
  const payload=JSON.stringify(value);assert.ok(typeof payload==="string");
  const name=`wire-child-data-raw-${String(variant)}-${mode}-${String(process.pid)}-${String(Date.now())}-${randomUUID()}.json`;
  await writeFile(join(root,name),payload,{flag:"wx",mode:0o600});
 }finally{port.close();}
}

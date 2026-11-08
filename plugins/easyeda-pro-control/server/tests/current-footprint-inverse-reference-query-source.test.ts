/** Original installed query source and independent callable metadata only.
 * No application, original request, delete continuation or Save is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { z } from "zod";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_FILES as FILES, CURRENT_FOOTPRINT_INVERSE_REFERENCE_QUERY_SOURCE as SOURCE, requireCurrentFootprintInverseReferenceQueryDescription as description, qualifyCurrentFootprintInverseReferenceQueryFunction as metadata, qualifyCurrentFootprintInverseReferenceQuerySource as qualify } from "../src/current-footprint-inverse-reference-query-source.ts";

async function sources(): Promise<Readonly<{manager: string; worker: string}> | null> {
  const values = await readConfiguredEasyedaAssets([FILES.manager.relativePath, FILES.worker.relativePath]);
  if (values === null) { return null; }
  const manager = values[0], worker = values[1]; assert.ok(manager !== undefined && worker !== undefined);
  return { manager, worker };
}
void test("original reference queries retain full source and reveal manager failure masking", async context => {
  const all = await sources(); if (all === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  qualify(all.manager, "manager"); qualify(all.worker, "worker"); assert.equal(Object.keys(SOURCE).length, 24);
  assert.throws(() => { qualify(`${all.manager} `, "manager"); }); assert.throws(() => { qualify(`${all.worker} `, "worker"); });
  description(all.manager.slice(SOURCE.managerPcbCallback.start, SOURCE.managerPcbCallback.end), "managerPcbCallback");
  assert.throws(() => { description("async () => []", "managerPcbCallback"); });
  for (const [role, member] of [["managerPcbCallback", "pcb"], ["managerDeviceCallback", "device"], ["managerFootprintCallback", "footprint"]] as const) {
    const row = SOURCE[role]; const original = all.manager.slice(row.start, row.end);
    const failures: unknown[] = [];
    const result: unknown = await runInNewContext(`(${original})("selected", "project")`, {
      K: () => ({ [member]: { getAllArrData: () => Promise.reject(new Error("worker failure")), getKeysBySource: () => Promise.reject(new Error("worker failure")) } }),
      vs: { error: (error: unknown) => failures.push(error) },
    }, { timeout: 1000 });
    assert.deepEqual(structuredClone(result), []); assert.equal(failures.length, 1);
  }
});

const inspector = String.raw`
const { workerData, parentPort } = require('node:worker_threads');
const { Session } = require('node:inspector/promises');
parentPort.on('message',()=>{});
(async () => {
 const session = new Session(); session.connectToMainThread(); await session.post('Runtime.enable'); await session.post('Debugger.enable');
 const compiled = await session.post('Runtime.compileScript', {expression:workerData.source,sourceURL:'inert-original-reference-queries.js',persistScript:true});
 if (!compiled.scriptId) throw Error('compile'); const ran = await session.post('Runtime.runScript',{scriptId:compiled.scriptId}); if(ran.exceptionDetails)throw Error('run');
 const rows=[]; for(const role of workerData.roles){const r=await session.post('Runtime.evaluate',{expression:'globalThis.'+role});if(!r.result.objectId)throw Error('function');rows.push({role,remote:r,metadata:await session.post('Runtime.getProperties',{objectId:r.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false})});}
 await session.post('Debugger.disable');session.disconnect();parentPort.postMessage({scriptId:compiled.scriptId,rows});parentPort.close();
})().catch(error=>parentPort.postMessage({error:String(error)}));`;
void test("eleven original query callables expose their exact Inspector locations", {timeout:60_000}, async context => {
  const all = await sources(); if (all === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  assert.equal(process.versions.node, "24.18.0");
  for (const file of ["manager", "worker"] as const) {
    const roles = file === "manager" ? ["managerPcbAll", "managerDeviceAll", "managerFootprintKeys", "managerPcbCallback", "managerDeviceCallback", "managerFootprintCallback"] as const : ["workerPcbHandler", "workerDeviceHandler", "workerFootprintHandler", "workerFootprintSourceValid", "workerMustString"] as const;
    const full = all[file]; let source = full.replaceAll(/[^\r\n]/gu, " "); source = `(()=>{${source.slice(6)}`;
    for (const role of roles) {
      const row = SOURCE[role]; const prefix = `globalThis.${role}=${row.kind === "method" ? "{" : ""}`, suffix = row.kind === "method" ? "};" : ";";
      source = source.slice(0, row.descriptionStart - prefix.length) + prefix + full.slice(row.descriptionStart, row.end) + suffix + source.slice(row.end + suffix.length);
      if (row.kind === "method") { source += `globalThis.${role}=globalThis.${role}.${row.name};`; }
    }
    source += "})();"; const worker = new Worker(inspector, { eval: true, workerData: {source, roles} });
    try {
      // oxlint-disable-next-line promise/avoid-new -- A separate Inspector connection observes the original source functions without invoking them.
      const raw: unknown = await new Promise((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); worker.once("exit", () => { reject(new Error("Inspector exited before its result")); }); });
      if (raw !== null && typeof raw === "object" && "error" in raw) { assert.fail(typeof raw.error === "string" ? raw.error : "Inspector failure"); }
      const rowSchema = z.strictObject({role:z.enum(roles),remote:z.unknown(),metadata:z.unknown()}); const resultSchema = z.strictObject({scriptId:z.string(),rows:z.array(rowSchema)});
      const result = resultSchema.parse(raw);
      assert.equal(result.rows.length, roles.length);
      for (const row of result.rows) { const remote = z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.enum(["Function", "AsyncFunction"]),description:z.string(),objectId:z.string()})}).parse(row.remote); description(remote.result.description, row.role); assert.ok(metadata(row.metadata, row.role, result.scriptId).length > 0); }
    } finally { await worker.terminate(); for (const role of roles) { Reflect.deleteProperty(globalThis, role); } }
  }
});

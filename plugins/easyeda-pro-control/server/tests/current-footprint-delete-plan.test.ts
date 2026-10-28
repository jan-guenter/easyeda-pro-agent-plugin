/** Exact native methods with synthetic clocks/uploads, never an EasyEDA writer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { prepareCurrentFootprintDeletePlan, verifyCurrentFootprintDeleteWorkerUpload } from "../src/current-footprint-delete-plan.ts";
import { assertCurrentFootprintDeleteSource } from "../src/current-footprint-delete-source.ts";
import { footprintDeleteFragments as fragments } from "./helpers/footprint-delete-fragments.ts";

const input = Object.freeze({ targetUuid: "a".repeat(16), client: "b".repeat(16), maximumTicketBeforeClock: 100,
  maximumTicketAfterClock: 100, documentClock: 1_800_000_000_123, managerUserAbsent: true, editorVersion: "3.2.209" });
async function native(mode: "success" | "clock-refused" | "missing" | "upload-refused" | "drift"): Promise<Record<string, unknown>> {
  const result: unknown = await runInNewContext(`(async()=>{
const mode=${JSON.stringify(mode)},steps=[],Ie='|\\n',self={PRO_EDITOR_VERSION:'3.2.209'};
${fragments.header}
${fragments.atom}
class Encoder{constructor(){this.doctype='FOOTPRINT';}${fragments.headMethod}${fragments.deleteEncoder}}
class Ke{constructor(){this.footprint=new Encoder;}}
let maximumTicket=100;
const qe=async()=>{steps.push('clock');if(mode==='clock-refused')throw Error('clock refused');if(mode==='drift')maximumTicket++;return ${String(input.documentClock)};};
class Manager{${fragments.deleteString}${fragments.deleteData}
verifyKey(id){steps.push('verify');if(id!==${JSON.stringify(input.targetUuid)})throw Error('wrong target');}
isHas(){steps.push('membership');return mode!=='missing';}
get maxTicket(){return maximumTicket;}
get newTicket(){steps.push('ticket');return ++maximumTicket;}}
const uploads=[];const manager=new Manager;manager.client=${JSON.stringify(input.client)};manager.user=undefined;
manager.projectManager={async uploadLocal(rows){steps.push('upload');uploads.push(...rows);return{success:mode!=='upload-refused'};}};
let outcome;try{outcome=await manager.deleteData(${JSON.stringify(input.targetUuid)});}catch(error){outcome={error:error.message};}
return JSON.stringify({steps,uploads,maximumTicket,outcome});})()`, {}, { timeout: 1000 });
  assert.equal(typeof result, "string");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The inert fixture returns its own JSON object; individual fields are asserted below.
  return JSON.parse(String(result)) as Record<string, unknown>;
}
void test("pinned delete uses one clock and one ticket, produces DELETE_DOC, and ignores a false upload result", async () => {
  for (const [role, source] of Object.entries(fragments)) {
    assert.ok(role in fragments);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Entries enumerate only this fixed literal source fixture.
    assertCurrentFootprintDeleteSource(role as keyof typeof fragments, source);
  }
  const plan = prepareCurrentFootprintDeletePlan(input);
  for (const mode of ["success", "upload-refused"] as const) {
    const result = await native(mode);
    assert.deepEqual(result["steps"], ["verify", "membership", "clock", "ticket", "upload"]);
    assert.deepEqual(result["uploads"], [plan.workerUpload]); assert.equal(result["maximumTicket"], 101);
    assert.deepEqual(result["outcome"], { success: true });
    verifyCurrentFootprintDeleteWorkerUpload(plan, plan.workerUpload);
  }
  assert.equal(plan.documentClockCalls, 1); assert.equal(plan.databaseRestoration, false);
  for (const flag of ["executionAuthorized", "dependencyEligibilityVerified", "nativeClockProvenanceVerified", "wholeSqlEffectVerified", "savedAbsenceVerified"] as const) {
    assert.equal(plan[flag], false);
  }
});
void test("missing target or clock failure cannot allocate a delete ticket, while actual clock drift changes the native upload", async () => {
  const missing = await native("missing"); assert.deepEqual(missing["steps"], ["verify", "membership"]);
  assert.deepEqual(missing["uploads"], []); assert.equal(missing["maximumTicket"], 100);
  const refused = await native("clock-refused"); assert.deepEqual(refused["steps"], ["verify", "membership", "clock"]);
  assert.deepEqual(refused["uploads"], []); assert.equal(refused["maximumTicket"], 100);
  const drift = await native("drift"), plan = prepareCurrentFootprintDeletePlan(input);
  assert.notDeepEqual(drift["uploads"], [plan.workerUpload]); assert.equal(drift["maximumTicket"], 102);
  assert.throws(() => prepareCurrentFootprintDeletePlan({ ...input, maximumTicketAfterClock: 101 }));
});
void test("delete comparison refuses coercion, copied plans, extra records and unsupported user/header shapes", () => {
  const plan = prepareCurrentFootprintDeletePlan(input);
  for (const changed of [`${plan.workerUpload  }|\n`, plan.workerUpload.replace("DELETE_DOC", "DELETE"), plan.workerUpload.replace('"isDelete":true', '"isDelete":false')]) {
    assert.throws(() => { verifyCurrentFootprintDeleteWorkerUpload(plan, changed); });
  }
  assert.throws(() => { verifyCurrentFootprintDeleteWorkerUpload(structuredClone(plan), plan.workerUpload); });
  for (const changed of [{ ...input, managerUserAbsent: false }, { ...input, documentClock: -0 }, { ...input, documentClock: "1" },
    { ...input, maximumTicketAfterClock: Number.MAX_SAFE_INTEGER }, { ...input, targetUuid: `${input.targetUuid  }\n` }, { ...input, user: "ignored" }]) {
    assert.throws(() => prepareCurrentFootprintDeletePlan(changed));
  }
  let called = 0;
  assert.throws(() => prepareCurrentFootprintDeletePlan({ ...input, get documentClock(): number { called += 1; return 1; } }));
  assert.equal(called, 0);
});

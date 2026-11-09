/** Fixed-code/descriptor boundaries only. No native clock origin, selected
 * responder, SDK Save or SQL authority is created by these isolated fixtures. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_CALLS as CALLS } from "../src/current-schematic-display-clock-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS, currentSchematicDisplayClockCondition, currentSchematicDisplayClockNativeCases,
  validateCurrentSchematicDisplayClockCommand } from "../src/current-schematic-display-clock-protocol.ts";

void test("all eleven new SCH clock programs compile and retain no synthetic legacy worker tuple", () => {
  assert.equal(Object.keys(CALLS).length, 11);
  for (const source of Object.values(CALLS)) {
    assert.ok(typeof runInContext(`(${source})`, createContext({})) === "function");
    assert.equal(source.includes("array(this,70)"), false); assert.equal(source.includes('own(project,"footprint")'), false);
    assert.equal(source.includes("array(lexicals,10)"), false); assert.equal(source.includes("array(deps,70)"), false);
  }
  assert.ok(CALLS.worker.includes("array(w,14)")); assert.ok(CALLS.registration.includes("array(route,2)"));
  assert.ok(CALLS.complete.includes('own(u.bus,"pulled")'));
});
void test("copied SDK roots and invalid modify/Save state refuse clock registration before the original target guard", () => {
  for (const alteration of ["tuple=[...tuple]", "state.owner=[]", "state.modifyAcknowledged=false", "state.saveAttempted=true"]) {
    const context = createContext({});
    runInContext(`globalThis.guards=0;globalThis.sdk={};globalThis._EXTAPI_ROOT_=sdk;globalThis.state={owner:null,failed:false,modifyAcknowledged:true,saveAttempted:false};
globalThis.tuple=[{sdk},state];state.owner=tuple;Object.defineProperty(state,"guard",{value:()=>{guards++;throw Error('guard');},writable:false,configurable:false,enumerable:true});${alteration};`, context);
    assert.throws(() => runInContext(`(${CALLS.registration}).call(tuple,"${"a".repeat(64)}","${"b".repeat(32)}","window")`, context));
    assert.equal(runInContext("guards", context), 0);
  }
});
void test("finite one-clock commands reject code/realm/condition drift and selected-bus conditions invoke no UUID getter", () => {
  const cases = currentSchematicDisplayClockNativeCases(); assert.equal(cases.length, 37);
  for (const command of cases) {
    assert.deepEqual(validateCurrentSchematicDisplayClockCommand(command), command); assert.throws(() => validateCurrentSchematicDisplayClockCommand({ ...command, sessionId: "copied" }));
    if (command.method === "Runtime.callFunctionOn") {
      assert.throws(() => validateCurrentSchematicDisplayClockCommand({ ...command, params: { ...command.params, functionDeclaration: `${command.params.functionDeclaration}\n` } }));
    }
    if (command.phase === "schematic-clock-arm") {
      assert.throws(() => validateCurrentSchematicDisplayClockCommand({ ...command, params: { ...command.params, condition: "true" } }));
      assert.throws(() => validateCurrentSchematicDisplayClockCommand({ ...command, params: { ...command.params, location: { ...command.params.location, columnNumber: command.params.location.columnNumber + 1 } } }));
    }
  }
  const context = createContext({}); const condition = currentSchematicDisplayClockCondition("push", "11111111-1111-1111-1111-111111111111");
  runInContext('globalThis.traps=0;globalThis.receiver={get uuid(){traps++;throw Error("getter");}};', context);
  assert.equal(runInContext(`(function(e){return ${condition};}).call(receiver,"/pro-mgr/serverTime/now")`, context), true); assert.equal(runInContext("traps", context), 0);
  runInContext('globalThis.receiver=new Proxy({},{getOwnPropertyDescriptor(){throw Error("descriptor");}});', context);
  assert.equal(runInContext(`(function(e){return ${condition};}).call(receiver,"/pro-mgr/serverTime/now")`, context), true);
  assert.equal(CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS.normal + CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS.cleanup, CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS.total);
});

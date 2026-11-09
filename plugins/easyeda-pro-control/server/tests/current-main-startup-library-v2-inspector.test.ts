/** Actual inert Node Inspector test, not an EasyEDA or SQLite execution. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Session } from "node:inspector";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { z } from "zod";
import { CURRENT_MAIN_STARTUP_LIBRARY_SOURCE as SOURCE } from "../src/current-main-startup-library-catalog.ts";

const RUN = String.raw`async runScripts(e){e=e.replace(/^--.*$/g,"");let r=e.split(/\r?\n\r?\n/m);for(let i of r)/^\s*$/.test(i)||await this.dbWrap.run(i)}`;
const JL = "async function JL(t){return W0?await t.runScripts(wE):await t.runScripts(yE),t}";
/** Same-process paused Inspector callbacks must finish synchronously before
 * resume. This test never sends a command to an external process or session. */
function request(session: Session, method: string, params: object = {}): unknown {
  let completed = false; const outcome: { failure: Error | null } = { failure: null }; let reply: unknown;
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Node's same-process Inspector callback is synchronous while its original debugger pause is held.
  session.post(method, params, (error, value): void => { completed = true; outcome.failure = error; reply = value; });
  assert.equal(completed, true); if (outcome.failure !== null) { throw outcome.failure; } return reply;
}
const remote = z.looseObject({ objectId: z.string().optional(), description: z.string().optional(), value: z.unknown().optional() });
const evaluation = z.looseObject({ result: remote, exceptionDetails: z.unknown().optional() });
const property = z.looseObject({ name: z.string(), value: remote.optional() });
const propertyRows = z.array(property);
const properties = z.looseObject({ result: propertyRows });
void test("actual Node24 async pause keeps original r available and rejects a second same-owner same-SQL invocation by JS identity", async () => {
  assert.equal(createHash("sha256").update(RUN).digest("hex"), SOURCE.sourceRows.runScripts.sha256);
  assert.equal(createHash("sha256").update(JL).digest("hex"), SOURCE.sourceRows.JL.sha256);
  const session = new Session(); session.connect();
  const rows: { names: string[]; sameArray: boolean; sameOwner: boolean; sql: unknown }[] = [];
  let firstArray: string | null = null, firstOwner: string | null = null; let failure: unknown;
  request(session, "Debugger.enable"); request(session, "Runtime.enable");
  session.on("Debugger.paused", event => {
    try {
      const frames = event.params.callFrames, index = frames.findIndex(frame => frame.functionName === "runScripts");
      assert.equal(index, 2); const caller = frames[index]; assert.ok(caller !== undefined);
      const captured = evaluation.parse(request(session, "Debugger.evaluateOnCallFrame", { callFrameId: caller.callFrameId, expression: "[this,r,i]", silent: true, returnByValue: false, throwOnSideEffect: true }));
      assert.equal(captured.exceptionDetails, undefined); assert.equal(captured.result.description, "Array(3)"); assert.ok(captured.result.objectId !== undefined);
      const fields = properties.parse(request(session, "Runtime.getProperties", { objectId: captured.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false })).result;
      const owner = fields.find(field => field.name === "0")?.value?.objectId; const array = fields.find(field => field.name === "1")?.value?.objectId;
      assert.ok(owner !== undefined && array !== undefined); firstArray ??= array; firstOwner ??= owner;
      const same = (objectId: string, original: string): boolean => {
        const value = evaluation.parse(request(session, "Runtime.callFunctionOn", { objectId, functionDeclaration: "function(original){return this===original}", arguments: [{ objectId: original }], returnByValue: true, throwOnSideEffect: true })).result.value;
        assert.ok(typeof value === "boolean"); return value;
      };
      rows.push({ names: frames.map(frame => frame.functionName), sameArray: same(array, firstArray), sameOwner: same(owner, firstOwner), sql: fields.find(field => field.name === "2")?.value?.value });
    } catch (error) { failure = error; }
    finally { request(session, "Debugger.resume"); }
  });
  try {
    const kit: unknown = runInThisContext(`(()=>{const W0=false,yE="first\\n\\nsecond";class Wrap{async run(){return await new Promise(resolve=>{debugger;queueMicrotask(()=>resolve(0));});}}class Yo{constructor(){this.dbWrap=new Wrap;}${RUN}}${JL};return{owner:new Yo,JL,yE};})()`);
    assert.ok(kit !== null && typeof kit === "object"); const owner: unknown = Reflect.get(kit, "owner"); const invoke: unknown = Reflect.get(kit, "JL"); assert.ok(typeof invoke === "function");
    const first = Promise.resolve(owner);
    // oxlint-disable-next-line typescript/unbound-method -- Reflect.apply supplies this exact original Promise as receiver for its builtin then method.
    const pending: unknown = Reflect.apply(first.then, first, [invoke]); assert.ok(pending instanceof Promise); await pending;
    assert.ok(owner !== null && typeof owner === "object"); const run: unknown = Reflect.get(owner, "runScripts"), script: unknown = Reflect.get(kit, "yE"); assert.ok(typeof run === "function");
    const foreign: unknown = Reflect.apply(run, owner, [script]); assert.ok(foreign instanceof Promise); await foreign;
    if (failure !== undefined) { assert.ok(failure instanceof Error); throw failure; }
    assert.deepEqual(rows.map(row => row.sameArray), [true, true, false, false]); assert.ok(rows.every(row => row.sameOwner));
    assert.deepEqual(rows[0]?.names, ["", "run", "runScripts", "JL"]); assert.deepEqual(rows[1]?.names, ["", "run", "runScripts"]);
    assert.deepEqual(rows[3]?.names, ["", "run", "runScripts"]); assert.deepEqual(rows.map(row => row.sql), ["first", "second", "first", "second"]);
  } finally { request(session, "Debugger.disable"); session.disconnect(); }
});

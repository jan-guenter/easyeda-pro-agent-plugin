/** Actual retained native-owner methods and real child-pipe callbacks. Factory
 * provenance, source qualification and the Windows peer are explicitly synthetic;
 * this test allocates no application, native Job or process handle. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintHeadAgeValidationOwner } from "../src/current-pcb-diagnostic-owner.ts";

interface Fixture {
  readonly owner: CurrentFootprintHeadAgeValidationOwner;
  readonly actions: string[];
  readonly mainAttachEntered: Promise<null>;
}

/** Load unchanged owner methods while replacing only the external issuance
 * seams. The test-only lexical factory inserts an inert original allocation;
 * no production constructor, registry or capability is exported or relaxed.
 */
async function fixture(context: TestContext): Promise<Fixture> {
  const path = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const sourceToken = Object.freeze({ syntheticSourceOnly: true });
  const sqlHead = Object.freeze({ syntheticSqlHeadOnly: true });
  const completion = Object.freeze({ observedChildClose: true, exitCode: 0, exitSignal: null });
  const source = `${await readFile(path, "utf8")}\n
export function injectSyntheticHeadAgeAbortAllocation(owner){
 const binding=Object.freeze({operationId:"footprint-head-age-synthetic-abort",target:Object.freeze({}),originalTarget:Object.freeze({}),
  prepared:Object.freeze({checkpoint:Object.freeze({checkpointSha256:"a".repeat(64)})}),
  inventory:Object.freeze({checkpointSha256:"a".repeat(64)}),runtime:Object.freeze({})});
 const allocation={binding,text:headAgeValidationBindingText(binding),completion:readerCompletion(binding.inventory),head:syntheticHeadAgeSqlHead,owner,status:"retained"};
 headAgeValidationAllocations.set(binding,allocation);
 headAgeValidationFactories.set(owner,Object.freeze({allocation,options:Object.freeze({syntheticOnly:true}),installation:{facadeSha256:"b".repeat(64)}}));
}
`;
  const compiled = await transform(source, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports,syntheticHeadAgeSqlHead){${compiled.code}\n})`);
  assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-209-actor-clock-source.ts") {
      return { requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, sourceToken); } };
    }
    if (name === "./sqlite-inventory.ts") { return { readerCompletion: (): object => completion }; }
    if (name === "./current-footprint-head-age-sql.ts") {
      return { requireCurrentFootprintHeadAgeSqlHead: (value: unknown): void => { assert.equal(value, sqlHead); } };
    }
    return actualRequire(name) as unknown;
  }, loaded, loaded.exports, sqlHead]);
  const Constructor = loaded.exports["CurrentFootprintHeadAgeValidationOwner"], seed = loaded.exports["injectSyntheticHeadAgeAbortAllocation"];
  assert.ok(typeof Constructor === "function" && typeof seed === "function");
  const script = `
const readline=require('node:readline'),input=readline.createInterface({input:process.stdin});let terminated=false;
const send=(q,result)=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
input.on('line',line=>{const q=JSON.parse(line);
 if(q.action==='launch')send(q,{helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'});
 else if(q.action==='main-attach')setTimeout(()=>send(q,{attached:true}),50);
 else if(q.action==='normal-close')send(q,{closeDispatched:true,saveOrDiscardSelected:false});
 else if(q.action==='head-age-abort'){terminated=true;send(q,{terminationDispatched:true});}
 else if(q.action==='termination')send(q,{terminated,originalRootExited:terminated,originalJobEmpty:terminated});
 else if(q.action==='release')send(q,{released:true});
 else throw Error('unexpected synthetic helper action '+q.action);
});`;
  const child = spawn(process.execPath, ["-e", script], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], entered = Promise.withResolvers<null>(), write = child.stdin.write.bind(child.stdin);
  child.stdin.write = (chunk: unknown, ...rest: unknown[]): boolean => {
    if (typeof chunk === "string") {
      const value: unknown = JSON.parse(chunk);
      assert.ok(value !== null && typeof value === "object" && "action" in value);
      actions.push(String(value.action)); if (value.action === "main-attach") { entered.resolve(null); }
    }
    const result: unknown = Reflect.apply(write, undefined, [chunk, ...rest]); assert.ok(typeof result === "boolean"); return result;
  };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The evaluated original constructor is checked above and receives an inert source issuer and synthetic helper pipe only.
  const owner = Reflect.construct(Constructor, [child, (): Promise<void> => Promise.resolve(), sourceToken]) as CurrentFootprintHeadAgeValidationOwner;
  Reflect.apply(seed, undefined, [owner]); owner.start();
  context.after(async () => {
    if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; }
  });
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  return { owner, actions, mainAttachEntered: entered.promise };
}

/** Observe actual synthetic-peer exit separately from abort acknowledgment. */
async function release(f: Fixture): Promise<void> {
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
  assert.equal(f.owner.status().released, true); assert.equal(f.owner.status().helperClosed, true);
}

void test("head-age original Job abort stays available after consumed normal close without replaying either action", async context => {
  const f = await fixture(context);
  await f.owner.requestNormalClose("456");
  const token = f.owner.reserveFootprintHeadAgeValidationAbort();
  await assert.rejects(f.owner.dispatchFootprintHeadAgeValidationAbort(Object.freeze({}), true), /ORIGINAL_RESERVATION/u);
  await f.owner.dispatchFootprintHeadAgeValidationAbort(token, true);
  assert.throws(() => f.owner.reserveFootprintHeadAgeValidationAbort(), /CONSUMED/u);
  await assert.rejects(f.owner.dispatchFootprintHeadAgeValidationAbort(token, true), /ORIGINAL_RESERVATION/u);
  await assert.rejects(f.owner.requestNormalClose("456"), /CLOSE_CONSUMED/u);
  assert.deepEqual(f.actions, ["launch", "normal-close", "head-age-abort"]);
  await release(f);
});

void test("head-age abort waits for its original pending helper exchange and cuts off its delayed normal continuation", async context => {
  const f = await fixture(context);
  const attaching = f.owner.attachFootprintMain();
  const stopped = assert.rejects(attaching, /MAIN_ORIGINAL_OWNER/u);
  await f.mainAttachEntered;
  const token = f.owner.reserveFootprintHeadAgeValidationAbort();
  await f.owner.dispatchFootprintHeadAgeValidationAbort(token, true); await stopped;
  assert.deepEqual(f.actions, ["launch", "main-attach", "head-age-abort"]);
  await assert.rejects(f.owner.attachFootprintMain(), /MAIN_ORIGINAL_OWNER/u);
  await release(f);
});

void test("head-age purpose refuses inherited request-collection commands before helper dispatch", async context => {
  const f = await fixture(context); await f.owner.attachFootprintMain();
  for (const command of [
    { phase: "request-resume", method: "Debugger.resume", params: {} },
    { phase: "request-driver-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "driver" } },
  ] as const) {
    await assert.rejects(f.owner.sendFootprintMain(command, 1), /MAIN_REQUEST_PURPOSE|HEAD_AGE_MAIN_PHASE/u);
  }
  assert.deepEqual(f.actions, ["launch", "main-attach"]);
  const token = f.owner.reserveFootprintHeadAgeValidationAbort(); await f.owner.dispatchFootprintHeadAgeValidationAbort(token, true);
  await release(f);
});

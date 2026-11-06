/** Production original-owner methods/queues with real synthetic child streams.
 * The explicit checkpoint seam has no native authority. */
/* oxlint-disable import/max-dependencies -- Production private factory registry, retained synthetic child and exact purpose cleanup are checked together. */
import { currentPcbViaSavedReadbackAllocationOutcome, startCurrentPcbViaSavedReadbackOwner } from "../src/current-pcb-via-saved-readback-owner.ts";
import type { CurrentPcbViaWriteClosedCheckpoint } from "../src/current-pcb-via-write-closed-checkpoint.ts";
import { PassThrough } from "node:stream";
import { CurrentPcbViaSavedReadbackPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_PROFILE } from "../src/current-pcb-via-saved-readback-profile.ts";
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
import type { CurrentPcbViaSavedReadbackOwner } from "../src/current-pcb-diagnostic-owner.ts";

async function fixture(context: TestContext, malformed = false, cache = false): Promise<Readonly<{ owner: CurrentPcbViaSavedReadbackOwner; actions: string[]; pollEntered: Promise<true>; cacheRequest: (() => Promise<unknown>) | null }>> {
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const sourceRequire = createRequire(url);
  const prepared = Object.freeze({ syntheticCheckpoint: true, target: Object.freeze({ projectUuid: "a".repeat(64) }) });
  const testMethod = `public async seedSyntheticCacheForTest(){
const pipe=this.#pipe;if(!(pipe instanceof CurrentPcbViaSavedReadbackPipe))throw Error("pipe");await this.#transfer(async()=>({sessionId:await pipe.attachTarget("synthetic-target",()=>{})}));
const selected=Object.freeze({frameId:"synthetic-frame",sessionId:"synthetic-session",uniqueContextId:"synthetic-context",securityOrigin:"https://client"});
const context={savedReadbackCacheContext:()=>selected};this.#stagedContext=context;
this.#savedReadbackParentArmed=true;this.#mainRunner={selectedSqlFenceState:()=>({ready:true}),pumpSelectedSqlFence:async()=>{}};
const ledger=new CurrentPcbViaSavedCacheLedger(Object.freeze({frameId:selected.frameId,sessionId:selected.sessionId,securityOrigin:selected.securityOrigin,projectUuid:this.#savedReadbackPrepared.target.projectUuid}));
const origin=Object.freeze({profile:"private.current-pcb-via-saved-cache-origin.v1"});const bindings=this.#createSavedReadbackCacheBindings(ledger,origin,pipe,this.#savedReadbackPrepared);
const held=Object.freeze({origin,prepared:this.#savedReadbackPrepared,owner:this,ledger,context,selected,bindings});this.#savedReadbackCache=held;savedReadbackCaches.set(origin,held);return bindings;
}`;
  const originalSource = await readFile(url, "utf8");
  const seededSource = originalSource.replace("  public async startSavedReadbackGeneration()", `${testMethod}\n  public async startSavedReadbackGeneration()`);
  assert.notEqual(seededSource, originalSource);
  const source = `${seededSource}\nexport function seedSyntheticSavedReadback(owner,installation,prepared){
const writer={status:()=>({released:true,helperClosed:true})};const requireCheckpoint=value=>{if(value!==prepared)throw Error("synthetic original checkpoint");return {owner:writer};};const verifyPrepared=async value=>{requireCheckpoint(value);};
const checkpointModule=Object.freeze({requireOriginalCurrentPcbViaWriteClosedCheckpoint:requireCheckpoint,verifyCurrentPcbViaWriteClosedCheckpoint:verifyPrepared});
const allocation={options:Object.freeze({}),prepared,writer,checkpointModule,requireCheckpoint,verifyPrepared,state:"retained",owner,child:null,eofAttempted:false,cleanupFailure:null};
pcbViaSavedReadbackAllocations.set(prepared,allocation);pcbViaSavedReadbackFactories.set(owner,Object.freeze({allocation,installation}));}
`;

  const compiled = await transform(source, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [sourceRequire, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaSavedReadbackOwner"], seed = loaded.exports["seedSyntheticSavedReadback"];
  assert.ok(typeof Constructor === "function" && typeof seed === "function");
  const script = `const readline=require('node:readline'),input=readline.createInterface({input:process.stdin});let terminated=false,attached=false,queued=[];
const send=(q,result)=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
input.on('line',line=>{const q=JSON.parse(line);
if(q.action==='launch')send(q,{helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'});
else if(q.action==='send'){attached=true;queued.push({id:q.requestId,result:{sessionId:'synthetic-session'}});send(q,{written:true});}
else if(q.action==='saved-readback-cache'){if(q.savedCachePhase!=='saved-cache-key'||q.frameId!=='synthetic-frame')throw Error('selector');send(q,{written:true});}
else if(q.action==='poll')setTimeout(()=>${malformed ? String.raw`process.stdout.write('malformed\n')` : String.raw`send(q,{bytes:attached&&queued.length?Buffer.from(JSON.stringify(queued.shift())+"\u0000").toString('base64'):''})`},50);
else if(q.action==='saved-readback-abort'){if(q.confirmAbortOriginalSavedReadbackJob!==true)throw Error('confirmation');terminated=true;send(q,{terminationDispatched:true});}
else if(q.action==='termination')send(q,{terminated,originalRootExited:terminated,originalJobEmpty:terminated});
else if(q.action==='release')send(q,{released:true});else throw Error('unexpected '+q.action);});`;
  const child = spawn(process.execPath, ["-e", script], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], pollEntered = Promise.withResolvers<true>(); const originalWrite = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>): boolean => {
    const chunk: unknown = args[0]; if (typeof chunk === "string") { const value: unknown = JSON.parse(chunk);
      assert.ok(value !== null && typeof value === "object" && "action" in value); actions.push(String(value.action)); if (value.action === "poll" && (!cache || actions.includes("saved-readback-cache"))) { pollEntered.resolve(true); } }
    return originalWrite(...args);
  });
  const executable = Object.freeze({ windowsPath: "C:\\Reviewed\\easyeda-pro.exe", sha256: "a".repeat(64) });
  const plan = Object.freeze({ files: Object.freeze([executable]) }); const installation = Object.freeze({ plan });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked production VM constructor, explicit inert checkpoint seam, real retained synthetic child only.
  const owner = Reflect.construct(Constructor, [child, (): Promise<void> => Promise.resolve(), prepared, installation, (): Promise<void> => Promise.resolve()]) as CurrentPcbViaSavedReadbackOwner;
  Reflect.apply(seed, undefined, [owner, installation, prepared]); owner.start();
  context.after(async () => { if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.startSavedReadbackGeneration();
  let cacheRequest: (() => Promise<unknown>) | null = null;
  if (cache) {
    const method: unknown = Reflect.get(owner, "seedSyntheticCacheForTest"); assert.ok(typeof method === "function");
    const bindings: unknown = await Reflect.apply(method, owner, []); assert.ok(bindings !== null && typeof bindings === "object" && "request" in bindings && typeof bindings.request === "function");
    const request = bindings.request;
    cacheRequest = (): Promise<unknown> => { const result: unknown = Reflect.apply(request, bindings, [{ phase: "saved-cache-key", step: "initial" }]); assert.ok(result instanceof Promise); return result; };
  }
  return { owner, actions, pollEntered: pollEntered.promise, cacheRequest };
}

void test("fresh saved readback retains its own original Job and cannot retry launch or abort", async context => {
  const f = await fixture(context); await assert.rejects(f.owner.startSavedReadbackGeneration(), /START_CONSUMED/u);
  const original = f.owner.getTargets(), refused = assert.rejects(original); await f.pollEntered;
  const abort = f.owner.abortSavedReadback(true); await assert.rejects(f.owner.abortSavedReadback(true), /ABORT_CONSUMED/u);
  await abort; await refused; assert.equal(f.owner.status().busy, false);
  assert.deepEqual(f.actions, ["launch", "send", "poll", "saved-readback-abort"]);
  await assert.rejects(f.owner.getTargets()); assert.equal(f.actions.filter(action => action === "send").length, 1);
  assert.throws(() => f.owner.originalSavedReadbackTermination(), /ORIGINAL_TERMINATION/u);
  assert.equal(await f.owner.observeTermination(), true); const termination = f.owner.originalSavedReadbackTermination();
  f.owner.requireOriginalSavedReadbackTermination(termination); assert.throws(() => { f.owner.requireOriginalSavedReadbackTermination({ ...termination }); }, /ORIGINAL_TERMINATION/u);
  await f.owner.releaseClosed(); assert.equal(f.owner.status().released, true); assert.equal(f.owner.status().helperClosed, true);
  assert.equal(f.owner.originalSavedReadbackTermination(), termination);
});
void test("copied closed-checkpoint data refuses the real lazy factory before native allocation", async () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately forged runtime input must be rejected by the genuine private checkpoint registry.
  const copied = { profile: "private.current-pcb-via-write-closed-checkpoint.v1" } as CurrentPcbViaWriteClosedCheckpoint;
  const options = Object.freeze({ pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "a".repeat(64), powershellBytes: 1 });
  await assert.rejects(startCurrentPcbViaSavedReadbackOwner(options, copied), /CLOSED_CHECKPOINT_ORIGINAL/u);
  assert.deepEqual(currentPcbViaSavedReadbackAllocationOutcome(copied), { state: "not-attempted", owner: null });
});

void test("fresh readback native composition repeats exactly and its current pipe preserves24 bounded discovery slots and no opening grant", async context => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const first = generateWorkerStartupProtocol(source); assert.equal(generateWorkerStartupProtocol(first), first);
  const parentStart = first.indexOf("        'saved-readback-parent' {\n");
  const preflightStart = first.indexOf("        'saved-readback-preflight' {\n");
  const abortStart = first.indexOf("        'saved-readback-abort' {\n");
  assert.ok(parentStart !== -1 && preflightStart > parentStart && abortStart > preflightStart);
  const priorReadOnly = first.slice(0, parentStart) + first.slice(preflightStart);
  assert.equal(generateWorkerStartupProtocol(priorReadOnly), first);
  const priorBirth = first.slice(0, parentStart) + first.slice(abortStart);
  assert.equal(generateWorkerStartupProtocol(priorBirth), first);

  const flags = first.slice(0, first.indexOf("\n")).match(/\[switch\]\$\w+/gu); assert.ok(flags !== null); assert.equal(flags.length, new Set(flags).size);
  assert.equal(first.split("        'saved-readback-abort' {").length - 1, 1);
  assert.ok(first.includes("spatial209?384:componentSpatial209?419:"));
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.main.total, 909); assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.total, 171);
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.enabledDiscovery, 16); assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.cacheDeletionAuthorized, false);
  const input = new PassThrough(), output = new PassThrough(); let requests = 0;
  output.on("data", (bytes: Buffer): void => { const command: unknown = JSON.parse(bytes.subarray(0, -1).toString()); assert.ok(command !== null && typeof command === "object" && "id" in command && "method" in command);
    requests += 1; input.write(Buffer.from(`${JSON.stringify({ id: command.id, result: {} })}\0`)); });
  const pipe = new CurrentPcbViaSavedReadbackPipe(input, output); pipe.start();
  context.after(async () => { const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  for (let index = 0; index < 24; index += 1) { await pipe.getVersion(); }
  await assert.rejects(pipe.getVersion(), /budget/iu); assert.equal(requests, 24);
});

void test("pending original cache request settles before original Job abort and is never replayed", async context => {
  const f = await fixture(context, false, true); assert.ok(f.cacheRequest !== null);
  const original = f.cacheRequest(), refused = assert.rejects(original); await f.pollEntered;
  await f.owner.abortSavedReadback(true); await refused;
  assert.equal(f.actions.filter(action => action === "saved-readback-cache").length, 1);
  assert.equal(f.actions.filter(action => action === "saved-readback-abort").length, 1);
  assert.equal(f.owner.status().busy, false); await assert.rejects(f.cacheRequest());
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
  assert.equal(f.owner.status().released, true); assert.equal(f.owner.status().helperClosed, true);
});

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

async function fixture(context: TestContext, malformed = false): Promise<Readonly<{ owner: CurrentPcbViaSavedReadbackOwner; actions: string[]; pollEntered: Promise<true> }>> {
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const sourceRequire = createRequire(url);
  const prepared = Object.freeze({ syntheticCheckpoint: true });
  const source = `${await readFile(url, "utf8")}\nexport function seedSyntheticSavedReadback(owner,installation,prepared){
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
  const script = `const readline=require('node:readline'),input=readline.createInterface({input:process.stdin});let terminated=false;
const send=(q,result)=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
input.on('line',line=>{const q=JSON.parse(line);
if(q.action==='launch')send(q,{helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'});
else if(q.action==='send')send(q,{written:true});
else if(q.action==='poll')setTimeout(()=>${malformed ? String.raw`process.stdout.write('malformed\n')` : "send(q,{bytes:''})"},50);
else if(q.action==='saved-readback-abort'){if(q.confirmAbortOriginalSavedReadbackJob!==true)throw Error('confirmation');terminated=true;send(q,{terminationDispatched:true});}
else if(q.action==='termination')send(q,{terminated,originalRootExited:terminated,originalJobEmpty:terminated});
else if(q.action==='release')send(q,{released:true});else throw Error('unexpected '+q.action);});`;
  const child = spawn(process.execPath, ["-e", script], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], pollEntered = Promise.withResolvers<true>(); const originalWrite = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>): boolean => {
    const chunk: unknown = args[0]; if (typeof chunk === "string") { const value: unknown = JSON.parse(chunk);
      assert.ok(value !== null && typeof value === "object" && "action" in value); actions.push(String(value.action)); if (value.action === "poll") { pollEntered.resolve(true); } }
    return originalWrite(...args);
  });
  const executable = Object.freeze({ windowsPath: "C:\\Reviewed\\easyeda-pro.exe", sha256: "a".repeat(64) });
  const plan = Object.freeze({ files: Object.freeze([executable]) }); const installation = Object.freeze({ plan });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked production VM constructor, explicit inert checkpoint seam, real retained synthetic child only.
  const owner = Reflect.construct(Constructor, [child, (): Promise<void> => Promise.resolve(), prepared, installation, (): Promise<void> => Promise.resolve()]) as CurrentPcbViaSavedReadbackOwner;
  Reflect.apply(seed, undefined, [owner, installation, prepared]); owner.start();
  context.after(async () => { if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.startSavedReadbackGeneration();
  return { owner, actions, pollEntered: pollEntered.promise };
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

void test("fresh readback native composition repeats exactly and its current pipe admits only16 discovery requests", async context => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const first = generateWorkerStartupProtocol(source); assert.equal(generateWorkerStartupProtocol(first), first);
  const flags = first.slice(0, first.indexOf("\n")).match(/\[switch\]\$\w+/gu); assert.ok(flags !== null); assert.equal(flags.length, new Set(flags).size);
  assert.equal(first.split("        'saved-readback-abort' {").length - 1, 1);
  assert.ok(first.includes("spatial209?384:componentSpatial209?419:"));
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.main.total, 909); assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.total, 162);
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.enabledDiscovery, 16); assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.cacheDeletionAuthorized, false);
  const input = new PassThrough(), output = new PassThrough(); let requests = 0;
  output.on("data", (bytes: Buffer): void => { const command: unknown = JSON.parse(bytes.subarray(0, -1).toString()); assert.ok(command !== null && typeof command === "object" && "id" in command && "method" in command);
    requests += 1; input.write(Buffer.from(`${JSON.stringify({ id: command.id, result: {} })}\0`)); });
  const pipe = new CurrentPcbViaSavedReadbackPipe(input, output); pipe.start();
  context.after(async () => { const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  for (let index = 0; index < 16; index += 1) { await pipe.getVersion(); }
  await assert.rejects(pipe.getVersion(), /budget/iu); assert.equal(requests, 16);
});

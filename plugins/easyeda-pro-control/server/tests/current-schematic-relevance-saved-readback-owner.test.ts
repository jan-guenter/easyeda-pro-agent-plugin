/* oxlint-disable import/max-dependencies -- The original factory, genuine plan/registration contracts, exact pipe and retained real-child source seam are exercised together. */
/** Source/real byte-pipe checks only. None allocates a native helper or app. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-opening.ts";
import { requireOriginalCurrentSchematicRelevanceSavedRegistrationIntent } from "../src/current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCopyMainBackendRunner } from "../src/current-footprint-copy-main-backend-runner.ts";
import type { CurrentSchematicRelevanceSavedRegistrationIntent } from "../src/current-schematic-relevance-saved-registration-intent.ts";
import assert from "node:assert/strict";
import process from "node:process";
import { once } from "node:events";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import { CurrentSchematicRelevanceSavedReadbackPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentSchematicRelevanceSavedReadbackAllocationOutcome, startCurrentSchematicRelevanceSavedReadbackOwner } from "../src/current-schematic-relevance-saved-readback-owner.ts";
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "../src/generated-schematic-relevance-saved-readback-plan.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as PROFILE } from "../src/current-schematic-relevance-saved-readback-profile.ts";
import { currentSchematicRelevanceSavedEarlyWire } from "../src/current-schematic-relevance-saved-wire.ts";

void test("a copied seven-record saved plan never reaches native factory allocation", async () => {
  let reads = 0;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately foreign runtime input tests the private original-plan registry before allocation.
  const copied = Object.freeze({ get profile(): string { reads += 1; return "private.generated-schematic-relevance-saved-readback-plan.v1"; } }) as GeneratedSchematicRelevanceSavedReadbackPlan;
  const options = Object.freeze({ pluginRoot: "/mnt/c/Synthetic/Plugin", assetsRoot: "/mnt/c/Synthetic/EasyEDA/resources/app/assets", powershellSha256: "a".repeat(64), powershellBytes: 1 });
  await assert.rejects(startCurrentSchematicRelevanceSavedReadbackOwner(options, copied), /SCHEMATIC_RELEVANCE_SAVED_READBACK_ORIGINAL_PLAN/u);
  assert.equal(reads, 0); assert.deepEqual(currentSchematicRelevanceSavedReadbackAllocationOutcome(copied), { state: "not-attempted", owner: null });
});
void test("new schematic saved pipe requires its own early exclusion and admits exactly16 later discovery requests", async context => {
  const input = new PassThrough(), output = new PassThrough(), pipe = new CurrentSchematicRelevanceSavedReadbackPipe(input, output);
  context.after(() => { input.destroy(); output.destroy(); }); const frames: string[] = [];
  output.on("data", (chunk: Buffer) => { const text = chunk.toString("utf8"); frames.push(text);
    const request: unknown = JSON.parse(text.slice(0, -1)); assert.ok(request !== null && typeof request === "object" && "id" in request);
    input.write(`${JSON.stringify({ id: request.id, result: {} })}\0`);
  }); pipe.start();
  await assert.rejects(pipe.getTargets(), /SCHEMATIC_SAVED_FINITE_PIPE_ONLY/u); assert.equal(frames.length, 0);
  pipe.retainSchematicSavedEarlyActors(() => "held");
  for (const stage of ["before", "arm", "after"] as const) { await pipe.observeSchematicSavedEarlyActors(stage); }
  assert.equal(frames.length, 3);
  for (let ordinal = 0; ordinal < 16; ordinal += 1) { await pipe.getTargets(); }
  assert.equal(frames.length, PROFILE.renderer.total); await assert.rejects(pipe.getTargets());
  assert.throws(() => { pipe.retainSchematicSavedEarlyActors(() => "held"); });
  await assert.rejects(pipe.armSavedReadbackCacheActors(), /SAVED_READBACK_ACTORS_CONSUMED/u);
  assert.deepEqual(JSON.parse(frames[1]?.slice(0, -1) ?? "null"), currentSchematicRelevanceSavedEarlyWire(2, "arm"));
  assert.equal(frames.length, 19);
});
void test("production schematic saved owner retains its own child and original early actor cursor through release", async context => {
  const { readFile } = await import("node:fs/promises"), { createRequire } = await import("node:module"), { runInThisContext } = await import("node:vm"), { transform } = await import("esbuild"), { spawn } = await import("node:child_process");
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const source = await readFile(url, "utf8");
  const method = `public async syntheticSchematicEarlyForTest(){const runner={requireOriginalStartupActorPause:()=>{},selectedSqlFenceState:()=>({ready:false})};this.#mainRunner=runner;const capability=Object.freeze({});selectedSqlFenceBootstraps.set(capability,Object.freeze({owner:this,runner:()=>runner,reprove:()=>{}}));try{await this.prepareSchematicSavedEarlyActors(capability,runner);}finally{this.#mainRunner=null;}}
public async syntheticSchematicCacheForTest(){const pipe=this.#pipe;if(!(pipe instanceof CurrentSchematicRelevanceSavedReadbackPipe))throw Error('pipe');const attached=await this.#transfer(async()=>({sessionId:await pipe.attachTarget('synthetic-target',event=>{if(this.#observeSchematicSavedGuardHelper(event))return;if(this.#schematicSavedCache?.metadata.observeOriginalEvent(event))return;})}));const selected=Object.freeze({sessionId:attached.sessionId,uniqueContextId:'synthetic-context',frameId:'synthetic-frame',securityOrigin:'https://client'});this.#stagedAttachment={targetId:'synthetic-target',sessionId:selected.sessionId};this.#stagedContext={modelContext:()=>({sessionId:selected.sessionId}),savedReadbackCacheContext:()=>selected,script:()=>({scriptId:'original-ui',context:{id:7}})};this.#scriptConsumed=true;this.#mainRunner={selectedSqlFenceState:()=>({ready:true}),pumpSelectedSqlFence:async()=>{}};return await this.createSchematicSavedCacheOrigin();}
public syntheticSchematicCacheBindingsForTest(origin){return this.originalSchematicSavedCacheBindings(origin,this.#schematicSavedPrepared);}
public syntheticSchematicClearMainForTest(){this.#mainRunner=null;}
`;
  const prefix = source.replace("async #observeParent(): Promise<RecordValue> {", "async #observeParent(): Promise<RecordValue> { return {};").replace("async #observeOpeningAncillary(): Promise<void> {", "async #observeOpeningAncillary(): Promise<void> { return;");
  const seeded = `${prefix.replace("  public async prepareSchematicSavedEarlyActors(", `${method}\n  public async prepareSchematicSavedEarlyActors(`)}
export function seedSchematicSaved(owner,installation,prepared){const writer={status:()=>({released:true,helperClosed:true})};const closed=Object.freeze({owner:writer,checkpoint:Object.freeze({})});const data=Object.freeze({target:prepared.target});const original=Object.freeze({lifecycle:Object.freeze({}),closed,data});const lookup=value=>{if(value!==prepared)throw Error('synthetic original');return original;};const verifyCheckpoint=async()=>{};const namespace=Object.freeze({requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan:lookup});const checkpointNamespace=Object.freeze({verifyGeneratedSchematicRelevanceDisplayClosedCheckpoint:verifyCheckpoint});const allocation={options:Object.freeze({}),prepared,namespace,lookup,original,checkpointNamespace,verifyCheckpoint,state:'retained',owner,child:null,eofAttempted:false,cleanupFailure:null};schematicSavedReadbackAllocations.set(prepared,allocation);schematicSavedReadbackFactories.set(owner,Object.freeze({allocation,installation}));}`;
  assert.notEqual(seeded, source); const compiled = await transform(seeded, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function"); Reflect.apply(evaluate, undefined, [createRequire(url), loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSchematicRelevanceSavedReadbackOwner"], seed = loaded.exports["seedSchematicSaved"]; assert.ok(typeof Constructor === "function" && typeof seed === "function");
  const helperSource = `(${CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION})`;
  const child = spawn(process.execPath, ["-e", `const helperSource=${JSON.stringify(helperSource)};const lines=require('node:readline').createInterface({input:process.stdin});let queue=[];lines.on('line',line=>{const q=JSON.parse(line),send=result=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');if(q.action==='launch')send({helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'});else if(q.action==='schematic-saved-early-actors'){queue.push({id:q.requestId,result:q.earlyStage==='arm'?{}:{targetInfos:[]}});send({written:true});}else if(q.action==='send'){const result=q.method==='Debugger.getScriptSource'?{scriptSource:helperSource}:{sessionId:'synthetic-session'};const reply={id:q.requestId,result};if(q.sessionId)reply.sessionId=q.sessionId;queue.push(reply);send({written:true});}else if(q.action==='schematic-saved-parent'){queue.push({id:q.requestId,result:{},sessionId:q.sessionId});send({written:true});}else if(q.action==='schematic-saved-preflight'){queue.push({method:'Debugger.scriptParsed',params:{scriptId:'preflight-helper',url:'',executionContextId:7},sessionId:q.sessionId});const data={schema:'easyeda-pro-control.pcb-diagnostic-opening.v1',phase:'preflight',projectUuid:q.targetProjectUuid,branchUuid:q.targetBranchUuid,documentUuid:q.targetDocumentUuid,ok:true,status:'ready',failure:null,dispatchAttempted:false,publicResult:null,prefixObserved:false,nativeWorkMayRemain:false,observation:{projectPresent:false,branchUuid:null,windowTabId:'synthetic-window',containerCount:1,tabIds:[],activeTabId:'tab_page1',initialTitle:'EasyEDA Pro - V3.2.209',expectedOpenedTitle:'EasyEDA Pro - V3.2.209',documentTitle:'EasyEDA Pro - V3.2.209'}};queue.push({id:q.requestId,result:{result:{type:'string',value:JSON.stringify(data)}},sessionId:q.sessionId});send({written:true});}else if(q.action==='schematic-saved-cache'){if(q.savedCachePhase!=='saved-cache-key'||q.frameId!=='synthetic-frame')throw Error('cache-selector');queue.push({id:q.requestId,result:{storageKey:'https://client/'},sessionId:q.sessionId});send({written:true});}else if(q.action==='poll')send({bytes:queue.length?Buffer.from(JSON.stringify(queue.shift())+'\\0').toString('base64'):''});else if(q.action==='normal-close')send({closeDispatched:true,saveOrDiscardSelected:false});else if(q.action==='termination')send({terminated:true,originalRootExited:true,originalJobEmpty:true});else if(q.action==='release')send({released:true});else throw Error('foreign '+q.action);});`], { stdio: ["pipe", "pipe", "pipe"] });
  context.after(async () => { if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  const executable = Object.freeze({ windowsPath: "C:\\Synthetic\\easyeda-pro.exe", sha256: "a".repeat(64) }), installation = Object.freeze({ plan: Object.freeze({ files: Object.freeze([executable]) }) }), prepared = Object.freeze({ syntheticPlan: true, target: Object.freeze({ rawWindowsPath: String.raw`C:\Synthetic\Codex_schematic_relevance_1111111111111111.eprj2`, projectUuid: createHash("sha256").update(String.raw`C:\Synthetic\Codex_schematic_relevance_1111111111111111.eprj2`).digest("hex"), branchUuid: "3".repeat(32), pageUuid: "4".repeat(32), schematicUuid: "5".repeat(32), sourceSha256: "6".repeat(64) }) });
  const raw: unknown = Reflect.construct(Constructor, [child, (): Promise<void> => Promise.resolve(), prepared, installation, (): Promise<void> => Promise.resolve()]); assert.ok(raw !== null && typeof raw === "object");
  Reflect.apply(seed, undefined, [raw, installation, prepared]);
  const originalClose = loaded.exports["originalCurrentSchematicRelevanceSavedReadbackNormalClose"]; assert.ok(typeof originalClose === "function");
  assert.throws(() => Reflect.apply(originalClose, undefined, [raw]), /ORIGINAL_NORMAL_CLOSE/u);
  const invoke = async (name: string): Promise<unknown> => { const fn: unknown = Reflect.get(raw, name); assert.ok(typeof fn === "function"); return await Reflect.apply(fn, raw, []); };
  await invoke("start"); await invoke("startSchematicSavedReadbackGeneration"); await invoke("syntheticSchematicEarlyForTest");
  await assert.rejects(invoke("syntheticSchematicEarlyForTest"), /EARLY_ACTORS_UNAVAILABLE/u); await assert.rejects(invoke("startSchematicSavedReadbackGeneration"), /START_CONSUMED/u);
  const origin = await invoke("syntheticSchematicCacheForTest"); const bindingMethod: unknown = Reflect.get(raw, "syntheticSchematicCacheBindingsForTest"); assert.ok(typeof bindingMethod === "function");
  const bindings: unknown = Reflect.apply(bindingMethod, raw, [origin]); assert.ok(bindings !== null && typeof bindings === "object" && "request" in bindings && typeof bindings.request === "function");
  const requested: unknown = Reflect.apply(bindings.request, bindings, [{ phase: "saved-cache-key", step: "initial" }]); assert.ok(requested instanceof Promise); const packet: unknown = await requested;
  assert.ok(packet !== null && typeof packet === "object" && "nativeOwnershipVerified" in packet && packet.nativeOwnershipVerified === false);
  const publicationMethod: unknown = Reflect.get(raw, "publishSchematicSavedCacheBackup"); assert.ok(typeof publicationMethod === "function"); const publication: unknown = Reflect.apply(publicationMethod, raw, []); assert.ok(publication instanceof Promise);
  assert.equal(Reflect.apply(publicationMethod, raw, []), publication); await assert.rejects(publication); await invoke("syntheticSchematicClearMainForTest");
  const close: unknown = Reflect.get(raw, "requestNormalClose"); assert.ok(typeof close === "function");
  const closing: unknown = Reflect.apply(close, raw, ["12345"]); assert.ok(closing instanceof Promise); await closing;
  const closeToken: unknown = Reflect.apply(originalClose, undefined, [raw]);
  assert.equal(await invoke("observeTermination"), true); const original = await invoke("originalSchematicSavedReadbackTermination"); await invoke("releaseClosed");
  assert.equal(await invoke("originalSchematicSavedReadbackTermination"), original);
  assert.equal(Reflect.apply(originalClose, undefined, [raw]), closeToken);
});

void test("registration-looking JSON cannot supply original pending or no-dispatch proof", () => {
  let reads = 0; const token = Object.freeze({ get profile(): string { reads += 1; return "private.current-schematic-relevance-saved-registration-intent.v1"; } });
  const runner = Object.freeze({ get status(): never { reads += 1; throw new Error("foreign runner getter"); } });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberate foreign token/runner must be rejected at the private WeakMap before their descriptors or callbacks can run.
  assert.throws(() => requireOriginalCurrentSchematicRelevanceSavedRegistrationIntent(token as CurrentSchematicRelevanceSavedRegistrationIntent, runner as unknown as CurrentFootprintCopyMainBackendRunner), /SCHEMATIC_SAVED_REGISTRATION_ORIGINAL/u);
  assert.equal(reads, 0);
});

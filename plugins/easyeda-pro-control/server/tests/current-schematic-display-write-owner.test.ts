/** Production original-owner methods/queues with real synthetic child streams.
 * The explicit lexical allocation + checkpoint seam has no native authority. */
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
import type { CurrentSchematicDisplayWriteOwner } from "../src/current-schematic-display-write-owner.ts";

type GeneratedSchematicDisplayNativeArguments = Parameters<CurrentSchematicDisplayWriteOwner["executeSchematicDisplayStage"]>[1];

function missingBootstrap(): never { throw new Error("Bootstrap not issued"); }
async function fixture(context: TestContext, malformed = false, main = false, stages = false, workers = false, earlyWorker = false): Promise<Readonly<{ owner: CurrentSchematicDisplayWriteOwner; actions: string[]; pollEntered: Promise<true>; reproveBootstrap: () => string;
  target: () => object; termination: () => object; requireTermination: (value: object) => void; argumentsValue: GeneratedSchematicDisplayNativeArguments; requireStage: (packet: object) => void; runWorker: () => Promise<unknown>; createObserver: (origin: object) => { arm: () => Promise<void>; observeBody: () => Promise<unknown> }; requireWorker: (origin: object) => object; createStructureObserver: (origin: object) => { arm: () => Promise<void>; cleanup: () => Promise<void> }; requireStructure: (origin: object) => object }>> {
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const sourceRequire = createRequire(url);
  const targetData = Object.freeze({ rawWindowsPath: String.raw`C:\Synthetic\Codex_schematic_1111111111111111.eprj2`, projectUuid: "c".repeat(64), branchUuid: "d".repeat(32), schematicUuid: "e".repeat(32), pageUuid: "f".repeat(32), expectedSourceSha256: "1".repeat(64) });
  const prepared = Object.freeze({ syntheticCheckpoint: true, qualification: Object.freeze({ target: targetData }) });
  const peers = Array.from({ length: 5 }, (_, i) => Object.freeze({ id: `peer${String(i)}`, type: "LINE" as const, body: Object.freeze({}) }));
  const operation = Object.freeze({ operationId: "sch209-display-original-stage", textId: "text-1", beforeBody: Object.freeze({}), afterBody: Object.freeze({}), peers: Object.freeze(peers) });
  const argumentsValue: GeneratedSchematicDisplayNativeArguments = Object.freeze({ target: targetData, operation });
  let reproveBootstrap: () => string = missingBootstrap;
  const workerSource = workers ? await readFile("/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js", "utf8") : "";
  const source = `${await readFile(url, "utf8")}\nexport function seedSyntheticSchematicAbortOwner(owner,installation,prepared){
const allocation={options:Object.freeze({}),prepared,state:"retained",owner,child:null,eofAttempted:false,cleanupFailure:null};
schematicDisplayAllocations.set(prepared,allocation);schematicDisplayFactories.set(owner,Object.freeze({allocation,installation}));\n}`;
  const stageSource = stages ? source.replace("  public armViaSaveWorker(", `  public async seedSyntheticSchematicStageState(args){
this.#stagedAttachment=Object.freeze({targetId:"original-target",sessionId:"original-session"});this.#scriptConsumed=true;this.#schematicArguments=args;this.#schematicNavigationResult={outcome:"opened-ready"};this.#schematicWindowTabId="original-window";
this.#stagedContext={openingContext:()=>Object.freeze({sessionId:"original-session",uniqueContextId:"original-context"}),assertCurrent(){},observeTarget(){},observeFrames(){},openingAncillaryFrame(){return null;}};
this.#mainRunner={selectedSqlFenceState:()=>Object.freeze({ready:true}),pumpSelectedSqlFence:()=>Promise.resolve()};
await this.#transfer(async()=>({sessionId:await this.#pipe.attachTarget("original-target",()=>{})}));
}
public async runSyntheticSchematicWorker(){this.#enter(true);try{const p=this.#stagedContext.openingContext();await this.#transfer(()=>this.#pipe.observeSchematicDisplay("start",p.uniqueContextId));await this.#prepareSchematicDisplayWorkerParent("original-window");return await this.#transfer(()=>{this.#schematicNavigationDispatchAttempted=true;return this.#pipe.observeSchematicDisplay("navigate",p.uniqueContextId,this.#schematicArguments.target);});}finally{this.#busy=false;}}
  public armViaSaveWorker(`) : source;
  const compiled = await transform(stageSource, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name === "./current-footprint-copy-main-backend-runner.ts" && main) {
      assert.ok(typeof actual === "object" && actual !== null);
      return { ...actual, CurrentFootprintCopyMainBackendRunner: class {
        readonly #transport: object; readonly #token: object;
        public constructor(transport: object, _headAge: unknown, token: object) { this.#transport = transport; this.#token = token; }
        public observe(): Promise<Readonly<{ syntheticConstruction: true }>> {
          const original = loaded.exports["requireCurrentSelectedFileMainSqlFenceBootstrap"]; assert.ok(typeof original === "function");
          reproveBootstrap = (): string => { const result: unknown = Reflect.apply(original, undefined, [this.#token, this.#transport]); assert.ok(typeof result === "string"); return result; };
          assert.equal(reproveBootstrap(), prepared.qualification.target.rawWindowsPath);
          assert.throws(() => Reflect.apply(original, undefined, [structuredClone(this.#token), this.#transport]), /SELECTED_SQL_BOOTSTRAP/u);
          assert.throws(() => Reflect.apply(original, undefined, [this.#token, { ...this.#transport }]), /SELECTED_SQL_BOOTSTRAP/u);
          return Promise.resolve(Object.freeze({ syntheticConstruction: true }));
        }
        public selectedSqlFenceState(): Readonly<Record<string, unknown>> { assert.equal(Object.isFrozen(this.#token), true); return Object.freeze({ syntheticOnly: true }); }
      } };
    }
    if (name === "./current-schematic-display-worker-controller.ts" && workers) {
      assert.ok(typeof actual === "object" && actual !== null);
      // Explicit construction/source-pause seam only. The production owner,
      // Pipe, fixed codecs, observer, callback and original registry run unchanged.
      const factory: unknown = runInThisContext(`(source=>class {
constructor(bindings){this.bindings=bindings;this.source=null;this.child=null;this.busy=false;this.ready=false;this.failed=false;this.points=new Set();this.structurePoints=new Set();}
status(){return{ready:this.ready,pumping:this.busy,failed:this.failed,projectSourceHeld:this.source!==null,originalWorkerSelected:this.child!==null};}
observeEvent(e){if(e.method!=="Target.attachedToTarget")throw Error("unexpected peer event");this.child=Object.freeze({sessionId:e.params.sessionId,targetId:e.params.targetInfo.targetId,url:e.params.targetInfo.url,title:e.params.targetInfo.title});}
observeUiEvent(){return false;}requireHeld(s){if(s!==this.source)throw Error("held");return this.child;}requireOriginal(s,c){if(s!==this.source||c!==this.child)throw Error("original");}
bindSaveBreakpoint(s,r,id){this.requireHeld(s);if(this.points.has(r))throw Error("point");this.points.add(r);}
bindStructureBreakpoint(s,r,id){this.requireHeld(s);if(this.structurePoints.has(r))throw Error("structure point");this.structurePoints.add(r);}
requireStructureArmed(s){this.requireHeld(s);if(this.structurePoints.size!==6)throw Error("structure arm");}
async pump(){if(this.ready||this.busy||this.child===null)return;this.busy=true;try{await this.bindings.bindWorker(this.child);this.source=Object.freeze({scriptId:"project-script",uniqueContextId:"worker-context",executionContextId:7,source});await this.bindings.projectSourceHeld(this.source,this);if(this.points.size!==6)throw Error("missing actual arms");await this.bindings.releaseParentWait();this.ready=true;}catch(e){this.fail();throw e;}finally{this.busy=false;}}
fail(){this.failed=true;this.bindings.fail();}nextSaveEvent(){throw Error("Save attempt required");}reserveSaveResume(){throw Error("no Save");}
})`); assert.ok(typeof factory === "function"); const Constructor: unknown = Reflect.apply(factory, undefined, [workerSource]); assert.ok(typeof Constructor === "function");
      return { ...actual, CurrentSchematicDisplayWorkerController: Constructor };
    }
    if (name === "./generated-schematic-display-source.ts" && stages) { assert.ok(typeof actual === "object" && actual !== null); return { ...actual,
      requireOriginalGeneratedSchematicDisplayNativeArguments: (value: unknown, checkpoint: unknown): void => { assert.equal(value, argumentsValue); assert.equal(checkpoint, prepared); } }; }
    if (name !== "./managed-schematic-fixture-open-checkpoint.ts") { return actual; }
    assert.ok(typeof actual === "object" && actual !== null);
    return { ...actual, assertOriginalGeneratedSchematicFixtureOpenCheckpoint: (value: unknown): void => { assert.equal(value, prepared); },
      verifyGeneratedSchematicFixtureOpenCheckpoint: (value: unknown): Promise<void> => { assert.equal(value, prepared); return Promise.resolve(); } };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSchematicDisplayWriteOwner"], seed = loaded.exports["seedSyntheticSchematicAbortOwner"];
  assert.ok(typeof Constructor === "function" && typeof seed === "function");
  const script = `const readline=require('node:readline'),input=readline.createInterface({input:process.stdin});let terminated=false;const queue=[];let navigation=null,pendingBytes=Buffer.alloc(0);const fs=require("node:fs"),sourceFile="/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js";
const send=(q,result)=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
input.on('line',line=>{const q=JSON.parse(line);
if(q.action==='launch')send(q,{helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'});
else if(q.action==='main-attach')send(q,{attached:true});
else if(q.action==='send'){if(${String(stages)})queue.push({id:q.requestId,result:q.method==='Target.attachToTarget'?{sessionId:'original-session'}:q.method==='Target.getTargets'?{targetInfos:[{targetId:'original-target',type:'page',title:'Start',url:'https://client/editor?cll=warn#',attached:true}]}:{},...(q.sessionId?{sessionId:q.sessionId}:{})});send(q,{written:true});}
else if(q.action==='schematic-display-worker-prepare')send(q,{prepared:true});
else if(q.action==='schematic-display-worker-bind')send(q,{bound:true});
else if(q.action==='schematic-display-worker-parent'){queue.push({id:q.requestId,sessionId:q.sessionId,result:{}});if(${String(earlyWorker)}&&q.phase==='arm')queue.push({method:'Target.attachedToTarget',sessionId:q.sessionId,params:{sessionId:'original-worker',waitingForDebugger:true,targetInfo:{targetId:'worker-target',type:'worker',attached:true,url:'https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0',title:'project_'+'c'.repeat(64)+'_original-window'}}});if(q.phase==='running'){if(navigation===null)throw Error('navigation not retained');queue.push({id:navigation.id,sessionId:navigation.session,result:{result:{type:'object',value:{completed:true}}}});navigation=null;}send(q,{written:true});}
else if(q.action==='schematic-display-worker'){const structure=q.phase.startsWith('project-save-structure-arm-'),role=q.phase.slice(structure?'project-save-structure-arm-'.length:'schematic-save-arm-'.length);const result=q.method==='Debugger.getScriptSource'?{scriptSource:fs.readFileSync(sourceFile,'utf8')}:{breakpointId:(structure?'structure-':'save-')+role,actualLocation:{scriptId:'project-script',lineNumber:structure&&['initialFinally','queuedFinally'].includes(role)?108:110,columnNumber:(structure?{bootstrap:162932,packet:90576,response:90621,callbackReturn:90770,initialFinally:145736,queuedFinally:145680}:{noData:131018,entry:131055,clock:131079,compress:131150,body:131307,result:131355})[role]}};queue.push({id:q.requestId,sessionId:'original-worker',result});send(q,{written:true});}
else if(q.action==='schematic-display-native'&&${String(workers)}&&q.phase==='navigate'){navigation={id:q.requestId,session:q.sessionId};queue.push({method:'Target.attachedToTarget',sessionId:q.sessionId,params:{sessionId:'original-worker',waitingForDebugger:true,targetInfo:{targetId:'worker-target',type:'worker',attached:true,url:'https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0',title:'project_'+'c'.repeat(64)+'_original-window'}}});send(q,{written:true});}
else if(q.action==='schematic-display-native'&&${String(workers)}&&q.phase==='start'){queue.push({id:q.requestId,sessionId:q.sessionId,result:{result:{type:'object',value:{windowTabId:'original-window',documentTitle:'Start'}}}});send(q,{written:true});}
else if(q.action==='schematic-display-native'){const packet=q.phase==='capture'?{type:'object',subtype:'array',className:'Array',description:'Array(2)',objectId:'original-holder'}:{type:'object',value:{schema:'easyeda-pro-control.generated-schematic-display-stage.v1',stage:q.phase,ok:true,dispatchAttempted:false,originalPromiseSettled:false,modifyAttempted:false,modifyAcknowledged:false,saveAttempted:false,saveAcknowledged:false,savePromiseSettled:false,source:'original synthetic source',windowTabId:'original-window',originalContextIntact:true,connectivityVerified:false,sourceVersionAliased:false,workerCompletionVerified:false,structureCompletionVerified:false,persistenceVerified:false,inverseAvailable:false}};queue.push({id:q.requestId,result:{result:packet},sessionId:q.sessionId});send(q,{written:true});}
else if(q.action==='poll'&&${String(stages)}){if(pendingBytes.length===0&&queue.length)pendingBytes=Buffer.from(queue.splice(0).map(v=>JSON.stringify(v)+'\\0').join(''));const part=pendingBytes.subarray(0,32768);pendingBytes=pendingBytes.subarray(part.length);send(q,{bytes:part.toString('base64')});}
else if(q.action==='poll')setTimeout(()=>${malformed ? String.raw`process.stdout.write('malformed\n')` : "send(q,{bytes:''})"},50);
else if(q.action==='schematic-display-abort'){terminated=true;send(q,{terminationDispatched:true});}
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
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked production VM constructor, explicit inert checkpoint/factory seam, real retained synthetic child only.
  const owner = Reflect.construct(Constructor, [child, (): Promise<void> => Promise.resolve(), installation, (): Promise<void> => Promise.resolve()]) as CurrentSchematicDisplayWriteOwner;
  Reflect.apply(seed, undefined, [owner, installation, prepared]); owner.start();
  context.after(async () => { if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  if (stages) { const seedStages: unknown = Reflect.get(owner, "seedSyntheticSchematicStageState"); assert.ok(typeof seedStages === "function"); await Reflect.apply(seedStages, owner, [argumentsValue]); }
  const requireTermination = loaded.exports["assertOriginalCurrentSchematicDisplayWriteTermination"], target = loaded.exports["originalCurrentSchematicDisplayWriteTarget"], termination = loaded.exports["originalCurrentSchematicDisplayWriteTermination"];
  assert.ok(typeof target === "function" && typeof termination === "function" && typeof requireTermination === "function");
  const callObject = (fn: unknown): object => { assert.ok(typeof fn === "function"); const result: unknown = Reflect.apply(fn, undefined, [owner]); assert.ok(typeof result === "object" && result !== null); return result; };
  const originLookup = loaded.exports["requireOriginalCurrentSchematicDisplaySaveWorkerOrigin"]; assert.ok(typeof originLookup === "function");
  const observerUrl = new URL("../src/current-schematic-display-save-observer.ts", import.meta.url); const observerRequire = createRequire(observerUrl);
  const observerCompiled = await transform(await readFile(observerUrl, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const observerModule: { exports: Record<string, unknown> } = { exports: {} }; const evaluateObserver: unknown = runInThisContext(`(function(require,module,exports){${observerCompiled.code}\n})`); assert.ok(typeof evaluateObserver === "function");
  Reflect.apply(evaluateObserver, undefined, [(name: string): unknown => name === "./current-pcb-diagnostic-owner.ts" ? { requireOriginalCurrentSchematicDisplaySaveWorkerOrigin: originLookup } : observerRequire(name) as unknown, observerModule, observerModule.exports]);
  const structureLookup = loaded.exports["requireOriginalCurrentProjectSaveStructureOrigin"]; assert.ok(typeof structureLookup === "function");
  const structureUrl = new URL("../src/current-project-save-structure-observer.ts", import.meta.url); const structureRequire = createRequire(structureUrl);
  const structureCompiled = await transform(await readFile(structureUrl, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const structureModule: { exports: Record<string, unknown> } = { exports: {} }; const evaluateStructure: unknown = runInThisContext(`(function(require,module,exports){${structureCompiled.code}\n})`); assert.ok(typeof evaluateStructure === "function");
  Reflect.apply(evaluateStructure, undefined, [(name: string): unknown => name === "./current-pcb-diagnostic-owner.ts" ? { requireOriginalCurrentProjectSaveStructureOrigin: structureLookup } : structureRequire(name) as unknown, structureModule, structureModule.exports]);
  return { owner, actions, pollEntered: pollEntered.promise, reproveBootstrap: (): string => reproveBootstrap(),
    target: (): object => { const result = callObject(target); assert.equal(result, prepared); return result; },
    termination: (): object => callObject(termination), requireTermination: (value: object): void => { Reflect.apply(requireTermination, undefined, [owner, value]); }, argumentsValue,
    requireStage: (packet: object): void => { const lookup = loaded.exports["requireOriginalSchematicDisplayStage"]; assert.ok(typeof lookup === "function"); Reflect.apply(lookup, undefined, [owner, argumentsValue, packet, "preflight"]); },
    runWorker: (): Promise<unknown> => { const run: unknown = Reflect.get(owner, "runSyntheticSchematicWorker"); assert.ok(typeof run === "function"); const result: unknown = Reflect.apply(run, owner, []); assert.ok(result instanceof Promise); return result; },
    createObserver: (origin: object) => { const Observer = observerModule.exports["CurrentSchematicDisplaySaveObserver"]; assert.ok(typeof Observer === "function");
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime checked production observer; only its fixed central accessor points to the production owner module loaded above.
      return Reflect.construct(Observer, [origin, owner, argumentsValue]) as { arm: () => Promise<void>; observeBody: () => Promise<unknown> }; },
    requireWorker: (origin: object): object => { const value: unknown = Reflect.apply(originLookup, undefined, [origin, owner, argumentsValue]); assert.ok(value !== null && typeof value === "object"); return value; },
    createStructureObserver: (origin: object) => { const Observer = structureModule.exports["CurrentProjectSaveStructureObserver"]; assert.ok(typeof Observer === "function");
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Production observer and real owner issuer, with the same explicit construction/source-pause seam above.
      return Reflect.construct(Observer, [origin, owner, argumentsValue]) as { arm: () => Promise<void>; cleanup: () => Promise<void> }; },
    requireStructure: (origin: object): object => { const value: unknown = Reflect.apply(structureLookup, undefined, [origin, owner, argumentsValue]); assert.ok(value !== null && typeof value === "object"); return value; } };
}
void test("Schematic original abort waits for pending native poll and settles the original busy renderer call without replay", async context => {
  const f = await fixture(context); const original = f.owner.getTargets(), refused = assert.rejects(original);
  await f.pollEntered; assert.equal(f.owner.status().busy, true);
  const abort = f.owner.abortSchematicDisplayWrite(); await assert.rejects(f.owner.abortSchematicDisplayWrite(), /ABORT_CONSUMED/u);
  await abort; await refused; assert.equal(f.owner.status().busy, false);
  assert.deepEqual(f.actions, ["launch", "send", "poll", "schematic-display-abort"]);
  await assert.rejects(f.owner.getTargets()); assert.equal(f.actions.filter(action => action === "send").length, 1);
  assert.equal(f.owner.status().lastTerminationObservation, null); assert.equal(await f.owner.observeTermination(), true);
  await f.owner.releaseClosed(); assert.equal(f.owner.status().released, true); assert.equal(f.owner.status().helperClosed, true);
});
void test("malformed original helper transport stays fail-closed and cannot acquire an abort retry", async context => {
  const f = await fixture(context, true), refused = assert.rejects(f.owner.getTargets()); await f.pollEntered; await refused;
  await assert.rejects(f.owner.abortSchematicDisplayWrite(), /HELPER_FRAMING/u); assert.equal(f.actions.includes("schematic-display-abort"), false);
  assert.equal(f.owner.status().released, false);
});

void test("actual schematic main issuer binds its own original checkpoint path and transport, then refuses after original abort", async context => {
  const f = await fixture(context, false, true); await f.owner.observeFootprintMainConstruction();
  assert.equal(f.reproveBootstrap(), String.raw`C:\Synthetic\Codex_schematic_1111111111111111.eprj2`);
  assert.deepEqual(f.actions, ["launch", "main-attach"]); await f.owner.abortSchematicDisplayWrite();
  assert.throws(f.reproveBootstrap, /MAIN_ORIGINAL_OWNER/u);
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});
void test("original SCH target and exact root/empty-Job closure survive helper release; copied termination refuses", async context => {
  const f = await fixture(context); const target = f.target(); assert.throws(f.termination, /ORIGINAL_TERMINATION/u);
  assert.equal(await f.owner.observeTermination(), false); assert.throws(f.termination, /ORIGINAL_TERMINATION/u);
  await f.owner.abortSchematicDisplayWrite(); assert.throws(f.termination, /ORIGINAL_TERMINATION/u);
  assert.equal(await f.owner.observeTermination(), true); const terminated = f.termination(); f.requireTermination(terminated);
  assert.throws(() => { f.requireTermination(structuredClone(terminated)); }, /ORIGINAL_TERMINATION/u);
  await f.owner.releaseClosed(); assert.equal(f.target(), target); assert.equal(f.termination(), terminated); f.requireTermination(terminated);
});

void test("actual SCH native pipe and original stage registry retain capture/preflight once and keep writer gates closed", async context => {
  const f = await fixture(context, false, false, true);
  assert.deepEqual(await f.owner.executeSchematicDisplayStage("capture", f.argumentsValue), { captured: true });
  const packet = await f.owner.executeSchematicDisplayStage("preflight", f.argumentsValue); f.requireStage(packet);
  assert.throws(() => { f.requireStage(structuredClone(packet)); }, /ORIGINAL_STAGE/u);
  await assert.rejects(f.owner.executeSchematicDisplayStage("preflight", f.argumentsValue), /STAGE_CONSUMED/u);
  await assert.rejects(f.owner.executeSchematicDisplayStage("capture", structuredClone(f.argumentsValue)));
  for (const stage of ["modify", "save"] as const) { await assert.rejects(f.owner.executeSchematicDisplayStage(stage, f.argumentsValue), /SOURCE_WORKER_AND_SQL/u); }
  assert.equal(f.actions.filter(action => action === "schematic-display-native").length, 2);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed(); f.requireStage(packet);
});

void test("production schematic source-held callback issues only its original origin and arms the actual observer before original navigation settles", async context => {
  const f = await fixture(context, false, false, true, true); let original: object | null = null; let armed = false;
  let observer: ReturnType<typeof f.createObserver> | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { original = origin; const selected = f.createObserver(origin); observer = selected; await selected.arm(); armed = true; });
  await f.runWorker(); assert.equal(armed, true); assert.ok(original !== null); const issued = original; const bindings = f.requireWorker(issued); assert.equal(Object.isFrozen(bindings), true);
  assert.throws(() => f.requireWorker(structuredClone(issued)), /ORIGINAL_SAVE_WORKER/u);
  assert.equal(f.actions.filter(action => action === "schematic-display-worker").length, 7); assert.ok(observer !== null);
  const body = Reflect.get(observer, "observeBody"); assert.ok(typeof body === "function"); const pending: unknown = Reflect.apply(body, observer, []); assert.ok(pending instanceof Promise); await assert.rejects(pending, /ORIGINAL_ATTEMPT/u);
  assert.equal(f.actions.filter(action => action === "schematic-display-worker").length, 7);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("selected schematic worker arriving before its original navigation is refused before source callbacks or resume", async context => {
  const f = await fixture(context, false, false, true, true, true); let callbacks = 0;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, (): Promise<void> => { callbacks += 1; return Promise.resolve(); });
  await assert.rejects(f.runWorker(), /SCHEMATIC_DISPLAY_WORKER_PARENT_CHANGED/u); assert.equal(callbacks, 0);
  assert.equal(f.actions.includes("schematic-display-worker-bind"), false); assert.equal(f.actions.includes("schematic-display-worker"), false);
  assert.equal(f.actions.filter(action => action === "schematic-display-worker-parent").length, 1);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("the original SCH source pause arms the real common structure observer with its exact prepared checkpoint", async context => {
  const f = await fixture(context, false, false, true, true); let original: object | null = null; let observer: ReturnType<typeof f.createStructureObserver> | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { original = origin; const selected = f.createStructureObserver(origin); observer = selected; await selected.arm(); });
  await f.runWorker(); assert.ok(original !== null); const issued = original; const bindings = f.requireStructure(issued); assert.equal(Object.isFrozen(bindings), true);
  assert.equal(Reflect.get(bindings, "prepared"), f.target()); assert.throws(() => f.requireStructure(structuredClone(issued)), /ORIGINAL_ORIGIN/u);
  assert.equal(f.actions.filter(action => action === "schematic-display-worker").length, 14); assert.ok(observer !== null);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true);
  const cleanup = Reflect.get(observer, "cleanup"); assert.ok(typeof cleanup === "function"); const closed: unknown = Reflect.apply(cleanup, observer, []); assert.ok(closed instanceof Promise); await closed;
  assert.equal(f.actions.filter(action => action === "schematic-display-worker").length, 14); await f.owner.releaseClosed();
});

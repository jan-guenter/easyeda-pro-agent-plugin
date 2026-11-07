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
void test("distinct Relevance owner retains its own stage packets, closure and original cleanup without a six-record mutation grant", async context => {
  const f = await fixture(context, false, false, true, false, false, false, null, true);
  assert.equal(f.owner.status().profile, "schematic-relevance-display-write209");
  assert.deepEqual(await f.owner.executeSchematicDisplayStage("capture", f.argumentsValue), { captured: true });
  const packet = await f.owner.executeSchematicDisplayStage("preflight", f.argumentsValue); f.requireStage(packet);
  assert.throws(() => { f.requireStage(structuredClone(packet)); }, /ORIGINAL_STAGE/u);
  for (const stage of ["modify", "save"] as const) { await assert.rejects(f.owner.executeSchematicDisplayStage(stage, f.argumentsValue), /SOURCE_WORKER_AND_SQL/u); }
  await assert.rejects(f.owner.enrollSchematicDisplayProducerPrefix(f.argumentsValue), /OWN_MUTATION_ORIGIN/u);
  assert.equal(f.actions.filter(action => action === "schematic-relevance-display-native").length, 2); assert.equal(f.actions.includes("schematic-display-native"), false);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); const termination = f.termination(); f.requireTermination(termination);
  await f.owner.releaseClosed(); assert.equal(f.termination(), termination); f.requireStage(packet);
});
void test("new Relevance source birth issues its own original worker and producer profiles before navigation resumes", async context => {
  const f = await fixture(context, false, false, true, true, false, false, null, true); let original: object | null = null; let producer: object | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { original = origin; await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue);
  f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => { producer = origin; await f.createProducerObserver(origin).arm(); });
  await f.runWorker(); assert.ok(original !== null && producer !== null);
  assert.equal(Reflect.get(original, "profile"), "private.current-schematic-relevance-display-save-worker-origin.v1");
  assert.equal(Reflect.get(producer, "profile"), "private.current-schematic-relevance-display-save-producer-origin.v1");
  const issued = original; f.requireWorker(issued); f.requireProducer(producer); assert.throws(() => { f.requireWorker(structuredClone(issued)); }, /ORIGINAL_SAVE_WORKER/u);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});
void test("Wire birth retains only its own four-stage packets and cleanup; display aliases and Modify/Save stay denied", async context => {
  const f = await fixture(context, false, false, true, false, false, false, null, false, true);
  assert.equal(f.owner.status().profile, "schematic-wire-edit209");
  assert.ok("schema" in f.argumentsValue && f.argumentsValue.schema === "private.generated-schematic-wire-edit-args.v1");
  const args = f.argumentsValue;
  await assert.rejects(f.owner.executeSchematicDisplayStage("capture", args), /ARGUMENT_FAMILY/u);
  assert.deepEqual(await f.owner.executeSchematicWireEditStage("capture", args), { captured: true });
  const packet = await f.owner.executeSchematicWireEditStage("preflight", args); f.requireStage(packet);
  assert.throws(() => { f.requireStage(structuredClone(packet)); }, /ORIGINAL_STAGE/u);
  await assert.rejects(f.owner.executeSchematicWireEditStage("modify", args), /SOURCE_WORKER_AND_SQL/u);
  await assert.rejects(f.owner.executeSchematicDisplayStage("save", args), /ARGUMENT_FAMILY/u);
  await assert.rejects(f.owner.enrollSchematicDisplayProducerPrefix(args), /WIRE_OWN_MUTATION/u);
  assert.equal(f.actions.filter(action => action === "schematic-wire-edit-native").length, 2);
  assert.equal(f.actions.includes("schematic-display-native") || f.actions.includes("schematic-relevance-display-native"), false);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true);
  const termination = f.termination(); f.requireTermination(termination); await f.owner.releaseClosed(); f.requireStage(packet);
});
void test("Wire original worker uses distinct source/producer origins before navigation source release", async context => {
  const f = await fixture(context, false, false, true, true, false, false, null, false, true); let producer: object | null = null, source: object | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { source = origin; await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue);
  f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => { producer = origin; await f.createProducerObserver(origin).arm(); });
  await f.runWorker(); assert.ok(source !== null && producer !== null);
  assert.equal(Reflect.get(source, "profile"), "private.current-schematic-wire-edit-save-worker-origin.v1");
  assert.equal(Reflect.get(producer, "profile"), "private.current-schematic-wire-edit-save-producer-origin.v1");
  f.requireWorker(source); f.requireProducer(producer);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});
async function fixture(context: TestContext, malformed = false, main = false, stages = false, workers = false, earlyWorker = false, intrinsicFault = false, cacheMode: "valid" | "foreign-caller" | "foreign-target" | "promise" | "initial" | "initial-unknown" | "sync-missing-head" | null = null, relevance = false, wireEdit = false): Promise<Readonly<{ owner: CurrentSchematicDisplayWriteOwner; actions: string[]; pollEntered: Promise<true>; reproveBootstrap: () => string;
  target: () => object; termination: () => object; requireTermination: (value: object) => void; argumentsValue: GeneratedSchematicDisplayNativeArguments; requireStage: (packet: object) => void; runWorker: () => Promise<unknown>; createObserver: (origin: object) => { arm: () => Promise<void>; observeBody: () => Promise<unknown> }; requireWorker: (origin: object) => object; requireProducer: (origin: object) => object; createProducerObserver: (origin: object) => { arm: () => Promise<void>; observeHeldCall: () => Promise<object>; continueInitialCacheCall: (packet: object) => Promise<void>; continueInitialSyncCall: (packet: object) => Promise<void>; continuePeriodicSyncCall: (packet: object) => Promise<void>; startupProgress: () => object }; requireProducerCache: (packet: object, origin: object) => object; requireProducerPromise: (packet: object, origin: object) => object; createStructureObserver: (origin: object) => { arm: () => Promise<void>; cleanup: () => Promise<void> }; requireStructure: (origin: object) => object; requireTransport: (origin: object) => object; qualifyEffect: (copyPacket?: boolean) => object; requireEffect: (effect: object) => void; issueClock: (effect: object) => Promise<object>; requireClock: (origin: object) => object; issueAccessor: () => Promise<object>; requireAccessor: (origin: object) => object }>> {
  const seven = relevance || wireEdit;
  function family<const W, const R, const S>(wire: W, sevenValue: R, six: S): W | R | S { if (wireEdit) { return wire; } return relevance ? sevenValue : six; }
  const initialPlan = Object.freeze({ profile: "private.current-generated-initial-flow-cache-plan.v1" });
  const initialData = Object.freeze({ projectUuid: "c".repeat(64), branchUuid: "d".repeat(32), historyUuid: "a".repeat(32), namespace: `project_${"c".repeat(64)}_v6`, documents: ["e", "f"].map(id => ({ documentUuid: id.repeat(32), url: `https://client/dataStr/${"a".repeat(32)}-${id.repeat(32)}`, body: "original-body", sha256: "0".repeat(64) })), headIndex: { url: `https://client/index/v1/${"d".repeat(32)}`, body: "[]", sha256: "0".repeat(64) }, initialSourceSha256: "0".repeat(64), initialLogicalSha256: "0".repeat(64), projectionSourceSha256: "0".repeat(64), nativeWorkerOwnershipVerified: false, cacheContinuationAuthorized: false, completeUploadFrontierVerified: false });
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const sourceRequire = createRequire(url);
  const targetData = Object.freeze({ rawWindowsPath: String.raw`C:\Synthetic\Codex_schematic${seven ? "_relevance" : ""}_1111111111111111.eprj2`, projectUuid: "c".repeat(64), branchUuid: "d".repeat(32), schematicUuid: "e".repeat(32), pageUuid: "f".repeat(32), expectedSourceSha256: "1".repeat(64) });
  const prepared = Object.freeze({ profile: seven ? "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1" : "easyeda-pro-control.generated-schematic-fixture-open-checkpoint.v1", syntheticCheckpoint: true, qualification: Object.freeze({ target: targetData }) });
  const peers = Array.from({ length: seven ? 6 : 5 }, (_, i) => Object.freeze({ id: `peer${String(i)}`, type: "LINE" as const, body: Object.freeze({}) }));
  const operation = Object.freeze({ operationId: relevance ? "sch209-relevance-display-original-stage" : "sch209-display-original-stage", textId: "text-1", beforeBody: Object.freeze({}), afterBody: Object.freeze({}), peers: Object.freeze(peers) });
  let argumentsValue: GeneratedSchematicDisplayNativeArguments;
  if (wireEdit) { argumentsValue = Object.freeze({ schema: "private.generated-schematic-wire-edit-args.v1", target: targetData, operation: Object.freeze({ operationId: "sch209-wire-edit-original-stage", wireId: "wire-1", lineId: "line-1", beforeBody: {}, afterBody: {}, peers, rootIds: ["text-1", "wire-1", "bus-1"] }) }); }
  else { argumentsValue = relevance ? Object.freeze({ schema: "private.generated-schematic-relevance-display-args.v1", target: targetData, operation: Object.freeze({ ...operation, rootIds: Object.freeze(["text-1", "wire-1", "bus-1"]) }) }) : Object.freeze({ target: targetData, operation }); }
  let reproveBootstrap: () => string = missingBootstrap;
  const workerSource = workers ? await readFile("/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js", "utf8") : "";
  const producerModule: unknown = sourceRequire("./current-project-save-producer-source.ts"); assert.ok(producerModule !== null && typeof producerModule === "object"); const producerSites: unknown = Reflect.get(producerModule, "CURRENT_PROJECT_SAVE_PRODUCER_SITES"); assert.ok(producerSites !== null && typeof producerSites === "object");
  const cacheModule: unknown = sourceRequire("./current-project-save-producer-cache-source.ts"); assert.ok(cacheModule !== null && typeof cacheModule === "object"); const cacheCallers: unknown = Reflect.get(cacheModule, "CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS"); assert.ok(cacheCallers !== null && typeof cacheCallers === "object");
  const source = `${await readFile(url, "utf8")}\nexport function seedSyntheticSchematicAbortOwner(owner,installation,prepared,initialPlan){
const allocation={initialBranchPlan:Object.freeze({syntheticBranchPlan:true}),initialCachePlan:${(cacheMode?.startsWith("initial") === true || cacheMode === "sync-missing-head") ? "initialPlan" : "null"},options:Object.freeze({}),prepared,state:"retained",owner,child:null,eofAttempted:false,cleanupFailure:null};
${family("schematicWireEditAllocations", "schematicRelevanceDisplayAllocations", "schematicDisplayAllocations")}.set(prepared,allocation);${family("schematicWireEditFactories", "schematicRelevanceDisplayFactories", "schematicDisplayFactories")}.set(owner,Object.freeze({allocation,installation}));\n}
export function seedSyntheticSchematicEffectPackets(owner,args){const encode=body=>JSON.stringify({type:"DOCHEAD"})+"||"+JSON.stringify({uuid:args.target.pageUuid,docType:"SCH_PAGE"})+"|\\n"+[{id:args.operation.textId,type:"TEXT",body},...args.operation.peers].map((row,index)=>JSON.stringify({id:row.id,type:row.type,ticket:index+1})+"||"+JSON.stringify(row.body)+"|\\n").join("");return["preflight","modify","observe"].map(stage=>{const packet=Object.freeze({schema:"easyeda-pro-control.generated-schematic-display-stage.v1",stage,ok:true,dispatchAttempted:stage==="modify",originalPromiseSettled:stage==="modify",modifyAttempted:stage!=="preflight",modifyAcknowledged:stage!=="preflight",saveAttempted:false,saveAcknowledged:false,savePromiseSettled:false,source:encode(stage==="preflight"?args.operation.beforeBody:args.operation.afterBody),windowTabId:"original-window",originalContextIntact:true,connectivityVerified:false,sourceVersionAliased:false,workerCompletionVerified:false,structureCompletionVerified:false,persistenceVerified:false,inverseAvailable:false});schematicDisplayStagePackets.set(packet,Object.freeze({owner,argumentsValue:args,stage,text:canonicalJson(packet)}));return packet;});}`;
  const stageSource = stages ? source.replace("  public armViaSaveWorker(", `  public async seedSyntheticSchematicStageState(args){
this.#stagedAttachment=Object.freeze({targetId:"original-target",sessionId:"original-session"});this.#scriptConsumed=true;this.#schematicArguments=args;this.#schematicNavigationResult={outcome:"opened-ready"};this.#schematicWindowTabId="original-window";
this.#stagedContext={openingContext:()=>Object.freeze({sessionId:"original-session",uniqueContextId:"original-context"}),assertCurrent(){},observeTarget(){},observeFrames(){},openingAncillaryFrame(){return null;}};
this.#mainRunner={selectedSqlFenceState:()=>Object.freeze({ready:true}),pumpSelectedSqlFence:()=>Promise.resolve()};
await this.#transfer(async()=>({sessionId:await this.#pipe.attachTarget("original-target",()=>{})}));
}
public seedSyntheticSchematicAcknowledgedModify(){this.#schematicStages.add("modify");}
public async runSyntheticSchematicWorker(){this.#enter(true);try{const p=this.#stagedContext.openingContext();await this.#transfer(()=>this.#pipe.observeSchematicDisplay("start",p.uniqueContextId));await this.#prepareSchematicDisplayWorkerParent("original-window");const result=await this.#transfer(()=>{this.#schematicNavigationDispatchAttempted=true;return this.#pipe.observeSchematicDisplay("navigate",p.uniqueContextId,this.#schematicArguments.target);});${cacheMode === null ? "" : 'this.#schematicProducerOriginalProject="original-project";this.#schematicProducerOriginalUploadWrapper="original-wrapper";this.#schematicProducerOriginalUploadCallback="original-callback";'}return result;}finally{this.#busy=false;}}
  public armViaSaveWorker(`) : source;
  const compiled = await transform(stageSource, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name === "./current-schematic-display-operation.ts") {
      assert.ok(actual !== null && typeof actual === "object"); return { ...actual,
        requireCurrentSchematicDisplayOperationArguments: (checkpoint: unknown, value: unknown): void => { assert.equal(checkpoint, prepared); assert.equal(value, argumentsValue); },
        verifyCurrentSchematicDisplayOperationPrepared: (checkpoint: unknown): Promise<void> => { assert.equal(checkpoint, prepared); return Promise.resolve(); } };
    }
    if (name === "./managed-schematic-relevance-fixture-open-checkpoint.ts") {
      assert.ok(actual !== null && typeof actual === "object"); return { ...actual,
        assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint: (value: unknown): void => { assert.equal(seven, true); assert.equal(value, prepared); },
        verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint: (value: unknown): Promise<void> => { assert.equal(seven, true); assert.equal(value, prepared); return Promise.resolve(); } };
    }
    if (name === "./current-generated-initial-flow-cache-plan.ts" && (cacheMode?.startsWith("initial") === true || cacheMode === "sync-missing-head")) {
      assert.ok(actual !== null && typeof actual === "object"); return { ...actual, requireOriginalCurrentGeneratedInitialFlowCachePlan: (candidate: object, actualPrepared: object) => { assert.equal(candidate, initialPlan); assert.equal(actualPrepared, prepared); return initialData; } };
    }
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
constructor(bindings){this.bindings=bindings;this.source=null;this.child=null;this.busy=false;this.ready=false;this.failed=false;this.points=new Set();this.structurePoints=new Set();this.transportPoints=new Set();this.producerGuardPoints=new Map();this.producerObservationPoints=new Map();this.clockPoints=new Set();}
status(){return{ready:this.ready,pumping:this.busy,failed:this.failed,projectSourceHeld:this.source!==null,originalWorkerSelected:this.child!==null};}
observeEvent(e){if(e.method!=="Target.attachedToTarget")throw Error("unexpected peer event");this.child=Object.freeze({sessionId:e.params.sessionId,targetId:e.params.targetInfo.targetId,url:e.params.targetInfo.url,title:e.params.targetInfo.title});}
observeUiEvent(){return false;}requireHeld(s){if(s!==this.source)throw Error("held");return this.child;}requireOriginal(s,c){if(s!==this.source||c!==this.child)throw Error("original");}
bindSaveBreakpoint(s,r,id){this.requireHeld(s);if(this.points.has(r))throw Error("point");this.points.add(r);}
bindStructureBreakpoint(s,r,id){this.requireHeld(s);if(this.structurePoints.has(r))throw Error("structure point");this.structurePoints.add(r);}
bindProducerGuardBreakpoint(s,r,id){this.requireHeld(s);if(this.producerGuardPoints.has(r))throw Error("producer guard point");this.producerGuardPoints.set(r,id);}
requireProducerGuardsArmed(s){this.requireHeld(s);if(this.failed||this.producerGuardPoints.size!==10)throw Error("producer guards");}
originalProducerGuardBreakpoint(s,r){this.requireHeld(s);if(!this.producerGuardPoints.has(r))throw Error("original guard");return this.producerGuardPoints.get(r);}
bindProducerObservationBreakpoint(s,r,id){this.requireHeld(s);if(this.producerObservationPoints.has(r))throw Error("producer observation point");this.producerObservationPoints.set(r,id);}
sealProducerObservation(s){this.requireHeld(s);if(this.producerObservationPoints.size!==31)throw Error("producer observation seal");}
requireProducerObservationArmed(s){this.requireHeld(s);if(this.producerObservationPoints.size!==31)throw Error("producer observation arms");}
originalProducerObservationBreakpoint(s,r){this.requireHeld(s);if(!this.producerObservationPoints.has(r))throw Error("producer observation original point");return this.producerObservationPoints.get(r);}
reserveInitialCacheResume(s,event,role){this.requireHeld(s);if(event!==this.lastProducerEvent||role!=="headEntry"||this.resumeInitial)throw Error("original initial resume");this.resumeInitial=true;}
nextProducerEvent(){if(${JSON.stringify(cacheMode)}==="sync-missing-head"){const top=(${JSON.stringify(producerSites)}).syncEntry;this.lastProducerEvent=Object.freeze({method:"Debugger.paused",sessionId:"original-worker",params:{reason:"other",hitBreakpoints:[this.producerObservationPoints.get("syncEntry")],callFrames:[{callFrameId:"original-sync-frame",functionName:"syncCloud",location:{scriptId:"project-script",lineNumber:top.lineNumber,columnNumber:top.columnNumber},functionLocation:{scriptId:"project-script",lineNumber:top.functionLineNumber,columnNumber:top.functionColumnNumber}},{callFrameId:"original-open-caller",functionName:"open",location:{scriptId:"project-script",lineNumber:110,columnNumber:96941},functionLocation:{scriptId:"project-script",lineNumber:110,columnNumber:94422}}]}});return Promise.resolve(this.lastProducerEvent);}if(this.resumeInitial){this.resumeInitial=false;return Promise.resolve(Object.freeze({method:"Debugger.resumed",sessionId:"original-worker",params:{}}));}if(${JSON.stringify(cacheMode)}===null)throw Error("no producer dispatch");const top=(${JSON.stringify(producerSites)})[${JSON.stringify(cacheMode)}==="promise"?"headPromise":"headEntry"],caller=(${JSON.stringify(cacheCallers)}).flow,location=(p,fn)=>({scriptId:"project-script",lineNumber:p[fn?"functionLineNumber":"lineNumber"],columnNumber:p[fn?"functionColumnNumber":"columnNumber"]+(!fn&&${JSON.stringify(cacheMode)}==="foreign-caller"?1:0)});this.lastProducerEvent=Object.freeze({method:"Debugger.paused",sessionId:"original-worker",params:{reason:"other",hitBreakpoints:[this.producerObservationPoints.get(${JSON.stringify(cacheMode)}==="promise"?"headPromise":"headEntry")],callFrames:[{callFrameId:"original-head-frame",...(${JSON.stringify(cacheMode)}==="promise"?{returnValue:{type:"object",subtype:"promise",className:"Promise",description:"Promise",objectId:"original-frame-promise"}}:{}),location:{scriptId:"project-script",lineNumber:top.lineNumber,columnNumber:top.columnNumber},functionLocation:location(top,true)},{callFrameId:"original-cache-caller-frame",location:location(caller,false),functionLocation:location(caller,true)}]}});return Promise.resolve(this.lastProducerEvent);}
expectSetupHelper(s,program){this.requireHeld(s);if(typeof program!=="string")throw Error("setup helper");}

bindStructureTransportBreakpoint(s,r,id){this.requireHeld(s);if(this.transportPoints.has(r))throw Error("transport point");this.transportPoints.add(r);}
requireStructureTransportArmed(s){this.requireHeld(s);if(this.transportPoints.size!==3)throw Error("transport arm");}
nextStructureTransportEvent(){throw Error("no transport dispatch");}reserveStructureTransportResume(){throw Error("no transport grant");}
bindClockBreakpoint(s,p){this.requireHeld(s);if(this.clockPoints.has(p.role))throw Error("clock point");this.clockPoints.add(p.role);}
requireStructureArmed(s){this.requireHeld(s);if(this.structurePoints.size!==14)throw Error("structure arm");}
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
  const Constructor = loaded.exports[family("CurrentSchematicWireEditOwner", "CurrentSchematicRelevanceDisplayWriteOwner", "CurrentSchematicDisplayWriteOwner")], seed = loaded.exports["seedSyntheticSchematicAbortOwner"];
  assert.ok(typeof Constructor === "function" && typeof seed === "function");
  const clockModule: unknown = sourceRequire("./current-schematic-display-clock-protocol.ts"); assert.ok(clockModule !== null && typeof clockModule === "object");
  const clockSites: unknown = Reflect.get(clockModule, "CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES"); assert.ok(clockSites !== null && typeof clockSites === "object");
  const guardModule: unknown = sourceRequire("./current-project-save-producer-guard-source.ts"); assert.ok(guardModule !== null && typeof guardModule === "object"); const guardSites: unknown = Reflect.get(guardModule, "CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES"); assert.ok(guardSites !== null && typeof guardSites === "object");

  const intrinsicModule: unknown = sourceRequire("./current-native-cache-response-intrinsics.ts"); assert.ok(intrinsicModule !== null && typeof intrinsicModule === "object"); const intrinsicProfiles: unknown = Reflect.get(intrinsicModule, "CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES"); assert.ok(Array.isArray(intrinsicProfiles));
  const script = `const readline=require('node:readline'),input=readline.createInterface({input:process.stdin});let terminated=false;const queue=[];let navigation=null,pendingBytes=Buffer.alloc(0);const fs=require("node:fs"),sourceFile="/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js";
const send=(q,result)=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
input.on('line',line=>{const q=JSON.parse(line);
if(q.action==='launch')send(q,{helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'});
else if(q.action==='main-attach')send(q,{attached:true});
else if(q.action==='send'){if(${String(stages)})queue.push({id:q.requestId,result:q.method==='Target.attachToTarget'?{sessionId:'original-session'}:q.method==='Target.getTargets'?{targetInfos:[{targetId:'original-target',type:'page',title:'Start',url:'https://client/editor?cll=warn#',attached:true}]}:{},...(q.sessionId?{sessionId:q.sessionId}:{})});send(q,{written:true});}
else if(q.action==='schematic-display-accessor'||q.action==='schematic-relevance-display-accessor'){if(q.phase!=='schematic-accessor-callees')throw Error('accessor command');queue.push({id:q.requestId,sessionId:'original-session',result:{result:{type:'object',subtype:'array',className:'Array',description:'Array(26)',objectId:'original-callees'}}});send(q,{written:true});}
else if(q.action==='schematic-display-producer-bind')send(q,{bound:true});
else if(q.action==='schematic-display-producer-observe'){const profiles=(${JSON.stringify(intrinsicProfiles)}),field=(name,value,writable=false,enumerable=false,configurable=true)=>({name,value,writable,enumerable,configurable,isOwn:true});let result;
if(q.phase==='project-save-producer-intrinsics-constructors'||q.phase==='project-save-producer-intrinsics-members'){const count=q.phase.endsWith('-constructors')?4:28;result={result:{type:'object',subtype:'array',className:'Array',description:'Array('+count+')',objectId:count===4?'original-native-constructors':'original-native-members'}};}
else if(q.phase.startsWith('project-save-producer-intrinsics-properties-')){const count=q.phase.endsWith('-constructors')?4:28,values=Array.from({length:count},(_,index)=>profiles.some(p=>p.index===index)?{type:'function',className:'Function',objectId:'native-'+index}:{type:'object',className:'Object',objectId:'native-object-'+index});result={result:[...values.map((value,index)=>field(String(index),value,true,true,true)),field('length',{type:'number',value:count},true,false,false)],internalProperties:[{name:'[[Prototype]]',value:{type:'object',subtype:'array',className:'Array',objectId:'native-array-prototype'}}]};}
else if(q.phase.startsWith('project-save-producer-intrinsics-metadata-')){const index=Number(q.phase.slice('project-save-producer-intrinsics-metadata-'.length)),profile=profiles.find(p=>p.index===index);if(!profile||q.objectId!=='native-'+index)throw Error('original intrinsic slot');const fields=[field('name',{type:'string',value:${String(intrinsicFault)}&&index===1?'Foreign':profile.name}),field('length',{type:'number',value:profile.arity})];if(profile.constructor)fields.push(field('prototype',{type:'object',className:profile.name,description:profile.name,objectId:'native-prototype-'+index},false,false,false));result={result:fields,internalProperties:[{name:'[[Prototype]]',value:{type:'function',className:'Function',description:'function () { [native code] }',objectId:'native-function-prototype'}},{name:'[[Scopes]]',value:{type:'object',subtype:'internal#scopeList',className:'Array',description:'Scopes[0]',objectId:'native-empty-scopes'}}]};}
else if(q.phase==='project-save-producer-intrinsics-reprove')result={result:{type:'boolean',value:true}};
else if(q.phase==='project-save-producer-frame-syncEntry'||q.phase==='project-save-producer-receiver-syncEntry')result={result:{type:'object',subtype:'array',className:'Array',description:'Array(2)',objectId:q.phase.includes('-frame-')?'original-sync-frame-array':'original-sync-joined-array'}};
else if(q.phase==='project-save-producer-properties'&&${JSON.stringify(cacheMode)}==='sync-missing-head')result={result:[field('0',{type:'object',objectId:'original-project'},true,true,true),field('1',{type:'string',value:'a'.repeat(32)},true,true,true),field('length',{type:'number',value:2},true,false,false)],internalProperties:[{name:'[[Prototype]]',value:{type:'object',subtype:'array',className:'Array',objectId:'native-array-prototype'}}]};
else if(q.phase==='project-save-producer-frame-headEntry'||q.phase==='project-save-producer-receiver-headEntry'||q.phase==='project-save-producer-frame-headPromise'||q.phase==='project-save-producer-receiver-headPromise')result={result:{type:'object',subtype:'array',className:'Array',description:'Array('+(${JSON.stringify(cacheMode)}==='promise'?6:4)+')',objectId:q.phase.includes('-frame-')?'original-head-frame-array':'original-head-joined-array'}};
else if(q.phase==='project-save-producer-cache-promise'){if(q.objectId!=='original-frame-promise')throw Error('original return promise');result={result:{type:'object',subtype:'promise',className:'Promise',description:'Promise',objectId:'original-retained-promise'}};}
else if(q.phase==='project-save-producer-cache-promise-properties'){if(q.objectId!=='original-retained-promise')throw Error('original retained promise');result={result:[],internalProperties:[{name:'[[Prototype]]',value:{type:'object',className:'Promise',description:'Promise',objectId:'original-promise-prototype'}},{name:'[[PromiseState]]',value:{type:'string',value:'pending'}},{name:'[[PromiseResult]]',value:{type:'undefined'}}]};}
else if(q.phase==='project-save-producer-properties'){result={result:[field('0',{type:'object',objectId:'original-project-cache'},true,true,true),field('1',{type:'string',value:['initial','initial-unknown'].includes(${JSON.stringify(cacheMode)})?${JSON.stringify(initialData.documents[0]?.url)}:'https://synthetic.invalid/dataStr/original'},true,true,true),field('2',{type:'object',objectId:'original-response'},true,true,true),field('3',{type:'undefined'},true,true,true),...(${JSON.stringify(cacheMode)}==='promise'?[field('4',{type:'number',value:0},true,true,true),field('5',{type:'function',objectId:'original-cache-attempt'},true,true,true)]:[]),field('length',{type:'number',value:${JSON.stringify(cacheMode)}==='promise'?6:4},true,false,false)],internalProperties:[{name:'[[Prototype]]',value:{type:'object',subtype:'array',className:'Array',objectId:'native-array-prototype'}}]};}
else if(q.phase==='project-save-producer-cache-caller-flow'||q.phase==='project-save-producer-cache-receiver-flow'){const count=10;result={result:{type:'object',subtype:'array',className:'Array',description:'Array('+count+')',objectId:q.phase.includes('-caller-')?'original-cache-caller':'original-cache-joined'}};}
else if(q.phase==='project-save-producer-cache-properties'){const values=Array.from({length:10},(_,index)=>index===6||index===7?{type:'string',value:index===6?(['initial','initial-unknown'].includes(${JSON.stringify(cacheMode)})?${JSON.stringify(initialData.documents[0]?.url)}:'https://synthetic.invalid/dataStr/original'):'original-body'}:index===8||index===9?{type:'string',value:index===8?(${JSON.stringify(cacheMode)}==='foreign-target'?'0':'c').repeat(64):'d'.repeat(32)}:{type:'object',objectId:'actual-wrapped-'+index});result={result:[...values.map((value,index)=>field(String(index),value,true,true,true)),field('length',{type:'number',value:10},true,false,false)],internalProperties:[{name:'[[Prototype]]',value:{type:'object',subtype:'array',className:'Array',objectId:'native-array-prototype'}}]};}
else{const role=q.phase.slice('project-save-producer-arm-'.length),site=(${JSON.stringify(producerSites)})[role];if(q.method!=='Debugger.setBreakpoint'||!site)throw Error('producer observation command');result={breakpointId:'observed-'+role,actualLocation:{scriptId:q.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber}};}queue.push({id:q.requestId,sessionId:'original-worker',result});send(q,{written:true});}
else if(q.action==='schematic-display-initial-sync'){const count=q.phase==='initial-sync-module'?6:q.phase==='initial-sync-caller'?2:0;if(count===0||q.method!=='Debugger.evaluateOnCallFrame')throw Error('unexpected original sync command');queue.push({id:q.requestId,sessionId:'original-worker',result:{result:{type:'object',subtype:'array',className:'Array',description:'Array('+count+')',objectId:q.phase==='initial-sync-module'?'original-sync-module':'original-sync-caller'}}});send(q,{written:true});}
else if(q.action==='schematic-display-initial-cache'){let result;if(q.phase==='initial-cache-entry-document-0'){if(q.key!==${JSON.stringify(initialData.documents[0]?.url)}||q.body!=='original-body')throw Error('original initial data');result={result:{type:'boolean',value:true}};}else if(q.phase==='initial-cache-resume-headEntry-0')result=${JSON.stringify(cacheMode)}==='initial-unknown'?{uncertain:true}:{};else throw Error('unexpected initial cache continuation');queue.push({id:q.requestId,sessionId:'original-worker',result});send(q,{written:true});}
else if(q.action==='schematic-display-producer-guard'){const role=q.phase.slice('project-save-producer-guard-'.length),site=(${JSON.stringify(guardSites)})[role];if(q.method!=='Debugger.setBreakpoint'||!site)throw Error('producer guard command');queue.push({id:q.requestId,sessionId:'original-worker',result:{breakpointId:'producer-'+role,actualLocation:{scriptId:q.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber}}});send(q,{written:true});}
else if(q.action==='schematic-display-structure-transport-bind')send(q,{bound:true});
else if(q.action==='schematic-display-structure-transport'){let result;if(q.phase==='project-structure-transport-capture')result={result:{type:'object',subtype:'array',className:'Array',description:'Array(7)',objectId:'original-transport-capture'}};else{const role=q.phase.slice('project-structure-transport-arm-'.length),cols={send:111729,returned:111827,failed:111748};if(q.method!=='Debugger.setBreakpoint'||!(role in cols))throw Error('transport command');result={breakpointId:'transport-'+role,actualLocation:{scriptId:'project-script',lineNumber:103,columnNumber:cols[role]}};}queue.push({id:q.requestId,sessionId:'original-worker',result});send(q,{written:true});}
else if(q.action==='schematic-display-clock-bind')send(q,{bound:true});
else if(q.action==='schematic-display-clock'){const role=q.phase.slice('schematic-clock-arm-'.length),site=(${JSON.stringify(clockSites)})[role];if(q.method!=='Debugger.setBreakpoint'||!site)throw Error('clock command');queue.push({id:q.requestId,sessionId:q.realm==='worker'?'original-worker':'original-session',result:{breakpointId:'clock-'+role,actualLocation:{scriptId:q.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber}}});send(q,{written:true});}
else if(q.action==='schematic-display-worker-prepare')send(q,{prepared:true});
else if(q.action==='schematic-display-worker-bind')send(q,{bound:true});
else if(q.action==='schematic-display-worker-parent'){queue.push({id:q.requestId,sessionId:q.sessionId,result:{}});if(${String(earlyWorker)}&&q.phase==='arm')queue.push({method:'Target.attachedToTarget',sessionId:q.sessionId,params:{sessionId:'original-worker',waitingForDebugger:true,targetInfo:{targetId:'worker-target',type:'worker',attached:true,url:'https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0',title:'project_'+'c'.repeat(64)+'_original-window'}}});if(q.phase==='running'){if(navigation===null)throw Error('navigation not retained');queue.push({id:navigation.id,sessionId:navigation.session,result:{result:{type:'object',value:{completed:true}}}});navigation=null;}send(q,{written:true});}
else if(q.action==='schematic-display-worker'){const structure=q.phase.startsWith('project-save-structure-arm-'),role=q.phase.slice(structure?'project-save-structure-arm-'.length:'schematic-save-arm-'.length);const result=q.phase==='project-save-structure-uploadRelation'?{result:{type:'boolean',value:false}}:q.method==='Debugger.getScriptSource'?{scriptSource:fs.readFileSync(sourceFile,'utf8')}:{breakpointId:(structure?'structure-':'save-')+role,actualLocation:{scriptId:'project-script',lineNumber:structure?({producerUpload:110,producerBase:109,producerCooperation:109,producerSerial:108,producerDebounce:109,producerProject:110,startupEntry:110,startupReturn:110,initialFinally:108,queuedFinally:108}[role]??110):110,columnNumber:(structure?{producerUpload:15488,producerBase:165345,producerCooperation:8762,producerSerial:145582,producerDebounce:163871,producerProject:93449,startupEntry:89848,startupReturn:90030,bootstrap:162932,packet:90576,response:90621,callbackReturn:90770,initialFinally:145736,queuedFinally:145680}:{noData:131018,entry:131055,clock:131079,compress:131150,body:131307,result:131355})[role]}};queue.push({id:q.requestId,sessionId:'original-worker',result});send(q,{written:true});}
else if((q.action==='schematic-wire-edit-native'||q.action==='schematic-display-native'||q.action==='schematic-relevance-display-native')&&${String(workers)}&&q.phase==='navigate'){navigation={id:q.requestId,session:q.sessionId};queue.push({method:'Target.attachedToTarget',sessionId:q.sessionId,params:{sessionId:'original-worker',waitingForDebugger:true,targetInfo:{targetId:'worker-target',type:'worker',attached:true,url:'https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0',title:'project_'+'c'.repeat(64)+'_original-window'}}});send(q,{written:true});}
else if((q.action==='schematic-wire-edit-native'||q.action==='schematic-display-native'||q.action==='schematic-relevance-display-native')&&${String(workers)}&&q.phase==='start'){queue.push({id:q.requestId,sessionId:q.sessionId,result:{result:{type:'object',value:{windowTabId:'original-window',documentTitle:'Start'}}}});send(q,{written:true});}
else if((q.action==='schematic-wire-edit-native'||q.action==='schematic-display-native'||q.action==='schematic-relevance-display-native')){const packet=q.phase==='capture'?{type:'object',subtype:'array',className:'Array',description:'Array(2)',objectId:'original-holder'}:{type:'object',value:{schema:${JSON.stringify(family("easyeda-pro-control.generated-schematic-wire-edit-stage.v1", "easyeda-pro-control.generated-schematic-relevance-display-stage.v1", "easyeda-pro-control.generated-schematic-display-stage.v1"))},stage:q.phase,ok:true,dispatchAttempted:false,originalPromiseSettled:false,modifyAttempted:false,modifyAcknowledged:false,saveAttempted:false,saveAcknowledged:false,savePromiseSettled:false,source:'original synthetic source',windowTabId:'original-window',originalContextIntact:true,connectivityVerified:false,sourceVersionAliased:false,workerCompletionVerified:false,structureCompletionVerified:false,persistenceVerified:false,inverseAvailable:false}};queue.push({id:q.requestId,result:{result:packet},sessionId:q.sessionId});send(q,{written:true});}
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
  Reflect.apply(seed, undefined, [owner, installation, prepared, initialPlan]); owner.start();
  context.after(async () => { if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  if (stages) { const seedStages: unknown = Reflect.get(owner, "seedSyntheticSchematicStageState"); assert.ok(typeof seedStages === "function"); await Reflect.apply(seedStages, owner, [argumentsValue]); }
  const requireTermination = loaded.exports[family("assertOriginalCurrentSchematicWireEditTermination", "assertOriginalCurrentSchematicRelevanceDisplayWriteTermination", "assertOriginalCurrentSchematicDisplayWriteTermination")], target = loaded.exports[family("originalCurrentSchematicWireEditTarget", "originalCurrentSchematicRelevanceDisplayWriteTarget", "originalCurrentSchematicDisplayWriteTarget")], termination = loaded.exports[family("originalCurrentSchematicWireEditTermination", "originalCurrentSchematicRelevanceDisplayWriteTermination", "originalCurrentSchematicDisplayWriteTermination")];
  assert.ok(typeof target === "function" && typeof termination === "function" && typeof requireTermination === "function");
  const callObject = (fn: unknown): object => { assert.ok(typeof fn === "function"); const result: unknown = Reflect.apply(fn, undefined, [owner]); assert.ok(typeof result === "object" && result !== null); return result; };
  const originLookup = loaded.exports["requireOriginalCurrentSchematicDisplaySaveWorkerOrigin"]; assert.ok(typeof originLookup === "function");
  const observerUrl = new URL(relevance ? "../src/current-schematic-relevance-display-save-observer.ts" : "../src/current-schematic-display-save-observer.ts", import.meta.url); const observerRequire = createRequire(observerUrl);
  const observerCompiled = await transform(await readFile(observerUrl, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const observerModule: { exports: Record<string, unknown> } = { exports: {} }; const evaluateObserver: unknown = runInThisContext(`(function(require,module,exports){${observerCompiled.code}\n})`); assert.ok(typeof evaluateObserver === "function");
  Reflect.apply(evaluateObserver, undefined, [(name: string): unknown => name === "./current-pcb-diagnostic-owner.ts" ? { requireOriginalCurrentSchematicDisplaySaveWorkerOrigin: originLookup, assertOriginalCurrentSchematicRelevanceDisplayWriteOwner: loaded.exports["assertOriginalCurrentSchematicRelevanceDisplayWriteOwner"] } : observerRequire(name) as unknown, observerModule, observerModule.exports]);
  const structureLookup = loaded.exports["requireOriginalCurrentProjectSaveStructureOrigin"]; assert.ok(typeof structureLookup === "function");
  const structureUrl = new URL("../src/current-project-save-structure-observer.ts", import.meta.url); const structureRequire = createRequire(structureUrl);
  const structureCompiled = await transform(await readFile(structureUrl, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const structureModule: { exports: Record<string, unknown> } = { exports: {} }; const evaluateStructure: unknown = runInThisContext(`(function(require,module,exports){${structureCompiled.code}\n})`); assert.ok(typeof evaluateStructure === "function");
  Reflect.apply(evaluateStructure, undefined, [(name: string): unknown => name === "./current-pcb-diagnostic-owner.ts" ? { requireOriginalCurrentProjectSaveStructureOrigin: structureLookup } : structureRequire(name) as unknown, structureModule, structureModule.exports]);
  const producerUrl = new URL("../src/current-project-save-producer-observer.ts", import.meta.url); const producerRequire = createRequire(producerUrl);
  const producerCompiled = await transform(await readFile(producerUrl, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const producerModuleLoaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluateProducer: unknown = runInThisContext(`(function(require,module,exports){${producerCompiled.code}\n})`); assert.ok(typeof evaluateProducer === "function");
  Reflect.apply(evaluateProducer, undefined, [(name: string): unknown => name === "./current-pcb-diagnostic-owner.ts" ? loaded.exports : producerRequire(name) as unknown, producerModuleLoaded, producerModuleLoaded.exports]);
  return { owner, actions, pollEntered: pollEntered.promise, reproveBootstrap: (): string => reproveBootstrap(),
    target: (): object => { const result = callObject(target); assert.equal(result, prepared); return result; },
    termination: (): object => callObject(termination), requireTermination: (value: object): void => { Reflect.apply(requireTermination, undefined, [owner, value]); }, argumentsValue,
    requireProducer: (origin: object): object => { const lookup = loaded.exports["requireOriginalCurrentProjectSaveProducerOrigin"]; assert.ok(typeof lookup === "function"); const result: unknown = Reflect.apply(lookup, undefined, [origin, owner, argumentsValue]); assert.ok(result !== null && typeof result === "object"); return result; },
    createProducerObserver: (origin: object) => { const Observer = producerModuleLoaded.exports["CurrentProjectSaveProducerObserver"]; assert.ok(typeof Observer === "function");
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual collector and production Core registry; construction/event data use only the explicitly labelled inert source seam.
      return Reflect.construct(Observer, [origin, owner, argumentsValue]) as { arm: () => Promise<void>; observeHeldCall: () => Promise<object>; continueInitialCacheCall: (packet: object) => Promise<void>; continueInitialSyncCall: (packet: object) => Promise<void>; continuePeriodicSyncCall: (packet: object) => Promise<void>; startupProgress: () => object }; },
    requireProducerCache: (packet: object, origin: object): object => { const lookup = loaded.exports["requireOriginalCurrentProjectSaveProducerCacheNativeCall"]; assert.ok(typeof lookup === "function"); const result: unknown = Reflect.apply(lookup, undefined, [packet, owner, argumentsValue, origin]); assert.ok(result !== null && typeof result === "object"); return result; },
    requireProducerPromise: (packet: object, origin: object): object => { const lookup = loaded.exports["requireOriginalCurrentProjectSaveProducerCachePromiseNativeCall"]; assert.ok(typeof lookup === "function"); const result: unknown = Reflect.apply(lookup, undefined, [packet, owner, argumentsValue, origin]); assert.ok(result !== null && typeof result === "object"); return result; },
    requireStage: (packet: object): void => { const lookup = loaded.exports[family("requireOriginalSchematicWireEditStage", "requireOriginalSchematicRelevanceDisplayStage", "requireOriginalSchematicDisplayStage")]; assert.ok(typeof lookup === "function"); Reflect.apply(lookup, undefined, [owner, argumentsValue, packet, "preflight"]); },
    runWorker: (): Promise<unknown> => { const run: unknown = Reflect.get(owner, "runSyntheticSchematicWorker"); assert.ok(typeof run === "function"); const result: unknown = Reflect.apply(run, owner, []); assert.ok(result instanceof Promise); return result; },
    createObserver: (origin: object) => { const Observer = observerModule.exports[relevance ? "CurrentSchematicRelevanceDisplaySaveObserver" : "CurrentSchematicDisplaySaveObserver"]; assert.ok(typeof Observer === "function");
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime checked production observer; only its fixed central accessor points to the production owner module loaded above.
      return Reflect.construct(Observer, [origin, owner, argumentsValue]) as { arm: () => Promise<void>; observeBody: () => Promise<unknown> }; },
    requireWorker: (origin: object): object => { const value: unknown = Reflect.apply(originLookup, undefined, [origin, owner, argumentsValue]); assert.ok(value !== null && typeof value === "object"); return value; },
    createStructureObserver: (origin: object) => { const Observer = structureModule.exports["CurrentProjectSaveStructureObserver"]; assert.ok(typeof Observer === "function");
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Production observer and real owner issuer, with the same explicit construction/source-pause seam above.
      return Reflect.construct(Observer, [origin, owner, argumentsValue]) as { arm: () => Promise<void>; cleanup: () => Promise<void> }; },
    requireTransport: (origin: object): object => { const lookup = loaded.exports["requireOriginalCurrentProjectStructureTransportOrigin"]; assert.ok(typeof lookup === "function"); const value: unknown = Reflect.apply(lookup, undefined, [origin, owner, argumentsValue]); assert.ok(value !== null && typeof value === "object"); return value; },
    requireStructure: (origin: object): object => { const value: unknown = Reflect.apply(structureLookup, undefined, [origin, owner, argumentsValue]); assert.ok(value !== null && typeof value === "object"); return value; },
    qualifyEffect: (copyPacket = false): object => { const seedPackets = loaded.exports["seedSyntheticSchematicEffectPackets"]; const qualify = loaded.exports["qualifyOriginalGeneratedSchematicDisplayEffect"]; assert.ok(typeof seedPackets === "function" && typeof qualify === "function");
      const packets: unknown = Reflect.apply(seedPackets, undefined, [owner, argumentsValue]); assert.ok(Array.isArray(packets) && packets.length === 3);
      const effect: unknown = Reflect.apply(qualify, undefined, [owner, argumentsValue, copyPacket ? structuredClone(packets[0]) : packets[0], packets[1], packets[2]]); assert.ok(effect !== null && typeof effect === "object"); return effect; },
    requireEffect: (effect: object): void => { const requireEffect = loaded.exports["requireOriginalGeneratedSchematicDisplayEffect"]; assert.ok(typeof requireEffect === "function"); Reflect.apply(requireEffect, undefined, [effect, owner, argumentsValue]); },
    issueClock: async (effect: object): Promise<object> => {
      const ready: unknown = Reflect.get(owner, "seedSyntheticSchematicAcknowledgedModify"); assert.ok(typeof ready === "function"); Reflect.apply(ready, owner, []);
      const cases: unknown = Reflect.get(clockModule, "currentSchematicDisplayClockNativeCases"); const lookup = loaded.exports["requireOriginalCurrentSchematicDisplayClockOrigin"]; assert.ok(typeof cases === "function" && typeof lookup === "function");
      const commands: unknown = Reflect.apply(cases, undefined, []); assert.ok(Array.isArray(commands));
      const run: unknown = Reflect.get(owner, "createSchematicDisplayClockOrigin"); assert.ok(typeof run === "function");
      const result: unknown = await Reflect.apply(run, owner, [argumentsValue, effect, async (origin: object): Promise<void> => {
        const bindings: unknown = Reflect.apply(lookup, undefined, [origin, owner, argumentsValue]); assert.ok(bindings !== null && typeof bindings === "object"); const request: unknown = Reflect.get(bindings, "request"); assert.ok(typeof request === "function");
        for (const raw of commands) { const command: unknown = raw;
          if (command !== null && typeof command === "object" && "phase" in command && command.phase === "schematic-clock-arm") {
            assert.ok("role" in command && typeof command.role === "string"); const site: unknown = Reflect.get(clockSites, command.role); assert.ok(site !== null && typeof site === "object");
            await Reflect.apply(request, undefined, [command, Reflect.get(site, "realm"), false]);
          }
        }
      }]); assert.ok(result !== null && typeof result === "object"); return result;
    },
    requireClock: (origin: object): object => { const lookup = loaded.exports["requireOriginalCurrentSchematicDisplayClockOrigin"]; assert.ok(typeof lookup === "function"); const result: unknown = Reflect.apply(lookup, undefined, [origin, owner, argumentsValue]); assert.ok(result !== null && typeof result === "object"); return result; },
    issueAccessor: async (): Promise<object> => {
      const run: unknown = Reflect.get(owner, relevance ? "createSchematicRelevanceDisplayAccessorOrigin" : "createSchematicDisplayAccessorOrigin"); const lookup = loaded.exports[relevance ? "requireOriginalCurrentSchematicRelevanceDisplayAccessorOrigin" : "requireOriginalCurrentSchematicDisplayAccessorOrigin"]; assert.ok(typeof run === "function" && typeof lookup === "function");
      const module: unknown = sourceRequire("./current-schematic-display-accessor-protocol.ts"); assert.ok(module !== null && typeof module === "object"); const cases: unknown = Reflect.get(module, "currentSchematicDisplayAccessorNativeCases"); assert.ok(typeof cases === "function"); const commands: unknown = Reflect.apply(cases, undefined, []); assert.ok(Array.isArray(commands));
      const original: unknown = commands[0]; assert.ok(original !== null && typeof original === "object" && "params" in original && original.params !== null && typeof original.params === "object"); const params = original.params;
      const result: unknown = await Reflect.apply(run, owner, [argumentsValue, async (origin: object): Promise<void> => {
        const bindings: unknown = Reflect.apply(lookup, undefined, [origin, owner, argumentsValue]); assert.ok(bindings !== null && typeof bindings === "object"); const request: unknown = Reflect.get(bindings, "request"); assert.ok(typeof request === "function");
        const holder: unknown = Reflect.get(bindings, "holderObjectId"); const targetValue: unknown = Reflect.get(bindings, "targetJson"); const operationValue: unknown = Reflect.get(bindings, "operationJson");
        await Reflect.apply(request, undefined, [{ ...original, params: { ...params, objectId: holder, arguments: [{ value: targetValue }, { value: operationValue }] } }, false]);
      }]); assert.ok(result !== null && typeof result === "object"); return result;
    },
    requireAccessor: (origin: object): object => { const lookup = loaded.exports[relevance ? "requireOriginalCurrentSchematicRelevanceDisplayAccessorOrigin" : "requireOriginalCurrentSchematicDisplayAccessorOrigin"]; assert.ok(typeof lookup === "function"); const result: unknown = Reflect.apply(lookup, undefined, [origin, owner, argumentsValue]); assert.ok(result !== null && typeof result === "object"); return result; } };
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
  assert.equal(f.actions.filter(action => action === "schematic-display-worker").length, 22); assert.ok(observer !== null);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true);
  const cleanup = Reflect.get(observer, "cleanup"); assert.ok(typeof cleanup === "function"); const closed: unknown = Reflect.apply(cleanup, observer, []); assert.ok(closed instanceof Promise); await closed;
  assert.equal(f.actions.filter(action => action === "schematic-display-worker").length, 22); await f.owner.releaseClosed();
});

void test("central SCH effect issuance uses its original factory and packet registry, rejecting copied native results and repeated issue", async context => {
  const f = await fixture(context, false, false, true); const effect = f.qualifyEffect(); f.requireEffect(effect);
  assert.equal(Reflect.get(effect, "originalNativeStageProvenanceVerified"), true); assert.throws(() => { f.requireEffect(structuredClone(effect)); }, /ORIGINAL_EFFECT/u);
  assert.throws(() => f.qualifyEffect(), /ORIGINAL_ISSUE_CONSUMED/u);
  const copied = await fixture(context, false, false, true); assert.throws(() => copied.qualifyEffect(true), /ORIGINAL_STAGE/u);
});

void test("actual SCH clock issuer binds its original effect, page holder and suspended-source worker; copied origins cannot join", async context => {
  const f = await fixture(context, false, false, true, true);
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); }); await f.runWorker();
  await f.owner.executeSchematicDisplayStage("capture", f.argumentsValue); const effect = f.qualifyEffect(); const origin = await f.issueClock(effect); const bindings = f.requireClock(origin);
  assert.equal(Object.isFrozen(bindings), true); assert.equal(Reflect.get(bindings, "uiSdkObjectId"), "original-holder"); assert.equal(Reflect.get(bindings, "workerSessionId"), "original-worker");
  assert.throws(() => f.requireClock(structuredClone(origin)), /CLOCK_ORIGINAL/u); await assert.rejects(f.issueClock(effect), /CLOCK_UNAVAILABLE/u);
  assert.equal(f.actions.filter(action => action === "schematic-display-clock").length, 5); assert.equal(f.actions.filter(action => action === "schematic-display-clock-bind").length, 1);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("actual SCH accessor origin substitutes its original holder and target data through the native pipe once", async context => {
  const f = await fixture(context, false, false, true); await f.owner.executeSchematicDisplayStage("capture", f.argumentsValue); await f.owner.executeSchematicDisplayStage("preflight", f.argumentsValue);
  const foreign: unknown = Reflect.get(f.owner, "createSchematicRelevanceDisplayAccessorOrigin"); assert.ok(typeof foreign === "function");
  const foreignCall: unknown = Reflect.apply(foreign, f.owner, [f.argumentsValue, (): Promise<void> => Promise.resolve()]); assert.ok(foreignCall instanceof Promise);
  await assert.rejects(foreignCall, /SCHEMATIC_RELEVANCE_DISPLAY_ORIGINAL_FACTORY/u);
  const origin = await f.issueAccessor(); const bindings = f.requireAccessor(origin); assert.equal(Reflect.get(bindings, "holderObjectId"), "original-holder"); assert.equal(Object.isFrozen(bindings), true);
  assert.throws(() => f.requireAccessor(structuredClone(origin)), /ACCESSOR_ORIGINAL/u); await assert.rejects(f.issueAccessor(), /ACCESSOR_UNAVAILABLE/u);
  assert.equal(f.actions.filter(action => action === "schematic-display-accessor").length, 1);
  await assert.rejects(f.owner.executeSchematicDisplayStage("modify", f.argumentsValue), /SOURCE_WORKER_AND_SQL/u);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("original SCH source callback captures its own transport context and three fixed points before source release", async context => {
  const f = await fixture(context, false, false, true, true); let issued: object | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayStructureTransportWorker(f.argumentsValue, async origin => {
    issued = origin; const binding = f.requireTransport(origin); assert.equal(Object.isFrozen(binding), true); assert.equal(Reflect.get(binding, "prepared"), f.target());
    const request: unknown = Reflect.get(binding, "request"), scriptId: unknown = Reflect.get(binding, "scriptId"), uniqueContextId: unknown = Reflect.get(binding, "uniqueContextId"); assert.ok(typeof request === "function" && typeof scriptId === "string" && typeof uniqueContextId === "string");
    const protocol: unknown = createRequire(import.meta.url)("../src/current-project-structure-transport-protocol.ts"); assert.ok(protocol !== null && typeof protocol === "object"); const examples: unknown = Reflect.get(protocol, "currentProjectStructureTransportNativeCases"); assert.ok(typeof examples === "function"); const commands: unknown = Reflect.apply(examples, undefined, []); assert.ok(Array.isArray(commands));
    for (const raw of commands) { const command: unknown = raw; assert.ok(command !== null && typeof command === "object" && "phase" in command && "params" in command && command.params !== null && typeof command.params === "object");
      if (command.phase === "project-structure-transport-capture") { await Reflect.apply(request, undefined, [{ ...command, params: { ...command.params, uniqueContextId } }, false]); }
      else if (command.phase === "project-structure-transport-arm") { assert.ok("location" in command.params && command.params.location !== null && typeof command.params.location === "object"); await Reflect.apply(request, undefined, [{ ...command, params: { ...command.params, location: { ...command.params.location, scriptId } } }, false]); }
    }
    await assert.rejects(() => { const result: unknown = Reflect.apply(request, undefined, [{ phase: "project-structure-transport-resume", role: "send", method: "Debugger.resume", params: {} }, false]); assert.ok(result instanceof Promise); return result; }, /GRANT_REQUIRED/u);
    assert.throws(() => f.owner.requireSchematicDisplayStructureTransportReady(f.argumentsValue), /READY_REQUIRED/u);
  });
  await f.runWorker(); const original = issued; assert.ok(original !== null); assert.equal(f.owner.requireSchematicDisplayStructureTransportReady(f.argumentsValue), original); assert.throws(() => f.requireTransport(structuredClone(original)), /ORIGINAL_ORIGIN/u);
  assert.equal(f.actions.filter(action => action === "schematic-display-structure-transport").length, 4);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("actual source callback arms every original producer guard before release and cannot enroll without original mode proof", async context => {
  const f = await fixture(context, false, false, true, true);
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue);
  assert.throws(() => f.owner.requireSchematicDisplayProducerPrefixReady(f.argumentsValue), /PREFIX_READY_REQUIRED/u);
  await assert.rejects(f.owner.enrollSchematicDisplayProducerPrefix(f.argumentsValue), /PREFIX_UNAVAILABLE/u);
  await f.runWorker(); assert.equal(f.actions.filter(action => action === "schematic-display-producer-guard").length, 10);
  await f.owner.executeSchematicDisplayStage("capture", f.argumentsValue); await f.owner.executeSchematicDisplayStage("preflight", f.argumentsValue);
  await assert.rejects(f.owner.enrollSchematicDisplayProducerPrefix(f.argumentsValue), /PREFIX_UNAVAILABLE/u);
  assert.equal(f.actions.includes("schematic-display-producer-prefix-enroll"), false);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("original constructor relation must acknowledge true once before prefix references can be retained", async context => {
  const f = await fixture(context, false, false, true, true); let original: object | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { original = origin; await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue); await f.runWorker(); const sourceOrigin = original; assert.ok(sourceOrigin !== null);
  const binding = f.requireStructure(sourceOrigin), request: unknown = Reflect.get(binding, "request"); assert.ok(typeof request === "function");
  const protocol: unknown = createRequire(import.meta.url)("../src/current-project-save-structure-protocol.ts"); assert.ok(protocol !== null && typeof protocol === "object");
  const examples: unknown = Reflect.get(protocol, "currentProjectSaveStructureNativeCases"); assert.ok(typeof examples === "function"); const cases: unknown = Reflect.apply(examples, undefined, []); assert.ok(Array.isArray(cases));
  const command: unknown = cases.find((candidate: unknown) => candidate !== null && typeof candidate === "object" && Reflect.get(candidate, "phase") === "project-save-structure-uploadRelation"); assert.ok(command !== undefined);
  const call = (): Promise<unknown> => { const pending: unknown = Reflect.apply(request, undefined, [command, false]); assert.ok(pending instanceof Promise); return pending; };
  await assert.rejects(call(), /ORIGINAL_CONSTRUCTOR_RELATION/u); const count = f.actions.length;
  await assert.rejects(call(), /RELATION_CONSUMED/u); assert.equal(f.actions.length, count);
  await assert.rejects(f.owner.enrollSchematicDisplayProducerPrefix(f.argumentsValue), /PREFIX_UNAVAILABLE/u);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("actual owner issues one producer origin under source hold and preserves original-Job cleanup without a receiver grant", async context => {
  const f = await fixture(context, false, false, true, true); let issued: object | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  assert.throws(() => { f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, (): Promise<void> => Promise.resolve()); }, /ARM_UNAVAILABLE/u);
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue);
  f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => {
    issued = origin; const binding = f.requireProducer(origin); const receivers: unknown = Reflect.get(binding, "originalReceivers"), request: unknown = Reflect.get(binding, "request"), scriptId: unknown = Reflect.get(binding, "scriptId");
    assert.ok(typeof request === "function" && typeof scriptId === "string" && typeof receivers === "function"); assert.equal(Object.isFrozen(binding), true);
    const intrinsics: unknown = Reflect.get(binding, "originalIntrinsics"); assert.ok(typeof intrinsics === "function"); assert.equal(Reflect.apply(intrinsics, undefined, []), "original-native-members");
    assert.throws(() => Reflect.apply(receivers, undefined, []), /ORIGINAL_CONSTRUCTION_REQUIRED/u);
    const protocol: unknown = createRequire(import.meta.url)("../src/current-project-save-producer-protocol.ts"); assert.ok(protocol !== null && typeof protocol === "object"); const examples: unknown = Reflect.get(protocol, "currentProjectSaveProducerNativeCases"); assert.ok(typeof examples === "function"); const cases: unknown = Reflect.apply(examples, undefined, []); assert.ok(Array.isArray(cases));
    for (const candidate of cases) { const command: unknown = candidate; assert.ok(command !== null && typeof command === "object" && "phase" in command && "params" in command && command.params !== null && typeof command.params === "object");
      if (command.phase === "project-save-producer-arm") { assert.ok("location" in command.params && command.params.location !== null && typeof command.params.location === "object"); await Reflect.apply(request, undefined, [{ ...command, params: { ...command.params, location: { ...command.params.location, scriptId } } }]); }
    }
    const before = f.actions.length, retain: unknown = Reflect.get(binding, "retainHeldCall"); assert.ok(typeof retain === "function");
    assert.throws(() => Reflect.apply(retain, undefined, []), /ORIGINAL_CAPTURE_REQUIRED/u);
    const fixed: unknown = cases.find((value: unknown) => value !== null && typeof value === "object" && Reflect.get(value, "phase") === "project-save-producer-frame"); assert.ok(fixed !== undefined);
    await assert.rejects(() => { const result: unknown = Reflect.apply(request, undefined, [fixed]); assert.ok(result instanceof Promise); return result; }, /ORIGINAL_HELD_EVENT_REQUIRED/u);
    await assert.rejects(() => { const result: unknown = Reflect.apply(request, undefined, [{ phase: "project-save-producer-properties", method: "Runtime.getProperties", params: { objectId: "unissued-frame", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }]); assert.ok(result instanceof Promise); return result; }, /ORIGINAL_PROPERTIES/u);
    assert.equal(f.actions.length, before);
  });
  await f.runWorker(); const original = issued; assert.ok(original !== null); assert.equal(f.actions.filter(action => action === "schematic-display-producer-observe").length, 55);
  assert.throws(() => f.requireProducer(structuredClone(original)), /ORIGINAL_ORIGIN/u);
  const binding = f.requireProducer(original), next: unknown = Reflect.get(binding, "nextEvent"); assert.ok(typeof next === "function");
  const read = (): Promise<unknown> => { const value: unknown = Reflect.apply(next, undefined, []); assert.ok(value instanceof Promise); return value; };
  await assert.rejects(read(), /no producer dispatch/u); const after = f.actions.length;
  await assert.rejects(read(), /ORIGINAL_CONTINUATION_REQUIRED/u); assert.equal(f.actions.length, after);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("original native constructor metadata refusal stops before member inspection or producer-origin setup", async context => {
  const f = await fixture(context, false, false, true, true, false, true); let invoked = false;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue); f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, (): Promise<void> => { invoked = true; return Promise.resolve(); });
  await assert.rejects(f.runWorker(), /CURRENT_NATIVE_FUNCTION_METADATA/u); assert.equal(invoked, false); assert.equal(f.actions.filter(action => action === "schematic-display-producer-observe").length, 3);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("production Core retains only the original cache caller/target capture from its delivered head event", async context => {
  const f = await fixture(context, false, false, true, true, false, false, "valid"); let issued: object | null = null, observer: ReturnType<typeof f.createProducerObserver> | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
    f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue); f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => { issued = origin; observer = f.createProducerObserver(origin); await observer.arm(); });
  await f.runWorker(); const read = (): ReturnType<typeof f.createProducerObserver> | null => observer; const actual = read(); const original = issued; assert.ok(original !== null && actual !== null);
  const packet = await actual.observeHeldCall(); const cache = f.requireProducerCache(packet, original); assert.equal(Reflect.get(cache, "role"), "flow"); assert.equal(Reflect.get(cache, "callerFrameId"), "original-cache-caller-frame");
  assert.throws(() => f.requireProducerCache(structuredClone(packet), original), /ORIGINAL_NATIVE_HELD_CALL/u); await assert.rejects(actual.observeHeldCall(), /HELD_CALL_ONCE/u);
  assert.equal(f.actions.filter(value => value === "schematic-display-producer-observe").length, 61);
  await f.owner.abortSchematicDisplayWrite(); await f.owner.observeTermination(); await f.owner.releaseClosed();
});
void test("production Core refuses foreign cache caller before projection and foreign selected target before marker issuance", async context => {
  for (const mode of ["foreign-caller", "foreign-target"] as const) {
    const f = await fixture(context, false, false, true, true, false, false, mode); let observer: ReturnType<typeof f.createProducerObserver> | null = null;
    f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
    f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
    f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue); f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => { observer = f.createProducerObserver(origin); await observer.arm(); });
    await f.runWorker(); const read = (): ReturnType<typeof f.createProducerObserver> | null => observer; const actual = read(); assert.ok(actual !== null);
    await assert.rejects(actual.observeHeldCall(), mode === "foreign-caller" ? /ORIGINAL_CACHE_CALLER/u : /ORIGINAL_CACHE_CAPTURE_CHANGED/u);
    assert.equal(f.actions.filter(value => value === "schematic-display-producer-observe").length, mode === "foreign-caller" ? 58 : 61);
    await f.owner.abortSchematicDisplayWrite(); await f.owner.observeTermination(); await f.owner.releaseClosed();
  }
});

void test("production Core retains the actual return Promise in its own group before issuing a held marker", async context => {
  const f = await fixture(context, false, false, true, true, false, false, "promise"); let issued: object | null = null, observer: ReturnType<typeof f.createProducerObserver> | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue); f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => { issued = origin; observer = f.createProducerObserver(origin); await observer.arm(); });
  await f.runWorker(); const read = (): ReturnType<typeof f.createProducerObserver> | null => observer; const actual = read(); const original = issued; assert.ok(actual !== null && original !== null);
  const packet = await actual.observeHeldCall(); const promise = f.requireProducerPromise(packet, original); assert.equal(Reflect.get(promise, "objectId"), "original-retained-promise"); assert.equal(Reflect.get(promise, "state"), "pending");
  assert.throws(() => f.requireProducerPromise(structuredClone(packet), original), /ORIGINAL_NATIVE_HELD_CALL/u); assert.equal(f.actions.filter(action => action === "schematic-display-producer-observe").length, 60);
  await f.owner.abortSchematicDisplayWrite(); await f.owner.observeTermination(); await f.owner.releaseClosed();
});

void test("production original cursor requires its retained initial plan and consumes the exact source event before native resume", async context => {
  for (const mode of ["valid", "initial", "initial-unknown"] as const) {
    const f = await fixture(context, false, false, true, true, false, false, mode); let observer: ReturnType<typeof f.createProducerObserver> | null = null;
    f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
    f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
    f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue); f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => { observer = f.createProducerObserver(origin); await observer.arm(); });
    await f.runWorker(); const read = (): ReturnType<typeof f.createProducerObserver> | null => observer; const actual = read(); assert.ok(actual !== null);
    const packet = await actual.observeHeldCall(); await assert.rejects(actual.continueInitialCacheCall(structuredClone(packet)), /ORIGINAL_HELD/u);
    if (mode === "valid") { await assert.rejects(actual.continueInitialCacheCall(packet), /ORIGINAL_PREPARATION/u); assert.equal(f.actions.includes("schematic-display-initial-cache"), false); }
    else if (mode === "initial-unknown") { await assert.rejects(actual.continueInitialCacheCall(packet), /ORIGINAL_RESUME_ACK/u); assert.equal(f.actions.filter(action => action === "schematic-display-initial-cache").length, 2); await assert.rejects(actual.continueInitialCacheCall(packet)); assert.equal(f.actions.filter(action => action === "schematic-display-initial-cache").length, 2); }
    else { await actual.continueInitialCacheCall(packet); assert.equal(f.actions.filter(action => action === "schematic-display-initial-cache").length, 2); await assert.rejects(actual.continueInitialCacheCall(packet), /ORIGINAL_HELD/u); }
    await f.owner.abortSchematicDisplayWrite(); await f.owner.observeTermination(); await f.owner.releaseClosed();
  }
});

void test("production original sync cursor reaches only its fixed source frames and refuses an unissued initial cache head before resume", async context => {
  const f = await fixture(context, false, false, true, true, false, false, "sync-missing-head"); let observer: ReturnType<typeof f.createProducerObserver> | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue); f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => { observer = f.createProducerObserver(origin); await observer.arm(); });
  await f.runWorker(); const read = (): ReturnType<typeof f.createProducerObserver> | null => observer; const actual = read(); assert.ok(actual !== null);
  const packet = await actual.observeHeldCall(); await assert.rejects(actual.continueInitialSyncCall(structuredClone(packet)), /ORIGINAL_HELD/u);
  await assert.rejects(actual.continueInitialSyncCall(packet), /INITIAL_CACHE_ORIGINAL_JOB/u);
  assert.equal(f.actions.filter(action => action === "schematic-display-initial-sync").length, 2); assert.equal(f.actions.includes("schematic-display-initial-sync-complete"), false);
  await assert.rejects(actual.continueInitialSyncCall(packet)); assert.equal(f.actions.filter(action => action === "schematic-display-initial-sync").length, 2);
  await f.owner.abortSchematicDisplayWrite(); await f.owner.observeTermination(); await f.owner.releaseClosed();
});

void test("production periodic route refuses before dispatch until its same original initial sync has completed", async context => {
  const f = await fixture(context, false, false, true, true, false, false, "sync-missing-head"); let observer: ReturnType<typeof f.createProducerObserver> | null = null;
  f.owner.armSchematicDisplaySaveWorker(f.argumentsValue, async origin => { await f.createObserver(origin).arm(); });
  f.owner.armSchematicDisplaySaveStructureWorker(f.argumentsValue, async origin => { await f.createStructureObserver(origin).arm(); });
  f.owner.armSchematicDisplayProducerPrefixWorker(f.argumentsValue); f.owner.armSchematicDisplayProducerObservationWorker(f.argumentsValue, async origin => { observer = f.createProducerObserver(origin); await observer.arm(); });
  await f.runWorker(); const read = (): ReturnType<typeof f.createProducerObserver> | null => observer; const actual = read(); assert.ok(actual !== null);
  assert.deepEqual(actual.startupProgress(), { initialCache: null, initialSync: null, periodicSync: null, executionAuthorized: false });
  const packet = await actual.observeHeldCall(); await assert.rejects(actual.continuePeriodicSyncCall(structuredClone(packet)), /ORIGINAL_HELD/u);
  await assert.rejects(actual.continuePeriodicSyncCall(packet), /GENERATED_INITIAL_SYNC_ORIGINAL_CALL/u); assert.equal(f.actions.includes("schematic-display-periodic-sync"), false);
  await assert.rejects(actual.continuePeriodicSyncCall(packet)); assert.equal(f.actions.includes("schematic-display-periodic-sync-complete"), false);
  await f.owner.abortSchematicDisplayWrite(); await f.owner.observeTermination(); await f.owner.releaseClosed();
});

void test("seven-record accessor origin retains its own original holder and cannot enter the six-record issuer", async context => {
  const f = await fixture(context, false, false, true, false, false, false, null, true);
  await f.owner.executeSchematicDisplayStage("capture", f.argumentsValue); await f.owner.executeSchematicDisplayStage("preflight", f.argumentsValue);
  await assert.rejects(f.owner.createSchematicDisplayAccessorOrigin(f.argumentsValue, (): Promise<void> => Promise.resolve()), /OWN_MUTATION_ORIGIN/u);
  const origin = await f.issueAccessor(); assert.equal(Reflect.get(origin, "profile"), "private.current-schematic-relevance-display-accessor-origin.v1");
  assert.equal(Reflect.get(f.requireAccessor(origin), "holderObjectId"), "original-holder");
  assert.throws(() => f.requireAccessor(structuredClone(origin)), /ACCESSOR_ORIGINAL/u); await assert.rejects(f.issueAccessor(), /ACCESSOR_UNAVAILABLE/u);
  assert.equal(f.actions.filter(action => action === "schematic-relevance-display-accessor").length, 1); assert.equal(f.actions.includes("schematic-display-accessor"), false);
  await f.owner.abortSchematicDisplayWrite(); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

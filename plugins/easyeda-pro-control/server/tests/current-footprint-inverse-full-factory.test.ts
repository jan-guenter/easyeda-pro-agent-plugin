/* oxlint-disable import/max-dependencies -- These focused factory fixtures run the original owner and resource ledger together to verify mounted routing. */
/** Actual full-successor factory and private source-kind guard in an inert
 * realm. Only checkpoint/native-process custody is synthetic; these fixtures
 * create no helper, Job, process handle, application or execution authority. */
import { currentFootprintInverseStartupDrainMaximumPauses, drainCurrentFootprintInverseStartup } from "../src/current-footprint-inverse-startup-drain.ts";
import assert from "node:assert/strict";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY, CurrentFootprintCopyHeldSavedResourceLedger, requireOriginalHeldSavedLedgerBinding } from "../src/current-footprint-copy-held-saved-capacity.ts";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {test} from "node:test";
import {types} from "node:util";
import vm from "node:vm";
import {currentFootprintInverseFullAllocationOutcome as outcome,startCurrentFootprintInverseFullNativeContinuationV4Owner as start} from "../src/current-pcb-diagnostic-owner.ts";
import {CurrentProjectSaveStructureObserver} from "../src/current-footprint-inverse-v4-structure-observer.ts";
import {canonicalJson} from "../src/core.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE as V4_PROFILE} from "../src/current-footprint-inverse-native-continuation-v4-profile.ts";


void test("real full factory retains an unissued preparation failure and allocates no helper",async()=>{
 const prepared=Object.freeze({profile:"private.current-footprint-inverse-full-preparation.v1" as const});
 const pending=start(prepared);assert.equal(start(prepared),pending);await assert.rejects(pending);
 assert.equal(start(prepared),pending);assert.deepEqual(outcome(prepared),{profile:"private.current-footprint-inverse-full-allocation.v1",state:"no-resource",owner:null,helperClosed:false,eofAttempted:false});
});
function originalFunction(source:string,name:string):string{
 let begin=source.indexOf(`function ${name}(`);
 const end=source.indexOf("\n}",begin);
 assert.ok(begin!==-1&&end>begin,`Missing original function ${name}`);if(source.slice(begin-6,begin)==="async "){begin-=6;}return source.slice(begin,end+2);
}
async function fixture():Promise<vm.Context>{
 const source=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");
 const fixed='await import("./current-footprint-inverse-full-preparation.ts")';
 let program=`${originalFunction(source,"requireFootprintInverseV4Preparation")}\n${originalFunction(source,"startCurrentFootprintInverseFullNativeContinuationV4Owner")}`;
 assert.equal(program.split(fixed).length,2);program=program.replace(fixed,"await Promise.resolve(fixtureCheckpointModule)");
 const context=vm.createContext({assert,types,error:(code:string):Error=>new Error(code),CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE:V4_PROFILE});
 vm.runInContext(`
 const prepared=Object.freeze({profile:"private.current-footprint-inverse-full-preparation.v1"}),options={},events=[];
 const writer={},saved={status(){return {released:true,helperClosed:true}}};
 const prior={writer,owner:saved},fullPreparation={prior};
 const footprintInverseFullAttempts=new WeakMap(),footprintInverseFullAllocations=new WeakMap(),footprintInverseV4Tokens=new WeakMap(),footprintInverseCompilerLayouts=new WeakMap(),footprintInverseV4Factories=new WeakMap(),forwardWriterCompleteOwners=new WeakMap();
 const footprintInverseHistoricalAllocations=new WeakMap(),footprintForwardExecutionFactoryOptions=new WeakMap();
 forwardWriterCompleteOwners.set(writer,{options});
 let verifyFailure=false,verifyCause=undefined;
 const fixtureCheckpointModule={
  requireOriginalCurrentFootprintInverseFullPreparation(value){assert.equal(value,prepared);return fullPreparation},
  verifyCurrentFootprintInverseFullPreparation(value){assert.equal(value,prepared);events.push("verify");return verifyFailure?Promise.reject(verifyCause):Promise.resolve()},
 };
 class CurrentFootprintInverseNativeOwner{
  waitFootprintCombinedReady(){events.push("ready");return Promise.resolve()}
  closeFootprintCombinedBeforeLaunch(){events.push("close-unused");return Promise.resolve()}
 }
 function assertOriginalCurrentFootprintInverseFullNativeContinuationV4Owner(owner){assert.ok(owner instanceof CurrentFootprintInverseNativeOwner);assert.equal(footprintInverseV4Factories.get(owner).allocation.nativeContinuation,"v4")}
 function startFixedOwner(selected,purpose,generation,...args){
  assert.equal(selected,options);assert.equal(purpose,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE.purpose);assert.equal(generation,"209-footprint-inverse-native-continuation-v4");
  const allocation=args.at(-1);assert.equal(allocation.sourceKind,"full");assert.equal(allocation.prepared,prepared);
  assert.equal(footprintInverseFullAllocations.get(prepared),allocation);assert.equal(footprintInverseHistoricalAllocations.has(prepared),false);assert.equal(footprintForwardExecutionFactoryOptions.has(writer),false);
  requireFootprintInverseV4Preparation(allocation);events.push("allocate");
  const owner=new CurrentFootprintInverseNativeOwner;allocation.owner=owner;allocation.state="retained";footprintInverseV4Factories.set(owner,{allocation});return Promise.resolve(owner);
 }
 function closeForwardExecutionOwnerlessBirth(){throw Error("no child exists in this fixture")}
 `,context);
 vm.runInContext(stripTypeScriptTypes(program),context);return context;
}
async function run(context:vm.Context,body:string):Promise<void>{
 const pending:unknown=vm.runInContext(`(async()=>{${body}})()`,context);assert.ok(types.isPromise(pending));await pending;
}
void test("actual full-source factory selects its own original options/map and exact V4 before allocation",async()=>{
 const context=await fixture();
 await run(context,`
 const pending=startCurrentFootprintInverseFullNativeContinuationV4Owner(prepared);
 assert.equal(startCurrentFootprintInverseFullNativeContinuationV4Owner(prepared),pending);
 const owner=await pending;assertOriginalCurrentFootprintInverseFullNativeContinuationV4Owner(owner);
 assert.deepEqual(events,["verify","allocate","ready","verify"]);
 assert.equal(startCurrentFootprintInverseFullNativeContinuationV4Owner(prepared),pending);
 `);
});
void test("actual full-source pre-I/O refusal retains raw undefined and never replays the failed allocation attempt",async()=>{
 const context=await fixture();
 await run(context,`
 verifyFailure=true;verifyCause=undefined;
 const pending=startCurrentFootprintInverseFullNativeContinuationV4Owner(prepared),observed=pending.then(()=>{throw Error("expected raw refusal")},reason=>({reason}));
 assert.equal((await observed).reason,undefined);
 assert.equal(startCurrentFootprintInverseFullNativeContinuationV4Owner(prepared),pending);assert.deepEqual(events,["verify"]);
 assert.equal(footprintInverseFullAllocations.get(prepared).state,"no-resource");
 `);
});

void test("full inverse data cannot enter generated publication or create an observer from matching origin labels",async()=>{
 const source=await readFile(new URL("../src/current-footprint-inverse-v4-structure-observer.ts",import.meta.url),"utf8");
 const a=source.indexOf('function inversePreparedProfile('),b=source.indexOf('\nfunction need(',a);
 const c=source.indexOf('  #generatedPrepared():'),d=source.indexOf('\n  async #observeConstruction(',c);
 assert.ok(a!==-1&&b>a&&c!==-1&&d>c);
 const context=vm.createContext({assert});
 const script=`${source.slice(a,b)}\nfunction need(value,code){if(!value)throw Error(code)}\nclass Fixture{#binding;constructor(prepared){this.#binding={prepared}}read(){return this.#generatedPrepared()}${source.slice(c,d)}}`;
 vm.runInContext(stripTypeScriptTypes(script),context);
 vm.runInContext(`
 for(const profile of ["private.current-footprint-forward-saved-checkpoint.v1","private.current-footprint-inverse-full-preparation.v1"]){assert.throws(()=>new Fixture({profile}).read(),/GENERATED_PUBLICATION_PROFILE_REQUIRED/)}
 const generated={profile:"easyeda-pro-control.generated-fixture-open-checkpoint.v1"};
 assert.equal(new Fixture(generated).read(),generated);
 `,context);
 assert.throws(()=>Reflect.construct(CurrentProjectSaveStructureObserver,[{profile:"private.current-footprint-inverse-structure-origin.v1"},{},{profile:"private.current-footprint-inverse-full-preparation.v1"}]));
});

void test("actual inverse Main bootstrap resolves its original full source without entering historical owner maps",async()=>{
 const source=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");
 const a=source.indexOf("  public async observeFootprintMainConstruction(");
 const b=source.indexOf("    if (this.#purpose===CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE.purpose) {",a);
 const c=source.indexOf("    if (this.#purpose === CURRENT_FOOTPRINT_INVERSE_NATIVE_PURPOSE)",b);

 assert.ok(a!==-1&&b>a&&c>b);
 // Private owner/installation custody is explicitly synthetic. The actual
 // Native source selector and actual Main bootstrap block execute unchanged.
 const block=source.slice(b,c).replaceAll("this.#","this.");
 const context=vm.createContext({assert,canonicalJson,CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE:V4_PROFILE,error:(code:string):Error=>new Error(code)});
 vm.runInContext(`
 const fullSavedOwner={},runner={},prepared={},originalMain={},transport={};
 const checkpoint={source:"/synthetic/full-source.epro",checkpointSha256:"a".repeat(64),sourceSha256:"b".repeat(64)};
 const inventory={checkpointSha256:checkpoint.checkpointSha256};
 const prior={owner:fullSavedOwner,snapshot:{checkpoint,inventory},inventory,projection:{}};
 const selected={projectUuid:"c".repeat(64),branchUuid:"d".repeat(32),footprintUuid:"e".repeat(16)};
 const fullSource=Object.freeze({operationId:"synthetic-full-operation",source:checkpoint.source,runtime:{},
  target:Object.freeze({...selected,documentUuid:"f".repeat(16),rawWindowsPath:"C:\\\\Fixture\\\\synthetic.epro"})});
 const allocation={sourceKind:"full",prepared,source:null,requireCheckpoint(value){assert.equal(value,prepared);return {prior}}};
 const footprintInverseV4Factories=new WeakMap(),selectedSqlFenceBootstraps=new WeakMap();
 class CurrentFootprintInverseNativeOwner{
  purpose=CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE.purpose;mainRunner=runner;requireFootprintMain(value){assert.equal(value,true);return originalMain}
 }
 const owner=new CurrentFootprintInverseNativeOwner;footprintInverseV4Factories.set(owner,{allocation});
 function assertOriginalCurrentFootprintInverseV4NativeOwner(value){assert.equal(value,owner)}
 function requireFootprintInverseV4Preparation(value){assert.equal(value,allocation);return prior}
 function originalCurrentFootprintForwardWriterHeldSavedNativeTarget(value){assert.equal(value,fullSavedOwner);return fullSource}
 function originalCurrentFootprintCopyNativeTarget(){throw new Error("historical owner registry refused")}
 function currentFootprintCopyV2SavedTarget(value){assert.equal(value,prior.projection);return selected}
 function inversePurpose(value){return value===CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE.purpose}
 `,context);
 vm.runInContext(stripTypeScriptTypes(originalFunction(source,"originalCurrentFootprintInverseV4NativeSource")),context);
 vm.runInContext(stripTypeScriptTypes(`function bindMain(){let selectedBootstrap;${block}return selectedBootstrap}`),context);
 vm.runInContext(`
 const native=originalCurrentFootprintInverseV4NativeSource(owner);assert.equal(native.target.documentUuid,selected.footprintUuid);
 assert.equal(originalCurrentFootprintInverseV4NativeSource(owner),native);
 const bootstrap=bindMain.call(owner),binding=selectedSqlFenceBootstraps.get(bootstrap);
 assert.equal(binding.owner,owner);assert.equal(binding.runner(),runner);assert.equal(binding.path,fullSource.target.rawWindowsPath);
 assert.doesNotThrow(()=>binding.reprove());
 assert.throws(()=>originalCurrentFootprintCopyNativeTarget(fullSavedOwner),/historical owner registry refused/);
 `,context);
});

void test("actual Main startup callback selects only its original V4 actor method and refuses copied or wrong-runner bootstraps",async()=>{
 const source=await readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8");
 const context=await fixture();
 // Native instance/process custody is synthetic.
 // Complete original selector and shared Main callback bodies execute below.
 vm.runInContext(`
 class CurrentPcbViaSavedReadbackOwner{}
 class CurrentSchematicRelevanceSavedReadbackOwner{}
 const selectedSqlFenceBootstraps=new WeakMap(),actorCalls=[];
 function assertOriginalCurrentFootprintInverseV4NativeOwner(owner){assertOriginalCurrentFootprintInverseFullNativeContinuationV4Owner(owner)}
 `,context);
 vm.runInContext(stripTypeScriptTypes(`${originalFunction(source,"isOriginalCurrentFootprintInverseV4MainSqlFenceBootstrap")}\n${originalFunction(source,"prepareOriginalCurrentSelectedFileStartupActors")}`),context);
 await run(context,`
 const owner=await startCurrentFootprintInverseFullNativeContinuationV4Owner(prepared),bootstrap={};
 const runner={requireOriginalStartupActorPause(value){assert.equal(value,bootstrap)}};
 owner.prepareFootprintInverseV4EarlyActors=async(value,selected)=>{assert.equal(value,bootstrap);assert.equal(selected,runner);actorCalls.push("v4")};
 owner.prepareFootprintInverseEarlyActors=()=>{throw Error("historical actor method selected")};
 selectedSqlFenceBootstraps.set(bootstrap,{owner,runner:()=>runner,reprove(){assertOriginalCurrentFootprintInverseFullNativeContinuationV4Owner(owner)}});
 assert.equal(isOriginalCurrentFootprintInverseV4MainSqlFenceBootstrap({},runner),false);
 await prepareOriginalCurrentSelectedFileStartupActors(bootstrap,runner);assert.deepEqual(actorCalls,["v4"]);
 await assert.rejects(prepareOriginalCurrentSelectedFileStartupActors(bootstrap,{}),/ORIGINAL_BOOTSTRAP/);
 assert.throws(()=>isOriginalCurrentFootprintInverseV4MainSqlFenceBootstrap(bootstrap,{}),/ORIGINAL_RUNNER/);
 assert.deepEqual(actorCalls,["v4"]);
 `);
});

void test("actual finite grammar refuses new V4 phases in the released inverse mode before downstream work",async()=>{
 const source=await readFile(new URL("../src/current-pcb-diagnostic-pipe.ts",import.meta.url),"utf8");
 const method=source.indexOf("#request(command:");
 const begin=source.indexOf("    if (this.#inversePurpose) {",method);
 const end=source.indexOf("\n    }\n",begin);assert.ok(method!==-1&&begin>method&&end>begin);
 // Execute only the complete actual finite-admission block.
 // This negative grammar fixture models no original owner, token, process or native pipe.
 const block=source.slice(begin,end+6),context=vm.createContext({delivered:0});
 vm.runInContext(`class LegacyFiniteGrammarFixture{#inversePurpose=true;#inverseNativeLifecycle=false;#inverseNativeContinuationV4=false;send(command,phase){${block}globalThis.delivered+=1}}const grammar=new LegacyFiniteGrammarFixture`,context);
 for(const [phase,marker]of [
  ["inverse-native-get-task-result","inverseNativeGetTaskResult"],
  ["inverse-native-reference-worker","inverseNativeReferenceWorker"],
  ["inverse-native-delete-upload","inverseNativeDeleteUpload"],
  ["inverse-native-delete-return","inverseNativeDeleteReturn"],
 ]as const){
  assert.throws(()=>vm.runInContext(`grammar.send({method:"Runtime.callFunctionOn",${marker}:true},${JSON.stringify(phase)})`,context),/FOOTPRINT_INVERSE_FINITE_PIPE_ONLY/u);
 }
 assert.equal(vm.runInContext("delivered",context),0);
});

void test("actual V4 helper router binds only its pending fixed helper in the original UI context", async () => {
  const source = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  const begin = source.indexOf("  #observeFootprintInverseV4Helper(");
  const end = source.indexOf("\n  #observeNativeDeleteUiDirect(", begin);
  assert.ok(begin !== -1 && end > begin);
  const context = vm.createContext({ assert });
  vm.runInContext(stripTypeScriptTypes(`
    const error = code => new Error(code);
    const diagnosticToken = value => typeof value === "string" && /^[a-z0-9-]+$/.test(value);
    class HelperRouterFixture {
      #inverseV4Helper;
      #inverseV4NativeDeleteBootstrapHelper;
      #inverseV4NativeDeleteQualificationHelper;
      #inverseV4NativeDeleteBootstrapCommand;
      #inverseV4NativeDeleteQualificationCommand;
      #inverseV4PublicObservationCutoff;
      #stagedAttachment = { sessionId: "original-session" };
      #stagedContext = { script() { return { context: { id: 37 } } } };
      constructor({ startup, bootstrap, qualification, command, current }) {
        this.#inverseV4Helper = startup ?? null;
        this.#inverseV4NativeDeleteBootstrapHelper = bootstrap ?? null;
        this.#inverseV4NativeDeleteQualificationHelper = qualification ?? null;
        this.#inverseV4NativeDeleteBootstrapCommand = command ?? null;
        this.#inverseV4NativeDeleteQualificationCommand = command ?? null;
        this.#inverseV4PublicObservationCutoff = current ? { current } : null;
      }
      observe(event) { return this.#observeFootprintInverseV4Helper(event); }
      ${source.slice(begin, end)}
    }
    const event = { method: "Debugger.scriptParsed", sessionId: "original-session", params: { url: "", executionContextId: 37, scriptId: "own-script" } };
    const call = { method: "Runtime.callFunctionOn" };
    const startup = { scriptId: null }, bootstrap = { scriptId: null }, qualification = { scriptId: null };
    const router = new HelperRouterFixture({ startup });
    assert.throws(() => router.observe({ ...event, params: { ...event.params, executionContextId: 38 } }), /HELPER_SOURCE_EVENT/);
    assert.equal(startup.scriptId, null);
    assert.equal(router.observe(event), true);
    assert.equal(startup.scriptId, "own-script");
    assert.throws(() => router.observe(event), /HELPER_SOURCE_EVENT/);
    assert.throws(() => new HelperRouterFixture({ bootstrap, qualification, command: call }).observe(event), /HELPER_COMMAND/);
    assert.throws(() => new HelperRouterFixture({ qualification, command: { method: "Debugger.getScriptSource" } }).observe(event), /HELPER_COMMAND/);
    assert.equal(qualification.scriptId, null);
    assert.equal(new HelperRouterFixture({ bootstrap, command: call }).observe(event), true);
    assert.equal(new HelperRouterFixture({ qualification, command: call }).observe(event), true);
    const service = { scriptId: null };
    const stopped = new HelperRouterFixture({ startup: service, current() { throw new Error("original-read-drift"); } });
    assert.throws(() => stopped.observe(event), /original-read-drift/);
    assert.equal(service.scriptId, null);
  `), context);
});

void test("the original cold accounting method spends controls without consuming CDP IDs", async () => {
  const source = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  const requestStart = source.indexOf("  #heldSavedRequest(request:");
  const end = source.indexOf("\n  /** Validate canonical bounded poll bytes", requestStart);
  assert.ok(requestStart !== -1 && end > requestStart);
  // The original method and ledger execute against inert channel and owner stand-ins.
  const context = vm.createContext({
    assert, CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY, CurrentFootprintCopyHeldSavedResourceLedger,
    requireOriginalHeldSavedLedgerBinding, error: (code: string): Error => new Error(code),
    MAX_LINE: 4096, TRANSPORT: { maximumNativePollBytes: 65_536 },
  });
  const program = `
    class CurrentFootprintCopyHeldSavedStartupChannel {}
    class CurrentFootprintInverseNativeDeleteColdStartupChannel {}
    class CurrentFootprintInverseNativeDeleteColdUiStartupChannel {}
    const channel = new CurrentFootprintInverseNativeDeleteColdStartupChannel();
    function requireNativeColdChannel(value){assert.equal(value,channel);}
    function assertOriginalCurrentFootprintInverseNativeDeleteColdOwner(value){assert.equal(value,original);}
    function classifyForwardRequest(id){assert.equal(this,channel);assert.equal(id,1);return false;}
    function forwardPollWaiting(){assert.equal(this,channel);return true;}
    class Fixture {
      #startupChannel;
      #nativeDeleteColdBirth;
      #nativeDeleteColdUiBirth = null;
      #nativeDeleteColdReadCurrent = () => { assert.equal(this,original); };
      #heldSavedFailed = false; #heldSavedAbortAttempted = false; #closeConsumed = false; #releaseConsumed = false;
      #heldSavedLastCommandCleanup = false; #heldSavedReadCleanup = false;
      #ledger = new CurrentFootprintCopyHeldSavedResourceLedger();
      #pipe = { status(){throw new Error("incorrect legacy poll classifier");} };
      constructor(selected,birth){this.#startupChannel=selected;this.#nativeDeleteColdBirth=birth;this.#ledger.bind(this);}
      #heldSavedResources(){return {ledger:this.#ledger,methods:requireOriginalHeldSavedLedgerBinding(this.#ledger)};}
      invoke(request){return this.#heldSavedRequest(request);}
      ${source.slice(requestStart,end)}
    }
    const original = new Fixture(channel, {});
    const control={action:"footprint-inverse-native-delete-cold-control",requestId:0,phase:"bind",method:"control"};
    assert.throws(()=> new Fixture(new CurrentFootprintCopyHeldSavedStartupChannel(), null).invoke(control), /COLD_CONTROL_ACCOUNTING/u);
    assert.throws(()=> original.invoke({...control,requestId:1}), /COLD_CONTROL_ACCOUNTING/u);
    assert.throws(()=> original.invoke({...control,phase:"other"}), /COLD_CONTROL_ACCOUNTING/u);
    original.invoke(control);
    original.invoke({...control,phase:"own-ready"});
    original.invoke({...control,phase:"get-complete"});
    original.invoke({action:"footprint-inverse-native-delete-cold-own-data",requestId:1,method:"Runtime.getProperties"});
    assert.equal(original.invoke({action:"poll"}).waiting,true);
  `;
  vm.runInContext(stripTypeScriptTypes(program), context);
});

void test("V4 effect writes reprove the cold admission and honors cancellation while waiting", async () => {
  const source = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  const queueStart = source.indexOf("  #queuedRequest(request:");
  const queueEnd = source.indexOf("\n  #requestNow(", queueStart);
  const proofStart = source.indexOf("function inverseFullEffectNeedsColdSuccessor(");
  const proofEnd = source.indexOf("\ninterface FootprintInverseFullAllocation", proofStart);
  assert.ok(queueStart !== -1 && queueEnd > queueStart && proofStart !== -1 && proofEnd > proofStart);
  const context = vm.createContext({ assert, error: (code: string): Error => new Error(code) });
  const program = `
    const purpose = "original-v4";
    const CURRENT_FOOTPRINT_INVERSE_NATIVE_CONTINUATION_V4_PROFILE = { purpose };
    const footprintInverseV4Factories = new WeakMap();
    const footprintForwardWriterCompleteFactories = new WeakMap();
    const options = Object.freeze({ powershellBytes: 1, powershellSha256: "pin" });
    const effects = [
      { action:"footprint-inverse-native-delete-execution", method:"Runtime.callFunctionOn", phase:"inverse-native-delete-sender-invoke" },
      { action:"footprint-inverse-native-delete-execution-forward", method:"Debugger.resume", phase:"inverse-native-delete-execution-forward-resume" },
      { action:"footprint-inverse-native-delete-flow", method:"Debugger.resume", phase:"local//inverse-native-delete-local-resume/localIngress/" },
    ];
    const events = [];
    const gate = Promise.withResolvers();
    const entered = Promise.withResolvers();
    let transportValid = true;
    let helperValid = true;
    let suspend = false;
    function requireFootprintInverseV4Preparation(allocation) { assert.equal(allocation.options, options); }
    function bornFootprintTransport(value) { return value === purpose; }
    function heldCachePurpose() { return false; }
    function selectedFileMainPurpose() { return false; }
    async function verifyCurrentPcbDiagnosticPowerShell(path, pin) {
      assert.equal(path, "fixed.exe");
      assert.equal(pin.bytes, 1);
      assert.equal(pin.sha256, "pin");
      events.push("transport");
      if (!transportValid) { throw new Error("transport changed"); }
    }
    const helper = Object.freeze({async verify() {
      events.push("helper");
      if (!helperValid) { throw new Error("helper changed"); }
      if (suspend) { entered.resolve(); await gate.promise; }
    }});
    const admission = Object.freeze({ helper, options, powershellExecutable:"fixed.exe" });
    ${source.slice(proofStart,proofEnd)}
    class Fixture {
      #startupParent = null; #purpose = purpose; #nativeTail = Promise.resolve();
      #heldSavedFailed = false; #heldSavedAbortAttempted = false; #nativeDeleteColdReadCurrent = null;
      #nativeDeleteColdUiBirth = null; #nativeDeleteColdUiReadCurrent = null;
      #mainTerminateAttempted = false; #closeConsumed = false; #terminationObserved = false; #releaseConsumed = false;
      constructor(coldAdmission) { footprintInverseV4Factories.set(this, {allocation:{coldAdmission,options,sourceKind:"full"}}); }
      #available() {}
      #reproveForwardWriterCreateAtWrite() { throw new Error("unexpected forward writer"); }
      #reproveInverseFullUploadAtWrite() { events.push("workflow"); }
      #requireNativeDeleteColdRequestAtWrite() {}
      #requireNativeDeleteColdUiRequestAtWrite() {}
      #reproveNativeDeleteColdUiAtWrite() { throw new Error("unexpected cold UI branch"); }
      #requestNow() { events.push("native write"); }
      close() { this.#mainTerminateAttempted = true; }
      invoke(request) { return this.#queuedRequest(request, () => { events.push("existing cutoff"); }); }
      ${source.slice(queueStart,queueEnd)}
    }
    (async () => {
      const original = new Fixture(admission);
      await assert.rejects(new Fixture(null).invoke(effects[0]), /COLD_ORIGINAL_ADMISSION/u);
      transportValid = false;
      await assert.rejects(original.invoke(effects[0]), /transport changed/u);
      assert.equal(events.splice(0).join(","), "transport");
      transportValid = true;
      helperValid = false;
      await assert.rejects(original.invoke(effects[0]), /helper changed/u);
      assert.equal(events.splice(0).join(","), "transport,helper");
      helperValid = true;
      for (const effect of effects) { await original.invoke(effect); }
      assert.equal(events.splice(0).join(","), "transport,helper,existing cutoff,native write,transport,helper,existing cutoff,native write,workflow,transport,helper,existing cutoff,native write");
      await original.invoke({action:"poll"});
      assert.equal(events.splice(0).join(","), "existing cutoff,native write");
      suspend = true;
      const pending = original.invoke(effects[1]);
      await entered.promise;
      assert.equal(events.join(","), "transport,helper");
      original.close();
      gate.resolve();
      await assert.rejects(pending, /COLD_EFFECT_CANCELLED/u);
      assert.equal(events.join(","), "transport,helper");
    })()
  `;
  // The only potential write is an event marker in the inert Core fixture.
  await vm.runInContext(stripTypeScriptTypes(program), context);
});

void test("retained V4 GET result dispatch joins original completion and exact pipe truth table",async()=>{
 const [owner,pipe]=await Promise.all([
  readFile(new URL("../src/current-pcb-diagnostic-owner.ts",import.meta.url),"utf8"),
  readFile(new URL("../src/current-pcb-diagnostic-pipe.ts",import.meta.url),"utf8"),
 ]);
 const completion=/^ {2}public completeFootprintInverseNativeGetTaskResult\([^\n]+\n([\s\S]+?)^ {2}\}$/mu.exec(owner)?.[1];
 assert.ok(completion!==undefined);
 assert.ok(completion.trimStart().startsWith("assertOriginalCurrentFootprintInverseV4NativeOwner(this);"));
 assert.match(completion,/requireOriginalCurrentFootprintInverseV4NativeGetTaskWorkerCompletion\(completion,this,prepared\)/u);
 assert.match(completion,/original\.assertOriginalUiHeld\(\)/u);
 const method=/^ {2}public observeInverseNativeGetTaskResult\([^\n]+/mu.exec(pipe)?.[0];assert.ok(method!==undefined);
 const context=vm.createContext({assert});
 const program=[
 'class Fixture{',
 ' #sessionId="original_ui";#inverseNativeContinuationV4;#inverseWorkerPair={};#inverseWorkerSlots=new Set(["saved-load-source-project"]);',
 ' #viaRetainedPending=null;#inversePublicDeletePending=null;#inverseNativeGetLookupPending=null;#inverseNativeGetTaskPending;#nextId=1;',
 ' constructor(continuation,pending){this.#inverseNativeContinuationV4=continuation;this.#inverseNativeGetTaskPending=pending;}',
 ' originalInverseNativeGetTaskInvocationReply(original){assert.equal(original,"original");}',
 ' #request(packet,kind){assert.equal(packet,"fixed");assert.equal(kind,"inverse-native-get-task-result");return "dispatched";}',
 method,'}',
 'function currentFootprintInverseNativeGetTaskResultWire(){return "fixed";}',
 'for(const continuation of [false,true])for(const pending of [null,{}]){',
 ' const original=new Fixture(continuation,pending);',
 ' if(continuation&&pending===null){assert.equal(original.observeInverseNativeGetTaskResult({},"original"),"dispatched");}',
 ' else{assert.throws(()=>original.observeInverseNativeGetTaskResult({},"original"),/FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_PAIR/u);}',
 '}',
 ].join("\n");vm.runInContext(stripTypeScriptTypes(program),context);
});

void test("post-ready drain admits the full cache and callback budgets and refuses a larger roster", async () => {
  const maximumPauses = currentFootprintInverseStartupDrainMaximumPauses(8, 512);
  assert.equal(maximumPauses, 1573);
  assert.equal(currentFootprintInverseStartupDrainMaximumPauses(8, 0), 37);
  assert.equal(currentFootprintInverseStartupDrainMaximumPauses(7, 2), 40);
  assert.throws(() => currentFootprintInverseStartupDrainMaximumPauses(9, 0), /INITIAL_CACHE_JOB_BOUND/u);
  assert.throws(() => currentFootprintInverseStartupDrainMaximumPauses(0, 513), /STARTUP_CALLBACK_SOURCE_BOUND/u);
  let polls = 0, serviced = 0;
  const bindings = Object.freeze({
    maximumPauses, assertCurrent: (): Promise<void> => Promise.resolve(),
    settleOriginalPromises: (): Promise<void> => Promise.resolve(),
    originalCompletionsPresent: (): boolean => serviced === maximumPauses,
    nextOriginalEvent: (): Promise<number> => { polls += 1; return Promise.resolve(polls); },
    serviceOriginalEvent: (event: number): Promise<boolean> => {
      serviced += 1;
      assert.equal(event, serviced);
      return Promise.resolve(true);
    },
    retainUnsupported: (): void => { assert.fail("all original events were serviced"); },
  });
  await drainCurrentFootprintInverseStartup(bindings);
  assert.equal(polls, maximumPauses);
  await assert.rejects(drainCurrentFootprintInverseStartup(Object.freeze({ ...bindings, maximumPauses: maximumPauses + 1 })), /STARTUP_DRAIN/u);
  assert.equal(polls, maximumPauses);
});


function originalClassMethod(source:string,begin:string,end:string):string{
 const beginAt=source.indexOf(begin);const stop=source.indexOf(end,beginAt);assert.ok(beginAt!==-1&&stop>beginAt);return source.slice(beginAt,stop);
}
void test("original inverse execution resolves only a result recovered from the same durable complete publication",async()=>{
 const source=await readFile(new URL("../src/current-footprint-inverse-full-workflow.ts",import.meta.url),"utf8");
 const runMethod=originalClassMethod(source," public run():Promise<CurrentFootprintInverseFullWorkflowResult>","\n async #publishComplete(");
 const publishMethod=originalClassMethod(source," async #publishComplete(","\n /** Reserve the original cutoff");
 for(const recover of[true,false]){
  const context=vm.createContext({assert,Promise,recover,publicationFailure:new Error("original complete acknowledgement failed")});
  const program=[
   "const events=[],checkpoint={},prepared={},source={},owner={},savedResult={saved:true},openingResult={},records=[],results=new WeakMap();",
   "const saved={start(){events.push('saved');return Promise.resolve(savedResult)}};",
   "const opening={start(){events.push('opening');return Promise.resolve(openingResult)}};",
   "const admission={run(_owner,action){return action()}};",
   "function prepareCurrentFootprintInverseFullPreparation(value){assert.equal(value,checkpoint);return Promise.resolve(prepared)}",
   "function requireOriginalCurrentFootprintInverseFullPreparation(value){assert.equal(value,prepared)}",
   "function claimCurrentFootprintInverseFullNativeGeneration(value){assert.equal(value,prepared);return opening}",
   "function requireOriginalCurrentFootprintInverseFullNativeOpeningResult(value){assert.equal(value,openingResult);return{prepared,saved,source,owner}}",
   "function requireOriginalCurrentFootprintInverseNativeDeleteSavedResult(value){assert.equal(value,savedResult);return{prepared,source,owner}}",
   "function captureCurrentFootprintForwardExecutionReceiver(){return()=>{}}",
   "const openingPrototype={},savedPrototype={},freezeDeep=Object.freeze,currentFootprintInverseFullWorkflowResultSchema={parse(value){return value}};",
   "function need(value,code){assert.ok(value,code)}",
   "class Workflow{",
   "#run=null;#result=null;#terminal=false;#resourcesClosed=false;#failure;#source={operationId:'forward'};#sourceOriginal={checkpoint};#request={operationId:'inverse',sourceOperationId:'forward'};",
   "#prepared;#preparation;#opening;#openingCurrent;#openingResult;#openingRun;#saved;#savedCurrent;#savedResult;#savedRun;",
   "#journal={reserve(){return Promise.resolve()},retained(){return{records}}};",
   "#current(){}#remember(error){this.#failure=error}#journalAction(action){return action()}#stageCall(_stage,action){return action()}",
   "#append(kind){assert.equal(kind,'complete');events.push('append');if(recover)records.push({kind});return Promise.reject(publicationFailure)}",
   "cleanup(){events.push('cleanup');return records.at(-1)?.kind==='complete'?this.#publishComplete():Promise.resolve()}",
   "result(){return this.#result}failure(){return this.#failure}",
   runMethod,publishMethod,"};const workflow=new Workflow();",
   "globalThis.pending=workflow.run();assert.equal(workflow.run(),pending);",
  ].join("\n");vm.runInContext(stripTypeScriptTypes(program),context);
  await run(context,recover?"const value=await pending;assert.equal(value,workflow.result());assert.equal(results.get(value),workflow);":"await assert.rejects(pending,error=>error===publicationFailure);assert.equal(workflow.result(),null);");
  await run(context,"assert.equal(workflow.failure(),publicationFailure);for(const name of['opening','saved','append','cleanup'])assert.equal(events.filter(value=>value===name).length,1);");
 }
});
void test("saved cleanup clears only the rejected normal termination sample before the original after-abort observation",async()=>{
 const source=await readFile(new URL("../src/current-footprint-inverse-native-delete-saved-generation.ts",import.meta.url),"utf8");
 const method=originalClassMethod(source," async #observeExit(cleanup:boolean)","\n #endObservers()");
 const context=vm.createContext({assert,Promise,originalFailure:new Error("original normal termination failed")});
 const program=[
  "let aborted=false;const events=[],source={},token={},precedingTerminationSamples=2;",
  "const owner={observeTermination(){events.push('normal');return Promise.reject(originalFailure)},observeFootprintInverseNativeDeleteSavedTerminationAfterAbort(value){assert.equal(value,source);assert.equal(aborted,true);events.push('after-abort');return Promise.resolve(true)}};",
  "function need(value,code){assert.ok(value,code)}function originalCurrentFootprintInverseTermination(value){assert.equal(value,owner);return token}function assertOriginalCurrentFootprintInverseTermination(value,result){assert.equal(value,owner);assert.equal(result,token)}",
  "class Saved{#termination=null;#terminationCalls=0;#terminated=false;#owner=owner;#source=source;#failed=false;#failure;",
  "#current(){}#remember(error){if(!this.#failed){this.#failed=true;this.#failure=error}}",
  "#call(_cleanup,action){const pending=action();void(async()=>{try{await pending}catch(error){this.#remember(error)}})();return pending}",
  "observe(cleanup){return this.#observeExit(cleanup)}abort(){aborted=true}state(){return{terminated:this.#terminated,calls:this.#terminationCalls,failure:this.#failure}}",
  method,"};const generation=new Saved();",
 ].join("\n");vm.runInContext(stripTypeScriptTypes(program),context);
 await run(context,"await assert.rejects(generation.observe(false),error=>error===originalFailure);assert.equal(generation.state().failure,originalFailure);generation.abort();await generation.observe(true);assert.equal(generation.state().terminated,true);assert.equal(generation.state().calls,2);assert.equal(events.join(','),'normal,after-abort');assert.equal(generation.state().failure,originalFailure);");
});
void test("failed original termination rejects both cold helper arrival joins without claiming channel release",async()=>{
 const source=await readFile(new URL("../src/current-pcb-worker-startup-channel.ts",import.meta.url),"utf8");
 const method=originalClassMethod(source,"  public async releaseAfterTermination()","\n  #nativeDeleteColdUiOriginal");
 const context=vm.createContext({assert,Promise,cause:new Error("original termination unavailable")});
 const program=[
  "const cold=Promise.withResolvers(),ui=Promise.withResolvers(),outcomes=[];",
  "const observations=[cold.promise,ui.promise].map(async pending=>{try{await pending;outcomes.push('unexpected-success')}catch(error){outcomes.push(error)}});",
  "function fail(code){return new Error(code)}async function observe(pending){try{await pending}catch{}}",
  "class Channel{#started=true;#released=false;#releaseRequested=false;#pollTimer=null;#tail=Promise.resolve();#pending=new Map();#listener={};#polls=0;",
  "#nativeDeleteColdHelper={arrival:cold,receipt:{pending:observations[0]}};#nativeDeleteColdUiHelper={arrival:ui};",
  "#originalTermination(){return Promise.reject(cause)}#schedulePoll(value){assert.equal(value,0);this.#polls+=1}",
  "state(){return{released:this.#released,requested:this.#releaseRequested,polls:this.#polls}}",
  method,"};const channel=new Channel();",
 ].join("\n");vm.runInContext(stripTypeScriptTypes(program),context);
 try{
  await run(context,"await assert.rejects(channel.releaseAfterTermination(),error=>error===cause);");
  const turn=Promise.withResolvers<null>();setImmediate(()=>{turn.resolve(null);});await turn.promise;
  await run(context,"assert.equal(outcomes.length,2);for(const error of outcomes)assert.equal(error,cause);assert.deepEqual(channel.state(),{released:false,requested:false,polls:1});");
 }finally{await run(context,"cold.reject(cause);ui.reject(cause);await Promise.allSettled(observations);");}
});

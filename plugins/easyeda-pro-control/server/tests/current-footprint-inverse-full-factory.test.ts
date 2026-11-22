/** Actual full-successor factory and private source-kind guard in an inert
 * realm. Only checkpoint/native-process custody is synthetic; these fixtures
 * create no helper, Job, process handle, application or execution authority. */
import assert from "node:assert/strict";
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

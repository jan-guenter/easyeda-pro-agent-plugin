/** Actual fixed coordinator with synthetic original Core/cache boundaries.
 * These cases allocate no facade, native owner, application, Job or SQL reader. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {test} from "node:test";
import {types} from "node:util";
import vm from "node:vm";
import {transform} from "esbuild";
import {createCurrentFootprintInverseFullNativeGeneration as create} from "../src/current-footprint-inverse-full-native-generation.ts";

async function fixture(mode:"normal"|"late"|"external"|"failure"="normal"):Promise<vm.Context>{
 const path=new URL("../src/current-footprint-inverse-full-native-generation.ts",import.meta.url);
 const actual=await readFile(path,"utf8");const require=createRequire(path);
 const compiled=await transform(actual,{loader:"ts",format:"cjs",target:"node24",logLevel:"silent"});
 const context=vm.createContext({assert,Promise,mode,wire:(value:unknown):unknown=>structuredClone(value)});
 const setup=[
 "const events=[],prepared={},original={data:{cold:{chunks:[{}]}}},birthGate=Promise.withResolvers(),navigationGate=Promise.withResolvers();",
 "const source={},workerOrigin={},bootstrap={},cache={},idle={profile:'private.current-footprint-inverse-startup-idle.v1'},binding={},reservation={},termination={};",
 "let allocation='not-attempted',released=false,launchConsumed=false,root=false,aborted=false,workerSetup=null,workerPending=null,structureArmed=false,idleIssued=false,upload=false;",
 "const packets=new WeakMap(),roles=['branch','cold','histories','fetchEntry','response','bytes','plaintext','parsed','ready'];",
 "function packet(index){const value={profile:'private.current-footprint-inverse-cold-held.v1'};packets.set(value,index);return value}",
 "function advance(value,model){const index=packets.get(value);assert.ok(Number.isInteger(index));assert.equal(index>=6,model);events.push(roles[index]);if(index===8){idleIssued=true;navigationGate.resolve({});return Promise.resolve(idle)}return Promise.resolve(packet(index+1))}",
 "const tokens=new Map();function token(name){if(!tokens.has(name)){tokens.set(name,{name})}return tokens.get(name)}",
 "const owner={status(){return {released,helperClosed:released,launchConsumed,binding:launchConsumed?binding:null,noProcessCleanupAvailable:false}},",
 "startFootprintInverseFullGeneration(){assert.equal(aborted,false);launchConsumed=true;events.push('launch');return Promise.resolve(binding)},",
 "observeFootprintMainConstruction(){events.push('main');return Promise.resolve({})},",
 "browserObservation(){return Promise.resolve(wire({schema:'easyeda-pro-control.pcb-diagnostic-browser-observation.v1',targets:[{targetId:'target_1',type:'page',url:'https://client/editor?cll=info',attached:false}]}))},",
 "inspectFrames(value){assert.equal(value,'target_1');return Promise.resolve(wire({schema:'easyeda-pro-control.pcb-diagnostic-frame-inventory.v1',targetId:value,frames:[{id:'frame_1',loaderId:'loader_1',url:'https://client/editor?cll=info',securityOrigin:'https://client'}]}))},",
 "inspectScript(frame,profile){assert.equal(frame,'frame_1');assert.equal(profile.family,'ui');return Promise.resolve({})},",
 "prepareFootprintInverseV4Ui(){return Promise.resolve()},createFootprintInverseV4CacheOrigin(){return Promise.resolve(cache)},publishFootprintInverseV4CacheBackup(){return Promise.resolve({})},invalidateFootprintInverseV4Caches(){return Promise.resolve({})},",
 "prepareFootprintInverseV4FlowCachePlan(){return Promise.resolve({})},prepareFootprintInverseV4StartupPlan(){return Promise.resolve({})},prepareFootprintInverseV4PublicRowPlan(){return Promise.resolve({})},",
 "prepareFootprintInverseV4PollingCancellationIntent(){return Promise.resolve({})},prepareFootprintInverseV4LibraryRefreshIntent(){return Promise.resolve({})},registerFootprintInverseV4Project(){return Promise.resolve({})},",
 "armFootprintInverseV4Worker(setup){workerSetup=setup;return Promise.resolve()},",
 "openFootprintInverseV4Project(){events.push('navigation-start');workerPending=workerSetup(workerOrigin);return navigationGate.promise},",
 "armFootprintInverseV4Construction(value){assert.equal(value,workerOrigin);structureArmed=true;events.push('construction-arm');return Promise.resolve()},",
 "observeFootprintInverseV4WorkerSource(){return workerPending.then(()=>({}))},observeFootprintInverseV4Construction(){assert.equal(structureArmed,true);return Promise.resolve({})},",
 "withFootprintInverseV4BootstrapHeld(setup){assert.equal(structureArmed,true);events.push('bootstrap');return setup(bootstrap)},",
 "startFootprintInverseV4ColdIngress(){return Promise.resolve(packet(0))},continueFootprintInverseV4ColdIngress(value){return advance(value,false)},continueFootprintInverseV4ModelIngress(value){return advance(value,true)},",
 "observeFootprintInverseV4PublicService(){assert.equal(idleIssued,true);events.push('public-service');return Promise.resolve({})},",
 "armFootprintInverseV4DeleteWorker(){assert.equal(events.at(-1),'public-service');events.push('delete-worker');return Promise.resolve({})},",
 "prepareFootprintInverseNativeDeleteMainSource(serialization,publication){assert.equal(serialization,token('serialization'));assert.equal(publication,token('publication'));events.push('main-source');return Promise.resolve(source)},",
 "reserveFootprintInverseFullOpeningCleanup(){events.push('reserve-cleanup');aborted=true;return reservation},",
 "dispatchFootprintInverseFullOpeningCleanupAbort(value){assert.equal(value,reservation);events.push('abort');return Promise.resolve()},",
 "observeFootprintInverseFullOpeningTerminationAfterAbort(value){assert.equal(value,reservation);assert.equal(aborted,true);events.push('termination');root=true;return Promise.resolve(true)},",
 "endFootprintInverseFullOpeningAfterOriginalExit(){assert.equal(root,true);events.push('end');navigationGate.reject(undefined);return Promise.resolve()},",
 "releaseClosed(){assert.equal(root,true);events.push('release');released=true;return Promise.resolve()},",
 "releaseUnlaunched(){assert.equal(launchConsumed,false);events.push('release-unlaunched');released=true;return Promise.resolve()},",
 "releaseNoProcess(){throw new Error('no uncertain process is adopted')}};",
 "for(const name of ['Producers','ColdLoad','StartupCallbacks','InitialCache','InitialSyncWorker','FirstTimer','LibraryRefresh']){owner['armFootprintInverseV4'+name]=value=>{assert.equal(value,bootstrap);events.push('arm-'+name);return Promise.resolve({})}}",
 // This independent route oracle checks original returned-token identity,
 // Including the four same-shaped reference results and their actual ordering.
 "const routes=[",
 "['prepareFootprintInverseV4NativeDeleteIntent',[],'intent'],['observeFootprintInverseV4NativeDeleteBootstrap',['intent'],'bootstrap-done'],['observeFootprintInverseV4NativeDeleteQualification',['intent'],'qualification'],",
 "['prepareFootprintInverseV4NativeGetWorker',['qualification'],'get-ready'],['holdFootprintInverseV4NativeGetTaskCall',['get-ready'],'get-call'],['prepareFootprintInverseV4NativeGetTaskDependencies',['get-call'],'get-dependencies'],",
 "['advanceFootprintInverseV4NativeGetTaskCallback',['get-dependencies'],'get-callback'],['advanceFootprintInverseV4NativeGetTaskManager',['get-callback'],'get-manager'],['advanceFootprintInverseV4NativeGetTaskChannel',['get-manager'],'get-channel'],",
 "['acceptFootprintInverseV4NativeGetTaskJob',['get-channel'],'get-job'],['completeFootprintInverseV4NativeGetTaskWorker',['get-job'],'get-worker'],['completeFootprintInverseNativeGetTaskResult',['get-worker'],'get-result'],",
 "['prepareFootprintInverseNativeReferenceWorker',['get-result'],'reference-ready'],['holdFootprintInverseNativeReferencePcbCall',['get-result'],'pcb-call'],['prepareFootprintInverseNativeReferencePcbDependencies',['pcb-call'],'pcb-dependencies'],",
 "['advanceFootprintInverseNativeReferencePcbCallback',['pcb-dependencies'],'pcb-callback'],['advanceFootprintInverseNativeReferencePcbManager',['pcb-callback'],'pcb-manager'],['advanceFootprintInverseNativeReferencePcbChannel',['pcb-manager'],'pcb-channel'],",
 "['forwardFootprintInverseNativeReferencePcbQuery',['pcb-channel','reference-ready'],'pcb-job'],['observeFootprintInverseNativeReferenceWorker',['pcb-job'],'pcb-worker'],['finishFootprintInverseNativeReferencePcbQuery',['pcb-worker'],'pcb-result'],",
 "['holdFootprintInverseNativeReferenceNextCall',['pcb-result'],'schematic-call'],['finishFootprintInverseNativeSchematicReference',['schematic-call'],'schematic-result'],",
 "['holdFootprintInverseNativeReferenceNextCall',['schematic-result'],'derived-call'],['forwardFootprintInverseNativeReferenceNextWorker',['derived-call'],'derived-job'],['observeFootprintInverseNativeReferenceWorker',['derived-job'],'derived-worker'],['finishFootprintInverseNativeReferenceNextWorker',['derived-worker'],'derived-result'],",
 "['holdFootprintInverseNativeReferenceNextCall',['derived-result'],'device-call'],['forwardFootprintInverseNativeReferenceNextWorker',['device-call'],'device-job'],['observeFootprintInverseNativeReferenceWorker',['device-job'],'device-worker'],['finishFootprintInverseNativeReferenceNextWorker',['device-worker'],'device-result'],",
 "['holdFootprintInverseNativeDeleteCall',['device-result'],'delete-call'],['holdFootprintInverseNativeDeleteInnerRpc',['delete-call'],'delete-rpc'],['forwardFootprintInverseNativeDelete',['delete-rpc'],'delete-job'],",
 "['prepareFootprintInverseNativeDeleteClockRegistration',['delete-job'],'clock-registration'],['observeFootprintInverseNativeDeleteClock',['delete-job'],'clock'],['observeFootprintInverseNativeDeleteSerialization',['clock'],'serialization'],['observeFootprintInverseNativeDeletePublication',['serialization'],'publication']];",
 "let routeIndex=0;for(const [name] of routes){owner[name]=(...args)=>{const selected=routes[routeIndex++];assert.equal(selected[0],name);assert.equal(args.length,selected[1].length);for(let index=0;index<args.length;index++)assert.equal(args[index],token(selected[1][index]));events.push(selected[2]);if(mode==='failure'&&selected[2]==='schematic-call')return Promise.reject(undefined);return Promise.resolve(token(selected[2]))}}",
 "const externalOwner=new Proxy({}, {get(){throw new Error('external owner must never be touched')}});if(mode==='external')allocation='retained';",
 "const core={assertOriginalCurrentFootprintInverseFullNativeContinuationV4Owner(value){assert.equal(value,owner)},originalCurrentFootprintInversePreparedCheckpoint(value){assert.equal(value,owner);return prepared},",
 "currentFootprintInverseFullAllocationOutcome(value){assert.equal(value,prepared);return {state:allocation,owner:allocation==='retained'?(mode==='external'?externalOwner:owner):null}},",
 "startCurrentFootprintInverseFullNativeContinuationV4Owner(value){assert.equal(value,prepared);assert.equal(allocation,'not-attempted');events.push('birth');allocation=mode==='late'?'pending':'retained';return mode==='late'?birthGate.promise:Promise.resolve(owner)},",
 "requireOriginalCurrentFootprintInverseColdHeld(value,candidate,input){assert.equal(candidate,owner);assert.equal(input,prepared);const index=packets.get(value);assert.ok(Number.isInteger(index));return {role:roles[index]}},",
 "requireOriginalCurrentFootprintInverseStartupIdle(value,candidate,input){assert.equal(value,idle);assert.equal(candidate,owner);assert.equal(input,prepared);assert.equal(idleIssued,true)},",
 "requireOriginalCurrentFootprintInverseNativeDeleteMainSourceForOwner(value,candidate,input){assert.equal(value,source);assert.equal(candidate,owner);assert.equal(input,prepared);return {assertBeforeOriginalUpload(){assert.equal(upload,false)},originalUploadWritten(){return upload}}},",
 "originalCurrentFootprintInverseTermination(value){assert.equal(value,owner);assert.equal(root,true);return termination},assertOriginalCurrentFootprintInverseTermination(value,input){assert.equal(value,owner);assert.equal(input,termination);assert.equal(root,true)}};",
 "const preparation={requireOriginalCurrentFootprintInverseFullPreparation(value){assert.equal(value,prepared);return original}};",
 "const cacheModule={observeOriginalCurrentFootprintInverseCaches(candidate,input,value){assert.equal(candidate,owner);assert.equal(input,prepared);assert.equal(value,cache);return Promise.resolve()}};",
 "const saved={stopOriginalNormal(){events.push('saved-stop')},cleanup(){events.push('saved-cleanup');root=true;released=true;return Promise.resolve()}};",
 "const savedModule={createCurrentFootprintInverseNativeDeleteSavedGeneration(value,candidate,input){assert.equal(value,source);assert.equal(candidate,owner);assert.equal(input,prepared);assert.equal(upload,false);return saved}};",
 "globalThis.deps={core,preparation,cacheModule,savedModule};globalThis.prepared=prepared;globalThis.events=events;globalThis.resolveBirth=()=>{allocation='retained';birthGate.resolve(owner)};"
 ].join("\n");
 vm.runInContext(setup,context);
 const loaded:{exports:Record<string,unknown>}={exports:{}};
 const evaluate:unknown=vm.runInContext(`(function(require,module,exports){${compiled.code}\n})`,context);assert.ok(typeof evaluate==="function");
 const load=(name:string):unknown=>{
  const aliases:Readonly<Record<string,string>>={"./current-footprint-inverse-v4-native-owner.ts":"core","./current-footprint-inverse-full-preparation.ts":"preparation","./current-footprint-inverse-v4-cache-observer.ts":"cacheModule","./current-footprint-inverse-native-delete-saved-generation.ts":"savedModule"};
  const selected=aliases[name];if(selected!==undefined){return vm.runInContext(`deps[${JSON.stringify(selected)}]`,context) as unknown;}
  // oxlint-disable-next-line import/no-dynamic-require -- Actual maintained pure imports outside the explicitly synthetic original custody boundaries.
  return require(name) as unknown;
 };
 Reflect.apply(evaluate,undefined,[load,loaded,loaded.exports]);context["api"]=loaded.exports;return context;
}
async function run(context:vm.Context,body:string):Promise<void>{
 const pending:unknown=vm.runInContext(`(async()=>{${body}})()`,context);assert.ok(types.isPromise(pending));await pending;
}
void test("real full generation rejects an unissued full preparation before any native birth",()=>{
 assert.throws(()=>create({profile:"private.current-footprint-inverse-full-preparation.v1"}));
});
void test("actual first-generation pipeline keeps navigation pending through original holds and joins all four query results before MainSource",async()=>{
 const context=await fixture();
 await run(context,
  "const generation=api.createCurrentFootprintInverseFullNativeGeneration(prepared),pending=generation.start();assert.equal(generation.start(),pending);const result=await pending;"+
  "assert.ok(events.indexOf('navigation-start')<events.indexOf('bootstrap'));assert.ok(events.indexOf('ready')<events.indexOf('public-service'));assert.ok(events.indexOf('public-service')<events.indexOf('delete-worker'));"+
  "const original=api.requireOriginalCurrentFootprintInverseFullNativeOpeningResult(result);assert.equal(original.prepared,prepared);assert.equal(events.at(-1),'main-source');"+
  "assert.ok(events.indexOf('pcb-result')<events.indexOf('schematic-result'));assert.ok(events.indexOf('schematic-result')<events.indexOf('derived-result'));assert.ok(events.indexOf('derived-result')<events.indexOf('device-result'));"+
  "assert.equal(generation.retained().wholeInverseVerified,false);assert.equal(generation.retained().executionAuthorized,false);"+
  "assert.throws(()=>api.requireOriginalCurrentFootprintInverseFullNativeOpeningResult({profile:result.profile}));"+
  "await generation.cleanup();assert.equal(events.at(-1),'saved-cleanup');assert.equal(generation.start(),pending);"
 );
});
void test("actual first-generation cleanup joins its late original birth and releases only that unused helper",async()=>{
 const context=await fixture("late");
 await run(context,
  "const generation=api.createCurrentFootprintInverseFullNativeGeneration(prepared),pending=generation.start();"+
  "for(let turns=0;turns<128&&!events.includes('birth');turns++)await Promise.resolve();assert.equal(events.includes('birth'),true);"+
  "const cleanup=generation.cleanup();resolveBirth();await cleanup;await assert.rejects(pending);"+
  "assert.equal(events.includes('launch'),false);assert.equal(events.filter(value=>value==='release-unlaunched').length,1);assert.equal(generation.retained().cleaned,true);"
 );
});
void test("actual first-generation pipeline refuses a pre-existing native factory and never adopts its owner during cleanup",async()=>{
 const context=await fixture("external");
 await run(context,
  "const generation=api.createCurrentFootprintInverseFullNativeGeneration(prepared),pending=generation.start();"+
  "await assert.rejects(pending,/PREEXISTING_FACTORY_REFUSED/);await generation.cleanup();assert.equal(events.length,0);assert.equal(generation.retained().originalOwnerRetained,false);"
 );
});
void test("actual first-generation failure keeps raw undefined and aborts only its original Job before release",async()=>{
 const context=await fixture("failure");
 await run(context,
  "const generation=api.createCurrentFootprintInverseFullNativeGeneration(prepared),pending=generation.start();let cause='unsettled';try{await pending}catch(error){cause=error}assert.equal(cause,undefined);"+
  "const cleanup=generation.cleanup();assert.equal(events.at(-1),'reserve-cleanup');await cleanup;assert.equal(generation.retainedFailure(),undefined);"+
  "assert.equal(events.filter(value=>value==='abort').length,1);assert.ok(events.indexOf('termination')<events.indexOf('end'));assert.ok(events.indexOf('end')<events.indexOf('release'));assert.equal(events.includes('main-source'),false);"
 );
});

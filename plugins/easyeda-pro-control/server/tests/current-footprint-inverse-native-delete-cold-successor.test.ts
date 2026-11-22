import {randomBytes} from "node:crypto";
import {promises as fsPromises} from "node:fs";
import {readFile,readlink,rmdir,unlink} from "node:fs/promises";
import {stripTypeScriptTypes,syncBuiltinESMExports} from "node:module";
import {basename,dirname,join} from "node:path";
import type {TestContext} from "node:test";
import {buildPlanHash,isRecord} from "../src/core.ts";
import {loadOperation,operationPath,updateOperation} from "../src/artifacts.ts";
import {CurrentFootprintInverseNativeDeleteColdUiJournal as ColdJournal,projectCurrentFootprintInverseNativeDeleteColdUiLaunchState as projectColdLaunch,readCurrentFootprintInverseNativeDeleteColdUiHistory as readColdHistory} from "../src/current-footprint-inverse-native-delete-cold-ui-journal.ts";
import type {ColdUiStageRequest} from "../src/current-footprint-inverse-native-delete-cold-ui-contract.ts";
/* oxlint-disable import/max-dependencies -- Existing passive helper fixtures and cold-only managed publication faults share this reviewed file without introducing a runtime-owner test dependency. */
import {CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM} from "../src/current-pcb-diagnostic-helper-source-profile.ts";
import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-delete-cold-profile.ts";
import { captureCurrentFootprintInverseNativeDeleteColdSuccessor } from "../src/current-footprint-inverse-native-delete-cold-successor-helper.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_SUCCESSOR_IDENTITY as IDENTITY } from "../src/current-footprint-inverse-native-delete-cold-successor-identity.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_BYTES, CURRENT_PCB_DIAGNOSTIC_HELPER_SHA256 } from "../src/current-pcb-diagnostic-helper-identity.ts";

void test("cold successor captures the dedicated helper under an exact launch switch", async () => {
  const distribution = "test-distro";
  const capture = await captureCurrentFootprintInverseNativeDeleteColdSuccessor(distribution);
  await capture.verify();
  assert.ok(capture.bootstrap.includes("footprint-inverse-native-delete-cold-successor.ps1"));
  assert.ok(capture.bootstrap.includes("[IO.FileShare]::Read"));
  assert.ok(capture.bootstrap.includes(IDENTITY.helper.sha256));
  assert.ok(capture.bootstrap.includes(`${PROFILE.nativeSwitch}}finally{$file.Dispose()}`));
});

void test("cold successor is single purpose and keeps historical shared pins", async () => {
  const helper = await readFile(new URL(`../../${IDENTITY.helper.relativePath}`, import.meta.url), "utf8");
  assert.equal(helper.split("\n")[0], "param([switch]$FootprintInverseNativeDeleteCold209,[switch]$CompileOnly)");
  assert.match(helper, /\$owner=\[EasyedaDiagnosticOwner\]::CreateFootprintInverseNativeDeleteCold209\(\)\n\$owner.RequireNativeDeleteColdBirth\(\)/u);
  const initialization=helper.indexOf("$owner.Initialize()"),smoke=helper.indexOf("[EasyedaDiagnosticOwner]::VerifyNativeDeleteColdBirthSmoke()");
  assert.ok(smoke!==-1&&initialization!==-1);assert.ok(smoke<initialization);
  assert.ok(helper.includes("$startupRequestLimit=[EasyedaDiagnosticOwner]::NativeDeleteColdRequests"));
  assert.deepEqual(IDENTITY.predecessor, { bytes: CURRENT_PCB_DIAGNOSTIC_HELPER_BYTES, sha256: CURRENT_PCB_DIAGNOSTIC_HELPER_SHA256 });
  assert.equal(PROFILE.normalRequestLimit + PROFILE.cleanupRequestLimit, PROFILE.requestLimit);
});




void test("actual path selector validates distribution only on deterministic UNC input",async()=>{
 const source=await readFile(new URL("../src/current-footprint-inverse-native-delete-cold-successor-helper.ts",import.meta.url),"utf8");
 const start=source.indexOf("export async function captureCurrentFootprintInverseNativeDeleteColdSuccessor(");assert.ok(start!==-1);
 const program=source.slice(start).replace("export async function","async function").replaceAll("import.meta.url",JSON.stringify("file:///fixed/helper.ts"));
 function fixture(path:string):vm.Context{
  const original=Object.freeze({});
  const context=vm.createContext({assert,Buffer,URL,IDENTITY,PROFILE,MAXIMUM,
   need:(ok:boolean):void=>{assert.ok(ok,"INVERSE_NATIVE_DELETE_COLD_HELPER_SOURCE");},
   fileURLToPath:():string=>path,powershellSingleQuotedBody:(value:string):string=>value,
   readPinnedSource:(value:string,previous?:object):Promise<object>=>{assert.equal(value,path);if(previous!==undefined){assert.equal(previous,original);}return Promise.resolve(original);},
  });
  vm.runInContext(stripTypeScriptTypes(program),context);return context;
 }
 const invalid=JSON.stringify("test-distro' unexpected");
 const unc=fixture("/fixed/passive/helper.ps1");
 await assert.rejects(async()=>{await vm.runInContext(["captureCurrentFootprintInverseNativeDeleteColdSuccessor(",invalid,")"].join(""),unc);},/INVERSE_NATIVE_DELETE_COLD_HELPER_SOURCE/u);
 const drive=fixture("/mnt/c/fixed/helper.ps1");
 const expected=JSON.stringify(["C:","fixed","helper.ps1"].join(String.fromCodePoint(92)));
 await vm.runInContext(["captureCurrentFootprintInverseNativeDeleteColdSuccessor(",invalid,").then(async value=>{await value.verify();assert.ok(value.bootstrap.includes(",expected,"));})"].join(""),drive);
});

function coldRequest():ColdUiStageRequest{return{operationId:`footprint-inverse-cold-ui-${randomBytes(16).toString("hex")}`,parentOperationId:"footprint-inverse-flow-passive-test",sourceSha256:"a".repeat(64),documentUuid:"1".repeat(16),readonlyContinuation:true,saveRequests:0};}
function missing(error:unknown):boolean{return error instanceof Error&&"code"in error&&error.code==="ENOENT";}
async function finishColdJournal(journal:ColdJournal,stage:"checkpoint"|"read"="checkpoint"):Promise<void>{
 await journal.beginOriginalCleanup(stage);journal.recordOriginalCleanupClosure(true,false);await journal.settleOriginalCleanupPublication();await journal.assertCurrent();
 const id=journal.retained().records[0]?.operationId;assert.ok(id!==undefined);const operation=await loadOperation(id);
 for(const descriptor of operation.artifacts??[]){await unlink(descriptor.path);}
 const path=operationPath(id);await unlink(path);const directory=dirname(path);await rmdir(join(directory,id));
}
function initialFault(context:TestContext,manifest:string):{blocked:boolean;attempts:number;bytes:Buffer|null;injected:Error}{
 const state={blocked:true,attempts:0,bytes:null as Buffer|null,injected:Object.assign(new Error("injected initial temporary write"),{code:"ENOSPC"})};
 const originalOpen=fsPromises.open;
 context.mock.method(fsPromises,"open",async(...args:Parameters<typeof originalOpen>)=>{
  const file=await originalOpen(...args);const named=await readlink(`/proc/self/fd/${String(file.fd)}`);
  if(named.startsWith(`${manifest}.tmp-cold-ui-`)){
   const write=file.writeFile.bind(file);
   context.mock.method(file,"writeFile",async(...values:Parameters<typeof write>)=>{
    if(state.blocked){assert.ok(Buffer.isBuffer(values[0]));state.bytes??=Buffer.from(values[0]);state.attempts+=1;throw state.injected;}
    await write(...values);
   });
  }return file;
 });syncBuiltinESMExports();return state;
}
void test("cold journal binds full original intent request to the manifest while preserving empty reservation",async()=>{
 const request=coldRequest();const journal=new ColdJournal(request);await journal.reserve();const original=await loadOperation(request.operationId);assert.ok(isRecord(original.plan));
 const plan={...original.plan,request:{...request,documentUuid:"2".repeat(16)}};
 try{
  const changed={...original,plan,planHash:buildPlanHash(plan)};await updateOperation(changed);
  await assert.rejects(readColdHistory(request.operationId),/MANIFEST_REQUEST/u);
  assert.throws(()=>projectColdLaunch(changed),/MANIFEST_REQUEST/u);
 }finally{await updateOperation(original);}
 await journal.assertCurrent();await finishColdJournal(journal);
});
void test("cold journal rechecks its exact read prefix after concurrent artifact verification",async context=>{
 const request=coldRequest();const journal=new ColdJournal(request);await journal.reserve();
 for(const kind of["checkpoint-intent","checkpoint-result","birth-intent","birth-result","read-intent"]as const){await journal.append(kind,kind.endsWith("-result")?{originalCompleted:true}:{});}
 const target=join(dirname(operationPath(request.operationId)),request.operationId,"05-read-intent.json");
 const entered=Promise.withResolvers<null>(),resume=Promise.withResolvers<null>();let opens=0;const originalOpen=fsPromises.open;
 context.mock.method(fsPromises,"open",async(...args:Parameters<typeof originalOpen>)=>{
  const file=await originalOpen(...args);
  if(await readlink(`/proc/self/fd/${String(file.fd)}`)===target){opens+=1;if(opens===2){entered.resolve(null);await resume.promise;}}
  return file;
 });syncBuiltinESMExports();
 const pending=journal.assertReadAdmission();
 // oxlint-disable-next-line promise/prefer-await-to-then -- Retain the original rejection before racing a distinct publisher operation, then assert that same Promise.
 const joined=pending.then(()=>null,()=>null);
 try{await entered.promise;await journal.append("failure",{stage:"read",originalErrorRetained:true});resume.resolve(null);await assert.rejects(pending,/READ_PREFIX/u);}
 finally{resume.resolve(null);await joined;context.mock.restoreAll();syncBuiltinESMExports();}
 await finishColdJournal(journal,"read");
});
void test("cold journal retries only the original fully cleaned pre-link temporary write",async context=>{
 const request=coldRequest();const journal=new ColdJournal(request);const fault=initialFault(context,operationPath(request.operationId));
 try{
  await assert.rejects(journal.reserve(),error=>error===fault.injected);assert.equal(journal.reservationOutcome(),"create-unknown");
  await assert.rejects(loadOperation(request.operationId),missing);await assert.rejects(journal.settle(),error=>error===fault.injected);assert.equal(fault.attempts,2);
  fault.blocked=false;await journal.settle();await journal.assertCurrent();assert.equal(journal.retained().records.length,1);assert.equal(journal.reservationOutcome(),"reserved");
  assert.ok(fault.bytes!==null);const retained:unknown=JSON.parse(fault.bytes.toString("utf8"));assert.ok(isRecord(retained));const current=await loadOperation(request.operationId);
  assert.deepEqual(current.plan,retained["plan"]);assert.equal(current.planHash,retained["planHash"]);await assert.rejects(journal.reserve(),/RESERVATION_CONSUMED/u);
 }finally{context.mock.restoreAll();syncBuiltinESMExports();}
 await finishColdJournal(journal);
});
void test("cold journal never recreates an absent manifest after any original link invocation",async context=>{
 const request=coldRequest();const journal=new ColdJournal(request);const manifest=operationPath(request.operationId);let attempts=0;
 const originalLink=fsPromises.link;const injected=new Error("original link acknowledgment lost after publication");
 context.mock.method(fsPromises,"link",async(...args:Parameters<typeof originalLink>)=>{
  await originalLink(...args);
  if(basename(String(args[1]))===basename(manifest)){attempts+=1;await fsPromises.unlink(args[1]);throw injected;}
 });syncBuiltinESMExports();
 try{
  await assert.rejects(journal.reserve(),error=>error===injected);assert.equal(journal.reservationOutcome(),"create-unknown");
  await assert.rejects(loadOperation(request.operationId),missing);await assert.rejects(journal.settle(),missing);
  assert.equal(attempts,1);assert.equal(journal.retained().reserved,false);assert.equal(journal.retained().records.length,0);
 }finally{context.mock.restoreAll();syncBuiltinESMExports();}
});
void test("cold journal preserves a competing initial publication instead of adopting its nonce",async context=>{
 const request=coldRequest();const original=new ColdJournal(request),other=new ColdJournal(request);const manifest=operationPath(request.operationId);const fault=initialFault(context,manifest);
 try{
  await assert.rejects(original.reserve(),error=>error===fault.injected);fault.blocked=false;await other.reserve();const bytes=await readFile(manifest);
  await assert.rejects(original.settle(),/RESERVATION_CHANGED/u);assert.deepEqual(await readFile(manifest),bytes);assert.equal(original.retained().reserved,false);
 }finally{context.mock.restoreAll();syncBuiltinESMExports();}
 await finishColdJournal(other);
});

void test("cold initial retry refuses an operations directory replacement before any write",async context=>{
 const request=coldRequest();const journal=new ColdJournal(request);const manifest=operationPath(request.operationId);
 const fault=initialFault(context,manifest);await assert.rejects(journal.reserve(),error=>error===fault.injected);fault.blocked=false;
 context.mock.restoreAll();syncBuiltinESMExports();
 const directory=dirname(manifest);const backup=`${dirname(manifest)}-original-${randomBytes(8).toString("hex")}`;
 await fsPromises.rename(directory,backup);await fsPromises.mkdir(directory,{mode:0o700});
 let writes=0;const originalLink=fsPromises.link;
 context.mock.method(fsPromises,"link",async(...args:Parameters<typeof originalLink>)=>{writes+=1;await originalLink(...args);});syncBuiltinESMExports();
 try{await assert.rejects(journal.settle(),/INITIAL_DIRECTORY_CHANGED/u);assert.equal(writes,0);assert.equal(journal.retained().reserved,false);}
 finally{context.mock.restoreAll();syncBuiltinESMExports();await fsPromises.rmdir(directory);await fsPromises.rename(backup,directory);}
});
void test("cold initial retry requires the owned temporary cleanup directory sync",async context=>{
 const request=coldRequest();const journal=new ColdJournal(request);const manifest=operationPath(request.operationId);const directory=dirname(manifest);
 const fault=initialFault(context,manifest);const previousOpen=fsPromises.open;const cleanupError=new Error("injected cleanup directory sync");
 context.mock.method(fsPromises,"open",async(...args:Parameters<typeof previousOpen>)=>{
  const file=await previousOpen(...args);
  if(await readlink(`/proc/self/fd/${String(file.fd)}`)===directory){const sync=file.sync.bind(file);context.mock.method(file,"sync",async()=>{if(fault.attempts>0){throw cleanupError;}await sync();});}
  return file;
 });syncBuiltinESMExports();
 try{
  await assert.rejects(journal.reserve(),error=>error instanceof AggregateError&&error.cause===fault.injected);
  await assert.rejects(journal.settle(),missing);assert.equal(fault.attempts,1);assert.equal(journal.retained().reserved,false);
 }finally{context.mock.restoreAll();syncBuiltinESMExports();}
});
void test("cold settlement repairs only original serialized bytes after a visible uncertain link",async context=>{
 const request=coldRequest();const journal=new ColdJournal(request);const manifest=operationPath(request.operationId);
 const originalLink=fsPromises.link;const injected=new Error("injected visible-link acknowledgment failure");let attempts=0;
 context.mock.method(fsPromises,"link",async(...args:Parameters<typeof originalLink>)=>{
  await originalLink(...args);if(basename(String(args[1]))===basename(manifest)){attempts+=1;throw injected;}
 });syncBuiltinESMExports();
 try{await assert.rejects(journal.reserve(),error=>error===injected);}
 finally{context.mock.restoreAll();syncBuiltinESMExports();}
 const bytes=await readFile(manifest);const value:unknown=JSON.parse(bytes.toString("utf8"));assert.ok(isRecord(value));
 const reordered=Object.fromEntries(Object.entries(value).toReversed());
 await fsPromises.writeFile(manifest,`${JSON.stringify(reordered,null,2)}\n`);
 await assert.rejects(journal.settle());assert.equal(journal.retained().reserved,false);assert.equal(attempts,1);
 await fsPromises.writeFile(manifest,bytes);await journal.settle();await journal.assertCurrent();assert.equal(journal.retained().records.length,1);await finishColdJournal(journal);
});

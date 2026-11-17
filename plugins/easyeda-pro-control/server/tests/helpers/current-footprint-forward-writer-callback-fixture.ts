/* oxlint-disable import/max-dependencies -- Actual SDK stdio, original process observation, private profile and registration metadata remain independent; no provider/factory is replaced. */
/** Real bundled index/default provider with private configuration only. No
 * valid execute, status, runtime/start or upstream tool is sent by this fixture. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type {ChildProcess,SpawnOptions} from "node:child_process";
import {createHash} from "node:crypto";
import {lstat,mkdir,mkdtemp,readFile,rm,writeFile} from "node:fs/promises";
import {syncBuiltinESMExports} from "node:module";
import {join,resolve} from "node:path";
import type {TestContext} from "node:test";
import {setTimeout as delay} from "node:timers/promises";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";
import {ErrorCode,McpError} from "@modelcontextprotocol/sdk/types.js";
import {assertTestIsolation} from "../../../scripts/test-isolation.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL as TOOL} from "../../src/current-footprint-forward-writer-control-contract.ts";
import {machineProfileEnvironment} from "../../src/machine-profile.ts";
import {SDK_PUBLIC_UTILITIES_209_PROFILE as PROFILE} from "../../src/sdk-public-utilities-profile.ts";

type Reply=Awaited<ReturnType<Client["callTool"]>>;
function record(value:unknown):value is Record<string,unknown>{return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function result(reply:Reply):Record<string,unknown>{assert.notEqual(reply.isError,true);assert.ok(record(reply.structuredContent));const value=reply.structuredContent["result"];assert.ok(record(value));return value;}
export interface ForwardWriterCallbackFixture{
 readonly control:(request:Record<string,unknown>)=>Promise<Reply>;
 readonly malformed:(argumentsValue:Record<string,unknown>)=>Promise<void>;
 readonly cleanup:()=>Promise<Reply>;
 readonly assertOffline:()=>Promise<void>;
 readonly close:()=>Promise<void>;
}
export async function forwardWriterCallbackFixture(context:TestContext,operationId:string):Promise<ForwardWriterCallbackFixture>{
 const isolation=await assertTestIsolation();assert.equal(process.versions.node,"24.18.0");const root=await mkdtemp(join(isolation.temporaryDirectory,"easyeda-forward-callback-"));
 let child:ChildProcess|undefined,fixtureInitialized=false;
 context.after(async()=>{try{if(fixtureInitialized){await close();}}finally{context.mock.restoreAll();syncBuiltinESMExports();if(child===undefined){await rm(root,{recursive:true,force:true});}}});
 const assets=join(root,"absent-assets"),control=join(root,"control"),upstream=join(root,"upstream"),upstreamDist=join(upstream,"dist");for(const path of [assets,control,upstream,upstreamDist]){await mkdir(path,{mode:0o700});}
 const entry=join(upstreamDist,"index.js"),marker=join(root,"upstream-was-executed");await writeFile(entry,`import{writeFileSync}from'node:fs';writeFileSync(${JSON.stringify(marker)},'unexpected upstream');throw Error('upstream must remain absent');\n`,{mode:0o600});
 const profile={schema:"easyeda-pro-control.machine-profile.v1",platform:"linux-x64",runtime:{nodeExecutable:process.execPath,nodeVersion:"24.18.0",nodeSha256:createHash("sha256").update(await readFile(process.execPath)).digest("hex")},upstream:{root:upstream,entrypoint:entry,serverVersion:"1.0.0"},easyeda:{assetsRoot:assets,pcbBundleVersion:PROFILE.installedBundles.pcbEditor.version,publicApiBundleVersion:PROFILE.installedBundles.publicApi.version},controlDirectory:control};
 const profilePath=join(root,"machine-profile.json");await writeFile(profilePath,JSON.stringify(profile),{flag:"wx",mode:0o600});
 const plugin=resolve(import.meta.dirname,"../../..");const args=[join(plugin,"server/dist/server.mjs")];let closed=false,connected=false,preparationRequested=false;let calls=0,sequence=0,stderr="";const exit=Promise.withResolvers<Readonly<{code:number|null;signal:NodeJS.Signals|null}>>();
 const originalSpawn=childProcess.spawn;context.mock.method(childProcess,"spawn",(command:string,parameters:readonly string[],options:SpawnOptions):ChildProcess=>{
  assert.equal(command,process.execPath);assert.deepEqual(parameters,args);assert.equal(options.cwd,plugin);assert.equal(calls,0);calls+=1;const original=originalSpawn(command,parameters,options);child=original;
  original.once("close",(code,signal)=>{closed=true;exit.resolve({code,signal});});return original;
 });syncBuiltinESMExports();
 const transport=new StdioClientTransport({command:process.execPath,args,cwd:plugin,env:{...machineProfileEnvironment(profile),EASYEDA_MACHINE_PROFILE:profilePath,NODE_NO_WARNINGS:"1",TMPDIR:isolation.temporaryDirectory},stderr:"pipe",maxBufferSize:1_048_576});
 transport.stderr?.on("data",(chunk:Buffer)=>{stderr+=chunk.toString("utf8");assert.ok(Buffer.byteLength(stderr)<=65_536);});
 const client=new Client({name:"real-forward-callback-test",version:"1.0.0"},{capabilities:{}});
 async function call(name:string,argumentsValue:Record<string,unknown>):Promise<Reply>{
  const reply=await client.callTool({name,arguments:argumentsValue},undefined,{timeout:10_000,maxTotalTimeout:10_000});sequence+=1;
  await writeFile(join(root,`reply-${String(sequence)}.json`),JSON.stringify({name,arguments:argumentsValue,reply}),{flag:"wx",mode:0o600});return reply;
 }
 let cleanupPromise:Promise<Reply>|null=null,closing:Promise<void>|null=null;
 function cleanup():Promise<Reply>{cleanupPromise??=call(TOOL,{request:{action:"cleanup",operationId,confirmOriginalJobsOnly:true}});return cleanupPromise;}
 async function assertOffline():Promise<void>{await assert.rejects(lstat(marker),{code:"ENOENT"});assert.equal(calls,1);}
 async function settlePreparation():Promise<void>{
  if(!preparationRequested){return;}const cleaned=await cleanup();if(cleaned.isError===true){return;}
  for(let attempt=0;attempt<30;attempt+=1){const observed=result(await call(TOOL,{request:{action:"inspect",operationId}}));if(observed["state"]==="stopped"){return;}await delay(2);}
  throw new Error("Original local preparation cleanup did not settle.");
 }
 function close():Promise<void>{
  closing??=(async():Promise<void>=>{
   if(child===undefined){await client.close();await transport.close();return;}
   try{
    if(connected&&!closed){
     await settlePreparation();
     const retired=result(await call("easyeda_control_session",{request:{action:"retire",confirmRetire:true}}));assert.equal(retired["state"],"retired");assert.equal(retired["leaseReleaseAcknowledged"],true);
     await call("easyeda_control_session",{request:{action:"close-retired",confirmCloseRetired:true}});
    }
   }finally{
    // Normal original EOF is also the fallback after an assertion/SDK error.
    // Never invoke SDK close's signal fallback while its child is still live.
    if(!closed){child?.stdin?.end();}if(child!==undefined){const outcome=await exit.promise;assert.equal(outcome.code,0);assert.equal(outcome.signal,null);}
    if(closed){await client.close();await transport.close();}await assertOffline();assert.equal(stderr,"");
    await writeFile(join(root,"original-child-closed.json"),JSON.stringify({pid:child?.pid,closed,calls,stderr,signalled:false}),{flag:"wx",mode:0o600});
   }
  })();return closing;
 }
 fixtureInitialized=true;
 await client.connect(transport);connected=true;assert.ok(child!==undefined);assert.equal(transport.pid,child.pid);
 const loaded=result(await call("easyeda_control_api",{request:{action:"loaded-facade"}}));assert.equal(loaded["pid"],child.pid);assert.equal(loaded["admissionGranted"],false);
 const tools=await client.listTools();const tool=tools.tools.find(value=>value.name===TOOL);assert.ok(tool!==undefined,"Build the current Surface index before this actual callback regression.");assert.equal(tool.inputSchema.type,"object");assert.ok(record(tool.inputSchema.properties)&&record(tool.inputSchema.properties["request"]));
 return Object.freeze({control:(request:Record<string,unknown>):Promise<Reply>=>{if(request["action"]==="prepare"){preparationRequested=true;}return call(TOOL,{request});},
  malformed:async(argumentsValue:Record<string,unknown>):Promise<void>=>{
   let reply:Reply;try{reply=await call(TOOL,argumentsValue);}catch(error){assert.ok(error instanceof McpError);assert.equal(error.code,ErrorCode.InvalidParams);assert.match(error.message,/Input validation error: Invalid arguments for tool/u);return;}
   assert.equal(reply.isError,true);const content:unknown=reply.content;assert.ok(Array.isArray(content));const text:unknown=content.find((value:unknown)=>record(value)&&value["type"]==="text");assert.ok(record(text)&&typeof text["text"]==="string");assert.match(text["text"],/Input validation error: Invalid arguments for tool/u);
  },cleanup,assertOffline,close});
}

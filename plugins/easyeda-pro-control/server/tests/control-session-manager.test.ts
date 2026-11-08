/* oxlint-disable import/max-dependencies -- The actual manager regression owns frozen fixture builds, a private machine profile, child-process proof and exact MCP envelopes. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, copyFile, lstat, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Writable } from "node:stream";
import { setTimeout as wait } from "node:timers/promises";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

import { build } from "esbuild";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

import { ForegroundSessionManager, SessionManagerRetirementReservation, createManagerOutputPublisher, managerInputLines, parseSessionManagerRequest, runManagerInput, sessionManagerCallBudgetAvailable, sessionManagerRetirementBudgetAvailable, sessionManagerStartBudgetAvailable } from "../../scripts/control-session-manager.ts";
import { MAXIMUM_REQUEST_BYTES } from "../../scripts/control-session.ts";
import { ForegroundSessionTransport } from "../../scripts/control-session-transport.ts";
import { assertTestIsolation } from "../../scripts/test-isolation.ts";
import { CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE as SOURCE_HISTORY, currentFootprintForwardSourceRelinquishmentRequestSchema,
  currentFootprintForwardSourceRelinquishmentResultSchema } from "../src/current-footprint-forward-source-relinquishment-contract.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

const pluginRoot = resolve(import.meta.dirname, "../..");
const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Require object-shaped emitted JSON so assertions cannot accept null or an
 * array in place of a structured manager or facade result. */
const record = (value: unknown): Record<string, unknown> => {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
  return z.record(z.string(), z.unknown()).parse(value);
};
let actualBundle: Promise<Uint8Array> | undefined;
let nodeHash: Promise<string> | undefined;

/** Freeze the real facade index behind a synthetic private-profile launcher.
 * This tests manager ownership without admitting external software or live data. */
function bundleActualFacade(): Promise<Uint8Array> {
  actualBundle ??= (async (): Promise<Uint8Array> => {
    // This synthetic frozen launcher skips external-installation readiness and
    // Selects the REAL index with this test's private profile. It enables no
    // Application/upstream startup and never consults a live control directory.
    const source = `import {readFile} from 'node:fs/promises';
import {machineProfileEnvironment} from ${JSON.stringify(join(pluginRoot, "server/src/machine-profile.ts"))};
Object.assign(process.env,machineProfileEnvironment(JSON.parse(await readFile(process.env.EASYEDA_MACHINE_PROFILE,'utf8'))));
await import(${JSON.stringify(join(pluginRoot, "server/src/index.ts"))});`;
    const result = await build({ stdin: { contents: source, resolveDir: pluginRoot, loader: "ts" },
      bundle: true, platform: "node", format: "esm", target: "node24", write: false, logLevel: "silent",
      banner: { js: "import {createRequire as fixtureCreateRequire} from 'node:module';const require=fixtureCreateRequire(import.meta.url);" } });
    const output = result.outputFiles[0]; assert.ok(output);
    return output.contents;
  })();
  return actualBundle;
}

interface Fixture {
  readonly root: string;
  readonly control: string;
  readonly profilePath: string;
}

/** Build a canonical package and owner-only profile inside test isolation,
 * retaining its actual bundle hashes and leaving external installations absent. */
async function fixture(contents?: string): Promise<Fixture> {
  await assertTestIsolation();
  const root = await createTestTemporaryDirectory("easyeda-manager-fixture-");
  const control = join(root, "control"), packageRoot = join(root, "plugin");
  await mkdir(control, { mode: 0o700 });
  await mkdir(join(packageRoot, "server/dist"), { recursive: true });
  await mkdir(join(packageRoot, "server/bin"), { recursive: true });
  await copyFile(join(pluginRoot, ".mcp.json"), join(packageRoot, ".mcp.json"));
  const bytes = contents === undefined ? await bundleActualFacade() : Buffer.from(contents);
  await writeFile(join(packageRoot, "server/dist/server.mjs"), bytes);
  const files = [{ relativePath: "server.mjs", bytes: bytes.length, sha256: hash(bytes) }];
  for (const name of ["upstream-supervisor.mjs", "easyeda-fd-sanitizer"]) {
    const directory = name === "easyeda-fd-sanitizer" ? "bin" : "dist";
    const input = await readFile(join(pluginRoot, "server", directory, name));
    await writeFile(join(packageRoot, "server", directory, name), input);
    files.push({ relativePath: name, bytes: input.length, sha256: hash(input) });
  }
  const manifestText = await readFile(join(pluginRoot, "reviewed-compatibility.json"), "utf8");
  const manifest = record(JSON.parse(manifestText));
  const implementation = record(manifest["facadeImplementation"]);
  manifest["facadeImplementation"] = { ...implementation, bundle: { ...record(implementation["bundle"]), files } };
  await writeFile(join(packageRoot, "reviewed-compatibility.json"), JSON.stringify(manifest));
  nodeHash ??= (async (): Promise<string> => hash(await readFile(process.execPath)))();
  const profilePath = join(control, "machine-profile.json");
  await writeFile(profilePath, JSON.stringify({ schema: "easyeda-pro-control.machine-profile.v1", platform: "linux-x64",
    runtime: { nodeExecutable: process.execPath, nodeVersion: "24.18.0", nodeSha256: await nodeHash },
    upstream: { root: join(root, "absent-upstream"), entrypoint: join(root, "absent-upstream/dist/index.js"), serverVersion: "1.0.0" },
    easyeda: { assetsRoot: join(root, "absent-assets"), pcbBundleVersion: "3.2.absent", publicApiBundleVersion: "0.2.absent" },
    controlDirectory: control }), { mode: 0o600 });
  return { root: packageRoot, control, profilePath };
}

/** Select only this fixture's profile for the awaited operation and restore the
 * prior environment even when initialization, dispatch or publication fails. */
async function selectedProfile<T>(profilePath: string, operation: () => Promise<T>): Promise<T> {
  const previous = process.env["EASYEDA_MACHINE_PROFILE"];
  process.env["EASYEDA_MACHINE_PROFILE"] = profilePath;
  try { return await operation(); }
  finally {
    if (previous === undefined) { delete process.env["EASYEDA_MACHINE_PROFILE"]; }
    else { process.env["EASYEDA_MACHINE_PROFILE"] = previous; }
  }
}

const request = (value: unknown): string => JSON.stringify(value);
const retire = (id: string, generation: number): string => request({ id, action: "retire", generation, confirmRetire: true });
const loaded = (id: string): string => request({ id, tool: "easyeda_control_api", arguments: { request: { action: "loaded-facade" } } });

const sdkModule = (path: string): string => JSON.stringify(pathToFileURL(join(pluginRoot, "node_modules/@modelcontextprotocol/sdk/dist/esm", path)).href);
/** Emit one controlled RPC rejection or contradictory retirement reply from a
 * synthetic peer that closes itself without the manager signalling its child. */
function syntheticPeer(kind: "rpc-rejection" | "bad-retirement"): string {
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema,McpError} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-ambiguous-peer',version:'1.0.0'},{capabilities:{tools:{}}});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
 let value;
 if(params.name==='easyeda_control_api'&&params.arguments?.request?.action==='loaded-facade'){
 value={offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}};
 }else{
 setTimeout(()=>server.close(),200);
 if(${JSON.stringify(kind)}==='rpc-rejection'){throw new McpError(-32603,'private-peer-error');}
 value={result:{schema:'easyeda-pro-control.session-retirement.v1',state:'retired',activeCalls:0,liveAdmissionOpen:false,leaseReleaseAcknowledged:false,replacementConnectionRequired:true}};
 }
 return {content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value};
});
await server.connect(new StdioServerTransport());`;
}

/** Hold an actual SDK request through its timeout. Only the fixed same-owner
 * cleanup protocol can settle this synthetic native reservation and its records. */
function interruptedForwardPeer(largeInspection = false, failPendingInspection = false, sourceFamily = false): string {
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema,McpError} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-interrupted-forward',version:'1.0.0'},{capabilities:{tools:{}}});
const op=${JSON.stringify(sourceFamily ? 'footprint-forward-execution-timeout' : 'footprint-copy-qualify-timeout')},binding='a'.repeat(64),intent='b'.repeat(64),gate=Promise.withResolvers(),calls=[];
let active=0,aborted=false,released=false,releaseObserved=${JSON.stringify(!sourceFamily)},settled=false,captures=0,inspectionFailed=false;
const result=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const refused=()=>({isError:true,content:[{type:'text',text:'synthetic-original-owner-refusal'}]});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session','easyeda_control_pcb209_worker_startup'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
 const outer=params.arguments?.request;
 if(params.name==='easyeda_control_api'&&outer?.action==='loaded-facade')return result({offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}});
 if(params.name==='easyeda_control_session'){
  calls.push({tool:params.name,action:outer?.action});
  if(outer?.action==='retire'&&(active!==0||!released||!releaseObserved||!settled))return refused();
  const retired=outer?.action==='retire';
  return result({result:{schema:'easyeda-pro-control.session-retirement.v1',state:retired?'retired':'active',activeCalls:active,liveAdmissionOpen:!retired,leaseReleaseAcknowledged:retired,replacementConnectionRequired:retired}});
 }
 const request=outer?.request;
 calls.push({tool:params.name,action:request?.action,operationId:request?.operationId,binding:request?.expectedBindingSha256});
 if(params.name!=='easyeda_control_pcb209_worker_startup'||outer?.action!==${JSON.stringify(sourceFamily ? 'footprint-forward-source-validation' : 'footprint-forward-prewrite')}||request?.operationId!==op)return refused();
 if(request.action==='inspect'&&${JSON.stringify(failPendingInspection)}&&!inspectionFailed&&active>0){inspectionFailed=true;gate.resolve();throw new McpError(-32603,'synthetic-side-inspection-failure');}
 if(request.action==='inspect')return result({result:{operationId:op,bindingSha256:binding,intentSha256:intent,active,captures,aborted,released,releaseObserved,settled,calls,...(${JSON.stringify(largeInspection)}?{padding:'x'.repeat(1048576)}:{})}});
 if(request.action==='settle-records'){if(active!==0||(!${JSON.stringify(sourceFamily)}&&request.expectedIntentSha256!==intent))return refused();settled=true;return result({result:{operationId:op,settled:true}});}
 if(request.expectedBindingSha256!==binding)return refused();
 if(request.action===${JSON.stringify(sourceFamily ? 'capture-source' : 'capture-project')}){captures++;active++;await gate.promise;active--;return result({result:{operationId:op,lateCapture:true}});}
 if(request.action==='abort-generation'){if(aborted||request.confirmAbortOriginalForwardJob!==true)return refused();aborted=true;gate.resolve();return result({result:{operationId:op,terminationDispatched:true}});}
 if(request.action==='observe-termination')return result({result:{operationId:op,terminated:aborted&&active===0}});
 if(request.action==='release-closed'){if(!aborted||active!==0||released)return refused();released=true;if(${JSON.stringify(sourceFamily)})return refused();return result({result:{operationId:op,state:'released'}});}
 if(request.action==='observe-release'&&${JSON.stringify(sourceFamily)}&&released){releaseObserved=true;return result({result:{operationId:op,state:'released'}});}
 return refused();
});
// A failed regression still lets this inert peer finish naturally. Passing
// Requires manager-requested EOF before this separate fixture deadline.
setTimeout(()=>{gate.resolve();void server.close();},15000).unref();
await server.connect(new StdioServerTransport());`;
}

/** Keep the original launch pending while successive same-client inspections
 * exercise private-owner proof admission. This peer allocates no native app. */
function interruptedForwardLaunchPeer(): string {
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-interrupted-forward-launch',version:'1.0.0'},{capabilities:{tools:{}}});
const op='footprint-copy-qualify-launch-timeout',binding='a'.repeat(64),intent='b'.repeat(64),gate=Promise.withResolvers(),calls=[];
const native={helperInstance:'c'.repeat(32),jobId:'d'.repeat(32),rootPid:1234,rootCreated:'133760000000000000'};
const cases=['pending','not-retained','foreign-operation','malformed-binding','no-created-root','malformed-binding-digest','malformed-intent','error-envelope','outer-failure','nested-failure'];
let active=0,launches=0,inspections=0,aborted=false,released=false,settled=false;
const result=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const refused=()=>({isError:true,content:[{type:'text',text:'synthetic-original-launch-refusal'}]});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session','easyeda_control_pcb209_worker_startup'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
 const outer=params.arguments?.request;
 if(params.name==='easyeda_control_api'&&outer?.action==='loaded-facade')return result({offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}});
 if(params.name==='easyeda_control_session'){
  calls.push({tool:params.name,action:outer?.action});
  if(outer?.action==='retire'&&(active!==0||!released||!settled))return refused();
  const retired=outer?.action==='retire';
  return result({result:{schema:'easyeda-pro-control.session-retirement.v1',state:retired?'retired':'active',activeCalls:active,liveAdmissionOpen:!retired,leaseReleaseAcknowledged:retired,replacementConnectionRequired:retired}});
 }
 const request=outer?.request;
 calls.push({tool:params.name,action:request?.action,operationId:request?.operationId,binding:request?.expectedBindingSha256});
 if(params.name!=='easyeda_control_pcb209_worker_startup'||outer?.action!=='footprint-forward-prewrite'||request?.operationId!==op)return refused();
 if(request.action==='launch'){launches++;active++;await gate.promise;active--;return result({result:{operationId:op,lateLaunch:true}});}
 if(request.action==='inspect'){
  const proofCase=cases[inspections++]??'valid';
  const proof={operationId:op,state:'launched',launchAcknowledged:true,publicationSettlementAvailable:true,binding:native,bindingSha256:binding,intentSha256:intent,active,launches,aborted,released,settled,calls,proofCase};
  if(proofCase==='pending'){proof.state='launch-unknown';proof.launchAcknowledged=false;}
  if(proofCase==='not-retained')proof.publicationSettlementAvailable=false;
  if(proofCase==='foreign-operation')proof.operationId='footprint-copy-qualify-foreign';
  if(proofCase==='malformed-binding')proof.binding={...native,rootPid:0};
  if(proofCase==='no-created-root')proof.binding={...native,rootCreated:'0'};
  if(proofCase==='malformed-binding-digest')proof.bindingSha256='invalid';
  if(proofCase==='malformed-intent')proof.intentSha256='invalid';
  if(proofCase==='nested-failure')proof.ok=false;
  return {...result({result:proof,...(proofCase==='outer-failure'?{ok:false}:{})}),...(proofCase==='error-envelope'?{isError:true}:{})};
 }
 if(request.action==='settle-records'){if(active!==0||request.expectedIntentSha256!==intent)return refused();settled=true;return result({result:{operationId:op,settled:true}});}
 if(request.expectedBindingSha256!==binding)return refused();
 if(request.action==='abort-generation'){if(aborted||request.confirmAbortOriginalForwardJob!==true)return refused();aborted=true;gate.resolve();return result({result:{operationId:op,terminationDispatched:true}});}
 if(request.action==='observe-termination')return result({result:{operationId:op,terminated:aborted&&active===0}});
 if(request.action==='release-closed'){if(!aborted||active!==0||released)return refused();released=true;return result({result:{operationId:op,state:'released'}});}
 return refused();
});
// An unsuccessful regression releases only this inert SDK peer at its deadline.
setTimeout(()=>{gate.resolve();void server.close();},15000).unref();
await server.connect(new StdioServerTransport());`;
}

/** Reject one v2 launch before allocation, then acknowledge only its original
 * no-allocation cleanup. This peer owns no application or native handles. */
function rejectedSourceLaunchPeer(): string {
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema,McpError} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-source-preallocation',version:'1.0.0'},{capabilities:{tools:{}}});
const op='footprint-forward-execution-preallocation';let attempted=false,cleaned=false;
const result=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const refused=()=>({isError:true,content:[{type:'text',text:'synthetic-original-preallocation-refusal'}]});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session','easyeda_control_pcb209_worker_startup'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
 const outer=params.arguments?.request;
 if(params.name==='easyeda_control_api'&&outer?.action==='loaded-facade')return result({offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}});
 if(params.name==='easyeda_control_session'){
  if(outer?.action==='retire'&&!cleaned)return refused();const retired=outer?.action==='retire';
  return result({result:{schema:'easyeda-pro-control.session-retirement.v1',state:retired?'retired':'active',activeCalls:0,liveAdmissionOpen:!retired,leaseReleaseAcknowledged:retired,replacementConnectionRequired:retired}});
 }
 const input=outer?.request;
 if(params.name!=='easyeda_control_pcb209_worker_startup'||outer?.action!=='footprint-forward-source-validation'||input?.operationId!==op)return refused();
 if(input.action==='launch'&&!attempted){attempted=true;throw new McpError(-32603,'synthetic-preallocation-guard-failed');}
 if(input.action==='cleanup-before-launch'&&attempted&&!cleaned){cleaned=true;return result({result:{schema:'easyeda-pro-control.footprint-forward-source-validation-step.v1',operationId:op,action:input.action,result:{cleanupCompleted:true},executionReady:false,executionAuthorized:false,saveAuthorized:false}});}
 return refused();
});
setTimeout(()=>{void server.close();},15000).unref();await server.connect(new StdioServerTransport());`;
}

/** Return a launch, then retain one operation-only cleanup past its SDK
 * deadline. Only the same peer can prove any remaining synthetic owner. */
function interruptedSourceBookkeepingPeer(action: "settle-records" | "cleanup-before-launch" | "cleanup-no-process", activeBinding = false): string {
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-source-bookkeeping-timeout',version:'1.0.0'},{capabilities:{tools:{}}});
const op='footprint-forward-execution-bookkeeping',gate=Promise.withResolvers(),calls=[];
const binding='a'.repeat(64),intent='b'.repeat(64),native={helperInstance:'c'.repeat(32),jobId:'d'.repeat(32),rootPid:1234,rootCreated:'133760000000000000'};
const cases=${JSON.stringify(activeBinding ? ["pending", "not-retained", "foreign-operation", "malformed-binding", "no-created-root", "malformed-binding-digest", "error-envelope", "outer-failure"] : [])};
let launched=false,pending=false,completed=false,settled=false,aborted=false,released=false,inspections=0;
const result=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const refused=()=>({isError:true,content:[{type:'text',text:'synthetic-original-bookkeeping-refusal'}]});
const step=(action,value)=>result({result:{schema:'easyeda-pro-control.footprint-forward-source-validation-step.v1',operationId:op,action,result:value,executionReady:false,executionAuthorized:false,saveAuthorized:false}});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session','easyeda_control_pcb209_worker_startup','easyeda_control_native'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
 const outer=params.arguments?.request;
 if(params.name==='easyeda_control_api'&&outer?.action==='loaded-facade')return result({offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}});
 calls.push({tool:params.name,family:outer?.action,...outer?.request});
 if(params.name==='easyeda_control_session'){
  const retired=outer?.action==='retire';if(retired&&(!completed||!settled||pending||${JSON.stringify(activeBinding)}&&!released))return refused();
  return result({result:{schema:'easyeda-pro-control.session-retirement.v1',state:retired?'retired':'active',activeCalls:pending?1:0,liveAdmissionOpen:!retired,leaseReleaseAcknowledged:retired,replacementConnectionRequired:retired}});
 }
 const input=outer?.request;
 if(params.name!=='easyeda_control_pcb209_worker_startup'||outer?.action!=='footprint-forward-source-validation'||input?.operationId!==op)return refused();
 if(input.action==='launch'&&!launched){launched=true;return step('launch',{returned:true});}
 if(!launched)return refused();
 if(input.action===${JSON.stringify(action)}&&!completed&&!pending){pending=true;await gate.promise;completed=true;pending=false;return step(input.action,{completed:true});}
 if(input.action==='inspect'){
  gate.resolve();await gate.promise;
  const proofCase=cases[inspections++]??'valid';
  const proof={schema:'easyeda-pro-control.footprint-forward-source-validation-inspection.v1',operationId:op,state:${JSON.stringify(activeBinding ? "launched" : "new")},busy:false,cleanupBusy:pending,failed:false,publicationPending:false,publicationSettlementAvailable:${JSON.stringify(activeBinding)},intentSha256:${JSON.stringify(activeBinding)}?intent:null,binding:${JSON.stringify(activeBinding)}?native:null,bindingSha256:${JSON.stringify(activeBinding)}?binding:null,originalBindingRetained:${JSON.stringify(activeBinding)}&&!released,launchAcknowledged:${JSON.stringify(activeBinding)},helperClosed:!${JSON.stringify(activeBinding)}||released,terminationObserved:aborted,releaseAttempted:released,releaseObserved:released,windowAttempted:false,hwnd:null,windowOutcome:'not-attempted',windowFailureRetained:false,source:null,opening:null,channel:null,executionReady:false,executionAuthorized:false,saveAuthorized:false};
  if(proofCase==='pending')proof.publicationPending=true;
  if(proofCase==='not-retained')proof.originalBindingRetained=false;
  if(proofCase==='foreign-operation')proof.operationId='footprint-forward-execution-foreign';
  if(proofCase==='malformed-binding')proof.binding={...native,rootPid:0};
  if(proofCase==='no-created-root')proof.binding={...native,rootCreated:'0'};
  if(proofCase==='malformed-binding-digest')proof.bindingSha256='invalid';
  return {...result({result:proof,...(proofCase==='outer-failure'?{ok:false}:{}),telemetry:{calls,completed,settled,pending,aborted,released,proofCase}}),...(proofCase==='error-envelope'?{isError:true}:{})};
 }
 if(input.action==='settle-records'&&completed&&!pending){settled=true;return step(input.action,{recordsSettled:true});}
 if(!${JSON.stringify(activeBinding)}||input.expectedBindingSha256!==binding)return refused();
 if(input.action==='abort-generation'&&!aborted&&input.confirmAbortOriginalForwardJob===true){aborted=true;return step(input.action,{requested:true,originalJobOnly:true});}
 if(input.action==='observe-termination'&&aborted)return step(input.action,{terminated:true});
 if(input.action==='release-closed'&&aborted&&settled&&!released){released=true;return step(input.action,{released:true});}
 return refused();
});
// Failure closes only this inert peer at its own deadline, without signals.
setTimeout(()=>{gate.resolve();void server.close();},6000).unref();await server.connect(new StdioServerTransport());`;
}

type HistoricalSettlementCase = "pending" | "lost-settle-ack" | "no-pending" | "operation" | "manifest" | "roster" | "intent" | "binding" | "authority";
/** Data-only strict receipt for inert manager peers. No historical reader,
 * native observation, metadata publisher or process collector runs here. */
function historicalMetadataFixture(kind: HistoricalSettlementCase): Readonly<{
  original: z.infer<typeof currentFootprintForwardSourceRelinquishmentRequestSchema>;
  receipt: z.infer<typeof currentFootprintForwardSourceRelinquishmentResultSchema>;
}> {
  const digest = "a".repeat(64), operationId = "footprint-forward-execution-manager-history";
  const original = currentFootprintForwardSourceRelinquishmentRequestSchema.parse({ action: "relinquish-unknown-source-opening", operationId,
    expectedManifestSha256: kind === "manifest" ? digest : SOURCE_HISTORY.manifestSha256,
    expectedRosterSha256: kind === "roster" ? digest : SOURCE_HISTORY.rosterSha256,
    expectedIntentSha256: digest, expectedBindingSha256: "b".repeat(64), confirmRelinquishUnknownSourceOpening: true, acceptUnknownCaptureOutcome: true });
  const absence = { schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1", samples: 2, otherPowerShellPresent: false,
    sameNameProcessPresent: false, helperSha256: "8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa" };
  const receipt = currentFootprintForwardSourceRelinquishmentResultSchema.parse({ schema: "easyeda-pro-control.footprint-forward-source-relinquished.v1",
    operationId, originalManifestSha256: SOURCE_HISTORY.manifestSha256, originalCanonicalManifestSha256: SOURCE_HISTORY.canonicalManifestSha256,
    originalRosterSha256: SOURCE_HISTORY.rosterSha256, originalStoredJournalSha256: digest, originalIntentSha256: digest,
    originalBindingSha256: original.expectedBindingSha256, originalIdentitySha256: digest, externallyReviewedSourceCodeTuple: SOURCE_HISTORY.code,
    createdAt: "2026-11-05T00:00:00.000Z", relinquishmentIntentSha256: digest, observationNonceSha256: digest,
    observationBefore: absence, observation: absence, otherLinuxFacadePresent: false, linuxFacadeSamples: 2,
    fileProof: { profile: "private.current-footprint-forward-opening-file-proof.v1", projectUuid: digest, branchUuid: "c".repeat(32), documentUuid: "d".repeat(16),
      oldCheckpointSha256: digest, freshCheckpointSha256: digest, oldCheckpointReceiptSha256: digest, freshCheckpointReceiptSha256: digest,
      beforeSqlSha256: digest, freshSqlSha256: digest, rawSourceSha256: digest, oldHistorySemanticSha256: digest, freshHistorySemanticSha256: digest,
      fullSqlEqual: true, historyEqual: true, sidecarsAbsent: true, executionAuthorized: false, writerAuthority: false, restored: false },
    captureOutcome: "unknown", terminationOutcome: "unknown", helperReleaseOutcome: "unknown", terminationProved: false,
    nativeResourcesReleased: false, helperReleaseAcknowledged: false, originalLaunchIdentityVerified: false, retainedLaunchAuthority: false,
    originalJournalUntouched: true, startupBlockerRelinquished: true, historicalCompletionVerified: false, authorityRestored: false,
    replayAllowed: false, executionReady: false, executionAuthorized: false, designExecutionAuthorized: false, saveAuthorized: false });
  return { original, receipt };
}

/** Hold one real SDK deadline, then emulate only retained metadata settlement.
 * Lost ACK, BUSY and no-pending responses never initiate another collection. */
function historicalMetadataPeer(kind: HistoricalSettlementCase): string {
  const { original, receipt } = historicalMetadataFixture(kind);
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema,McpError} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-source-historical-settlement',version:'1.0.0'},{capabilities:{tools:{}}});
const original=${JSON.stringify(original)},receipt=${JSON.stringify(receipt)},kind=${JSON.stringify(kind)},gate=Promise.withResolvers(),calls=[];
let busy=false,pending=false,complete=false,collections=0,settlements=0,lost=false;
const result=value=>({content:[{type:'text',text:JSON.stringify({telemetry:{calls,collections,settlements,busy,pending,complete}})}],structuredContent:value});
const refused=()=>({isError:true,content:[{type:'text',text:'synthetic-historical-refusal'}]});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session','easyeda_control_pcb209_worker_startup','easyeda_control_native'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
 const outer=params.arguments?.request;
 if(params.name==='easyeda_control_api'&&outer?.action==='loaded-facade')return result({offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}});
 calls.push({tool:params.name,outer});
 if(params.name==='easyeda_control_session'){
  const retired=outer?.action==='retire';if(retired&&(busy||pending))return refused();
  return result({result:{schema:'easyeda-pro-control.session-retirement.v1',state:retired?'retired':'active',activeCalls:busy?1:0,liveAdmissionOpen:!retired,leaseReleaseAcknowledged:retired,replacementConnectionRequired:retired}});
 }
 const input=outer?.request;
 if(params.name!=='easyeda_control_pcb209_worker_startup'||outer?.action!=='footprint-forward-source-relinquishment')return refused();
 if(input?.action==='relinquish-unknown-source-opening'&&collections===0){collections++;busy=true;await gate.promise;busy=false;pending=kind!=='no-pending';throw new McpError(-32603,'synthetic-original-publication-unknown');}
 if(JSON.stringify(input)!==JSON.stringify({...original,action:'settle-unknown-source-opening'}))return refused();
 settlements++;
 if(busy){gate.resolve();throw new McpError(-32603,'synthetic-BUSY');}
 if(!pending&&!complete)throw new McpError(-32603,'synthetic-RETAINED_METADATA_REQUIRED');
 pending=false;complete=true;
 if(kind==='lost-settle-ack'&&!lost){lost=true;throw new McpError(-32603,'synthetic-lost-settlement-ACK');}
 const acknowledged={...receipt};
 if(kind==='operation')acknowledged.operationId='footprint-forward-execution-foreign-history';
 if(kind==='intent')acknowledged.originalIntentSha256='f'.repeat(64);
 if(kind==='binding')acknowledged.originalBindingSha256='f'.repeat(64);
 if(kind==='authority')acknowledged.authorityRestored=true;
 return result({result:acknowledged});
});
setTimeout(()=>{gate.resolve();void server.close();},6000).unref();await server.connect(new StdioServerTransport());`;
}

/** Poll retained child exit/close evidence and fail if no observation becomes
 * available before the monotonic deadline. */
async function waitForObservedClosure(observed: () => boolean): Promise<void> {
  const deadline = performance.now() + 5000;
  while (!observed()) {
    const remaining = deadline - performance.now();
    assert.ok(remaining > 0, "Original child closure was not observed before the test deadline.");
    await wait(Math.min(10, remaining));
  }
}

/** Deliver explicit byte boundaries without decoding or coercing test input. */
async function* inputChunks(values: readonly Buffer[]): AsyncGenerator<Buffer> { await Promise.resolve(); yield* values; }

void test("manager framing drains one oversized frame, preserves split UTF-8 and rejects closed tails", async () => {
  const exact = Buffer.alloc(MAXIMUM_REQUEST_BYTES, 0x20);
  const chunks = [
    exact, Buffer.from("\n"), exact, Buffer.from("x"), Buffer.alloc(MAXIMUM_REQUEST_BYTES * 3, 0x78), Buffer.from("\n"),
    Buffer.from([0xF0, 0x9F]), Buffer.from([0x8E, 0xB9, 10]), Buffer.from([0xE2]), Buffer.from([0x28, 0xA1, 10]),
    Buffer.from("next\npartial"),
  ];
  const values = await Array.fromAsync(managerInputLines(inputChunks(chunks)));
  assert.deepEqual(values, [exact.toString(), { reason: "request-too-large" }, "🎹", { reason: "invalid-utf8" }, "next", { reason: "incomplete-request-line" }]);
  const oversizedEof = Buffer.alloc(MAXIMUM_REQUEST_BYTES + 1);
  const rejectedEof = await Array.fromAsync(managerInputLines(inputChunks([oversizedEof])));
  assert.deepEqual(rejectedEof, [{ reason: "request-too-large" }]);
  const bom = Buffer.from("\uFEFF{}\n");
  const preservedBom = await Array.fromAsync(managerInputLines(inputChunks([bom])));
  assert.deepEqual(preservedBom, ["\uFEFF{}"]);
});

void test("actual manager input loop rejects oversized and invalid UTF-8 frames then retires its same original child", { timeout: 30_000 }, async () => {
  const outputs: unknown[] = [], selected = await fixture();
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(selected.root);
    const original = manager.inspect()["facadePid"], sentinel = "private-discarded-input";
    assert.ok(typeof original === "number");
    try {
      const oversized = Buffer.from(sentinel.repeat(Math.ceil((MAXIMUM_REQUEST_BYTES + 1) / sentinel.length)));
      const followups = `${request({ id: "same-owner-after-input-rejection", action: "inspect" })}\n${loaded("same-offline-child")}\n${retire("retire-after-input-rejection", 1)}\n${request({ id: "close-after-input-rejection", action: "shutdown" })}\n`;
      const chunks = [
        oversized.subarray(0, MAXIMUM_REQUEST_BYTES), oversized.subarray(MAXIMUM_REQUEST_BYTES), Buffer.from("\n"),
        Buffer.from([0xC3]), Buffer.from([0x28, 10]), Buffer.from("{malformed}\n"), Buffer.from(followups),
      ];
      const result = await runManagerInput(manager, inputChunks(chunks));
      assert.equal(result, "closed"); assert.equal(manager.inspect()["stage"], "closed");
      const rows = outputs.map(value => record(value));
      const rejected = rows.filter(row => row["error"] === "manager-request-rejected");
      assert.deepEqual(rejected.map(row => record(row["diagnostic"])["reason"]), ["request-too-large", "invalid-utf8", "json-rejected"]);
      assert.ok(rejected.every(row => row["dispatched"] === false && row["originalOwnerRetained"] === true));
      const inspected = record(rows.find(row => row["id"] === "same-owner-after-input-rejection")?.["manager"]);
      assert.equal(inspected["facadePid"], original); assert.equal(inspected["generation"], 1); assert.equal(inspected["stage"], "active");
      const offline = record(record(rows.find(row => row["id"] === "same-offline-child")?.["result"])["structuredContent"]);
      assert.equal(record(offline["result"])["pid"], original);
      const retired = rows.find(row => row["id"] === "retire-after-input-rejection"); assert.equal(retired?.["retired"], true);
      assert.deepEqual(record(retired?.["closure"]), { pid: original, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
      assert.equal(JSON.stringify(outputs).includes(sentinel), false); assert.equal(JSON.stringify(outputs).includes("{malformed}"), false);
      await assert.rejects(lstat(`/proc/${String(original)}`), { code: "ENOENT" });
    } finally {
      // This test retains the same manager object through any assertion failure.
      // Cleanup uses its original retirement path, never a signal or takeover.
      if (manager.inspect()["stage"] === "active") { await manager.handle(retire("inert-input-test-cleanup", 1)); }
      if (manager.inspect()["stage"] === "between-facades") { await manager.handle(request({ id: "inert-input-test-close", action: "shutdown" })); }
    }
  });
});

void test("manager grammar refuses executable hooks, generic retirement and reconstructed replacement authority", () => {
  assert.equal(parseSessionManagerRequest(retire("r", 1)).id, "r");
  for (const value of [
    { id: 1, action: "start", afterGeneration: 1, pluginRoot: "/root/plugin", command: "sh" },
    { id: 1, action: "retire", generation: 1, confirmRetire: true, force: true },
    { id: 1, tool: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } },
    { id: 1, action: "start", afterGeneration: 1, pluginRoot: "/root/plugin/../other" },
    { id: 1, shutdown: true },
  ]) { assert.throws(() => parseSessionManagerRequest(request(value))); }
});

void test("actual manager preserves ambiguous capture and permits only same-owner cleanup before real retirement and closure", { timeout: 12_000 }, async () => {
  const outputs: unknown[] = [], selected = await fixture(interruptedForwardPeer());
  const inspectionEntered = Promise.withResolvers<null>(); const inspectionAllowed = Promise.withResolvers<null>();
  const expectedBindingSha256 = "a".repeat(64), operationId = "footprint-copy-qualify-timeout";
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => {
      outputs.push(value);
      if (record(value)["id"] === "local-timeout-inspect") { inspectionEntered.resolve(null); await inspectionAllowed.promise; }
      await Promise.resolve();
    });
    await manager.initialize(selected.root);
    const originalPid = manager.inspect()["facadePid"];
    const output = (): Record<string, unknown> => record(outputs.at(-1));
    const toolResult = (): Record<string, unknown> => record(output()["result"]);
    const observed = (): Record<string, unknown> => record(record(toolResult()["structuredContent"])["result"]);
    const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId: "interrupted-capture", request: { action, ...extra } });
    const originalBudgets = manager.inspect()["budgets"];
    await manager.handle(cleanup("unauthorized-active-cleanup", "inspect"));
    assert.equal(output()["error"], "manager-request-rejected"); assert.equal(manager.inspect()["stage"], "active");
    assert.deepEqual(manager.inspect()["budgets"], originalBudgets);
    const rawWindowsPath = String.raw`C:\Disposable\fixture.eprj2`;
    const capture = { id: "interrupted-capture", tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 1000,
      arguments: { request: { action: "footprint-forward-prewrite", request: { action: "capture-project", operationId, expectedBindingSha256,
        target: { rawWindowsPath, projectUuid: hash(Buffer.from(rawWindowsPath)), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) },
        confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true } } } };
    const pendingCapture = manager.handle(request(capture));
    await managerProgress(() => manager.inspect()["inFlightRequest"] !== null && record(manager.inspect()["inFlightRequest"])["rpcPending"] === true);
    const localInspection = manager.handleInFlight(request({ id: "local-timeout-inspect", action: "inspect" }));
    await inspectionEntered.promise;
    await managerProgress(() => record(manager.inspect()["inFlightRequest"])["rpcPending"] === false);
    assert.equal(manager.inspect()["requestPending"], true);
    await assert.rejects(manager.handle(retire("backpressured-local-inspect-retire", 1)), /manager-request-pending/u);
    inspectionAllowed.resolve(null); await localInspection; await pendingCapture;
    assert.equal(output()["error"], "manager-blocked");
    assert.equal(record(output()["diagnostic"])["reason"], "request-timeout");
    assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["closure"], null);
    assert.equal(record(manager.inspect()["interruptedRequest"])["outcome"], "unknown");
    assert.equal(record(manager.inspect()["interruptedRequest"])["cleanupAvailable"], true);
    await manager.handle(retire("before-cleanup-refused", 1));
    assert.equal(output()["retirementRefused"], true); assert.equal(manager.inspect()["stage"], "blocked");
    for (const rejected of [
      loaded("blocked-normal"), request({ ...capture, id: "blocked-replay", cleanup: true }),
      request({ id: "blocked-replacement", action: "start", afterGeneration: 1, pluginRoot: selected.root }),
      request({ id: "foreign-request", action: "cleanup-original", generation: 1, interruptedRequestId: "foreign", request: { action: "inspect" } }),
      request({ id: "foreign-generation", action: "cleanup-original", generation: 2, interruptedRequestId: "interrupted-capture", request: { action: "inspect" } }),
      cleanup("foreign-operation", "inspect", { operationId: "footprint-copy-qualify-foreign" }),
      cleanup("foreign-binding", "observe-termination", { expectedBindingSha256: "f".repeat(64) }),
      cleanup("legacy-release-observer", "observe-release"),
      cleanup("blocked-cleanup-replay", "capture-project"),
    ]) {
      await manager.handle(rejected); assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], originalPid);
      assert.equal(output()["retryAllowed"], false);
    }
    await manager.handle(cleanup("no-fabricated-intent", "settle-records"));
    assert.equal(output()["error"], "manager-request-rejected");
    await manager.handle(cleanup("same-original-inspection", "inspect"));
    let inspected = observed();
    assert.equal(inspected["captures"], 1); assert.equal(inspected["active"], 1);
    assert.deepEqual(inspected["calls"], [
      { tool: "easyeda_control_pcb209_worker_startup", action: "capture-project", operationId, binding: expectedBindingSha256 },
      { tool: "easyeda_control_session", action: "retire" }, { tool: "easyeda_control_session", action: "inspect" },
      { tool: "easyeda_control_pcb209_worker_startup", action: "inspect", operationId },
    ]);
    await manager.handle(cleanup("refused-live-release", "release-closed"));
    assert.equal(toolResult()["isError"], true); assert.equal(manager.inspect()["stage"], "blocked");
    await manager.handle(cleanup("abort-original", "abort-generation", { confirmAbortOriginalForwardJob: true }));
    await manager.handle(cleanup("observe-original-exit", "observe-termination"));
    await manager.handle(cleanup("settle-original-records", "settle-records"));
    await manager.handle(cleanup("release-original-helper", "release-closed"));
    await manager.handle(cleanup("still-original", "inspect"));
    inspected = observed();
    assert.equal(inspected["active"], 0); assert.equal(inspected["released"], true); assert.equal(inspected["settled"], true);
    assert.equal(inspected["captures"], 1); assert.equal(manager.inspect()["facadePid"], originalPid);
    assert.equal(record(manager.inspect()["interruptedRequest"])["outcome"], "unknown");
    await manager.handle(retire("retire-after-original-cleanup", 1));
    const retired = output(); assert.equal(retired["retired"], true); assert.equal(retired["replacementAllowed"], true);
    assert.deepEqual(record(retired["closure"]), { pid: originalPid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
    await assert.rejects(lstat(`/proc/${String(originalPid)}`), { code: "ENOENT" });
    const rows = manager.inspect()["records"]; assert.ok(Array.isArray(rows));
    const raw = await Promise.all(rows.map(row => readFile(String(record(row)["evidenceFile"]), "utf8")));
    assert.match(raw.join("\n"), /request-timeout/u); assert.match(raw.join("\n"), /original-cleanup-result/u);
    await manager.handle(request({ id: "closed-original-manager", action: "shutdown" }));
    assert.equal(manager.inspect()["stage"], "closed");
  });
});

void test("pre-emit delivery refusal retains complete results and the original normal and interrupted cleanup channels", { timeout: 15_000 }, async () => {
  const outputs: unknown[] = [], selected = await fixture(interruptedForwardPeer(true));
  const expectedBindingSha256 = "a".repeat(64), operationId = "footprint-copy-qualify-timeout";
  const interruptedRequestId = "interrupted-publication-capture";
  const publicDirectory = join(selected.control, "public-response");
  await mkdir(publicDirectory); await chmod(publicDirectory, 0o755);
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(selected.root);
    const originalPid = manager.inspect()["facadePid"];
    const output = (): Record<string, unknown> => record(outputs.at(-1));
    const cleanup = (id: string, action: string, extra: object = {}): object => ({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId: record(manager.inspect()["interruptedRequest"])["id"], request: { action, ...extra } });
    for (const interrupted of [false, true]) {
      if (interrupted) {
        const rawWindowsPath = String.raw`C:\Disposable\fixture.eprj2`;
        const projectUuid = hash(Buffer.from(rawWindowsPath));
        await manager.handle(request({ id: interruptedRequestId, tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 1000,
          arguments: { request: { action: "footprint-forward-prewrite", request: { action: "capture-project", operationId, expectedBindingSha256,
            target: { rawWindowsPath, projectUuid, documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) },
            confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true } } } }));
        assert.equal(output()["error"], "manager-blocked");
      }
      for (const usePublicDirectory of [false, true]) {
        const id = `refusal-${String(interrupted)}-${String(usePublicDirectory)}`;
        const responseFile = join(publicDirectory, `${id}.json`);
        const call = interrupted ? cleanup(id, "inspect") : { id, tool: "easyeda_control_pcb209_worker_startup",
          arguments: { request: { action: "footprint-forward-prewrite", request: { action: "inspect", operationId } } } };
        await manager.handle(request({ ...call, ...(usePublicDirectory ? { responseFile } : {}) }));
        const refused = output();
        assert.equal(refused["error"], "result-publication-refused");
        assert.equal(refused["reason"], usePublicDirectory ? "response-directory-must-be-private-and-canonical" : "result-needs-response-file");
        assert.equal(refused["dispatched"], true); assert.equal(refused["retryAllowed"], false);
        assert.equal(refused["resultRetainedInEvidence"], true);
        const bytes = await readFile(String(refused["evidenceFile"]));
        assert.equal(bytes.length, refused["bytes"]); assert.equal(hash(bytes), refused["sha256"]);
        const journal = record(JSON.parse(bytes.toString("utf8"))), value = record(journal["value"]);
        const result = record(value["result"]), retained = record(result["structuredContent"]);
        assert.equal(record(retained["result"])["padding"], "x".repeat(1_048_576));
        assert.equal(manager.inspect()["stage"], interrupted ? "blocked" : "active");
        assert.equal(manager.inspect()["publicationFault"], false); assert.equal(manager.inspect()["evidenceFault"], false);
        assert.equal(manager.inspect()["facadePid"], originalPid); assert.equal(manager.inspect()["generation"], 1);
        if (interrupted) { assert.equal(record(manager.inspect()["interruptedRequest"])["cleanupAvailable"], true); }
        await assert.rejects(lstat(responseFile), { code: "ENOENT" });
      }
    }
    await manager.handle(request(cleanup("abort-after-delivery-refusal", "abort-generation", { confirmAbortOriginalForwardJob: true })));
    await manager.handle(request(cleanup("observe-after-delivery-refusal", "observe-termination")));
    await manager.handle(request(cleanup("settle-after-delivery-refusal", "settle-records")));
    await manager.handle(request(cleanup("release-after-delivery-refusal", "release-closed")));
    await manager.handle(retire("retire-after-delivery-refusal", 1));
    assert.equal(output()["retired"], true);
    assert.deepEqual(record(output()["closure"]), { pid: originalPid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
    await manager.handle(request({ id: "shutdown-after-delivery-refusal", action: "shutdown" }));
    assert.equal(manager.inspect()["stage"], "closed");
  });
});

void test("interrupted launch learns cleanup identity only from the original client's complete private-owner inspection", { timeout: 15_000 }, async () => {
  const outputs: unknown[] = [], selected = await fixture(interruptedForwardLaunchPeer());
  const expectedBindingSha256 = "a".repeat(64), operationId = "footprint-copy-qualify-launch-timeout";
  const interruptedRequestId = "interrupted-original-launch";
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(selected.root);
    const originalPid = manager.inspect()["facadePid"];
    const output = (): Record<string, unknown> => record(outputs.at(-1));
    const interrupted = (): Record<string, unknown> => record(manager.inspect()["interruptedRequest"]);
    const observed = (): Record<string, unknown> => {
      const result = record(output()["result"]);
      const envelope = record(result["structuredContent"]); return record(envelope["result"]);
    };
    const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId, request: { action, ...extra } });
    const launch = { id: interruptedRequestId, tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 1000,
      arguments: { request: { action: "footprint-forward-prewrite", request: { action: "launch", operationId,
        confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true } } } };
    await manager.handle(request(launch));
    assert.equal(output()["error"], "manager-blocked"); assert.equal(record(output()["diagnostic"])["reason"], "request-timeout");
    assert.equal(interrupted()["forward"], null); assert.equal(interrupted()["cleanupAvailable"], true);
    assert.equal(interrupted()["outcome"], "unknown");
    for (const rejected of [
      loaded("blocked-launch-normal"), request({ ...launch, id: "blocked-launch-replay", cleanup: true }),
      request({ id: "blocked-launch-start", action: "start", afterGeneration: 1, pluginRoot: selected.root }),
      request({ id: "blocked-launch-startup-cleanup", action: "cleanup-startup", confirmCloseOriginalStartup: true }),
      request({ id: "foreign-launch-request", action: "cleanup-original", generation: 1, interruptedRequestId: "foreign", request: { action: "inspect" } }),
      request({ id: "foreign-launch-generation", action: "cleanup-original", generation: 2, interruptedRequestId, request: { action: "inspect" } }),
      cleanup("foreign-launch-operation", "inspect", { operationId: "footprint-copy-qualify-foreign" }),
      cleanup("foreign-launch-binding", "observe-termination", { expectedBindingSha256: "f".repeat(64) }),
      cleanup("uninspected-launch-abort", "abort-generation", { confirmAbortOriginalForwardJob: true }),
      cleanup("uninspected-launch-settle", "settle-records"), retire("uninspected-launch-retire", 1),
    ]) {
      await manager.handle(rejected);
      assert.equal(output()["error"], "manager-request-rejected"); assert.equal(output()["dispatched"], false);
      assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], originalPid);
    }
    for (const proofCase of ["pending", "not-retained", "foreign-operation", "malformed-binding", "no-created-root",
      "malformed-binding-digest", "malformed-intent", "error-envelope", "outer-failure", "nested-failure"]) {
      await manager.handle(cleanup(`inspect-launch-${proofCase}`, "inspect"));
      assert.equal(observed()["proofCase"], proofCase); assert.equal(interrupted()["forward"], null);
      assert.equal(interrupted()["cleanupAvailable"], true); assert.equal(interrupted()["outcome"], "unknown");
      await manager.handle(cleanup(`abort-launch-${proofCase}`, "abort-generation", { confirmAbortOriginalForwardJob: true }));
      assert.equal(output()["error"], "manager-request-rejected"); assert.equal(output()["dispatched"], false);
      await manager.handle(retire(`retire-launch-${proofCase}`, 1));
      assert.equal(output()["error"], "manager-request-rejected"); assert.equal(output()["dispatched"], false);
    }
    await manager.handle(cleanup("inspect-original-launch-proof", "inspect"));
    const proof = observed(); assert.equal(proof["proofCase"], "valid"); assert.equal(proof["active"], 1); assert.equal(proof["launches"], 1);
    assert.deepEqual(interrupted()["forward"], { operationId, bindingSha256: expectedBindingSha256 });
    const beforeCleanup = proof["calls"]; assert.ok(Array.isArray(beforeCleanup));
    assert.deepEqual(beforeCleanup.map(row => record(row)["action"]), ["launch", ...Array.from({ length: 11 }, () => "inspect")]);
    await manager.handle(cleanup("abort-original-launch", "abort-generation", { confirmAbortOriginalForwardJob: true }));
    await manager.handle(cleanup("observe-original-launch-exit", "observe-termination"));
    await manager.handle(cleanup("settle-original-launch-records", "settle-records"));
    await manager.handle(cleanup("release-original-launch-helper", "release-closed"));
    await manager.handle(cleanup("inspect-original-launch-cleanup", "inspect"));
    const complete = observed(); assert.equal(complete["active"], 0); assert.equal(complete["released"], true); assert.equal(complete["settled"], true);
    assert.equal(complete["launches"], 1); assert.equal(interrupted()["outcome"], "unknown");
    const calls = complete["calls"]; assert.ok(Array.isArray(calls));
    for (const row of calls.map(value => record(value)).filter(value => ["abort-generation", "observe-termination", "release-closed"].includes(String(value["action"])))) {
      assert.equal(row["operationId"], operationId); assert.equal(row["binding"], expectedBindingSha256);
    }
    await manager.handle(retire("retire-original-launch-after-cleanup", 1));
    assert.equal(output()["retired"], true);
    assert.deepEqual(record(output()["closure"]), { pid: originalPid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
    await assert.rejects(lstat(`/proc/${String(originalPid)}`), { code: "ENOENT" });
    await manager.handle(request({ id: "shutdown-original-launch-manager", action: "shutdown" }));
    assert.equal(manager.inspect()["stage"], "closed");
  });
});

void test("normal and cleanup budgets refuse before dispatch and preserve separate control evidence capacity", () => {
  assert.equal(sessionManagerCallBudgetAvailable(false, 4094, 0), true);
  assert.equal(sessionManagerCallBudgetAvailable(false, 4095, 0), false);
  assert.equal(sessionManagerCallBudgetAvailable(false, 0, 1_073_741_824 - 67_108_864 - 65_536), true);
  assert.equal(sessionManagerCallBudgetAvailable(false, 0, 1_073_741_824 - 67_108_864 - 65_535), false);
  assert.equal(sessionManagerCallBudgetAvailable(true, 126, 0), true);
  assert.equal(sessionManagerCallBudgetAvailable(true, 127, 0), false);
  assert.equal(sessionManagerRetirementBudgetAvailable(120, 0), true);
  assert.equal(sessionManagerRetirementBudgetAvailable(121, 0), false);
  assert.equal(sessionManagerRetirementBudgetAvailable(0, 4_194_304 - 131_072), true);
  assert.equal(sessionManagerRetirementBudgetAvailable(0, 4_194_304 - 131_071), false);
  assert.equal(sessionManagerStartBudgetAvailable(117, 0), true);
  assert.equal(sessionManagerStartBudgetAvailable(118, 0), false);
  assert.equal(sessionManagerStartBudgetAvailable(125, 0), false);
  for (const value of [-1, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.equal(sessionManagerCallBudgetAvailable(false, value, 0), false);
    assert.equal(sessionManagerCallBudgetAvailable(false, 0, value), false);
  }
});

void test("cleanup exhaustion preserves one final original retirement with a consumed refusal latch", () => {
  const reservation = new SessionManagerRetirementReservation();
  assert.equal(reservation.reserve(2, 0, 125, 0), "ordinary");
  assert.equal(reservation.finalAttemptConsumed(), false);
  // Forty-two active refusals followed by one original cleanup call fill all
  // Cleanup records. Untouched control capacity still admits final retirement.
  assert.equal(reservation.reserve(2, 0, 128, 0), "final");
  assert.equal(reservation.finalAttemptConsumed(), true);
  assert.throws(() => reservation.reserve(5, 0, 128, 0), /manager-control-budget-exhausted/u);
  assert.throws(() => reservation.reserve(2, 0, 0, 0), /manager-control-budget-exhausted/u);
});

void test("actual manager retains a conflicting startup catalog and explicitly closes only its own unused startup child", { timeout: 45_000 }, async () => {
  const selected = await fixture();
  const conflictOutputs: unknown[] = [], ownerOutputs: unknown[] = [];
  await selectedProfile(selected.profilePath, async () => {
    const retained: ForegroundSessionManager[] = [];
    try {
      const owner = new ForegroundSessionManager(async value => { ownerOutputs.push(value); await Promise.resolve(); });
      retained.push(owner);
      await owner.initialize(selected.root);
      const ownerPid = owner.inspect()["facadePid"];
      const conflict = new ForegroundSessionManager(async value => { conflictOutputs.push(value); await Promise.resolve(); });
      retained.push(conflict);
      await assert.rejects(conflict.initialize(selected.root), /unexpected-facade-catalog/u);
      const blocked = conflict.inspect(), childPid = blocked["facadePid"];
      assert.equal(blocked["generation"], 0); assert.equal(blocked["stage"], "blocked");
      assert.equal(blocked["callerToolDispatchStarted"], false); assert.notEqual(childPid, ownerPid);
      const records = blocked["records"]; assert.ok(Array.isArray(records));
      const catalogRecord = records.map(row => record(row)).find(row => row["kind"] === "startup-catalog"); assert.ok(catalogRecord);
      const catalogText = await readFile(String(catalogRecord["evidenceFile"]), "utf8");
      const catalog = record(JSON.parse(catalogText))["value"];
      const tools = record(catalog)["tools"]; assert.ok(Array.isArray(tools));
      assert.deepEqual(tools.map(tool => record(tool)["name"]), ["easyeda_control_status", "easyeda_control_session"]);
      await conflict.handle(request({ id: "close-unused-startup", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      const result = record(conflictOutputs.at(-1));
      assert.equal(result["startupClosed"], true); assert.equal(result["replacementAllowed"], false);
      assert.deepEqual(record(result["closure"]), { pid: childPid, exitObserved: true, closeObserved: true,
        exitCode: 0, signal: null, stdinEof: true });
      await assert.rejects(lstat(`/proc/${String(childPid)}`), { code: "ENOENT" });
      const leaseText = await readFile(join(selected.control, "facade.lock"), "utf8");
      assert.equal(record(JSON.parse(leaseText))["pid"], ownerPid);
      const ownerProcess = await lstat(`/proc/${String(ownerPid)}`); assert.ok(ownerProcess.isDirectory());
      await conflict.handle(request({ id: "no-startup-cleanup-replay", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      await conflict.handle(request({ id: "no-startup-retry", action: "start", afterGeneration: 1, pluginRoot: selected.root }));
      assert.equal(conflict.inspect()["stage"], "blocked"); assert.equal(conflict.inspect()["generation"], 0);
      assert.equal(conflict.inspect()["facadePid"], childPid);
      await conflict.handle(request({ id: "close-conflict-manager", action: "shutdown" }));
      await owner.handle(loaded("admitted-original-call"));
      assert.equal(owner.inspect()["callerToolDispatchStarted"], true);
      await owner.handle(request({ id: "cannot-close-used-owner-as-startup", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      assert.equal(owner.inspect()["stage"], "active"); assert.equal(owner.inspect()["closure"], null);
      await owner.handle(retire("retire-original-owner", 1));
      assert.equal(record(ownerOutputs.at(-1))["retired"], true);
      await owner.handle(request({ id: "close-original-manager", action: "shutdown" }));
      let failReady = true;
      const publicationOutputs: unknown[] = [];
      const publication = new ForegroundSessionManager(async value => {
        if (record(value)["ready"] === true && failReady) { failReady = false; throw new Error("synthetic-ready-publication-failed"); }
        publicationOutputs.push(value); await Promise.resolve();
      });
      retained.push(publication);
      await assert.rejects(publication.initialize(selected.root), /synthetic-ready-publication-failed/u);
      assert.equal(publication.inspect()["callerToolDispatchStarted"], false);
      await publication.handle(request({ id: "close-unpublished-startup", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      assert.equal(record(publicationOutputs.at(-1))["startupClosed"], true);
      await publication.handle(request({ id: "close-publication-manager", action: "shutdown" }));
    } finally {
      // Register every isolated owner before fallible initialization/assertions.
      // Only original supported cleanup can finish this fixture on failure.
      for (const [index, manager] of retained.toReversed().entries()) {
        const state = manager.inspect();
        if (state["stage"] === "active") {
          const generation = state["generation"]; assert.ok(typeof generation === "number");
          await manager.handle(retire(`fixture-finally-retire-${String(index)}`, generation));
        } else if (state["stage"] === "blocked" && state["callerToolDispatchStarted"] === false &&
          state["startupCleanupAttempted"] === false && state["facadePid"] !== null && state["closure"] === null) {
          await manager.handle(request({ id: `fixture-finally-startup-${String(index)}`, action: "cleanup-startup", confirmCloseOriginalStartup: true }));
        }
        const current = manager.inspect();
        if (current["stage"] === "between-facades" || current["stage"] === "blocked" && (current["facadePid"] === null || current["closure"] !== null)) {
          await manager.handle(request({ id: `fixture-finally-close-${String(index)}`, action: "shutdown" }));
        }
        assert.equal(manager.inspect()["stage"], "closed");
      }
    }
  });
});

void test("actual manager retains itself across two distinct real isolated facades and admits their exact loaded identities", { timeout: 60_000 }, async () => {
  const first = await fixture(), second = await fixture();
  const outputs: unknown[] = [];
  await selectedProfile(first.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(first.root);
    const firstReady = record(outputs.at(-1));
    const firstPid = firstReady["facadePid"];
    assert.equal(firstReady["managerPid"], process.pid);
    assert.equal(record(firstReady["loadedFacade"])["pid"], firstPid);
    assert.equal(record(firstReady["loadedFacade"])["moduleUrl"], pathToFileURL(join(first.root, "server/dist/server.mjs")).href);
    await manager.handle(loaded("original-read"));
    const budgetBefore = record(manager.inspect()["budgets"]);
    const cleanupCall = record(JSON.parse(loaded("explicit-cleanup-reserve")));
    await manager.handle(request({ ...cleanupCall, cleanup: true }));
    const budgetAfter = record(manager.inspect()["budgets"]);
    assert.equal(record(budgetAfter["records"])["cleanup"], 2);
    assert.deepEqual(record(budgetAfter["records"])["control"], record(budgetBefore["records"])["control"]);
    await manager.handle(retire("retire-first", 1));
    const retired = record(outputs.at(-1));
    assert.equal(retired["retired"], true);
    assert.deepEqual(record(retired["closure"]), { pid: firstPid, exitObserved: true, closeObserved: true,
      exitCode: 0, signal: null, stdinEof: true });
    await assert.rejects(lstat(`/proc/${String(firstPid)}`), { code: "ENOENT" });
    await assert.rejects(lstat(join(first.control, "facade.lock")), { code: "ENOENT" });
    // Repeated retire and stale start requests do not consume the retained valid
    // Permit or resurrect an old facade. No JSON can authorize initial start.
    await manager.handle(retire("duplicate-retire", 1));
    assert.equal(manager.inspect()["stage"], "between-facades");
    await manager.handle(request({ id: "stale-start", action: "start", afterGeneration: 2, pluginRoot: second.root }));
    assert.equal(manager.inspect()["stage"], "between-facades");
    await manager.handle(request({ id: "replacement", action: "start", afterGeneration: 1, pluginRoot: second.root }));
    const secondReady = record(outputs.at(-1));
    assert.equal(secondReady["ready"], true); assert.equal(secondReady["generation"], 2);
    assert.equal(secondReady["managerPid"], process.pid); assert.notEqual(secondReady["facadePid"], firstPid);
    assert.equal(record(secondReady["loadedFacade"])["moduleUrl"], pathToFileURL(join(second.root, "server/dist/server.mjs")).href);
    const leaseText = await readFile(join(first.control, "facade.lock"), "utf8");
    const lease = record(JSON.parse(leaseText));
    assert.equal(lease["pid"], secondReady["facadePid"]);
    await manager.handle(retire("retire-second", 2));
    await manager.handle(request({ id: "done", action: "shutdown" }));
    assert.equal(manager.inspect()["stage"], "closed");
    const evidence = String(manager.inspect()["evidenceDirectory"]);
    const roster = await readdir(evidence);
    assert.ok(roster.length > 10);
    const proof = await Promise.all(roster.map(async name => {
      const info = await lstat(join(evidence, name));
      assert.equal(info.mode % 512, 0o600);
      const text = await readFile(join(evidence, name), "utf8");
      return record(JSON.parse(text));
    }));
    assert.equal(proof.filter(row => row["kind"] === "original-child-closure").length, 2);
  });
});

void test("actual manager keeps original cleanup calls after semantic errors and a journal preflight refusal", { timeout: 45_000 }, async () => {
  const selected = await fixture();
  const outputs: unknown[] = [];
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(selected.root);
    const original = manager.inspect()["facadePid"];
    // Use an admitted non-reference callback: SDK argument rejection alone
    // Preserves a source-only facade and cannot require global journal parsing.
    await manager.handle(request({ id: "failed-operation", tool: "easyeda_control_native_release", arguments: { request: {
      action: "release-completed", kind: "project-opening", operationId: "manager-semantic-refusal", confirmReleaseOriginalRuntime: true,
    } } }));
    const errorResult = record(outputs.at(-1))["result"];
    assert.equal(record(errorResult)["isError"], true);
    assert.equal(manager.inspect()["stage"], "active");
    const directory = join(selected.control, "ordinary-launch-v1");
    await mkdir(directory, { mode: 0o700 });
    const journal = join(directory, "easyeda-unreadable.json");
    await writeFile(journal, "{unreadable", { mode: 0o600 });
    const beforeRefusal = record(record(manager.inspect()["budgets"])["records"]);
    await manager.handle(retire("refused", 1));
    assert.equal(record(outputs.at(-1))["retirementRefused"], true);
    assert.equal(manager.inspect()["stage"], "active");
    assert.equal(manager.inspect()["facadePid"], original);
    const afterRefusal = record(record(manager.inspect()["budgets"])["records"]);
    assert.equal(afterRefusal["control"], beforeRefusal["control"]);
    assert.equal(afterRefusal["cleanup"], Number(beforeRefusal["cleanup"]) + 3);
    await manager.handle(loaded("same-owner-cleanup-inspection"));
    const cleanupResult = record(record(outputs.at(-1))["result"]);
    assert.equal(record(cleanupResult["structuredContent"])["offline"], true);
    // Simulate completion through the fixture's independently owned test record,
    // Preserving its original failure bytes outside the scanned journal family.
    await copyFile(journal, join(selected.control, "retained-unreadable-journal.json"));
    // This fixture has no real operation. Retain its failure unchanged outside
    // The journal family so the real server can inspect quiescence again.
    await rename(journal, join(selected.control, "fixture-completion.json"));
    await manager.handle(retire("after-cleanup", 1));
    assert.equal(record(outputs.at(-1))["retired"], true);
    await manager.handle(request({ id: "done", action: "shutdown" }));
  });
});

void test("asynchronous admitted stdout failure blocks publication while retaining the exact unused startup child", { timeout: 45_000 }, async context => {
  const entered = Promise.withResolvers<null>();
  const selected = await fixture();
  await selectedProfile(selected.profilePath, async () => {
    const output = new Writable({ highWaterMark: 2 * 1024 * 1024,
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Reproduce the actual Writable completion callback rather than a promise-shaped stand-in.
      write(_chunk, _encoding, callback): void {
        entered.resolve(null);
        // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Fail the admitted write on the next turn, after write() has returned true.
        setImmediate(() => { callback(new Error("private-asynchronous-output-failure")); });
      } });
    const emit = createManagerOutputPublisher(output);
    let fixtureCleanup = false;
    const manager = new ForegroundSessionManager(value => fixtureCleanup ? Promise.resolve() : emit(value));
    // Only the test publisher is bypassed during fixture disposal. The real
    // Failed output remains permanently unavailable; no recovery is implied.
    context.after(async () => {
      fixtureCleanup = true;
      if (manager.inspect()["facadePid"] !== null && record(manager.inspect()["closure"] ?? {})["closeObserved"] !== true) {
        await manager.handle(request({ id: "fixture-close-unused-output-owner", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      }
      if (manager.inspect()["stage"] !== "closed") { await manager.handle(request({ id: "fixture-close-output-manager", action: "shutdown" })); }
      output.destroy();
    });
    const failed = assert.rejects(manager.initialize(selected.root), /manager-output-unavailable/u);
    await entered.promise;
    const original = manager.inspect();
    // Write admission returned true for this small line before its failure.
    assert.equal(output.writableNeedDrain, false);
    assert.equal(original["stage"], "starting"); assert.equal(original["publicationFault"], false);
    assert.equal(original["callerToolDispatchStarted"], false);
    assert.equal(typeof original["facadePid"], "number");
    await failed;
    const blocked = manager.inspect();
    assert.equal(blocked["stage"], "blocked"); assert.equal(blocked["publicationFault"], true);
    assert.equal(blocked["facadePid"], original["facadePid"]); assert.equal(blocked["generation"], original["generation"]);
    assert.equal(blocked["closure"], null);
    await assert.rejects(emit({ afterFailure: true }), /manager-output-unavailable/u);
    const evidence = String(blocked["evidenceDirectory"]), names = await readdir(evidence);
    const texts = await Promise.all(names.map(name => readFile(join(evidence, name), "utf8")));
    const text = texts.join("");
    assert.match(text, /publication-failed/u); assert.equal(text.includes("private-asynchronous-output-failure"), false);
    fixtureCleanup = true;
    await manager.handle(request({ id: "close-original-unused-output-owner", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
    const closure = record(manager.inspect()["closure"]);
    assert.equal(closure["pid"], original["facadePid"]); assert.equal(closure["stdinEof"], true);
    assert.equal(closure["exitObserved"], true); assert.equal(closure["closeObserved"], true);
    assert.equal(closure["exitCode"], 0); assert.equal(closure["signal"], null);
    await manager.handle(request({ id: "close-original-output-manager", action: "shutdown" }));
  });
});

void test("actual manager blocks retirement through pending result publication and retains proof if publication fails", { timeout: 45_000 }, async () => {
  const selected = await fixture();
  const outputs: unknown[] = [];
  const entered = Promise.withResolvers<null>(), release = Promise.withResolvers<null>();
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => {
      outputs.push(value);
      if (record(value)["id"] === "held-result") { entered.resolve(null); await release.promise; }
    });
    await manager.initialize(selected.root);
    const pending = manager.handle(loaded("held-result"));
    await entered.promise;
    await assert.rejects(manager.handle(retire("concurrent", 1)), /manager-request-pending/u);
    assert.equal(manager.inspect()["stage"], "active");
    assert.equal(manager.inspect()["requestPending"], true);
    release.resolve(null); await pending;
    await manager.handle(retire("settled", 1));
    await manager.handle(request({ id: "done", action: "shutdown" }));
  });
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => {
      if (record(value)["retired"] === true) { throw new Error("private-output-failure"); }
      outputs.push(value); await Promise.resolve();
    });
    await manager.initialize(selected.root);
    await manager.handle(retire("retire-publication-failure", 1));
    assert.equal(manager.inspect()["stage"], "blocked");
    const before = manager.inspect()["generation"];
    await manager.handle(request({ id: "forbidden-replacement", action: "start", afterGeneration: 1, pluginRoot: selected.root }));
    assert.equal(manager.inspect()["generation"], before);
    assert.equal(manager.inspect()["stage"], "blocked");
    const evidence = String(manager.inspect()["evidenceDirectory"]);
    const names = await readdir(evidence);
    const texts = await Promise.all(names.map(name => readFile(join(evidence, name), "utf8")));
    const text = texts.join("");
    assert.match(text, /original-child-closure/u); assert.match(text, /publication-failed/u);
    assert.equal(text.includes("private-output-failure"), false);
    assert.equal(record(manager.inspect()["closure"])["exitObserved"], true);
    await manager.handle(request({ id: "close-retired-blocked-manager", action: "shutdown" }));
  });
});

void test("cooperative transport retains its exact child through timeout and observes later exit without signals", { timeout: 10_000 }, async () => {
  const root = await createTestTemporaryDirectory("easyeda-manager-transport-");
  const entrypoint = join(root, "retained-child.mjs");
  await writeFile(entrypoint, "process.stdin.resume();process.stdin.on('end',()=>{setTimeout(()=>process.exitCode=0,300);});");
  await chmod(entrypoint, 0o600);
  const transport = new ForegroundSessionTransport({ command: process.execPath, args: [entrypoint], cwd: root, env: {} }, 50);
  await transport.start();
  const pid = transport.pid;
  await transport.close();
  await assert.rejects(transport.awaitOwnedClosure(), /foreground-child-closure-unproven/u);
  assert.equal(transport.pid, pid); assert.equal(transport.inspectClosure(), null);
  const processInfo = await lstat(`/proc/${String(pid)}`);
  assert.ok(processInfo.isDirectory());
  await waitForObservedClosure(() => transport.inspectClosure() !== null);
  assert.deepEqual(transport.inspectClosure(), { pid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
});

void test("SDK startup auto-close cannot discard a rejecting closure promise or lose its still-live original child", { timeout: 10_000 }, async () => {
  const root = await createTestTemporaryDirectory("easyeda-manager-startup-");
  const entrypoint = join(root, "malformed-initialize.mjs");
  await writeFile(entrypoint, String.raw`process.stdin.once('data',()=>process.stdout.write('invalid-json\n'));process.stdin.on('end',()=>setTimeout(()=>process.exitCode=0,300));`);
  const transport = new ForegroundSessionTransport({ command: process.execPath, args: [entrypoint], cwd: root, env: {} }, 50);
  const client = new Client({ name: "manager-startup-failure", version: "1.0.0" });
  await assert.rejects(client.connect(transport, { timeout: 100 }));
  assert.equal(transport.hasUnclosedChild(), true);
  await assert.rejects(transport.awaitOwnedClosure(), /foreground-child-closure-unproven/u);
  await waitForObservedClosure(() => transport.inspectClosure() !== null);
  assert.equal(transport.hasUnclosedChild(), false);
  assert.equal(transport.inspectClosure()?.exitCode, 0);
  assert.equal(transport.inspectClosure()?.signal, null);
  await assert.rejects(transport.awaitOwnedClosure(), /foreground-child-transport-failed/u);
  await client.close();
});

void test("actual manager executable keeps its request loop after failed initialization and can close when no child was allocated", { timeout: 10_000 }, async () => {
  const isolation = await assertTestIsolation();
  const completed = Promise.withResolvers<Readonly<{ code: string | number; stdout: string; stderr: string }>>();
  const child = execFile(process.execPath, [join(pluginRoot, "scripts/control-session-manager.ts"), "--plugin-root", join(isolation.directory, "absent-plugin")], {
    env: { PATH: "/usr/bin:/bin", EASYEDA_MACHINE_PROFILE: join(isolation.directory, "unread-profile.json") },
    timeout: 5000, maxBuffer: 65_536, encoding: "utf8",
  },
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Retain the owned executable's exact exit status and bounded stdout/stderr from execFile's callback.
  (error, stdout, stderr) => { completed.resolve({ code: error?.code ?? 0, stdout, stderr }); });
  child.stdin?.end(`${request({ id: "inspection-after-startup-failure", action: "inspect" })}\n${request({ id: "close-no-child", action: "shutdown" })}\n`);
  const result = await completed.promise;
  assert.equal(result.code, 0); assert.equal(result.stderr, "");
  const lines = result.stdout.trim().split("\n").map(line => record(JSON.parse(line)));
  assert.equal(lines[0]?.["error"], "manager-initialization-failed");
  assert.equal(lines[1]?.["id"], "inspection-after-startup-failure");
  assert.equal(record(lines[1]?.["manager"])["stage"], "blocked");
  assert.equal(lines[2]?.["closing"], true);
});

void test("rejected RPC and contradictory retirement acknowledgement freeze replacement without retrying", { timeout: 30_000 }, async () => {
  for (const kind of ["rpc-rejection", "bad-retirement"] as const) {
    const selected = await fixture(syntheticPeer(kind));
    const outputs: unknown[] = [];
    await selectedProfile(selected.profilePath, async () => {
      const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
      await manager.initialize(selected.root);
      const original = manager.inspect()["facadePid"];
      await manager.handle(kind === "rpc-rejection" ? request({ id: "rejected", tool: "easyeda_control_api", arguments: { request: { action: "reject" } } }) : retire("contradictory", 1));
      assert.equal(manager.inspect()["stage"], "blocked");
      await manager.handle(retire("no-repeat", 1));
      await manager.handle(request({ id: "no-replacement", action: "start", afterGeneration: 1, pluginRoot: selected.root }));
      assert.equal(manager.inspect()["generation"], 1);
      assert.equal(manager.inspect()["facadePid"], original);
      const rows = manager.inspect()["records"];
      assert.ok(Array.isArray(rows));
      assert.equal(rows.filter(row => record(row)["kind"] === (kind === "rpc-rejection" ? "call-intent" : "retirement-intent")).length, 1);
      assert.equal(JSON.stringify(outputs).includes("private-peer-error"), false);
      // This synthetic peer closes itself after the one failure. The manager
      // Neither requests closure nor sends a signal to obtain that observation.
      await waitForObservedClosure(() => manager.inspect()["closure"] !== null);
      assert.equal(record(manager.inspect()["closure"])["signal"], null);
      await manager.handle(request({ id: "closed-peer", action: "shutdown" }));
      assert.equal(manager.inspect()["stage"], "closed");
    });
  }
});

/** Await bounded fixture progress without invoking a new facade or tool. */
async function managerProgress(predicate: () => boolean): Promise<void> {
  for (let count = 0; count < 400; count += 1) { if (predicate()) { return; } await wait(5); }
  assert.fail("manager fixture progress deadline");
}

void test("CLI pending capture admits only original inspect and once-confirmed abort while retaining both publications", { timeout: 20_000 }, async () => {
  const selected = await fixture(interruptedForwardPeer()); const outputs: unknown[] = [];
  const expectedBindingSha256 = "a".repeat(64), operationId = "footprint-copy-qualify-timeout";
  const parentPublication = Promise.withResolvers<null>(); const allowParent = Promise.withResolvers<null>();
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => {
      outputs.push(value);
      if (record(value)["id"] === "pending-capture" && Object.hasOwn(record(value), "result")) {
        parentPublication.resolve(null); await allowParent.promise;
      }
    });
    await manager.initialize(selected.root); const pid = manager.inspect()["facadePid"];
    const capture = { id: "pending-capture", tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 10_000,
      arguments: { request: { action: "footprint-forward-prewrite", request: { action: "capture-project", operationId, expectedBindingSha256,
        target: { rawWindowsPath: String.raw`C:\Disposable\fixture.eprj2`, projectUuid: hash(Buffer.from(String.raw`C:\Disposable\fixture.eprj2`)), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) },
        confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true } } } };
    const parentId = "pending-capture";
    const side = (id: string, action: string, extra: object = {}): string => request({ id, action: "in-flight-original", generation: 1,
      originalRequestId: parentId, request: { action, ...extra } });
    const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId: parentId, request: { action, ...extra } });
    const seen = (id: string): boolean => outputs.some(value => record(value)["id"] === id);
    async function* input(): AsyncGenerator<Buffer> {
      yield Buffer.from(`${request(capture)}\n`);
      await managerProgress(() => manager.inspect()["inFlightRequest"] !== null && record(manager.inspect()["inFlightRequest"])["rpcPending"] === true);
      for (const line of [request({ id: "local-pending", action: "inspect" }), loaded("normal-denied"), request({ ...capture, id: "replay-denied" }),
        retire("retire-denied", 1), request({ id: "start-denied", action: "start", afterGeneration: 1, pluginRoot: selected.root }),
        request({ id: "shutdown-denied", action: "shutdown" }), side("termination-denied", "observe-termination"),
        side("foreign-operation-denied", "inspect", { operationId: "foreign" }),
        request({ id: "foreign-parent-denied", action: "in-flight-original", generation: 1, originalRequestId: "foreign", request: { action: "inspect" } }),
        side("native-pending", "inspect"), side("abort-pending", "abort-generation", { confirmAbortOriginalForwardJob: true })]) {
        yield Buffer.from(`${line}\n`);
      }
      await managerProgress(() => seen("abort-pending") && manager.inspect()["requestPending"] === false);
      assert.equal(manager.inspect()["stage"], "blocked");
      assert.equal(record(manager.inspect()["controlledCapture"])["parentOutcome"], "returned");
      assert.equal(manager.inspect()["interruptedRequest"], null);
      yield Buffer.from(`${cleanup("no-repeat-abort", "abort-generation", { confirmAbortOriginalForwardJob: true })}\n`);
      yield Buffer.from(`${retire("before-helper-release", 1)}\n`);
      for (const [id, action] of [["exit-proof", "observe-termination"], ["intent-proof", "inspect"], ["records-proof", "settle-records"], ["helper-proof", "release-closed"], ["final-inspect", "inspect"]] as const) {
        yield Buffer.from(`${cleanup(id, action)}\n`);
      }
      yield Buffer.from(`${retire("retired-original", 1)}\n${request({ id: "shutdown-original", action: "shutdown" })}\n`);
    }
    const running = runManagerInput(manager, input());
    await parentPublication.promise;
    assert.equal(manager.inspect()["requestPending"], true); assert.equal(manager.inspect()["facadePid"], pid); assert.equal(manager.inspect()["closure"], null);
    await assert.rejects(manager.handle(retire("direct-retire-denied", 1)), /manager-request-pending/u);
    allowParent.resolve(null); assert.equal(await running, "closed");
    const rows = outputs.map(value => record(value));
    for (const id of ["normal-denied", "replay-denied", "retire-denied", "start-denied", "shutdown-denied", "termination-denied", "foreign-operation-denied", "foreign-parent-denied", "no-repeat-abort"]) {
      const denied = rows.find(row => row["id"] === id); assert.equal(denied?.["dispatched"], false, id);
    }
    const finalEnvelope = record(rows.find(row => row["id"] === "final-inspect")?.["result"]);
    const inspected = record(record(finalEnvelope["structuredContent"])["result"]);
    const calls = z.array(z.record(z.string(), z.unknown())).parse(inspected["calls"]);
    assert.equal(calls.filter(call => call["action"] === "capture-project").length, 1);
    assert.equal(calls.filter(call => call["action"] === "abort-generation").length, 1);
    assert.equal(inspected["released"], true); assert.equal(inspected["settled"], true);
    assert.equal(rows.find(row => row["id"] === "before-helper-release")?.["retirementRefused"], true);
    const closed = rows.find(row => row["id"] === "retired-original"); assert.equal(closed?.["retired"], true);
    assert.equal(record(closed?.["closure"])["pid"], pid); assert.equal(record(closed?.["closure"])["stdinEof"], true);
    const evidence = String(manager.inspect()["evidenceDirectory"]); const names = await readdir(evidence);
    const records = await Promise.all(names.toSorted().map(async name => {
      const text = await readFile(join(evidence, name), "utf8"); return record(JSON.parse(text));
    }));
    assert.deepEqual(records.map(row => row["sequence"]), records.map((_row, index) => index + 1));
    assert.equal(records.filter(row => row["kind"] === "in-flight-control-result").length, 2);
  });
});

void test("rejected in-flight inspection retains its exact side provenance while the parent returns a known terminal result", { timeout: 15_000 }, async () => {
  const outputs: unknown[] = [], selected = await fixture(interruptedForwardPeer(false, true));
  const operationId = "footprint-copy-qualify-timeout"; const expectedBindingSha256 = "a".repeat(64); const rawWindowsPath = String.raw`C:\Disposable\fixture.eprj2`;
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(selected.root); const pid = manager.inspect()["facadePid"];
    const capture = { id: "known-parent", tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 10_000,
      arguments: { request: { action: "footprint-forward-prewrite", request: { action: "capture-project", operationId, expectedBindingSha256,
        target: { rawWindowsPath, projectUuid: hash(Buffer.from(rawWindowsPath)), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) },
        confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true } } } };
    const rejectedId = "unknown-side-inspect";
    const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId: rejectedId, request: { action, ...extra } });
    async function* input(): AsyncGenerator<Buffer> {
      yield Buffer.from(`${request(capture)}\n`);
      await managerProgress(() => manager.inspect()["inFlightRequest"] !== null && record(manager.inspect()["inFlightRequest"])["rpcPending"] === true);
      yield Buffer.from(`${request({ id: "unknown-side-inspect", action: "in-flight-original", generation: 1, originalRequestId: "known-parent", request: { action: "inspect" } })}\n`);
      await managerProgress(() => manager.inspect()["requestPending"] === false);
      const interrupted = record(manager.inspect()["interruptedRequest"]);
      assert.equal(interrupted["id"], "unknown-side-inspect"); assert.equal(interrupted["action"], "inspect");
      assert.equal(interrupted["originalCaptureRequestId"], "known-parent"); assert.equal(interrupted["outcome"], "unknown");
      assert.equal(manager.inspect()["controlledCapture"], null); assert.equal(manager.inspect()["stage"], "blocked");
      yield Buffer.from(`${cleanup("retained-inspect", "inspect")}\n${cleanup("retained-abort", "abort-generation", { confirmAbortOriginalForwardJob: true })}\n`);
      yield Buffer.from(`${cleanup("retained-second-abort", "abort-generation", { confirmAbortOriginalForwardJob: true })}\n`);
      for (const [id, action] of [["retained-exit", "observe-termination"], ["retained-records", "settle-records"], ["retained-release", "release-closed"], ["retained-final-inspect", "inspect"]] as const) {
        yield Buffer.from(`${cleanup(id, action)}\n`);
      }
      yield Buffer.from(`${retire("retained-retire", 1)}\n${request({ id: "retained-shutdown", action: "shutdown" })}\n`);
    }
    assert.equal(await runManagerInput(manager, input()), "closed");
    const rows = outputs.map(value => record(value));
    const parent = record(record(rows.find(row => row["id"] === "known-parent")?.["result"])["structuredContent"]);
    assert.equal(record(parent["result"])["lateCapture"], true);
    assert.equal(rows.find(row => row["id"] === "unknown-side-inspect")?.["error"], "manager-blocked");
    assert.equal(rows.find(row => row["id"] === "retained-second-abort")?.["dispatched"], false);
    const finalEnvelope = record(rows.find(row => row["id"] === "retained-final-inspect")?.["result"]);
    const final = record(record(finalEnvelope["structuredContent"])["result"]);
    const calls = z.array(z.record(z.string(), z.unknown())).parse(final["calls"]);
    assert.equal(calls.filter(call => call["action"] === "capture-project").length, 1);
    assert.equal(calls.filter(call => call["action"] === "abort-generation").length, 1);
    assert.equal(final["released"], true); assert.equal(record(rows.find(row => row["id"] === "retained-retire")?.["closure"])["pid"], pid);
  });
});

void test("v2 source capture timeout retains the exact family and child through fixed original cleanup and retirement", { timeout: 22_000 }, async context => {
  const selected = await fixture(interruptedForwardPeer(false, false, true)); const outputs: unknown[] = [];
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    context.after(async () => {
      if (manager.inspect()["stage"] === "closed") { return; }
      const deadline = Date.now() + 16_000;
      while (manager.inspect()["closure"] === null && Date.now() < deadline) { await wait(10); }
      await manager.handle(request({ id: "v2-fixture-final-shutdown", action: "shutdown" }));
    });
    await manager.initialize(selected.root);
    const pid = manager.inspect()["facadePid"]; const operationId = "footprint-forward-execution-timeout"; const expectedBindingSha256 = "a".repeat(64);
    const capture = { id: "v2-original-capture", tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 1000,
      arguments: { request: { action: "footprint-forward-source-validation", request: { action: "capture-source", operationId, expectedBindingSha256 } } } };
    const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId: capture.id, request: { action, ...extra } });
    const pending = manager.handle(request(capture));
    await managerProgress(() => manager.hasInFlightCapture());
    await manager.handleInFlight(request({ id: "v2-pending-inspection", action: "in-flight-original", generation: 1,
      originalRequestId: capture.id, request: { action: "inspect" } }));
    await pending;
    assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], pid);
    assert.equal(record(manager.inspect()["interruptedRequest"])["outcome"], "unknown");
    for (const rejected of [request({ ...capture, id: "v2-replay", cleanup: true }), loaded("v2-normal"),
      cleanup("v2-foreign-operation", "inspect", { operationId: "footprint-forward-execution-foreign" }),
      cleanup("v2-capture-not-prelaunch", "cleanup-before-launch"),
      request({ id: "v2-replace", action: "start", afterGeneration: 1, pluginRoot: selected.root })]) {
      await manager.handle(rejected); assert.equal(record(outputs.at(-1))["dispatched"], false);
    }
    for (const [id, action, extra] of [["v2-abort", "abort-generation", { confirmAbortOriginalForwardJob: true }],
      ["v2-exit", "observe-termination", {}], ["v2-records", "settle-records", {}]] as const) {
      await manager.handle(cleanup(id, action, extra));
      const output = record(outputs.at(-1)); assert.notEqual(record(output["result"])["isError"], true);
    }
    await manager.handle(cleanup("v2-release-publication-failed", "release-closed"));
    const failedRelease = record(outputs.at(-1)); assert.equal(record(failedRelease["result"])["isError"], true);
    assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], pid);
    await manager.handle(cleanup("v2-observe-foreign-binding", "observe-release", { expectedBindingSha256: "f".repeat(64) }));
    assert.equal(record(outputs.at(-1))["dispatched"], false);
    await manager.handle(cleanup("v2-observe-original-release", "observe-release"));
    const observedRelease = record(outputs.at(-1)); assert.notEqual(record(observedRelease["result"])["isError"], true);
    await manager.handle(cleanup("v2-inspect", "inspect"));
    const output = record(outputs.at(-1)); const result = record(output["result"]); const structured = record(result["structuredContent"]); const final = record(structured["result"]);
    const calls = z.array(z.record(z.string(), z.unknown())).parse(final["calls"]);
    assert.equal(final["captures"], 1); assert.equal(final["released"], true); assert.equal(final["releaseObserved"], true); assert.equal(final["settled"], true);
    assert.equal(calls.filter(call => call["action"] === "capture-source").length, 1);
    assert.equal(calls.filter(call => call["action"] === "abort-generation").length, 1);
    assert.equal(calls.filter(call => call["action"] === "release-closed").length, 1);
    const observed = calls.filter(call => call["action"] === "observe-release"); assert.equal(observed.length, 1);
    assert.equal(observed[0]?.["binding"], expectedBindingSha256);
    assert.equal(record(manager.inspect()["interruptedRequest"])["outcome"], "unknown");
    assert.ok(calls.every(call => call["tool"] !== "easyeda_control_pcb209_worker_startup" || call["operationId"] === operationId));
    await manager.handle(retire("v2-original-retire", 1));
    assert.equal(manager.inspect()["stage"], "between-facades"); assert.equal(record(manager.inspect()["closure"])["pid"], pid);
    await manager.handle(request({ id: "v2-original-shutdown", action: "shutdown" }));
    assert.equal(manager.inspect()["stage"], "closed");
  });
});

void test("v2 rejected preallocation launch retires only after its exact same-client no-allocation cleanup", { timeout: 20_000 }, async context => {
  const selected = await fixture(rejectedSourceLaunchPeer()); const outputs: unknown[] = [];
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    context.after(async () => {
      if (manager.inspect()["stage"] === "closed") { return; }
      const deadline = Date.now() + 16_000;
      while (manager.inspect()["closure"] === null && Date.now() < deadline) { await wait(10); }
      await manager.handle(request({ id: "preallocation-fixture-shutdown", action: "shutdown" }));
    });
    await manager.initialize(selected.root);
    const rawWindowsPath = String.raw`C:\Disposable\source-validation.eprj2`; const operationId = "footprint-forward-execution-preallocation";
    const original = { id: "v2-preallocation-launch", tool: "easyeda_control_pcb209_worker_startup",
      arguments: { request: { action: "footprint-forward-source-validation", request: { action: "launch", operationId,
        target: { rawWindowsPath, projectUuid: hash(Buffer.from(rawWindowsPath)), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) },
        footprintUuid: "e".repeat(16), confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNormalOpenEffects: true,
        acceptDebuggerPauseEffects: true, confirmValidationOnly: true, confirmDiagnosticLaunch: true } } } };
    const cleanup = (id: string, action: string): string => request({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId: original.id, request: { action } });
    await manager.handle(request(original)); assert.equal(manager.inspect()["stage"], "blocked");
    assert.equal(record(manager.inspect()["interruptedRequest"])["forward"], null);
    await manager.handle(retire("preallocation-no-proof", 1)); assert.equal(record(outputs.at(-1))["dispatched"], false);
    await manager.handle(cleanup("preallocation-original-cleanup", "cleanup-before-launch"));
    const output = record(outputs.at(-1)); assert.notEqual(record(output["result"])["isError"], true);
    await manager.handle(retire("preallocation-retire", 1)); assert.equal(manager.inspect()["stage"], "between-facades");
    await manager.handle(request({ id: "preallocation-shutdown", action: "shutdown" })); assert.equal(manager.inspect()["stage"], "closed");
  });
});

void test("v2 operation-only cleanup timeout retains original Source custody without a native binding", { timeout: 25_000 }, async context => {
  for (const action of ["settle-records", "cleanup-before-launch", "cleanup-no-process"] as const) {
    await context.test(action, { timeout: 8000 }, async nested => {
      const selected = await fixture(interruptedSourceBookkeepingPeer(action)); const outputs: unknown[] = [];
      await selectedProfile(selected.profilePath, async () => {
        const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
        nested.after(async () => {
          if (manager.inspect()["stage"] === "closed") { return; }
          await waitForObservedClosure(() => manager.inspect()["closure"] !== null);
          await manager.handle(request({ id: "bookkeeping-fixture-shutdown", action: "shutdown" }));
        });
        await manager.initialize(selected.root);
        const operationId = "footprint-forward-execution-bookkeeping", pid = manager.inspect()["facadePid"];
        const rawWindowsPath = String.raw`C:\Disposable\source-validation.eprj2`;
        const launch = { id: "bookkeeping-returned-launch", tool: "easyeda_control_pcb209_worker_startup",
          arguments: { request: { action: "footprint-forward-source-validation", request: { action: "launch", operationId,
            target: { rawWindowsPath, projectUuid: hash(Buffer.from(rawWindowsPath)), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) },
            footprintUuid: "e".repeat(16), confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNormalOpenEffects: true,
            acceptDebuggerPauseEffects: true, confirmValidationOnly: true, confirmDiagnosticLaunch: true } } } };
        await manager.handle(request(launch)); assert.equal(manager.inspect()["stage"], "active");
        const original = { id: "bookkeeping-original-cleanup", tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 1000,
          arguments: { request: { action: "footprint-forward-source-validation", request: { action, operationId } } } };
        const cleanup = (id: string, cleanupAction: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
          interruptedRequestId: original.id, request: { action: cleanupAction, ...extra } });
        await manager.handle(request(original));
        const timedOut = record(outputs.at(-1)); assert.equal(timedOut["error"], "manager-blocked");
        assert.equal(record(timedOut["diagnostic"])["reason"], "request-timeout");
        assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], pid);
        const interrupted = (): Record<string, unknown> => record(manager.inspect()["interruptedRequest"]);
        assert.equal(interrupted()["action"], action); assert.equal(interrupted()["forward"], null);
        assert.equal(interrupted()["cleanupAvailable"], true); assert.equal(interrupted()["outcome"], "unknown");
        for (const rejected of [loaded("bookkeeping-normal"), request({ ...original, id: "bookkeeping-replay", cleanup: true }),
          request({ id: "bookkeeping-native", tool: "easyeda_control_native", arguments: { request: { action: "inspect" } } }),
          request({ id: "bookkeeping-foreign-family", tool: original.tool, arguments: { request: { action: "footprint-forward-prewrite",
            request: { action: "inspect", operationId: "footprint-copy-qualify-foreign" } } } }),
          request({ id: "bookkeeping-foreign-generation", action: "cleanup-original", generation: 2, interruptedRequestId: original.id, request: { action: "inspect" } }),
          request({ id: "bookkeeping-foreign-request", action: "cleanup-original", generation: 1, interruptedRequestId: launch.id, request: { action: "inspect" } }),
          cleanup("bookkeeping-operation-override", "inspect", { operationId: "footprint-forward-execution-foreign" }),
          cleanup("bookkeeping-family-override", "inspect", { family: "footprint-forward-prewrite" }),
          cleanup("bookkeeping-tool-override", "inspect", { tool: "easyeda_control_native" }),
          cleanup("bookkeeping-binding-override", "observe-termination", { expectedBindingSha256: "a".repeat(64) }),
          cleanup("bookkeeping-abort", "abort-generation", { confirmAbortOriginalForwardJob: true }),
          cleanup("bookkeeping-observe-termination", "observe-termination"), cleanup("bookkeeping-release", "release-closed"),
          cleanup("bookkeeping-observe-release", "observe-release"),
          request({ id: "bookkeeping-replacement", action: "start", afterGeneration: 1, pluginRoot: selected.root })]) {
          await manager.handle(rejected); assert.equal(record(outputs.at(-1))["dispatched"], false);
          assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], pid);
        }
        await manager.handle(retire("bookkeeping-retirement-still-active", 1));
        assert.equal(record(outputs.at(-1))["retirementRefused"], true); assert.equal(manager.inspect()["stage"], "blocked");
        await manager.handle(cleanup("bookkeeping-inspect-original", "inspect"));
        const inspected = record(outputs.at(-1)); assert.notEqual(record(inspected["result"])["isError"], true);
        assert.equal(interrupted()["forward"], null);
        await manager.handle(cleanup("bookkeeping-settle-original", "settle-records"));
        const settled = record(outputs.at(-1)); assert.notEqual(record(settled["result"])["isError"], true);
        await manager.handle(cleanup("bookkeeping-inspect-settled", "inspect"));
        const output = record(outputs.at(-1)), result = record(output["result"]), structured = record(result["structuredContent"]);
        const final = record(structured["telemetry"]); assert.equal(final["completed"], true); assert.equal(final["settled"], true);
        assert.equal(final["pending"], false); assert.equal(record(structured["result"])["originalBindingRetained"], false);
        assert.equal(interrupted()["forward"], null); assert.equal(interrupted()["outcome"], "unknown");
        const calls = z.array(z.record(z.string(), z.unknown())).parse(final["calls"]);
        const workerCalls = calls.filter(call => call["tool"] === original.tool);
        assert.deepEqual(workerCalls.map(call => call["action"]), ["launch", action, "inspect", "settle-records", "inspect"]);
        assert.ok(workerCalls.every(call => call["family"] === "footprint-forward-source-validation" && call["operationId"] === operationId &&
          !Object.hasOwn(call, "expectedBindingSha256")));
        assert.ok(calls.every(call => call["tool"] === original.tool || call["tool"] === "easyeda_control_session"));
        await manager.handle(retire("bookkeeping-retire-original", 1));
        assert.equal(manager.inspect()["stage"], "between-facades");
        assert.deepEqual(record(manager.inspect()["closure"]), { pid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
        await manager.handle(request({ id: "bookkeeping-shutdown", action: "shutdown" })); assert.equal(manager.inspect()["stage"], "closed");
      });
    });
  }
});

void test("v2 active Source operation-only timeout learns cleanup binding only from its original complete inspection", { timeout: 10_000 }, async context => {
  const selected = await fixture(interruptedSourceBookkeepingPeer("settle-records", true)); const outputs: unknown[] = [];
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    context.after(async () => {
      if (manager.inspect()["stage"] === "closed") { return; }
      await waitForObservedClosure(() => manager.inspect()["closure"] !== null);
      await manager.handle(request({ id: "active-bookkeeping-fixture-shutdown", action: "shutdown" }));
    });
    await manager.initialize(selected.root);
    const operationId = "footprint-forward-execution-bookkeeping", pid = manager.inspect()["facadePid"];
    const expectedBindingSha256 = "a".repeat(64), rawWindowsPath = String.raw`C:\Disposable\source-validation.eprj2`;
    const projectUuid = hash(Buffer.from(rawWindowsPath));
    await manager.handle(request({ id: "active-bookkeeping-returned-launch", tool: "easyeda_control_pcb209_worker_startup",
      arguments: { request: { action: "footprint-forward-source-validation", request: { action: "launch", operationId,
        target: { rawWindowsPath, projectUuid, documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) },
        footprintUuid: "e".repeat(16), confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptNormalOpenEffects: true,
        acceptDebuggerPauseEffects: true, confirmValidationOnly: true, confirmDiagnosticLaunch: true } } } }));
    assert.equal(manager.inspect()["stage"], "active");
    const originalId = "active-bookkeeping-original-settlement";
    await manager.handle(request({ id: originalId, tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 1000,
      arguments: { request: { action: "footprint-forward-source-validation", request: { action: "settle-records", operationId } } } }));
    assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], pid);
    const interrupted = (): Record<string, unknown> => record(manager.inspect()["interruptedRequest"]);
    const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId: originalId, request: { action, ...extra } });
    const inspected = (): Record<string, unknown> => {
      const output = record(outputs.at(-1)), result = record(output["result"]); return record(result["structuredContent"]);
    };
    assert.equal(interrupted()["forward"], null); assert.equal(interrupted()["cleanupAvailable"], true);
    for (const proofCase of ["pending", "not-retained", "foreign-operation", "malformed-binding", "no-created-root", "malformed-binding-digest", "error-envelope", "outer-failure"]) {
      await manager.handle(cleanup(`active-source-inspect-${proofCase}`, "inspect"));
      assert.equal(record(inspected()["telemetry"])["proofCase"], proofCase); assert.equal(interrupted()["forward"], null);
      await manager.handle(cleanup(`active-source-abort-${proofCase}`, "abort-generation", { confirmAbortOriginalForwardJob: true }));
      assert.equal(record(outputs.at(-1))["dispatched"], false); assert.equal(manager.inspect()["facadePid"], pid);
    }
    await manager.handle(cleanup("active-source-inspect-original-binding", "inspect"));
    assert.equal(record(inspected()["telemetry"])["proofCase"], "valid");
    assert.deepEqual(interrupted()["forward"], { operationId, bindingSha256: expectedBindingSha256 });
    await manager.handle(retire("active-source-retirement-still-owned", 1));
    assert.equal(record(outputs.at(-1))["retirementRefused"], true); assert.equal(manager.inspect()["stage"], "blocked");
    for (const [id, action, extra] of [["active-source-abort-original", "abort-generation", { confirmAbortOriginalForwardJob: true }],
      ["active-source-observe-original-termination", "observe-termination", {}], ["active-source-settle-original", "settle-records", {}],
      ["active-source-release-original", "release-closed", {}], ["active-source-inspect-final", "inspect", {}]] as const) {
      await manager.handle(cleanup(id, action, extra));
      const output = record(outputs.at(-1)); assert.notEqual(record(output["result"])["isError"], true);
    }
    const telemetry = record(inspected()["telemetry"]); assert.equal(telemetry["aborted"], true); assert.equal(telemetry["released"], true);
    const calls = z.array(z.record(z.string(), z.unknown())).parse(telemetry["calls"]);
    const workerCalls = calls.filter(call => call["tool"] === "easyeda_control_pcb209_worker_startup");
    assert.equal(workerCalls.filter(call => call["action"] === "launch").length, 1);
    for (const action of ["abort-generation", "observe-termination", "release-closed"]) {
      const matched = workerCalls.filter(call => call["action"] === action); assert.equal(matched.length, 1);
      assert.equal(matched[0]?.["expectedBindingSha256"], expectedBindingSha256);
    }
    assert.ok(workerCalls.every(call => call["family"] === "footprint-forward-source-validation" && call["operationId"] === operationId));
    assert.equal(interrupted()["outcome"], "unknown");
    await manager.handle(retire("active-source-retire-original", 1)); assert.equal(manager.inspect()["stage"], "between-facades");
    assert.deepEqual(record(manager.inspect()["closure"]), { pid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
    await manager.handle(request({ id: "active-source-shutdown", action: "shutdown" })); assert.equal(manager.inspect()["stage"], "closed");
  });
});

void test("historical Source timeout retains only original metadata settlement and authoritative retirement", { timeout: 25_000 }, async context => {
  for (const kind of ["pending", "lost-settle-ack", "no-pending", "operation", "manifest", "roster", "intent", "binding", "authority"] as const) {
    await context.test(kind, { timeout: 8000 }, async nested => {
      const selected = await fixture(historicalMetadataPeer(kind)); const outputs: unknown[] = [];
      const { original } = historicalMetadataFixture(kind);
      await selectedProfile(selected.profilePath, async () => {
        const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
        nested.after(async () => {
          if (manager.inspect()["stage"] === "closed") { return; }
          await waitForObservedClosure(() => manager.inspect()["closure"] !== null);
          await manager.handle(request({ id: "historical-fixture-shutdown", action: "shutdown" }));
        });
        await manager.initialize(selected.root);
        const originalId = "historical-original-request", pid = manager.inspect()["facadePid"];
        await manager.handle(request({ id: originalId, tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 1000,
          arguments: { request: { action: "footprint-forward-source-relinquishment", request: original } } }));
        const interrupted = (): Record<string, unknown> => record(manager.inspect()["interruptedRequest"]);
        assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(interrupted()["forward"], null);
        assert.equal(interrupted()["cleanupAvailable"], true); assert.equal(interrupted()["outcome"], "unknown");
        const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
          interruptedRequestId: originalId, request: { action, ...extra } });
        const cleanupCounts = record(record(manager.inspect()["budgets"])["records"])["cleanup"];
        for (const rejected of [loaded("historical-normal"),
          request({ id: "historical-native", tool: "easyeda_control_native", arguments: { request: { action: "inspect" } } }),
          cleanup("historical-inspect-not-native", "inspect"), cleanup("historical-settle-not-forward", "settle-records"),
          cleanup("historical-abort-not-owned", "abort-generation", { confirmAbortOriginalForwardJob: true }),
          cleanup("historical-termination-not-owned", "observe-termination"), cleanup("historical-release-not-owned", "release-closed"),
          cleanup("historical-source-prelaunch-not-owned", "cleanup-before-launch"),
          cleanup("historical-operation-override", "settle-historical-metadata", { operationId: original.operationId }),
          cleanup("historical-binding-override", "settle-historical-metadata", { expectedBindingSha256: original.expectedBindingSha256 }),
          cleanup("historical-request-override", "settle-historical-metadata", { request: original }),
          request({ id: "historical-foreign-generation", action: "cleanup-original", generation: 2, interruptedRequestId: originalId,
            request: { action: "settle-historical-metadata" } }),
          request({ id: "historical-foreign-request", action: "cleanup-original", generation: 1, interruptedRequestId: "foreign",
            request: { action: "settle-historical-metadata" } })]) {
          await manager.handle(rejected); assert.equal(record(outputs.at(-1))["dispatched"], false);
          assert.equal(manager.inspect()["facadePid"], pid); assert.equal(manager.inspect()["stage"], "blocked");
        }
        const afterRejected = record(record(manager.inspect()["budgets"])["records"]);
        assert.equal(afterRejected["cleanup"], cleanupCounts);
        const foreignOutputs: unknown[] = [];
        const foreign = new ForegroundSessionManager(async value => { foreignOutputs.push(value); await Promise.resolve(); });
        await foreign.handle(cleanup("historical-foreign-client", "settle-historical-metadata"));
        assert.equal(record(foreignOutputs.at(-1))["dispatched"], false);
        await manager.handle(retire("historical-busy-retirement", 1));
        assert.equal(record(outputs.at(-1))["retirementRefused"], true); assert.equal(manager.inspect()["stage"], "blocked");
        await manager.handle(cleanup("historical-busy-settlement", "settle-historical-metadata"));
        assert.equal(record(outputs.at(-1))["error"], "manager-blocked"); assert.equal(interrupted()["forward"], null);
        await manager.handle(cleanup("historical-original-settlement", "settle-historical-metadata"));
        if (kind === "lost-settle-ack") {
          assert.equal(record(outputs.at(-1))["error"], "manager-blocked");
          await manager.handle(cleanup("historical-known-complete-settlement", "settle-historical-metadata"));
        }
        const output = record(outputs.at(-1));
        if (kind === "pending" || kind === "lost-settle-ack") {
          const result = record(output["result"]), structured = record(result["structuredContent"]);
          const receipt = currentFootprintForwardSourceRelinquishmentResultSchema.parse(structured["result"]);
          assert.equal(receipt.operationId, original.operationId); assert.equal(receipt.captureOutcome, "unknown");
          assert.equal(receipt.terminationProved, false); assert.equal(receipt.nativeResourcesReleased, false);
          assert.equal(receipt.helperReleaseAcknowledged, false); assert.equal(receipt.authorityRestored, false);
        } else { assert.equal(output["error"], "manager-blocked"); assert.equal(output["dispatched"], true); }
        assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(interrupted()["forward"], null);
        assert.equal(interrupted()["outcome"], "unknown"); assert.equal(interrupted()["id"], originalId);
        await manager.handle(loaded("historical-still-blocked")); assert.equal(record(outputs.at(-1))["dispatched"], false);
        await manager.handle(retire("historical-original-retire", 1)); assert.equal(manager.inspect()["stage"], "between-facades");
        assert.deepEqual(record(manager.inspect()["closure"]), { pid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
        const records = z.array(z.record(z.string(), z.unknown())).parse(manager.inspect()["records"]);
        const retirement = records.findLast(row => row["kind"] === "retirement-result");
        const evidencePath = z.string().parse(retirement?.["evidenceFile"]);
        const evidenceText = await readFile(evidencePath, "utf8");
        const evidence = record(JSON.parse(evidenceText)), value = record(evidence["value"]);
        const content = z.array(z.object({ type: z.literal("text"), text: z.string() })).parse(value["content"]);
        const contentText = z.string().parse(content[0]?.text), packet = record(JSON.parse(contentText));
        const telemetry = record(packet["telemetry"]);
        assert.equal(telemetry["collections"], 1); assert.equal(telemetry["pending"], false); assert.equal(telemetry["busy"], false);
        const calls = z.array(z.record(z.string(), z.unknown())).parse(telemetry["calls"]);
        const forwarded = calls.filter(call => call["tool"] === "easyeda_control_pcb209_worker_startup");
        const initial = record(forwarded[0]?.["outer"]); assert.deepEqual(initial, { action: "footprint-forward-source-relinquishment", request: original });
        for (const call of forwarded.slice(1)) { assert.deepEqual(call["outer"], { action: "footprint-forward-source-relinquishment", request: { ...original, action: "settle-unknown-source-opening" } }); }
        assert.equal(forwarded.length, kind === "lost-settle-ack" ? 4 : 3);
        assert.ok(calls.every(call => call["tool"] === "easyeda_control_pcb209_worker_startup" || call["tool"] === "easyeda_control_session"));
        await manager.handle(request({ id: "historical-shutdown", action: "shutdown" })); assert.equal(manager.inspect()["stage"], "closed");
      });
    });
  }
});

/** Inert SDK peer for the exact Via family, with a genuinely pending execute
 * Promise and independently acknowledged original abort/exit/release stages. */
function interruptedViaPeer(schematic = false): string {
  const source = `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-original-via',version:'1.0.0'},{capabilities:{tools:{}}});
const op='pcb209-via-write-manager-original',gate=Promise.withResolvers(),calls=[];let active=0,executes=0,aborted=false,released=false,settled=false;
const result=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const refused=()=>({isError:true,content:[{type:'text',text:'synthetic-original-via-refusal'}]});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session','easyeda_control_current_pcb_via_write'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
const q=params.arguments?.request;
if(params.name==='easyeda_control_api'&&q?.action==='loaded-facade')return result({offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}});
if(params.name==='easyeda_control_session'){
 if(q?.action==='retire'&&(active!==0||!released||!settled))return refused();const retired=q?.action==='retire';
 return result({result:{schema:'easyeda-pro-control.session-retirement.v1',state:retired?'retired':'active',activeCalls:active,liveAdmissionOpen:!retired,leaseReleaseAcknowledged:retired,replacementConnectionRequired:retired}});
}
calls.push({tool:params.name,...q});if(params.name!=='easyeda_control_current_pcb_via_write'||q?.operationId!==op)return refused();
if(q.action==='execute'){if(++executes!==1||!['confirmDisposableViaWrite','confirmOneSave','confirmForwardOnly','confirmNormalOpenEffects'].every(k=>q[k]===true))return refused();active++;await gate.promise;active--;return result({result:{operationId:op,action:q.action,originalReturned:true}});}
if(q.action==='abort'){if(aborted||q.confirmOriginalJobOnly!==true||Object.keys(q).length!==3)return refused();aborted=true;setTimeout(()=>gate.resolve(),125);return result({result:{operationId:op,action:q.action,terminationDispatched:true}});}
if(q.action==='observe-termination')return result({result:{operationId:op,action:q.action,terminated:aborted&&active===0}});
if(q.action==='release'){if(!aborted||active!==0||released)return refused();released=true;return result({result:{operationId:op,action:q.action,released:true}});}
if(q.action==='settle-publication'){settled=true;return result({result:{operationId:op,action:q.action,settled:true}});}
if(q.action==='inspect')return result({result:{operationId:op,action:q.action,active,executes,aborted,released,settled,calls}});return refused();
});
setTimeout(()=>{gate.resolve();void server.close();},18000).unref();await server.connect(new StdioServerTransport());`;
  return schematic ? source.replaceAll("easyeda_control_current_pcb_via_write", "easyeda_control_current_schematic_relevance_display_write")
    .replaceAll("pcb209-via-write-manager-original", "sch209-relevance-display-manager-original")
    .replaceAll("confirmDisposableViaWrite", "confirmDisposableDisplayTransaction").replaceAll("confirmNormalOpenEffects", "acceptNormalOpenEffects") : source;
}
void test("Via and schematic original manager cleanup binds timeout and in-flight abort to the same retained request/client through facade retirement", { timeout: 25_000 }, async context => {
  for (const [mode, schematic] of [["timeout", false], ["in-flight", false], ["timeout", true], ["in-flight", true]] as const) {
    const selected = await fixture(interruptedViaPeer(schematic)); const outputs: unknown[] = [];
    await selectedProfile(selected.profilePath, async () => {
      const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
      context.after(async () => {
        if (manager.inspect()["stage"] === "closed") { return; }
        const deadline = Date.now() + 19_000;
        while (manager.inspect()["closure"] === null && Date.now() < deadline) { await wait(10); }
        await manager.handle(request({ id: `${mode}-fixture-shutdown`, action: "shutdown" }));
      });
      await manager.initialize(selected.root); const pid = manager.inspect()["facadePid"];
      const tool = schematic ? "easyeda_control_current_schematic_relevance_display_write" : "easyeda_control_current_pcb_via_write";
      const execute = { id: `${mode}-original-execute`, tool, timeoutMs: mode === "timeout" ? 1000 : 10_000,
        arguments: { request: { action: "execute", operationId: schematic ? "sch209-relevance-display-manager-original" : "pcb209-via-write-manager-original",
          confirmOneSave: true, confirmForwardOnly: true, ...(schematic ? { confirmDisposableDisplayTransaction: true, acceptNormalOpenEffects: true } : { confirmDisposableViaWrite: true, confirmNormalOpenEffects: true }) } } };
      const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
        interruptedRequestId: execute.id, request: { action, ...extra } });
      const side = (id: string, action: string, extra: object = {}): string => request({ id, action: "in-flight-original", generation: 1,
        originalRequestId: execute.id, request: { action, ...extra } });
      let parentSettled = false;
      const pending = (async (): Promise<void> => { try { await manager.handle(request(execute)); } finally { parentSettled = true; } })();
      await managerProgress(() => record(manager.inspect()["inFlightRequest"])["rpcPending"] === true);
      if (mode === "in-flight") {
        await manager.handleInFlight(side("foreign-via-operation", "inspect", { operationId: "pcb209-via-write-foreign" })); assert.equal(record(outputs.at(-1))["dispatched"], false);
        await manager.handleInFlight(side("original-via-inspect", "inspect"));
        await manager.handleInFlight(side("original-via-abort", "abort"));
        assert.equal(parentSettled, false); assert.equal(manager.hasInFlightCapture(), true); assert.equal(manager.inspect()["stage"], "blocked");
      }
      await pending; assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], pid);
      for (const rejected of [request({ ...execute, id: `${mode}-replay`, cleanup: true }), loaded(`${mode}-ordinary-refused`),
        cleanup(`${mode}-foreign-operation`, "inspect", { operationId: "pcb209-via-write-foreign" }), cleanup(`${mode}-caller-confirm`, "abort", { confirmOriginalJobOnly: true }), cleanup(`${mode}-wrong-family`, "release-closed"),
        request({ id: `${mode}-foreign-request`, action: "cleanup-original", generation: 1, interruptedRequestId: "foreign", request: { action: "inspect" } })]) {
        await manager.handle(rejected); assert.equal(record(outputs.at(-1))["dispatched"], false);
      }
      if (mode === "timeout") {
        await manager.handle(retire("timeout-via-premature-retire", 1)); assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(record(outputs.at(-1))["retirementRefused"], true);
        await manager.handle(cleanup("timeout-via-abort", "abort")); await wait(150);
      }
      for (const [id, action] of [[`${mode}-via-exit`, "observe-termination"], [`${mode}-via-release`, "release"], [`${mode}-via-publish`, "settle-publication"], [`${mode}-via-inspect`, "inspect"]] as const) {
        await manager.handle(cleanup(id, action)); const output = record(outputs.at(-1)); assert.notEqual(record(output["result"])["isError"], true);
      }
      const finalOutput = record(outputs.at(-1)); const envelope = record(finalOutput["result"]); const content = record(envelope["structuredContent"]); const inspected = record(content["result"]);
      const calls = z.array(z.record(z.string(), z.unknown())).parse(inspected["calls"]);
      assert.equal(inspected["executes"], 1); assert.equal(inspected["released"], true); assert.equal(inspected["settled"], true);
      const aborts = calls.filter(call => call["action"] === "abort"); assert.equal(aborts.length, 1); assert.equal(aborts[0]?.["confirmOriginalJobOnly"], true);
      assert.ok(calls.every(call => call["operationId"] === execute.arguments.request.operationId && call["tool"] === execute.tool));
      await manager.handle(cleanup(`${mode}-abort-replay`, "abort")); assert.equal(record(outputs.at(-1))["dispatched"], false);
      await manager.handle(retire(`${mode}-via-final-retire`, 1)); assert.equal(manager.inspect()["stage"], "between-facades");
      assert.equal(record(manager.inspect()["closure"])["pid"], pid); await manager.handle(request({ id: `${mode}-via-shutdown`, action: "shutdown" }));
      assert.equal(manager.inspect()["stage"], "closed");
    });
  }
});

/** This peer has only synthetic lifecycle state; it launches no app/helper. */
function interruptedSpatialPeer(family: "spatial" | "component-spatial"): string {
  const operationId = family === "spatial" ? "pcb209-spatial-manager-original" : "pcb209-spatial-component-manager-original";
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-original-spatial',version:'1.0.0'},{capabilities:{tools:{}}});
const op=${JSON.stringify(operationId)},family=${JSON.stringify(family)},calls=[];let active=0,reads=0,closed=false,released=false,aborted=false;
const result=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const refused=()=>({isError:true,content:[{type:'text',text:'synthetic-original-spatial-refusal'}]});
const bindingSha256='b'.repeat(64),intentSha256='a'.repeat(64),binding={helperInstance:'c'.repeat(32),jobId:'d'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
const base=()=>({operationId:op,state:released?'released':closed?'terminated':'launched',bindingSha256,intentSha256,binding,launchAcknowledged:true});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session','easyeda_control_pcb209_opening'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
const wrapped=params.arguments?.request,q=wrapped?.request;
if(params.name==='easyeda_control_api'&&wrapped?.action==='loaded-facade')return result({offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}});
if(params.name==='easyeda_control_session'){if(wrapped?.action==='retire'&&(active!==0||!released))return refused();const retired=wrapped?.action==='retire';return result({result:{schema:'easyeda-pro-control.session-retirement.v1',state:retired?'retired':'active',activeCalls:active,liveAdmissionOpen:!retired,leaseReleaseAcknowledged:retired,replacementConnectionRequired:retired}});}
if(params.name!=='easyeda_control_pcb209_opening'||wrapped?.action!==family||q?.operationId!==op)return refused();calls.push(q);
if(q.action==='observe-spatial'||q.action==='observe-components'){if(++reads!==1)return refused();active++;await new Promise(resolve=>setTimeout(resolve,1250));active--;return result({result:{...base(),readReturned:true}});}
if(q.action==='inspect')return result({result:{...base(),busy:active!==0,publicationSettlementAvailable:!released,closeAttemptConsumed:closed,releaseAttemptConsumed:released,unlaunchedCleanupAvailable:false,noProcessCleanupAvailable:false,componentAbortAttemptConsumed:aborted,calls,reads}});
if(q.action==='abort-component'){if(family!=='component-spatial'||aborted||q.expectedBindingSha256!==bindingSha256||q.confirmAbortOriginalComponentJob!==true||Object.keys(q).sort().join(',')!=='action,confirmAbortOriginalComponentJob,expectedBindingSha256,operationId')return refused();aborted=true;closed=true;return result({result:{...base(),terminationDispatched:true,terminationProved:false}});}
if(active||q.expectedBindingSha256!==bindingSha256)return refused();
if(q.action==='observe-window')return result({result:{...base(),hwnd:'123'}});
if(q.action==='normal-close'){if(closed||q.hwnd!=='123'||q.confirmNormalClose!==true)return refused();closed=true;return result({result:{...base(),closeAcknowledged:true}});}
if(q.action==='observe-termination')return result({result:{...base(),terminated:closed}});
if(q.action==='release-closed'){if(!closed||released)return refused();released=true;return result({result:{...base(),released:true}});}return refused();
});setTimeout(()=>{void server.close();},18000).unref();await server.connect(new StdioServerTransport());`;
}
void test("spatial and Component manager timeout recovery keeps the original wrapper, window and once-only cleanup", { timeout: 25_000 }, async context => {
  for (const family of ["spatial", "component-spatial"] as const) {
    const outputs: unknown[] = []; const selected = await fixture(interruptedSpatialPeer(family));
    await selectedProfile(selected.profilePath, async () => {
      const manager = new ForegroundSessionManager(value => { outputs.push(value); return Promise.resolve(); });
      context.after(async () => {
        if (manager.inspect()["stage"] === "closed") { return; }
        const deadline = Date.now() + 19_000; while (manager.inspect()["closure"] === null && Date.now() < deadline) { await wait(10); }
        await manager.handle(request({ id: `${family}-finally`, action: "shutdown" }));
      });
      await manager.initialize(selected.root); const operationId = family === "spatial" ? "pcb209-spatial-manager-original" : "pcb209-spatial-component-manager-original";
      const originalId = `${family}-read`; const action = family === "spatial" ? "observe-spatial" : "observe-components";
      const pending = manager.handle(request({ id: originalId, tool: "easyeda_control_pcb209_opening", timeoutMs: 1000,
        arguments: { request: { action: family, request: { action, operationId, expectedBindingSha256: "b".repeat(64), queries: [{ kind: "point", xMil: 0, yMil: 0 }], acceptNativeScratchEffects: true } } } }));
      await managerProgress(() => manager.inspect()["inFlightRequest"] !== null && record(manager.inspect()["inFlightRequest"])["rpcPending"] === true);
      await manager.handleInFlight(request({ id: `${family}-side-inspect`, action: "in-flight-original", generation: 1, originalRequestId: originalId, request: { action: "inspect" } }));
      await pending; assert.equal(manager.inspect()["stage"], "blocked");
      const cleanup = (id: string, control: object): string => request({ id, action: "cleanup-original", generation: 1, interruptedRequestId: originalId, request: control });
      for (const control of [{ action: "normal-close", confirmNormalClose: true, hwnd: "123" }, { action: "inspect", operationId: "foreign" }, { action: "abort" }]) {
        await manager.handle(cleanup(`${family}-refused-${String(outputs.length)}`, control)); assert.equal(record(outputs.at(-1))["dispatched"], false);
      }
      await wait(300);
      await manager.handle(cleanup(`${family}-inspect`, { action: "inspect" }));
      await manager.handle(cleanup(`${family}-no-window`, { action: "normal-close", confirmNormalClose: true })); assert.equal(record(outputs.at(-1))["dispatched"], false);
      await manager.handle(cleanup(`${family}-window`, { action: "observe-window" }));
      await manager.handle(cleanup(`${family}-close`, { action: "normal-close", confirmNormalClose: true }));
      await manager.handle(cleanup(`${family}-close-again`, { action: "normal-close", confirmNormalClose: true })); assert.equal(record(outputs.at(-1))["dispatched"], false);
      await manager.handle(cleanup(`${family}-termination`, { action: "observe-termination" }));
      await manager.handle(cleanup(`${family}-release`, { action: "release-closed" }));
      await manager.handle(cleanup(`${family}-release-again`, { action: "release-closed" })); assert.equal(record(outputs.at(-1))["dispatched"], false);
      await manager.handle(retire(`${family}-retire`, 1)); assert.equal(manager.inspect()["stage"], "between-facades");
      await manager.handle(request({ id: `${family}-shutdown`, action: "shutdown" })); assert.equal(manager.inspect()["stage"], "closed");
    });
  }
});

void test("original Component manager abort consumes once during the retained in-flight reader and separately releases its client", { timeout: 25_000 }, async context => {
  const outputs: unknown[] = [], selected = await fixture(interruptedSpatialPeer("component-spatial"));
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(value => { outputs.push(value); return Promise.resolve(); });
    context.after(async () => {
      if (manager.inspect()["stage"] === "closed") { return; }
      const deadline = Date.now() + 19_000; while (manager.inspect()["closure"] === null && Date.now() < deadline) { await wait(10); }
      await manager.handle(request({ id: "component-abort-finally", action: "shutdown" }));
    });
    await manager.initialize(selected.root);
    const originalId = "component-pending-read", pending = manager.handle(request({ id: originalId, tool: "easyeda_control_pcb209_opening", timeoutMs: 1000,
      arguments: { request: { action: "component-spatial", request: { action: "observe-components", operationId: "pcb209-spatial-component-manager-original", expectedBindingSha256: "b".repeat(64), queries: [{ kind: "point", xMil: 0, yMil: 0 }], acceptNativeScratchEffects: true } } } }));
    await managerProgress(() => manager.inspect()["inFlightRequest"] !== null && record(manager.inspect()["inFlightRequest"])["rpcPending"] === true);
    const side = (id: string, control: object): string => request({ id, action: "in-flight-original", generation: 1, originalRequestId: originalId, request: control });
    await manager.handleInFlight(side("component-inspect", { action: "inspect" }));
    await manager.handleInFlight(side("component-no-pid", { action: "abort-component", confirmAbortOriginalComponentJob: true, rootPid: 123 })); assert.equal(record(outputs.at(-1))["dispatched"], false);
    await manager.handleInFlight(side("component-abort", { action: "abort-component", confirmAbortOriginalComponentJob: true }));
    assert.match(JSON.stringify(outputs.at(-1)), /"terminationDispatched":true/u);
    await manager.handleInFlight(side("component-no-repeat", { action: "abort-component", confirmAbortOriginalComponentJob: true })); assert.equal(record(outputs.at(-1))["dispatched"], false);
    await pending; await wait(300); assert.equal(manager.inspect()["stage"], "blocked");
    const cleanup = (id: string, control: object): string => request({ id, action: "cleanup-original", generation: 1, interruptedRequestId: originalId, request: control });
    await manager.handle(cleanup("component-inspect-after", { action: "inspect" }));
    await manager.handle(cleanup("component-never-close-after", { action: "normal-close", confirmNormalClose: true })); assert.equal(record(outputs.at(-1))["dispatched"], false);
    await manager.handle(cleanup("component-exit", { action: "observe-termination" }));
    await manager.handle(cleanup("component-release", { action: "release-closed" }));
    await manager.handle(retire("component-retire", 1)); assert.equal(manager.inspect()["stage"], "between-facades");
    await manager.handle(request({ id: "component-shutdown", action: "shutdown" })); assert.equal(manager.inspect()["stage"], "closed");
  });
});

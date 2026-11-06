/** Production original-owner methods/queues with real synthetic child streams.
 * The explicit checkpoint seam has no native authority. */
/* oxlint-disable import/max-dependencies -- Production private factory registry, retained synthetic child and exact purpose cleanup are checked together. */
import { currentPcbViaSavedReadbackAllocationOutcome, startCurrentPcbViaSavedReadbackOwner } from "../src/current-pcb-via-saved-readback-owner.ts";
import type { CurrentPcbViaWriteClosedCheckpoint } from "../src/current-pcb-via-write-closed-checkpoint.ts";
import { completeSyntheticSavedCacheFixture } from "./helpers/current-pcb-via-saved-cache-fixture.ts";
import { currentPcbViaSavedReadbackActorNativeFrame, currentPcbViaSavedReadbackActorWire } from "../src/current-pcb-via-saved-cache-wire.ts";
import { GENERATED_FIXTURE_REGISTRATION_FUNCTION } from "../src/managed-fixture-registration-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-opening.ts";
import type { CurrentPcbViaSavedCacheBackupGrant } from "../src/current-pcb-via-saved-cache-backup-origin.ts";
import { PassThrough } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { CurrentPcbViaSavedReadbackPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_BOOTSTRAP_REQUESTS, CURRENT_PCB_VIA_SAVED_READBACK_PROFILE } from "../src/current-pcb-via-saved-readback-profile.ts";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbViaSavedReadbackOwner } from "../src/current-pcb-diagnostic-owner.ts";

async function fixture(context: TestContext, malformed = false, cache = false, metadata = false, complete = false, invalidation = false, lostDelete = false, windowDrift = false, registration: "none" | "success" | "lost" | "unawaited" = "none"): Promise<Readonly<{ owner: CurrentPcbViaSavedReadbackOwner; actions: string[]; pollEntered: Promise<true>; cacheRequest: (() => Promise<unknown>) | null; deleteEntered: Promise<true>; registrationEntered: Promise<true>; prepared: CurrentPcbViaWriteClosedCheckpoint }>> {
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const sourceRequire = createRequire(url);
  const full = complete ? completeSyntheticSavedCacheFixture(invalidation) : null;
  const prepared = full?.prepared ?? Object.freeze({ syntheticCheckpoint: true, target: Object.freeze({ projectUuid: "a".repeat(64) }) });
  const testMethod = `public syntheticRegistrationBindingsForTest(intent){return this.originalSavedProjectRegistrationIntent(intent,this.#mainRunner);}
public async seedSyntheticCacheForTest(full){
const pipe=this.#pipe;if(!(pipe instanceof CurrentPcbViaSavedReadbackPipe))throw Error("pipe");await this.#transfer(async()=>({sessionId:await pipe.attachTarget("synthetic-target",event=>{if(this.#savedReadbackLoadController!==null&&event.method==='Target.attachedToTarget'){this.#savedReadbackLoadController.observeEvent(event);return;}if(this.#observeSavedReadbackGuardHelper(event))return;if(this.#savedReadbackInvalidation?.observeOriginalEvent(event))return;})}));
this.#stagedAttachment=Object.freeze({targetId:"synthetic-target",sessionId:"synthetic-session"});this.#savedReadbackActorsPending=true;await this.#transfer(()=>pipe.armSavedReadbackCacheActors());this.#savedReadbackActorsPending=false;this.#savedReadbackActorsArmed=true;this.#savedReadbackParentPending=true;await this.#transfer(()=>pipe.armSavedReadbackCacheParent());this.#savedReadbackParentPending=false;
const selected=Object.freeze({frameId:"synthetic-frame",sessionId:"synthetic-session",uniqueContextId:"synthetic-context",securityOrigin:"https://client"});
const context={openingContext:()=>({sessionId:selected.sessionId,uniqueContextId:selected.uniqueContextId}),savedReadbackCacheContext:()=>selected,script:()=>({context:{id:7}})};this.#stagedContext=context;
this.#savedReadbackParentArmed=true;this.#mainRunner={selectedSqlFenceState:()=>({ready:true}),pumpSelectedSqlFence:async()=>{},enrollSavedProjectRegistrationIntent:async()=>{},requireOriginalSavedProjectRegistrationAwaited:()=>{if(${String(registration === "unawaited")})throw Error("SAVED_REGISTRATION_ORIGINAL_AWAITS_REQUIRED");}};
const ledger=full?.ledger??new CurrentPcbViaSavedCacheLedger(Object.freeze({frameId:selected.frameId,sessionId:selected.sessionId,securityOrigin:selected.securityOrigin,projectUuid:this.#savedReadbackPrepared.target.projectUuid}));
const origin=Object.freeze({profile:"private.current-pcb-via-saved-cache-origin.v1"});const bindings=this.#createSavedReadbackCacheBindings(ledger,origin,pipe,this.#savedReadbackPrepared);
const metadata=full?.metadata??new CurrentPcbViaSavedCacheMetadataLedger({sessionId:selected.sessionId,uniqueContextId:selected.uniqueContextId,executionContextId:7,projectUuid:this.#savedReadbackPrepared.target.projectUuid});
const held=Object.freeze({origin,prepared:this.#savedReadbackPrepared,owner:this,ledger,metadata,context,selected,bindings,windowTabId:"synthetic-window"});this.#savedReadbackCache=held;savedReadbackCaches.set(origin,held);return bindings;
}`;
  const originalSource = await readFile(url, "utf8");
  let seededSource = originalSource.replace("  public async startSavedReadbackGeneration()", `${testMethod}\n  public async startSavedReadbackGeneration()`);
  assert.notEqual(seededSource, originalSource);
  if (invalidation) {
    // Explicit inert parent/frame inventory seam; actual fixed native guard,
    // Helper source correlation and delete packets still use the real pipe.
    seededSource = seededSource.replace("async #observeParent(): Promise<RecordValue> {", "async #observeParent(): Promise<RecordValue> { return {};").replace("async #observeOpeningAncillary(): Promise<void> {", "async #observeOpeningAncillary(): Promise<void> { return;");
  }
  const source = `${seededSource}\nexport function seedSyntheticSavedReadback(owner,installation,prepared){
const writer={status:()=>({released:true,helperClosed:true})};const requireCheckpoint=value=>{if(value!==prepared)throw Error("synthetic original checkpoint");return {owner:writer};};const verifyPrepared=async value=>{requireCheckpoint(value);};
const checkpointModule=Object.freeze({requireOriginalCurrentPcbViaWriteClosedCheckpoint:requireCheckpoint,verifyCurrentPcbViaWriteClosedCheckpoint:verifyPrepared});
const loadPlan=Object.freeze({profile:"private.current-pcb-via-saved-load-plan.v1"});const requireLoadPlan=(plan,value)=>{if(plan!==loadPlan||value!==prepared)throw Error("synthetic original plan");return {};};const prepareLoadPlan=async()=>loadPlan;const loadModule=Object.freeze({prepareCurrentPcbViaSavedLoadPlan:prepareLoadPlan,requireOriginalCurrentPcbViaSavedLoadPlan:requireLoadPlan});
const allocation={options:Object.freeze({}),prepared,writer,checkpointModule,requireCheckpoint,verifyPrepared,loadModule,prepareLoadPlan,requireLoadPlan,loadPlan,state:"retained",owner,child:null,eofAttempted:false,cleanupFailure:null};
pcbViaSavedReadbackAllocations.set(prepared,allocation);pcbViaSavedReadbackFactories.set(owner,Object.freeze({allocation,installation}));}
`;

  const compiled = await transform(source, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [sourceRequire, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaSavedReadbackOwner"], seed = loaded.exports["seedSyntheticSavedReadback"];
  assert.ok(typeof Constructor === "function" && typeof seed === "function");
  const guardReply = { schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "preflight", projectUuid: full?.ledger.snapshot().frame.projectUuid ?? "a".repeat(64),
    branchUuid: "3".repeat(32), documentUuid: "4".repeat(32), ok: true, status: "ready", failure: null, dispatchAttempted: false, publicResult: null, prefixObserved: false, nativeWorkMayRemain: false,
    observation: { projectPresent: false, branchUuid: null, windowTabId: windowDrift ? "foreign-window" : "synthetic-window", containerCount: 1, tabIds: [], activeTabId: "tab_page1", initialTitle: "EasyEDA Pro - V3.2.209", expectedOpenedTitle: "EasyEDA Pro - V3.2.209", documentTitle: "EasyEDA Pro - V3.2.209" } };
  const initialRoster = full?.ledger.snapshot().roster.caches ?? [];
  let registeredPath: string | undefined;
  if (full !== null) { const target = full.prepared["target"]; assert.ok(target !== null && typeof target === "object" && "rawWindowsPath" in target && typeof target.rawWindowsPath === "string"); registeredPath = target.rawWindowsPath; }
  const script = `const registrationReply=${JSON.stringify({ schema: "easyeda-pro-control.generated-fixture-path-registration.v1", projectUuid: full?.ledger.snapshot().frame.projectUuid, rawWindowsPath: registeredPath, beforeRegistrySha256: "0".repeat(64), afterRegistrySha256: "1".repeat(64), beforeCount: 0, afterCount: 1, registrationDispatched: true, priorRegistrationPresent: false, exactOtherRegistrationRosterUnchanged: true, selectedRawPathMatched: true, selectedNonCbbMatched: true, recentPathRowMayHaveChanged: true, projectNavigationDispatched: false, cadEditDispatched: false, explicitSaveDispatched: false, persistentRegistrationVerified: false, replayAllowed: false, writerAuthority: false })},registrationSource=${JSON.stringify(`(${GENERATED_FIXTURE_REGISTRATION_FUNCTION})`)};const guardReply=${JSON.stringify(guardReply)},helperSource=${JSON.stringify(`(${CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION})`)},roster=${JSON.stringify(initialRoster)};
const readline=require('node:readline'),input=readline.createInterface({input:process.stdin});let terminated=false,attached=false,queued=[];
const send=(q,result)=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
input.on('line',line=>{const q=JSON.parse(line);
if(q.action==='launch')send(q,{helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'});
else if(q.action==='send'){if(q.method==='Debugger.getScriptSource')queued.push({id:q.requestId,result:{scriptSource:q.scriptId==='registration-helper'?registrationSource:helperSource},sessionId:q.sessionId});else{attached=true;queued.push({id:q.requestId,result:{sessionId:'synthetic-session'}});}send(q,{written:true});}
else if(q.action==='saved-readback-actors'){queued.push({id:q.requestId,result:{}});send(q,{written:true});}
else if(q.action==='saved-readback-parent'){queued.push({id:q.requestId,result:{},sessionId:q.sessionId});send(q,{written:true});}
else if(q.action==='saved-readback-metadata'){if(q.savedCacheMetadataPhase!=='saved-cache-native-constructors'||q.uniqueContextId!=='synthetic-context')throw Error('metadata-selector');send(q,{written:true});}
else if(q.action==='saved-readback-register'){if(q.sessionId!=='synthetic-session'||q.uniqueContextId!=='synthetic-context')throw Error('registration-receiver');queued.push({method:'Debugger.scriptParsed',params:{scriptId:'registration-helper',url:'',executionContextId:7},sessionId:q.sessionId});if(!${String(registration === 'lost')})queued.push({id:q.requestId,result:{result:{type:'string',value:JSON.stringify(registrationReply)}},sessionId:q.sessionId});send(q,{written:true});}
else if(q.action==='saved-readback-registration-complete')send(q,{registrationAwaited:true});
else if(q.action==='saved-readback-worker-bind')send(q,{bound:true});
else if(q.action==='saved-readback-backup-enroll')send(q,{backupEnrolled:true});
else if(q.action==='saved-readback-cache-guard'||q.action==='saved-readback-load-guard'){queued.push({method:'Debugger.scriptParsed',params:{scriptId:'guard-'+q.namespaceOrdinal,url:'',executionContextId:7},sessionId:q.sessionId});queued.push({id:q.requestId,result:{result:{type:'string',value:JSON.stringify(guardReply)}},sessionId:q.sessionId});send(q,{written:true});}
else if(q.action==='saved-readback-cache'){if(!${String(invalidation)}){if(q.savedCachePhase!=='saved-cache-key'||q.frameId!=='synthetic-frame')throw Error('selector');}else{let result;if(q.savedCachePhase==='saved-cache-untrack')result={};else if(q.savedCachePhase==='saved-cache-key')result={storageKey:'https://client/'};else if(q.savedCachePhase==='saved-cache-names')result={caches:roster};else if(q.savedCachePhase==='saved-cache-delete'){if(q.cacheId!=='cache-'+q.namespaceOrdinal)throw Error('foreign-delete');const i=roster.findIndex(x=>x.cacheId===q.cacheId);if(i<0)throw Error('replay');roster.splice(i,1);queued.push({method:'Storage.cacheStorageListUpdated',params:{origin:'https://client',storageKey:'https://client/',bucketId:'1'},sessionId:q.sessionId});result={};}else throw Error('cache-phase');if(!(${String(lostDelete)}&&q.savedCachePhase==='saved-cache-delete'))queued.push({id:q.requestId,result,sessionId:q.sessionId});}send(q,{written:true});}
else if(q.action==='poll')setTimeout(()=>${malformed ? String.raw`process.stdout.write('malformed\n')` : String.raw`send(q,{bytes:attached&&queued.length?Buffer.from(JSON.stringify(queued.shift())+"\u0000").toString('base64'):''})`},50);
else if(q.action==='saved-readback-abort'){if(q.confirmAbortOriginalSavedReadbackJob!==true)throw Error('confirmation');terminated=true;send(q,{terminationDispatched:true});}
else if(q.action==='termination')send(q,{terminated,originalRootExited:terminated,originalJobEmpty:terminated});
else if(q.action==='release')send(q,{released:true});else throw Error('unexpected '+q.action);});`;
  const child = spawn(process.execPath, ["-e", script], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], deleteEntered = Promise.withResolvers<true>(), pollEntered = Promise.withResolvers<true>(), registrationEntered = Promise.withResolvers<true>(); const originalWrite = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>): boolean => {
    const chunk: unknown = args[0]; if (typeof chunk === "string") { const value: unknown = JSON.parse(chunk);
      assert.ok(value !== null && typeof value === "object" && "action" in value); actions.push(String(value.action)); if (value.action === "saved-readback-register") { registrationEntered.resolve(true); } if (value.action === "saved-readback-cache" && "savedCachePhase" in value && value.savedCachePhase === "saved-cache-delete") { deleteEntered.resolve(true); } if (value.action === "poll" && (!cache || actions.includes(metadata ? "saved-readback-metadata" : "saved-readback-cache"))) { pollEntered.resolve(true); } }
    return originalWrite(...args);
  });
  const executable = Object.freeze({ windowsPath: "C:\\Reviewed\\easyeda-pro.exe", sha256: "a".repeat(64) });
  const plan = Object.freeze({ files: Object.freeze([executable]) }); const installation = Object.freeze({ plan });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked production VM constructor, explicit inert checkpoint seam, real retained synthetic child only.
  const owner = Reflect.construct(Constructor, [child, (): Promise<void> => Promise.resolve(), prepared, installation, (): Promise<void> => Promise.resolve()]) as CurrentPcbViaSavedReadbackOwner;
  Reflect.apply(seed, undefined, [owner, installation, prepared]); owner.start();
  context.after(async () => { if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.startSavedReadbackGeneration();
  let cacheRequest: (() => Promise<unknown>) | null = null;
  if (cache) {
    const method: unknown = Reflect.get(owner, "seedSyntheticCacheForTest"); assert.ok(typeof method === "function");
    const bindings: unknown = await Reflect.apply(method, owner, [full]); assert.ok(bindings !== null && typeof bindings === "object" && "request" in bindings && typeof bindings.request === "function" && "metadataRequest" in bindings && typeof bindings.metadataRequest === "function");
    const request = metadata ? bindings.metadataRequest : bindings.request;
    cacheRequest = (): Promise<unknown> => { const result: unknown = Reflect.apply(request, bindings, [metadata ? { phase: "saved-cache-native-constructors", kind: "cache-response" } : { phase: "saved-cache-key", step: "initial" }]); assert.ok(result instanceof Promise); return result; };
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The test-only private factory seam above deliberately substitutes an inert checkpoint issuer.
  return { owner, actions, pollEntered: pollEntered.promise, cacheRequest, deleteEntered: deleteEntered.promise, registrationEntered: registrationEntered.promise, prepared: prepared as unknown as CurrentPcbViaWriteClosedCheckpoint };
}

void test("original durable backup drives two source-qualified guards and once-only native deletes before absence", async context => {
  const f = await fixture(context, false, true, false, true, true); await f.owner.publishSavedCacheBackup();
  const original = f.owner.invalidateSavedCaches(); assert.equal(f.owner.invalidateSavedCaches(), original);
  const absence = await original; assert.equal(absence.profile, "private.current-pcb-via-saved-cache-absence.v1");
  const loadingPromise = f.owner.prepareSavedReadbackLoading(); assert.equal(f.owner.prepareSavedReadbackLoading(), loadingPromise);
  const loading = await loadingPromise, ready = f.owner.originalSavedReadbackLoadPreparation(loading, f.prepared);
  assert.equal(ready.projectOpeningAuthorized, false); assert.equal(ready.freshLoadingVerified, false); assert.equal(ready.data.bothExactNamespacesAbsent, true); await ready.assertCurrent();
  assert.throws(() => f.owner.originalSavedReadbackLoadPreparation({ ...loading }, f.prepared));
  assert.equal(f.actions.filter(action => action === "saved-readback-load-guard").length, 1);
  const proof = f.owner.originalSavedReadbackCacheAbsence(absence, f.prepared); assert.equal(proof.freshLoadingVerified, false); await proof.assertCurrent();
  assert.throws(() => f.owner.originalSavedReadbackCacheAbsence({ ...absence }, f.prepared));
  assert.equal(f.actions.filter(action => action === "saved-readback-backup-enroll").length, 1);
  assert.equal(f.actions.filter(action => action === "saved-readback-cache-guard").length, 2);
  assert.equal(f.actions.filter(action => action === "saved-readback-cache").length, 11);
  assert.equal(f.owner.invalidateSavedCaches(), original); await f.owner.abortSavedReadback(true);
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("changed original empty window refuses before the first selected namespace delete", async context => {
  const f = await fixture(context, false, true, false, true, true, false, true); await f.owner.publishSavedCacheBackup();
  const attempt = f.owner.invalidateSavedCaches(); await assert.rejects(attempt, /EMPTY_UI_REQUIRED/u);
  assert.equal(f.owner.invalidateSavedCaches(), attempt); assert.equal(f.actions.filter(action => action === "saved-readback-cache").length, 0);
  assert.equal(f.actions.filter(action => action === "saved-readback-cache-guard").length, 1);
  await f.owner.abortSavedReadback(true); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("transferred original absence arms a distinct loading cursor and original abort settles its pending first attachment", async context => {
  const f = await fixture(context, false, true, false, true, true); await f.owner.publishSavedCacheBackup(); await f.owner.invalidateSavedCaches();
  const prepared = await f.owner.prepareSavedReadbackLoading(); let callbacks = 0;
  await f.owner.armSavedReadbackLoadWorker(() => { callbacks += 1; return Promise.resolve(); });
  const intentPromise = f.owner.prepareSavedReadbackRegistrationIntent(); assert.equal(f.owner.prepareSavedReadbackRegistrationIntent(), intentPromise);
  const intent = await intentPromise, lookup: unknown = Reflect.get(f.owner, "syntheticRegistrationBindingsForTest"); assert.ok(typeof lookup === "function");
  const bindings: unknown = Reflect.apply(lookup, f.owner, [intent]); assert.ok(bindings !== null && typeof bindings === "object" && "assertCurrent" in bindings && typeof bindings.assertCurrent === "function" && "assertOriginalDispatchPending" in bindings && typeof bindings.assertOriginalDispatchPending === "function");
  const assertPending = bindings.assertOriginalDispatchPending;
  await Reflect.apply(bindings.assertCurrent, bindings, []); assert.throws(() => Reflect.apply(assertPending, bindings, []));
  assert.throws(() => Reflect.apply(lookup, f.owner, [{ ...intent }]));

  assert.throws(() => f.owner.originalSavedReadbackLoadPreparation(prepared, f.prepared));
  await assert.rejects(f.owner.armSavedReadbackLoadWorker(() => Promise.resolve()));
  const source = f.owner.observeSavedReadbackLoadSource(); const refused = assert.rejects(source); await delay(75);
  await f.owner.abortSavedReadback(true); await refused; assert.equal(callbacks, 0); assert.equal(f.owner.status().busy, false);
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("lost original delete reply remains consumed and original Job abort settles it without deleting the peer namespace", async context => {
  const f = await fixture(context, false, true, false, true, true, true); await f.owner.publishSavedCacheBackup();
  const original = f.owner.invalidateSavedCaches(), refused = assert.rejects(original); await f.deleteEntered;
  await f.owner.abortSavedReadback(true); await refused;
  assert.equal(f.owner.invalidateSavedCaches(), original); assert.equal(f.actions.filter(action => action === "saved-readback-backup-enroll").length, 1);
  assert.equal(f.actions.filter(action => action === "saved-readback-cache-guard").length, 1);
  assert.equal(f.actions.filter(action => action === "saved-readback-cache").length, 3);
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

void test("original reader publishes only its complete native ledgers once and refuses copied grants or changed backup bytes", async context => {
  const f = await fixture(context, false, true, false, true);
  const original = f.owner.publishSavedCacheBackup(); assert.equal(f.owner.publishSavedCacheBackup(), original);
  const grant = await original;
  // The fixture's checkpoint issuer is deliberately inert; the production
  // Owner method still joins actual private ledger refs and full backup IO.
  const bindings = f.owner.originalSavedReadbackBackupBindings(grant, f.prepared);
  assert.equal(bindings.cacheDeletionAuthorized, false); assert.equal(bindings.data.totalEntries, 0);
  await bindings.assertCurrent();
  assert.throws(() => f.owner.originalSavedReadbackBackupBindings({ ...grant }, f.prepared));
  await writeFile(bindings.published.artifact.path, "changed synthetic backup"); await assert.rejects(bindings.assertCurrent());
  assert.equal(f.owner.publishSavedCacheBackup(), original); assert.equal(f.actions.filter(action => action === "saved-readback-cache").length, 0);
  await f.owner.abortSavedReadback(true); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});
void test("incomplete original cache observations retain one rejected publication and cannot mint a backup grant", async context => {
  const f = await fixture(context, false, true); const original = f.owner.publishSavedCacheBackup(); await assert.rejects(original);
  assert.equal(f.owner.publishSavedCacheBackup(), original);
  const forged: CurrentPcbViaSavedCacheBackupGrant = { profile: "private.current-pcb-via-saved-cache-backup-grant.v1" };
  assert.throws(() => f.owner.originalSavedReadbackBackupBindings(forged, f.prepared));
  await f.owner.abortSavedReadback(true); assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
});

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

void test("fresh readback native composition repeats exactly and its current pipe preserves51 bounded discovery slots and no opening grant", async context => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const first = generateWorkerStartupProtocol(source); assert.equal(generateWorkerStartupProtocol(first), first);
  const invalidationStart = first.indexOf("        'saved-readback-worker-bind' {\n");
  const metadataStart = first.indexOf("        'saved-readback-metadata' {\n");
  const parentStart = first.indexOf("        'saved-readback-parent' {\n");
  const preflightStart = first.indexOf("        'saved-readback-preflight' {\n");
  const abortStart = first.indexOf("        'saved-readback-abort' {\n");
  assert.ok(metadataStart !== -1 && parentStart > metadataStart && preflightStart > parentStart && abortStart > preflightStart);
  const registrationStart = first.indexOf("        'saved-readback-register' {\n");
  const observationStart = first.indexOf("        'saved-readback-observation-bind' {\n");
  const cacheDispatchStart = first.indexOf("        'saved-readback-load-guard' {\n");
  assert.ok(registrationStart > invalidationStart && observationStart > registrationStart && cacheDispatchStart > observationStart);
  assert.equal(generateWorkerStartupProtocol(first.slice(0, registrationStart) + first.slice(cacheDispatchStart)), first);
  const priorParent = first.slice(0, invalidationStart) + first.slice(parentStart);
  assert.equal(generateWorkerStartupProtocol(priorParent), first);
  const priorReadOnly = first.slice(0, invalidationStart) + first.slice(preflightStart);
  assert.equal(generateWorkerStartupProtocol(priorReadOnly), first);
  const priorBirth = first.slice(0, invalidationStart) + first.slice(abortStart);
  assert.equal(generateWorkerStartupProtocol(priorBirth), first);

  const flags = first.slice(0, first.indexOf("\n")).match(/\[switch\]\$\w+/gu); assert.ok(flags !== null); assert.equal(flags.length, new Set(flags).size);
  assert.equal(first.split("        'saved-readback-abort' {").length - 1, 1);
  assert.ok(first.includes("spatial209?384:componentSpatial209?419:"));
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.main.total, 941); assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.total, 424);
  assert.deepEqual(CURRENT_PCB_VIA_SAVED_READBACK_BOOTSTRAP_REQUESTS, { parent: 2, inventory: 1, workerNormal: 16, workerCleanup: 8, total: 27 });
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.earlyActorPrefix, 3);
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activeReadOnly, 175);
  assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.enabledDiscovery, 16); assert.equal(CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.cacheDeletionAuthorized, false);
  const input = new PassThrough(), output = new PassThrough(); let requests = 0;
  output.on("data", (bytes: Buffer): void => { const command: unknown = JSON.parse(bytes.subarray(0, -1).toString()); assert.ok(command !== null && typeof command === "object" && "id" in command && "method" in command);
    requests += 1; input.write(Buffer.from(`${JSON.stringify({ id: command.id, result: {} })}\0`)); });
  const pipe = new CurrentPcbViaSavedReadbackPipe(input, output); pipe.start();
  context.after(async () => { const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  for (let index = 0; index < 51; index += 1) { await pipe.getVersion(); }
  await assert.rejects(pipe.getVersion(), /budget/iu); assert.equal(requests, 51);
});

void test("pending original cache request settles before original Job abort and is never replayed", async context => {
  const f = await fixture(context, false, true); assert.ok(f.cacheRequest !== null);
  const original = f.cacheRequest(), refused = assert.rejects(original); await Promise.race([f.pollEntered, original]);
  await f.owner.abortSavedReadback(true); await refused;
  assert.equal(f.actions.filter(action => action === "saved-readback-cache").length, 1);
  assert.equal(f.actions.filter(action => action === "saved-readback-abort").length, 1);
  assert.equal(f.owner.status().busy, false); await assert.rejects(f.cacheRequest());
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
  assert.equal(f.owner.status().released, true); assert.equal(f.owner.status().helperClosed, true);
});

void test("pending original metadata helper settles through the retained Job-only abort without replay", async context => {
  const f = await fixture(context, false, true, true); assert.ok(f.cacheRequest !== null);
  const original = f.cacheRequest(), refused = assert.rejects(original); await Promise.race([f.pollEntered, original]);
  await f.owner.abortSavedReadback(true); await refused;
  assert.equal(f.actions.filter(action => action === "saved-readback-metadata").length, 1);
  assert.equal(f.actions.filter(action => action === "saved-readback-abort").length, 1);
  assert.equal(f.owner.status().busy, false); await assert.rejects(f.cacheRequest());
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
  assert.equal(f.owner.status().released, true); assert.equal(f.owner.status().helperClosed, true);
});

void test("browser-wide actor fence holds all worker kinds and a foreign service worker refuses before cache queries", async context => {
  const wire = currentPcbViaSavedReadbackActorWire(2); assert.equal("sessionId" in wire, false);
  assert.deepEqual(wire.params.filter.map(value => "type" in value ? value.type : "*"), ["worker", "shared_worker", "service_worker", "*"]);
  const native = currentPcbViaSavedReadbackActorNativeFrame(Buffer.from(`${JSON.stringify(wire)}\0`)); assert.deepEqual(native, { action: "saved-readback-actors", requestId: 2 });
  const scoped = Buffer.from(`${JSON.stringify({ ...wire, sessionId: "borrowed-page" })}\0`); assert.throws(() => currentPcbViaSavedReadbackActorNativeFrame(scoped));
  const input = new PassThrough(), output = new PassThrough(), pipe = new CurrentPcbViaSavedReadbackPipe(input, output); let cacheQueries = 0;
  output.on("data", (bytes: Buffer): void => { const value: unknown = JSON.parse(bytes.subarray(0, -1).toString()); assert.ok(value !== null && typeof value === "object" && "id" in value && "method" in value);
    if (value.method === "Target.attachToTarget") { input.write(Buffer.from(`${JSON.stringify({ id: value.id, result: { sessionId: "original-ui" } })}\0`)); }
    else if (value.method === "Target.setAutoAttach") { input.write(Buffer.from(`${JSON.stringify({ method: "Target.attachedToTarget", params: { sessionId: "foreign-service", waitingForDebugger: true, targetInfo: { targetId: "foreign", type: "service_worker", attached: true } } })}\0${JSON.stringify({ id: value.id, result: {} })}\0`)); }
    else { cacheQueries += 1; }
  });
  context.after(async () => { const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  pipe.start(); await pipe.attachTarget("original-page", event => { assert.fail(`Unexpected UI event: ${event.method}`); }); await assert.rejects(pipe.armSavedReadbackCacheActors());
  assert.notEqual(pipe.status().failure, null); assert.equal(cacheQueries, 0); await assert.rejects(pipe.armSavedReadbackCacheActors());
});

void test("original saved registration retains its actual pipe Promise before write and requires separate main awaits", async context => {
  for (const mode of ["success", "unawaited", "lost"] as const) {
    const f = await fixture(context, false, true, false, true, true, false, false, mode);
    await f.owner.publishSavedCacheBackup(); await f.owner.invalidateSavedCaches(); await f.owner.prepareSavedReadbackLoading(); await f.owner.armSavedReadbackLoadWorker(() => Promise.resolve());
    const intent = await f.owner.prepareSavedReadbackRegistrationIntent();
    const lookup: unknown = Reflect.get(f.owner, "syntheticRegistrationBindingsForTest"); assert.ok(typeof lookup === "function");
    const original: unknown = Reflect.apply(lookup, f.owner, [intent]); assert.ok(original !== null && typeof original === "object" && "assertOriginalDispatchPending" in original && typeof original.assertOriginalDispatchPending === "function");
    const pending = original.assertOriginalDispatchPending;
    const work = f.owner.registerSavedReadbackProject(); assert.equal(f.owner.registerSavedReadbackProject(), work);
    if (mode === "success") { const result = await work; assert.equal(result["originalMainSourceAwaitsVerified"], true); assert.equal(result["reopenedVerified"], false); }
    else if (mode === "unawaited") { await assert.rejects(work, /ORIGINAL_AWAITS_REQUIRED/u); }
    else { const refused = assert.rejects(work); await f.registrationEntered; Reflect.apply(pending, original, []); await f.owner.abortSavedReadback(true); await refused; }
    assert.throws(() => Reflect.apply(pending, original, []));
    assert.equal(f.actions.filter(action => action === "saved-readback-register").length, 1);
    assert.equal(f.actions.filter(action => action === "saved-readback-registration-complete").length, Number(mode === "success"));
    if (mode !== "lost") { await f.owner.abortSavedReadback(true); }
    assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
  }
});

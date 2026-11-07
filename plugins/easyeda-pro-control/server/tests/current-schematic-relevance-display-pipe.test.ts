/* oxlint-disable import/max-dependencies -- The actual stream test joins four fixed purpose codecs and original helper-source receipts under one retained request. */
/** Real Node stream, session and retained-request ordering. Synthetic peer
 * replies issue no native owner, application or connected execution evidence. */
import { CurrentSchematicRelevanceDisplayHelperReceipts } from "../src/current-schematic-relevance-display-helper-receipts.ts";
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { CurrentSchematicRelevanceDisplayWritePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentProjectLibraryRefreshCases } from "../src/current-project-library-refresh-protocol.ts";
import { currentPcbViaLocalUploadNativeCases } from "../src/current-pcb-via-local-upload-protocol.ts";
import { currentPcbViaUploadRequestNativeCases } from "../src/current-pcb-via-upload-request-protocol.ts";
import { currentProjectSaveProducerNativeCases } from "../src/current-project-save-producer-protocol.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";

function ignoreEvent(): void {
  // This synthetic peer emits no application event.
}

void test("own7 original library and Save lanes transmit while the original navigation remains pending", async context => {
  const input = new PassThrough(), sent: Buffer[] = [];
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the actual Node Writable completion contract.
  const output = new Writable({ autoDestroy: false, write(chunk: unknown, _encoding, callback): void { assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk)); callback(); } });
  const pipe = new CurrentSchematicRelevanceDisplayWritePipe(input, output); pipe.start();
  context.after(async () => { const closed = [input, output].map(async stream => { if (!stream.closed) { const observed = once(stream, "close"); stream.destroy(); await observed; } }); await Promise.all(closed); pipe.releaseClosedListeners(); });
  const last = (): Readonly<{ id: number; sessionId?: string }> => { const chunk = sent.at(-1); assert.ok(chunk !== undefined); const value: unknown = JSON.parse(chunk.subarray(0, -1).toString("utf8")); assert.ok(value !== null && typeof value === "object" && "id" in value && typeof value.id === "number"); if ("sessionId" in value) { assert.ok(typeof value.sessionId === "string"); return { id: value.id, sessionId: value.sessionId }; } return { id: value.id }; };
  const reply = (value: Readonly<{ id: number; sessionId?: string }>, result: object): void => { input.write(Buffer.from(`${JSON.stringify({ ...value, result })}\0`)); };
  const attached = pipe.attachTarget("original-ui-target", ignoreEvent); reply(last(), { sessionId: "original-ui-session" }); await attached;
  const receipts=new CurrentSchematicRelevanceDisplayHelperReceipts();
  const armed = pipe.enableSchematicDisplayWorkerDiscovery(event=>{if(event.method==="Debugger.scriptParsed"){receipts.observe(event,7,"original-project-script");}}); reply(last(), {}); await armed;
  input.write(Buffer.from(`${JSON.stringify({ method: "Target.attachedToTarget", sessionId: "original-ui-session", params: { sessionId: "original-worker-session", targetInfo: { type: "worker", attached: true, targetId: "original-worker-target" }, waitingForDebugger: true } })}\0`));
  pipe.bindSchematicDisplayWorker("original-worker-session", "original-worker-target");
  const { args } = data(); const navigation = pipe.observeSchematicDisplay("navigate", "original-ui-context", args.target, args.operation); const navigationRequest = last();
  const library = currentProjectLibraryRefreshCases().find(command => command.phase === "library-refresh-pristine"); assert.ok(library !== undefined);
  const local = currentPcbViaLocalUploadNativeCases().find(command => command.method === "Runtime.callFunctionOn"); assert.ok(local !== undefined);
  const upload = currentPcbViaUploadRequestNativeCases().find(command => command.method === "Runtime.callFunctionOn"); assert.ok(upload !== undefined);
  const cache = currentProjectSaveProducerNativeCases().find(command => command.phase === "project-save-producer-frame" && command.role === "headEntry"); assert.ok(cache !== undefined);
  for (const send of [(): Promise<unknown> => pipe.observeSchematicRelevanceLibraryRefresh(library), (): Promise<unknown> => pipe.continueSchematicRelevanceDisplayLocal(local), (): Promise<unknown> => pipe.continueSchematicRelevanceDisplayUpload(upload), (): Promise<unknown> => pipe.observeSchematicRelevanceDisplayLocalCache(cache)]) {
    const pending = send(); const original = last(); assert.equal(original.sessionId, "original-worker-session"); assert.notEqual(original.id, navigationRequest.id); reply(original, {}); await pending;
  }
  const sourceRead=Promise.withResolvers<Readonly<{id:number;sessionId?:string}>>();
  pipe.bindSchematicRelevanceDisplaySubmittedHelpers(command=>{receipts.register(command);return true;},(command,raw)=>receipts.verify(command,raw,scriptId=>{const pending=pipe.readSchematicRelevanceDisplayObservedSource({phase:"via-observed-source",method:"Debugger.getScriptSource",params:{scriptId}});sourceRead.resolve(last());return pending;}));
  const proof=pipe.continueSchematicRelevanceDisplayLocal(local);const proofRequest=last();let proofReturned=false;const completed=(async():Promise<void>=>{await proof;proofReturned=true;})();
  input.write(Buffer.from(`${JSON.stringify({method:"Debugger.scriptParsed",sessionId:"original-worker-session",params:{scriptId:"original-helper",executionContextId:7,url:""}})}\0`));
  reply(proofRequest,{result:"original-helper-reply"});const sourceRequest=await sourceRead.promise;assert.equal(proofReturned,false);assert.notEqual(sourceRequest.id,proofRequest.id);assert.equal(sourceRequest.sessionId,"original-worker-session");
  reply(sourceRequest,{scriptSource:`(${local.params.functionDeclaration})`});await completed;assert.equal(proofReturned,true);
  const count = sent.length;
  const arm = currentProjectSaveProducerNativeCases().find(command => command.phase === "project-save-producer-arm"); assert.ok(arm !== undefined);
  assert.throws(() => pipe.observeSchematicRelevanceDisplayLocalCache(arm)); assert.equal(sent.length, count);
  reply(navigationRequest, {}); await navigation;
  assert.equal(pipe.status().failureObservation, null);
});

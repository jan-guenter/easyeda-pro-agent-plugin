import{currentFootprintInverseDeleteSendCases}from"../src/current-footprint-inverse-delete-send-protocol.ts";
import {currentFootprintInverseDeleteCallbackCases}from"../src/current-footprint-inverse-delete-callback-protocol.ts";
import{currentFootprintInverseDeleteManagerCases}from"../src/current-footprint-inverse-delete-manager-protocol.ts";
import{currentFootprintInverseDeleteCollateralCases}from"../src/current-footprint-inverse-delete-collateral-protocol.ts";
/* oxlint-disable import/max-dependencies -- This real byte-stream test composes the SDK and every independent finite concurrent vocabulary. */
import{currentFootprintInverseDeletePrefixCases}from"../src/current-footprint-inverse-delete-prefix-protocol.ts";

import{currentFootprintInverseReferenceProgressCases}from"../src/current-footprint-inverse-reference-progress-protocol.ts";
import{currentFootprintInverseReferenceResultCases}from"../src/current-footprint-inverse-reference-result-protocol.ts";
import{currentFootprintInverseReferenceSendCases}from"../src/current-footprint-inverse-reference-send-protocol.ts";
import{currentFootprintInverseReferenceCallbackCases}from"../src/current-footprint-inverse-reference-callback-protocol.ts";
import{currentFootprintInverseReferenceDispatchCases}from"../src/current-footprint-inverse-reference-dispatch-protocol.ts";
import{currentFootprintInverseReferenceUiCases}from"../src/current-footprint-inverse-reference-ui-protocol.ts";
import{currentFootprintInverseReferenceEntryCases}from"../src/current-footprint-inverse-reference-entry-protocol.ts";
import { currentFootprintInverseGetResultCases } from "../src/current-footprint-inverse-get-result-protocol.ts";
import { currentFootprintInverseGetSendCases } from "../src/current-footprint-inverse-get-send-protocol.ts";
import { currentFootprintInverseGetCallbackCases } from "../src/current-footprint-inverse-get-callback-protocol.ts";
import { currentFootprintInverseGetManagerCases } from "../src/current-footprint-inverse-get-manager-protocol.ts";
import { currentFootprintInverseGetForwardingCases } from "../src/current-footprint-inverse-get-forwarding-protocol.ts";
/** Actual byte transport only: synthetic replies issue no native owner or
 * runtime source/call/delete authority. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { CurrentFootprintInversePipe, CurrentPcbViaWritePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentFootprintInverseLookupPreentryCases } from "../src/current-footprint-inverse-lookup-preentry-protocol.ts";
import { currentFootprintInverseGetRpcEntryCases } from "../src/current-footprint-inverse-get-rpc-entry-protocol.ts";
import { currentFootprintInverseGetIntrinsicsCases } from "../src/current-footprint-inverse-get-intrinsics-protocol.ts";
import { currentFootprintInverseUiOwnDataCases } from "../src/current-footprint-inverse-ui-own-data-protocol.ts";
import { currentFootprintInversePublicPreferencesCases } from "../src/current-footprint-inverse-public-preferences-protocol.ts";
import { currentFootprintInversePublicCallCases } from "../src/current-footprint-inverse-public-call-protocol.ts";

function ignoreEvent(): void {
  // No application event is emitted by this inert peer.
}
void test("original SDK write and reply remain separate while fixed UI and worker observations progress", async context => {
  const input = new PassThrough(), sent: Buffer[] = [];
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the actual Writable completion boundary.
  const output = new Writable({ write(chunk: unknown, _encoding, callback): void { assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk)); callback(); } });
  const pipe = new CurrentFootprintInversePipe(input, output); pipe.start();
  context.after(async () => { const closed = [input, output].filter(stream=>!stream.closed).map(stream=>once(stream,"close")); input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  const last = (): Readonly<{ id: number; sessionId?: string }> => { const raw = sent.at(-1); assert.ok(raw !== undefined); const packet: unknown = JSON.parse(raw.subarray(0,-1).toString("utf8")); assert.ok(packet !== null && typeof packet === "object" && "id" in packet && typeof packet.id === "number"); if ("sessionId" in packet) { assert.ok(typeof packet.sessionId === "string"); return { id: packet.id, sessionId: packet.sessionId }; } return { id: packet.id }; };
  const reply = (result: object): void => { const envelope={...last(),result};const bytes=Buffer.from(`${JSON.stringify(envelope)}\0`);input.write(bytes); };
  pipe.retainInverseActorEvents(()=>"held");
  for (const stage of ["before","arm","after"] as const) { const pending=pipe.observeInverseActors(stage); reply({}); await pending; }
  const attached=pipe.attachTarget("original-ui-target",ignoreEvent); reply({sessionId:"original-ui"}); await attached;
  const path=String.raw`C:\Synthetic\Footprint_Validation.eprj2`;const target=Object.freeze({rawWindowsPath:path,projectUuid:sha256Text(path),branchUuid:"b".repeat(32),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)});
  const preflight=pipe.preflightInverseProject("original-context",target); reply({}); await preflight;
  const registration=pipe.dispatchInverseRegistration("original-context",target);reply({result:{type:"string",value:JSON.stringify({schema:"easyeda-pro-control.footprint-inverse-path-registration.v1",projectUuid:target.projectUuid,rawWindowsPath:path,beforeRegistrySha256:"e".repeat(64),afterRegistrySha256:"e".repeat(64),beforeCount:1,afterCount:1,registrationDispatched:false,priorRegistrationPresent:true,exactOtherRegistrationRosterUnchanged:true,selectedRawPathMatched:true,selectedNonCbbMatched:true,recentPathRowMayHaveChanged:false,projectNavigationDispatched:false,cadEditDispatched:false,explicitSaveDispatched:false,persistentRegistrationVerified:false,replayAllowed:false,writerAuthority:false})}});await registration;
  const parent=pipe.armInverseParent(ignoreEvent);reply({});await parent;const opened=pipe.openInverseProject("original-context",target);reply({});await opened;
  const cases = currentFootprintInversePublicCallCases(); const sdk = cases.find(command=>command.phase==="inverse-public-call-sdk"); assert.ok(sdk!==undefined);
  const pending = pipe.observeInversePublicCall(sdk); const sdkRequest=last(); await pipe.originalInversePublicDeleteWrite(pending); pipe.requireInversePublicDeleteWritten(pending);
  // These same-UI metadata requests run while the original SDK CDP reply is
  // Still pending. A raw Promise reply is not needed to free this finite lane.
  for (const command of currentFootprintInverseGetIntrinsicsCases()) { const observation = pipe.observeInverseGetIntrinsics(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetRpcEntryCases()) { const observation = pipe.observeInverseGetRpcEntry(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetForwardingCases()) { const observation = pipe.observeInverseGetForwarding(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetManagerCases()) { const observation = pipe.observeInverseGetManager(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetCallbackCases()) { const observation = pipe.observeInverseGetCallback(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetSendCases()) { const observation = pipe.observeInverseGetSend(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetResultCases()) { const observation = pipe.observeInverseGetResult(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for(const command of currentFootprintInverseReferenceEntryCases()){const observation=pipe.observeInverseReferenceEntry(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceUiCases()){const observation=pipe.observeInverseReferenceUi(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceDispatchCases()){const observation=pipe.observeInverseReferenceDispatch(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceCallbackCases()){const observation=pipe.observeInverseReferenceCallback(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceProgressCases()){const observation=pipe.observeInverseReferenceProgress(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceResultCases()){const observation=pipe.observeInverseReferenceResult(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceSendCases()){const observation=pipe.observeInverseReferenceSend(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeleteSendCases()){const observation=pipe.observeInverseDeleteSend(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeleteCallbackCases()){const observation=pipe.observeInverseDeleteCallback(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeleteManagerCases()){const observation=pipe.observeInverseDeleteManager(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeleteCollateralCases()){const observation=pipe.observeInverseDeleteCollateral(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeletePrefixCases()){const observation=pipe.observeInverseDeletePrefix(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  input.write(Buffer.from(`${JSON.stringify({...sdkRequest,result:{result:{type:"object",subtype:"promise",className:"Promise",objectId:"original-sdk-promise"}}})}\0`));
  assert.deepEqual(await pending,{result:{type:"object",subtype:"promise",className:"Promise",objectId:"original-sdk-promise"}});pipe.requireInversePublicDeleteWritten(pending);
  const commands=cases.filter(command=>command.phase!=="inverse-public-call-sdk");
  for(const command of commands){const observation=pipe.observeInversePublicCall(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  assert.throws(()=>pipe.observeInversePublicCall(sdk));assert.throws(()=>{pipe.requireInversePublicDeleteWritten(Promise.resolve({}));});
  for(const command of currentFootprintInversePublicPreferencesCases()){const observation=pipe.observeInversePublicPreferences(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseUiOwnDataCases()){const observation=pipe.observeInverseUiOwnData(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseLookupPreentryCases()){const observation=pipe.observeInverseLookupPreentry(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for (const command of currentFootprintInverseGetIntrinsicsCases()) { const observation = pipe.observeInverseGetIntrinsics(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetRpcEntryCases()) { const observation = pipe.observeInverseGetRpcEntry(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetForwardingCases()) { const observation = pipe.observeInverseGetForwarding(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetManagerCases()) { const observation = pipe.observeInverseGetManager(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetCallbackCases()) { const observation = pipe.observeInverseGetCallback(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetSendCases()) { const observation = pipe.observeInverseGetSend(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for (const command of currentFootprintInverseGetResultCases()) { const observation = pipe.observeInverseGetResult(command); assert.equal(last().sessionId, "original-ui"); reply({}); await observation; pipe.requireInversePublicDeleteWritten(pending); }
  for(const command of currentFootprintInverseReferenceEntryCases()){const observation=pipe.observeInverseReferenceEntry(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceUiCases()){const observation=pipe.observeInverseReferenceUi(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceDispatchCases()){const observation=pipe.observeInverseReferenceDispatch(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceCallbackCases()){const observation=pipe.observeInverseReferenceCallback(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceProgressCases()){const observation=pipe.observeInverseReferenceProgress(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceResultCases()){const observation=pipe.observeInverseReferenceResult(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseReferenceSendCases()){const observation=pipe.observeInverseReferenceSend(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeleteSendCases()){const observation=pipe.observeInverseDeleteSend(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeleteCallbackCases()){const observation=pipe.observeInverseDeleteCallback(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeleteManagerCases()){const observation=pipe.observeInverseDeleteManager(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeleteCollateralCases()){const observation=pipe.observeInverseDeleteCollateral(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  for(const command of currentFootprintInverseDeletePrefixCases()){const observation=pipe.observeInverseDeletePrefix(command);assert.equal(last().sessionId,"original-ui");reply({});await observation;pipe.requireInversePublicDeleteWritten(pending);}
  const prefix=currentFootprintInverseDeletePrefixCases()[0];assert.ok(prefix!==undefined);const prefixBefore=sent.length;
  // oxlint-disable-next-line typescript/unbound-method -- An extra raw field must fail before this finite lane writes bytes.
  assert.throws(()=>Reflect.apply(CurrentFootprintInversePipe.prototype.observeInverseDeletePrefix,pipe,[{...prefix,callerCode:"foreign"}]));assert.equal(sent.length,prefixBefore);
  assert.equal(pipe.status().failureObservation,null);
  const resultCommand=currentFootprintInverseGetResultCases()[0];assert.ok(resultCommand!==undefined);const resultBefore=sent.length;
  // oxlint-disable-next-line typescript/unbound-method -- Closed result sender rejects an extra caller field before native output.
  assert.throws(()=>Reflect.apply(CurrentFootprintInversePipe.prototype.observeInverseGetResult,pipe,[{...resultCommand,params:{...resultCommand.params,callerCode:"foreign"}}]));assert.equal(sent.length,resultBefore);
  const outputBeforeInvalid=sent.length;const callback=currentFootprintInverseGetCallbackCases()[0];assert.ok(callback!==undefined);
  // oxlint-disable-next-line typescript/unbound-method -- Pass an intentionally invalid raw envelope through the actual sender.
  assert.throws(()=>Reflect.apply(CurrentFootprintInversePipe.prototype.observeInverseGetCallback,pipe,[{...callback,params:{...callback.params,callerCode:"foreign"}}]));assert.equal(sent.length,outputBeforeInvalid);
  const before=sent.length;const first=currentFootprintInversePublicCallCases()[0];assert.ok(first!==undefined);const other:unknown=Object.create(CurrentPcbViaWritePipe.prototype);
  // oxlint-disable-next-line typescript/unbound-method -- Invalid sibling receiver must reject before emitting bytes.
  assert.throws(()=>Reflect.apply(CurrentFootprintInversePipe.prototype.observeInversePublicCall,other,[first]));assert.equal(sent.length,before);const uiOwnData=currentFootprintInverseUiOwnDataCases()[0];assert.ok(uiOwnData!==undefined);
  // oxlint-disable-next-line typescript/unbound-method -- Sibling purpose rejects before output.
  assert.throws(()=>Reflect.apply(CurrentFootprintInversePipe.prototype.observeInverseUiOwnData,other,[uiOwnData]));assert.equal(sent.length,before);
});

void test("a reply before a failed SDK write callback never establishes original written custody", async context => {
  const input = new PassThrough(), sent: Buffer[] = [];
  let sdkCallback: ((error?: Error | null) => void) | null = null;
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the actual Writable completion boundary.
  const output = new Writable({ write(chunk: unknown, _encoding, callback): void { assert.ok(Buffer.isBuffer(chunk)); sent.push(Buffer.from(chunk)); const text = chunk.toString("utf8"); if (text.includes("inverse-public-call-sdk")) { sdkCallback = callback; return; } callback(); } });
  const pipe = new CurrentFootprintInversePipe(input, output); pipe.start();
  context.after(async () => { const closed = [input, output].filter(stream=>!stream.closed).map(stream=>once(stream,"close")); input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  const last = (): Readonly<{ id: number; sessionId?: string }> => { const raw = sent.at(-1); assert.ok(raw !== undefined); const packet: unknown = JSON.parse(raw.subarray(0,-1).toString("utf8")); assert.ok(packet !== null && typeof packet === "object" && "id" in packet && typeof packet.id === "number"); if ("sessionId" in packet) { assert.ok(typeof packet.sessionId === "string"); return { id: packet.id, sessionId: packet.sessionId }; } return { id: packet.id }; };
  const reply = (result: object): void => { const envelope={...last(),result};const bytes=Buffer.from(`${JSON.stringify(envelope)}\0`);input.write(bytes); };
  pipe.retainInverseActorEvents(()=>"held");
  for (const stage of ["before","arm","after"] as const) { const pending=pipe.observeInverseActors(stage); reply({}); await pending; }
  const attached=pipe.attachTarget("original-ui-target",ignoreEvent); reply({sessionId:"original-ui"}); await attached;
  const path=String.raw`C:\Synthetic\Footprint_Validation.eprj2`;const target=Object.freeze({rawWindowsPath:path,projectUuid:sha256Text(path),branchUuid:"b".repeat(32),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)});
  const preflight=pipe.preflightInverseProject("original-context",target); reply({}); await preflight;
  const registration=pipe.dispatchInverseRegistration("original-context",target);reply({result:{type:"string",value:JSON.stringify({schema:"easyeda-pro-control.footprint-inverse-path-registration.v1",projectUuid:target.projectUuid,rawWindowsPath:path,beforeRegistrySha256:"e".repeat(64),afterRegistrySha256:"e".repeat(64),beforeCount:1,afterCount:1,registrationDispatched:false,priorRegistrationPresent:true,exactOtherRegistrationRosterUnchanged:true,selectedRawPathMatched:true,selectedNonCbbMatched:true,recentPathRowMayHaveChanged:false,projectNavigationDispatched:false,cadEditDispatched:false,explicitSaveDispatched:false,persistentRegistrationVerified:false,replayAllowed:false,writerAuthority:false})}});await registration;
  const parent=pipe.armInverseParent(ignoreEvent);reply({});await parent;const opened=pipe.openInverseProject("original-context",target);reply({});await opened;
  const sdk = currentFootprintInversePublicCallCases().find(command=>command.phase==="inverse-public-call-sdk"); assert.ok(sdk!==undefined);
  const pending = pipe.observeInversePublicCall(sdk), written = pipe.originalInversePublicDeleteWrite(pending); let acknowledged = false;
  const observed = (async (): Promise<void> => { try { await written; acknowledged = true; } catch {
    // Preserve the original rejection for the assertions below.
  } })();
  const failed = assert.rejects(pending,/PCB_DIAGNOSTIC_PIPE_OUTPUT/u); const writeFailed = assert.rejects(written,/PCB_DIAGNOSTIC_PIPE_OUTPUT/u);
  reply({result:{type:"object",subtype:"promise",className:"Promise",objectId:"original-sdk-promise"}}); await Promise.resolve(); assert.equal(acknowledged,false); assert.throws(()=>{pipe.requireInversePublicDeleteWritten(pending);});
  assert.ok(sdkCallback!==null); const callback: (error?: Error | null)=>void=sdkCallback;
  // oxlint-disable-next-line promise/prefer-await-to-callbacks, node/callback-return -- Inject failure at the actual Writable callback, after an earlier received reply.
  callback(new Error("inert lost acknowledgement")); await failed; await writeFailed; await observed; assert.equal(acknowledged,false); assert.equal(pipe.status().failure,"output");
});

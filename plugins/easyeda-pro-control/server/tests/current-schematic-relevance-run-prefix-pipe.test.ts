/* oxlint-disable import/max-dependencies -- The same original retained Modify is tested through each independently fixed callback grammar and its purpose decoder. */
import { currentSchematicRelevanceModifyCmCases } from "../src/current-schematic-relevance-modify-cm-wire.ts";
import { currentSchematicRelevanceModifyCmDeltaCases } from "../src/current-schematic-relevance-modify-cm-delta-wire.ts";
import { currentSchematicRelevanceModifyCmControlCases } from "../src/current-schematic-relevance-modify-cm-control-wire.ts";
import {currentSchematicRelevanceNotificationCases} from "../src/current-schematic-relevance-notification-wire.ts";
import {currentSchematicRelevanceModifyStructureCases} from "../src/current-schematic-relevance-modify-structure-wire.ts";
import {currentSchematicRelevanceModifyControlCases} from "../src/current-schematic-relevance-modify-control-wire.ts";
import {currentSchematicRelevanceModifyEventCases} from "../src/current-schematic-relevance-modify-event-wire.ts";
import {currentSchematicRelevanceModifyWorkerCases} from "../src/current-schematic-relevance-modify-worker-wire.ts";
import {currentSchematicRelevancePublicationNativeCases} from "../src/current-schematic-relevance-publication-native-wire.ts";
import {currentSchematicRelevancePublicationControlCases} from "../src/current-schematic-relevance-publication-control-wire.ts";
import {currentSchematicRelevanceSdkGateCases} from "../src/current-schematic-relevance-sdk-gate-wire.ts";
import {currentSchematicRelevanceRenderDelegateCases} from "../src/current-schematic-relevance-render-delegate-wire.ts";
import {currentSchematicRelevanceStatusTabMutationCases} from "../src/current-schematic-relevance-status-tab-mutation-wire.ts";
import {currentSchematicRelevanceStatusTabLookupCases} from "../src/current-schematic-relevance-status-tab-lookup-wire.ts";
import {currentSchematicRelevanceStatusSubscriberCases} from "../src/current-schematic-relevance-status-subscriber-wire.ts";
import {currentSchematicRelevanceStatusCloneCases} from "../src/current-schematic-relevance-status-clone-wire.ts";
import {currentSchematicRelevanceStatusBusCases} from "../src/current-schematic-relevance-status-bus-wire.ts";
import {currentSchematicRelevanceStatusDeliveryCases} from "../src/current-schematic-relevance-status-delivery-wire.ts";
import {currentSchematicRelevanceHistoryStatusCases} from "../src/current-schematic-relevance-history-status-wire.ts";
import {currentSchematicRelevanceUploadReturnCases} from "../src/current-schematic-relevance-upload-return-wire.ts";
import {currentSchematicRelevancePendingCacheCases} from "../src/current-schematic-relevance-pending-cache-wire.ts";
import {currentSchematicRelevanceUploadCmCases} from "../src/current-schematic-relevance-upload-cm-wire.ts";
import {currentSchematicRelevanceUploadSerializeCases} from "../src/current-schematic-relevance-upload-serialize-wire.ts";
import {currentSchematicRelevanceUploadModelCases} from "../src/current-schematic-relevance-upload-model-wire.ts";
import {currentSchematicRelevanceUploadEntryCases} from "../src/current-schematic-relevance-upload-entry-wire.ts";
import {currentSchematicRelevanceNoEchoCases} from "../src/current-schematic-relevance-noecho-wire.ts";
/** Real pipe and inert byte streams. No original owner, renderer, actor,
 * native helper, mutation, receiver or durability is established. */
import {currentSchematicRelevanceNormalUpdateCases} from "../src/current-schematic-relevance-normal-update-wire.ts";
import {currentSchematicRelevanceNormalDisposalCases} from "../src/current-schematic-relevance-normal-disposal-wire.ts";
import {currentSchematicRelevanceNormalRecordCases} from "../src/current-schematic-relevance-normal-record-wire.ts";
import assert from "node:assert/strict";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { CurrentPcbDiagnosticPipe, CurrentSchematicRelevanceDisplayWritePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentSchematicRelevanceRunPrefixCases } from "../src/current-schematic-relevance-run-prefix-wire.ts";
import { currentSchematicRelevanceRunGuardCases } from "../src/current-schematic-relevance-run-guard-wire.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";

void test("finite run and normal callback lanes remain duplex with the original pending Modify and original UI session", async context => {
  const input = new PassThrough(); const sent: Record<string, unknown>[] = [];
  const output = new Writable({ write(bytes: Buffer, _encoding, done): void {
    const value: unknown = JSON.parse(bytes.subarray(0, -1).toString()); assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
    const command: Record<string, unknown> = Object.fromEntries(Object.entries(value)); sent.push(command);
    if (command["schematicRelevanceModifyGeneration"] !== true) {
      const result = command["method"] === "Target.attachToTarget" ? { sessionId: "original-ui" } : {};
      input.write(Buffer.from(`${JSON.stringify({ id: command["id"], result, sessionId: "sessionId" in command ? command["sessionId"] : undefined })}\0`));
    } done();
  } });
  const closedInput = Promise.withResolvers<true>(); const closedOutput = Promise.withResolvers<true>();
  input.once("close", () => { closedInput.resolve(true); }); output.once("close", () => { closedOutput.resolve(true); });
  const pipe = new CurrentSchematicRelevanceDisplayWritePipe(input, output); pipe.start();
  context.after(async () => { input.destroy(); output.destroy(); await Promise.all([closedInput.promise, closedOutput.promise]); pipe.releaseClosedListeners(); });
  await pipe.attachTarget("original-ui-target", () => { assert.fail("No actor event in inert transport test"); }); pipe.bindSchematicDisplayActionGuard("original-script", 0);
  await pipe.enableSchematicDisplayWorkerDiscovery(event=>{assert.equal(event.method,"Target.attachedToTarget");});input.write(Buffer.from(`${JSON.stringify({method:"Target.attachedToTarget",sessionId:"original-ui",params:{sessionId:"original-worker",targetInfo:{type:"worker",attached:true,targetId:"original-worker-target"},waitingForDebugger:true}})}\0`));pipe.bindSchematicDisplayWorker("original-worker","original-worker-target");
  const args = data().args; const original = pipe.generateSchematicRelevanceDisplayModify("original-holder", args.target, args.operation);
  const failed = assert.rejects(original); const turn = Promise.withResolvers<true>(); setImmediate(() => { turn.resolve(true); }); await turn.promise;
  pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);const originalRequestId=pipe.status().pendingRequestId;const firstObservation=sent.length;assert.ok(originalRequestId!==null);
  for (const command of currentSchematicRelevanceRunPrefixCases()) { await pipe.observeSchematicRelevanceRunPrefix(command); pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original); }
  for (const step of currentSchematicRelevanceRunGuardCases()) { await pipe.observeSchematicRelevanceRunGuard(step); pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original); }
  for(const command of currentSchematicRelevanceNormalUpdateCases()){await pipe.observeSchematicRelevanceNormalUpdate(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceNormalDisposalCases()){await pipe.observeSchematicRelevanceNormalDisposal(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceNormalRecordCases()){await pipe.observeSchematicRelevanceNormalRecord(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceNoEchoCases()){await pipe.observeSchematicRelevanceNoEcho(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadEntryCases()){await pipe.observeSchematicRelevanceUploadEntry(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadModelCases()){await pipe.observeSchematicRelevanceUploadModel(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadSerializeCases()){await pipe.observeSchematicRelevanceUploadSerialize(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadCmCases()){await pipe.observeSchematicRelevanceUploadCm(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevancePendingCacheCases()){await pipe.observeSchematicRelevancePendingCache(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceUploadReturnCases()){await pipe.observeSchematicRelevanceUploadReturn(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceHistoryStatusCases()){await pipe.observeSchematicRelevanceHistoryStatus(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusBusCases()){await pipe.observeSchematicRelevanceStatusBus(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusDeliveryCases()){await pipe.observeSchematicRelevanceStatusDelivery(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceRenderDelegateCases()){await pipe.observeSchematicRelevanceRenderDelegate(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusTabMutationCases()){await pipe.observeSchematicRelevanceStatusTabMutation(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusTabLookupCases()){await pipe.observeSchematicRelevanceStatusTabLookup(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusSubscriberCases()){await pipe.observeSchematicRelevanceStatusSubscriber(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  for(const command of currentSchematicRelevanceStatusCloneCases()){await pipe.observeSchematicRelevanceStatusClone(command);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  const notification=currentSchematicRelevanceNotificationCases().find(command=>command.phase==="notification-call"&&command.role==="hooks");const sdk=currentSchematicRelevanceSdkGateCases().find(command=>command.phase==="sdk-call"&&command.role==="hooks");const publication=currentSchematicRelevancePublicationNativeCases().find(command=>command.phase==="publication-native-call"&&command.role==="hooks");const publicationControl=currentSchematicRelevancePublicationControlCases().find(command=>command.phase==="publication-control-call"&&command.role==="prior-hooks");const modifyLiteral=currentSchematicRelevanceModifyWorkerCases().find(command=>command.phase==="modify-worker-literal");const modifyCall=currentSchematicRelevanceModifyWorkerCases().find(command=>command.phase==="modify-worker-call");assert.ok(modifyLiteral!==undefined&&modifyCall!==undefined&&notification!==undefined&&sdk!==undefined&&publication!==undefined&&publicationControl!==undefined);
  for(const send of[():Promise<unknown>=>pipe.observeSchematicRelevanceModifyWorker(modifyLiteral),():Promise<unknown>=>pipe.observeSchematicRelevanceModifyWorker(modifyCall),():Promise<unknown>=>pipe.observeSchematicRelevancePublication(publication),():Promise<unknown>=>pipe.observeSchematicRelevancePublication(publicationControl),():Promise<unknown>=>pipe.observeSchematicRelevanceNotification(notification),():Promise<unknown>=>pipe.observeSchematicRelevanceSdkGate(sdk)]){const count=sent.length;await send();assert.equal(sent.length,count+1);pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);}
  const structure = currentSchematicRelevanceModifyStructureCases().find(command => command.phase === "modify-structure-call" && command.role === "caller");
  assert.ok(structure !== undefined);
  { const count = sent.length; await pipe.observeSchematicRelevanceModifyStructure(structure); assert.equal(sent.length, count + 1); pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original); }
  const continuation = currentSchematicRelevanceModifyControlCases().find(command => command.phase === "modify-control-proof");
  const eventRead = currentSchematicRelevanceModifyEventCases().find(command => command.phase === "modify-event-call");
  assert.ok(continuation !== undefined && eventRead !== undefined);
  for (const command of [continuation, eventRead]) { const count = sent.length; await pipe.observeSchematicRelevanceModifyContinuation(command); assert.equal(sent.length, count + 1); pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original); }
  const cm = currentSchematicRelevanceModifyCmCases().find(command => command.phase === "modify-cm-call" && command.role === "reprove");
  const cmDelta = currentSchematicRelevanceModifyCmDeltaCases().find(command => command.phase === "modify-cm-delta-call" && command.role === "descriptors");
  const cmArm = currentSchematicRelevanceModifyCmControlCases().find(command => command.phase === "modify-cm-control-function" && command.kind === "remote");
  assert.ok(cm !== undefined && cmDelta !== undefined && cmArm !== undefined);
  for (const command of [cm, cmDelta, cmArm]) { const count = sent.length; await pipe.observeSchematicRelevanceModifyCm(command); assert.equal(sent.length, count + 1); pipe.requireOriginalSchematicRelevanceDisplayModifyPending(original);
    const written = sent.at(-1); assert.ok(written !== undefined); const native = currentSchematicRelevanceDisplayWriteNativeRequest(Buffer.from(`${JSON.stringify(written)}\0`));
    assert.equal(Object.hasOwn(native, "id"), false); assert.equal(native["requestId"], written["id"]);
    for (const sessionId of ["!", "x".repeat(129)]) { assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(Buffer.from(`${JSON.stringify({ ...written, sessionId })}\0`)), /SCHEMATIC_MODIFY_CM_ORIGINAL_WIRE/u); }
  }
  const beforeInvalid=sent.length;
  for(const[method,command,marker]of[[pipe.observeSchematicRelevanceModifyCm.bind(pipe),cm,"schematicRelevanceModifyCmCommand"],[pipe.observeSchematicRelevanceModifyCm.bind(pipe),cmDelta,"schematicRelevanceModifyCmCommand"],[pipe.observeSchematicRelevanceModifyCm.bind(pipe),cmArm,"schematicRelevanceModifyCmCommand"],[pipe.observeSchematicRelevanceModifyStructure.bind(pipe),structure,"schematicRelevanceModifyStructureCommand"],[pipe.observeSchematicRelevanceModifyContinuation.bind(pipe),continuation,"schematicRelevanceModifyContinuationCommand"],[pipe.observeSchematicRelevanceModifyContinuation.bind(pipe),eventRead,"schematicRelevanceModifyContinuationCommand"],[pipe.observeSchematicRelevanceModifyWorker.bind(pipe),modifyLiteral,"schematicRelevanceModifyWorkerCommand"],[pipe.observeSchematicRelevanceModifyWorker.bind(pipe),modifyCall,"schematicRelevanceModifyWorkerCommand"],[pipe.observeSchematicRelevancePublication.bind(pipe),publication,"schematicRelevancePublicationCommand"],[pipe.observeSchematicRelevancePublication.bind(pipe),publicationControl,"schematicRelevancePublicationCommand"],[pipe.observeSchematicRelevanceNotification.bind(pipe),notification,"schematicRelevanceNotificationCommand"],[pipe.observeSchematicRelevanceSdkGate.bind(pipe),sdk,"schematicRelevanceSdkGateCommand"]]as const){assert.throws(()=>Reflect.apply(method,pipe,[{...command,[marker]:false}]));assert.throws(()=>Reflect.apply(method,pipe,[{phase:"resume",method:"Debugger.resume",params:{}}]));assert.equal(sent.length,beforeInvalid);}
  const foreignInput=new PassThrough(),foreignOutput=new PassThrough();const foreign=new CurrentPcbDiagnosticPipe(foreignInput,foreignOutput);foreign.start();let foreignWrites=0;foreignOutput.on("data",()=>{foreignWrites+=1;});context.after(async()=>{const waits=[foreignInput,foreignOutput].map(stream=>{const done=Promise.withResolvers<true>();stream.once("close",()=>{done.resolve(true);});stream.destroy();return done.promise;});await Promise.all(waits);foreign.releaseClosedListeners();});
  for(const[name,command]of[["observeSchematicRelevanceModifyCmCommand",cm],["observeSchematicRelevanceModifyCmCommand",cmDelta],["observeSchematicRelevanceModifyCmCommand",cmArm],["observeSchematicRelevanceModifyStructureCommand",structure],["observeSchematicRelevanceModifyContinuationCommand",continuation],["observeSchematicRelevanceModifyContinuationCommand",eventRead],["observeSchematicRelevanceModifyWorkerCommand",modifyLiteral],["observeSchematicRelevanceModifyWorkerCommand",modifyCall],["observeSchematicRelevancePublicationCommand",publication],["observeSchematicRelevancePublicationCommand",publicationControl],["observeSchematicRelevanceNotificationCommand",notification],["observeSchematicRelevanceSdkGateCommand",sdk]]as const){const method:unknown=Reflect.get(foreign,name);assert.ok(typeof method==="function");assert.throws(()=>Reflect.apply(method,foreign,[command]),/ORIGINAL_PENDING/u);assert.equal(foreignWrites,0);}
  assert.equal(pipe.status().pendingRequestId, originalRequestId); assert.equal(pipe.status().failure, null);
  for (const row of sent.slice(firstObservation)) {
    assert.equal(row["sessionId"],(row["schematicRelevanceModifyCmCommand"]===true||row["schematicRelevanceModifyStructureCommand"]===true||row["schematicRelevanceModifyWorkerCommand"]===true||row["schematicRelevanceModifyContinuationCommand"]===true)?"original-worker":"original-ui");
    const native = currentSchematicRelevanceDisplayWriteNativeRequest(Buffer.from(`${JSON.stringify(row)}\0`));
    assert.ok(native["action"] === "schematic-relevance-modify-cm-control" || native["action"] === "schematic-relevance-modify-structure" || native["action"] === "schematic-relevance-modify-control" || native["action"] === "schematic-relevance-modify-worker" || native["action"] === "schematic-relevance-publication" || native["action"] === "schematic-relevance-notification" || native["action"] === "schematic-relevance-sdk-gate" || native["action"] === "schematic-relevance-render-delegate" || native["action"] === "schematic-relevance-status-tab-mutation" || native["action"] === "schematic-relevance-status-tab-lookup" || native["action"] === "schematic-relevance-run-prefix" || native["action"] === "schematic-relevance-run-guard" || native["action"] === "schematic-relevance-normal-update" || native["action"] === "schematic-relevance-normal-disposal" || native["action"] === "schematic-relevance-normal-record" || native["action"] === "schematic-relevance-noecho" || native["action"] === "schematic-relevance-upload-entry" || native["action"] === "schematic-relevance-upload-model" || native["action"] === "schematic-relevance-upload-serialize" || native["action"] === "schematic-relevance-upload-cm" || native["action"] === "schematic-relevance-pending-cache" || native["action"] === "schematic-relevance-upload-return" || native["action"] === "schematic-relevance-history-status" || native["action"] === "schematic-relevance-status-bus" || native["action"] === "schematic-relevance-status-delivery" || native["action"] === "schematic-relevance-status-subscriber" || native["action"] === "schematic-relevance-status-clone");
  }
  input.emit("error", new Error("inert original request finished")); await failed;
});

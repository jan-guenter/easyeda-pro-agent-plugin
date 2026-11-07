/** Actual byte transport with an inert peer; it issues no native owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { currentFootprintInversePublicCallCases } from "../src/current-footprint-inverse-public-call-protocol.ts";
import { currentFootprintInverseDeleteRpcCases } from "../src/current-footprint-inverse-delete-rpc-protocol.ts";
import { currentFootprintInverseClockWorkerCases } from "../src/current-footprint-inverse-clock-worker-protocol.ts";
import { currentFootprintInverseDeleteEntryCases } from "../src/current-footprint-inverse-delete-entry-protocol.ts";
import { currentFootprintInverseDeleteWorkerPeerCases } from "../src/current-footprint-inverse-delete-worker-peer-protocol.ts";
import { currentFootprintInverseDeleteJobCases } from "../src/current-footprint-inverse-delete-job-protocol.ts";

import { createCurrentFootprintInverseWorkerPrefixPipe } from "./fixtures/current-footprint-inverse-worker-prefix-pipe.ts";
// oxlint-disable-next-line import/max-dependencies -- One actual retained pipe verifies the independent finite inverse command families together.
import { currentFootprintInverseNativeDeliveryCases } from "../src/current-footprint-inverse-native-delivery-protocol.ts";
import { currentFootprintInverseNativeChannelCases } from "../src/current-footprint-inverse-native-channel-protocol.ts";
import { currentFootprintInverseOwnDataCases } from "../src/current-footprint-inverse-own-data-protocol.ts";

void test("actual inverse byte pipe admits only its retained worker for bus, RPC, entry, intrinsics and forwarded-job observations",async context=>{
 const{pipe,pair,last,reply}=await createCurrentFootprintInverseWorkerPrefixPipe(context);
 for(const command of currentFootprintInverseClockWorkerCases()){const pending=pipe.observeInverseClockWorker(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteRpcCases()){const pending=pipe.observeInverseDeleteRpc(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteWorkerPeerCases()){const pending=pipe.observeInverseDeleteWorkerPeer(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseOwnDataCases()){const pending=pipe.observeInverseOwnData(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseNativeChannelCases()){const pending=pipe.observeInverseNativeChannel(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteEntryCases()){const pending=pipe.observeInverseDeleteEntry(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteJobCases()){const pending=pipe.observeInverseDeleteJob(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseNativeDeliveryCases()){const pending=pipe.observeInverseNativeDelivery(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}assert.equal(pipe.status().failureObservation,null);
});

void test("original forwarded Event observations progress while their SDK request remains pending",async context=>{
 const{pipe,pair,last,reply,replyTo}=await createCurrentFootprintInverseWorkerPrefixPipe(context);
 const path=String.raw`C:\Synthetic\Footprint_Validation.eprj2`;const target=Object.freeze({rawWindowsPath:path,projectUuid:sha256Text(path),branchUuid:"b".repeat(32),documentUuid:"c".repeat(16),expectedSourceSha256:"d".repeat(64)});
 const preflight=pipe.preflightInverseProject("original-context",target);reply({});await preflight;
 const registration=pipe.dispatchInverseRegistration("original-context",target);reply({result:{type:"string",value:JSON.stringify({schema:"easyeda-pro-control.footprint-inverse-path-registration.v1",projectUuid:target.projectUuid,rawWindowsPath:path,beforeRegistrySha256:"e".repeat(64),afterRegistrySha256:"e".repeat(64),beforeCount:1,afterCount:1,registrationDispatched:false,priorRegistrationPresent:true,exactOtherRegistrationRosterUnchanged:true,selectedRawPathMatched:true,selectedNonCbbMatched:true,recentPathRowMayHaveChanged:false,projectNavigationDispatched:false,cadEditDispatched:false,explicitSaveDispatched:false,persistentRegistrationVerified:false,replayAllowed:false,writerAuthority:false})}});await registration;
 const opened=pipe.openInverseProject("original-context",target);reply({});await opened;
 const sdk=currentFootprintInversePublicCallCases().find(command=>command.phase==="inverse-public-call-sdk");assert.ok(sdk!==undefined);
 const pending=pipe.observeInversePublicCall(sdk);const original=last();let settled=false;const observed=(async():Promise<void>=>{await pending;settled=true;})();await pipe.originalInversePublicDeleteWrite(pending);
 try{
  for(const command of currentFootprintInverseNativeDeliveryCases()){const observation=pipe.observeInverseNativeDelivery(command);const request=last();if(request.id===original.id){await observation;assert.fail("Original Event command was not written");}reply({});await observation;assert.equal(request.sessionId,pair.pageSessionId);assert.equal(settled,false);pipe.requireInversePublicDeleteWritten(pending);}
 }finally{replyTo(original,{result:{type:"object",subtype:"promise",className:"Promise",objectId:"original-sdk-promise"}});await observed;}
 assert.equal(settled,true);assert.equal(pipe.status().failureObservation,null);
});

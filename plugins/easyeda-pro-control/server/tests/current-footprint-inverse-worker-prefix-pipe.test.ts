/** Actual byte transport with an inert peer; it issues no native owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintInverseDeleteRpcCases } from "../src/current-footprint-inverse-delete-rpc-protocol.ts";
import { currentFootprintInverseClockWorkerCases } from "../src/current-footprint-inverse-clock-worker-protocol.ts";
import { currentFootprintInverseDeleteEntryCases } from "../src/current-footprint-inverse-delete-entry-protocol.ts";
import { currentFootprintInverseDeleteWorkerPeerCases } from "../src/current-footprint-inverse-delete-worker-peer-protocol.ts";
import { currentFootprintInverseDeleteJobCases } from "../src/current-footprint-inverse-delete-job-protocol.ts";

import { createCurrentFootprintInverseWorkerPrefixPipe } from "./fixtures/current-footprint-inverse-worker-prefix-pipe.ts";
import { currentFootprintInverseOwnDataCases } from "../src/current-footprint-inverse-own-data-protocol.ts";

void test("actual inverse byte pipe admits only its retained worker for bus, RPC, entry, intrinsics and forwarded-job observations",async context=>{
 const{pipe,pair,last,reply}=await createCurrentFootprintInverseWorkerPrefixPipe(context);
 for(const command of currentFootprintInverseClockWorkerCases()){const pending=pipe.observeInverseClockWorker(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteRpcCases()){const pending=pipe.observeInverseDeleteRpc(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteWorkerPeerCases()){const pending=pipe.observeInverseDeleteWorkerPeer(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseOwnDataCases()){const pending=pipe.observeInverseOwnData(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteEntryCases()){const pending=pipe.observeInverseDeleteEntry(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteJobCases()){const pending=pipe.observeInverseDeleteJob(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}assert.equal(pipe.status().failureObservation,null);
});

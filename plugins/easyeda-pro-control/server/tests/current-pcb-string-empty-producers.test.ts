import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION,
  decodeCurrentPcbStringEmptyProducers } from "../src/current-pcb-string-empty-producers.ts";
import { callPcbStringObservation, pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function sample(change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(callPcbStringObservation(pcbStringObservationFixture(false, change), CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION));
}

void test("empty producer observation retains source-defined notification and cluster flags", () => {
  const state = decodeCurrentPcbStringEmptyProducers(sample());
  assert.equal(state.model.last, "absent");
  assert.equal(state.model.lastRatline, "null");
  assert.equal(state.net.updateLeftTree, "absent");
  assert.deepEqual(state.net.notification, { func: "null", animationFrame: "null", lastTime: -1, delay: 0 });
  assert.equal(state.clusters.emptyNetChange, true);
  assert.equal(state.clusters.useWireClusterCache, false);
  assert.equal(state.completeLiveBaselineVerified, false);
  assert.equal(state.queueCompletionVerified, false);
  assert.equal(state.executionAuthorized, false);
  assert.equal(Object.isFrozen(state.net), true);
});

void test("all additional ratline/network memberships reject nonempty state", () => {
  for (const field of [
    "MI.manager.map", "MI.manager.idMap", "jo.map", "jo.idMap", "ze.map", "ze.noneNetMap",
    "ze.netLength", "ze.netModify", "pP.map", "h_.map", "aE.map",
  ]) {
    assert.throws(() => sample(`scope.object.${field}.set("private",{});`), /PCB_STRING_OBSERVATION_STATE/u, field);
  }
  for (const field of ["jo.highLightNets", "jo.clickHighlightRatlines", "jo.hoverHighlightRatlines", "ze.rubbish"]) {
    assert.throws(() => sample(`scope.object.${field}.add({});`), /PCB_STRING_OBSERVATION_STATE/u, field);
  }
  for (const field of ["ze.netOptions", "ze.updateNets.addNet", "ze.updateNets.deleteNet"]) {
    assert.throws(() => sample(`scope.object.${field}.push({});`), /PCB_STRING_OBSERVATION_STATE/u, field);
  }
  for (const field of ["ze.updateNets.updateNetLength", "ze.ratlineVisibleBeforeGray"]) {
    assert.throws(() => sample(`scope.object.${field}.hidden={};`), /PCB_STRING_OBSERVATION_STATE/u, field);
  }
});

void test("retained network notifications, stale ratlines, lazy getters and unknown shapes refuse", () => {
  for (const change of [
    'scope.object.ze.debounce.func=()=>{};',
    "scope.object.ze.debounce.animationFrameId=0;",
    "scope.object.ze.debounce.lastTime=1;",
    "scope.object.ze.debounce.delay=200;",
    "scope.object.ze.updateLeftTree=()=>{};",
    "scope.object.MI.manager._lastRatline={};",
    "scope.object.MI.manager._last=[];",
    "scope.object.ze._viewGroupIds=[{}];",
    "scope.object.ze.updateNets.extra=[];",
    'Object.defineProperty(scope.object.ze,"noneNetMap",{get(){getterReads++;return new Map();}});',
    "scope.object.jo.map=new(class extends Map{})();",
    "scope.object.MI.manager=null;",
  ]) { assert.throws(() => sample(change), /PCB_STRING_OBSERVATION_STATE/u, change); }
  const context = pcbStringObservationFixture(false,
    'Object.defineProperty(scope.object.ze,"private",{get(){getterReads++;throw new Error("PRIVATE");}});');
  decodeCurrentPcbStringEmptyProducers(pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION)));
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
});

void test("empty producer decoder rejects contradictory markers, signed zero and invented authority", () => {
  const raw = sample().result.value; assert.ok(typeof raw === "string");
  for (const text of [
    raw.replace('"viewGroups":null', '"viewGroups":[]'),
    raw.replace('"lastTime":-1', '"lastTime":0'),
    raw.replace('"delay":0', '"delay":-0'),
    raw.replace('"netKeys":[]', '"netKeys":["hidden"]'),
    raw.replace('"documentUuid":', '"executionAuthorized":true,"documentUuid":'),
    raw.replace('"emptyNetChange":true', '"emptyNetChange":true,"emptyNetChange":true'),
  ]) { assert.throws(() => decodeCurrentPcbStringEmptyProducers(pcbStringReply(text)), /PCB_STRING_OBSERVATION_REPLY/u); }
});

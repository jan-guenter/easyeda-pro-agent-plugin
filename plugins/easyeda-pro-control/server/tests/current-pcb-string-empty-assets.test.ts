import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION, decodeCurrentPcbStringEmptyAssets } from "../src/current-pcb-string-empty-assets.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function sample(change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(callPcbStringObservation(pcbCommonFixture(change), CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION));
}

void test("empty assets preserves initialized versus absent holders without lazy construction", () => {
  const state = decodeCurrentPcbStringEmptyAssets(sample());
  assert.deepEqual(state.template, { keys: [], last: "undefined" });
  assert.deepEqual(state.base, { keys: [], last: "undefined", uuidKeys: [] });
  assert.equal(state.completeStoredAssetsVerified, false);
  assert.equal(state.pendingAssetLoadsVerified, false);
  assert.equal(state.defaultGlyphCoverageVerified, false);
  assert.equal(state.executionAuthorized, false);
  const absent = decodeCurrentPcbStringEmptyAssets(sample("scope.object.nb.manager=null;scope.object.H8.mgr=null;"));
  assert.equal(absent.template, null); assert.equal(absent.base, null);
});

void test("templates, retained references, unresolved fonts and current BLOB participants refuse", () => {
  for (const change of [
    'scope.object.nb.manager.map.set("font",{});',
    'scope.object.H8.mgr.map.set("font",{});',
    'scope.object.H8.mgr.uuidMap.cached="font";',
    'scope.object.nb.manager._last={};',
    'scope.object.Am.ins.texts.add({});',
    'scope.object.z8.ins.footprints.set({},{});',
    'scope.object.id.map.set("blob",{});',
    'scope.object.id._last={};',
    'scope.object.nb.manager=undefined;',
  ]) { assert.throws(() => sample(change), /PCB_STRING_OBSERVATION_STATE/u, change); }
});

void test("asset backing getters never run and nested decoder extras refuse", () => {
  const context = pcbCommonFixture('Object.defineProperty(scope.object.id,"map",{get(){getterReads++;return new Map();}});');
  assert.throws(() => callPcbStringObservation(context, CURRENT_PCB_STRING_EMPTY_ASSETS_FUNCTION), /PCB_STRING_OBSERVATION_STATE/u);
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  const raw = sample().result.value; assert.ok(typeof raw === "string");
  assert.throws(() => decodeCurrentPcbStringEmptyAssets(pcbStringReply(raw.replace('"unresolvedTexts":[]', '"unresolvedTexts":["hidden"]'))), /PCB_STRING_OBSERVATION_REPLY/u);
});

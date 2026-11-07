import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_VIA_SAVED_BACKGROUND_BOOTSTRAPS, CURRENT_PCB_VIA_SAVED_BACKGROUND_ZIP_DISPATCHERS,
  qualifyCurrentPcbViaSavedBackgroundSource } from "../src/current-pcb-via-saved-background-source.ts";

void test("exact background bootstrap candidates grant source-byte comparison only, never worker/cache/resume authority", () => {
  for (const entry of CURRENT_PCB_VIA_SAVED_BACKGROUND_BOOTSTRAPS) {
    for (const source of entry.sources) {
      const result = qualifyCurrentPcbViaSavedBackgroundSource(entry.role, source);
      assert.equal(result.suppliedSourceBytesVerified, true); assert.equal(result.nativeWorkerIdentityVerified, false);
      assert.equal(result.originalContextOrHoldVerified, false); assert.equal(result.completeNativeScriptRosterVerified, false);
      assert.equal(result.cacheActorExclusionVerified, false); assert.equal(result.resumeAuthorized, false);
      assert.equal(result.selectedSqlAuthorized, false); assert.equal(result.writerAuthorized, false);
      assert.throws(() => qualifyCurrentPcbViaSavedBackgroundSource(entry.role, `${source}importScripts('https://foreign/');`));
      assert.throws(() => qualifyCurrentPcbViaSavedBackgroundSource("project-bootstrap", source));
      const copy = structuredClone(result); assert.throws(() => qualifyCurrentPcbViaSavedBackgroundSource(entry.role, copy));
    }
  }
});

void test("a Blob prefix or shared fflate error suffix is not complete worker code; zip task imports remain explicit", () => {
  const fragment = ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})';
  for (const role of ["ui-fflate-1", "manager-fflate-1", "ui-zip-dispatcher", "manager-zip-dispatcher"]) {
    assert.throws(() => qualifyCurrentPcbViaSavedBackgroundSource(role, fragment));
  }
  for (const pin of CURRENT_PCB_VIA_SAVED_BACKGROUND_ZIP_DISPATCHERS) {
    assert.equal(pin.allowsTaskScriptImports, true); assert.equal(pin.requiresOriginalTaskScriptAndCodecQualification, true);
    assert.equal(pin.noCacheBehaviorVerified, false);
  }
  let traps = 0;
  const proxy = new Proxy({}, { get: (): never => { traps += 1; throw new Error("trap"); } });
  assert.throws(() => qualifyCurrentPcbViaSavedBackgroundSource(proxy, "text"));
  assert.throws(() => qualifyCurrentPcbViaSavedBackgroundSource("ui-worker", proxy)); assert.equal(traps, 0);
});

/** Source parity binds the native budget to the independently derived profile.
 * Windows CI separately runs its pure held-saved grammar/ACK smoke; no app is
 * launched by either check, and this file claims no connected validation.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY as CAPACITY } from "../src/current-footprint-copy-held-saved-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE as PROFILE } from "../src/current-footprint-copy-held-saved-profile.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE as DIAGNOSTIC,
  CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_METHODS as METHODS } from "../src/current-footprint-held-cache-diagnostic-profile.ts";

void test("held-saved native class, ID, poll, byte and control caps match their complete derived reservation", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.ok(Buffer.byteLength(source) <= 1_048_576, "Native cleanup regressions must preserve the fixed helper byte ceiling.");
  const expected: Readonly<Record<string, number>> = {
    HeldSavedRequests: PROFILE.requestLimit, HeldSavedNormal: PROFILE.normalRequestLimit, HeldSavedCleanup: PROFILE.cleanupRequestLimit,
    HeldCacheRequests: DIAGNOSTIC.requestLimit, HeldCacheNormal: DIAGNOSTIC.normalRequestLimit, HeldCacheCleanup: DIAGNOSTIC.cleanupRequestLimit,
    HeldNormalControls: CAPACITY.controls.normal, HeldCleanupControls: CAPACITY.controls.cleanup,
    HeldNormalData: CAPACITY.renderer.normalPolls.data, HeldCleanupData: CAPACITY.renderer.cleanupPolls.data,
    HeldNormalWait: CAPACITY.renderer.normalPolls.wait, HeldCleanupWait: CAPACITY.renderer.cleanupPolls.wait,
    HeldNormalIdle: CAPACITY.renderer.normalPolls.idle, HeldCleanupIdle: CAPACITY.renderer.cleanupPolls.idle,
    HeldNormalRaw: CAPACITY.renderer.normalReceivedBytes, HeldCleanupRaw: CAPACITY.renderer.cleanupReceivedBytes,
    HeldNormalOutput: CAPACITY.normalHelperStdoutBytes, HeldCleanupOutput: CAPACITY.cleanupHelperStdoutBytes,
  };
  const actual: Record<string, number> = {};
  for (const declaration of source.matchAll(/\bconst (?:int|long) ([A-Za-z\d_=,]+);/gu)) {
    assert.ok(declaration[1] !== undefined);
    for (const entry of declaration[1].split(",")) {
      const match = /^([A-Za-z\d_]+)=(\d+)$/u.exec(entry);
      if (match?.[1] !== undefined && Object.hasOwn(expected, match[1])) {
        assert.equal(Object.hasOwn(actual, match[1]), false, "A duplicate native constant cannot shadow the reviewed reservation.");
        actual[match[1]] = Number(match[2]);
      }
    }
  }
  assert.deepEqual(actual, expected);
  const methods = /if\(footprintHeldCache209&&!heldCacheSending\).*?new string\[\]\{([^}]+)\}/u.exec(source);
  assert.ok(methods?.[1] !== undefined);
  assert.deepEqual([...methods[1].matchAll(/"([A-Za-z.]+)"/gu)].map(match => match[1]), METHODS);
});

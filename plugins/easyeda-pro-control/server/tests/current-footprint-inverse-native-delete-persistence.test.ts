import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { CurrentFootprintInverseNativeDeletePoststateCollector } from "../src/current-footprint-inverse-native-delete-poststate-collector.ts";
import type { CurrentFootprintInverseNativeDeleteCollateralPrepared } from "../src/current-footprint-inverse-native-delete-collateral-collector.ts";

const census = Object.freeze({ result: [], internalProperties: [{
  name: "[[Prototype]]", value: { type: "object", className: "Storage", objectId: "original_storage_prototype" },
}] });
const before: CurrentFootprintInverseNativeDeleteCollateralPrepared = Object.freeze({
  profile: "private.current-footprint-inverse-native-delete-collateral-prepared.v1",
  tabProof: "original_tab_proof", storageProof: "original_storage_proof", storage: "original_storage", tabId: "original_tab",
  containers: 0, presentContainers: 0, tabs: 0, properties: 0, targetTabAbsent: true, storageKeys: 0,
  storagePeerSha256: createHash("sha256").update("[]").digest("hex"),
  publicTabCloseObserved: false, publicPreferenceRemovalObserved: false, restorationAuthorized: false, deleteAuthorized: false,
});
void test("completed poststate's exit-only identity path never re-enters a dead live-context guard", async () => {
  // This exercises the actual collector boundary with synthetic receipts.
  // Only Core's separate private registry can issue a native result.
  let exited = false; let normalChecks = 0; let requests = 0;
  const live = (): void => { normalChecks += 1; assert.equal(exited, false); };
  const lane = new CurrentFootprintInverseNativeDeletePoststateCollector({
    reflection: "original_reflection", beforeSelectedValues: [null, null], before, current: live, assertOriginalCallerCompleted: live,
    assertOriginalExit: (): void => { assert.equal(exited, true); },
    request: (command): Promise<unknown> => {
      requests += 1;
      if (command.method === "Runtime.getProperties") { return Promise.resolve(census); }
      assert.equal(command.method, "Runtime.callFunctionOn");
      if (command.method !== "Runtime.callFunctionOn") { assert.fail("Core owns helper receipts"); }
      return Promise.resolve(command.role === "tabReprove" ?
        { result: { type: "boolean", value: true } } : { result: { type: "number", value: 0 } });
    },
    requireOriginalPhysicalComplete: (): void => { assert.equal(requests, 3); },
  });
  const data = await lane.start();
  assert.throws(() => { lane.requireOriginalAfterOriginalExit(data); });
  exited = true;
  const previous = normalChecks;
  await lane.settleAfterOriginalExit();
  lane.requireOriginalAfterOriginalExit(data);
  assert.equal(normalChecks, previous);
  assert.throws(() => { lane.requireOriginalAfterOriginalExit({ ...data }); });
  assert.throws(() => { lane.requireOriginal(data); });
});
void test("original undefined failure cannot become a historical completed poststate", async () => {
  let exited = false;
  const lane = new CurrentFootprintInverseNativeDeletePoststateCollector({
    reflection: "original_reflection", beforeSelectedValues: [null, null], before,
    current: (): void => { assert.equal(exited, false); }, assertOriginalCallerCompleted: (): void => { assert.equal(exited, false); },
    assertOriginalExit: (): void => { assert.equal(exited, true); },
    // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Exercise retention of the actual raw rejection, including undefined.
    request: (): Promise<unknown> => Promise.reject(),
    requireOriginalPhysicalComplete: (): void => { assert.fail("failed original read cannot complete"); },
  });
  await assert.rejects(lane.start(), (cause: unknown) => cause === undefined);
  exited = true; await lane.settleAfterOriginalExit();
  assert.throws(() => { lane.requireOriginalAfterOriginalExit({
    profile: "private.current-footprint-inverse-native-delete-poststate-data.v1", originalNativeCallerJoined: true,
    originalTabDescriptorsUnchanged: true, originalStorageHandleJoined: true, originalStorageUnchanged: true,
    originalSelectedPreferencesUnchanged: true, publicPreferenceRemovalObserved: false, restorationAuthorized: false,
    persistenceVerified: false, coldAbsenceVerified: false, wholeInverseVerified: false, cdpRequests: 5,
  }); });
});

void test("poststate rejects a selected preference changed after storageReprove with identical peer hash and key count", async () => {
  for (const changed of [0, 1]) {
    let requests = 0;
    const selected = ["original-first", "original-second"];
    const lane = new CurrentFootprintInverseNativeDeletePoststateCollector({
      reflection: "original_reflection", before: { ...before, storageKeys: 2 },
      beforeSelectedValues: ["original-first", "original-second"],
      current: (): void => { assert.ok(requests <= 3); }, assertOriginalCallerCompleted: (): void => { assert.ok(requests <= 3); },
      assertOriginalExit: (): void => { assert.fail("this is a live supplied-transport regression"); },
      request: (command): Promise<unknown> => {
        requests += 1;
        if (command.method === "Runtime.getProperties") {
          selected[changed] = "changed-after-reprove";
          return Promise.resolve({ ...census, result: ["checkRatlineNotShowAgain", "checkDrcNotShowAgain"].map((name, index) => ({
            name, value: { type: "string", value: selected[index] }, writable: true, enumerable: true, configurable: true, isOwn: true,
          })) });
        }
        if (command.method !== "Runtime.callFunctionOn") { assert.fail("unexpected helper request"); }
        return Promise.resolve(command.role === "tabReprove" ?
          { result: { type: "boolean", value: true } } : { result: { type: "number", value: 2 } });
      },
      requireOriginalPhysicalComplete: (): void => { assert.equal(requests, 3); },
    });
    await assert.rejects(lane.start(), /INVERSE_NATIVE_DELETE_POSTSTATE_CUSTODY/u);
    assert.equal(requests, 3);
  }
});

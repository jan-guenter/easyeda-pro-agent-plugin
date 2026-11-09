/* oxlint-disable import/max-dependencies -- Compare the separate fixed observation, BEGIN/history, origin and unchanged-purpose bounds without a combined authority seam. */
/** Fixed seven-record Main syntax and original-registry refusal only. */
import { currentSchematicRelevanceDisplayMainLiveHistoryWire } from "../src/current-schematic-relevance-display-main-live-history-wire.ts";
import { currentPcbViaMainLiveHistoryNativeCases } from "../src/current-pcb-via-main-live-history-protocol.ts";
import { currentPcbViaMainLiveHistoryWire } from "../src/current-pcb-via-main-live-history-wire.ts";
import { CurrentSchematicRelevanceDisplayMainLiveHistoryObserver } from "../src/current-schematic-relevance-display-main-live-history-observer.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSchematicRelevanceDisplayMainWire } from "../src/current-schematic-relevance-display-main-protocol.ts";
import { CurrentSchematicRelevanceDisplayMainRequestObserver } from "../src/current-schematic-relevance-display-main-request-observer.ts";
import { CurrentSchematicRelevanceDisplayMainBeginObserver } from "../src/current-schematic-relevance-display-main-begin-observer.ts";
import { CurrentSchematicRelevanceDisplayMainHistoryObserver } from "../src/current-schematic-relevance-display-main-history-observer.ts";
import { currentPcbViaMainNativeCases, currentPcbViaMainWire } from "../src/current-pcb-via-main-protocol.ts";
import { currentPcbViaMainBeginNativeCases } from "../src/current-pcb-via-main-begin-protocol.ts";
import { currentPcbViaMainBeginWire } from "../src/current-pcb-via-main-begin-wire.ts";
import { currentPcbViaMainHistoryNativeCases } from "../src/current-pcb-via-main-history-protocol.ts";
import { currentPcbViaMainHistoryWire } from "../src/current-pcb-via-main-history-wire.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as SEVEN } from "../src/current-schematic-relevance-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as SIX } from "../src/current-schematic-display-write-native-profile.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as WIRE } from "../src/current-schematic-wire-edit-native-profile.ts";

void test("seven-record Main reuses exact inert selectors while every native sender remains purpose-specific", () => {
  for (const command of currentPcbViaMainNativeCases()) {
    const original = currentPcbViaMainWire(command, 79).request;
    assert.deepEqual(currentSchematicRelevanceDisplayMainWire(command, 79), { ...original, action: "schematic-relevance-display-main-observe" });
  }
  for (const command of currentPcbViaMainBeginNativeCases()) {
    const original = currentPcbViaMainBeginWire(command, 79).request;
    assert.deepEqual(currentSchematicRelevanceDisplayMainWire(command, 79), { ...original, action: "schematic-relevance-display-main-begin" });
  }
  for (const command of currentPcbViaMainHistoryNativeCases()) {
    const original = currentPcbViaMainHistoryWire(command, 79).request;
    assert.deepEqual(currentSchematicRelevanceDisplayMainWire(command, 79), { ...original, action: "schematic-relevance-display-main-history" });
    const copied = { ...command, selectedSqlAuthorized: true }; assert.throws(() => currentSchematicRelevanceDisplayMainWire(copied, 79));
  }
  for (const phase of ["via-main-driver-step", "via-main-context-step", "via-main-controller-step"] as const) {
    assert.deepEqual(currentSchematicRelevanceDisplayMainWire({ phase, method: "Debugger.resume", params: {} }, 79), {
      action: "schematic-relevance-display-main-step", phase, method: "Debugger.resume", requestId: 79,
    });
  }
  assert.throws(() => currentSchematicRelevanceDisplayMainWire({ phase: "via-main-edit-head-step", method: "Debugger.resume", params: {} }, 79));
  assert.throws(() => currentSchematicRelevanceDisplayMainWire({ phase: "via-main-structure-step", method: "Debugger.resume", params: {} }, 79));
  assert.throws(() => currentSchematicRelevanceDisplayMainWire({ phase: "via-main-request-resume", method: "Debugger.resume", params: {} }, 79));
  let hooks = 0;
  const hook = (): never => { hooks += 1; throw new Error("caller hook"); };
  const getter = { method: "Debugger.resume", params: {} }; Object.defineProperty(getter, "phase", { get: hook });
  assert.throws(() => currentSchematicRelevanceDisplayMainWire(getter, 79));
  assert.throws(() => currentSchematicRelevanceDisplayMainWire(new Proxy({}, { getOwnPropertyDescriptor: hook, get: hook }), 79));
  assert.equal(hooks, 0);
  assert.deepEqual(WIRE.main, SIX.main); assert.equal(WIRE.renderer.total, 2721); assert.equal(WIRE.renderer.modifyEntryObservation, 0); assert.deepEqual([SEVEN.main.normal, SEVEN.main.cleanup, SEVEN.main.total], [1152, 43, 1195]);
  assert.deepEqual([SIX.main.normal, SIX.main.cleanup, SIX.main.total], [901, 8, 909]);
});
void test("copied seven-record or Via origins cannot create any original Main observer", () => {
  const argumentsValue = Object.freeze({ explicitNonOriginalArguments: true }), owner = Object.freeze({ explicitNonOriginalOwner: true });
  for (const profile of ["private.current-schematic-relevance-display-save-main-origin.v1", "private.current-pcb-via-main-origin.v1"]) {
    for (const Observer of [CurrentSchematicRelevanceDisplayMainRequestObserver, CurrentSchematicRelevanceDisplayMainBeginObserver, CurrentSchematicRelevanceDisplayMainHistoryObserver]) {
      assert.throws(() => Reflect.construct(Observer, [Object.freeze({ profile }), owner, argumentsValue]), /SCHEMATIC_SAVE_MAIN_ORIGINAL_ORIGIN/u);
    }
  }
});

void test("own7 live rows retain all thirteen readonly messages and cannot be created by copied origins", () => {
 for(const command of currentPcbViaMainLiveHistoryNativeCases()){assert.deepEqual(currentSchematicRelevanceDisplayMainLiveHistoryWire(command,79),{...currentPcbViaMainLiveHistoryWire(command,79),action:"schematic-relevance-display-main-live-history"});assert.throws(()=>currentSchematicRelevanceDisplayMainLiveHistoryWire({...command,rows:[]},79));}
 assert.throws(()=>Reflect.construct(CurrentSchematicRelevanceDisplayMainLiveHistoryObserver,[Object.freeze({profile:"private.current-schematic-relevance-display-save-main-origin.v1"}),Object.freeze({}),Object.freeze({})]),/ORIGINAL_ORIGIN/u);
 assert.equal(SEVEN.main.normal,1152);assert.equal(SEVEN.main.cleanup,43);assert.equal(SEVEN.main.total,1195);
});

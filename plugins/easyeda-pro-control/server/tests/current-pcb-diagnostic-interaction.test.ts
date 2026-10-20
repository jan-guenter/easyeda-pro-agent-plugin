import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbDiagnosticInteractionSchema } from "../src/current-pcb-diagnostic-interaction.ts";
import { currentPcbDiagnosticInteractionFixture } from "./helpers/current-pcb-diagnostic-interaction-fixture.ts";

type State = ReturnType<typeof currentPcbDiagnosticInteractionSchema.parse>;
function fixture(): State { return currentPcbDiagnosticInteractionSchema.parse(currentPcbDiagnosticInteractionFixture()); }

void test("interaction schema keeps exact marker relations and rejects fabricated coverage", () => {
  assert.equal(fixture().controllers.attributesUnmounted, false);
  for (const mutate of [
    (value: State): void => { value.toolChain.nextMarker = "null"; },
    (value: State): void => { value.toolChain.nextKind = "other"; },
    (value: State): void => { value.toolChain.mouseDownMarker = "present"; },
    (value: State): void => { value.toolChain.mouseDownButton = 0; },
    (value: State): void => { value.controllers.toolHistoryMarker = "present"; },
    (value: State): void => { value.secondary.innerModelMarker = "null"; },
    (value: State): void => { value.secondary.retainedLineMarker = "present"; },
    (value: State): void => { value.secondary.partitions = { marker: "null", count: 0 }; },
    (value: State): void => { value.secondary.innerViews = { keys: 0, members: 1 }; },
    (value: State): void => { value.scene.modes = [0]; },
    (value: State): void => { value.controllers.turn.queueCount = -0; },
    (value: State): void => { Object.assign(value, { emptyRootPcbVerified: true }); },
    (value: State): void => { Object.assign(value.controllers, { allTimersObserved: true }); },
  ]) {
    const value = fixture(); mutate(value);
    assert.equal(currentPcbDiagnosticInteractionSchema.safeParse(value).success, false);
  }
});

void test("interaction entry accounting includes every counted fixed container", () => {
  for (const mutate of [
    (value: State): void => { value.scene.historyToolCount += 1; },
    (value: State): void => { value.selection.counts.selectionOrder += 1; },
    (value: State): void => { value.controllers.lockedLayerCount += 1; },
    (value: State): void => { value.controllers.smart.commandCount += 1; },
    (value: State): void => { value.controllers.smart.waitingUploadCount += 1; },
    (value: State): void => { value.controllers.smart.commandIndexCount += 1; },
    (value: State): void => { value.controllers.turn.settleCallbackCount += 1; },
    (value: State): void => { value.secondary.partitions = { marker: "present", count: 1 }; },
    (value: State): void => { value.secondary.innerViews.keys += 1; },
    (value: State): void => { value.secondary.smartDimensionViews += 1; },
    (value: State): void => { value.secondary.groupViews += 1; },
  ]) {
    const value = fixture(); mutate(value);
    assert.equal(currentPcbDiagnosticInteractionSchema.safeParse(value).success, false);
    value.collectionEntries += 1;
    assert.equal(currentPcbDiagnosticInteractionSchema.safeParse(value).success, true);
  }
});

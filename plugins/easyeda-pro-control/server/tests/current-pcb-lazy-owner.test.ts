/* oxlint-disable import/max-dependencies -- This test checks one versioned owner contract across four independent readers and the composed baseline. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_PROGRAM_HASHES, CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION, decodeCurrentPcbDiagnosticModelReply, decodeCurrentPcbDiagnosticModelReplyV2 } from "../src/current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_PENDING_PROGRAM_SHA256, CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION, decodeCurrentPcbDiagnosticPendingReply, decodeCurrentPcbDiagnosticPendingReplyV2 } from "../src/current-pcb-diagnostic-pending-program.ts";
import { CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION, CURRENT_PCB_STRING_EMPTY_PRODUCERS_SHA256,
  CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION, decodeCurrentPcbStringEmptyProducers, decodeCurrentPcbStringEmptyProducersV2 } from "../src/current-pcb-string-empty-producers.ts";
import { CURRENT_PCB_STRING_PRODUCER_MARKERS_SHA256, CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION,
  decodeCurrentPcbStringProducerMarkersV2 } from "../src/current-pcb-string-producer-markers.ts";
import { inspectCurrentPcbStringLazyBaseline } from "../src/current-pcb-string-lazy-baseline.ts";
import { rawStringsModelReply, rootInventoryModelReply } from "./helpers/current-pcb-diagnostic-model-replies.ts";
import { pcbLazyOwnerExpression, pcbLazyOwnerFixture, pcbLazyOwnerReply } from "./helpers/current-pcb-lazy-owner-fixture.ts";
import { pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

const READERS = [
  [CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION, decodeCurrentPcbDiagnosticModelReplyV2],
  [CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION, decodeCurrentPcbDiagnosticPendingReplyV2],
  [CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION, decodeCurrentPcbStringEmptyProducersV2],
  [CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION, decodeCurrentPcbStringProducerMarkersV2],
] as const;
const CHANGES = { present: "", null: "FP.manager=null;MI.manager=null;",
  undefined: "FP.manager=undefined;MI.manager=undefined;", absent: "delete FP.manager;delete MI.manager;" } as const;

void test("v2 owners preserve every own marker without changing any v1 program or refusal", () => {
  assert.equal(CURRENT_PCB_DIAGNOSTIC_MODEL_PROGRAM_HASHES.state, "67d4081399cdc22be17e2e1ddd0be234290092a2c5287f629fc2de9be16b85a5");
  assert.equal(CURRENT_PCB_DIAGNOSTIC_PENDING_PROGRAM_SHA256, "69d21ad259b5d994e8c2f4ff4a5ede2cd1edca55516623d54fbd650969c9e812");
  assert.equal(CURRENT_PCB_STRING_EMPTY_PRODUCERS_SHA256, "98bc6cb2a30b50361e0911ec2dc6c4d2326f7e292768c34a9e3bd83452fbbad4");
  assert.equal(CURRENT_PCB_STRING_PRODUCER_MARKERS_SHA256, "b03e112a44c2c049a70bbc9b6e73b548cf7379783ed1722383fdc2ed92e0af1d");
  for (const [marker, change] of Object.entries(CHANGES)) {
    const context = pcbLazyOwnerFixture(change);
    const model = decodeCurrentPcbDiagnosticModelReplyV2(pcbLazyOwnerReply(CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION, context));
    const pending = decodeCurrentPcbDiagnosticPendingReplyV2(pcbLazyOwnerReply(CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION, context));
    const producers = decodeCurrentPcbStringEmptyProducersV2(pcbLazyOwnerReply(CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION, context));
    const markers = decodeCurrentPcbStringProducerMarkersV2(pcbLazyOwnerReply(CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION, context));
    for (const owner of [model.dynamicCopper, pending.dynamicCopper, producers.model, markers.dynamicCopper, markers.ratlineModel]) {
      assert.equal(owner.manager, marker); assert.equal(owner.state === null, marker !== "present");
    }
    assert.equal(pending.workerRegistry.workers?.workerCount, 0);
    if (pending.dynamicCopper.manager === "present") { assert.equal(pending.dynamicCopper.state.association, "no-worker-id"); }
    assert.equal(model.executionAuthorized, false); assert.equal(markers.managerAbsenceImpliesEmpty, false);
    if (marker !== "present") {
      assert.throws(() => decodeCurrentPcbDiagnosticModelReply(pcbLazyOwnerReply(CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, context)), /PCB_DIAGNOSTIC_MODEL/u);
      assert.throws(() => decodeCurrentPcbDiagnosticPendingReply(pcbLazyOwnerReply(CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_FUNCTION, context)), /PCB_DIAGNOSTIC_PENDING/u);
      assert.throws(() => decodeCurrentPcbStringEmptyProducers(pcbLazyOwnerReply(CURRENT_PCB_STRING_EMPTY_PRODUCERS_FUNCTION, context)), /PCB_STRING_OBSERVATION/u);
    }
    assert.equal(runInContext("vendorCalls+getterReads", context) as unknown, 0);
  }
});

void test("v2 owner readers refuse inherited managers and accessors without calling getters", () => {
  for (const change of [
    'Object.defineProperty(FP,"manager",{get(){getterReads++;return null;}});',
    'Object.defineProperty(MI,"manager",{get(){getterReads++;return null;}});',
    'delete FP.manager;Object.setPrototypeOf(FP,Object.assign(function(){},{manager:null}));',
    'delete MI.manager;Object.setPrototypeOf(MI,Object.assign(function(){},{manager:null}));',
    "FP.manager={openPcb:false};", "MI.manager={map:new Map(),idMap:new Map()};",
  ]) {
    const context = pcbLazyOwnerFixture(change);
    const selected = change.includes("MI") ? READERS.slice(2) : [READERS[0], READERS[1], READERS[3]];
    for (const [program, decode] of selected) { assert.throws(() => decode(pcbLazyOwnerReply(program, context)), /PCB_/u); }
    assert.equal(runInContext("vendorCalls+getterReads", context) as unknown, 0);
  }
});

void test("v2 decoders reject invented null-owner state, undeclared markers and authority", () => {
  const context = pcbLazyOwnerFixture(CHANGES.null);
  for (const [program, decode] of READERS) {
    const raw = pcbLazyOwnerReply(program, context).result.value; assert.equal(typeof raw, "string");
    for (const changed of [String(raw).replace('"manager":"null","state":null', '"manager":"null","state":{}'),
      String(raw).replace('"manager":"null"', '"manager":"empty"'),
      String(raw).replace('"schema":', '"executionAuthorized":true,"schema":')]) {
      assert.throws(() => decode(pcbStringReply(changed)), /PCB_/u);
    }
  }
});

function baselineInput(change = ""): Record<"rootReply" | "stringsReply" | "modelReply" | "pendingReply" | "emptyProducersReply" | "producerMarkersReply", unknown> {
  const context = pcbLazyOwnerFixture(change);
  return { rootReply: rootInventoryModelReply("d".repeat(16)), stringsReply: rawStringsModelReply("d".repeat(16)),
    modelReply: pcbLazyOwnerReply(CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION, context),
    pendingReply: pcbLazyOwnerReply(CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION, context),
    emptyProducersReply: pcbLazyOwnerReply(CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION, context),
    producerMarkersReply: pcbLazyOwnerReply(CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION, context) };
}
void test("v2 baseline keeps unavailable comparison and secondary observations distinct from emptiness", () => {
  const present = inspectCurrentPcbStringLazyBaseline("d".repeat(16), baselineInput());
  assert.notEqual(present.strictV1Comparison, null); assert.equal(present.strictV1ComparisonIsPresentStateProjection, true);
  for (const marker of ["null", "undefined", "absent"] as const) {
    const value = inspectCurrentPcbStringLazyBaseline("d".repeat(16), baselineInput(CHANGES[marker]));
    assert.equal(value.strictV1Comparison, null); assert.equal(value.strictV1ComparisonIsPresentStateProjection, false);
    assert.deepEqual(value.owners.compilerCopper, { manager: marker, state: null });
    assert.ok(value.unmetConditions.includes("strict-v1.owner-profile-available"));
    assert.ok(value.unmetConditions.includes("ratline.model-owner-observed"));
    assert.equal(value.emptyRootPcbVerified, false); assert.equal(value.observedConditionsSatisfied, false);
    assert.equal(value.executionAuthorized, false); assert.ok(Object.isFrozen(value.owners.compilerCopper));
  }
  const mixed = baselineInput(); mixed.pendingReply = baselineInput(CHANGES.null).pendingReply;
  const mismatch = inspectCurrentPcbStringLazyBaseline("d".repeat(16), mixed);
  assert.ok(mismatch.unmetConditions.includes("identity.dynamic-copper")); assert.equal(mismatch.strictV1Comparison, null);
  assert.throws(() => inspectCurrentPcbStringLazyBaseline("d".repeat(16), new Proxy({}, { ownKeys(): never { throw new Error("TRAP"); } })), /PCB_STRING_LAZY_BASELINE_INPUT/u);
});

void test("all v2 readers pass synthetic inspector effect checks without native initialization", async () => {
  const session = new Session(); session.connect(); let contextId = 0;
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic") { contextId = params.context.id; }
  });
  try {
    await session.post("Runtime.enable"); const context = pcbLazyOwnerFixture(CHANGES.null); assert.notEqual(contextId, 0);
    for (const [program, decode] of READERS) {
      const pending: Promise<unknown> = session.post("Runtime.evaluate", { expression: pcbLazyOwnerExpression(program),
        contextId, returnByValue: true, throwOnSideEffect: true, silent: true });
      decode(await pending);
    }
    runInContext('FP.manager=new Proxy(new FP(),{getOwnPropertyDescriptor(){getterReads++;return undefined;}});', context);
    const denied: Promise<unknown> = session.post("Runtime.evaluate", { expression: pcbLazyOwnerExpression(CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION),
      contextId, returnByValue: true, throwOnSideEffect: true, silent: true });
    const reply = await denied; assert.throws(() => decodeCurrentPcbDiagnosticModelReplyV2(reply), /PCB_DIAGNOSTIC_MODEL/u);
    assert.equal(runInContext("vendorCalls+getterReads", context) as unknown, 0);
  } finally { session.disconnect(); }
});

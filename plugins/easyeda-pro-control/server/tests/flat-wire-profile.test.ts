import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { FLAT_WIRE_TRANSACTION_PROFILE, assertFlatWireBinding, assertFlatWireInverse } from "../src/flat-wire-binding.ts";
import { flatTransactionBinding } from "../src/flat-transaction-binding.ts";
import { flatWireContactIncidence, prepareFlatWireProfile, verifyFlatWireObservation, verifyFlatWirePersistence } from "../src/flat-wire-profile.ts";
import { buildSchematicNativeWireAdapter } from "../src/schematic-native-wire.ts";
import { context, rehash } from "./flat-display-fixture.ts";
import { flatWireFixture, wireAfter, wireOperation } from "./flat-wire-fixture.ts";

void test("flat wire seals exact existing identities, physical incidence and complete inverse", async () => {
  const before = flatWireFixture(), original = structuredClone(before);
  const prepared = await prepareFlatWireProfile({ ...before, context, operation: wireOperation });
  assert.equal(prepared.binding.profile, FLAT_WIRE_TRANSACTION_PROFILE);
  assert.deepEqual(prepared.binding.lineIds, ["line0", "line1", "line2"]);
  assert.deepEqual(prepared.binding.topology, [{ uniqueId: "unique-part", designator: "R1", pins: [{ pinNumber: "1", net: "SIGNAL" }] }]);
  assertFlatWireBinding(prepared.binding, wireOperation, context); assertFlatWireInverse(prepared.binding, prepared.inverse);
  const after = wireAfter(before, prepared.expectedSource, prepared.expectedNative);
  verifyFlatWireObservation(prepared.binding, wireOperation, context, before.evidence, before.native, "before");
  verifyFlatWireObservation(prepared.binding, wireOperation, context, after.evidence, after.native, "after");
  assert.equal(flatWireContactIncidence(before.evidence.observation, "wire"), flatWireContactIncidence(after.evidence.observation, "wire"));
  const reverse = buildSchematicNativeWireAdapter(prepared.inverse, prepared.expectedSource, prepared.expectedNative);
  assert.deepEqual(reverse.expected, parseDocumentSource(before.native.source));
  assert.deepEqual(reverse.descriptor.allocatedLineIds, []); assert.deepEqual(reverse.descriptor.removedLineIds, []);
  assert.deepEqual(before, original);
});

for (const kind of ["style", "net", "count", "diagonal", "fraction", "detach", "zero", "unsplit", "same-name-island", "unchanged"] as const) {
  void test(`flat wire refuses ${kind} without native execution`, async () => {
    const before = flatWireFixture(), operation = structuredClone(wireOperation);
    if (kind === "style") { operation.patch.lineWidth = 2; }
    else if (kind === "net") { Reflect.set(operation.patch, "net", "SIGNAL"); }
    else if (kind === "count") { operation.patch.line.pop(); }
    else if (kind === "diagonal") { operation.patch.line[0] = [0, 0, 15, 1]; }
    else if (kind === "fraction") { operation.patch.line = [[0, 0, 15.5, 0], [15.5, 0, 15.5, -10], [15.5, -10, 20, -10]]; }
    else if (kind === "detach") { operation.patch.line[0] = [1, 0, 15, 0]; }
    else if (kind === "zero") { operation.patch.line[0] = [0, 0, 0, 0]; }
    else if (kind === "unsplit") { operation.patch.line = [[0, 0, 20, 0], [10, 0, 10, -10], [10, -10, 20, -10]]; }
    else if (kind === "same-name-island") { operation.patch.line = [[0, 0, 15, 0], [30, 0, 30, -10], [30, -10, 40, -10]]; }
    else { operation.patch.line = [[0, 0, 10, 0], [10, 0, 10, -10], [10, -10, 20, -10]]; }
    await assert.rejects(prepareFlatWireProfile({ ...before, context, operation }));
  });
}

void test("flat wire never accepts misplaced/dual profiles or a changed sealed inverse/context", async () => {
  const before = flatWireFixture(), prepared = await prepareFlatWireProfile({ ...before, context, operation: wireOperation });
  assert.deepEqual(flatTransactionBinding({ flatWire: prepared.binding }), prepared.binding);
  const inherited = {}; Object.setPrototypeOf(inherited, { flatWire: prepared.binding });
  assert.equal(flatTransactionBinding(inherited), undefined);
  const inheritedDisplay = {}; Object.setPrototypeOf(inheritedDisplay, { flatDisplay: prepared.binding });
  assert.equal(flatTransactionBinding(inheritedDisplay), undefined);
  assert.throws(() => flatTransactionBinding({ flatWire: undefined }));
  assert.throws(() => flatTransactionBinding({ flatWire: prepared.binding, flatDisplay: undefined }));
  for (const operation of [{ ...wireOperation, id: "other" }, { ...wireOperation, target: { primitiveId: "other" } }]) {
    assert.throws(() => assertFlatWireBinding(prepared.binding, operation, context));
  }
  assert.throws(() => assertFlatWireInverse(prepared.binding, { ...prepared.inverse, id: "other" }));
  assert.throws(() => assertFlatWireBinding(prepared.binding, wireOperation, { ...context, document: { ...context.document, documentType: 2 } }));
  assert.equal(prepared.binding.inverseSha256, sha256Json(prepared.inverse));
});

void test("flat wire classifies durable baseline versus exact effect and rejects unrelated changes", async () => {
  const before = flatWireFixture(), prepared = await prepareFlatWireProfile({ ...before, context, operation: wireOperation });
  const after = wireAfter(before, prepared.expectedSource, prepared.expectedNative);
  const unchangedDisk = wireAfter(before, prepared.expectedSource, prepared.expectedNative, false);
  const input = { binding: prepared.binding, operation: wireOperation, context, baseline: before.evidence.history,
    before: parseDocumentSource(before.native.source), beforeNative: before.native, current: prepared.expectedSource,
    currentNative: after.native, evidence: unchangedDisk.evidence, allowAfter: true };
  const unchanged = await verifyFlatWirePersistence(input);
  const applied = await verifyFlatWirePersistence({ ...input, evidence: after.evidence });
  assert.equal(unchanged["classification"], "unchanged-baseline"); assert.equal(applied["classification"], "exact-intended-effect");
  const changed = structuredClone(after.evidence), peer = changed.history.documents.find((entry) => entry.uuid === "pcb"); assert.ok(peer);
  const row = peer.records[0]; assert.ok(row); row.body["title"] = "Unrequested peer title";
  await assert.rejects(verifyFlatWirePersistence({ ...input, evidence: { ...changed, history: rehash(changed.history) } }), /peer/u);
  await assert.rejects(verifyFlatWirePersistence({ ...input, evidence: after.evidence, allowAfter: false }));
});

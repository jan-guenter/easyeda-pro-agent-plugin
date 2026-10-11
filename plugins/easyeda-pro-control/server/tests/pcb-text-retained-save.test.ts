import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyPcbTextRetainedSaveAuthority, verifyPcbTextRetainedSaveEffect } from "../src/pcb-text-retained-save.ts";
import { verifyDesignBaseline } from "../src/design-persistence.ts";
import { BASE, CREATED, OLD, fixture, head, history, phase, raw, recolor } from "./pcb-text-retained-save-fixture.ts";

for (const legacy of [false, true]) {
  void test(`retained ${legacy ? "v1 null/cached-black" : "v2 exact-black"} creation proves original intent without changing observations`, () => {
    const value = fixture(legacy);
    const retained = JSON.stringify(value);
    const authority = verifyPcbTextRetainedSaveAuthority(value.journal, value.phases);
    const proof = verifyPcbTextRetainedSaveEffect(authority, { before: value.beforeHistory, after: value.afterHistory,
      current: value.current, currentPayload: phase(value.current).payload });
    assert.equal(proof["sourceNormalized"], false);
    assert.equal(proof["saveRepeated"], false);
    assert.equal(proof["navigationRepeated"], false);
    assert.equal(proof["creationProgramRegenerated"], false);
    assert.equal(proof["unchangedPeerCount"], 1);
    assert.equal(proof["carryover"] !== undefined, legacy);
    assert.equal(JSON.stringify(value), retained);
  });
}
void test("retained creation refuses absent/error Save ACK, original ID substitutions, intent drift and v1/v2 mixing", () => {
  const value = fixture();
  for (const key of ["before", "prepared", "apply", "after", "intent", "save"] as const) {
    assert.throws(() => verifyPcbTextRetainedSaveAuthority(value.journal, { ...value.phases, [key]: undefined }));
  }
  for (const save of [{ ok: false }, { ...value.phases.save, saved: false }, { ...value.phases.save, reopened: false },
    { ...value.phases.save, exactSaveGuard: { passes: 1 } }]) {
    assert.throws(() => verifyPcbTextRetainedSaveAuthority(value.journal, { ...value.phases, save }));
  }
  for (const patch of [{ createdId: OLD }, { targetId: OLD }, { createdIds: {} }, { after: value.current }]) {
    assert.throws(() => verifyPcbTextRetainedSaveAuthority({ ...value.journal, ...patch }, value.phases));
  }
  for (const prepared of [{ ...value.phases.prepared, createdId: OLD }, { ...value.phases.prepared, adapterProfile: "unknown" }, fixture(false).phases.prepared]) {
    assert.throws(() => verifyPcbTextRetainedSaveAuthority(value.journal, { ...value.phases, prepared }));
  }
  for (const intent of [{ ...value.phases.intent, sourceSha256: value.current.sha256 }, { ...value.phases.intent, operationId: "other" }]) {
    assert.throws(() => verifyPcbTextRetainedSaveAuthority(value.journal, { ...value.phases, intent }));
  }
  const current = fixture(false);
  assert.throws(() => verifyPcbTextRetainedSaveAuthority(current.journal, { ...current.phases, prepared: value.phases.prepared }));
});
void test("legacy carry is exactly black-after-black with raw export and durable reload order, never global normalization", () => {
  const value = fixture();
  const authority = verifyPcbTextRetainedSaveAuthority(value.journal, value.phases);
  for (const current of [value.journal.after, recolor(value.current, CREATED, "#ff0000"), recolor(value.current, OLD, null)]) {
    assert.throws(() => verifyPcbTextRetainedSaveEffect(authority, { before: value.beforeHistory, after: value.afterHistory,
      current, currentPayload: phase(current).payload }));
  }
  assert.throws(() => verifyPcbTextRetainedSaveEffect(authority, { before: value.beforeHistory, after: value.afterHistory,
    current: value.current, currentPayload: phase(value.current, [CREATED, OLD]).payload }), /order/u);
  const wrongOrder = { ...value.phases, after: { ...phase(value.journal.after, [CREATED, OLD]), proof: value.phases.after.proof } };
  // Even a freshly rebound Save guard cannot turn a sorted-ID order into the
  // Original old-then-created physical decoder order.
  const badAuthority = { ...authority, intendedRawSource: String(wrongOrder.after.payload["source"]) };
  assert.throws(() => verifyPcbTextRetainedSaveEffect(badAuthority, { before: value.beforeHistory, after: value.afterHistory,
    current: value.current, currentPayload: phase(value.current).payload }), /order/u);
});
void test("complete persistence rejects stored black normalization, peer raw changes and old target clocks", () => {
  const value = fixture();
  const authority = verifyPcbTextRetainedSaveAuthority(value.journal, value.phases);
  const oldTarget = value.beforeHistory.documents.find((row) => row.uuid === authority.documentUuid); assert.ok(oldTarget);
  const variants = [fixture(false).afterHistory,
    { ...value.afterHistory, documents: value.afterHistory.documents.map((row) => row.uuid === authority.documentUuid ? row : { ...row, metadata: { ...row.metadata, extra: true } }) },
    { ...value.afterHistory, documents: value.afterHistory.documents.map((row) => row.uuid === authority.documentUuid ? {
      ...row, records: row.records.map((atom) => atom.id === OLD ? { ...atom, ticket: atom.ticket + 1 } : atom) } : row) },
    history([head(20) + raw("STRING", 19, { invisible: true }, "0".repeat(16))], "different"),
  ];
  for (const after of variants) {
    assert.throws(() => verifyPcbTextRetainedSaveEffect(authority, { before: value.beforeHistory, after,
      current: value.current, currentPayload: phase(value.current).payload }));
  }
});
void test("pinned S4 feed/clear model distinguishes cached full reload from fresh per-record incremental decode", () => {
  // PCB S4.feed4002049 assigns only truthy S; S4.clear does not clear it.
  // The og.feed2 method4214967 reuses one decoder, while getDecode4219242 allocates one.
  class ColorDecoder {
    public specialColor: string | null = null;
    public x = 0;
    public feed(value: string | null): string | null { if (value !== null && value !== "") { this.specialColor = value; } return this.specialColor; }
    // Native clear resets position but omits specialColor.
    public clear(): void { this.x = 0; }
  }
  const cached = new ColorDecoder();
  assert.equal(cached.feed("#000000"), "#000000"); cached.clear();
  assert.equal(cached.feed(null), "#000000");
  assert.equal(new ColorDecoder().feed(null), null);
  const alternate = new ColorDecoder();
  assert.equal(alternate.feed("#ff0000"), "#ff0000"); alternate.clear();
  assert.equal(alternate.feed(null), "#ff0000");
  const value = fixture();
  const authority = verifyPcbTextRetainedSaveAuthority(value.journal, value.phases), current = recolor(value.current, CREATED, "#ff0000");
  assert.throws(() => verifyPcbTextRetainedSaveEffect(authority, { before: value.beforeHistory, after: value.afterHistory,
    current, currentPayload: phase(current).payload }));
});
void test("legacy scope admits separate exact BLOB/FONT decoder families but refuses hidden STRING or component/template rows", () => {
  for (const family of ["BLOB", "FONT"]) {
    for (const recordType of [family, "STRING", "ATTR", "COMPONENT"]) {
      const value = fixture();
      const global = raw("DOCHEAD", 1, { docType: family, uuid: family, client: "c".repeat(16) }) +
        raw(recordType, 1, { test: "synthetic" }, "9".repeat(16));
      const after = history([BASE, global, value.suffix], "global-after"), before = history([BASE, global], "global-before");
      const phases = { ...value.phases, before: { ...value.phases.before,
        baselineProof: verifyDesignBaseline({ checkpoint: before, source: value.journal.before, targets: [] }) } };
      const authority = verifyPcbTextRetainedSaveAuthority(value.journal, phases);
      const run = (): unknown => verifyPcbTextRetainedSaveEffect(authority, { before, after, current: value.current, currentPayload: phase(value.current).payload });
      if (recordType === family) { assert.doesNotThrow(run); }
      else { assert.throws(run, /global blob\/font/u); }
    }
  }
  const component = { id: "9".repeat(16), type: "COMPONENT", body: { partitionId: "", groupId: 0, x: 10, y: 20, locked: true } };
  const attribute = { id: "a".repeat(16), type: "ATTR", body: { parentId: component.id, key: "Designator", value: "R1", keyVisible: false, valueVisible: true } };
  for (const extra of [[component], [component, attribute]]) {
    const value = fixture(true, extra);
    // Complete rehashed source, raw history and original baseline pass generic
    // Creation admission before the narrower legacy decoder guard refuses.
    const authority = verifyPcbTextRetainedSaveAuthority(value.journal, value.phases);
    assert.throws(() => verifyPcbTextRetainedSaveEffect(authority, { before: value.beforeHistory,
      after: value.afterHistory, current: value.current, currentPayload: phase(value.current).payload }), /excludes component, template and font/u);
    const current = fixture(false, extra);
    assert.doesNotThrow(() => verifyPcbTextRetainedSaveEffect(verifyPcbTextRetainedSaveAuthority(current.journal, current.phases), {
      before: current.beforeHistory, after: current.afterHistory, current: current.current, currentPayload: phase(current.current).payload }));
  }
  for (const type of ["FONT", "BLOB"]) {
    assert.throws(() => fixture(true, [{ id: "9".repeat(16), type, body: {} }]), /unsupported record family/u);
  }
});

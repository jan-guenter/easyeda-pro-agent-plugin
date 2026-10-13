import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAgedSymbolWitnessReadExpression, validateAgedSymbolWitnessReadResult } from "../src/aged-symbol-witness.ts";
import { controlScope, fixture, target } from "./helpers/aged-symbol-witness-browser-fixture.ts";

function replacementDate(): Date { return new Date(); }

void test("fixed composite retains full Date controls around exactly eight read-only RPCs", async () => {
  const f = fixture(), raw = structuredClone(await f.run()), value = validateAgedSymbolWitnessReadResult(raw, target, controlScope);
  assert.equal(f.calls.length, 8); assert.equal(f.clears, 1);
  assert.equal(value.controlsBefore.role, "renderer"); assert.equal(value.controlsAfter.role, "renderer");
  assert.equal(value.witness["producerBindingVerified"], false); assert.equal(value.controlsBefore.executionAuthorized, false);
  assert.equal(value.controlsBefore.sql.length, 5); assert.equal(value.controlsBefore.epochs.length, 5);
});
for (const at of [1, 2, 3, 4, 5, 6, 7, 8]) {
  for (const kind of ["date", "control-only-method"] as const) {
    void test(`composite refuses ${kind} replacement at native await ${at}`, async (context) => {
      const f = fixture();
      f.onCall = (_, index): void => {
        if (index !== at) { return; }
        if (kind === "date") { f.sandbox["Date"] = replacementDate; }
        else {
          const date = f.sandbox["Date"]; assert.ok(typeof date === "function");
          const prototype: unknown = Reflect.get(date, "prototype"); assert.ok(prototype !== null && typeof prototype === "object");
          const descriptor = Object.getOwnPropertyDescriptor(prototype, "toISOString"); assert.ok(descriptor !== undefined);
          context.after(() => { Object.defineProperty(prototype, "toISOString", descriptor); });
          Object.defineProperty(prototype, "toISOString", { ...descriptor, value: (): string => "substituted" });
        }
      };
      await assert.rejects(f.run(), /AGED_WITNESS_OBSERVATION_REFUSED/u);
      assert.ok(f.calls.length <= 8);
    });
  }
}
for (const field of ["profile", "executionAuthorized", "producerBindingVerified", "controlsBefore", "controlsAfter", "witness"] as const) {
  void test(`composite parser refuses changed ${field}`, async () => {
    const f = fixture(), raw: unknown = structuredClone(await f.run());
    assert.ok(raw !== null && typeof raw === "object"); Reflect.set(raw, field, field.endsWith("Verified") || field.endsWith("Authorized") ? true : {});
    assert.throws(() => validateAgedSymbolWitnessReadResult(raw, target, controlScope));
  });
}
void test("composite compiler refuses a control scope selecting another literal", () => {
  const f = fixture();
  assert.throws(() => buildAgedSymbolWitnessReadExpression(target, { ...controlScope, createdAtLiteral: "2026-01-15 12:34:56" }, f.actor), /AGED_WITNESS/u);
});

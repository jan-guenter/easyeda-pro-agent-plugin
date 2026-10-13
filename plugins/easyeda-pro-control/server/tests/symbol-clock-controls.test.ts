import assert from "node:assert/strict";
import { test } from "node:test";
import { buildMainClockReference, buildRendererClockControls, validateClockControlScope, validateClockControls } from "../src/symbol-clock-controls.ts";
import { ACTOR, BASE, SCOPE, fixture } from "./helpers/symbol-clock-fixture.ts";

for (const role of ["renderer", "main-reference"] as const) {
  void test(`${role} fixed two-pass vectors include exact baseline and four historical controls`, () => {
    const f = fixture(role), value = f.run();
    assert.equal(value.epochs.length, 5); assert.equal(value.sql.length, 5); assert.equal(value.sql[0]?.input, SCOPE.createdAtLiteral);
    assert.equal(value.clockBefore.epochMs, BASE); assert.equal(value.clockAfter.epochMs, BASE + 10); assert.equal(f.calls.length, 244);
    assert.equal(value.environmentTzAbsent, role === "main-reference" ? true : null);
    assert.equal(value.producerBindingVerified, false); assert.equal(value.appClockVerified, false); assert.equal(value.executionAuthorized, false);
  });
}
void test("fixed observers never call SDK, RPC, HTTP, filesystem or async APIs", () => {
  for (const source of [buildRendererClockControls(SCOPE, ACTOR), buildMainClockReference(SCOPE)]) {
    for (const text of ["await ", ".rpcCall", "fetch(", "require(", "import(", "/api/user", "setTimeout", "save(", "getActiveTab"]) { assert.equal(source.includes(text), false); }
  }
});
for (let at = 1; at <= 244; at += 1) {
  void test(`renderer refuses actor drift at Date call ${at} with no later calls`, () => {
    const f = fixture(); f.onCall = (_, count): void => { if (count === at) { f.startup["uuid"] = "b".repeat(32); } };
    assert.throws(f.run, /CLOCK_CONTROL_READ_REFUSED/u); assert.equal(f.calls.length, at);
  });
}
const mutations: [string, (f: ReturnType<typeof fixture>) => void][] = [
  ["Date constructor", (f) => { f.sandbox["Date"] = Date; }],
  ["Date method", (f) => { f.methods["getTime"] = (): never => { throw new Error("must not call replacement"); }; }],
  ["Date.now", (f) => { Object.defineProperty(f.date, "now", { value(): never { throw new Error("must not call replacement"); } }); }],
  ["document", (f) => { f.sandbox["document"] = {}; }], ["mode", (f) => { f.sandbox["PRO_EDITOR_MODE"] = "online"; }],
  ["project identity", (f) => { f.host["currentProject"] = {}; }], ["cached identity", (f) => { f.cached["username"] = "changed"; }],
];
for (const [name, mutate] of mutations) {
  for (const at of [1, 12, 122, 244]) {
    void test(`renderer refuses ${name} substitution at ${at}`, () => {
      const f = fixture(); f.onCall = (_, count): void => { if (count === at) { mutate(f); } };
      assert.throws(f.run, /CLOCK_CONTROL_READ_REFUSED/u); assert.equal(f.calls.length, at);
    });
  }
}
for (const key of ["TZ", "tz", "Tz", "tZ"]) {
  for (const presentAt of [0, 1, 244]) {
    void test(`main-reference refuses ${key} presence at call ${presentAt} without reading its value`, () => {
      const f = fixture("main-reference"); let reads = 0;
      const mutate = (): void => { Object.defineProperty(f.env, key, { configurable: true, get(): never { reads += 1; throw new Error("secret"); } }); };
      if (presentAt === 0) { mutate(); } else { f.onCall = (_, count): void => { if (count === presentAt) { mutate(); } }; }
      assert.throws(f.run, /CLOCK_CONTROL_READ_REFUSED/u); assert.equal(reads, 0); assert.equal(f.calls.length, presentAt);
    });
  }
}
void test("non-TZ environment values and sensitive actor fields are never read", () => {
  const f = fixture("main-reference"); let reads = 0;
  Object.defineProperty(f.env, "SECRET", { get(): never { reads += 1; throw new Error("secret"); } }); f.run(); assert.equal(reads, 0);
  const renderer = fixture(); Object.defineProperty(renderer.startup, "password", { get(): never { reads += 1; throw new Error("secret"); } }); renderer.run(); assert.equal(reads, 0);
});
for (const literal of ["2026-02-30 12:00:00", "2025-02-29 12:00:00", "2026-13-01 12:00:00", "2026-01-01 24:00:00", "2026-01-01T00:00:00", "2026-01-01 00:00:00Z", "2026-01-01 00:00:00.1", "2026-1-01 00:00:00", "1969-12-31 00:00:00"]) {
  void test(`scope refuses unsupported SQL literal ${literal}`, () => { assert.throws(() => validateClockControlScope({ ...SCOPE, createdAtLiteral: literal }), /CLOCK_CONTROLS_REFUSED/u); });
}
void test("valid leap-day SQL literal is admitted", () => { assert.equal(validateClockControlScope({ ...SCOPE, createdAtLiteral: "2024-02-29 00:00:00" }).createdAtLiteral, "2024-02-29 00:00:00"); });
void test("result parser refuses drift, extra fields, asserted authority and accessors", () => {
  const value = fixture().run();
  for (const key of ["producerBindingVerified", "appClockVerified", "executionAuthorized"]) {
    assert.throws(() => validateClockControls({ ...value, [key]: true }, SCOPE, "renderer"), /CLOCK_CONTROLS_REFUSED/u);
  }
  assert.throws(() => validateClockControls({ ...value, extra: true }, SCOPE, "renderer"), /CLOCK_CONTROLS_REFUSED/u);
  assert.throws(() => validateClockControls(value, { ...SCOPE, referenceUtcMs: BASE + 1 }, "renderer"), /CLOCK_CONTROLS_REFUSED/u);
  let reads = 0; const other = { ...value }; Object.defineProperty(other, "sql", { get(): never { reads += 1; throw new Error("secret"); } });
  assert.throws(() => validateClockControls(other, SCOPE, "renderer"), /CLOCK_CONTROLS_REFUSED/u); assert.equal(reads, 0);
});

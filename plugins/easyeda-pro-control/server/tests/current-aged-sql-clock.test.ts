import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { APP_DATE_PARSER_SOURCE } from "../src/historical-sql-clock.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { buildCurrentAgedSqlClockControls, validateCurrentAgedSqlClockControls } from "../src/current-aged-sql-clock-controls.ts";
import { compareCurrentAgedSqlClock } from "../src/current-aged-sql-clock.ts";
import type { ClockControlScope } from "../src/symbol-clock-controls.ts";
import { ACTOR, BASE, SCOPE } from "./helpers/symbol-clock-fixture.ts";

type Role = "renderer" | "main-reference";
type Bag = Record<string, unknown>;
interface ClockFixture {
  readonly sandbox: Bag; readonly env: Bag; readonly methods: Bag;
  onCall?: (name: string) => void;
  run: () => ReturnType<typeof validateCurrentAgedSqlClockControls>;
}
function fixture(role: Role, scope: ClockControlScope = SCOPE, nowMs = BASE,
  offsetAt: (epochMs: number) => number = () => 0, literalOffset = 0): ClockFixture {
  const env = {}, host = { currentProject: {}, loginedUserInfo: { ...ACTOR }, globalVariableCookieData: { userInfo: { ...ACTOR } } }, methods: Bag = {};
  const sandbox: Bag = { Object, Reflect, Array, process: { env }, UI: { gVars: host }, gVars: host,
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" }, document: { URL: "https://client/editor?cll=warn#", nodeType: 9 },
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM" };
  const state: ClockFixture = { sandbox, env, methods, run(): ReturnType<typeof validateCurrentAgedSqlClockControls> {
    const code = buildCurrentAgedSqlClockControls(scope, role, ACTOR);
    const raw: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${code}`, sandbox, { timeout: 5000 });
    return validateCurrentAgedSqlClockControls(structuredClone(raw), scope, role);
  } };
  let nowCalls = 0;
  function observedDate(dateInput: string | number): Date {
    state.onCall?.("constructor");
    if (typeof dateInput === "number") { return new Date(dateInput); }
    const wall = Date.parse(`${dateInput.replace(" ", "T")}Z`);
    const offset = dateInput === scope.createdAtLiteral ? literalOffset : offsetAt(wall);
    return new Date(wall + offset * 60_000);
  }
  methods["getTime"] = function getTime(this: Date): number { state.onCall?.("getTime"); return this.getTime(); };
  methods["toISOString"] = function toISOString(this: Date): string { state.onCall?.("toISOString"); return this.toISOString(); };
  methods["getTimezoneOffset"] = function getTimezoneOffset(this: Date): number { state.onCall?.("getTimezoneOffset"); return offsetAt(this.getTime()); };
  const names = ["getFullYear", "getMonth", "getDate", "getHours", "getMinutes", "getSeconds", "getMilliseconds"] as const;
  const utcNames = ["getUTCFullYear", "getUTCMonth", "getUTCDate", "getUTCHours", "getUTCMinutes", "getUTCSeconds", "getUTCMilliseconds"] as const;
  for (const [index, name] of names.entries()) {
    const utcName = utcNames[index]; assert.ok(utcName);
    methods[name] = function local(this: Date): number {
      state.onCall?.(name);
      const shifted = new Date(this.getTime() - offsetAt(this.getTime()) * 60_000);
      return shifted[utcName]();
    };
  }
  Object.defineProperty(observedDate, "prototype", { value: methods });
  Object.defineProperty(observedDate, "now", { value(): number { state.onCall?.("now"); const result = nowMs + nowCalls; nowCalls += 1; return result; } });
  sandbox["Date"] = observedDate;
  return state;
}
function native(ms: number, offset: number): Record<string, unknown> {
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(621_355_968_000_000_000n + BigInt(ms) * 10_000n),
    utcAfterTicks: String(621_355_968_000_000_000n + BigInt(ms + 1) * 10_000n), qpcBefore: String(BigInt(ms) * 1000n), qpcAfter: String(BigInt(ms) * 1000n + 1n),
    qpcFrequency: "1000000", highResolution: true, localOffsetMinutes: -offset, zoneRulesSha256: "a".repeat(64) };
}
function input(current = 0, historical = current, scope: ClockControlScope = SCOPE): {
  scope: ClockControlScope; renderer: unknown; mainReference: unknown;
  mainReferenceNativeClock: { before: Record<string, unknown>; after: Record<string, unknown> };
  rendererNativeClock: { before: Record<string, unknown>; after: Record<string, unknown> };
  plannedBackendWindow: { notBeforeMs: number; notAfterMs: number };
} {
  const offsetAt = (epochMs: number): number => new Date(epochMs).getUTCMonth() === 0 ? historical : current;
  return { scope, renderer: fixture("renderer", scope, BASE + 1000, offsetAt, historical).run(),
    mainReference: fixture("main-reference", scope, BASE, offsetAt, historical).run(),
    mainReferenceNativeClock: { before: native(BASE - 10, current), after: native(BASE + 100, current) },
    rendererNativeClock: { before: native(BASE + 990, current), after: native(BASE + 1100, current) },
    plannedBackendWindow: { notBeforeMs: BASE + 2000, notAfterMs: BASE + 62_000 } };
}
function mutableControls(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }

void test("current source stays separate from old parser and matches the current APP admission pin", () => {
  const result = compareCurrentAgedSqlClock(input());
  const app = CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION.files.find((pin) => pin.relativePath === "../app.js"); assert.ok(app);
  assert.equal(result.parserSource.sha256, app.sha256); assert.equal(result.parserSource.bytes, app.bytes);
  assert.equal(result.parserSource.utf16Offset, 1_322_261); assert.equal(result.parserSource.functionName, "rl");
  assert.notEqual(result.parserSource.sha256, APP_DATE_PARSER_SOURCE.sha256); assert.equal(APP_DATE_PARSER_SOURCE.utf16Offset, 1_317_965);
  for (const field of ["producerBindingVerified", "preselectedIntervalProven", "appClockDirectlyObserved", "continuousClockStabilityProved", "executionAuthorized"] as const) {
    assert.equal(result[field], false);
  }
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.agedHead)); assert.ok(Object.isFrozen(result.plannedBackendWindow));
});
for (const [current, historical] of [[-120, -60], [240, 300], [-345, -345], [0, 0]] as const) {
  void test(`exact native parse retains historical offset ${historical}, rl subtracts current ${current}`, () => {
    const result = compareCurrentAgedSqlClock(input(current, historical));
    const wall = Date.parse(`${SCOPE.createdAtLiteral.replace(" ", "T")}Z`);
    assert.equal(result.agedHead.nativeParsedLocalMs, wall + historical * 60_000);
    assert.equal(result.appRlUnderCommonOsPremiseMs, wall + (historical - current) * 60_000);
    assert.equal(result.agedHead.nativeTimezoneOffsetMinutes, current); assert.equal(result.historicalTimezoneOffsetMinutes, historical);
  });
}
for (const role of ["renderer", "main-reference"] as const) {
  void test(`${role} fixed compiler scans all 1681 candidates twice and retains maintained controls`, () => {
    const result = fixture(role).run();
    assert.equal(result.scanBefore.offsets.length, 1681); assert.deepEqual(result.scanBefore, result.scanAfter);
    assert.equal(result.controlsBefore.epochs.length, 5); assert.equal(result.controlsBefore.sql.length, 5);
    assert.equal(result.controlsBefore.sql[0]?.input, SCOPE.createdAtLiteral);
    assert.ok(Object.isFrozen(result.scanBefore.offsets));
  });
  for (const [label, literal, switchAt, before, after, parseOffset] of [
    ["fold", "2026-10-25 02:30:00", Date.UTC(2026, 9, 25, 1), -120, -60, -120],
    ["gap", "2026-03-29 02:30:00", Date.UTC(2026, 2, 29, 1), -60, -120, -60],
    ["near transition", "2026-10-25 12:30:00", Date.UTC(2026, 9, 25, 1), -120, -60, -60],
  ] as const) {
    void test(`${role} refuses ${label} rather than guessing a local parse`, () => {
      const scope = { ...SCOPE, createdAtLiteral: literal };
      assert.throws(() => fixture(role, scope, BASE, (epochMs) => epochMs < switchAt ? before : after, parseOffset).run(), /CURRENT_AGED_SQL_CLOCK_CONTROLS_REFUSED/u);
    });
  }
}
void test("an exactly 61000 ms aged head passes and 60999 ms refuses without moving the window", () => {
  const scope = { ...SCOPE, createdAtLiteral: "2026-10-12 11:59:01" }, value = input(0, 0, scope);
  assert.equal(compareCurrentAgedSqlClock(value).minimumAgeMs, 61_000);
  value.plannedBackendWindow.notBeforeMs -= 1; value.plannedBackendWindow.notAfterMs -= 1;
  const before = { ...value.plannedBackendWindow };
  assert.throws(() => compareCurrentAgedSqlClock(value), /CURRENT_AGED_SQL_CLOCK_REFUSED/u); assert.deepEqual(value.plannedBackendWindow, before);
});
const changes: readonly [string, (value: ReturnType<typeof input>) => void][] = [
  ["old profile", (value) => { mutableControls(value.renderer)["profile"] = "private.clock-controls.v1"; }],
  ["asserted authority", (value) => { mutableControls(value.renderer)["producerBindingVerified"] = true; }],
  ["mismatched exact literal", (value) => { value.scope = { ...SCOPE, createdAtLiteral: "2026-01-15 12:34:55" }; }],
  ["reference window", (value) => { value.mainReferenceNativeClock.before = native(BASE + 1, 0); }],
  ["renderer window", (value) => { value.rendererNativeClock.after = native(BASE + 1001, 0); }],
  ["timezone-rule drift", (value) => { value.rendererNativeClock.before["zoneRulesSha256"] = "b".repeat(64); value.rendererNativeClock.after["zoneRulesSha256"] = "b".repeat(64); }],
  ["native current offset sign", (value) => { value.rendererNativeClock.before["localOffsetMinutes"] = 60; }],
  ["backend interval longer than 60000 ms", (value) => { value.plannedBackendWindow.notAfterMs += 1; }],
  ["backend starts before collection ends", (value) => { value.plannedBackendWindow.notBeforeMs = BASE + 1100; }],
  ["native reference ordered after renderer", (value) => { value.mainReferenceNativeClock.after = native(BASE + 999, 0); }],
];
for (const [label, change] of changes) {
  void test(`current relation refuses ${label}`, () => {
    const value = structuredClone(input()); change(value);
    assert.throws(() => compareCurrentAgedSqlClock(value), /(?:CURRENT_AGED_SQL_CLOCK(?:_CONTROLS)?|CLOCK_CONTROLS|RENDERER_CLOCK_ENDPOINTS)_REFUSED/u);
  });
}
void test("missing, extra, accessor, changed and sparse candidate scans refuse without invoking accessors", () => {
  const result = fixture("renderer").run(); let getterCalls = 0;
  for (const change of [
    (offsets: number[]): void => { offsets.pop(); },
    (offsets: number[]): void => { offsets.push(0); },
    (offsets: number[]): void => { Object.defineProperty(offsets, "10", { get(): number { getterCalls += 1; return 0; } }); },
    (offsets: number[]): void => { offsets[10] = 60; },
    (offsets: number[]): void => { Reflect.deleteProperty(offsets, "10"); },
  ]) {
    const offsets = [...result.scanBefore.offsets]; change(offsets);
    const value = { ...result, scanBefore: { ...result.scanBefore, offsets } };
    assert.throws(() => validateCurrentAgedSqlClockControls(value, SCOPE, "renderer"), /CURRENT_AGED_SQL_CLOCK_CONTROLS_REFUSED/u);
  }
  assert.equal(getterCalls, 0);
});
void test("the fixed collector refuses a retained native Date method replacement", () => {
  const value = fixture("renderer"); let reads = 0;
  value.onCall = (name): void => { if (name === "getTime") { reads += 1; if (reads === 30) { value.methods["getTime"] = (): number => BASE; } } };
  assert.throws(() => value.run(), /CURRENT_AGED_SQL_CLOCK_CONTROLS_REFUSED/u); assert.equal(reads, 30);
});
for (const role of ["renderer", "main-reference"] as const) {
  void test(`${role} context drift during the candidate scan refuses at that native boundary`, () => {
    const value = fixture(role); let reads = 0;
    value.onCall = (name): void => {
      if (name === "getTime") {
        reads += 1;
        if (reads === 30) {
          if (role === "renderer") { value.sandbox["gVars"] = {}; }
          else { Object.defineProperty(value.env, "TZ", { value: "UTC" }); }
        }
      }
    };
    assert.throws(() => value.run(), /CURRENT_AGED_SQL_CLOCK_CONTROLS_REFUSED/u); assert.equal(reads, 30);
  });
}
void test("scratch reference rejects inherited TZ and input accessors grant no authority", () => {
  const value = fixture("main-reference"); Object.defineProperty(value.env, "TZ", { value: "UTC" });
  assert.throws(() => value.run(), /CURRENT_AGED_SQL_CLOCK_CONTROLS_REFUSED/u);
  const supplied = input(); let reads = 0;
  Object.defineProperty(supplied, "renderer", { get(): never { reads += 1; throw new Error("private"); } });
  assert.throws(() => compareCurrentAgedSqlClock(supplied), /CLOCK_CONTROLS_REFUSED/u); assert.equal(reads, 0);
});

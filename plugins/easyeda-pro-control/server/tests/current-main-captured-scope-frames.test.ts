// oxlint-disable max-classes-per-file, typescript/no-extraneous-class -- Distinct inert constructors provide the independent prototype identities required by the real capture and request programs; no application is instantiated.
/** These inert captures use the real readonly capture/consumer programs and
 * native Node util/date values. They have no original facade provenance, app,
 * SQLite connection, clock invocation, native process or resume authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import util from "node:util";
import { runInThisContext } from "node:vm";
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as FRAMES, CURRENT_MAIN_CAPTURED_SCOPE_FRAME_ROLES as ROLES } from "../src/current-main-captured-scope-frames.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_SITES as BEGIN, CURRENT_PCB_VIA_MAIN_BEGIN_RUN_EXPRESSION as BEGIN_RUN } from "../src/current-pcb-via-main-begin-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_SITES as HISTORY, CURRENT_PCB_VIA_MAIN_HISTORY_CALLERS as HISTORY_CALLERS } from "../src/current-pcb-via-main-history-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_REQUEST_CALLS as REQUEST } from "../src/current-selected-file-main-request-programs.ts";

/** A checked fixed function receives no caller program or runtime grant. */
function callable(value: unknown): value is (...args: unknown[]) => unknown { return typeof value === "function"; }
/** Execute only reviewed fixed production programs in this isolated test realm. */
function call(program: string, receiver: unknown, args: readonly unknown[]): unknown { const fn: unknown = runInThisContext(`(${program})`); assert.equal(typeof fn, "function"); if (!callable(fn)) { throw new TypeError("fixed test function"); } return Reflect.apply(fn, receiver, args); }
/** A fake sqlite graph is fixture data, with genuine original capture v2 shape. */
function capture(): Readonly<{ value: unknown[]; sqlite: object }> {
  class Wrapper { public db: object = {}; }
  class Sql {}
  class Database {}
  class Statement {}
  const sqlite = { Database, Statement }; const initial = [Wrapper, Sql, sqlite, util]; const result = call(CAPTURE, initial, [String.raw`C:\Synthetic\capture.eprj2`]); assert.ok(Array.isArray(result)); return { value: result, sqlite };
}
/** Build reviewed operands from the table, preserving every unrelated value. */
// oxlint-disable-next-line typescript/unbound-method -- The original getTime value is compared by identity only; no method is invoked.
function original(role: typeof ROLES[number], sqlite: object): unknown[] { return FRAMES[role].originalExpression.slice(1, -1).split(",").map((operand, index) => { if (operand === "F5") { return util; } if (operand === "sc") { return sqlite; } if (operand === "Date") { return Date; } if (operand === "Date.now") { return Date.now; } if (operand === "Date.prototype") { return Date.prototype; } if (operand === "Date.prototype.getTime") { return Date.prototype.getTime; } return index === 0 ? -0 : { operand, index }; }); }
void test("ten fixed F5-free frames reproduce every legacy operand and reach the unchanged real driver consumer", () => {
  const fixture = capture(); assert.equal(ROLES.length, 10); assert.equal(FRAMES.beginCallback.originalExpression, BEGIN.callback.expression); assert.equal(FRAMES.beginRun.originalExpression, BEGIN_RUN); assert.equal(FRAMES.historyCallback.originalExpression, HISTORY.sqlCallback.expression); assert.equal(FRAMES.historyRun.originalExpression, HISTORY_CALLERS.sqlRun.expression);
  for (const role of ROLES) { const row = FRAMES[role]; assert.ok(!/\bF5\b/u.test(row.rawExpression)); const expected = original(role, fixture.sqlite), raw = expected.filter((_value, index) => index !== row.utilIndex); const normalized = call(row.program, raw, [fixture.value]); assert.ok(Array.isArray(normalized)); assert.equal(normalized.length, row.legacySize); for (const [index, value] of expected.entries()) { assert.equal(Object.is(normalized[index], value), true, role); } assert.equal(Object.is(normalized[0], -0), true); }
  class FetchWrapper {}
  class LegacyWrapper { public req = { method: "GET" }; public pureUrl = "/api/v4/project/read"; public pureQuery = ""; public _headers = {}; }
  const expected = [null, new LegacyWrapper(), {}, fixture.sqlite, util, FetchWrapper, LegacyWrapper]; const normalized = call(FRAMES.driver.program, expected.filter((_value, index) => index !== 4), [fixture.value]); const selected = call(REQUEST.capture, normalized, [fixture.value]); const read = call(REQUEST.read, selected, []); assert.ok(read !== null && typeof read === "object" && "method" in read && "mode" in read); assert.equal(read.method, "GET"); assert.equal(read.mode, "legacy");
});
void test("genuine-capture proxy precedes raw traversal and hook-field6 drift cannot execute a caller replacement", () => {
  const fixture = capture(); const row = FRAMES.driver; const expected = original("driver", fixture.sqlite); const raw = expected.filter((_value, index) => index !== row.utilIndex); let getters = 0, hooks = 0, traps = 0;
  const proxy = new Proxy(raw, { getOwnPropertyDescriptor: (): never => { traps += 1; throw new Error("raw descriptor"); }, getPrototypeOf: (): never => { traps += 1; throw new Error("raw prototype"); }, ownKeys: (): never => { traps += 1; throw new Error("raw keys"); } }); assert.throws(() => call(row.program, proxy, [fixture.value])); assert.equal(traps, 0);
  const saved = fixture.value[6]; fixture.value[6] = (): boolean => { hooks += 1; return false; }; assert.throws(() => call(row.program, proxy, [fixture.value])); assert.equal(hooks, 0); assert.equal(traps, 0); fixture.value[6] = saved;
  const accessor = [...raw]; Object.defineProperty(accessor, "1", { get: (): unknown => { getters += 1; return raw[1]; }, enumerable: true, configurable: true }); assert.throws(() => call(row.program, accessor, [fixture.value])); assert.equal(getters, 0);
  const nonArray = Object.fromEntries(raw.map((value, index) => [String(index), value])); nonArray["length"] = raw.length;
  for (const changed of [[...raw, "extra"], nonArray, [...raw.slice(0, 3), {}, ...raw.slice(4)], Object.assign([...raw], { unknown: true }), Object.assign([...raw], { [Symbol("extra")]: true })]) { assert.throws(() => call(row.program, changed, [fixture.value])); }
  const dateRow = FRAMES.registrationAfterExec; for (const index of [5, 6]) { const dateRaw = original("registrationAfterExec", fixture.sqlite).filter((_value, item) => item !== dateRow.utilIndex); dateRaw[index] = (): number => 0; assert.throws(() => call(dateRow.program, dateRaw, [fixture.value])); }
});

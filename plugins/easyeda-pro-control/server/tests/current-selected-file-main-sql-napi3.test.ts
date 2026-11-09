/** Normalized actual Linux N-API3 packets. Only opaque objectId labels change;
 * complete ordering/flags/values are retained. No Windows or owner grant. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { originalSourceErrorCode } from "../src/original-source-error.ts";
import { decodeCurrentSelectedFileMainSqlFenceNative as decode, currentSelectedFileMainSqlFenceNativeFailure as failure } from "../src/current-selected-file-main-sql-fence-replies.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_NAPI3_PROFILE as PROFILE, matchesCurrentSelectedFileMainSqlFenceNapi3 as matches, currentSelectedFileMainSqlFenceNativeShape as shape } from "../src/current-selected-file-main-sql-napi3-profile.ts";

function record(input: unknown): asserts input is Record<string, unknown> { assert.ok(input !== null && typeof input === "object" && !Array.isArray(input)); }
async function packet(role: "Database" | "Statement", variant: "caller-own" | "caller-absent" = "caller-own"): Promise<unknown> {
  const file = variant === "caller-own" ? "fixtures/current-selected-main-napi3-metadata.json" : "fixtures/current-selected-main-napi3-caller-absent-metadata.json";
  const hash = variant === "caller-own" ? "3aa749632e9119daade8939ffa0b5ff54232dbad41be6d01d3cefadd21459081" : "2a3739dbfac4fb1d4c4dd6fb9fe21f833825c6e96a20f147d908d96b25ec0dd7";
  const raw = await readFile(new URL(file, import.meta.url), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), hash);
  const packets: unknown = JSON.parse(raw); record(packets); return structuredClone(packets[role]);
}
function rows(input: unknown, key = "result"): unknown[] { record(input); const value = input[key]; assert.ok(Array.isArray(value)); return value; }
function field(input: unknown, index: number, key = "result"): Record<string, unknown> { const value: unknown = rows(input, key)[index]; record(value); return value; }
function member(input: Record<string, unknown>, key: string): Record<string, unknown> { const value = input[key]; record(value); return value; }

void test("complete source-derived N-API3 constructor packets match exactly, with payload and Windows proof remaining false", async () => {
  for (const role of ["Database", "Statement"] as const) {
    const original = await packet(role); assert.equal(matches(original, role), true); assert.doesNotThrow(() => { decode(original, role); });
    assert.equal(matches(original, role === "Database" ? "Statement" : "Database"), false);
    assert.equal(rows(original).length, role === "Database" ? 13 : 12);
    const callerAbsent = await packet(role, "caller-absent"); assert.equal(matches(callerAbsent, role), true); assert.doesNotThrow(() => { decode(callerAbsent, role); });
    assert.equal(rows(callerAbsent).length, role === "Database" ? 11 : 10);
  }
  assert.equal(PROFILE.externalPayloadIdentityProven, false); assert.equal(PROFILE.windowsAbiObserved, false); assert.equal(PROFILE.executionAuthorized, false);
});

void test("caller-own and caller-absent profiles require their entire fixed cores and reject mixed or partial variants", async () => {
  for (const key of ["arguments", "caller"]) {
    const partial = await packet("Database"); record(partial);
    partial["result"] = rows(partial).filter(value => { record(value); return value["name"] !== key; });
    assert.equal(matches(partial, "Database"), false); assert.throws(() => { decode(partial, "Database"); });
  }
  for (const mutate of [
    (input: unknown): void => { rows(input).pop(); },
    (input: unknown): void => { field(input, 3)["configurable"] = true; },
    (input: unknown): void => { field(input, 2)["writable"] = false; },
    (input: unknown): void => { member(field(input, 3), "symbol")["description"] = "Symbol(other)"; },
    (input: unknown): void => { member(field(input, 4), "symbol")["objectId"] = member(field(input, 3), "symbol")["objectId"]; },
  ]) {
    const original = await packet("Database", "caller-absent"); mutate(original);
    assert.equal(matches(original, "Database"), false); assert.throws(() => { decode(original, "Database"); });
  }
});

void test("malformed core fields, symbols, opaque values, flags, order, count and native scopes refuse with original bounded errors", async () => {
  const mutations: readonly ((input: unknown) => void)[] = [
    input => { rows(input).pop(); }, input => { rows(input).push(structuredClone(field(input, 5))); },
    input => { const list = rows(input); [list[0], list[1]] = [list[1], list[0]]; },
    input => { field(input, 5)["writable"] = true; }, input => { field(input, 5)["enumerable"] = true; }, input => { field(input, 5)["configurable"] = true; },
    input => { field(input, 5)["get"] = { type: "undefined" }; }, input => { delete field(input, 5)["symbol"]; },
    input => { member(field(input, 5), "symbol")["type"] = "string"; },
    input => { member(field(input, 6), "symbol")["objectId"] = member(field(input, 5), "symbol")["objectId"]; },
    input => { member(field(input, 6), "value")["objectId"] = member(field(input, 5), "value")["objectId"]; },
    input => { member(field(input, 5), "value")["className"] = "External"; },
    input => { member(field(input, 5), "value")["subtype"] = "proxy"; },
    input => { member(field(input, 2), "value")["value"] = true; }, input => { field(input, 4)["writable"] = false; },
    input => { member(field(input, 1), "value")["value"] = "Statement"; },
    input => { member(field(input, 1, "internalProperties"), "value")["description"] = "Scopes[1]"; },
    input => { rows(input, "internalProperties").push({ name: "[[FunctionLocation]]", value: {} }); },
  ];
  for (const mutate of mutations) {
    const original = await packet("Database"); mutate(original); assert.equal(matches(original, "Database"), false);
    let retained: unknown; try { decode(original, "Database"); } catch (error) { retained = error; }
    const code = failure(retained); assert.match(code ?? "", /^SELECTED_SQL_NATIVE_DATABASE_P\d{1,3}_[A-F\d]{16}$/u);
    assert.equal(originalSourceErrorCode(retained), `FOOTPRINT_MAIN_CONSTRUCTION_${String(code)}`);
  }
});

void test("the existing native three-field and proxy two-field profiles remain independent and strict", async () => {
  const original = await packet("Database"); record(original);
  original["result"] = rows(original).filter((_value, index) => [0, 1, 4].includes(index)); assert.doesNotThrow(() => { decode(original, "Database"); });
  const proxy = structuredClone(original); proxy["result"] = rows(proxy).filter((_value, index) => index < 2);
  member(field(proxy, 1), "value")["value"] = ""; assert.doesNotThrow(() => { decode(proxy, "proxy"); });
  field(original, 0)["writable"] = true; assert.throws(() => { decode(original, "Database"); });
  field(proxy, 0)["enumerable"] = true; assert.throws(() => { decode(proxy, "proxy"); });
});

void test("failure fingerprints exclude handles and unknown values; copied errors and accessors cannot issue codes", async () => {
  const first = await packet("Database"), second = await packet("Database");
  member(field(first, 5), "value")["objectId"] = "first_handle"; member(field(second, 5), "value")["objectId"] = "second_handle";
  assert.deepEqual(shape(first), shape(second));
  field(first, 5)["name"] = "PRIVATE_FIRST"; member(field(first, 5), "value")["description"] = String.raw`C:\Synthetic\first`;
  field(second, 5)["name"] = "PRIVATE_SECOND"; member(field(second, 5), "value")["description"] = String.raw`C:\Synthetic\second`;
  assert.deepEqual(shape(first), shape(second));
  let retained: unknown; try { decode(first, "Database"); } catch (error) { retained = error; }
  const code = failure(retained); assert.ok(code !== null); assert.equal(code.includes("PRIVATE"), false); assert.equal(code.includes("Synthetic"), false);
  assert.equal(failure(new Error(code)), null); assert.equal(failure(structuredClone(retained)), null);
  let calls = 0; const accessor = Object.defineProperty({}, "result", { enumerable: true, get: (): never => { calls += 1; throw new Error("getter"); } });
  assert.throws(() => { decode(accessor, "Database"); }); assert.equal(calls, 0);
  assert.equal(failure(new Proxy({}, { get: (): never => { calls += 1; throw new Error("getter"); } })), null); assert.equal(calls, 0);
});

/** Inert synthetic inspector packets only; no native owner or browser grants. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbViaSavedCacheMetadataLedger } from "../src/current-pcb-via-saved-cache-metadata-ledger.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS as HELPERS } from "../src/current-pcb-via-saved-cache-metadata-programs.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as CACHE } from "../src/current-native-cache-response-intrinsics.ts";
import { CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS as GETTERS } from "../src/current-native-request-metadata-intrinsics.ts";
import type { CurrentPcbViaSavedCacheMetadataCommand } from "../src/current-pcb-via-saved-cache-metadata-protocol.ts";
import type { CurrentNativeFunctionProfile } from "../src/current-native-function-metadata.ts";

const frame = Object.freeze({ sessionId: "original", uniqueContextId: "original-unique", executionContextId: 7, projectUuid: "a".repeat(64) });
const REQUEST = [{ index: 1, name: "Request", arity: 1, constructor: true }, { index: 2, name: "Headers", arity: 0, constructor: true }, { index: 3, name: "AbortSignal", arity: 0, constructor: true },
  ...GETTERS.map((name, index) => ({ index: 8 + index, name: `get ${name}`, arity: 0, constructor: false })),
  { index: 23, name: "get aborted", arity: 0, constructor: false }, { index: 24, name: "get reason", arity: 0, constructor: false }, { index: 25, name: "forEach", arity: 1, constructor: false }, { index: 26, name: "getSetCookie", arity: 0, constructor: false }];
const capture = (id: string, count: number): unknown => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId: id } });
function array(kind: string, count: number): unknown {
  const rows = Array.from({ length: count }, (_, index) => ({ name: String(index), writable: true, enumerable: true, configurable: true, isOwn: true,
    value: { type: index > 0 && index < 4 || index >= 8 ? "function" : "object", objectId: `${kind}-${String(index)}` } }));
  return { result: [...rows, { name: "length", writable: true, enumerable: false, configurable: false, isOwn: true, value: { type: "number", value: count } }],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array-prototype" } }] };
}
function native(profile: CurrentNativeFunctionProfile): unknown {
  const fields: unknown[] = [["name", profile.name], ["length", profile.arity]].map(([name, value]) => ({ name, value: { type: typeof value, value }, writable: false, configurable: true, enumerable: false, isOwn: true }));
  if (profile.constructor) { fields.push({ name: "prototype", writable: false, configurable: false, enumerable: false, isOwn: true, value: { type: "object", className: profile.name, description: profile.name, objectId: "prototype" } }); }
  return { result: fields, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", description: profile.name === "AbortSignal" ? "function EventTarget() { [native code] }" : "function () { [native code] }", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", className: "Array", subtype: "internal#scopeList", description: "Scopes[0]", objectId: "empty-native-scopes" } }] };
}
void test("metadata ledger qualifies all actual slots and twelve helper receipts before returning data-only snapshot", () => {
  const ledger = new CurrentPcbViaSavedCacheMetadataLedger(frame); let script = 0;
  const run = (command: CurrentPcbViaSavedCacheMetadataCommand, reply: unknown): void => {
    const plan = ledger.prepare(command); assert.throws(() => ledger.accept({ ...plan }, reply));
    if (plan.helper !== null) { script += 1; assert.equal(ledger.observeOriginalEvent({ method: "Debugger.scriptParsed", sessionId: frame.sessionId, params: { url: "", scriptId: `helper-${String(script)}`, executionContextId: 7 } }), true); }
    const packet = ledger.accept(plan, reply); ledger.requireOriginalPacket(packet); assert.throws(() => { ledger.requireOriginalPacket({ ...packet }); });
    if (plan.helper !== null) {
      assert.throws(() => ledger.prepare({ phase: "saved-cache-native-release" }));
      const occurrence = plan.helper === "observe" ? script - 9 : 0;
      const source = ledger.prepare({ phase: "saved-cache-native-helper-source", helper: plan.helper, occurrence });
      assert.deepEqual(source.params, { scriptId: `helper-${String(script)}` }); ledger.accept(source, { scriptSource: `(${HELPERS[plan.helper].program})` });
    }
  };
  for (const kind of ["cache-response", "request"] as const) {
    const profiles = kind === "cache-response" ? CACHE : REQUEST;
    const count = kind === "cache-response" ? 28 : 27;
    run({ phase: "saved-cache-native-constructors", kind }, capture(`${kind}-constructors`, 4));
    run({ phase: "saved-cache-native-references", kind, stage: "constructors" }, array(kind, 4));
    for (const profile of profiles.slice(0, 3)) { run({ phase: "saved-cache-native-function", kind, slot: profile.index }, native(profile)); }
    run({ phase: "saved-cache-native-members", kind }, capture(`${kind}-members`, count));
    run({ phase: "saved-cache-native-references", kind, stage: "members" }, array(kind, count));
    if (kind === "request") { run({ phase: "saved-cache-native-catalogue" }, { result: { type: "object", value: REQUEST } }); }
    for (const profile of profiles.slice(3)) { run({ phase: "saved-cache-native-function", kind, slot: profile.index }, native(profile)); }
    run({ phase: "saved-cache-native-reprove", kind }, { result: { type: "boolean", value: true } });
  }
  run({ phase: "saved-cache-native-bind" }, capture("original-state", 4));
  for (const round of ["backup", "verify"] as const) { for (const ordinal of [0, 1] as const) {
    run({ phase: "saved-cache-native-observe", round, ordinal }, { result: { type: "object", value: { schema: "private.pcb-via-saved-cache-metadata.v1", ordinal, existed: false, requestGetterNames: GETTERS, entries: [], completeNativeFetchMetadataCaptured: true, executionAuthorized: false } } });
  } }
  const snapshot = ledger.snapshot(); ledger.requireOriginalSnapshot(snapshot); assert.throws(() => { ledger.requireOriginalSnapshot({ ...snapshot }); });
  assert.equal(ledger.status().sourceReceipts, 12); assert.equal(snapshot.nativeOwnershipVerified, false); assert.equal(snapshot.deletionAuthorized, false); assert.equal(snapshot.rounds.verify.length, 2);
});
void test("metadata source drift and missing constructor qualification refuse before member/getter invocation", () => {
  const ledger = new CurrentPcbViaSavedCacheMetadataLedger(frame);
  assert.throws(() => ledger.prepare({ phase: "saved-cache-native-members", kind: "cache-response" }));
  const plan = ledger.prepare({ phase: "saved-cache-native-constructors", kind: "cache-response" }); ledger.accept(plan, capture("original", 4));
  assert.throws(() => ledger.prepare({ phase: "saved-cache-native-helper-source", helper: "cache-constructors", occurrence: 0 }));
  ledger.observeOriginalEvent({ method: "Debugger.scriptParsed", sessionId: frame.sessionId, params: { url: "", scriptId: "actual-helper", executionContextId: 7 } });
  const source = ledger.prepare({ phase: "saved-cache-native-helper-source", helper: "cache-constructors", occurrence: 0 });
  assert.throws(() => ledger.accept(source, { scriptSource: "(function(){})" })); assert.equal(ledger.status().failed, true);
  assert.throws(() => ledger.prepare({ phase: "saved-cache-native-members", kind: "cache-response" }));
});

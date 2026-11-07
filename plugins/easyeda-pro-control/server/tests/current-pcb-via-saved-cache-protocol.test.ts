import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_VIA_SAVED_CACHE_KEY_STEPS as KEYS, CURRENT_PCB_VIA_SAVED_CACHE_NAME_STEPS as NAMES,
  CURRENT_PCB_VIA_SAVED_CACHE_REQUESTS as REQUESTS, CURRENT_PCB_VIA_SAVED_CACHE_ROUNDS as ROUNDS,
  currentPcbViaSavedCacheNativeRequest, validateCurrentPcbViaSavedCacheCommand } from "../src/current-pcb-via-saved-cache-protocol.ts";

void test("finite saved-cache wire never accepts caller frame/storage/cache/request selectors", () => {
  const allowed = [ ...KEYS.map(step => ({ phase: "saved-cache-key", step })), ...NAMES.map(step => ({ phase: "saved-cache-names", step })),
    ...ROUNDS.flatMap(round => [0, 1].map(ordinal => ({ phase: "saved-cache-entries", round, ordinal }))),
    ...ROUNDS.flatMap(round => [0, 1].flatMap(ordinal => Array.from({ length: 8 }, (_, entryIndex) => ({ phase: "saved-cache-body", round, ordinal, entryIndex })))),
    ...[0, 1].map(ordinal => ({ phase: "saved-cache-delete", ordinal })), { phase: "saved-cache-track" }, { phase: "saved-cache-untrack" } ];
  for (const input of allowed) {
    const command = validateCurrentPcbViaSavedCacheCommand(input), wire = currentPcbViaSavedCacheNativeRequest(command);
    assert.equal(wire["savedCachePhase"], input.phase);
    for (const key of ["cacheId", "storageKey", "securityOrigin", "storageBucket", "frameId", "requestURL", "requestHeaders", "method", "params", "sessionId", "expression", "functionDeclaration"]) {
      assert.throws(() => validateCurrentPcbViaSavedCacheCommand({ ...input, [key]: "foreign" })); assert.equal(Object.hasOwn(wire, key), false);
    }
  }
  assert.equal(REQUESTS.normal, 35); assert.equal(REQUESTS.cleanup, 1); assert.equal(REQUESTS.total, 36);
  // The grammar has16 eligible body slots per round. The original ledger
  // Allows at most8 across the two exact namespaces in each round.
  assert.equal(allowed.length, REQUESTS.total + 16);
});
void test("unknown phases, unbounded slots, negative zero, proxies and accessors cannot select a native operation", () => {
  for (const input of [{ phase: "saved-cache-clear" }, { phase: "saved-cache-delete", ordinal: 2 }, { phase: "saved-cache-body", round: "backup", ordinal: 0, entryIndex: 8 },
    { phase: "saved-cache-body", round: "backup", ordinal: 0, entryIndex: -0 }, { phase: "saved-cache-entries", round: "backup", ordinal: 0, skipCount: 1 }]) { assert.throws(() => validateCurrentPcbViaSavedCacheCommand(input)); }
  let touched = false; const input = Object.defineProperty({}, "phase", { enumerable: true, get: (): string => { touched = true; return "saved-cache-track"; } });
  assert.throws(() => validateCurrentPcbViaSavedCacheCommand(input)); assert.equal(touched, false);
  assert.throws(() => validateCurrentPcbViaSavedCacheCommand(new Proxy({ phase: "saved-cache-track" }, {})));
});

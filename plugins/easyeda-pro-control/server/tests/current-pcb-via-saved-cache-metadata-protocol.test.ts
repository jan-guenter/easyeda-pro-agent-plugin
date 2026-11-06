import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbViaSavedCacheMetadataMethod, currentPcbViaSavedCacheMetadataNativeRequest,
  validateCurrentPcbViaSavedCacheMetadataCommand } from "../src/current-pcb-via-saved-cache-metadata-protocol.ts";

void test("metadata wire has only fixed roles/slots and never caller realm/object/source selectors", () => {
  const inputs = [{ phase: "saved-cache-native-constructors", kind: "cache-response" }, { phase: "saved-cache-native-members", kind: "request" },
    { phase: "saved-cache-native-references", kind: "cache-response", stage: "members" }, { phase: "saved-cache-native-function", kind: "request", slot: 31 },
    { phase: "saved-cache-native-catalogue" }, { phase: "saved-cache-native-reprove", kind: "request" }, { phase: "saved-cache-native-bind" },
    { phase: "saved-cache-native-observe", ordinal: 1, round: "verify" }, { phase: "saved-cache-native-helper-source", helper: "observe", occurrence: 3 }, { phase: "saved-cache-native-release" }];
  for (const input of inputs) {
    const command = validateCurrentPcbViaSavedCacheMetadataCommand(input), wire = currentPcbViaSavedCacheMetadataNativeRequest(command);
    assert.equal(wire["savedCacheMetadataPhase"], input.phase); assert.ok(currentPcbViaSavedCacheMetadataMethod(command).includes("."));
    for (const key of ["method", "params", "uniqueContextId", "executionContextId", "objectId", "scriptId", "functionDeclaration", "expression", "arguments", "projectUuid", "cacheName", "sessionId"]) {
      assert.throws(() => validateCurrentPcbViaSavedCacheMetadataCommand({ ...input, [key]: "foreign" })); assert.equal(Object.hasOwn(wire, key), false);
    }
  }
});
void test("non-function slots, unsupported roles and excess helper emissions refuse before native selection", () => {
  for (const input of [{ phase: "saved-cache-native-function", kind: "cache-response", slot: 4 }, { phase: "saved-cache-native-function", kind: "cache-response", slot: 28 },
    { phase: "saved-cache-native-function", kind: "request", slot: 32 }, { phase: "saved-cache-native-helper-source", helper: "bind", occurrence: 1 },
    { phase: "saved-cache-native-helper-source", helper: "observe", occurrence: 4 }, { phase: "saved-cache-native-constructors", kind: "foreign" }, { phase: "saved-cache-native-observe", ordinal: 1, round: "backup", cacheName: "peer" }]) {
    assert.throws(() => validateCurrentPcbViaSavedCacheMetadataCommand(input));
  }
});

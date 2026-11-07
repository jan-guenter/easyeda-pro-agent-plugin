/** Shared storage encoder, retaining each original closed namespace. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { currentFootprintInverseUiOwnDataCases } from "../src/current-footprint-inverse-ui-own-data-protocol.ts";
import { currentFootprintInverseOwnDataCases } from "../src/current-footprint-inverse-own-data-protocol.ts";
import { currentFootprintInverseLookupPreentryCases } from "../src/current-footprint-inverse-lookup-preentry-protocol.ts";
import { currentFootprintInverseFixedCodecNativeMethod, currentFootprintInverseFixedCodecNativeSource } from "../src/current-footprint-inverse-fixed-codec-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_CALLS as INTRINSIC, currentFootprintInverseGetIntrinsicsCases, currentFootprintInverseGetIntrinsicsTemplate, validateCurrentFootprintInverseGetIntrinsicsCommand } from "../src/current-footprint-inverse-get-intrinsics-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_RPC_ENTRY_CALLS as RPC, currentFootprintInverseGetRpcEntryCases, currentFootprintInverseGetRpcEntryTemplate, validateCurrentFootprintInverseGetRpcEntryCommand } from "../src/current-footprint-inverse-get-rpc-entry-protocol.ts";

void test("both original fixed tables retain golden wire bytes while sibling grammars and namespace swaps refuse", () => {
  const digest = createHash("sha256");
  for (const command of currentFootprintInverseGetIntrinsicsCases()) { const row = currentFootprintInverseGetIntrinsicsTemplate(command); let text = row.template; if (command.method === "Runtime.callFunctionOn") { text = text.replace(JSON.stringify(`__get_intrinsics_program_${command.role}__`), JSON.stringify(INTRINSIC[command.role].program)); } for (const name of row.names) { text = text.replace(JSON.stringify(`__get_intrinsics_${name}__`), JSON.stringify("original_ref")); } assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params }); digest.update(`${text}\0`); assert.throws(() => validateCurrentFootprintInverseGetRpcEntryCommand(command)); }
  for (const command of currentFootprintInverseGetRpcEntryCases()) { const row = currentFootprintInverseGetRpcEntryTemplate(command); let text = row.template; if (command.method === "Runtime.callFunctionOn") { text = text.replace(JSON.stringify(`__get_rpc_entry_program_${command.role}__`), JSON.stringify(RPC[command.role].program)); } const targets = new Map([["projectUuid", "a".repeat(64)], ["branchUuid", "b".repeat(32)], ["documentUuid", "c".repeat(16)]]); for (const name of row.names) { text = text.replace(JSON.stringify(`__get_rpc_entry_${name}__`), JSON.stringify(targets.get(name) ?? "original_ref")); } assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params }); digest.update(`${text}\0`); assert.throws(() => validateCurrentFootprintInverseGetIntrinsicsCommand(command)); }
  assert.equal(digest.digest("hex"), "c325c40bb83ec4cef0788da951012cebfaa7d7f91dfc9c1884754a82e4d0e68a");
  const native = currentFootprintInverseFixedCodecNativeSource(); assert.ok(native.includes("fields.Count!=names.Length") && native.includes("GetByteCount(text)>65536") && native.includes("InverseDeleteBindingHandle"));
  assert.throws(() => currentFootprintInverseFixedCodecNativeMethod("FootprintInverseGetIntrinsicsMessage", "InverseGetRpcEntryRows", "inverse-get-rpc-entry-", "get_rpc_entry_"));
  assert.throws(() => currentFootprintInverseFixedCodecNativeMethod("FootprintInverseGetRpcEntryMessage", "InverseGetIntrinsicsRows", "inverse-get-intrinsics-", "get_intrinsics_"));
});

void test("the three newly shared renderers preserve all 66 retained pre-factor C# wire hashes", () => {
  const hashes: string[] = [];
  for (const cases of [currentFootprintInverseUiOwnDataCases(), currentFootprintInverseOwnDataCases(), currentFootprintInverseLookupPreentryCases()]) {
    for (const command of cases) { hashes.push(createHash("sha256").update(`${JSON.stringify({ id: 79, method: command.method, params: command.params, sessionId: "original_ui" })}\0`).digest("hex")); }
  }
  assert.equal(hashes.length, 66);
  assert.equal(createHash("sha256").update(hashes.join("\n")).digest("hex"), "73ea7f65fdaf536a5563794f60a5d2f87444b5004351096d9b2099205f6f6a21");
});

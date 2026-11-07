/** Shared storage encoder, retaining each original closed namespace. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
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

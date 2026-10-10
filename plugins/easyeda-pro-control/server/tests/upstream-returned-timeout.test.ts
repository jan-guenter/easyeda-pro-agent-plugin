import assert from "node:assert/strict";
import { test } from "node:test";
import { assertUpstreamReplySettled } from "../src/core.ts";
import { UpstreamEasyedaClient } from "../src/upstream.ts";

void test("only bounded bridge and exact lifecycle deadlines imply unsettled native execution", () => {
  for (const result of [
    { structuredContent: { ok: false, error: 'Bridge method "api.execute" timed out after 60000ms' } },
    { isError: true, structuredContent: { errorCode: "BRIDGE_TIMEOUT", message: "PRIVATE" } },
    { content: [{ type: "text", text: JSON.stringify({ ok: false, result: { error: { code: "TIMEOUT", message: "PRIVATE" } } }) }] },
  ]) {
    assert.throws(() => { assertUpstreamReplySettled(result); }, {
      message: "The upstream bridge timed out without proving native execution ended [bridge-timeout;execution-unsettled].",
    });
  }
  for (const code of ["NATIVE_LIFECYCLE_CLOSE_TIMEOUT", "NATIVE_LIFECYCLE_OPEN_TIMEOUT"]) {
    for (const result of [
      { structuredContent: { ok: false, error: code } },
      { content: [{ type: "text", text: JSON.stringify({ ok: false, result: { error: { code: "EASYEDA_API_ERROR", message: code } } }) }] },
    ]) { assert.throws(() => { assertUpstreamReplySettled(result); }, /native-lifecycle-timeout;execution-unsettled/u); }
  }
  for (const result of [
    { structuredContent: { ok: true, result: { done: true } } },
    { structuredContent: { ok: false, error: "LIBRARY_METADATA_MISSING" } },
    { structuredContent: { ok: false, error: "Private timeout words are not a trusted completion classification" } },
    { structuredContent: { ok: false, error: 'Bridge method "api.execute" timed out after 60000ms PRIVATE' } },
    { structuredContent: { ok: false, error: "NATIVE_LIFECYCLE_OPEN_TIMEOUT PRIVATE" } },
    { structuredContent: { ok: false, error: "Error: NATIVE_LIFECYCLE_CLOSE_TIMEOUT" } },
    { structuredContent: { ok: false, error: "NATIVE_LIFECYCLE_UNKNOWN_TIMEOUT" } },
  ]) { assert.doesNotThrow(() => { assertUpstreamReplySettled(result); }); }
});

void test("ordinary MCP timeout reply quarantines the authenticated dispatch scope without a second call", async () => {
  for (const error of ['Bridge method "api.execute" timed out after 60000ms', "NATIVE_LIFECYCLE_CLOSE_TIMEOUT", "NATIVE_LIFECYCLE_OPEN_TIMEOUT", undefined]) {
    const timedOut = error !== undefined;
    const events: string[] = [];
    const binding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", begunAtEpochMs: 110,
      bindingReceipt: "B".repeat(43), gatewayInstanceId: "G".repeat(43), leaseId: "L".repeat(43), sessionId: "S".repeat(43), sessionSequence: 1 };
    const result = { content: [], structuredContent: timedOut ? { ok: false, error } : { ok: true, result: 1 } };
    const upstream = new UpstreamEasyedaClient();
    // Fixed in-memory transport and gateway: no network, owner or native process.
    Object.defineProperties(upstream, {
      client: { value: { callTool: (): Promise<unknown> => { events.push("call"); return Promise.resolve(result); } } },
      assertStartupAuthorityCurrent: { value: (): Promise<void> => Promise.resolve() },
      bridgeGateway: { value: {
        lifecycle: (): unknown => ({ gatewayInstanceId: binding.gatewayInstanceId, activeSession: { sessionId: binding.sessionId } }),
        beginDispatchLease: (): unknown => binding,
        assertDispatchLeaseForCall: (): void => { events.push("bound"); },
        abortDispatchLease: (_binding: unknown, outcome: string): void => { events.push(outcome); },
        endDispatchLease: (): void => { events.push("end"); },
      } },
    });
    const call = upstream.withAuthenticatedBridgeDispatchScope(() => upstream.callTool("easyeda_execute", {}));
    if (timedOut) { await assert.rejects(call, /execution-unsettled/u); }
    else { assert.deepEqual(await call, result); }
    assert.deepEqual(events, ["bound", "call", timedOut ? "ambiguous-after-dispatch" : "end"]);
  }
});

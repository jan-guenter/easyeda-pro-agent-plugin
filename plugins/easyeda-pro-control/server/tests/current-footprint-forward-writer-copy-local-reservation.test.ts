/** Actual bounded framing/private reservation map with an explicitly synthetic
 * original Main maximum-plan getter. No owner or writer authority is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { requireCurrentFootprintForwardWriterCopyLocalReservation, reserveCurrentFootprintForwardWriterCopyLocal } from "../src/current-footprint-forward-writer-copy-local-reservation.ts";
import { CurrentFootprintForwardWriterNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";

async function fixture(body = "original source body"): Promise<Readonly<{
  request: Parameters<typeof reserveCurrentFootprintForwardWriterCopyLocal>[0]; state: { consumed: boolean; reads: number };
  reserve: typeof reserveCurrentFootprintForwardWriterCopyLocal; require: typeof requireCurrentFootprintForwardWriterCopyLocalReservation;
}>> {
  const request = Object.freeze({ profile: "private.current-footprint-forward-writer-main-request-reservation.v1" as const,
    maximumDataStrBytes: Buffer.byteLength(body), originalCopyPlanRetained: true as const, exactMaximumEscapedEnvelopeReserved: true as const, nativeAllocationQualified: false as const, executionAuthorized: false as const });
  const state = { consumed: false, reads: 0 };
  const url = new URL("../src/current-footprint-forward-writer-copy-local-reservation.ts", import.meta.url); const actualRequire = createRequire(url), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-forward-writer-main-request-plan.ts") { return {
      requireCurrentFootprintForwardWriterMainRequestReservation: (value: unknown): object => {
        assert.equal(value, request); assert.equal(state.consumed, false); state.reads += 1;
        return Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), projectKey: "a".repeat(64), path: "synthetic", dataStr: body });
      },
    }; } return actualRequire(name) as unknown;
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The exact data-only reservation source runs with the explicitly synthetic original Main getter above; its own map/framing remain unchanged.
  const api = loaded.exports as { reserveCurrentFootprintForwardWriterCopyLocal: typeof reserveCurrentFootprintForwardWriterCopyLocal; requireCurrentFootprintForwardWriterCopyLocalReservation: typeof requireCurrentFootprintForwardWriterCopyLocalReservation };
  return { request, state, reserve: api.reserveCurrentFootprintForwardWriterCopyLocal, require: api.requireCurrentFootprintForwardWriterCopyLocalReservation };
}
void test("full local framing reserves21 commands and retains only its exact original maximum-plan reference after Main consumes it", async () => {
  const f = await fixture(); const token = f.reserve(f.request);
  assert.equal(token.commands, 21); assert.ok(token.maximumInspectorBytes <= 16_384 && token.maximumInspectorBytes > 1000); assert.equal(token.executionAuthorized, false);
  f.state.consumed = true; const original = f.require(token, f.request); assert.equal(original.maximumBodyBytes, Buffer.byteLength("original source body")); assert.equal(f.state.reads, 1);
  assert.throws(() => f.require(structuredClone(token), f.request)); assert.throws(() => f.require(new Proxy(token, {}), f.request)); assert.throws(() => f.require(token, { ...f.request }));
  assert.equal(f.state.reads, 1); assert.throws(() => f.reserve(f.request));
});
void test("the fixed inspector envelope refuses excessive escaped body cost before any native dispatch", async () => {
  const f = await fixture('"\\\u0001'.repeat(2400));
  assert.throws(() => f.reserve(f.request), /(?:ENVELOPE_RESERVATION|BODY_CAPACITY)/u); assert.equal(f.state.reads, 1);
});
void test("source-shaped full owners cannot enter local preparation or call supplied input getters", async () => {
  const owner: unknown = Object.create(CurrentFootprintForwardWriterNativeOwner.prototype); let calls = 0;
  const input = Object.defineProperty({}, "main", { enumerable: true, get: (): never => { calls += 1; throw new Error("caller getter"); } });
  const candidate: unknown = Reflect.get(CurrentFootprintForwardWriterNativeOwner.prototype, "prepareFootprintForwardWriterCopyLocal"); assert.ok(typeof candidate === "function");
  await assert.rejects(async (): Promise<void> => { await Reflect.apply(candidate, owner, [input]); }); assert.equal(calls, 0);
});

/** Inert fixed-template reservations; these inputs create no original native owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintInverseInitialCacheTemplates } from "../src/current-footprint-inverse-initial-cache-wire.ts";
import { currentFootprintInverseInitialSyncTemplates } from "../src/current-footprint-inverse-initial-sync-wire.ts";
import { currentFootprintForwardWriterCopyLocalTemplates, requireCurrentFootprintForwardWriterCopyLocalBodyCapacity } from "../src/current-footprint-forward-writer-copy-local-wire.ts";

const binding = Object.freeze({ id: "a".repeat(32), helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 1234, rootCreated: "123456789012345678", requestId: 1 });
void test("forward cache/sync 8192-byte bodies and JSON escaping fit the existing physical envelope", () => {
  for (const [action, rows] of [["footprint-forward-initial-cache-send", currentFootprintInverseInitialCacheTemplates()], ["footprint-forward-initial-sync-send", currentFootprintInverseInitialSyncTemplates()]] as const) {
    const bodies = rows.filter(row => row.fields.includes("body")); assert.ok(bodies.length > 0);
    for (const row of bodies) {
      for (const body of ["a".repeat(5000), "a".repeat(8192), '"\\'.repeat(4096)]) {
        assert.ok(Buffer.byteLength(body) <= 8192);
        const line = JSON.stringify({ ...binding, action, phase: row.phase, method: row.method, ...row.values, body });
        assert.ok(line.length > 4096); assert.ok(Buffer.byteLength(line) <= 32_768);
      }
    }
  }
});
void test("both actual copy-local body templates and precreate control fit the same physical envelope", () => {
  const rows = currentFootprintForwardWriterCopyLocalTemplates().filter(row => row.fields.includes("body")); assert.equal(rows.length, 2);
  for (const body of ["a".repeat(5000), '"\\'.repeat(2500)]) {
    assert.doesNotThrow(() => requireCurrentFootprintForwardWriterCopyLocalBodyCapacity(body));
    for (const row of rows) {
      const line = JSON.stringify({ ...binding, action: "footprint-forward-copy-local", phase: row.phase, method: row.method, ...row.values, body });
      assert.ok(line.length > 4096); assert.ok(Buffer.byteLength(line) <= 32_768);
    }
    const line = JSON.stringify({ ...binding, action: "footprint-forward-copy-tail-control", operation: "precreate-body", body });
    assert.ok(line.length > 4096); assert.ok(Buffer.byteLength(line) <= 32_768);
  }
  assert.throws(() => requireCurrentFootprintForwardWriterCopyLocalBodyCapacity("a".repeat(8193)));
});

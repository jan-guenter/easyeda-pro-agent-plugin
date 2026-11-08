/** Exact immutable codec storage. These checks create no native owner or grant. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_HELPERS as HELPERS } from "../src/current-footprint-inverse-get-worker-programs.ts";
import { currentFootprintInverseReferenceWorkerCodecNativeSource } from "../src/current-footprint-inverse-reference-worker-native-codec.ts";
import { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_PROGRAMS as PROGRAMS, currentFootprintInverseReferenceWorkerCases, currentFootprintInverseReferenceWorkerFrame, currentFootprintInverseReferenceWorkerTemplate, currentFootprintInverseReferenceWorkerWire } from "../src/current-footprint-inverse-reference-worker-protocol.ts";

const sha = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
void test("all packed reference-worker rows retain exact fixed programs and finite wire templates", () => {
  const source = currentFootprintInverseReferenceWorkerCodecNativeSource();
  assert.equal(currentFootprintInverseReferenceWorkerCodecNativeSource(), source);
  const loads = [...source.matchAll(/rows\.AddRange\(EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",(\d+),4\)\);/gu)];
  assert.ok(loads.length > 1); const rows: string[][] = [];
  for (const load of loads) {
    const packed = Buffer.from(load[1] ?? "", "base64");
    // oxlint-disable-next-line node/no-sync -- Exact immutable table decoding in a build-only test, with no native or app receiver.
    const raw = gunzipSync(packed);
    assert.equal(packed.toString("base64"), load[1]); assert.equal(sha(packed), load[4]); assert.equal(sha(raw), load[3]);
    assert.equal(raw.length, Number(load[2])); assert.ok(raw.length <= 60_000);
    const group = raw.toString("utf8").split("\0").map(row => row.split("\t")); assert.equal(group.length, Number(load[5]));
    for (const row of group) { assert.equal(row.length, 4); } rows.push(...group);
  }
  const programs = rows.filter(row => row[0] === "program"); assert.equal(programs.length, Object.keys(PROGRAMS).length);
  for (const [role, program] of Object.entries(PROGRAMS)) {
    const selected = programs.filter(row => row[1] === role); assert.equal(selected.length, 1);
    const encoded = selected[0]?.[3]; assert.ok(typeof encoded === "string");
    const shared = JSON.stringify(HELPERS).slice(1, -1); const expanded = encoded.replaceAll("__reference_worker_shared__", shared);
    const decoded: unknown = JSON.parse(expanded); assert.equal(decoded, program);
  }
  const cases = currentFootprintInverseReferenceWorkerCases(); assert.equal(cases.length, 126);
  const commands = rows.filter(row => row[0] !== "program"); assert.equal(commands.length, cases.length);
  for (const command of cases) {
    const expected = currentFootprintInverseReferenceWorkerTemplate(command), matches = commands.filter(row => row[0] === expected.key);
    assert.deepEqual(matches, [[expected.key, expected.method, expected.names.join(","), expected.template]]);
    const bytes = Buffer.from(`${JSON.stringify(currentFootprintInverseReferenceWorkerWire(command, 79, "original_worker"))}\0`);
    const fields = currentFootprintInverseReferenceWorkerFrame(bytes, command, "original_worker"); assert.equal(fields["action"], "footprint-inverse-reference-worker");
    assert.equal(fields["requestId"], 79); assert.throws(() => currentFootprintInverseReferenceWorkerFrame(bytes, command, "foreign_worker"));
  }
});

void test("reference native controls bind each actual bounded model graph and expose no consume verb", async () => {
  const { CURRENT_FOOTPRINT_INVERSE_REFERENCE_WORKER_CONTROL_REQUESTS: counts, currentFootprintInverseReferenceWorkerControl: control } = await import("../src/current-footprint-inverse-reference-worker-controls.ts");
  assert.equal(counts.total, 68); assert.equal(counts.held, 45);
  const actual = { phase: "bind", models: 2, node0: 63, node1: 1, node2: 0, node3: 0 };
  assert.equal(Object.isFrozen(control(actual)), true);
  for (const changed of [{ ...actual, models: 0 }, { ...actual, models: 5 }, { ...actual, node0: 64 }, { ...actual, node1: 0 }, { ...actual, node2: 1 }, { ...actual, node3: -1 }, { ...actual, nativeOwner: "copied" }, { phase: "consume" }, { phase: "ready", qualified: true }, { phase: "query", kind: "delete" }, { phase: "held", role: "outerFailure", breakpointId: "original_ref" }]) { assert.throws(() => control(changed)); }
  assert.equal(control({ phase: "held", role: "post-publish", breakpointId: "original_ref" }).requestId, 0);
  let effects = 0; assert.throws(() => control(Object.defineProperty({}, "phase", { get() { effects += 1; return "ready"; } }))); assert.equal(effects, 0);
});

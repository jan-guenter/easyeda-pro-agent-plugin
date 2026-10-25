import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_CASES as cases } from "../src/current-pcb-209-ratline-continuation-native-cases.ts";
import { currentPcb209RatlineContinuationNativeWire as encode } from "../src/current-pcb-209-ratline-continuation-native-wire.ts";
import { currentPcb209RatlineContinuationNativeSource } from "../src/current-pcb-209-ratline-continuation-native.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_CASES as heldCases } from "../src/current-pcb-209-ratline-native-cases.ts";
import { currentPcb209RatlineNativeWire as heldEncode } from "../src/current-pcb-209-ratline-native-wire.ts";

void test("fresh native syntax has 94 fixed cases and never admits subordinate evaluation or another child", () => {
  assert.equal(cases.length, 94); assert.equal(heldCases.length, 87);
  assert.equal(cases.some(entry => entry.phase === "relation-construction"), false);
  const counts = { pcb: 0, worker: 0, subordinate: 0 };
  for (const entry of cases) {
    counts[entry.role] += 1;
    const encoded = encode(entry.role, entry.command, 494);
    assert.equal(encoded.request["action"], "worker-startup-ratline-continuation");
    assert.equal(encoded.request["phase"], entry.phase); assert.equal(encoded.request["role"], entry.role);
    if (entry.role === "subordinate") {
      assert.ok(entry.phase.startsWith("bootstrap-") || entry.phase === "remove" || entry.phase === "resume");
      // A foreign launch role must fail at the old runtime boundary too.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately exercise the runtime role guard.
      assert.throws(() => heldEncode(entry.role as unknown as "worker", entry.command, 301));
    } else { assert.equal(heldEncode(entry.role, entry.command, 301).request["action"], "worker-startup-ratline"); }
    for (const patch of [{ extra: true }, { throwOnSideEffect: false }, { expression: "arbitrary" }]) {
      assert.throws(() => encode(entry.role, { ...entry.command, params: { ...entry.command.params, ...patch } }, 494));
    }
    if (entry.role === "worker" && !entry.phase.startsWith("bootstrap-") && entry.phase !== "remove" && entry.phase !== "resume") {
      assert.throws(() => encode("subordinate", entry.command, 494));
    }
  }
  assert.deepEqual(counts, { pcb: 39, worker: 47, subordinate: 8 });
});
void test("fresh C# table matches every exact command and omits private window/loader/navigation markers", () => {
  const source = currentPcb209RatlineContinuationNativeSource();
  const match = /string\[\] rows=Unpack\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})"\)/u.exec(source);
  assert.ok(match !== null && match[1] !== undefined && match[2] !== undefined && match[3] !== undefined);
  // oxlint-disable-next-line node/no-sync -- Bounded in-memory fixed build table; no file or application I/O.
  const bytes = gunzipSync(Buffer.from(match[1], "base64"));
  assert.equal(bytes.length, Number(match[2])); assert.equal(createHash("sha256").update(bytes).digest("hex"), match[3]);
  assert.deepEqual(bytes.toString("utf8").split("\0").map(row => row.split("\t")), cases.map(entry => {
    const wire = encode(entry.role, entry.command, 494);
    const { navigationPhase: _navigation, loaderPhase: _loader, windowPhase: _window, ...command } = { navigationPhase: undefined, loaderPhase: undefined, windowPhase: undefined, ...entry.command };
    return [entry.role, entry.phase, entry.command.method,
      Object.keys(wire.request).filter(key => !["action", "requestId", "method", "role", "phase"].includes(key)).join(","), JSON.stringify(command)];
  }));
  assert.equal(bytes.includes(Buffer.from('"navigationPhase"')), false); assert.equal(bytes.includes(Buffer.from('"loaderPhase"')), false);
  const bound = /MaximumEncodedBytes=(\d+);/u.exec(source)?.[1]; assert.ok(bound !== undefined);
  let maximum = 0;
  for (const entry of cases) {
    const raw: unknown = JSON.parse(JSON.stringify(entry.command).replaceAll(/__ratline209_([A-Za-z\d]+)__/gu,
      (_match: string, name: string): string => "x".repeat(name === "sessionId" ? 128 : 256)));
    const encoded = encode(entry.role, raw, 2_147_483_647);
    const { navigationPhase: _navigation, loaderPhase: _loader, windowPhase: _window, ...command } = { navigationPhase: undefined, loaderPhase: undefined, windowPhase: undefined, ...encoded.command };
    maximum = Math.max(maximum, Buffer.byteLength(`${JSON.stringify(command)}\0`));
  }
  assert.equal(maximum, Number(bound)); assert.ok(maximum <= 65_536);
});

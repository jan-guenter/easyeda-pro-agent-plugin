import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { deriveCurrentSchematicEndpointMembership } from "../src/current-schematic-endpoint-membership.ts";
import { CURRENT_SCHEMATIC_ELECTRICAL_READ_METHOD, currentSchematicElectricalObservationSchema } from "../src/current-schematic-page-electrical-read.ts";
import { buildCurrentSchematicPageReadProgram } from "../src/current-schematic-page-read-program.ts";
import { validateCurrentSchematicPageReadResult } from "../src/current-schematic-page-read.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { currentSchematicElectricalFixture } from "./helpers/current-schematic-electrical-fixture.ts";

function observed(): ReturnType<typeof currentSchematicElectricalObservationSchema.parse> {
  const fixture = currentSchematicElectricalFixture();
  for (const group of [fixture.wire, fixture.bus]) {
    const lines: unknown = group["lines"]; assert.ok(Array.isArray(lines));
    for (const line of lines) {
      const points: unknown = Reflect.get(line, "_points"); assert.ok(Array.isArray(points));
      assert.ok(typeof points[1] === "object" && points[1] !== null); Reflect.set(points[1], "y", -10);
    }
  }
  assert.ok(fixture.contactNodes[1]); fixture.contactNodes[1]["y"] = -10;
  const request = { target: fixture.target, operation: { method: CURRENT_SCHEMATIC_ELECTRICAL_READ_METHOD, arguments: {} } };
  const context = createContext({ ...fixture.scope, TextEncoder });
  runInContext("globalThis.window=globalThis;globalThis.top=globalThis;document.defaultView=globalThis;", context);
  const packet: unknown = runInContext(`(function(){${buildCurrentSchematicPageReadProgram(request)}})()`, context, { timeout: 1000 });
  const result = validateCurrentSchematicPageReadResult(request, decodeExactReadEnvelope(structuredClone(packet)));
  return currentSchematicElectricalObservationSchema.parse(result.value[0]);
}

void test("exact current raw observer geometry and contact Sets produce incidence without net, owner or writer authority", () => {
  const value = observed();
  const serialized = JSON.stringify(value);
  const proof = deriveCurrentSchematicEndpointMembership(serialized);
  assert.equal(proof.lineCount, 3); assert.equal(proof.pinCount, 2); assert.equal(proof.contacts.length, 3);
  assert.equal(proof.exactNativeGeometryAndContactMembershipAgree, true);
  assert.equal(proof.nativeCacheFreshnessVerified, false); assert.equal(proof.completeTopologyVerified, false);
  assert.equal(proof.originalNativeOwnerVerified, false); assert.equal(proof.writerAuthorized, false); assert.equal(proof.persistenceVerified, false);
  assert.deepEqual(proof.contacts[0]?.point, [0, -10]); assert.equal(proof.contacts[0]?.pinPrimitiveIds.length, 1);
  assert.equal(JSON.stringify(value), serialized); assert.ok(Object.isFrozen(proof.contacts));
});

void test("count-consistent stale contact coordinates and pin origins cannot qualify geometry", () => {
  const original = observed();
  for (const mutate of [(value: typeof original): void => { assert.ok(value.contacts[0]); value.contacts[0].point[0] = 9; },
    (value: typeof original): void => { const pin = value.components[0]?.pins[0]; assert.ok(pin); pin.origin[0] = 9; }]) {
    const value = structuredClone(original); mutate(value);
    assert.equal(currentSchematicElectricalObservationSchema.safeParse(value).success, true);
    assert.throws(() => deriveCurrentSchematicEndpointMembership(JSON.stringify(value)));
  }
});

void test("noninteger tolerance cases, degenerate or diagonal lines refuse and caller objects execute no traps", () => {
  const original = observed();
  for (const coordinates of [[[0.25, -10], [20, -10]], [[0, -10], [0, -10]], [[0, -10], [20, -30]]] as const) {
    const value = structuredClone(original);
    const line = value.groups[0]?.lines[0]; assert.ok(line);
    line.points = coordinates.map(pair => [pair[0], pair[1]]); assert.throws(() => deriveCurrentSchematicEndpointMembership(JSON.stringify(value)));
  }
  let traps = 0;
  const proxy = new Proxy({}, { get: (): never => { traps += 1; throw new Error("trap"); }, getPrototypeOf: (): never => { traps += 1; throw new Error("trap"); } });
  assert.throws(() => Reflect.apply(deriveCurrentSchematicEndpointMembership, undefined, [proxy])); assert.equal(traps, 0);
});

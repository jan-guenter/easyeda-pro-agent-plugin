/** Synthetic transport accounting and refusal. Real method metadata and fixed
 * selectors are tested separately; this grants no native execution evidence. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as DEPENDENCIES } from "../src/current-footprint-copy-dependency-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES as PROFILES } from "../src/current-footprint-copy-destination-profiles.ts";
import { CurrentFootprintCopyDestinationRunner } from "../src/current-footprint-copy-destination-runner.ts";
import type { CurrentFootprintCopyStatePacket } from "../src/current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_FIXTURE as DEPENDENCY_SOURCES } from "./helpers/current-footprint-copy-dependency-fixture.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_FIXTURE as SOURCES } from "./helpers/current-footprint-copy-destination-fixture.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
function array(dependency: boolean): Data {
  const profiles = dependency ? DEPENDENCIES : PROFILES, sources = dependency ? DEPENDENCY_SOURCES : SOURCES;
  const result = profiles.map((profile, index) => property(String(index), { type: "function", className: profile.async ? "AsyncFunction" : "Function",
    description: sources[index], objectId: `${dependency ? "dep" : "fn"}-${String(index)}` }, true, true));
  if (dependency) {
    result.push(...["JP", "Cache", "Cache"].map((className, index) => property(String(index + 53), { type: "object", className, objectId: `runtime-${String(index)}` }, true, true)));
  } else {
    for (let index = 28; index < 36; index += 1) { result.push(property(String(index), { type: index === 28 ? "function" : "object", objectId: `object-${String(index)}` }, true, true)); }
    for (const [index, value] of ["1".repeat(16), 7, "a".repeat(64), "b".repeat(32)].entries()) {
      result.push(property(String(index + 36), { type: typeof value, value }, true, true));
    }
  }
  result.push(property("length", { type: "number", value: dependency ? 56 : 40 }, true, false, false));
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-proto" } }] };
}
function metadata(index: number, head = false): Data {
  const profile = head ? DEPENDENCIES[39] : PROFILES[index]; assert.ok(profile !== undefined);
  const result = [property("name", { type: "string", value: profile.name }), property("length", { type: "number", value: profile.arity })];
  if (profile.kind === "function" && !profile.async) { result.push(property("prototype", { type: "object", objectId: "own-proto" }, true, false, false)); }
  return { result, internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "script", lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
    { name: "[[Prototype]]", value: { type: profile.async ? "object" : "function", objectId: "fn-proto" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: "scopes" } },
  ] };
}
const state: CurrentFootprintCopyStatePacket = Object.freeze({ profile: "private.current-footprint-copy-state.v1", samples: 2,
  identity: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "tab" }, client: "1".repeat(16), maximumTicket: 7,
  capturedUser: "own-undefined", originalConstructorManagerMatched: true, atomicSnapshotVerified: false,
  cacheBranchObserved: false, executionAuthorized: false, persistenceVerified: false });
void test("destination collector consumes36 reads and one fresh3-read reproof; copied ownership and reuse cannot dispatch", async () => {
  let count = 0;
  const runner = new CurrentFootprintCopyDestinationRunner(Object.freeze({ dependencyBundleObjectId: "dependencies", assertCurrent: (): void => {
    // Synthetic immutable owner; no connected state is claimed.
  }, properties: (objectId: string): Promise<unknown> => {
    count += 1;
    if (objectId === "dependencies" || objectId === "destinations") { return Promise.resolve(array(objectId === "dependencies")); }
    if (objectId === "dep-39") { return Promise.resolve(metadata(39, true)); }
    if (objectId === "scopes") { return Promise.resolve({ result: ["Closure", "Global"].map((description, index) => property(String(index),
      { type: "object", subtype: "internal#scope", className: "Object", description, objectId: `scope-${String(index)}` }, true, true)) }); }
    const index = Number(objectId.slice(3)); return Promise.resolve(metadata(index));
  }, capture: (): Promise<unknown> => { count += 1; return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(40)", objectId: "destinations" } }); },
  recheck: (): Promise<unknown> => { count += 1; return Promise.resolve({ result: { type: "boolean", value: true } }); } }), "script", state);
  const packet = await runner.observe(); assert.equal(count, 36); assert.equal(packet.privateCooperationBranchExcluded, true);
  assert.equal(packet.trackedUploadQueuesEmptyAtObservation, true);
  assert.equal(packet.nativeHttpBackendOwned, false); assert.equal(packet.callbacksCompleted, false);
  await assert.rejects(runner.requireOriginal({ ...packet })); assert.equal(count, 36);
  await runner.requireOriginal(packet); assert.equal(count, 39);
  await assert.rejects(runner.requireOriginal(packet)); await assert.rejects(runner.observe()); assert.equal(count, 39);
});

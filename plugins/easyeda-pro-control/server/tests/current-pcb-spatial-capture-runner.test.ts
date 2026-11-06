import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_PCB_SPATIAL_OBJECT_GROUP, CurrentPcbSpatialCaptureRunner } from "../src/current-pcb-spatial-capture-runner.ts";
import type { CurrentPcbSpatialCaptureCommand, CurrentPcbSpatialCaptureTransport } from "../src/current-pcb-spatial-capture-runner.ts";
import { CURRENT_PCB_SPATIAL_FUNCTION_LOCATIONS } from "../src/current-pcb-spatial-function-scope.ts";

const property = (name: string, value: unknown, writable = false, enumerable = false): Record<string, unknown> => ({
  name, value, writable, configurable: true, enumerable, isOwn: true,
});
function functionProperties(kind: "rpc-wrapper" | "point-handler"): Record<string, unknown> {
  const location = CURRENT_PCB_SPATIAL_FUNCTION_LOCATIONS[kind];
  return { result: [property("length", { type: "number", value: location.parameterCount }), property("name", { type: "string", value: "" })],
    internalProperties: [
      { name: "[[Prototype]]", value: { type: kind === "rpc-wrapper" ? "function" : "object",
        className: kind === "rpc-wrapper" ? "Function" : "AsyncFunction", objectId: `${kind}-prototype` } },
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
        scriptId: "original-script", lineNumber: location.lineNumber, columnNumber: location.columnNumber,
      } } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array",
        description: "Scopes[3]", objectId: `${kind}-scopes` } },
    ] };
}
function scopes(kind: "rpc-wrapper" | "point-handler"): Record<string, unknown> {
  const labels = kind === "rpc-wrapper" ? ["Closure (rpcService)", "Closure", "Global"] : ["Closure (rZe)", "Closure", "Global"];
  return { result: labels.map((description, index) => property(String(index), { type: "object", subtype: "internal#scope",
    className: "Object", description, objectId: `${kind}-scope-${String(index)}` }, true, true)) };
}
const remoteFunction = (objectId: string, className: "Function" | "AsyncFunction"): Record<string, unknown> => ({
  result: { type: "function", className, description: "fixed synthetic callback", objectId },
});

/** Synthetic transport chronology only. Real V8 scope shapes are covered by
 * the separate inspector test; this fixture grants no original native custody.
 */
function transport(failure?: "owner" | "release" | "source"): Readonly<{
  runner: CurrentPcbSpatialCaptureRunner; calls: CurrentPcbSpatialCaptureCommand[];
  client: CurrentPcbSpatialCaptureTransport;
}> {
  const calls: CurrentPcbSpatialCaptureCommand[] = [];
  const request = (command: CurrentPcbSpatialCaptureCommand): Promise<unknown> => {
    calls.push(command);
    if (command.spatialPhase === "wrapper") { return Promise.resolve(remoteFunction("original-wrapper", "Function")); }
    if (command.spatialPhase === "handler") { return Promise.resolve(remoteFunction("original-handler", "AsyncFunction")); }
    if (command.spatialPhase === "properties") {
      switch (command.params.objectId) {
        case "original-wrapper": { return Promise.resolve(functionProperties("rpc-wrapper")); }
        case "rpc-wrapper-scopes": { return Promise.resolve(scopes("rpc-wrapper")); }
        case "original-handler": {
          const reply = functionProperties("point-handler");
          return Promise.resolve(failure === "source" ? { ...reply, internalProperties: [] } : reply);
        }
        case "point-handler-scopes": { return Promise.resolve(scopes("point-handler")); }
        default: { return Promise.reject(new Error("unexpected-properties")); }
      }
    }
    if (command.spatialPhase === "bindings") { return Promise.resolve({ result: {
      type: "object", className: "Object", description: "Object", objectId: "original-private-bundle",
    } }); }
    return failure === "release" ? Promise.reject(new Error("original-release-failed")) : Promise.resolve({});
  };
  const assertCurrent = (): void => {
    if (failure === "owner" && calls.some(call => call.spatialPhase === "bindings")) { throw new Error("original-owner-drift"); }
  };
  const client = { request, assertCurrent };
  return Object.freeze({ runner: new CurrentPcbSpatialCaptureRunner(client, "original-script", "original-context", "a".repeat(16)), calls, client });
}

class OriginalPrivateFieldTransport implements CurrentPcbSpatialCaptureTransport {
  readonly #delegate: CurrentPcbSpatialCaptureTransport;
  #requests = 0;
  #checks = 0;
  public constructor(delegate: CurrentPcbSpatialCaptureTransport) { this.#delegate = delegate; }
  public request(command: CurrentPcbSpatialCaptureCommand): Promise<unknown> { this.#requests += 1; return this.#delegate.request(command); }
  public assertCurrent(): void { this.#checks += 1; this.#delegate.assertCurrent(); }
  public counts(): readonly number[] { return [this.#requests, this.#checks]; }
}

void test("class-method transports keep their original private-field receiver through capture and group release", async () => {
  const base = transport(), original = new OriginalPrivateFieldTransport(base.client);
  const runner = new CurrentPcbSpatialCaptureRunner(original, "original-script", "original-context", "a".repeat(16));
  await runner.observe();
  assert.equal(original.counts()[0], 8); assert.ok((original.counts()[1] ?? 0) > 8);
  assert.equal(base.calls.at(-1)?.spatialPhase, "release");
});

void test("passive original capture releases its group, emits no handles or native dispatch and consumes the attempt", async () => {
  const { calls, runner } = transport();
  const result = await runner.observe();
  assert.equal(result.originalModuleBindingsCaptured, true); assert.equal(result.nativeHitExecuted, false);
  assert.equal(result.executionAuthorized, false); assert.equal(JSON.stringify(result).includes("original-private-bundle"), false);
  assert.deepEqual(calls.map(call => call.spatialPhase), ["wrapper", "properties", "properties", "handler", "properties", "properties", "bindings", "release"]);
  assert.deepEqual(calls.at(-1)?.params, { objectGroup: CURRENT_PCB_SPATIAL_OBJECT_GROUP });
  for (const call of calls) {
    if (call.spatialPhase === "wrapper" || call.spatialPhase === "handler" || call.spatialPhase === "bindings") {
      assert.equal(call.params.throwOnSideEffect, call.spatialPhase !== "bindings");
    }
  }
  await assert.rejects(runner.observe(), /PCB_SPATIAL_CAPTURE/u);
  assert.equal(calls.length, 8);
});

void test("owner drift, bad handler source and failed release each withhold observation without replay", async () => {
  for (const failure of ["owner", "source", "release"] as const) {
    const { calls, runner } = transport(failure);
    await assert.rejects(runner.observe(), (error: unknown) => error instanceof AggregateError && error.errors.length > 0);
    assert.equal(calls.filter(call => call.spatialPhase === "release").length, 1);
    if (failure === "source") { assert.equal(calls.some(call => call.spatialPhase === "bindings"), false); }
    const count = calls.length;
    await assert.rejects(runner.observe(), /PCB_SPATIAL_CAPTURE/u);
    assert.equal(calls.length, count);
  }
});

void test("capture keeps the first fixed failing phase when cleanup also fails and never exposes cause text", async () => {
  const calls: string[] = [];
  const runner = new CurrentPcbSpatialCaptureRunner({
    assertCurrent(): void {
      // The synthetic original context is stable.
    },
    request(command): Promise<unknown> {
      calls.push(command.spatialPhase);
      return command.spatialPhase === "wrapper" ? Promise.resolve({ exceptionDetails: { text: "private renderer text" } })
        : Promise.reject(new Error("private release path"));
    },
  }, "original-script", "original-context", "a".repeat(16));
  await assert.rejects(runner.observe(), (error: unknown) => {
    assert.ok(error instanceof AggregateError);
    assert.equal(error.message, "PCB_SPATIAL_CAPTURE:wrapper:decode,release:failed");
    assert.equal(error.errors.length, 2); assert.equal(error.message.includes("private"), false); return true;
  });
  assert.deepEqual(calls, ["wrapper", "release"]);
  await assert.rejects(runner.observe(), /PCB_SPATIAL_CAPTURE/u); assert.equal(calls.length, 2);
});

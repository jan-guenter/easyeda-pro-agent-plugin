import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP, CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT,
  CurrentPcbCommonBaselineRunner } from "../src/current-pcb-common-baseline-runner.ts";
import type { CurrentPcbCommonBaselineCommand } from "../src/current-pcb-common-baseline-runner.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS } from "../src/current-pcb-diagnostic-model-scope.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function properties(kind: "rpc-wrapper" | "save-handler", scriptId: string): unknown {
  const location = CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS[kind];
  return {
    result: [["length", "number", location.parameterCount], ["name", "string", ""]].map(([name, type, value]) => ({
      name, value: { type, value }, writable: false, configurable: true, enumerable: false, isOwn: true,
    })),
    internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location",
        value: { scriptId, lineNumber: location.lineNumber, columnNumber: location.columnNumber } } },
      { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array",
        description: "Scopes[2]", objectId: `${kind}-scopes` } },
    ],
  };
}
function scopes(kind: "rpc-wrapper" | "save-handler"): unknown {
  return { result: [kind === "rpc-wrapper" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) => ({
    name: String(index), value: { type: "object", subtype: "internal#scope", className: "Object", description,
      objectId: index === 0 ? `${kind}-scope` : "global" }, writable: true, configurable: true, enumerable: true, isOwn: true,
  })) };
}
interface Options {
  readonly scriptId?: string;
  readonly cleanupFailure?: Error;
  readonly staleAfter?: string;
  readonly replace?: (phase: string, reply: unknown) => unknown;
}
function fixture(options: Options = {}): {
  readonly runner: CurrentPcbCommonBaselineRunner;
  readonly commands: CurrentPcbCommonBaselineCommand[];
  readonly counter: { checks: number };
  readonly nativeCalls: () => unknown;
} {
  const commands: CurrentPcbCommonBaselineCommand[] = [], context = pcbCommonFixture(), counter = { checks: 0 };
  let current = true;
  const runner = new CurrentPcbCommonBaselineRunner({
    assertCurrent: (): void => { counter.checks += 1; if (!current) { throw new Error("synthetic owner changed"); } },
    request: (command): Promise<unknown> => {
      assert.ok(Object.isFrozen(command)); assert.ok(Object.isFrozen(command.params)); commands.push(command);
      let reply: unknown;
      if (command.commonPhase === "release") {
        if (options.staleAfter === "release") { current = false; }
        return options.cleanupFailure === undefined ? Promise.resolve({}) : Promise.reject(options.cleanupFailure);
      }
      if (command.commonPhase === "wrapper" || command.commonPhase === "handler") {
        reply = { result: { type: "function", className: command.commonPhase === "wrapper" ? "Function" : "AsyncFunction",
          description: "synthetic original", objectId: command.commonPhase === "wrapper" ? "rpc-wrapper" : "save-handler" } };
      } else if (command.commonPhase === "properties") {
        const id = command.params.objectId, kind = id.startsWith("rpc-wrapper") ? "rpc-wrapper" : "save-handler";
        reply = id.endsWith("-scopes") ? scopes(kind) : properties(kind, options.scriptId ?? "pcb");
      } else {
        assert.equal(command.params.objectId, "save-handler-scope");
        assert.deepEqual(command.params.arguments, [{ objectId: "rpc-wrapper" }]);
        reply = pcbStringReply(callPcbStringObservation(context, command.params.functionDeclaration));
      }
      if (command.commonPhase === options.staleAfter) { current = false; }
      return Promise.resolve(options.replace === undefined ? reply : options.replace(command.commonPhase, reply));
    },
  }, "pcb", "original-context", "d".repeat(16));
  return { commands, counter, runner, nativeCalls: (): unknown => runInContext("getterReads+vendorCalls", context) as unknown };
}

void test("composed common baseline collects four actual fixed programs in eleven original-scope commands", async () => {
  const value = fixture();
  const result = await value.runner.observe();
  assert.equal(value.commands.length, CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT);
  assert.deepEqual(value.commands.map(command => command.commonPhase),
    ["wrapper", "properties", "properties", "handler", "properties", "properties", "presentation", "rules", "preference", "assets", "release"]);
  assert.equal(value.counter.checks, 23);
  const first = value.commands[0], last = value.commands.at(-1);
  assert.ok(first?.commonPhase === "wrapper" && last?.commonPhase === "release");
  assert.equal(first.params.uniqueContextId, "original-context");
  assert.equal(first.params.objectGroup, CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP);
  assert.equal(last.params.objectGroup, first.params.objectGroup);
  for (const command of value.commands) {
    if (command.method === "Runtime.evaluate" || command.method === "Runtime.callFunctionOn") {
      assert.equal(command.params.throwOnSideEffect, true); assert.equal(command.params.awaitPromise, false);
    }
  }
  for (const sample of [result.presentation, result.rules, result.preference, result.assets]) {
    assert.equal(sample.documentUuid, result.documentUuid); assert.equal(sample.executionAuthorized, false);
  }
  assert.equal(result.atomicSnapshotVerified, false); assert.equal(result.continuousObservation, false);
  assert.equal(result.originalOwnerVerified, false); assert.equal(result.completeLiveBaselineVerified, false);
  assert.equal(result.storedSourceMatched, false); assert.equal(result.saveAuthorized, false);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.rules.graph.nodes));
  assert.equal(value.nativeCalls(), 0);
  await assert.rejects(value.runner.observe(), /PCB_COMMON_BASELINE_OBSERVATION/u);
  assert.equal(value.commands.length, 11);
});

void test("common baseline rejects a foreign original script before any common reader", async () => {
  const value = fixture({ scriptId: "foreign" });
  await assert.rejects(value.runner.observe(), /FAILED_PROPERTIES/u);
  assert.deepEqual(value.commands.map(command => command.commonPhase), ["wrapper", "properties", "release"]);
});

void test("each common leaf is decoded before the next dispatch and foreign document samples refuse", async () => {
  for (const phase of ["presentation", "rules", "preference", "assets"]) {
    for (const malformed of [false, true]) {
      const value = fixture({ replace: (selected, reply) => {
        if (selected !== phase) { return reply; }
        if (malformed) { return { result: { type: "string", value: "{}" } }; }
        assert.ok(reply !== null && typeof reply === "object" && "result" in reply);
        const result = reply.result; assert.ok(result !== null && typeof result === "object" && "value" in result && typeof result.value === "string");
        return pcbStringReply(result.value.replace(`"documentUuid":"${"d".repeat(16)}"`, `"documentUuid":"${"b".repeat(32)}"`));
      } });
      await assert.rejects(value.runner.observe(), new RegExp(`FAILED_${phase.toUpperCase()}$`, "u"));
      assert.equal(value.commands.at(-2)?.commonPhase, phase); assert.equal(value.commands.at(-1)?.commonPhase, "release");
      assert.equal(value.commands.filter(command => command.commonPhase === "release").length, 1);
    }
  }
});

void test("common baseline rechecks original ownership after every observation await", async () => {
  for (const phase of ["wrapper", "handler", "presentation", "rules", "preference", "assets"]) {
    const value = fixture({ staleAfter: phase });
    await assert.rejects(value.runner.observe(), (caughtError: unknown) => {
      assert.ok(caughtError instanceof AggregateError && caughtError.cause instanceof Error);
      assert.equal(caughtError.cause.message, "synthetic owner changed"); return true;
    });
    assert.equal(value.commands.at(-2)?.commonPhase, phase); assert.equal(value.commands.at(-1)?.commonPhase, "release");
  }
});

void test("common baseline retains primary and release errors separately and never accepts failed cleanup", async () => {
  const cleanup = new Error("private cleanup cause"), primary = new Error("private observation cause");
  const both = fixture({ cleanupFailure: cleanup, replace: phase => { assert.equal(phase, "wrapper"); throw primary; } });
  await assert.rejects(both.runner.observe(), (caughtError: unknown) => {
    assert.ok(caughtError instanceof AggregateError); assert.equal(caughtError.cause, primary);
    assert.deepEqual(caughtError.errors, [primary, cleanup]);
    assert.equal(caughtError.message, "PCB_COMMON_BASELINE_OBSERVATION_FAILED_WRAPPER_RELEASE_FAILED"); return true;
  });
  const release = fixture({ cleanupFailure: cleanup });
  await assert.rejects(release.runner.observe(), (caughtError: unknown) => {
    assert.ok(caughtError instanceof AggregateError); assert.equal(caughtError.cause, cleanup);
    assert.deepEqual(caughtError.errors, [cleanup]);
    assert.equal(caughtError.message, "PCB_COMMON_BASELINE_OBSERVATION_FAILED_RELEASE_RELEASE_FAILED"); return true;
  });
  assert.equal(release.commands.length, 11);
});

void test("common baseline withholds a sample when original ownership changes during private cleanup", async () => {
  const value = fixture({ staleAfter: "release" });
  await assert.rejects(value.runner.observe(), (caughtError: unknown) => {
    assert.ok(caughtError instanceof AggregateError && caughtError.cause instanceof Error);
    assert.equal(caughtError.message, "PCB_COMMON_BASELINE_OBSERVATION_FAILED_OWNER-FINAL");
    assert.equal(caughtError.cause.message, "synthetic owner changed"); return true;
  });
  assert.equal(value.commands.length, 11);
  assert.equal(value.commands.at(-1)?.commonPhase, "release");
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_COMMON_BASELINE_OBJECT_GROUP, CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT,
  CurrentPcbCommonBaselineRunner, currentPcbCommonBaselineChunkMetadata, requireOriginalCurrentPcbCommonBaselineChunks,
  requireOriginalCurrentPcbCommonBaselineReplies } from "../src/current-pcb-common-baseline-runner.ts";
import type { CurrentPcbCommonBaselineCommand } from "../src/current-pcb-common-baseline-runner.ts";
import { currentPcbCommonRunnerFailureDetail } from "../src/current-pcb-common-baseline-failure.ts";
import { currentPcbConstructorFailure } from "../src/current-pcb-constructor-failure.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS } from "../src/current-pcb-diagnostic-model-scope.ts";
import { CURRENT_PCB_CONSTRUCTOR_BUNDLES, CURRENT_PCB_CONSTRUCTOR_PROFILES } from "../src/current-pcb-constructor-scope.ts";
import type { CurrentPcbConstructorName } from "../src/current-pcb-constructor-scope.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

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
function constructorTuple(): unknown {
  const result = CURRENT_PCB_CONSTRUCTOR_BUNDLES.common.map((name, index) => ({ name: String(index),
    value: { type: "function", className: "Function", objectId: `constructor-${name}` }, writable: true, configurable: true, enumerable: true, isOwn: true }));
  return { result: [...result, { name: "length", value: { type: "number", value: 4 }, writable: true, configurable: false, enumerable: false, isOwn: true }],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
}
function constructorProperties(name: CurrentPcbConstructorName, scriptId: string, samePrototype: boolean): unknown {
  const location = CURRENT_PCB_CONSTRUCTOR_PROFILES[name];
  return { result: [
    { name: "length", value: { type: "number", value: 0 }, writable: false, configurable: true, enumerable: false, isOwn: true },
    { name: "name", value: { type: "string", value: name }, writable: false, configurable: true, enumerable: false, isOwn: true },
    { name: "prototype", value: { type: "object", className: location.prototypeClassName, objectId: samePrototype ? "same-prototype" : `prototype-${name}` }, writable: false, configurable: false, enumerable: false, isOwn: true },
  ], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId, lineNumber: location.lineNumber, columnNumber: location.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scope-${name}` } },
  ] };
}
interface Options {
  readonly scriptId?: string;
  readonly constructorScript?: string;
  readonly samePrototype?: boolean;
  readonly cleanupFailure?: Error;
  readonly staleAfter?: string;
  readonly replace?: (phase: string, reply: unknown) => unknown;
  readonly afterArrival?: (phase: string, reply: unknown) => void;
}
function fixture(options: Options = {}): {
  readonly runner: CurrentPcbCommonBaselineRunner;
  readonly commands: CurrentPcbCommonBaselineCommand[];
  readonly counter: { checks: number };
  readonly nativeCalls: () => unknown;
} {
  const commands: CurrentPcbCommonBaselineCommand[] = [], context = pcbCommonFixture(`
const compiler=scope.object.x.env._compiler;compiler.project=compiler.base.path;compiler.isProject=true;
compiler.docDetail={title:"Fixture PCB",parent:"",source:"",board:"",zIndex:null};
for(const name of ["Yme","Nfe","Epe","GSe"])delete scope.object[name];`), counter = { checks: 0 };
  let arriving: { readonly phase: string; readonly reply: unknown } | undefined, current = true;
  const packets = new Map<string, unknown>();
  const runner = new CurrentPcbCommonBaselineRunner({
    assertCurrent: (): void => {
      counter.checks += 1;
      const arrival = arriving; arriving = undefined;
      if (arrival !== undefined) { options.afterArrival?.(arrival.phase, arrival.reply); }
      if (!current) { throw new Error("synthetic owner changed"); }
    },
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
        const constructor = CURRENT_PCB_CONSTRUCTOR_BUNDLES.common.find(name => id === `constructor-${name}`);
        if (id === "common-constructors") { reply = constructorTuple(); }
        else if (constructor === undefined) { reply = id.endsWith("-scopes") ? scopes(kind) : properties(kind, options.scriptId ?? "pcb"); }
        else { reply = constructorProperties(constructor, options.constructorScript ?? "pcb", options.samePrototype ?? false); }
      } else if (command.commonPhase === "constructors") {
        assert.equal(command.params.objectId, "save-handler-scope");
        assert.deepEqual(command.params.arguments, [{ objectId: "rpc-wrapper" }]);
        runInContext(`globalThis.qualifiedCommonConstructors=(${command.params.functionDeclaration}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback);`, context);
        reply = { result: { type: "object", subtype: "array", className: "Array", description: "Array(4)", objectId: "common-constructors" } };
      } else if (command.commonPhase === "packet-advance" || command.commonPhase === "packet-read" || command.commonPhase === "packet-result") {
        assert.equal(Object.hasOwn(command.params, "arguments"), false);
        assert.ok(packets.has(command.params.objectId)); context["originalPacket"] = packets.get(command.params.objectId);
        const observed: unknown = runInContext(`(${command.params.functionDeclaration}).call(originalPacket)`, context);
        if (command.commonPhase === "packet-advance") {
          const objectId = `packet-${packets.size}`; packets.set(objectId, observed);
          reply = { result: { type: "object", className: "Object", description: "Object", objectId } };
        } else { reply = pcbStringReply(observed); }
      } else {
        assert.equal(command.params.objectId, "save-handler-scope");
        assert.ok("arguments" in command.params);
        assert.deepEqual(command.params.arguments, command.commonPhase === "metadata" ? [{ objectId: "rpc-wrapper" }] : [{ objectId: "rpc-wrapper" }, { objectId: "common-constructors" }]);
        const observed: unknown = runInContext(`(${command.params.functionDeclaration}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,qualifiedCommonConstructors)`, context);
        if (command.commonPhase.endsWith("-seed")) {
          const objectId = `packet-${packets.size}`; packets.set(objectId, observed);
          reply = { result: { type: "object", className: "Object", description: "Object", objectId } };
        } else { reply = pcbStringReply(observed); }
      }
      if (command.commonPhase === options.staleAfter) { current = false; }
      const returned = options.replace === undefined ? reply : options.replace(command.commonPhase, reply);
      arriving = { phase: command.commonPhase, reply: returned };
      return Promise.resolve(returned);
    },
  }, "pcb", "original-context", "d".repeat(16));
  return { commands, counter, runner, nativeCalls: (): unknown => runInContext("getterReads+vendorCalls", context) as unknown };
}

void test("common baseline qualifies original constructors and bounded graph packets in one retained group", async () => {
  const value = fixture();
  const result = await value.runner.observe();
  assert.ok(value.commands.length < CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT);
  assert.deepEqual(value.commands.slice(0, 12).map(command => command.commonPhase),
    ["wrapper", "properties", "properties", "handler", "properties", "properties", "constructors",
      "properties", "properties", "properties", "properties", "properties"]);
  assert.deepEqual(value.commands.filter(command => command.commonPhase.endsWith("-seed")).map(command => command.commonPhase),
    ["presentation-seed", "rules-seed", "preference-seed"]);
  assert.equal(value.commands.filter(command => command.commonPhase === "packet-result").length, 3);
  assert.equal(value.counter.checks, value.commands.length * 2 + 1);
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
  for (const sample of [result.presentation, result.rules, result.preference, result.assets, result.metadata]) {
    assert.equal(sample.documentUuid, result.documentUuid); assert.equal(sample.executionAuthorized, false);
  }
  assert.equal(result.atomicSnapshotVerified, false); assert.equal(result.continuousObservation, false);
  assert.equal(result.originalOwnerVerified, false); assert.equal(result.completeLiveBaselineVerified, false);
  assert.equal(result.storedSourceMatched, false); assert.equal(result.saveAuthorized, false);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.rules.graph.nodes));
  const raw = requireOriginalCurrentPcbCommonBaselineReplies(result);
  assert.ok(Object.isFrozen(raw) && Object.isFrozen(raw.rules) && Object.isFrozen(raw.rules.result));
  assert.ok(Object.isFrozen(raw.metadata.result));
  const decoded: unknown = JSON.parse(raw.rules.result.value);
  assert.ok(decoded !== null && typeof decoded === "object" && "documentUuid" in decoded);
  assert.equal(decoded.documentUuid, result.documentUuid);
  assert.throws(() => requireOriginalCurrentPcbCommonBaselineReplies(structuredClone(result)), /PCB_COMMON_BASELINE_OBSERVATION/u);
  const chunks = requireOriginalCurrentPcbCommonBaselineChunks(result), metadata = currentPcbCommonBaselineChunkMetadata(result);
  assert.ok(Object.isFrozen(chunks) && Object.isFrozen(chunks.presentation) && Object.isFrozen(chunks.presentation[0]?.result));
  assert.equal(metadata.leaves.presentation.count, chunks.presentation.length);
  assert.ok(metadata.totalBytes > 0); assert.equal(metadata.executionAuthorized, false);
  assert.throws(() => requireOriginalCurrentPcbCommonBaselineChunks(structuredClone(result)), /PCB_COMMON_BASELINE_OBSERVATION/u);
  assert.equal(value.nativeCalls(), 0);
  await assert.rejects(value.runner.observe(), /PCB_COMMON_BASELINE_OBSERVATION/u);
  assert.ok(value.commands.length < CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT);
});

void test("common baseline rejects a foreign original script before any common reader", async () => {
  const value = fixture({ scriptId: "foreign" });
  await assert.rejects(value.runner.observe(), /FAILED_PROPERTIES/u);
  assert.deepEqual(value.commands.map(command => command.commonPhase), ["wrapper", "properties", "release"]);
});

void test("each common leaf is decoded before the next dispatch and foreign document samples refuse", async () => {
  for (const phase of ["packet-read", "packet-result", "assets", "metadata"]) {
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
  for (const phase of ["wrapper", "handler", "constructors", "presentation-seed", "rules-seed", "preference-seed", "packet-advance", "packet-read", "packet-result", "assets", "metadata"]) {
    const value = fixture({ staleAfter: phase });
    await assert.rejects(value.runner.observe(), (caughtError: unknown) => {
      assert.ok(caughtError instanceof AggregateError && caughtError.cause instanceof Error);
      assert.equal(caughtError.cause.message, "synthetic owner changed"); return true;
    });
    assert.equal(value.commands.at(-2)?.commonPhase, phase); assert.equal(value.commands.at(-1)?.commonPhase, "release");
  }
});

void test("common raw replies are immutable before post-arrival owner hooks, including refused owners", async () => {
  for (const phase of ["packet-read", "packet-result", "assets", "metadata"]) {
    for (const lostOwner of [false, true]) {
      let captured = false;
      const value = fixture({ ...(lostOwner ? { staleAfter: phase } : {}), afterArrival: (selected, reply) => {
        if (selected !== phase) { return; }
        assert.ok(reply !== null && typeof reply === "object" && "result" in reply);
        const result = reply.result; assert.ok(result !== null && typeof result === "object" && "value" in result);
        assert.ok(Object.isFrozen(reply) && Object.isFrozen(result));
        assert.equal(Reflect.set(result, "value", "{}"), false);
        assert.equal(Reflect.set(reply, "result", {}), false); captured = true;
      } });
      if (lostOwner) { await assert.rejects(value.runner.observe(), new RegExp(`FAILED_${phase.toUpperCase()}$`, "u")); }
      else { const result = await value.runner.observe(); assert.equal(result.documentUuid, "d".repeat(16)); }
      assert.equal(captured, true);
      assert.equal(value.commands.at(-1)?.commonPhase, "release");
      assert.equal(value.commands.filter(command => command.commonPhase === "release").length, 1);
      await assert.rejects(value.runner.observe(), /PCB_COMMON_BASELINE_OBSERVATION/u);
    }
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
  assert.ok(release.commands.length < CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT);
});

void test("common runner retains only original branded constructor labels and cleanup outcome", async () => {
  const primary = currentPcbConstructorFailure({ schema: "easyeda-pro-control.pcb-constructor-failure.v1",
    bundle: "common", profile: "Yme", stage: "constructor", reason: "name" });
  for (const cleanupFailure of [undefined, new Error("secret cleanup")]) {
    const value = fixture({ ...(cleanupFailure === undefined ? {} : { cleanupFailure }), replace: (phase, reply) => {
      if (phase === "constructors") { throw primary; } return reply;
    } });
    await assert.rejects(value.runner.observe(), (caughtError: unknown) => {
      const detail = currentPcbCommonRunnerFailureDetail(caughtError); assert.ok(detail);
      assert.equal(detail.phase, "constructors"); assert.equal(detail.cleanup, cleanupFailure === undefined ? "released" : "failed");
      assert.equal(detail.constructor?.profile, "Yme"); assert.equal(detail.constructor?.reason, "name");
      assert.equal(currentPcbCommonRunnerFailureDetail(structuredClone(caughtError)), null);
      assert.equal(JSON.stringify(detail).includes("secret"), false); return true;
    });
  }
  assert.equal(currentPcbCommonRunnerFailureDetail(new Error("PCB_COMMON_BASELINE_OBSERVATION_FAILED_CONSTRUCTORS")), null);
});

void test("common baseline withholds a sample when original ownership changes during private cleanup", async () => {
  const value = fixture({ staleAfter: "release" });
  await assert.rejects(value.runner.observe(), (caughtError: unknown) => {
    assert.ok(caughtError instanceof AggregateError && caughtError.cause instanceof Error);
    assert.equal(caughtError.message, "PCB_COMMON_BASELINE_OBSERVATION_FAILED_OWNER-FINAL");
    assert.equal(caughtError.cause.message, "synthetic owner changed"); return true;
  });
  assert.ok(value.commands.length < CURRENT_PCB_COMMON_BASELINE_REQUEST_COUNT);
  assert.equal(value.commands.at(-1)?.commonPhase, "release");
});

void test("common baseline refuses foreign constructor script or aliased prototypes before any reader", async () => {
  for (const options of [{ constructorScript: "other-script" }, { samePrototype: true }]) {
    const value = fixture(options);
    await assert.rejects(value.runner.observe(), /FAILED_PROPERTIES/u);
    assert.equal(value.commands.some(command => command.commonPhase === "presentation-seed"), false);
    assert.equal(value.commands.at(-1)?.commonPhase, "release");
  }
});

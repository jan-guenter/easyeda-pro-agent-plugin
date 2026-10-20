import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS } from "../src/current-pcb-diagnostic-model-scope.ts";
import { CURRENT_PCB_STRING_PRODUCER_COMMANDS, CURRENT_PCB_STRING_PRODUCER_OBJECT_GROUP,
  CurrentPcbStringProducerRunner } from "../src/current-pcb-string-producer-runner.ts";
import type { CurrentPcbStringProducerCommand } from "../src/current-pcb-string-producer-runner.ts";
import { CURRENT_PCB_STRING_PRODUCER_LOCATIONS } from "../src/current-pcb-string-producer-scope.ts";
import { currentPcbStringProducerSources } from "./helpers/current-pcb-string-producer-fixture.ts";

type Kind = keyof typeof CURRENT_PCB_STRING_PRODUCER_LOCATIONS | "rpc-wrapper" | "save-handler";
const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), windowTabId: "original-window" };
const pcb = { sessionId: "pcb-session", scriptId: "pcb-script", uniqueContextId: "pcb-context" };
const worker = { sessionId: "worker-session", scriptId: "worker-script", uniqueContextId: "worker-context" };
const identity = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, windowTabId: target.windowTabId };
const wrapped = (value: unknown): unknown => ({ result: { type: "string", value: JSON.stringify(value) } });
function property(name: string, value: unknown, writable = false, configurable = true, enumerable = false): unknown {
  return { name, value, writable, configurable, enumerable, isOwn: true };
}
function frame(kind: Kind): Readonly<{ lineNumber: number; columnNumber: number; parameterCount: number; regular: boolean; scopes: readonly string[] }> {
  if (kind === "rpc-wrapper" || kind === "save-handler") {
    return { ...CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS[kind], regular: false, scopes: [kind === "rpc-wrapper" ? "Closure (rpcService)" : "Closure"] };
  }
  const profile = CURRENT_PCB_STRING_PRODUCER_LOCATIONS[kind]; return { ...profile, scopes: profile.scopeDescriptions };
}
function harness(options: Readonly<{ fail?: string; malformed?: string; releaseFailure?: boolean; wrongIdentity?: boolean;
  ownerFailure?: boolean; ownerLostAfterRelease?: boolean }> = {}):
Readonly<{ runner: CurrentPcbStringProducerRunner; commands: CurrentPcbStringProducerCommand[]; guards: () => number }> {
  const commands: CurrentPcbStringProducerCommand[] = [], handles = new Map<string, Readonly<{ kind: Kind; list: boolean }>>();
  let count = 0, guards = 0, ownerLost = false;
  const fresh = (kind: Kind, list: boolean): string => { count += 1; const value = `handle-${count}`; handles.set(value, { kind, list }); return value; };
  const original = (kind: Kind): unknown => ({ result: { type: "function", className: kind === "save-handler" ? "AsyncFunction" : "Function",
    objectId: fresh(kind, false), description: kind === "rpc-wrapper" || kind === "save-handler" ? "synthetic callback" : currentPcbStringProducerSources[kind] } });
  const runner = new CurrentPcbStringProducerRunner({
    assertCurrent: (): void => { guards += 1; if (options.ownerFailure === true || ownerLost) { throw new Error("ORIGINAL_OWNER_LOST"); } },
    request: (command): Promise<unknown> => {
      commands.push(command); assert.equal(Object.isFrozen(command.params), true);
      assert.equal(command.sessionId, command.side === "pcb" ? pcb.sessionId : worker.sessionId);
      if (command.phase === options.fail || command.phase === "release" && command.side === "pcb" && options.releaseFailure === true) {
        return Promise.reject(new Error(`SYNTHETIC_FAILURE:${command.phase}`));
      }
      if (command.phase === options.malformed) { return Promise.resolve(wrapped({ unexpected: true })); }
      let reply: unknown;
      switch (command.phase) {
        case "wrapper": { reply = original("rpc-wrapper"); break;
        }
        case "handler": { reply = original("save-handler"); break;
        }
        case "move-select": { reply = original("move"); break;
        }
        case "upload-structure-select": case "structure-select": { reply = original("serial"); break;}
        case "debounce-select": { reply = original("debounce"); break;
        }
        case "cooperation-select": { reply = original("cooperation"); break;
        }
        case "upload-select": { reply = original("upload"); break;
        }
        case "properties": {
          const selected = handles.get(command.params.objectId); assert.ok(selected !== undefined); const profile = frame(selected.kind);
          if (selected.list) {
            reply = { result: [...profile.scopes, "Global"].map((description, index) => property(String(index), {
              type: "object", subtype: "internal#scope", className: "Object", description, objectId: fresh(selected.kind, false),
            }, true, true, true)) };
          } else {
            const properties = [property("length", { type: "number", value: profile.parameterCount }), property("name", { type: "string", value: "" })];
            if (profile.regular) { properties.push(property("arguments", { type: "object", subtype: "null", value: null }, false, false),
              property("caller", { type: "object", subtype: "null", value: null }, false, false),
              property("prototype", { type: "object", className: "Object", objectId: "prototype" }, true, false)); }
            reply = { result: properties, internalProperties: [
              { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } },
              { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
                scriptId: command.side === "pcb" ? pcb.scriptId : worker.scriptId, lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
              { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array",
                description: `Scopes[${profile.scopes.length + 1}]`, objectId: fresh(selected.kind, true) } },
            ] };
          } break;
        }
        case "move": { reply = wrapped({ schema: "easyeda-pro-control.pcb-string-move-closure.v1", documentUuid: target.documentUuid,
          timer: "null", selectionCount: 0, builder: "null", command: "null" }); break;
        }
        case "upload-structure": case "structure": { reply = wrapped({ schema: "easyeda-pro-control.pcb-string-serial-closure.v1", identity,
          kind: command.phase === "structure" ? "structure" : "uploadStructure", inFlight: "null", queued: "null", lastArguments: null }); break;}
        case "debounce": { reply = wrapped({ schema: "easyeda-pro-control.pcb-string-debounce-closure.v1", identity,
          timer: "undefined", resolver: "null", delay: 300, leading: false }); break;
        }
        case "cooperation": { reply = wrapped({ schema: "easyeda-pro-control.pcb-string-cooperation-closure.v1", identity,
          batchCount: 0, outerTimer: "null", innerTimer: "null", delay: 10 }); break;
        }
        case "upload": { reply = wrapped({ schema: "easyeda-pro-control.pcb-string-upload-closure.v1",
          identity: options.wrongIdentity === true ? { ...identity, windowTabId: "foreign" } : identity,
          timer: "null", promise: "null", resolver: "null", delay: 500 }); break;
        }
        case "release": { reply = {};
          if (command.side === "worker" && options.ownerLostAfterRelease === true) { ownerLost = true; }
          break;
        }
        default: { throw new Error("UNEXPECTED_SYNTHETIC_COMMAND"); }
      }
      return Promise.resolve(reply);
    },
  }, pcb, worker, target);
  return { runner, commands, guards: (): number => guards };
}

void test("dormant producer runner uses 34 fixed commands with distinct session cleanup and fresh scopes", async () => {
  const fixture = harness(), observed = await fixture.runner.observe();
  assert.equal(fixture.commands.length, CURRENT_PCB_STRING_PRODUCER_COMMANDS); assert.equal(fixture.guards(), 65);
  assert.equal(observed.executionAuthorized, false); assert.equal(observed.queueCompletionVerified, false);
  const releases = fixture.commands.filter(command => command.phase === "release");
  assert.deepEqual(releases.map(command => command.side), ["pcb", "worker"]);
  assert.ok(releases.every(command => command.params.objectGroup === CURRENT_PCB_STRING_PRODUCER_OBJECT_GROUP));
  const functions = fixture.commands.filter(command => command.method === "Runtime.callFunctionOn" || command.method === "Runtime.evaluate");
  assert.ok(functions.every(command => command.params.throwOnSideEffect && !command.params.awaitPromise && !command.params.userGesture));
  assert.deepEqual(functions.filter(command => command.method === "Runtime.evaluate").map(command => command.params.uniqueContextId),
    [pcb.uniqueContextId, worker.uniqueContextId, worker.uniqueContextId, worker.uniqueContextId, worker.uniqueContextId]);
  const structureIndex = fixture.commands.findIndex(command => command.phase === "structure");
  assert.deepEqual(fixture.commands.slice(structureIndex + 1, structureIndex + 5).map(command => command.phase),
    ["properties", "properties", "debounce-select", "properties"]);
  await assert.rejects(fixture.runner.observe(), /PRODUCER_OBSERVATION/u); assert.equal(fixture.commands.length, 34);
});

void test("producer failure never retries reads and both owned groups receive independent cleanup attempts", async () => {
  for (const fail of ["wrapper", "move", "structure", "debounce", "upload"]) {
    const fixture = harness({ fail }); await assert.rejects(fixture.runner.observe(), /PRODUCER_OBSERVATION/u);
    const index = fixture.commands.findIndex(command => command.phase === fail);
    assert.ok(index !== -1); assert.ok(fixture.commands.slice(index + 1).every(command => command.phase === "release"));
    assert.deepEqual(fixture.commands.filter(command => command.phase === "release").map(command => command.side),
      fail === "wrapper" || fail === "move" ? ["pcb"] : ["pcb", "worker"]);
    const before = fixture.commands.length; await assert.rejects(fixture.runner.observe()); assert.equal(fixture.commands.length, before);
  }
  for (const options of [{ releaseFailure: true }, { wrongIdentity: true }]) {
    const fixture = harness(options); await assert.rejects(fixture.runner.observe(), /PRODUCER_OBSERVATION/u);
    assert.deepEqual(fixture.commands.slice(-2).map(command => command.side), ["pcb", "worker"]);
  }
  const releaseOnly = harness({ releaseFailure: true });
  await assert.rejects(releaseOnly.runner.observe(), /PRODUCER_OBSERVATION:pcb:release/u);
  const primaryAndRelease = harness({ fail: "structure", releaseFailure: true });
  await assert.rejects(primaryAndRelease.runner.observe(), /PRODUCER_OBSERVATION:worker:structure/u);
  const lost = harness({ ownerFailure: true }); await assert.rejects(lost.runner.observe()); assert.equal(lost.commands.length, 0);
});

void test("malformed early observations stop before later selectors and release only owned sessions", async () => {
  for (const malformed of ["move", "upload-structure", "structure", "debounce", "cooperation"]) {
    const fixture = harness({ malformed }); await assert.rejects(fixture.runner.observe(), /PRODUCER_OBSERVATION/u);
    const position = fixture.commands.findIndex(command => command.phase === malformed); assert.notEqual(position, -1);
    assert.ok(fixture.commands.slice(position + 1).every(command => command.phase === "release"));
    assert.deepEqual(fixture.commands.slice(position + 1).map(command => command.side), malformed === "move" ? ["pcb"] : ["pcb", "worker"]);
  }
});

void test("release-await owner loss refuses publication and preserves an earlier failure phase", async () => {
  const lost = harness({ ownerLostAfterRelease: true });
  await assert.rejects(lost.runner.observe(), (error: unknown) => {
    assert.ok(error instanceof AggregateError);
    assert.equal(error.message, "PCB_STRING_PRODUCER_OBSERVATION:owner-final");
    assert.equal(error.errors.length, 1); return true;
  });
  assert.deepEqual(lost.commands.slice(-2).map(command => command.side), ["pcb", "worker"]);
  const both = harness({ ownerLostAfterRelease: true, fail: "structure" });
  await assert.rejects(both.runner.observe(), (error: unknown) => {
    assert.ok(error instanceof AggregateError);
    assert.equal(error.message, "PCB_STRING_PRODUCER_OBSERVATION:worker:structure");
    assert.equal(error.errors.length, 2); return true;
  });
  assert.deepEqual(both.commands.slice(-2).map(command => command.side), ["pcb", "worker"]);
});

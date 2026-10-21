import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS } from "../src/current-pcb-diagnostic-model-scope.ts";
import { CURRENT_PCB_STRING_MOVE_OBJECT_GROUP, CURRENT_PCB_STRING_MOVE_REQUEST_COUNT, CurrentPcbStringMoveRunner,
  currentPcbStringMoveFailureDetail, requireOriginalCurrentPcbStringMoveFailureReplies, requireOriginalCurrentPcbStringMoveFailureReply,
  requireOriginalCurrentPcbStringMoveReplies, requireOriginalCurrentPcbStringMoveReply } from "../src/current-pcb-string-move-runner.ts";
import type { CurrentPcbStringMoveCommand } from "../src/current-pcb-string-move-runner.ts";
import { CURRENT_PCB_STRING_PRODUCER_LOCATIONS } from "../src/current-pcb-string-producer-scope.ts";
import { inspectCurrentPcbStringFiniteEffects } from "../src/current-pcb-string-finite-effects.ts";
import { CurrentPcbStringWorkerProducerRunner } from "../src/current-pcb-string-worker-producer-runner.ts";
import { currentPcbStringProducerSources } from "./helpers/current-pcb-string-producer-fixture.ts";
import { createCurrentPcbStringWorkerProducerResponder } from "./helpers/current-pcb-string-worker-producer-responder.ts";

const owner = { sessionId: "original-pcb", scriptId: "original-script", uniqueContextId: "original-context" };
const identity = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), windowTabId: "original-window" };
type Kind = "rpc-wrapper" | "save-handler" | "move";
function property(name: string, value: unknown, writable = false, configurable = true, enumerable = false): unknown {
  return { name, value, writable, configurable, enumerable, isOwn: true };
}
function harness(options: Readonly<{ fail?: CurrentPcbStringMoveCommand["movePhase"]; releaseFailure?: boolean;
  invalid?: boolean; nonempty?: boolean; wrongDocument?: boolean; lostAfterRelease?: boolean; lostInitially?: boolean;
  mutateRawAfterArrival?: boolean; loseAfterSample?: "sample" | "startup" }> = {}):
Readonly<{ runner: CurrentPcbStringMoveRunner; commands: CurrentPcbStringMoveCommand[]; lose: () => void; restore: () => void; raw: string }> {
  const commands: CurrentPcbStringMoveCommand[] = [], handles = new Map<string, Readonly<{ kind: Kind; list: boolean }>>();
  let count = 0, lost = options.lostInitially === true;
  let pendingArrival: { phase: "sample" | "startup"; reply: { result: { type: string; value: string } } } | undefined;
  const fresh = (kind: Kind, list: boolean): string => { count += 1; const id = `handle-${count}`; handles.set(id, { kind, list }); return id; };
  const raw = JSON.stringify({ schema: "easyeda-pro-control.pcb-string-move-closure.v1",
    documentUuid: options.wrongDocument === true ? "f".repeat(16) : identity.documentUuid,
    timer: options.nonempty === true ? "present" : "null", selectionCount: options.nonempty === true ? 1 : 0,
    builder: options.nonempty === true ? "present" : "null", command: "null" });
  const original = (kind: Kind): unknown => ({ result: { type: "function", className: kind === "save-handler" ? "AsyncFunction" : "Function",
    description: kind === "move" ? currentPcbStringProducerSources.move : "synthetic wrapper", objectId: fresh(kind, false) } });
  const runner = new CurrentPcbStringMoveRunner({
    assertCurrent: (): void => {
      if (pendingArrival !== undefined) {
        if (options.mutateRawAfterArrival === true) { pendingArrival.reply.result.value = '{"altered":true}'; }
        if (options.loseAfterSample === pendingArrival.phase) { lost = true; }
        pendingArrival = undefined;
      }
      if (lost) { throw new Error("OWNER_LOST"); }
    },
    request: (command): Promise<unknown> => {
      commands.push(command); assert.equal(command.sessionId, owner.sessionId); assert.ok(Object.isFrozen(command.params));
      if (command.movePhase === options.fail || command.movePhase === "release" && options.releaseFailure === true) {
        return Promise.reject(new Error("SYNTHETIC_TRANSPORT_FAILURE"));
      }
      let reply: unknown;
      switch (command.movePhase) {
        case "wrapper": { reply = original("rpc-wrapper"); break; }
        case "handler": { reply = original("save-handler"); break; }
        case "select": { reply = original("move"); break; }
        case "properties": {
          const target = handles.get(command.params.objectId); assert.ok(target !== undefined);
          const profile = target.kind === "move" ? CURRENT_PCB_STRING_PRODUCER_LOCATIONS.move : CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS[target.kind];
          if (target.list) {
            reply = { result: [target.kind === "rpc-wrapper" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) =>
              property(String(index), { type: "object", subtype: "internal#scope", className: "Object", description,
                objectId: fresh(target.kind, false) }, true, true, true)) };
          } else {
            const props = [property("length", { type: "number", value: profile.parameterCount }), property("name", { type: "string", value: "" })];
            if (target.kind === "move") { props.push(property("arguments", { type: "object", subtype: "null", value: null }, false, false),
              property("caller", { type: "object", subtype: "null", value: null }, false, false),
              property("prototype", { type: "object", className: "Object", objectId: "prototype" }, true, false)); }
            reply = { result: props, internalProperties: [
              { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } },
              { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
                scriptId: owner.scriptId, lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } } },
              { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]",
                objectId: fresh(target.kind, true) } },
            ] };
          } break;
        }
        case "sample": {
          const incoming = { result: { type: "string", value: options.invalid === true ? '{"unexpected":true}' : raw } };
          pendingArrival = { phase: "sample", reply: incoming }; reply = incoming; break;
        }
        case "startup": {
          const incoming = { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-string-startup-state.v1",
          documentUuid: identity.documentUuid, useWebgl: false, multiThreadingOnOpen: true, rebuildingRatlineInWorker: false,
          needFlushService: false, modelIsBuilt: true, controllerIsBuilt: true, engineHighlightReady: true }) } };
          pendingArrival = { phase: "startup", reply: incoming }; reply = incoming; break;
        }
        case "release": { if (options.lostAfterRelease === true) { lost = true; } reply = {}; break; }
        default: { throw new Error("UNEXPECTED_COMMAND"); }
      }
      return Promise.resolve(reply);
    },
  }, owner, identity);
  return { runner, commands, lose: (): void => { lost = true; }, restore: (): void => { lost = false; }, raw };
}

void test("owned move collector takes twelve fixed effect-checked requests and retains original raw text", async () => {
  const fixture = harness(), observed = await fixture.runner.observe();
  assert.equal(fixture.commands.length, CURRENT_PCB_STRING_MOVE_REQUEST_COUNT);
  assert.deepEqual(fixture.commands.map(value => value.movePhase),
    ["wrapper", "properties", "properties", "handler", "properties", "properties", "select", "properties", "properties", "sample", "startup", "release"]);
  assert.ok(fixture.commands.filter(value => value.method === "Runtime.evaluate" || value.method === "Runtime.callFunctionOn")
    .every(value => value.params.throwOnSideEffect && !value.params.awaitPromise && !value.params.userGesture && value.params.objectGroup === CURRENT_PCB_STRING_MOVE_OBJECT_GROUP));
  assert.equal(fixture.runner.requireOriginal(observed), observed);
  assert.equal(requireOriginalCurrentPcbStringMoveReply(observed).result.value, fixture.raw);
  const replies = requireOriginalCurrentPcbStringMoveReplies(observed);
  assert.equal(replies.move, requireOriginalCurrentPcbStringMoveReply(observed));
  assert.ok(replies.startup.result.value.includes(`"documentUuid":"${identity.documentUuid}"`));
  assert.equal(observed.startup.state.documentUuid, identity.documentUuid);
  assert.equal(observed.startup.route, "single-result-terminal-compatible");
  assert.equal(observed.startup.startupCallbackCompletionVerified, false);
  assert.equal(observed.noRetainedMoveState, true); assert.equal(observed.executionAuthorized, false);
  assert.equal(observed.queueCompletionVerified, false); assert.equal(observed.writeDestinationsContained, false);
  assert.throws(() => fixture.runner.requireOriginal(structuredClone(observed)), /MOVE_OBSERVATION/u);
  assert.throws(() => requireOriginalCurrentPcbStringMoveReply(structuredClone(observed)), /MOVE_OBSERVATION/u);
  const other = harness(), otherObserved = await other.runner.observe();
  assert.throws(() => fixture.runner.requireOriginal(otherObserved), /MOVE_OBSERVATION/u);
  await assert.rejects(fixture.runner.observe(), /MOVE_OBSERVATION/u); assert.equal(fixture.commands.length, 12);
});

void test("move collector reports nonempty retained state without calling its producer or granting eligibility", async () => {
  const fixture = harness({ nonempty: true }), observed = await fixture.runner.observe();
  assert.equal(observed.noRetainedMoveState, false); assert.equal(observed.state.timer, "present");
  assert.equal(observed.state.selectionCount, 1); assert.equal(observed.state.command, "null");
  assert.equal(observed.executionAuthorized, false); assert.equal(observed.continuousObservation, false);
});

void test("move and startup replies are captured before post-arrival owner callbacks, including refused arrivals", async () => {
  const changed = harness({ mutateRawAfterArrival: true }), observation = await changed.runner.observe();
  const originals = requireOriginalCurrentPcbStringMoveReplies(observation);
  assert.equal(originals.move.result.value, changed.raw); assert.equal(observation.startup.state.documentUuid, identity.documentUuid);
  assert.equal(originals.startup.result.value.includes('"altered"'), false);
  for (const loseAfterSample of ["sample", "startup"] as const) {
    const fixture = harness({ loseAfterSample, mutateRawAfterArrival: true });
    await assert.rejects(fixture.runner.observe(), (error: unknown) => {
      const replies = requireOriginalCurrentPcbStringMoveFailureReplies(error);
      assert.equal(replies.move?.result.value, fixture.raw);
      assert.equal(replies.startup !== null, loseAfterSample === "startup");
      assert.equal(replies.startup?.result.value.includes('"altered"') ?? false, false);
      assert.equal(currentPcbStringMoveFailureDetail(error)?.cleanup, "released"); return true;
    });
  }
});

void test("move failures consume the attempt, retain the raw primary sample and independently release the original group", async () => {
  for (const fail of ["wrapper", "select", "sample", "startup"] as const) {
    const fixture = harness({ fail, releaseFailure: true });
    await assert.rejects(fixture.runner.observe(), (error: unknown) => {
      assert.ok(error instanceof AggregateError); assert.equal(error.errors.length, 2);
      const detail = currentPcbStringMoveFailureDetail(error); assert.ok(detail !== null);
      assert.equal(detail.phase, fail); assert.equal(detail.cleanup, "failed"); assert.equal(detail.sampleRetained, fail === "startup");
      assert.equal(detail.startupSampleRetained, false);
      assert.equal(requireOriginalCurrentPcbStringMoveFailureReply(error)?.result.value ?? null, fail === "startup" ? fixture.raw : null);
      assert.equal(requireOriginalCurrentPcbStringMoveFailureReplies(error).startup, null);
      assert.equal(currentPcbStringMoveFailureDetail(structuredClone(error)), null); return true;
    });
    assert.equal(fixture.commands.at(-1)?.movePhase, "release"); const count = fixture.commands.length;
    await assert.rejects(fixture.runner.observe()); assert.equal(fixture.commands.length, count);
  }
  for (const invalid of [{ invalid: true }, { wrongDocument: true }]) {
    const fixture = harness(invalid);
    await assert.rejects(fixture.runner.observe(), (error: unknown) => {
      assert.equal(currentPcbStringMoveFailureDetail(error)?.cleanup, "released");
      assert.equal(currentPcbStringMoveFailureDetail(error)?.sampleRetained, true);
      assert.ok(requireOriginalCurrentPcbStringMoveFailureReply(error) !== null); return true;
    });
  }
});

void test("move owner loss before dispatch, during release or after issuance is sticky", async () => {
  const initial = harness({ lostInitially: true }); await assert.rejects(initial.runner.observe()); assert.equal(initial.commands.length, 0);
  const during = harness({ lostAfterRelease: true });
  await assert.rejects(during.runner.observe(), (error: unknown) => {
    assert.equal(currentPcbStringMoveFailureDetail(error)?.phase, "owner-final");
    assert.equal(currentPcbStringMoveFailureDetail(error)?.cleanup, "released");
    assert.equal(currentPcbStringMoveFailureDetail(error)?.startupSampleRetained, true);
    assert.ok(requireOriginalCurrentPcbStringMoveFailureReplies(error).startup !== null); return true;
  });
  const after = harness(), observed = await after.runner.observe(); after.lose();
  assert.throws(() => after.runner.requireOriginal(observed), /OWNER_LOST/u); after.restore();
  assert.throws(() => after.runner.requireOriginal(observed), /MOVE_OBSERVATION/u);
  assert.throws(() => requireOriginalCurrentPcbStringMoveReply({ ...observed }));
});

void test("finite-effect join requires original current packets and leaves real destination gaps explicit", async () => {
  const move = harness(), peer = createCurrentPcbStringWorkerProducerResponder(identity);
  let lost = false;
  const worker = new CurrentPcbStringWorkerProducerRunner({
    assertCurrent: (): void => { if (lost) { throw new Error("WORKER_OWNER_LOST"); } },
    request: (command): Promise<unknown> => {
      const request: Record<string, unknown> = { method: command.method, workerProducerPhase: command.workerProducerPhase };
      if (command.method === "Runtime.getProperties" || command.method === "Runtime.callFunctionOn") { request["objectId"] = command.params.objectId; }
      if (command.method === "Runtime.callFunctionOn") {
        for (const [index, argument] of command.params.arguments.entries()) { request[`workerArgument${index}`] = argument.objectId; }
      }
      return Promise.resolve(peer.reply(request));
    },
  }, { sessionId: "worker-session", scriptId: "worker-script-1", uniqueContextId: "worker-context" }, identity);
  try {
    const moveObservation = await move.runner.observe(), workerObservation = await worker.observe();
    const report = inspectCurrentPcbStringFiniteEffects(move.runner, moveObservation, worker, workerObservation);
    assert.equal(report.originalRunnerObservationsMatched, true); assert.equal(report.observedNecessaryConditionsMatch, true);
    assert.equal(report.writeDestinationsContained, false); assert.equal(report.executionAuthorized, false);
    assert.equal(report.queueCompletionVerified, false); assert.equal(report.saveAuthorized, false);
    assert.ok(report.remaining.some(value => value.includes("lexical receivers")));
    assert.ok(report.remaining.some(value => value.includes("ratline single-result")));
    assert.ok(report.destinations.excludedBeforeDispatch.includes("cloud-upload"));
    assert.ok(report.destinations.excludedBeforeDispatch.includes("persistent-upload-or-replay-cache"));
    assert.throws(() => inspectCurrentPcbStringFiniteEffects(move.runner, structuredClone(moveObservation), worker, workerObservation));
    assert.throws(() => inspectCurrentPcbStringFiniteEffects(move.runner, moveObservation, worker, structuredClone(workerObservation)));
    const active = harness({ nonempty: true }), activeObservation = await active.runner.observe();
    const refused = inspectCurrentPcbStringFiniteEffects(active.runner, activeObservation, worker, workerObservation);
    assert.equal(refused.observedNecessaryConditionsMatch, false); assert.deepEqual(refused.unmet, ["move-has-no-retained-state"]);
    // Shadowed methods cannot suppress the maintained private-owner check.
    Object.defineProperty(worker, "requireOriginal", { value: (): never => { throw new Error("SHADOW_MUST_NOT_RUN"); } });
    assert.equal(inspectCurrentPcbStringFiniteEffects(move.runner, moveObservation, worker, workerObservation).executionAuthorized, false);
    const originalMove = Object.getOwnPropertyDescriptor(CurrentPcbStringMoveRunner.prototype, "requireOriginal");
    const originalWorker = Object.getOwnPropertyDescriptor(CurrentPcbStringWorkerProducerRunner.prototype, "requireOriginal");
    assert.ok(originalMove !== undefined && originalWorker !== undefined);
    try {
      CurrentPcbStringMoveRunner.prototype.requireOriginal = (): typeof moveObservation => moveObservation;
      CurrentPcbStringWorkerProducerRunner.prototype.requireOriginal = (): ReturnType<CurrentPcbStringWorkerProducerRunner["requireOriginal"]> => ({});
      lost = true;
      assert.throws(() => inspectCurrentPcbStringFiniteEffects(move.runner, moveObservation, worker, workerObservation), /WORKER_OWNER_LOST/u);
      move.lose();
      assert.throws(() => inspectCurrentPcbStringFiniteEffects(move.runner, moveObservation, worker, workerObservation), /OWNER_LOST/u);
    } finally {
      Object.defineProperty(CurrentPcbStringMoveRunner.prototype, "requireOriginal", originalMove);
      Object.defineProperty(CurrentPcbStringWorkerProducerRunner.prototype, "requireOriginal", originalWorker);
    }
  } finally { peer.close(); }
});

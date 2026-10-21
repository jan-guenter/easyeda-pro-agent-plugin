import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbStringServerClockCommand } from "../src/current-pcb-string-server-clock.ts";
import { currentPcbStringServerClockWire } from "../src/current-pcb-string-server-clock-wire.ts";

const identity = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), windowTabId: "original-window" };
const user = JSON.stringify({ uuid: "f".repeat(32), nickname: "nick", username: "user", avatar: "" });
function command(): Record<string, unknown> {
  return { id: 1, ...currentPcbStringServerClockCommand("original-worker", identity, user), sessionId: "original-session" };
}
void test("String server-clock wire reconstructs only its exact fixed command and bounded identity", () => {
  const selected = currentPcbStringServerClockWire(command(), 1);
  assert.deepEqual(selected.command, command());
  assert.equal(selected.request["saveClockWorkerUserText"], user); assert.equal(selected.request["saveClockPhase"], "server-time");
  assert.equal(Object.hasOwn(selected.request, "functionDeclaration"), false);
});
void test("String clock wire refuses caller program, altered flags, sparse/accessor arguments and unexpected phases", () => {
  const valid = currentPcbStringServerClockCommand("original-worker", identity, user);
  for (const changed of [
    { ...command(), saveClockPhase: "save" }, { ...command(), method: "Runtime.evaluate" },
    { ...command(), params: { ...valid.params, functionDeclaration: "async function(){return 1}" } },
    { ...command(), params: { ...valid.params, throwOnSideEffect: true } },
    { ...command(), params: { ...valid.params, awaitPromise: false } },
    { ...command(), params: { ...valid.params, arguments: [{ value: identity }] } },
    { ...command(), sessionId: "caller\nsession" }, { ...command(), unexpected: true },
  ]) { assert.throws(() => currentPcbStringServerClockWire(changed, 1)); }
  let reads = 0;
  const accessor = Object.defineProperty(command(), "params", { get(): never { reads += 1; throw new Error("getter"); } });
  assert.throws(() => currentPcbStringServerClockWire(accessor, 1), /WIRE/u);
  const proxy = new Proxy(command(), { ownKeys(): never { reads += 1; throw new Error("trap"); } });
  assert.throws(() => currentPcbStringServerClockWire(proxy, 1), /WIRE/u); assert.equal(reads, 0);
  const args = [{ value: identity }, { value: user }];
  Object.setPrototypeOf(args, { toJSON(): never { reads += 1; throw new Error("inherited serialization"); } });
  assert.throws(() => currentPcbStringServerClockWire({ ...command(), params: { ...valid.params, arguments: args } }, 1), /WIRE/u);
  assert.equal(reads, 0);
});

import { readPackedNativeProgram } from "./helpers/native-packed-program.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS, currentPcbStringActorClockCommand } from "../src/current-pcb-string-actor-clock.ts";
import { currentPcbStringActorClockWire } from "../src/current-pcb-string-actor-clock-wire.ts";

const IDENTITY = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32),
  documentUuid: "d".repeat(16), windowTabId: "window_1" });
void test("actor wire preserves exact fixed canonical command and flattens only actor target fields", () => {
  for (const phase of ["ui", "worker", "pcb"] as const) {
    const command = currentPcbStringActorClockCommand(phase, `original-${phase}-context`, IDENTITY);
    const raw = { id: 1, ...command, sessionId: phase === "worker" ? "worker-session" : "page-session" };
    const result = currentPcbStringActorClockWire(raw, 1);
    assert.equal(JSON.stringify(result.command), JSON.stringify(raw));
    assert.deepEqual(result.request, { action: "send", requestId: 1, method: "Runtime.callFunctionOn", sessionId: raw.sessionId,
      actorClockPhase: phase, uniqueContextId: command.params.uniqueContextId,
      ...(phase === "pcb" ? {} : { actorProjectUuid: IDENTITY.projectUuid, actorBranchUuid: IDENTITY.branchUuid,
        actorDocumentUuid: IDENTITY.documentUuid, actorWindowTabId: IDENTITY.windowTabId }) });
  }
});
void test("actor wire refuses foreign functions, options, remote handles, fields, identity and argument shape", () => {
  for (const phase of ["ui", "worker", "pcb"] as const) {
    const command = currentPcbStringActorClockCommand(phase, "context", IDENTITY), raw = { id: 1, ...command, sessionId: "session" };
    for (const change of [{ functionDeclaration: "function(){return 1;}" }, { throwOnSideEffect: false }, { awaitPromise: true },
      { userGesture: true }, { objectId: "external" }, { objectGroup: "foreign" }, { uniqueContextId: "bad\ncontext" },
      { arguments: [{ objectId: "external" }] }, { arguments: [{ value: { ...IDENTITY, windowTabId: "bad/context" } }] },
      { arguments: [{ value: { ...IDENTITY, extra: true } }] }]) {
      assert.throws(() => currentPcbStringActorClockWire({ ...raw, params: { ...raw.params, ...change } }, 1), /OUTBOUND/u);
    }
    if (phase !== "pcb") { assert.throws(() => currentPcbStringActorClockWire({ ...raw, params: { ...raw.params, arguments: [] } }, 1), /OUTBOUND/u); }
    assert.throws(() => currentPcbStringActorClockWire({ ...raw, actorClockPhase: "UI" }, 1), /OUTBOUND/u);
    assert.throws(() => currentPcbStringActorClockWire({ ...raw, extra: true }, 1), /OUTBOUND/u);
    assert.throws(() => currentPcbStringActorClockWire({ ...raw, method: "Runtime.evaluate" }, 1), /OUTBOUND/u);
    assert.throws(() => currentPcbStringActorClockWire(raw, 2), /OUTBOUND/u);
  }
});
void test("actor wire refuses hostile records without executing getters or proxy traps", () => {
  const command = currentPcbStringActorClockCommand("ui", "context", IDENTITY);
  let reads = 0;
  const raw = { id: 1, ...command, sessionId: "session" };
  const proxy = new Proxy(raw, { ownKeys(): never { reads += 1; throw new Error("unexpected trap"); } });
  assert.throws(() => currentPcbStringActorClockWire(proxy, 1), /OUTBOUND/u);
  Object.defineProperty(raw, "params", { get(): never { reads += 1; throw new Error("unexpected getter"); } });
  assert.throws(() => currentPcbStringActorClockWire(raw, 1), /OUTBOUND/u); assert.equal(reads, 0);
});
void test("native actor adapter contains exact fixed programs, purpose gates and six bounded fields", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  for (const [name, source] of Object.entries({ ActorClockUiFunction: CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS.ui,
    ActorClockWorkerFunction: CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS.worker,
    ActorClockPcbFunction: CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS.pcb })) {
    assert.equal(readPackedNativeProgram(native, name), source);
    assert.ok(native.includes(createHash("sha256").update(source).digest("hex")));
  }
  assert.ok(native.includes('if(!stringPrecreate) throw Error("actor-clock-purpose");'));
  assert.ok(native.includes("if (-not $StringPrecreate) {throw 'pcb-diagnostic-actor-clock-purpose'}"));
  assert.ok(native.includes("$owner.SendActorClock(")); assert.ok(native.includes("VerifyActorClockProtocolSmoke();"));
  assert.ok(native.includes('if(project!=null || branch!=null || document!=null || window!=null) throw Error("actor-clock-pcb-target");'));
});

/** Production observer and fixed codecs with an explicit inert registry and
 * native-transport seam. These cases grant no actual native owner or SQL. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Text } from "../src/core.ts";
import { CurrentProjectStructureTransportObserver } from "../src/current-project-structure-transport-observer.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES as SITES, validateCurrentProjectStructureTransportCommand } from "../src/current-project-structure-transport-protocol.ts";
import type { CurrentProjectStructureTransportRole as Role } from "../src/current-project-structure-transport-protocol.ts";
import type { CurrentProjectStructureBodyReservation, CurrentProjectStructureMainPublication, CurrentProjectStructureTransportOrigin } from "../src/current-project-structure-transport-origin.ts";

function array(count: number, objectId: string): unknown { return { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId } }; }
async function fixture(mode: "success" | "foreign" | "send-lost" | "return-lost" | "xhr-failed" = "success"): Promise<Readonly<{
  observer: CurrentProjectStructureTransportObserver; reservation: CurrentProjectStructureBodyReservation; publication: CurrentProjectStructureMainPublication;
  resumes: string[]; enableBody: () => void; exit: () => void;
}>> {
  const operation = Object.freeze({ inertOperation: true }), owner = Object.freeze({ inertOwner: true });
  const origin: CurrentProjectStructureTransportOrigin = Object.freeze({ profile: "private.current-pcb-via-structure-transport-origin.v1" });
  const reservation: CurrentProjectStructureBodyReservation = Object.freeze({ profile: "private.current-project-structure-body-reservation.v1" });
  const publication: CurrentProjectStructureMainPublication = Object.freeze({ profile: "private.current-project-structure-main-publication.v1" });
  const packetValue = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ticket: 7, structureText: '{"tree":"original"}' });
  const bodyValue = Object.freeze({ ...packetValue, saveHeadTicket: 7, expectedStructureText: packetValue.structureText });
  const publicationValue = Object.freeze({ ...packetValue, structureSha256: sha256Text(packetValue.structureText) });
  const events: unknown[] = [], resumes: string[] = []; let bodyReady = false, consumed = false, exited = false, failed = false;
  const pushPause = (role: Role): void => { const site = SITES[role]; events.push({ method: "Debugger.paused", sessionId: "worker", params: {
    reason: "other", hitBreakpoints: [`point-${role}`], callFrames: [{ callFrameId: `frame-${role}`, functionName: site.name,
      location: { scriptId: mode === "foreign" ? "foreign" : "source", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
      functionLocation: { scriptId: "source", lineNumber: site.lineNumber, columnNumber: site.functionColumn } }] } }); };
  pushPause(mode === "xhr-failed" ? "failed" : "send");
  const binding = Object.freeze({ sessionId: "worker", scriptId: "source", uniqueContextId: "context", prepared: {},
    request: async (input: unknown, cleanup: boolean): Promise<unknown> => {
      // Deliver the synthetic acknowledgment after an actual Promise boundary.
      await Promise.resolve();
      const command = validateCurrentProjectStructureTransportCommand(input); assert.equal(cleanup, false);
      if (command.phase === "project-structure-transport-capture") { return array(7, "intrinsics"); }
      if (command.phase === "project-structure-transport-arm") { return { breakpointId: `point-${command.role}`, actualLocation: command.params.location }; }
      if (command.phase === "project-structure-transport-frame") { return array(SITES[command.role].length, `capture-${command.role}`); }
      if (command.phase === "project-structure-transport-send") { assert.equal(command.params.arguments[0].objectId, "intrinsics"); return array(3, "send-packet"); }
      if (command.phase === "project-structure-transport-value") { return { result: { type: "object", value: packetValue } }; }
      if (command.phase === "project-structure-transport-returned") { assert.equal(command.params.arguments[0].objectId, "send-packet"); return array(2, "return-packet"); }
      assert.equal(command.phase, "project-structure-transport-resume");
      if (command.phase === "project-structure-transport-resume") {
        resumes.push(command.role); if (mode === `${command.role === "send" ? "send" : "return"}-lost`) { throw new Error("original resume acknowledgment lost"); }
        events.push({ method: "Debugger.resumed", sessionId: "worker", params: {} }); if (command.role === "send") { pushPause("returned"); }
      }
      return {};
    }, nextEvent: (): Promise<unknown> => { const next = events.shift(); assert.notEqual(next, undefined); return Promise.resolve(next); },
    assertCurrent: (): Promise<void> => { assert.equal(failed, false); return Promise.resolve(); }, assertOperationPending: (): void => { assert.equal(failed, false); },
    assertOriginalGenerationExited: (): Promise<void> => { assert.equal(exited, true); return Promise.resolve(); }, fail: (): void => { failed = true; } });
  const current = (o: unknown, w: unknown, p: unknown): void => { assert.equal(o, origin); assert.equal(w, owner); assert.equal(p, operation); };
  const native = {
    requireOriginalCurrentProjectStructureTransportOrigin: (o: unknown, w: unknown, p: unknown): unknown => { current(o, w, p); return binding; },
    requireOriginalCurrentProjectStructureTransportBodyReservation: (r: unknown, o: unknown, w: unknown, p: unknown): unknown => { current(o, w, p); assert.equal(r, reservation); assert.equal(bodyReady, true); return bodyValue; },
    consumeOriginalCurrentProjectStructureMainPublication: (v: unknown, w: unknown, p: unknown): unknown => { current(origin, w, p); assert.equal(v, publication); assert.equal(bodyReady, true); assert.equal(consumed, false); consumed = true; return publicationValue; },
    requireOriginalCurrentProjectStructureTransportMainPublication: (v: unknown, o: unknown, w: unknown, p: unknown): unknown => { current(o, w, p); assert.equal(v, publication); assert.equal(consumed, true); return publicationValue; },
  };
  const url = new URL("../src/current-project-structure-transport-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`);
  assert.ok(typeof evaluate === "function"); Reflect.apply(evaluate, undefined, [(id: string): unknown => id === "./current-pcb-diagnostic-owner.ts" ? native : sourceRequire(id), loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentProjectStructureTransportObserver"]; assert.ok(typeof Constructor === "function");
  const observer: unknown = Reflect.construct(Constructor, [origin, owner, operation]); assert.ok(observer !== null && typeof observer === "object");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the explicit inert registry above differs; the compiled production collector and its private state run unchanged.
  const typed = observer as CurrentProjectStructureTransportObserver;
  return Object.freeze({ observer: typed, reservation, publication, resumes, enableBody: (): void => { bodyReady = true; }, exit: (): void => { exited = true; } });
}

void test("real registry rejects a serialized transport origin before dispatch", () => {
  assert.throws(() => new CurrentProjectStructureTransportObserver({ profile: "private.current-pcb-via-structure-transport-origin.v1" }, {}, {}), /ORIGINAL_ORIGIN/u);
});
void test("fixed transport requires body enrollment, exact send-return join and actual publication in order", async () => {
  const f = await fixture(); await f.observer.arm(); const held = await f.observer.observeSend();
  await assert.rejects(f.observer.observeSend(), /SEND_CONSUMED/u); assert.deepEqual(f.resumes, []);
  f.enableBody(); await f.observer.releaseSend(held, f.reservation); assert.deepEqual(f.resumes, ["send"]);
  await f.observer.observeReturned(held); assert.equal(f.observer.status().returnHeld, true);
  await f.observer.releaseReturned(held, f.publication); assert.deepEqual(f.resumes, ["send", "returned"]);
  assert.equal(f.observer.status().completed, true); assert.equal(f.observer.status().persistenceVerified, false);
  await assert.rejects(f.observer.releaseReturned(held, f.publication), /CONSUMED/u);
  f.exit(); await f.observer.retireAfterOriginalExit(); assert.equal(f.observer.status().retired, true);
});
void test("missing genuine body grant and a foreign source pause cause zero resumes", async () => {
  for (const mode of ["success", "foreign", "xhr-failed"] as const) {
    const f = await fixture(mode); await f.observer.arm();
    if (mode === "success") { const held = await f.observer.observeSend(); await assert.rejects(f.observer.releaseSend(held, f.reservation)); }
    else { await assert.rejects(f.observer.observeSend()); }
    assert.deepEqual(f.resumes, []); assert.equal(f.observer.status().failed, true); f.exit(); await f.observer.retireAfterOriginalExit();
  }
});
void test("lost send or return acknowledgment consumes that original continuation without replay", async () => {
  for (const mode of ["send-lost", "return-lost"] as const) {
    const f = await fixture(mode); await f.observer.arm(); const held = await f.observer.observeSend(); f.enableBody();
    if (mode === "send-lost") {
      await assert.rejects(f.observer.releaseSend(held, f.reservation), /acknowledgment lost/u); await assert.rejects(f.observer.releaseSend(held, f.reservation), /CONSUMED/u);
      assert.deepEqual(f.resumes, ["send"]);
    } else {
      await f.observer.releaseSend(held, f.reservation); await f.observer.observeReturned(held);
      await assert.rejects(f.observer.releaseReturned(held, f.publication), /acknowledgment lost/u); await assert.rejects(f.observer.releaseReturned(held, f.publication), /CONSUMED/u);
      assert.deepEqual(f.resumes, ["send", "returned"]);
    }
    assert.equal(f.observer.status().failed, true); f.exit(); await f.observer.retireAfterOriginalExit();
  }
});

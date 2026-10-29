/** Synthetic allocator/event scheduling only. No native origin, app, callback,
 * SQL driver, process/Job or full writer capacity is supplied by this fixture. */
import assert from "node:assert/strict";
import type { CurrentFootprintCopyMainCompletionOriginBindings as Bindings, CurrentFootprintCopyMainCompletionOrigin as Origin } from "../../src/current-footprint-copy-main-completion-origin.ts";
import type { CurrentFootprintCopyMainCompletionCommand as Command } from "../../src/current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainRequestHeldFinalPbBindings as Held, CurrentFootprintCopyMainRequestHeldFinalPb as HeldToken } from "../../src/current-footprint-copy-main-request-runner.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FUNCTIONS as FUNCTIONS, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER as ORDER,
  CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_SITES as SITES } from "../../src/current-footprint-copy-main-completion-source.ts";
import type { CurrentFootprintCopyMainCompletionSource as Source } from "../../src/current-footprint-copy-main-completion-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_PROGRAMS as PROGRAMS } from "../../src/current-footprint-copy-main-completion-programs.ts";
import { syntheticRequestPlan, syntheticRequestSource } from "./footprint-main-request-collector-fixture.ts";

type Event = ReturnType<Bindings["takeEvent"]>;
type Data = Readonly<Record<string, unknown>>;
const callback = "async()=>{let o=await hB(e,r,a.history_uuid,a.uuid);!o||o.is_lock||!Number(o.is_within_one_minute)?s=await bB(e,r,i,a):s=await OB(e,r,i,a,o)}";
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data => ({ name, value, writable, enumerable, configurable, isOwn: true });
const captured = (name: string, size: number): Data => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(size)})`, objectId: name } });
const value = Object.freeze({ historyUuid: "e".repeat(32), backendActorUuid: "c".repeat(32), observedProjectUpdatedAt: "2026-10-29 03:00:00", observedProjectModifierUuid: "c".repeat(32),
  originalCallbackAwaitCompleted: true, originalCommitAwaitCompleted: true, originalProjectUpdateAwaitCompleted: true,
  originalServiceAwaitCompleted: true, controllerBodyJoined: true, nativeSqlCompletionVerified: false,
  parserUploadPublicationCompleted: false, independentClosedSqlVerified: false, savedResultVerified: false, executionAuthorized: false });
const frameSizes = { save: 4, "transaction-enter": 2, "callback-enter": 5, branch: 6, append: 4, "branch-return": 7,
  "commit-enter": 2, "commit-return": 2, "transaction-return": 2, "save-post-transaction": 6, "project-sql": 4,
  "project-sql-caller": 6, "project-return": 4, "save-return": 6, "controller-return": 5 } as const;
interface State { current: boolean; heldCurrent: boolean; exited: boolean; retired: boolean; groupReleased: boolean; nextPause: number; failPhase: string; lostResume: boolean; foreignCaller: boolean; unexpectedResume: boolean }
export interface MainCompletionRunnerFixture { readonly token: Origin; readonly heldToken: HeldToken; readonly source: Source; readonly held: Held; readonly bindings: Bindings; readonly commands: Command[]; readonly state: State; readonly require: (input: unknown) => Bindings; readonly requireHeld: (input: unknown) => Held; readonly requireSource: (input: unknown) => void }
export function mainCompletionRunnerFixture(): MainCompletionRunnerFixture {
  const token = Object.freeze({ profile: "private.current-footprint-copy-main-completion-origin.v1", executionAuthorized: false } as const);
  const heldToken = Object.freeze({ profile: "private.current-footprint-copy-main-request-held-final-pb.v1", originalRequestAndSqlOwnerJoined: true,
    originalFinalPbStillHeld: true, allAllocatedRequestBreakpointsRemoved: true, nativeSqlCompletionVerified: false, executionAuthorized: false } as const);
  const source = Object.freeze({ profile: "private.current-footprint-copy-main-completion-source.v1", sourceSha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c", embeddedV8Validated: false, executionAuthorized: false } as const);
  const state = { current: true, heldCurrent: true, exited: false, retired: false, groupReleased: false, nextPause: 0,
    failPhase: "", lostResume: false, foreignCaller: false, unexpectedResume: false };
  const commands: Command[] = [], events: Event[] = [];
  const held: Held = Object.freeze({ scriptId: "app", finalPbFrameId: "original-final-pb", retainedArrayObjectId: "original-construction",
    controllerObjectId: "original-controller", actorObjectId: "original-actor", sqlObjectId: "original-sql", plan: syntheticRequestPlan, qualifiedSource: syntheticRequestSource,
    assertOriginal: (): Promise<void> => { assert.ok(state.current && state.heldCurrent && !state.exited, "original held lease changed"); return Promise.resolve(); } });
  function pause(): void {
    const stage = ORDER[state.nextPause]; if (stage === undefined) { return; } state.nextPause += 1;
    const site = SITES[stage];
    const fn = FUNCTIONS[site.role];
    const first = { callFrameId: `frame-${stage}`, functionName: site.name, location: { scriptId: "app", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
      functionLocation: { scriptId: "app", ...fn.functionLocation } };
    const caller = { callFrameId: "original-xB", functionName: state.foreignCaller ? "unrelated" : "xB", location: { scriptId: "app", lineNumber: 8572, columnNumber: 26_571 },
      functionLocation: { scriptId: "app", ...FUNCTIONS.project.functionLocation } };
    events.push({ method: "Debugger.paused", params: { reason: "other", hitBreakpoints: [`bp-${stage}`], callFrames: stage === "project-sql" ? [first, caller] : [first] } });
  }
  function response(command: Command): unknown {
    if (command.phase === "completion-source-arm") { return { breakpointId: `bp-${command.stage}`, actualLocation: command.params.location }; }
    if (command.phase === "completion-callback-arm") { return { breakpointId: "bp-callback-enter" }; }
    if (command.phase === "completion-frame") { return captured(`frame-value-${command.role}`, frameSizes[command.role]); }
    if (command.phase === "completion-join") { return command.stage === "controller-return" ? { result: { type: "object", value } } : captured(`packet-${command.stage}`, PROGRAMS[command.stage].length); }
    if (command.phase === "completion-properties") {
      if (command.params.objectId === "packet-transaction-enter") {
        return { result: [property("0", { type: "object", objectId: "transaction-frame" }, true, true), property("1", { type: "object", objectId: "save-packet" }, true, true),
          property("2", { type: "function", className: "AsyncFunction", description: callback, objectId: "original-callback" }, true, true),
          property("length", { type: "number", value: 3 }, true, false, false)],
          internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] };
      }
      assert.equal(command.params.objectId, "original-callback");
      return { result: [property("name", { type: "string", value: "" }), property("length", { type: "number", value: 0 })], internalProperties: [
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "app", ...FUNCTIONS.callback.functionLocation } } },
        { name: "[[Prototype]]", value: { type: "object", className: "AsyncFunction", objectId: "async-prototype" } },
        { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[4]", objectId: "original-scopes" } }] };
    }
    if (command.method === "Debugger.resume") { events.push({ method: "Debugger.resumed", params: {} }); pause(); }
    if (command.phase === "completion-release") { state.groupReleased = true; }
    return {};
  }
  const bindings: Bindings = Object.freeze({ heldFinalPb: heldToken, source, scriptId: "app",
    assertOriginal: (): Promise<void> => { assert.ok(state.current && !state.exited && !state.retired, "original completion owner changed"); return Promise.resolve(); },
    assertCleanup: (): Promise<void> => { assert.ok(state.current && !state.retired, "original cleanup owner changed"); return Promise.resolve(); },
    assertOriginalGenerationExited: (): Promise<void> => { assert.ok(state.exited, "original root/Job remains live"); events.length = 0; return Promise.resolve(); },
    request: (command: Command): Promise<unknown> => {
      commands.push(command); if (state.failPhase === command.phase) { return Promise.reject(new Error("lost completion allocation acknowledgement")); }
      const reply = response(command);
      if (state.lostResume && command.phase === "completion-resume-final-pb") { return Promise.reject(new Error("lost original PB resume acknowledgement")); }
      return Promise.resolve(reply);
    },
    pump: (): Promise<void> => Promise.resolve(), takeEvent: (): Event => {
      if (state.unexpectedResume) { state.unexpectedResume = false; return { method: "Debugger.resumed", params: {} }; }
      return events.shift() ?? null;
    }, retire: (): Promise<void> => { assert.ok(state.exited || state.groupReleased && events.length === 0); state.retired = true; return Promise.resolve(); } });
  return { token, heldToken, source, held, bindings, commands, state,
    require: (input: unknown): Bindings => { assert.equal(input, token); assert.ok(!state.retired); return bindings; },
    requireHeld: (input: unknown): Held => { assert.equal(input, heldToken); assert.ok(state.heldCurrent); return held; },
    requireSource: (input: unknown): void => { assert.equal(input, source); } };
}

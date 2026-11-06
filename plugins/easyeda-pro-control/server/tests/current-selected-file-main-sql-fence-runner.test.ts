/** Production runner scheduling against a deliberately synthetic CDP peer.
 * Only source/transport issuance are substituted; actual cursor, decoders,
 * ordering, predicates, counters and mutation-hold logic run unchanged. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "../src/current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendRunner, CurrentFootprintCopyMainBackendTransport } from "../src/current-footprint-copy-main-backend-runner.ts";
import type { CurrentSelectedFileMainSqlFenceCommand as SqlCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as EARLY_ID } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "../src/current-selected-file-main-sql-fence-source.ts";
import { CurrentFootprintCopyMainBackendRunner as OriginalRunner } from "../src/current-footprint-copy-main-backend-runner.ts";
import { mainBackendModule, mainBackendTransportFixture } from "./helpers/footprint-main-backend-runner-fixture.ts";
import type { CurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";
import { validateCurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";

type Data = Record<string, unknown>;
const capability = Object.freeze({ profile: "private.selected-file-main-sql-fence-bootstrap.v1" as const, executionAuthorized: false as const });
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function nativeArray(): Data {
  return { result: [...["Database", "Statement", ""].map((name, index) => property(String(index), { type: "function", className: "Function", description: `function ${name}() { [native code] }`, objectId: `native${String(index)}` }, true, true)),
    property("length", { type: "number", value: 3 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array" } }] };
}
function nativeMetadata(id: string): Data {
  let name = ""; if (id === "native0") { name = "Database"; } else if (id === "native1") { name = "Statement"; }
  const result = [property("name", { type: "string", value: name }), property("length", { type: "number", value: 0 })];
  if (name !== "") { result.push(property("prototype", { type: "object", objectId: "prototype" }, false, false, false)); }
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "scopes" } }] };
}
async function fixture(delta = 0): Promise<Readonly<{ runner: CurrentFootprintCopyMainBackendRunner; phases: string[]; transport: CurrentFootprintCopyMainBackendTransport;
  injectMutation: () => void; injectDriver: () => void; resumes: () => number; deferPoll: () => Readonly<{ started: Promise<unknown>; release: () => void }> }>> {
  const base = mainBackendTransportFixture();
  const ids = new Map<number, number>(), phases: string[] = [], queue: Data[] = [], retainedRegistration: Data[] = [];
  let holdRegistration = false, normalResumes = 0, runner: CurrentFootprintCopyMainBackendRunner | null = null, sqlResumes = 0;
  let heldPoll: Readonly<{ started: PromiseWithResolvers<null>; settle: PromiseWithResolvers<null> }> | null = null;
  const event = (method: string, params: Data): void => { queue.push({ method, params }); };
  const location = (site: keyof typeof SOURCE.sites): Data => ({ scriptId: "app", lineNumber: SOURCE.sites[site].lineNumber, columnNumber: SOURCE.sites[site].breakpointColumnNumber + (site === "import" ? delta : 0) });
  const pause = (site: keyof typeof SOURCE.sites): void => { event("Debugger.paused", { reason: "other", hitBreakpoints: [site === "import" ? EARLY_ID : `sql-${site}`],
    callFrames: [{ callFrameId: `frame-${site}`, location: location(site) }] }); };
  const sqlSend = (command: SqlCommand, id: number): Promise<void> => {
    phases.push(command.phase); let result: unknown = {};
    if (command.phase === "sql-fence-early-arm") { result = { breakpointId: EARLY_ID, locations: [] }; }
    else if (command.phase === "sql-fence-after-imports-arm" || command.phase === "sql-fence-arm") {
      const site = command.phase === "sql-fence-after-imports-arm" ? "afterImports" : command.site; result = { breakpointId: `sql-${site}`, actualLocation: location(site) };
    } else if (command.phase === "sql-fence-resume") {
      sqlResumes += 1; event("Debugger.resumed", {}); if (sqlResumes === 1) { pause("afterImports"); }
      else { holdRegistration = false; queue.push(...retainedRegistration.splice(0)); }
    } else if (command.phase === "sql-fence-frame" || command.phase === "sql-fence-capture" || command.phase === "sql-fence-native-frame") {
      let count = 3; if (command.phase === "sql-fence-frame") { count = 4; } else if (command.phase === "sql-fence-capture") { count = 9; }
      result = { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId: command.phase } };
    } else if (command.phase === "sql-fence-properties") { result = command.params.objectId === "sql-fence-native-frame" ? nativeArray() : nativeMetadata(command.params.objectId); }
    else if (command.phase === "sql-fence-require") { result = { result: { type: "boolean", value: true } }; }
    queue.push({ id, result }); return Promise.resolve();
  };
  const transport: CurrentFootprintCopyMainBackendTransport = Object.freeze({
    assertCurrent: (): Promise<void> => base.transport.assertCurrent(),
    send: (command: Command, id: number): Promise<void> => {
      phases.push(command.phase); const local = base.commands.length + 1; ids.set(local, id);
      if (command.phase === "resume") {
        normalResumes += 1;
        if (normalResumes === 1) { holdRegistration = true; event("Debugger.resumed", {}); event("Debugger.scriptParsed", { scriptId: "app", url: "file:///synthetic/app.js", executionContextId: 1 }); pause("import"); }
      }
      return base.transport.send(command, local);
    },
    poll: async (): Promise<string> => {
      if (heldPoll !== null) { const original = heldPoll; original.started.resolve(null); await original.settle.promise; assert.equal(heldPoll, original); heldPoll = null; }
      for (;;) {
        const ready = queue.shift(); if (ready !== undefined) { return Buffer.from(`${JSON.stringify(ready)}\0`).toString("base64"); }
        const text = Buffer.from(await base.transport.poll(false), "base64").toString(); if (text === "") { return ""; }
        const value: unknown = JSON.parse(text.slice(0, -1)); assert.ok(value !== null && typeof value === "object");
        if (Object.hasOwn(value, "id")) { const id: unknown = Reflect.get(value, "id"); assert.ok(typeof id === "number"); Reflect.set(value, "id", ids.get(id)); }
        let held = false;
        if (!Object.hasOwn(value, "id") && holdRegistration) {
          const method: unknown = Reflect.get(value, "method");
          if (method === "Debugger.resumed" || method === "Debugger.scriptParsed") { held = true; }
          if (method === "Debugger.breakpointResolved" || method === "Debugger.paused") {
            // Deliberate inert protocol data, not an authority cast.
            retainedRegistration.push(Object.fromEntries(Object.entries(value))); held = true;
          }
        }
        if (!held) { return Buffer.from(`${JSON.stringify(value)}\0`).toString("base64"); }
      }
    },
  });
  const module = await mainBackendModule({
    "./current-footprint-copy-main-request-source.ts": {
      qualifyCurrentFootprintCopyMainRequestSource: (source: unknown): unknown => { assert.equal(source, "synthetic-complete-app-source"); return capability; },
      requireCurrentFootprintCopyMainRequestSource: (source: unknown): void => { assert.equal(source, capability); },
    },
    "./current-selected-file-main-sql-fence-source.ts": { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE: SOURCE,
      qualifyCurrentSelectedFileMainSqlFenceSource: (source: unknown): void => { assert.equal(source, "synthetic-complete-app-source"); } },
    "./current-selected-file-main-sql-fence-bootstrap.ts": {
      requireCurrentSelectedFileMainSqlFenceBootstrap: (token: unknown, original: unknown): string => { assert.equal(token, capability); assert.equal(original, transport); return String.raw`C:\Synthetic\fixture.eprj2`; },
      sendCurrentSelectedFileMainSqlFenceCommand: (token: unknown, original: unknown, command: SqlCommand, id: number): Promise<void> => {
        assert.equal(token, capability); assert.equal(original, runner); return sqlSend(command, id);
      },
      sendOriginalCurrentPcbViaMainCommand: (token: unknown, original: unknown, command: CurrentPcbViaMainCommand, id: number): Promise<void> => {
        assert.equal(token, capability); assert.equal(original, runner); validateCurrentPcbViaMainCommand(command); phases.push(command.phase);
        let result: unknown = command.phase === "via-main-construction-require" ? { result: { type: "boolean", value: true } } : { result: [] };
        if (command.method === "Debugger.setBreakpoint") { const point = command.params["location"]; assert.ok(point !== null && typeof point === "object"); result = { breakpointId: `via-${String(Reflect.get(point, "columnNumber"))}`, actualLocation: point }; }
        queue.push({ id, result }); return Promise.resolve();
      },
    },
  });
  runner = new module.Constructor(transport, undefined, capability);
  return { runner, phases, transport, injectMutation: (): void => { pause("run"); }, injectDriver: (): void => { pause("driver"); }, resumes: (): number => normalResumes + sqlResumes,
    deferPoll: () => { assert.equal(heldPoll, null); const original = { started: Promise.withResolvers<null>(), settle: Promise.withResolvers<null>() }; heldPoll = original;
      return { started: original.started.promise, release: (): void => { original.settle.resolve(null); } }; } };
}
void test("actual runner arms every selected-file site before SQLite import and retains its original fence after construction", async () => {
  const f = await fixture(); await f.runner.observe();
  assert.deepEqual(f.phases.slice(0, 6), ["runtime-enable", "debugger-enable", "sql-fence-early-arm", "registration-arm", "run-waiting", "resume"]);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-arm").length, 20); assert.equal(f.resumes(), 4);
  assert.equal(f.runner.selectedSqlFenceState()["ready"], true); assert.equal(f.runner.selectedSqlFenceState()["conditionalBreakpoints"], 20);
  f.injectMutation(); await f.runner.pumpSelectedSqlFence(); const before = f.phases.length;
  assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "run"); assert.equal(f.runner.selectedSqlFenceState()["mutationsResumed"], 0);
  await f.runner.pumpSelectedSqlFence(); assert.equal(f.resumes(), 4); assert.equal(f.phases.length, before);
  await assert.rejects(f.runner.prepareNormalClose(), /RETAIN_THROUGH_EXIT/u); await assert.rejects(f.runner.release(), /RETAIN_THROUGH_EXIT/u);
});
void test("an import pause at another actual column refuses before SQLite import continuation or conditional arming", async () => {
  const f = await fixture(1); await assert.rejects(f.runner.observe(), /SELECTED_SQL_LOCATION/u);
  assert.equal(f.phases.includes("sql-fence-arm"), false); assert.equal(f.resumes(), 1);
});
void test("the production original bootstrap issuer rejects a matching token and bare fake transport before sending", () => {
  let sent = 0; const transport: CurrentFootprintCopyMainBackendTransport = { assertCurrent: (): Promise<void> => Promise.resolve(),
    send: (): Promise<void> => { sent += 1; return Promise.resolve(); }, poll: (): Promise<string> => Promise.resolve("") };
  assert.throws(() => new OriginalRunner(transport, undefined, structuredClone(capability)), /SELECTED_SQL_BOOTSTRAP/u); assert.equal(sent, 0);
});
void test("the actual Via cursor shares a retained late poll, arms exact source points and keeps the persistent driver held", async () => {
  const f = await fixture(); await f.runner.observe(); const original = await f.runner.beginViaMainObservation();
  const sites = [[1164, 2540], [8573, 1663], [8572, 27_776]];
  for (const [lineNumber, columnNumber] of sites) { await original.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-site-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "app", lineNumber, columnNumber } } }), false); }
  f.runner.requireViaMainObservationArmed(original.origin); assert.equal(original.bindings.persistentDriverBreakpointId, "sql-driver");
  const delayed = f.deferPoll(); const first = f.runner.pumpSelectedSqlFence(); await delayed.started; const second = f.runner.pumpSelectedSqlFence();
  const before = f.phases.length;
  const command = original.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-properties", method: "Runtime.getProperties", params: { objectId: "retained", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), false);
  assert.equal(f.phases.length, before); delayed.release(); await Promise.all([first, second, command]); assert.equal(f.phases.length, before + 1);
  f.injectDriver(); const driver = await original.bindings.nextEvent(); assert.equal(driver.method, "Debugger.paused"); assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "driver");
  assert.throws(() => validateCurrentPcbViaMainCommand({ phase: "via-main-request-resume", method: "Debugger.resume", params: {} }), /NO_RESUME/u);
  await assert.rejects(original.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "sql-driver" } }), true));
  await assert.rejects(f.runner.beginViaMainObservation(), /ORIGINAL_CURSOR/u); assert.equal(f.resumes(), 4); assert.equal(f.runner.selectedSqlFenceState()["mutationsResumed"], 0);
});

/** Actual head scheduler, fixed programs and real readonly SQLite. Source
 * qualification/import metadata and opening events are explicitly synthetic;
 * these tests issue no original Electron, native or writer authority. */
/* oxlint-disable import/max-dependencies -- Keep real source/controller/custody implementations beside their explicitly synthetic source and native metadata seams. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintForwardHeadMain, CurrentFootprintForwardHeadMainHost } from "../src/current-footprint-forward-head-main.ts";
import { currentFootprintForwardHeadNativeWire } from "../src/current-footprint-forward-head-native.ts";
import type { CurrentFootprintForwardHeadMainCommand } from "../src/current-footprint-forward-head-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_MAIN_REQUESTS as LIMITS } from "../src/current-footprint-forward-head-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SQL } from "../src/current-selected-file-main-sql-fence-source.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_OPEN_POINT as OPEN } from "../src/current-footprint-forward-head-source.ts";
import { forwardHeadControllerFixture } from "./helpers/forward-head-controller-fixture.ts";

type Data = Record<string, unknown>;
const remote = (objectId: string, length: number): Data => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId } });
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function arrayMembers(values: readonly Data[]): Data {
  return { result: [...values.map((value, index) => property(String(index), value, true, true)), property("length", { type: "number", value: values.length }, true, false, false)],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array" } }] };
}
function metadata(id: string): Data {
  const name = ["Database", "Statement", "", "Date", "now"][Number(id.slice(-1))]; assert.ok(name !== undefined);
  const result = [property("name", { type: "string", value: name }), property("length", { type: "number", value: name === "Date" ? 7 : 0 })];
  if (name !== "" && name !== "now") { result.push(property("prototype", { type: "object", className: "Object", objectId: "prototype" }, false, false, false)); }
  if (name === "Date") { for (const key of ["now", "parse", "UTC"]) { result.push(property(key, { type: "function", className: "Function", description: `function ${key}() { [native code] }`, objectId: `date-${key}` }, true, false)); } }
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "scopes" } }] };
}
async function fixture(context: TestContext, loseResume = false, foreignResolved = false): Promise<Readonly<{
  main: CurrentFootprintForwardHeadMain; commands: CurrentFootprintForwardHeadMainCommand[]; resumes: string[]; queries: () => number;
}>> {
  let activeRead: CurrentFootprintForwardHeadMainCommand | null = null;
  let main: CurrentFootprintForwardHeadMain | null = null;
  const f = await forwardHeadControllerFixture(context, { acknowledge: (_command, requestId): void => { assert.ok(main !== null && activeRead !== null); main.consume(activeRead, requestId); } });
  const path = new URL("../src/current-footprint-forward-head-main.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const compiled: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof compiled === "function");
  Reflect.apply(compiled, undefined, [(name: string): unknown => {
    const actual: unknown = actualRequire(name);
    if (name === "./current-selected-file-main-sql-fence-source.ts" || name === "./current-footprint-forward-head-source.ts") {
      assert.ok(actual !== null && typeof actual === "object"); return { ...actual, qualifyCurrentSelectedFileMainSqlFenceSource: (): void => undefined, qualifyCurrentFootprintForwardHeadSource: (): void => undefined };
    } return actual;
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact production helper is transformed with only the two explicit synthetic complete-source qualifiers above.
  const Constructor = (loaded.exports as { CurrentFootprintForwardHeadMain: typeof CurrentFootprintForwardHeadMain }).CurrentFootprintForwardHeadMain;
  const commands: CurrentFootprintForwardHeadMainCommand[] = [], resumes: string[] = [];
  const host = Object.freeze<CurrentFootprintForwardHeadMainHost>({ source: Object.freeze({ before: f.inputs.before, sourcePlan: f.inputs.sourcePlan, reference: f.inputs.reference,
    rawWindowsPath: String.raw`C:\Synthetic\fixture.eprj2` }), assertCurrent: (): void => undefined, pendingRequestId: (): number | null => f.state.pending,
    qualifySource: (scriptId: string): Promise<string> => { assert.equal(scriptId, "app"); return Promise.resolve("explicit synthetic complete-source seam"); },
    constructionObjectId: (): string => "main",
    waitPause: (site): Promise<Awaited<ReturnType<CurrentFootprintForwardHeadMainHost["waitPause"]>>> => {
      const point = site === "open" ? OPEN : SQL.sites[site]; const columnNumber = site === "open" ? OPEN.columnNumber : SQL.sites[site].breakpointColumnNumber;
      return Promise.resolve(Object.freeze({ identity: Object.freeze({ site }), frameId: "frame", site, location: { scriptId: "app", lineNumber: point.lineNumber, columnNumber } }));
    },
    resume: async (held): Promise<void> => {
      resumes.push(held.site);
      await host.request({ phase: "forward-head-open", command: { phase: "resume", method: "Debugger.resume", params: {} } }, true);
      if (loseResume && held.site === "open") { throw new Error("synthetic original resume lost"); }
    },
    request: async (command, cleanup): Promise<unknown> => {
      const wire = currentFootprintForwardHeadNativeWire(command, commands.length + 1); assert.equal(wire.cleanup, cleanup); commands.push(command);
      if (command.phase === "forward-head-read") { activeRead = command; try { return await f.send(command.command); } finally { activeRead = null; } }
      const inner = command.command;
      if (inner.method === "Debugger.setBreakpointByUrl") { return { breakpointId: "2:1025:20050:(?:^|[\\\\/])app\\.js$", locations: [] }; }
      if (inner.method === "Debugger.setBreakpoint") {
        if (foreignResolved && command.phase === "forward-head-sql") { assert.ok(main !== null); main.resolve("foreign-after-point", inner.params.location); }
        return { breakpointId: command.phase === "forward-head-open" ? "open" : "after", actualLocation: inner.params.location };
      }
      if (inner.method === "Debugger.evaluateOnCallFrame") {
        if (command.phase === "forward-head-open") { return remote("frame", 4); }
        return inner.phase === "sql-fence-native-frame" ? remote("natives", 5) : remote("imports", 4);
      }
      if (inner.method === "Runtime.callFunctionOn") { return inner.phase === "sql-fence-capture" ? remote("scope", 11) : { result: { type: "boolean", value: true } }; }
      if (inner.method === "Runtime.getProperties") {
        if (inner.params.objectId === "imports") { return arrayMembers(["keeper", "context", "sqlite", "util"].map((name, index) => ({ type: index < 2 ? "function" : "object", className: index < 2 ? "Function" : "Object", objectId: name }))); }
        if (inner.params.objectId === "natives") { return arrayMembers(["Database", "Statement", "", "Date", "now"].map((name, index) => ({ type: "function", className: "Function", description: `function ${name}() { [native code] }`, objectId: `native${String(index)}` }))); }
        return metadata(inner.params.objectId);
      } return {};
    },
  });
  main = new Constructor(host); return Object.freeze({ main, commands, resumes, queries: (): number => f.state.queries });
}
void test("original import/opening scheduler uses its exact finite reservation and resumes only after queuing the read", async context => {
  const f = await fixture(context); await f.main.arm(); await f.main.capture(); const packet = await f.main.observeOpening();
  assert.deepEqual(f.resumes, ["import", "afterImports", "open"]); assert.equal(f.queries(), 1); assert.equal(packet.nativeIssuerVerified, false);
  assert.equal(f.commands.filter(command => currentFootprintForwardHeadNativeWire(command, 1).cleanup).length, LIMITS.cleanup);
  assert.equal(f.commands.filter(command => !currentFootprintForwardHeadNativeWire(command, 1).cleanup).length, LIMITS.normal);
  assert.equal(f.commands.length, LIMITS.total); await assert.rejects(f.main.observeOpening(), /READ_CONSUMED/u); assert.equal(f.queries(), 1);
});
void test("lost original opening resume leaves the queued read consumed and never awaits or completes it", async context => {
  const f = await fixture(context, true); await f.main.arm(); await f.main.capture(); await assert.rejects(f.main.observeOpening(), /original resume lost/u);
  assert.equal(f.queries(), 1); assert.equal(f.commands.some(command => command.phase === "forward-head-read" && command.command.phase === "await"), false);
  await assert.rejects(f.main.observeOpening(), /READ_CONSUMED/u); assert.equal(f.queries(), 1);
});
void test("a different resolved breakpoint cannot borrow the original allocated point or resume startup", async context => {
  const f = await fixture(context, false, true); await f.main.arm(); await assert.rejects(f.main.capture(), /ORIGINAL_ALLOCATED_POINT/u);
  assert.deepEqual(f.resumes, []); assert.equal(f.queries(), 0);
  assert.equal(f.commands.some(command => command.phase === "forward-head-open"), false);
});

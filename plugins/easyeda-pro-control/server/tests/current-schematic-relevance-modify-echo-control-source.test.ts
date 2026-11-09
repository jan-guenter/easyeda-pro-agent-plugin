/** Original source coordinates and inert source-created return contracts. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_RETURNS as RETURNS, currentSchematicRelevanceModifyEchoControlPoint as atPoint, currentSchematicRelevanceModifyEchoControlFunction as fnPoint } from "../src/current-schematic-relevance-modify-echo-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyWorkerFunction as workerFunction, currentSchematicRelevanceModifyWorkerScript as workerScript, qualifyCurrentSchematicRelevanceModifyWorkerSource as workerSource } from "../src/current-schematic-relevance-modify-worker-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_SOURCE as HANDLER } from "../src/current-schematic-relevance-modify-echo-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE as PAGE, qualifyCurrentSchematicRelevanceCanvasEchoSource as uiSource } from "../src/current-schematic-relevance-canvas-echo-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_SOURCE as CM } from "../src/current-schematic-relevance-consistency-callee-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";

interface SourceRow { readonly start: number; readonly end: number; readonly kind: "arrow" | "method"; readonly name: string }
/** Recreate only the original uninvoked callable, retaining UTF16 positions. */
function sourceCallable(source: string, row: SourceRow): unknown {
  const text = source.slice(row.start, row.end); const padding = source.slice(0, row.start).replaceAll(/[^\n\r]/gu, value => " ".repeat(value.length));
  if (row.kind === "arrow") { return runInContext(`"use strict";${padding.slice(13, -1)}(${text})`, createContext({})); }
  const klass: unknown = runInContext(`${padding.slice(0, -7)}(class{${text}})`, createContext({})); assert.ok(typeof klass === "function"); const proto: unknown = Reflect.get(klass, "prototype"); assert.ok(proto !== null && typeof proto === "object"); return Object.getOwnPropertyDescriptor(proto, row.name)?.value;
}

void test("all fixed return coordinates exist in the complete pinned assets without invoking their functions", async context => {
  const sources = await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js", ...PAGE.map(row => row.relativePath)]);
  if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const session = new Session(); session.connect(); await session.post("Debugger.enable"); const key = "__own7EchoReturnSource";
  try { for (const variant of [0, 1] as const) {
    const worker = sources[0]; const ui: string | undefined = sources[variant + 1]; assert.ok(typeof worker === "string" && typeof ui === "string"); workerSource(worker); assert.equal(uiSource(ui), variant);
    if (variant === 0) { for (const role of ["publish", "broadcastPublish", "post", "loopback"] as const) {
      const callable = sourceCallable(worker, SOURCE.roles[role]); assert.ok(typeof callable === "function"); Object.defineProperty(globalThis, key, { value: callable, configurable: true }); const remote = await session.post("Runtime.evaluate", { expression: `globalThis.${key}` }); assert.ok(remote.result.objectId !== undefined); assert.equal(remote.result.type, "function"); const metadata = await session.post("Runtime.getProperties", { objectId: remote.result.objectId, ownProperties: true }); workerFunction(metadata, { ...remote.result, type: "function" }, role, workerScript(metadata)); Reflect.deleteProperty(globalThis, key);
    } }
    for (const role of RETURNS.filter(value => variant === 0 || !value.startsWith("worker"))) {
      let row: Readonly<{ start: number; end: number; kind: "arrow" | "method"; name: string }>;
      if (role === "workerPostReturned") { row = SOURCE.roles.post; }
      else if (role === "workerLoopbackReturned") { row = SOURCE.roles.onMessage; }
      else if (role === "uiHandlerReturned") { row = { ...HANDLER[variant], kind: "arrow", name: "" }; }
      else if (role === "uiExecuteReturned") { row = PAGE[variant].roles.taskExecute; }
      else if (role === "uiCallbackReturned") { row = PAGE[variant].roles.projectUpdateCallback; }
      else if (role === "uiPushReturned") { row = PAGE[variant].roles.pushOnLine; }
      else if (role === "uiPublishReturned") { row = PAGE[variant].roles.publishLine; }
      else { row = CM[variant].roles.consistencyRemoteChange; }
      const source = role.startsWith("worker") ? worker : ui; const callable = sourceCallable(source, row);
      assert.ok(typeof callable === "function"); Object.defineProperty(globalThis, key, { value: callable, configurable: true }); const remote = await session.post("Runtime.evaluate", { expression: `globalThis.${key}` }); assert.ok(remote.result.objectId !== undefined); const metadata = await session.post("Runtime.getProperties", { objectId: remote.result.objectId, ownProperties: true }); const location: unknown = metadata.internalProperties?.find(value => value.name === "[[FunctionLocation]]")?.value?.value; assert.ok(location !== null && typeof location === "object"); const scriptId: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof scriptId === "string"); const fn = fnPoint(variant, role); const at = atPoint(variant, role); assert.equal(Reflect.get(location, "lineNumber"), fn.lineNumber); assert.equal(Reflect.get(location, "columnNumber"), fn.columnNumber); const possible = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId, ...fn }, end: { scriptId, ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true }); assert.equal(possible.locations.filter(value => value.lineNumber === at.lineNumber && value.columnNumber === at.columnNumber && value.type === "return").length, 1); Reflect.deleteProperty(globalThis, key);
    }
  } } finally { await session.post("Debugger.disable"); session.disconnect(); Reflect.deleteProperty(globalThis, key); }
});

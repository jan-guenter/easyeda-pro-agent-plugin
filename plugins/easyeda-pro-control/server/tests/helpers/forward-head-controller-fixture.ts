/** Real readonly SQLite and fixed programs through an explicitly synthetic
 * CDP/acknowledgment host. This supplies no Electron or native issuer proof. */
/* oxlint-disable promise/prefer-await-to-callbacks -- Exercise the exact error-first driver callback used by the fixed queryOne wrapper. */
/* oxlint-disable import/max-dependencies -- Join the genuine completed reader/source/reference with the exact fixed programs and explicitly synthetic CDP host. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { DatabaseSync } from "node:sqlite";
import type { TestContext } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as SCOPE } from "../../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as MAIN } from "../../src/current-footprint-copy-main-backend-programs.ts";
import { prepareCurrentFootprintCopyHeadReference } from "../../src/current-footprint-copy-head-reference.ts";
import { prepareCurrentFootprintSourcePlan } from "../../src/current-footprint-source-plan.ts";
import { CurrentFootprintForwardHeadController } from "../../src/current-footprint-forward-head-controller.ts";
import type { CurrentFootprintForwardHeadCommand, CurrentFootprintForwardHeadInputs } from "../../src/current-footprint-forward-head-controller.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./symbol-sql-fixture.ts";

export async function forwardHeadControllerFixture(context: TestContext, options: Readonly<{
  missingAckAt?: string; duplicateAckAt?: string; driftAt?: string; rejectAt?: string; replacePromise?: boolean; changedNumber?: boolean;
  nativeInspector?: boolean;
  continueOpening?: "acknowledged" | "lost";
  acknowledge?: (command: CurrentFootprintForwardHeadCommand, requestId: number) => void;
}> = {}): Promise<Readonly<{
  controller: CurrentFootprintForwardHeadController; inputs: CurrentFootprintForwardHeadInputs;
  send: (command: CurrentFootprintForwardHeadCommand) => Promise<unknown>;
  state: { current: boolean; phases: string[]; queries: number; releases: number; pending: number | null };
}>> {
  const value = await fixture();
  const content = `${JSON.stringify({ type: "DOCHEAD", ticket: 100 })}||${JSON.stringify({ docType: "FOOTPRINT", client: "a".repeat(16), uuid: IDS.target,
    updateTime: 100, version: "100", editVersion: "3.2.209", user: { uuid: IDS.actor, username: "synthetic", nickname: "Synthetic" } })}|\n` +
    `${JSON.stringify({ type: "META", ticket: 90, id: "META" })}||${JSON.stringify({ title: "Footprint", description: "", tags: [], source: "" })}`;
  mutate(value.path, `UPDATE history_data SET dataStr='${encrypted(content, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(value.path), sourcePlan = await prepareCurrentFootprintSourcePlan(before,
    { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target });
  const reference = await prepareCurrentFootprintCopyHeadReference(before, sourcePlan);
  if (options.changedNumber === true) { mutate(value.path, `UPDATE project_history_${IDS.branch} SET num=1`); }
  const database = new DatabaseSync(value.path, { readOnly: true }); context.after(() => { database.close(); });
  const state = { current: true, phases: [] as string[], queries: 0, releases: 0, pending: null as number | null };
  const require = createRequire(import.meta.url);
  const util: unknown = require("node:util");
  const contextName = `easyeda-forward-head-controller-synthetic-${randomUUID()}`;
  const vm = createContext({ util, path: value.path,
    get: (sql: string, parameters: string[], callback: (error: unknown, row?: unknown) => void): void => {
      state.queries += 1;
      queueMicrotask(() => {
        let row: unknown;
        try { row = database.prepare(sql).get(...parameters); }
        catch (error) { callback(error); return; }
        callback(null, row);
      });
    } }, { name: contextName });
  runInContext(`
    class Database { constructor(filename){Object.defineProperty(this,'filename',{value:filename});} get(sql,parameters,callback){get(sql,parameters,callback);} }
    class Statement {} const sqlite={Database,Statement}; const logger={trace(){}};
    class Z2 {constructor(db){this.db=db;this.logger=logger;}queryOne(sql,parameters){this.logger.trace();return new Promise((resolve,reject)=>this.db.get(sql,parameters,(error,row)=>error?reject(error):resolve(row)));}}
    class yo {constructor(){this.path=path;this.logger=logger;this.db=new Database(path);this.dbWrap=new Z2(this.db);}}
    const owner=new yo(),ctx={logger,db:{[path]:Promise.resolve(owner)}},controller={ctx},frame=[controller,ctx,path,owner];
    function u(a){} function xC(a,b,c){} function L3(a,b){} function y(a,b){} function rl(a){}
    class Backend{interceptHttpProtocol(a,b,c){}}const backend=new Backend;backend.cb=function(a,b){};
    const source=[u,backend,{},xC,L3,y,Date,Date.now,rl];
  `, vm);
  const compile = (program: string): ((...args: unknown[]) => unknown) => {
    const result: unknown = runInContext(`(${program})`, vm); assert.equal(typeof result, "function");
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact fixed production program, checked callable before the synthetic CDP invocation.
    return result as (...args: unknown[]) => unknown;
  };
  const scope: unknown = Reflect.apply(compile(SCOPE), runInContext("[Z2,yo,sqlite,util]", vm), [value.path]);
  const main: unknown = Reflect.apply(compile(MAIN.capture.program), runInContext("source", vm), []);
  const session = options.nativeInspector === true ? new Session() : null;
  let inspectorIds: Readonly<{ frameObjectId: string; sqlScopeObjectId: string; constructionObjectId: string }> | null = null;
  if (session !== null) {
    session.connect(); context.after(() => { session.disconnect(); }); let contextId: number | null = null;
    session.on("Runtime.executionContextCreated", ({ params }): void => { if (params.context.name === contextName) { contextId = params.context.id; } });
    await session.post("Runtime.enable"); assert.notEqual(contextId, null);
    vm["headScope"] = scope; vm["headMain"] = main;
    const evaluate = async (expression: string): Promise<string> => {
      assert.ok(contextId !== null);
      const reply = await session.post("Runtime.evaluate", { expression, contextId, objectGroup: "easyeda-footprint-forward-head-v1", returnByValue: false });
      assert.equal(reply.exceptionDetails, undefined); assert.ok(reply.result.objectId !== undefined); return reply.result.objectId;
    };
    inspectorIds = Object.freeze({ frameObjectId: await evaluate("frame"), sqlScopeObjectId: await evaluate("headScope"), constructionObjectId: await evaluate("headMain") });
  }
  const objects = new Map<string, unknown>([["frame", runInContext("frame", vm)], ["scope", scope], ["main", main]]);
  let serial = 0; const object = (result: unknown): unknown => {
    serial += 1; const objectId = `synthetic-${String(serial)}`; objects.set(objectId, result);
    if (Array.isArray(result)) { return { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(result.length)})`, objectId } }; }
    if (types.isPromise(result)) { return { result: { type: "object", subtype: "promise", className: "Promise", objectId } }; }
    return { result: { type: "object", className: "Object", objectId } };
  };
  const inputs = Object.freeze({ before, sourcePlan, reference, ...(inspectorIds ?? { frameObjectId: "frame", sqlScopeObjectId: "scope", constructionObjectId: "main" }) });
  let requestId = 0;
  const send = async (command: CurrentFootprintForwardHeadCommand): Promise<unknown> => {
    state.phases.push(command.phase); requestId += 1; state.pending = requestId;
    if (options.missingAckAt !== command.phase) {
      if (options.acknowledge === undefined) {
        // oxlint-disable-next-line eslint/no-use-before-define -- This fixed host closure is invoked only after its controller exists.
        controller.consume(command, requestId);
      } else { options.acknowledge(command, requestId); }
    }
    // oxlint-disable-next-line eslint/no-use-before-define -- The test repeats only this same original pending acknowledgment, before any synthetic native effect.
    if (options.duplicateAckAt === command.phase) { controller.consume(command, requestId); }
    if (options.rejectAt === command.phase) { throw new Error(`synthetic ${command.phase} lost reply`); }
    let reply: unknown;
    if (session !== null) {
      if (command.method === "Runtime.callFunctionOn") {
        const params: Runtime.CallFunctionOnParameterType = command.params; reply = await session.post("Runtime.callFunctionOn", params);
      }
      else if (command.method === "Runtime.awaitPromise") { reply = await session.post("Runtime.awaitPromise", command.params); }
      else { state.releases += 1; await session.post("Runtime.releaseObjectGroup", command.params); reply = {}; }
    }
    else if (command.phase === "release") { state.releases += 1; objects.clear(); reply = {}; }
    else if (command.phase === "await") { reply = object(await objects.get(command.params.promiseObjectId)); }
    else {
      const args: unknown[] = command.params.arguments.map(arg => "objectId" in arg ? objects.get(arg.objectId) : arg.value);
      let result: unknown = Reflect.apply(compile(command.params.functionDeclaration), objects.get(command.params.objectId), args);
      if (command.phase === "read" && options.replacePromise === true) { result = runInContext("Promise.resolve({})", vm) as unknown; }
      reply = command.params.returnByValue ? { result: { type: typeof result, value: result } } : object(result);
    }
    if (options.driftAt === command.phase) { state.current = false; }
    return reply;
  };
  const controller = new CurrentFootprintForwardHeadController(Object.freeze({
    assertCurrent: (): void => { assert.equal(state.current, true, "synthetic original host drift"); },
    send, pendingRequestId: (): number | null => state.pending,
    ...(options.continueOpening === undefined ? {} : { afterReadQueued: (): Promise<void> => {
      assert.equal(state.queries, 1); assert.equal(state.phases.at(-1), "read"); state.phases.push("resume-original");
      return options.continueOpening === "lost" ? Promise.reject(new Error("synthetic original resume lost acknowledgment")) : Promise.resolve();
    } }),
  }), inputs);
  return Object.freeze({ controller, inputs, state, send });
}

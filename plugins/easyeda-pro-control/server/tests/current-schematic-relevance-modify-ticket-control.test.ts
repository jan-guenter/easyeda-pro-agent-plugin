/** Native identity and original intent remain Core prerequisites. This inert
 * test proves only the fixed recipe's exact descriptor delta and call order. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_CANCEL_PROGRAM as CANCEL, qualifyCurrentSchematicRelevanceModifyTicketCancellationScope } from "../src/current-schematic-relevance-modify-ticket-control-program.ts";
import { CURRENT_PCB_209_WORKER_STARTUP_SOURCE as SOURCE } from "../src/current-pcb-209-worker-startup-profile.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_PROGRAMS as P } from "../src/current-schematic-relevance-modify-ticket-programs.ts";

void test("the fixed cancellation reads its actual timer, refuses peer drift before calling and changes only that own field", () => {
  const context = createContext({});
  runInContext(`let clears=0,gets=0,last=null;globalThis.setTimeout=function setTimeout(){};globalThis.clearTimeout=function clearTimeout(id){clears++;last=id};
    const project={publishTimer:null},symbol=Symbol("retained"),peer={retained:true};project[symbol]=peer;Object.defineProperty(project,"unknown",{get(){gets++;throw Error("unread")},configurable:true});
    globalThis.PROJECT=project;const packet=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
    const qualified=[project,globalThis,Object.prototype,Array.prototype,Function.prototype,setTimeout,clearTimeout],objects=qualified;`, context);
  const call = (program: string, args: string): unknown => runInContext(`(${program}).apply(packet,${args})`, context);
  runInContext(`const natives=(${P.natives}).call(packet,qualified),before=(${P.snapshot}).call(packet,objects);project.publishTimer=7`, context);
  assert.equal(call(P.introduced, "[before,qualified,project]"), 7);
  runInContext(`const current=(${P.snapshot}).call(packet,objects);project[symbol]={retained:false}`, context);
  assert.throws(() => call(CANCEL, "[current,qualified,project,natives]")); assert.equal(runInContext("clears+gets", context), 0);
  runInContext("project[symbol]=peer", context); assert.equal(call(CANCEL, "[current,qualified,project,natives]"), 7);
  assert.equal(runInContext("clears", context), 1); assert.equal(runInContext("last", context), 7); assert.equal(runInContext("project.publishTimer", context), null);
  assert.equal(call(P.cleared, "[current,qualified,project]"), 7); assert.throws(() => call(P.same, "[current,qualified]")); assert.throws(() => call(CANCEL, "[current,qualified,project,natives]")); assert.equal(runInContext("clears", context), 1); assert.equal(runInContext("gets", context), 0);
});

void test("the complete worker pin restricts publishTimer references to initialization and the notification method", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE.relativePath);
  if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  assert.doesNotThrow(() => { qualifyCurrentSchematicRelevanceModifyTicketCancellationScope(source); });
  assert.throws(() => { qualifyCurrentSchematicRelevanceModifyTicketCancellationScope(`${source}publishTimer`); });
});

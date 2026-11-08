/** Actual source fragments and local Inspector metadata, without an app,
 * worker owner, native timer invocation or cancellation request. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { createContext, runInContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_FACTS as FACTS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_FLAG_DECLARATION as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyTicketSource } from "../src/current-schematic-relevance-modify-ticket-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_PROGRAMS as P } from "../src/current-schematic-relevance-modify-ticket-programs.ts";
import { decodeCurrentSchematicRelevanceModifyTicketCallee, decodeCurrentSchematicRelevanceModifyTicketNative } from "../src/current-schematic-relevance-modify-ticket-replies.ts";
import type { CurrentSchematicRelevanceModifyTicketRole } from "../src/current-schematic-relevance-modify-ticket-source.ts";
import { CURRENT_PCB_209_WORKER_STARTUP_SOURCE as WORKER } from "../src/current-pcb-209-worker-startup-profile.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("the no-argument call returns before its inert20ms callback and only the exact timer field may change", () => {
  const context = createContext({});
  runInContext(`let gets=0,schedules=0,clears=0,callback=null,delay=null,jr=false;
    globalThis.setTimeout=function setTimeout(fn,ms){schedules++;callback=fn;delay=ms;return 7};globalThis.clearTimeout=function clearTimeout(){clears++};
    class Lg{${SOURCE.localPublishTicket.source}${SOURCE.canWsPublish.source}}const project=Object.assign(new Lg,{isReady:true,publishTimer:null});
    Object.defineProperty(project,"opaque",{configurable:true,get(){gets++;throw Error("must stay unread")}});const peer=Symbol("peer");project[peer]={retained:true};
    globalThis.PROJECT=project;const packet=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
    const known=[globalThis,project,Lg.prototype,Object.prototype,Array.prototype,Function.prototype,Lg.prototype.localPublishTicket,Lg.prototype.canWsPublish,setTimeout,clearTimeout],objects=[project];`, context);
  const run = (program: string, args: string): unknown => runInContext(`(${program}).apply(packet,${args})`, context);
  runInContext(`const methods=(${P.methods}).call(packet,project,known),natives=(${P.natives}).call(packet,known),before=(${P.snapshot}).call(packet,objects)`, context);
  assert.equal(run(P.before, "[[project,undefined],project,methods,natives,known]"), true);
  assert.throws(() => run(P.before, "[[project,7],project,methods,natives,known]"));
  assert.equal(runInContext("project.localPublishTicket()", context), undefined);
  assert.equal(runInContext("schedules", context), 1); assert.equal(runInContext("delay", context), 20); assert.equal(runInContext("clears+gets", context), 0);
  assert.equal(run(P.introduced, "[before,objects,project]"), 7); assert.throws(() => run(P.same, "[before,objects]"));
  runInContext(`const introduced=(${P.snapshot}).call(packet,objects);project.publishTimer=null`, context);
  assert.equal(run(P.cleared, "[introduced,objects,project]"), 7); assert.equal(runInContext("clears+gets", context), 0);
  assert.equal(FACTS.cancellationAuthorized, false); assert.equal(FACTS.localReturnProvesTimerSettlement, false);
  runInContext('Object.defineProperty(project,"isReadOnly",{configurable:true,get(){gets++;throw Error("must short circuit")}})', context);
  assert.equal(run(P.websocketExcluded, "[[project,false],project,methods,known]"), true);
  assert.throws(() => run(P.websocketExcluded, "[[project,true],project,methods,known]")); assert.equal(runInContext("project.canWsPublish()", context), false);
  assert.equal(runInContext("gets", context), 0); assert.equal(FLAGS.source.includes("IS_PRIVATE:jr"), true); assert.equal(FLAGS.source.includes("IS_CLIENT:ln"), true);
  runInContext('delete project.isReadOnly;project[peer]={retained:false};project.publishTimer=7', context); assert.throws(() => run(P.introduced, "[before,objects,project]"));
});

void test("all3 original source functions have actual uninvoked V8 metadata and Node JS timers cannot impersonate browser natives", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    for (const role of ["localPublishTicket", "canWsPublish", "timerCallback"] as const) {
      const method = role === "timerCallback" ? SOURCE.localPublishTicket : SOURCE[role];
      const prefix = role === "timerCallback" ? '(()=>{const setTimeout=(fn)=>{globalThis.__inertTicketCallback=fn;return 7};class InertTicket{' : '(()=>{class InertTicket{';
      const suffix = role === "timerCallback" ? '};const receiver={publishTimer:null};InertTicket.prototype.localPublishTicket.call(receiver);return globalThis.__inertTicketCallback;})()' : `};return InertTicket.prototype.${role};})()`;
      const source = "\n".repeat(method.line) + " ".repeat(method.column - prefix.length) + prefix + method.source + suffix;
      const actual = await session.post("Runtime.evaluate", { expression: source, returnByValue: false }); assert.ok(actual.result.objectId !== undefined);
      const metadata = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const location: unknown = metadata.internalProperties?.find(value => value.name === "[[FunctionLocation]]")?.value?.value;
      assert.ok(location !== null && typeof location === "object"); const scriptId: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof scriptId === "string");
      const value = decodeCurrentSchematicRelevanceModifyTicketCallee(metadata, actual.result, role, scriptId);
      assert.equal(value.originalReceiverVerified, false); assert.equal(value.cancellationAuthorized, false);
      assert.throws(() => decodeCurrentSchematicRelevanceModifyTicketCallee(metadata, actual.result, role, "foreign"));
      const other: CurrentSchematicRelevanceModifyTicketRole = role === "canWsPublish" ? "localPublishTicket" : "canWsPublish";
      assert.throws(() => decodeCurrentSchematicRelevanceModifyTicketCallee(metadata, actual.result, other, scriptId));
      if (role === "localPublishTicket") {
        await session.post("Debugger.enable");
        const points = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId, lineNumber: 110, columnNumber: 93_964 }, end: { scriptId, lineNumber: 110, columnNumber: 94_334 }, restrictToFunction: true });
        assert.ok(points.locations.some(point => point.type === "return"));
        await session.post("Debugger.disable");
      }
    }
    for (const role of ["setTimeout", "clearTimeout"] as const) {
      const actual = await session.post("Runtime.evaluate", { expression: role, returnByValue: false }); assert.ok(actual.result.objectId !== undefined);
      const metadata = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      assert.throws(() => decodeCurrentSchematicRelevanceModifyTicketNative(metadata, actual.result, role));
    }
  } finally {
    await session.post("Runtime.evaluate", { expression: "delete globalThis.__inertTicketCallback", returnByValue: true }); session.disconnect();
  }
});

void test("configured complete worker bytes bind the actual jr/ln aliases and all ticket spans", async context => {
  const source = await readConfiguredEasyedaAsset(WORKER.relativePath);
  if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  assert.doesNotThrow(() => { qualifyCurrentSchematicRelevanceModifyTicketSource(source); });
  assert.throws(() => { qualifyCurrentSchematicRelevanceModifyTicketSource(source.replace("IS_PRIVATE:jr", "IS_PRIVATE:ln")); });
});

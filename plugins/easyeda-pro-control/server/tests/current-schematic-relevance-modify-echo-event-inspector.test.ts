/** Actual local Inspector packing and source-created callback metadata.
 * Inert fixtures never connect to an editor or establish a subscription owner. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyEchoEventCommand as validate } from "../src/current-schematic-relevance-modify-echo-event-protocol.ts";
import { currentSchematicRelevanceModifyEchoEventEvidence as evidence } from "../src/current-schematic-relevance-modify-echo-event-replies.ts";
import { qualifyCurrentSchematicRelevanceModifyEchoEventSource as source } from "../src/current-schematic-relevance-modify-echo-event-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE as SOURCE } from "../src/current-schematic-relevance-canvas-echo-source.ts";
import { requireCurrentSchematicRelevanceCanvasEchoDescription as description, decodeCurrentSchematicRelevanceCanvasEchoFunction as metadata } from "../src/current-schematic-relevance-canvas-echo-replies.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("actual readonly Inspector calls retain the staged UI row and explicit undefined order encoding", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const fixture = await session.post("Runtime.evaluate", { expression: `(()=>{"use strict";const cm={},p={uuid:"page",consistencyManager:cm},row=["text",7,"body","TEXT","client",true,"unique",false,undefined],message=[row],envelope={type:"PUBLISH",uuid:"worker",topic:"/pro-mgr/canvas/page/update",message},event={},read=[event,envelope],pending=[p,"page","text",7,"body","TEXT","SCH_PAGE",Promise,setTimeout],pristine=[p,cm,"client","unique",5,{},{}],roots=[p,{},{},{},{},{},{},"channel"],links=[{},{},p,cm],qualified=[p,cm,envelope,message,row,Object.prototype,Array.prototype,Function.prototype];const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];return[I11,qualified,pending,pristine,roots,links,read]})()`, returnByValue: false });
    assert.equal(fixture.exceptionDetails, undefined); assert.ok(fixture.result.objectId !== undefined);
    const fields = await session.post("Runtime.getProperties", { objectId: fixture.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const id = (index: number): string => { const value = fields.result.find(row => row.name === String(index))?.value?.objectId; assert.ok(value !== undefined); return value; };
    const call = async (role: string, arguments_: readonly string[]): Promise<Runtime.CallFunctionOnReturnType> => {
      const row = CALLS.find(value => value[0] === role); assert.ok(row !== undefined); const command = validate({ phase: "modify-echo-event-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: id(0), functionDeclaration: row[1], arguments: arguments_.map(objectId => ({ objectId })), returnByValue: row[3], awaitPromise: false, userGesture: false } }); assert.equal(command.phase, "modify-echo-event-call"); assert.ok(command.phase === "modify-echo-event-call");
      const params: Runtime.CallFunctionOnParameterType = command.params;
      assert.equal(Reflect.get(params, "throwOnSideEffect"), true);
      const reply = await session.post("Runtime.callFunctionOn", params); assert.equal(reply.exceptionDetails, undefined); return reply;
    };
    const expected = await call("expected", [id(2), id(3), id(4), id(5), id(1)]); assert.ok(expected.result.objectId !== undefined);
    const message = await call("message", [id(6), expected.result.objectId, id(1)]); assert.ok(message.result.objectId !== undefined);
    const row = await call("row", [message.result.objectId, id(1)]); assert.ok(row.result.objectId !== undefined);
    const actual = evidence(await call("payload", [id(6), message.result.objectId, row.result.objectId, expected.result.objectId, id(1)]));
    assert.deepEqual(actual, ["worker", "/pro-mgr/canvas/page/update", "page", "text", 7, "body", "TEXT", "client", true, "unique", false, false, null]);
  } finally { session.disconnect(); }
});

void test("configured main and child create the selected callback inside the actual source-preserving initProject", async context => {
  const sources = await Promise.all(SOURCE.map(profile => readConfiguredEasyedaAsset(profile.relativePath)));
  if (sources.every(value => value === null)) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    for (const variant of [0, 1] as const) {
      const full = sources[variant]; assert.ok(typeof full === "string"); assert.equal(source(full), variant); const profile = SOURCE[variant], row = profile.roles.initProject, text = full.slice(row.start, row.end);
      const formatter = /subscribe\(([A-Za-z_$][\w$]*)\(this\.busTopic\.projectUpdate/u.exec(text)?.[1]; assert.ok(formatter !== undefined);
      const prefix = `(()=>{let captured;const bus={subscribe(topic,callback){captured=callback;return{}},rpcCall(){return new Promise(()=>{})}},${profile.aliases.topicFactory}=()=>bus,${formatter}=(value,packet)=>value;class Fixture{`;
      const suffix = `};const fixture=Object.assign(new Fixture,{windowId:"tab",path:"project",uuid:"page",setIsInitIng(){},channel:{addCompiler(){}},busTopic:{projectUpdate:"/pro-mgr/canvas/{uuid}/update",getProject:"inert"},sub:[],consistencyManager:null});void fixture.initProject(false,false,true,false,false,false);return captured})()`;
      const expression = "\n".repeat(row.sourceLine) + " ".repeat(row.sourceColumn - prefix.length) + prefix + text + suffix;
      const actual = await session.post("Runtime.evaluate", { expression, returnByValue: false }); assert.equal(actual.exceptionDetails, undefined); assert.ok(actual.result.objectId !== undefined && typeof actual.result.description === "string"); description(actual.result.description, variant, "projectUpdateCallback");
      const packet = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); const location: unknown = packet.internalProperties?.find(value => value.name === "[[FunctionLocation]]")?.value?.value; assert.ok(location !== null && typeof location === "object"); const scriptId: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof scriptId === "string");
      const result = metadata(packet, variant, "projectUpdateCallback", scriptId); assert.equal(result.callbackReceiverVerified, false); assert.equal(result.originalPublisherVerified, false); assert.equal(result.continuationAuthorized, false);
      assert.throws(() => { metadata(packet, variant, "projectUpdateCallback", "foreign"); }); const renamed = structuredClone(packet); const name = renamed.result.find(value => value.name === "name"); assert.ok(name?.value !== undefined); name.value.value = "projectUpdateCallback"; assert.throws(() => { metadata(renamed, variant, "projectUpdateCallback", scriptId); });
      assert.throws(() => { source(full.slice(0, -1)); });
    }
  } finally { session.disconnect(); }
});

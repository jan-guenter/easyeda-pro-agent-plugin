/** Original source fragments, inert receivers and local Inspector only. This
 * proves no application ownership, delivery, worker completion or Save grant. */
/* oxlint-disable import/max-dependencies -- This one original-source/Inspector case joins the fixed grammar, native metadata and actual serial-scope decoder rather than stubbing their true replies. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Session } from "node:inspector/promises";
import { createContext, runInContext } from "node:vm";
import { test } from "node:test";
import { promisify } from "node:util";
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_PROGRAMS as P } from "../src/current-schematic-relevance-modify-structure-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyStructureCommand as validate } from "../src/current-schematic-relevance-modify-structure-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SOURCE as SOURCE } from "../src/current-schematic-relevance-modify-structure-source.ts";
import { decodeCurrentPcb209WorkerProducerScopeList, decodeCurrentPcb209WorkerProducerScopes } from "../src/current-pcb-string-producer-scope.ts";

const segment = z.strictObject({ start: z.number(), end: z.number(), text: z.string(), sha256: z.string() });
const fixture = z.looseObject({ segments: z.array(segment) });
// oxlint-disable-next-line typescript/strict-void-return -- Node execFile returns its ChildProcess while promisify consumes only its documented completion callback.
const execute = promisify(execFile);
/** Keep test-runner async-hook Symbols out of the actual zero-own-field
 * Promise probe, and resolve only after the bounded plain Node child exits. */
function runChild(script: string): Promise<Readonly<{ stdout: string; stderr: string }>> {
  return execute(process.execPath, ["--input-type=module", "--eval", script], { encoding: "utf8", timeout: 10_000, maxBuffer: 65_536 });
}
void test("ready TEXT suppression refuses enum/getter drift and joins the actual original Nd native Promise and idle scope", async () => {
  const text = await readFile(new URL("fixtures/current209-worker-source-excerpts.json", import.meta.url), "utf8");
  const excerpts = fixture.parse(JSON.parse(text));
  const constructor = excerpts.segments.find(value => value.start === 2_103_288), nd = excerpts.segments.find(value => value.start === 1_847_057);
  assert.ok(nd !== undefined && constructor !== undefined);
  assert.equal(createHash("sha256").update(nd.text).digest("hex"), "99fca9f1568807ff06f32f3fba55b490def72b5b07d9325974dc153db217909e");
  const callback = constructor.text.slice(2_104_048 - constructor.start, 2_104_241 - constructor.start);
  assert.equal(createHash("sha256").update(callback).digest("hex"), "f78a4c3123cfbf7d2be2c7404abcb1519fecbea1fd9f6fed49107cbac4f77f70");
  const context = createContext({ callbackSource: callback });
  runInContext(`let writes=0,hooks=0;const ve={BOARD:"BOARD",PCB:"PCB",SCH:"SCH",SCH_PAGE:"SCH_PAGE",SYMBOL:"SYMBOL",PANEL:"PANEL"},De={META:"META",DELETE_DOC:"DELETE_DOC"};
    class Gd{${SOURCE.readOnly.source}${SOURCE.v2.source}}class Lg extends Gd{structure(){writes++}}
    const project=Object.assign(new Lg,{uuid:"original-project",isReady:true,isTemporary:false,isHistoryBack:false,_isV2Format:false,isSyncing:false});
    globalThis.PROJECT=project;const callback=(function(){return eval("("+callbackSource+")")}).call(project);
    const packet=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
    const args=["SCH_PAGE","TEXT",true],caller=[callback,null,null,args],scope={object:{e:callback,t:null,s:null,r:args}},frame=[project,...args,ve,De];
    const known=[project,Lg.prototype,Gd.prototype,Object.getOwnPropertyDescriptor(Gd.prototype,"isReadOnly").value,Object.getOwnPropertyDescriptor(Gd.prototype,"isV2Format").get,Array.prototype.includes,ve,De,Object.prototype,Array.prototype,Function.prototype];`, context);
  const run = (program: string, argumentsExpression: string): unknown => runInContext(`(${program}).apply(packet,${argumentsExpression})`, context);
  runInContext(`const parts=(${P.parts}).call(packet,project,known)`, context);
  assert.equal(run(P.entry, "[frame,project,callback,caller,scope,parts,known]"), true);
  runInContext('Object.defineProperty(De,"META",{configurable:true,get(){hooks++;throw Error("must stay uncalled")}})', context);
  assert.throws(() => run(P.entry, "[frame,project,callback,caller,scope,parts,known]")); assert.equal(runInContext("hooks+writes", context), 0);
  runInContext('Object.defineProperty(De,"META",{value:"META",writable:true,enumerable:true,configurable:true});Object.defineProperty(project,"isV2Format",{configurable:true,get(){hooks++;throw Error("must stay uncalled")}})', context);
  assert.throws(() => run(P.readonlyProof, "[project,parts,known]")); assert.equal(runInContext("hooks+writes", context), 0);
  runInContext('delete project.isV2Format', context); assert.equal(run(P.entry, "[frame,project,callback,caller,scope,parts,known]"), true);
  runInContext('const returned=frame.slice()', context); assert.equal(run(P.returned, "[returned,frame,project,parts,known]"), true);
  runInContext('returned[3]=false', context); assert.throws(() => run(P.returned, "[returned,frame,project,parts,known]"));
  const projection: unknown = run(P.caller, '[[project,"page","text","body","TEXT","client",7,undefined,true,undefined,false,"unique",undefined,"TEXT","SCH_PAGE"],project,frame]');
  assert.equal(JSON.stringify(projection), '["page","text","body","TEXT","client",7,true,"unique","SCH_PAGE","original-project"]');
  runInContext(`${"\n".repeat(108)}${" ".repeat(145_561)}${nd.text};globalThis.wrapper=Nd(callback);`, context);
  const promise: unknown = runInContext('wrapper("SCH_PAGE","TEXT",true)', context);
  assert.equal(runInContext("writes+hooks", context), 0);
  const holder = Object.freeze({ wrapper: runInContext("wrapper", context) as unknown, promise, packet: runInContext("packet", context) as unknown, parts: runInContext("parts", context) as unknown, known: runInContext("known", context) as unknown, project: runInContext("project", context) as unknown, callback: runInContext("callback", context) as unknown });
  const key = "__inertOwn7ModifyStructure"; assert.equal(Object.hasOwn(globalThis, key), false); Object.defineProperty(globalThis, key, { value: holder, configurable: true });
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const retained = async (member: string): Promise<string> => { const reply = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.${member}`, returnByValue: false }); assert.ok(reply.result.objectId !== undefined); return reply.result.objectId; };
    const wrapper = await retained("wrapper"); const metadata = await session.post("Runtime.getProperties", { objectId: wrapper, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const point: unknown = metadata.internalProperties?.find(value => value.name === "[[FunctionLocation]]")?.value?.value;
    assert.ok(point !== null && typeof point === "object"); const scriptId: unknown = Reflect.get(point, "scriptId"); assert.equal(typeof scriptId, "string"); assert.ok(typeof scriptId === "string");
    const scopes = decodeCurrentPcb209WorkerProducerScopeList(metadata, scriptId, "serial");
    const originalScope = decodeCurrentPcb209WorkerProducerScopes(await session.post("Runtime.getProperties", { objectId: scopes, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), "serial")[0]; assert.ok(originalScope !== undefined);
    const fields = await session.post("Runtime.getProperties", { objectId: originalScope, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    const args = fields.result.find(value => value.name === "r")?.value?.objectId; assert.ok(args !== undefined);
    const ids = await Promise.all(["packet", "project", "callback", "parts", "known"].map(member => retained(member))); const native = ids[0]; assert.ok(native !== undefined);
    const reply = await session.post("Runtime.callFunctionOn", { ...FLAGS, objectId: native, functionDeclaration: P.idle,
      arguments: [{ objectId: ids[1] }, { objectId: ids[2] }, { objectId: originalScope }, { objectId: args }, { objectId: ids[3] }, { objectId: ids[4] }], returnByValue: true, awaitPromise: false, userGesture: false });
    assert.equal(reply.exceptionDetails, undefined); assert.deepEqual(reply.result, { type: "boolean", value: true });
    const actualPromise = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.promise`, returnByValue: false }), originalPromise = await retained("promise");
    const nativePromise = await session.post("Runtime.getProperties", { objectId: originalPromise, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    assert.equal(actualPromise.result.subtype, "promise"); assert.equal(nativePromise.internalProperties?.find(value => value.name === "[[PromiseState]]")?.value?.value, "fulfilled");
    // Node's test runner adds async-hook Symbols. Keep those rows intact and
    // Prove the production zero-own-field decoder in a bounded plain Node child.
    assert.ok(nativePromise.result.every(value => value.symbol !== undefined));
  } finally { session.disconnect(); Reflect.deleteProperty(globalThis, key); }
  const decoderUrl = new URL("../src/current-schematic-relevance-notification-replies.ts", import.meta.url).href;
  const script = `import{Session}from'node:inspector/promises';import{decodeCurrentSchematicRelevanceNotificationPromise as decode}from${JSON.stringify(decoderUrl)};
    ${nd.text};globalThis.inertPromise=Nd(()=>{})("SCH_PAGE","TEXT",true);const session=new Session;session.connect();await session.post("Runtime.enable");
    const actual=await session.post("Runtime.evaluate",{expression:"globalThis.inertPromise",returnByValue:false});if(!actual.result.objectId)throw Error("Promise");
    const packet=await session.post("Runtime.getProperties",{objectId:actual.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});
    const proof=decode(packet,actual.result);if(proof.state!=="fulfilled"||proof.modifyCompleted!==false||proof.saveAuthorized!==false)throw Error("No grant");session.disconnect();console.log("PASS");`;
  const child = await runChild(script);
  assert.equal(child.stderr, ""); assert.equal(child.stdout.trim(), "PASS");
  assert.throws(() => validate({ phase: "project-save-structure-resume", role: "startupEntry", method: "Debugger.resume", params: {} }));
});

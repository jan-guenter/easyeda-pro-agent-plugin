import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_PCB_COMMON_METADATA_FUNCTION, CURRENT_PCB_COMMON_METADATA_PROGRAM_SHA256,
  decodeCurrentPcbCommonMetadata, encodeCurrentPcbCommonMetadata } from "../src/current-pcb-common-metadata.ts";
import { CURRENT_PCB_COMMON_GRAPH_CLASSES, CURRENT_PCB_COMMON_GRAPH_PROGRAM, CURRENT_PCB_COMMON_PLAIN_GRAPH_PROGRAM } from "../src/current-pcb-common-graph.ts";
import { pcbCommonFixture } from "./helpers/current-pcb-common-fixture.ts";
import { callPcbStringObservation, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function fixture(change = ""): Context {
  return pcbCommonFixture(`
const owner=scope.object.x.env._compiler;
owner.project=owner.base.path;owner.isProject=true;
owner.docDetail={title:"Fixture PCB",parent:"",source:"",board:"",zIndex:null};
Object.defineProperty(scope.object.x.prototype,"compiler",{get(){getterReads++;throw new Error("NO_GETTER");}});
Object.defineProperty(scope.object.x.prototype,"projectId",{get(){getterReads++;throw new Error("NO_GETTER");}});
scope.object.Zu.prototype.getDocDetail=function(){vendorCalls++;throw new Error("NO_VENDOR");};
${change}`);
}
function sample(change = ""): ReturnType<typeof pcbStringReply> {
  const context = fixture(change);
  return pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_COMMON_METADATA_FUNCTION));
}

void test("metadata preserves complete own data, descriptor order and aliases without model getters", () => {
  const context = fixture(`const detail=owner.docDetail;const extra={value:-0};extra.self=extra;
detail.extra=extra;detail.alias=extra;detail.getDocDetail=null;
Object.defineProperty(detail,"hidden",{value:undefined});`);
  const reply = pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_COMMON_METADATA_FUNCTION));
  const result = decodeCurrentPcbCommonMetadata(reply);
  const encoded = encodeCurrentPcbCommonMetadata(reply);
  assert.equal(result.documentUuid, "d".repeat(16)); assert.equal(result.projectUuid, "a".repeat(64));
  assert.equal(result.compilerUniqueId, "c".repeat(16)); assert.equal(result.ownerPublicShadowsAbsent, true);
  const detail = result.graph.nodes[0]; assert.ok(detail?.kind === "object");
  assert.deepEqual(detail.fields.map(field => field[0]), ["title", "parent", "source", "board", "zIndex", "extra", "alias", "getDocDetail", "hidden"]);
  assert.deepEqual(detail.fields.at(-1), ["hidden", ["undefined"]]);
  assert.deepEqual(detail.fields[5]?.[1], detail.fields[6]?.[1]);
  assert.equal(detail.enumerableKeys?.includes("hidden"), false);
  const extra = result.graph.nodes[1]; assert.ok(extra?.kind === "object");
  assert.deepEqual(extra.fields, [["value", ["number", "-0"]], ["self", ["ref", 1]]]);
  assert.equal(encoded.bodyText, '{"title":"Fixture PCB","parent":"","source":"","board":"","zIndex":null}');
  assert.equal(encoded.bodySha256, createHash("sha256").update(encoded.bodyText).digest("hex"));
  assert.notEqual(encoded.rawGraphSha256, encodeCurrentPcbCommonMetadata(sample()).rawGraphSha256);
  for (const field of ["executionAuthorized", "saveAuthorized", "originalOwnerVerified", "headerSourceMatched",
    "nativeIntrinsicsVerified", "completeLiveBaselineVerified", "storedSourceMatched"] as const) { assert.equal(encoded[field], false); }
  assert.ok(Object.isFrozen(result.graph.nodes)); assert.ok(Object.isFrozen(encoded));
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
});

void test("META scalar relation reproduces ordered own reads, undefined omission and native zIndex fallback", () => {
  for (const [literal, expected] of [["null", "null"], ["undefined", "null"], ["false", "null"], ["0", "null"],
    ["-0", "null"], ['""', "null"], ["-2.5", "-2.5"], ["true", "true"], ['"index"', '"index"']] as const) {
    const encoded = encodeCurrentPcbCommonMetadata(sample(`owner.docDetail.zIndex=${literal};`));
    assert.equal(encoded.bodyText, `{"title":"Fixture PCB","parent":"","source":"","board":"","zIndex":${expected}}`);
  }
  const hidden = encodeCurrentPcbCommonMetadata(sample('Object.defineProperty(owner.docDetail,"title",{value:"Hidden",enumerable:false});owner.docDetail.board=undefined;'));
  assert.equal(hidden.bodyText, '{"title":"Hidden","parent":"","source":"","zIndex":null}');
  assert.throws(() => encodeCurrentPcbCommonMetadata(sample("owner.docDetail.source={};")), /PCB_COMMON_METADATA_ENCODING/u);
});

void test("plain metadata graph needs no unrelated scope classes and leaves the original graph program exact", () => {
  assert.equal(createHash("sha256").update(CURRENT_PCB_COMMON_GRAPH_PROGRAM).digest("hex"), "974123808609e6a2865d3ed6817622f2a5c187f54de090226de495eef4ee0224");
  assert.equal(CURRENT_PCB_COMMON_PLAIN_GRAPH_PROGRAM,
    CURRENT_PCB_COMMON_GRAPH_PROGRAM.replace(`const graphClassNames=${JSON.stringify(CURRENT_PCB_COMMON_GRAPH_CLASSES)};`, "const graphClassNames=[];"));
  const reply = sample(`for(const name of ${JSON.stringify(CURRENT_PCB_COMMON_GRAPH_CLASSES)})delete scope.object[name];`);
  assert.equal(decodeCurrentPcbCommonMetadata(reply).documentUuid, "d".repeat(16));
  assert.throws(() => sample('owner.docDetail.extra=new scope.object.S();'), /PCB_COMMON_METADATA/u);
});

void test("metadata refuses substituted owners, identity mismatches and own public shadows without invoking them", () => {
  for (const change of [
    'scope.object.x.env._doctype=4;', 'scope.object.x.env._id="e".repeat(16);',
    'scope.object.x.env._tabId="bad";', 'scope.object.x.env._compiler={};',
    'owner.project="b".repeat(64);', 'owner.isProject=false;', 'owner.base.isProject=false;',
    'owner.base._headType="FOOTPRINT";', 'owner.uuid="e".repeat(16);',
    'owner.base.uuid="e".repeat(16);', 'owner.consistencyManager=new scope.object.sCe();',
    'owner.base.channel=new scope.object.mCe();', 'scope.object.x.env.compilerChannel.compiler.PCB.clear();',
    'scope.object.x.env.compilerChannel.compiler.PCB.set("wrong",owner.base);',
    'scope.object.x.env.compilerChannel.compiler.PCB.set(owner.consistencyManager.unique,{});',
    'owner.docDetail=null;', 'owner.docDetail=Object.create({title:"inherited"});',
    'delete owner.docDetail.title;', 'Object.defineProperty(owner.docDetail,"title",{get(){getterReads++;throw new Error("NO_GETTER");}});',
    'owner.getDocDetail=null;', 'Object.defineProperty(owner,"getDocDetail",{get(){getterReads++;throw new Error("NO_GETTER");}});',
    'Object.defineProperty(scope.object.x.env,"compiler",{get(){getterReads++;throw new Error("NO_GETTER");}});',
    'Object.defineProperty(scope.object.x.env,"projectId",{value:undefined});',
  ]) {
    const context = fixture(change);
    assert.throws(() => callPcbStringObservation(context, CURRENT_PCB_COMMON_METADATA_FUNCTION), /PCB_COMMON_METADATA/u, change);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  }
  const context = fixture();
  assert.throws(() => runInContext(`(${CURRENT_PCB_COMMON_METADATA_FUNCTION}).call(scope,()=>{})`, context), /PCB_COMMON_METADATA/u);
});

void test("metadata collector bounds full unknown data instead of dropping unrepresentable fields", () => {
  for (const change of [
    'owner.docDetail.extra=()=>{};', 'owner.docDetail.extra=Infinity;', 'owner.docDetail[Symbol("unknown")]=1;',
    'owner.docDetail.extra="x".repeat(4097);', String.raw`owner.docDetail.extra="\uD800";`,
    'owner.docDetail.extra=new Date();', 'owner.docDetail.extra=new Array(3);',
    'for(let i=0;i<4096;i++)owner.docDetail["k"+i]=i;',
    'let tail=owner.docDetail;for(let i=0;i<34;i++)tail=tail.next={};',
  ]) { assert.throws(() => sample(change), /PCB_COMMON_METADATA/u, change); }
});

void test("metadata reply rejects missing evidence, malformed JSON and hostile wrappers without reading accessors", () => {
  const reply = sample();
  const raw = reply.result.value; assert.equal(typeof raw, "string");
  if (typeof raw !== "string") { throw new TypeError("Fixture string required"); }
  for (const altered of [
    raw.replace(',"ownerPublicShadowsAbsent":true', ""), raw.replace('"ownerPublicShadowsAbsent":true', '"ownerPublicShadowsAbsent":false'),
    raw.replace('"graph":', '"executionAuthorized":true,"graph":'), raw.replace('"graph":', '"graph":{},"graph":'),
    raw.replace('"docDetail"', '"other"'), raw.replace('"compilerUniqueId":"cccccccccccccccc"', '"compilerUniqueId":"bad"'),
    raw.replace('"title",["string","Fixture PCB"]', '"missing",["string","Fixture PCB"]'),
    raw.replace('"enumerableKeys":["title","parent","source","board","zIndex"],', ""),
    raw.replace(',"jsonToJSONAbsent":true', ""), " ".repeat(524_289),
  ]) { assert.throws(() => decodeCurrentPcbCommonMetadata(pcbStringReply(altered)), /PCB_COMMON_GRAPH_REPLY/u); }
  let calls = 0;
  assert.throws(() => decodeCurrentPcbCommonMetadata(new Proxy(reply, { ownKeys: (): string[] => { calls += 1; return []; } })), /PCB_COMMON_GRAPH_REPLY/u);
  const accessor = Object.defineProperty({}, "result", { get: (): typeof reply.result => { calls += 1; return reply.result; } });
  assert.throws(() => decodeCurrentPcbCommonMetadata(accessor), /PCB_COMMON_GRAPH_REPLY/u); assert.equal(calls, 0);
});

void test("fixed metadata leaf works under V8 side-effect checks and refuses Proxy traps without calling them", async () => {
  assert.equal(CURRENT_PCB_COMMON_METADATA_PROGRAM_SHA256, createHash("sha256").update(CURRENT_PCB_COMMON_METADATA_FUNCTION).digest("hex"));
  const session = new Session(); session.connect(); let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
      "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    for (const change of ["", 'owner.docDetail=new Proxy(owner.docDetail,{ownKeys(o){getterReads++;return Reflect.ownKeys(o);}});',
      'owner.docDetail.extra=new Proxy({},{getPrototypeOf(o){getterReads++;return Reflect.getPrototypeOf(o);}});']) {
      const context = fixture(change); assert.notEqual(uniqueContextId, "");
      const expression = `(${CURRENT_PCB_COMMON_METADATA_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback)`;
      const parameters = { expression, uniqueContextId, returnByValue: true, throwOnSideEffect: true, silent: true,
        awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
        userGesture: false, generatePreview: false, timeout: 1000 };
      // Node does not declare uniqueContextId and selects its void overload.
      const reply = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
      if (change === "") { assert.equal(decodeCurrentPcbCommonMetadata(reply).documentUuid, "d".repeat(16)); }
      else { assert.throws(() => decodeCurrentPcbCommonMetadata(reply), /PCB_COMMON_GRAPH_REPLY/u); }
      assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
    }
  } finally { session.disconnect(); }
});

/** Isolated V8 descriptor/program tests. No original worker, SDK call or native
 * process is issued; application-method counters must stay at zero. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_VIA_SAVE_CALLS as CALLS } from "../src/current-pcb-via-save-programs.ts";
import { CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM } from "../src/current-pcb-via-replay-program.ts";
import { CURRENT_PCB_VIA_REPLAY_METHODS } from "../src/current-pcb-via-replay-source.ts";
import { CURRENT_PCB_VIA_SAVE_METHOD_SOURCE, CURRENT_PCB_VIA_SAVE_METHODS as METHODS, CURRENT_PCB_VIA_SAVE_SITES as SITES, CURRENT_PCB_VIA_SAVE_SOURCE as SOURCE,
  qualifyCurrentPcbViaSaveSource } from "../src/current-pcb-via-save-source.ts";
import { decodeCurrentPcbViaSaveMethod, decodeCurrentPcbViaSavePause, decodeCurrentPcbViaSavePendingBodyValue } from "../src/current-pcb-via-save-replies.ts";
import { CURRENT_PCB_VIA_SAVE_REQUESTS, currentPcbViaSaveNativeCases, validateCurrentPcbViaSaveCommand } from "../src/current-pcb-via-save-protocol.ts";

function fixture(): ReturnType<typeof createContext> {
  const context = createContext({});
  runInContext(`globalThis.calls=0;class Gd {get isV2Format(){return this._isV2Format}set isV2Format(t){this._isV2Format=t,this._projectDetails&&(this._projectDetails.isV2Format=t)}}class Lg extends Gd{};globalThis.Gd=Gd;globalThis.PROJECT=Object.assign(new Lg(),{uuid:"${"b".repeat(64)}",_isV2Format:false,isReady:true,isHistoryBack:false,
consistencyManager:{asyncCompressFull(){calls++;throw Error("forbidden");},getMaxTicket(){calls++;throw Error("forbidden");},setMaxTicket(){calls++;throw Error("forbidden");}},
wsBus:{rpcCall(){calls++;throw Error("forbidden");}},pcb:{},user:undefined,saveCanvas:({${CURRENT_PCB_VIA_SAVE_METHOD_SOURCE}}).saveCanvas});
globalThis.PRO_EDITOR_VERSION="3.2.185";globalThis.node={ticket:3,client:"producer",dataType:"VIA",data:"{}",unique:"original-compiler",pend:true};
globalThis.pendingSet=new Set(["3333333333333333"]);Object.assign(PROJECT.consistencyManager,{maxTicket:4,uniqueIds:{"original-compiler":{"${"a".repeat(32)}":pendingSet}},wDocData:new Map([["${"a".repeat(32)}",new Map([["3333333333333333",{last:node}]])]]),docHead:{"${"a".repeat(32)}":{docType:"PCB",version:"prior"}}});
globalThis.arg={uuid:"${"a".repeat(32)}",path:"${"b".repeat(64)}",docIds:["${"a".repeat(32)}","BLOB","FONT"],uniqueId:"original-compiler",client:"original-client"};
globalThis.entryFrame=[PROJECT,arg,PROJECT.consistencyManager];
globalThis.original=(${CALLS.entry}).call(entryFrame,"${"a".repeat(32)}","${"b".repeat(64)}");
globalThis.clockFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123];
globalThis.clock=(${CALLS.clock}).call(clockFrame,original,original);
PROJECT.consistencyManager.maxTicket=5;globalThis.compressFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123,5];
globalThis.compress=(${CALLS.compress}).call(compressFrame,original,clock);
pendingSet.clear();delete PROJECT.consistencyManager.uniqueIds["original-compiler"]["${"a".repeat(32)}"];delete node.unique;delete node.pend;globalThis.bodyFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123,5,"original serialized Save body"];`, context);
  return context;
}
void test("actual Save-shaped frame joins retain the same uniqueId, clock, ticket and full-compress body without invoking methods", () => {
  const context = fixture();
  const result: unknown = runInContext(`(${CALLS.body}).call(bodyFrame,original,compress);(${CALLS.value}).call(bodyFrame,original)`, context);
  assert.ok(typeof result === "object" && result !== null && "body" in result && "clock" in result && "headTicket" in result && "uniqueId" in result);
  assert.equal(result.body, "original serialized Save body"); assert.equal(result.clock, 1_700_000_000_123); assert.equal(result.headTicket, 5);
  assert.equal(result.uniqueId, "original-compiler"); assert.equal(runInContext("calls", context), 0);
  runInContext(`PROJECT.isApplyShot=true;globalThis.resultFrame=[...bodyFrame,{success:true}];(${CALLS.result}).call(resultFrame,original,bodyFrame)`, context);
  assert.equal(runInContext("calls", context), 0);
});
void test("copied retained roots, another compiler, changed clocks or tickets and accessors refuse before any application method", () => {
  for (const alteration of ["original=[...original]", "arg.uniqueId='foreign'", "bodyFrame[3]++", "bodyFrame[4]++", "bodyFrame[1]={...arg}",
    "Object.defineProperty(PROJECT,'wsBus',{get(){calls++;throw Error('getter');}})", "Object.defineProperty(PROJECT,'isV2Format',{value:false})", "PROJECT._isV2Format=true", "Object.defineProperty(Gd.prototype,'isV2Format',{get(){calls++;return false;}})"]) {
    const context = fixture(); runInContext(alteration, context);
    assert.throws(() => runInContext(`(${CALLS.body}).call(bodyFrame,original,compress)`, context));
    assert.equal(runInContext("calls", context), 0);
  }
  const context = fixture(); runInContext("PROJECT.wsBus.rpcCall=function foreign(){}", context);
  assert.throws(() => runInContext(`(${CALLS.body}).call(bodyFrame,original,compress)`, context)); assert.equal(runInContext("calls", context), 0);
});
void test("the finite native casebook rejects caller conditions, code, different sites and session selection", () => {
  const cases = currentPcbViaSaveNativeCases(); assert.equal(cases.length, 23);
  for (const command of cases) {
    assert.deepEqual(validateCurrentPcbViaSaveCommand(command), command);
    assert.throws(() => validateCurrentPcbViaSaveCommand({ ...command, sessionId: "copied" }));
    if (command.phase === "via-save-arm") {
      assert.equal(command.params.location.columnNumber, SITES[command.role].columnNumber);
      assert.throws(() => validateCurrentPcbViaSaveCommand({ ...command, params: { ...command.params, condition: "false" } }));
      assert.throws(() => validateCurrentPcbViaSaveCommand({ ...command, params: { ...command.params, location: { ...command.params.location, columnNumber: command.params.location.columnNumber + 1 } } }));
    }
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentPcbViaSaveCommand({ ...command, params: { ...command.params, functionDeclaration: `${command.params.functionDeclaration}\n` } })); }
  }
  assert.equal(CURRENT_PCB_VIA_SAVE_REQUESTS.normal + CURRENT_PCB_VIA_SAVE_REQUESTS.cleanup, CURRENT_PCB_VIA_SAVE_REQUESTS.total);
  assert.equal(Buffer.byteLength(CURRENT_PCB_VIA_SAVE_METHOD_SOURCE), SOURCE.saveCanvas.bytes);
  assert.equal(createHash("sha256").update(CURRENT_PCB_VIA_SAVE_METHOD_SOURCE).digest("hex"), SOURCE.saveCanvas.sha256);
  let traps = 0; assert.throws(() => qualifyCurrentPcbViaSaveSource(new Proxy({}, { get(): never { traps += 1; throw new Error("forbidden"); } })));
  assert.equal(traps, 0); assert.throws(() => qualifyCurrentPcbViaSaveSource(CURRENT_PCB_VIA_SAVE_METHOD_SOURCE));
});

const property = (name: string, value: unknown): unknown => ({ name, value: { type: typeof value, value }, writable: false, enumerable: false, configurable: true, isOwn: true });
void test("original function locations, exact pause sites and complete body bounds remain required", () => {
  for (const role of ["save", "rpc", "compress", "getTicket", "setTicket"] as const) {
    const expected = METHODS[role];
    const metadata = { result: [property("name", expected.name), property("length", expected.arity)], internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber } } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", objectId: "scope" } }, { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } }] };
    decodeCurrentPcbViaSaveMethod(metadata, role, "original"); assert.throws(() => { decodeCurrentPcbViaSaveMethod(metadata, role, "foreign"); });
  }
  const site = SITES.body; const pause = { reason: "other", hitBreakpoints: ["bp"], callFrames: [{ callFrameId: "frame", functionName: "saveCanvas",
    location: { scriptId: "original", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
    functionLocation: { scriptId: "original", lineNumber: SOURCE.saveCanvas.functionLine, columnNumber: SOURCE.saveCanvas.functionColumn } }] };
  assert.equal(decodeCurrentPcbViaSavePause(pause, "body", "original", "bp"), "frame"); assert.throws(() => decodeCurrentPcbViaSavePause(pause, "clock", "original", "bp"));
  const remote: unknown = runInContext(`(${CALLS.value}).call(bodyFrame,original)`, fixture());
  const value: unknown = structuredClone(remote);
  assert.ok(typeof value === "object" && value !== null); assert.equal(decodeCurrentPcbViaSavePendingBodyValue({ result: { type: "object", value } }).clock, 1_700_000_000_123);
  assert.throws(() => decodeCurrentPcbViaSavePendingBodyValue({ result: { type: "object", value: { ...value, body: "é".repeat(9000) } } }));
});

void test("the actual compressed header user falls back to the retained prior header in its original key order", () => {
  const context = fixture();
  runInContext(`const manager=PROJECT.consistencyManager;manager.maxTicket=4;node.unique="original-compiler";node.pend=true;pendingSet.add("3333333333333333");manager.uniqueIds["original-compiler"]["${"a".repeat(32)}"]=pendingSet;manager.docHead["${"a".repeat(32)}"].user={nickname:"N",uuid:"u",username:"U"};original=(${CALLS.entry}).call(entryFrame,"${"a".repeat(32)}","${"b".repeat(64)}");manager.maxTicket=5;pendingSet.clear();delete manager.uniqueIds["original-compiler"]["${"a".repeat(32)}"];delete node.unique;delete node.pend;`, context);
  const raw: unknown = runInContext(`(${CALLS.value}).call(bodyFrame,original)`, context);
  const value = decodeCurrentPcbViaSavePendingBodyValue({ result: { type: "object", value: structuredClone(raw) } });
  assert.equal(value.userUndefined, false); assert.equal(value.userJson, '{"nickname":"N","uuid":"u","username":"U"}');
  assert.equal(value.pending.priorUserJson, value.userJson); assert.equal(value.pending.workerEditVersion, "3.2.185"); assert.equal(runInContext("calls", context), 0);
});

function replayFixture(): ReturnType<typeof createContext> {
  const context = fixture();
  runInContext(`const manager=PROJECT.consistencyManager;manager.maxTicket=4;node.client=arg.client;node.unique="original-compiler";node.pend=true;pendingSet.add("3333333333333333");manager.uniqueIds["original-compiler"]["${"a".repeat(32)}"]=pendingSet;
original=(${CALLS.entry}).call(entryFrame,"${"a".repeat(32)}","${"b".repeat(64)}");manager.maxTicket=5;pendingSet.clear();delete manager.uniqueIds["original-compiler"]["${"a".repeat(32)}"];delete node.unique;delete node.pend;
Object.assign(manager,{${Object.values(CURRENT_PCB_VIA_REPLAY_METHODS).map(row => row.source).join(",")}});
Object.assign(manager.docHead[arg.uuid],{uuid:arg.uuid,client:arg.uuid,updateTime:bodyFrame[3],version:String(bodyFrame[3]),ticket:5,editVersion:PRO_EDITOR_VERSION});
globalThis.doc={docType:"PCB",uuid:"${"a".repeat(32)}",client:arg.client,updateTime:bodyFrame[3],version:String(bodyFrame[3])};
globalThis.via={type:"VIA",ticket:node.ticket,id:"3333333333333333"};
globalThis.replaceBody=()=>{bodyFrame[5]=JSON.stringify({type:"DOCHEAD",ticket:5})+"||"+JSON.stringify(doc)+"|\\n"+JSON.stringify(via)+"||"+node.data};replaceBody();globalThis.merged=[PROJECT,undefined,false,()=>{},Promise.resolve(),undefined,undefined,[],0,false];`, context);
  return context;
}
void test("pre-replay reproof requires the same unpended saved node and a matching incoming client, ticket and body", () => {
  const context = replayFixture();
  assert.equal(runInContext(`(${CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM}).call(bodyFrame,original,merged)`, context), true);
  assert.equal(runInContext("calls", context), 0);
});
void test("pre-replay reproof refuses pending or replaced nodes, foreign clients, a pend header and substituted parser methods", () => {
  for (const alteration of ["node.pend=true", "via.pend=true;replaceBody()", "doc.client='foreign';replaceBody()", "via.ticket++;replaceBody()",
    "manager.wDocData.get(arg.uuid).get(via.id).last={...node}", "original=[...original]", "merged[0]={...PROJECT}",
    "manager.docHead[arg.uuid]={...manager.docHead[arg.uuid]}", "manager.docHead[arg.uuid].updateTime++", "manager.docHead[arg.uuid].ticket++", "manager.docHead[arg.uuid].version='foreign'",
    "manager.remoteChange=function replacement(){calls++;throw Error('forbidden')}",
    "Object.defineProperty(manager,'flowParseFull',{get(){calls++;throw Error('getter')}})"]) {
    const context = replayFixture(); runInContext(alteration, context);
    assert.throws(() => runInContext(`(${CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM}).call(bodyFrame,original,merged)`, context));
    assert.equal(runInContext("calls", context), 0);
  }
});

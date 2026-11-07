/** Isolated V8 descriptor/program tests. No original worker, SDK call or native
 * process is issued; application-method counters must stay at zero. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_CALLS as CALLS } from "../src/current-schematic-display-save-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_METHOD_SOURCE, CURRENT_SCHEMATIC_DISPLAY_SAVE_METHODS as METHODS, CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES as SITES, CURRENT_SCHEMATIC_DISPLAY_SAVE_SOURCE as SOURCE,
  qualifyCurrentSchematicDisplaySaveSource } from "../src/current-schematic-display-save-source.ts";
import { decodeCurrentSchematicDisplaySaveBodyValue, decodeCurrentSchematicDisplaySaveMethod, decodeCurrentSchematicDisplaySavePause } from "../src/current-schematic-display-save-replies.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS, currentSchematicDisplaySaveNativeCases, validateCurrentSchematicDisplaySaveCommand } from "../src/current-schematic-display-save-protocol.ts";

import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_REPLAY_NO_PUBLICATION_PROGRAM as REPLAY } from "../src/current-schematic-relevance-display-replay-program.ts";
import { CURRENT_PCB_VIA_REPLAY_METHODS } from "../src/current-pcb-via-replay-source.ts";

function fixture(): ReturnType<typeof createContext> {
  const context = createContext({});
  runInContext(`globalThis.calls=0;class Gd {get isV2Format(){return this._isV2Format}set isV2Format(t){this._isV2Format=t,this._projectDetails&&(this._projectDetails.isV2Format=t)}}class Lg extends Gd{};globalThis.Gd=Gd;globalThis.PROJECT=Object.assign(new Lg(),{uuid:"${"b".repeat(64)}",_isV2Format:false,isReady:true,isHistoryBack:false,
consistencyManager:{asyncCompressFull(){calls++;throw Error("forbidden");},getMaxTicket(){calls++;throw Error("forbidden");},setMaxTicket(){calls++;throw Error("forbidden");}},
wsBus:{rpcCall(){calls++;throw Error("forbidden");}},sheet:{},user:undefined,saveCanvas:({${CURRENT_SCHEMATIC_DISPLAY_SAVE_METHOD_SOURCE}}).saveCanvas});
globalThis.arg={uuid:"${"a".repeat(32)}",path:"${"b".repeat(64)}",docIds:["${"a".repeat(32)}","BLOB","FONT"],uniqueId:"original-compiler",client:"original-client"};
globalThis.PRO_EDITOR_VERSION="3.2.209";globalThis.node={ticket:3,client:"original-client",dataType:"TEXT",data:'{"value":"literal"}',unique:arg.uniqueId,pend:true};
globalThis.selected={ [arg.uuid]:new Set(["text-id"]) };globalThis.r=PROJECT.consistencyManager;Object.assign(r,{uniqueIds:{[arg.uniqueId]:selected},maxTicket:4,wDocData:new Map([[arg.uuid,new Map([["text-id",{last:node}]])]]),docHead:{[arg.uuid]:{docType:"SCH_PAGE",version:"prior",user:{nickname:"N",uuid:"u",username:"U"}}}});
globalThis.entryFrame=[PROJECT,arg,PROJECT.consistencyManager];
globalThis.original=(${CALLS.entry}).call(entryFrame,"${"a".repeat(32)}","${"b".repeat(64)}");
globalThis.clockFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123];
globalThis.clock=(${CALLS.clock}).call(clockFrame,original,original);
r.maxTicket=5;globalThis.compressFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123,5];
globalThis.compress=(${CALLS.compress}).call(compressFrame,original,clock);
selected[arg.uuid].clear();delete selected[arg.uuid];delete node.unique;delete node.pend;globalThis.bodyFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123,5,"original serialized Save body"];`, context);
  return context;
}
void test("actual Save-shaped frame joins retain the same uniqueId, clock, ticket and full-compress body without invoking methods", () => {
  const context = fixture();
  const result: unknown = runInContext(`(${CALLS.body}).call(bodyFrame,original,compress);(${CALLS.value}).call(bodyFrame,original)`, context);
  assert.ok(typeof result === "object" && result !== null && "body" in result && "clock" in result && "headTicket" in result && "uniqueId" in result);
  assert.equal(result.body, "original serialized Save body"); assert.equal(result.clock, 1_700_000_000_123); assert.equal(result.headTicket, 5);
  assert.equal(result.uniqueId, "original-compiler");
  assert.ok("userJson" in result && "pending" in result); assert.equal(result.userJson, '{"nickname":"N","uuid":"u","username":"U"}'); assert.equal(runInContext("calls", context), 0);
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
  const cases = currentSchematicDisplaySaveNativeCases(); assert.equal(cases.length, 23);
  for (const command of cases) {
    assert.deepEqual(validateCurrentSchematicDisplaySaveCommand(command), command);
    assert.throws(() => validateCurrentSchematicDisplaySaveCommand({ ...command, sessionId: "copied" }));
    if (command.phase === "schematic-save-arm") {
      assert.equal(command.params.location.columnNumber, SITES[command.role].columnNumber);
      assert.throws(() => validateCurrentSchematicDisplaySaveCommand({ ...command, params: { ...command.params, condition: "false" } }));
      assert.throws(() => validateCurrentSchematicDisplaySaveCommand({ ...command, params: { ...command.params, location: { ...command.params.location, columnNumber: command.params.location.columnNumber + 1 } } }));
    }
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validateCurrentSchematicDisplaySaveCommand({ ...command, params: { ...command.params, functionDeclaration: `${command.params.functionDeclaration}\n` } })); }
  }
  assert.equal(CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS.normal + CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS.cleanup, CURRENT_SCHEMATIC_DISPLAY_SAVE_REQUESTS.total);
  assert.equal(Buffer.byteLength(CURRENT_SCHEMATIC_DISPLAY_SAVE_METHOD_SOURCE), SOURCE.saveCanvas.bytes);
  assert.equal(createHash("sha256").update(CURRENT_SCHEMATIC_DISPLAY_SAVE_METHOD_SOURCE).digest("hex"), SOURCE.saveCanvas.sha256);
  let traps = 0; assert.throws(() => qualifyCurrentSchematicDisplaySaveSource(new Proxy({}, { get(): never { traps += 1; throw new Error("forbidden"); } })));
  assert.equal(traps, 0); assert.throws(() => qualifyCurrentSchematicDisplaySaveSource(CURRENT_SCHEMATIC_DISPLAY_SAVE_METHOD_SOURCE));
});

const property = (name: string, value: unknown): unknown => ({ name, value: { type: typeof value, value }, writable: false, enumerable: false, configurable: true, isOwn: true });
void test("original function locations, exact pause sites and complete body bounds remain required", () => {
  for (const role of ["save", "rpc", "compress", "getTicket", "setTicket"] as const) {
    const expected = METHODS[role];
    const metadata = { result: [property("name", expected.name), property("length", expected.arity)], internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber } } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", objectId: "scope" } }, { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } }] };
    decodeCurrentSchematicDisplaySaveMethod(metadata, role, "original"); assert.throws(() => { decodeCurrentSchematicDisplaySaveMethod(metadata, role, "foreign"); });
  }
  const site = SITES.body; const pause = { reason: "other", hitBreakpoints: ["bp"], callFrames: [{ callFrameId: "frame", functionName: "saveCanvas",
    location: { scriptId: "original", lineNumber: site.lineNumber, columnNumber: site.columnNumber },
    functionLocation: { scriptId: "original", lineNumber: SOURCE.saveCanvas.functionLine, columnNumber: SOURCE.saveCanvas.functionColumn } }] };
  assert.equal(decodeCurrentSchematicDisplaySavePause(pause, "body", "original", "bp"), "frame"); assert.throws(() => decodeCurrentSchematicDisplaySavePause(pause, "clock", "original", "bp"));
  const remote: unknown = runInContext(`(${CALLS.value}).call(bodyFrame,original)`, fixture());
  const value: unknown = structuredClone(remote);
  assert.ok(typeof value === "object" && value !== null); assert.equal(decodeCurrentSchematicDisplaySaveBodyValue({ result: { type: "object", value } }).clock, 1_700_000_000_123);
  assert.throws(() => decodeCurrentSchematicDisplaySaveBodyValue({ result: { type: "object", value: { ...value, body: "é".repeat(9000) } } }));
});

function replayFixture(): ReturnType<typeof createContext> { const context = fixture(); runInContext(`Object.assign(r,{${Object.values(CURRENT_PCB_VIA_REPLAY_METHODS).map(row=>row.source).join(",")}});Object.assign(r.docHead[arg.uuid],{uuid:arg.uuid,client:arg.uuid,updateTime:bodyFrame[3],version:String(bodyFrame[3]),ticket:5,editVersion:PRO_EDITOR_VERSION});globalThis.doc={docType:"SCH_PAGE",uuid:arg.uuid,client:arg.client,updateTime:bodyFrame[3],version:String(bodyFrame[3])};globalThis.header={type:"TEXT",ticket:node.ticket,id:"text-id"};globalThis.replaceBody=()=>{bodyFrame[5]=JSON.stringify({type:"DOCHEAD",ticket:5})+"||"+JSON.stringify(doc)+"|\\n"+JSON.stringify(header)+"||"+node.data};replaceBody();globalThis.merged=[PROJECT,undefined,false,()=>{},Promise.resolve(),undefined,undefined,[],0,false];`,context);return context; }
void test("seven-record TEXT replay reproof retains the original unpended node and exact native header", () => {

  const context=replayFixture();assert.equal(runInContext(`(${REPLAY}).call(bodyFrame,original,merged)`,context),true);assert.equal(runInContext("calls",context),0);
  for(const change of ["node.pend=true","header.pend=true;replaceBody()","header.type='VIA';replaceBody()","doc.docType='PCB';replaceBody()","r.wDocData.get(arg.uuid).get('text-id').last={...node}","r.docHead[arg.uuid]={...r.docHead[arg.uuid]}","r.docHead[arg.uuid].updateTime++","doc.client='foreign';replaceBody()","Object.defineProperty(r,'onDocHead',{get(){calls++;throw Error('getter')}})"]){const altered=replayFixture();runInContext(change,altered);assert.throws(()=>runInContext(`(${REPLAY}).call(bodyFrame,original,merged)`,altered));assert.equal(runInContext("calls",altered),0);}
});

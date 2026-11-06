/** Isolated V8 descriptor/program tests. No original worker, SDK call or native
 * process is issued; application-method counters must stay at zero. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_VIA_SAVE_CALLS as CALLS } from "../src/current-pcb-via-save-programs.ts";
import { CURRENT_PCB_VIA_SAVE_METHOD_SOURCE, CURRENT_PCB_VIA_SAVE_METHODS as METHODS, CURRENT_PCB_VIA_SAVE_SITES as SITES, CURRENT_PCB_VIA_SAVE_SOURCE as SOURCE,
  qualifyCurrentPcbViaSaveSource } from "../src/current-pcb-via-save-source.ts";
import { decodeCurrentPcbViaSaveBodyValue, decodeCurrentPcbViaSaveMethod, decodeCurrentPcbViaSavePause } from "../src/current-pcb-via-save-replies.ts";
import { CURRENT_PCB_VIA_SAVE_REQUESTS, currentPcbViaSaveNativeCases, validateCurrentPcbViaSaveCommand } from "../src/current-pcb-via-save-protocol.ts";

function fixture(): ReturnType<typeof createContext> {
  const context = createContext({});
  runInContext(`globalThis.calls=0;globalThis.PROJECT={uuid:"${"b".repeat(64)}",isV2Format:false,isReady:true,isHistoryBack:false,
consistencyManager:{asyncCompressFull(){calls++;throw Error("forbidden");},getMaxTicket(){calls++;throw Error("forbidden");},setMaxTicket(){calls++;throw Error("forbidden");}},
wsBus:{rpcCall(){calls++;throw Error("forbidden");}},pcb:{},user:undefined,saveCanvas:({${CURRENT_PCB_VIA_SAVE_METHOD_SOURCE}}).saveCanvas};
globalThis.arg={uuid:"${"a".repeat(32)}",path:"${"b".repeat(64)}",docIds:["${"a".repeat(32)}","BLOB","FONT"],uniqueId:"original-compiler",client:"original-client"};
globalThis.entryFrame=[PROJECT,arg,PROJECT.consistencyManager];
globalThis.original=(${CALLS.entry}).call(entryFrame,"${"a".repeat(32)}","${"b".repeat(64)}");
globalThis.clockFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123];
globalThis.clock=(${CALLS.clock}).call(clockFrame,original,original);
globalThis.compressFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123,5];
globalThis.compress=(${CALLS.compress}).call(compressFrame,original,clock);
globalThis.bodyFrame=[PROJECT,arg,PROJECT.consistencyManager,1700000000123,5,"original serialized Save body"];`, context);
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
    "Object.defineProperty(PROJECT,'wsBus',{get(){calls++;throw Error('getter');}})"]) {
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
  assert.ok(typeof value === "object" && value !== null); assert.equal(decodeCurrentPcbViaSaveBodyValue({ result: { type: "object", value } }).clock, 1_700_000_000_123);
  assert.throws(() => decodeCurrentPcbViaSaveBodyValue({ result: { type: "object", value: { ...value, body: "é".repeat(9000) } } }));
});

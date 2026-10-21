import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_STRING_COMMAND_STATE_FUNCTION, decodeCurrentPcbStringCommandState } from "../src/current-pcb-string-command-state.ts";
import { pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";
import { CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING, currentPcbTeardropSources } from "./helpers/current-pcb-teardrop-fixture.ts";

const SETUP = `
class G6{constructor(){this.groupId=undefined;this.groupName=null;this.number=-1;
this.gId="e".repeat(16);this.action="add";this.source=undefined;}}
class De{constructor(){this._commands=[new G6()];this.refreshService=true;this.needCheckFilterCommand=true;
this._partitionNeedAskBeforeDelete=false;this.createPartitionFile=false;this.idMap=new Map();
this.waitingUploadStack=[];this.sendCopperOrderChange=false;this.description="create texts for api";}}
class kde{constructor(){this.undoCommand=[];this.redoCommand=[];this.stack=new De();}}
class rd{constructor(){this._globalIndex="e".repeat(16);this.modelType="Text";}}
class bo{constructor(){this.map=new Map([["e".repeat(16),new rd()]]);}}bo.manager=new bo();
class t7{constructor(){this.mgr=bo.manager;}}
class pE{constructor(){this.flag=false;}}pE.proxy=new pE();
class qI{constructor(){this.data=new Set();}}qI.proxy=new qI();
class e5{constructor(){this.data=new Set();}}e5.proxy=new e5();
class Sfe{constructor(){this.isMove=false;this.suspend=true;this.modify=new Set();this.task=new Set();this.modifyTears=new Set();this.timeoutId=null;}${currentPcbTeardropSources.join("")}}
Object.assign(scope.object,{G6,De,rd,bo,t7,pE,qI,e5,Xe:new kde(),Jr:new t7()});
producerConstructors[0]=kde;producerConstructors[1]=Sfe;
const tearsOwner=new Sfe();${CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING}
`;
const EXPRESSION = `(${CURRENT_PCB_STRING_COMMAND_STATE_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,producerConstructors,teardropProof)`;
function sample(change = ""): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(runInContext(EXPRESSION, pcbStringObservationFixture(false, SETUP + change), { timeout: 1000 }) as unknown);
}

void test("one String command observes generated ID and exact upload-cleared history", () => {
  const state = decodeCurrentPcbStringCommandState(sample());
  assert.equal(state.primitiveId, "e".repeat(16)); assert.equal(state.history.commandCount, 1);
  assert.equal(state.history.source, "undefined"); assert.equal(state.history.data, "absent");
  assert.equal(state.teardrop.timer, "null"); assert.equal(state.queueCompletionVerified, false);
  assert.equal(state.saveAuthorized, false); assert.equal(state.executionAuthorized, false);
  assert.equal(decodeCurrentPcbStringCommandState(sample("teardropProof[0].timeoutId=0;")).teardrop.timer, "present");
});

void test("one String command refuses extra history, changed identities, source retention and shared uploads", () => {
  for (const change of [
    "scope.object.Xe.undoCommand.push({});", "scope.object.Xe.redoCommand.push({});", "scope.object.Xe.stack=null;",
    "scope.object.Xe.stack._commands.push(new G6());", "scope.object.Xe.stack.waitingUploadStack.push({});",
    'scope.object.Xe.stack.idMap.set("hidden",{});', "scope.object.Xe.stack.refreshService=false;",
    'scope.object.Xe.stack.description="other";', "scope.object.Xe.stack.extra=true;",
    'scope.object.Xe.stack._commands[0].gId="f".repeat(16);',
    'scope.object.Xe.stack._commands[0].action="modify";',
    "scope.object.Xe.stack._commands[0].source=null;", "scope.object.Xe.stack._commands[0].data=undefined;",
    "scope.object.Xe.stack._commands[0].groupId=null;", "scope.object.Xe.stack._commands[0].extra=true;",
    'scope.object.bo.manager.map.set("f".repeat(16),new rd());',
    "scope.object.Jr.mgr=new bo();", "scope.object.pE.proxy.flag=true;",
    "scope.object.qI.proxy.data.add({});", "scope.object.e5.proxy.data.add({});",
    "teardropProof[0].modify.add({});", "teardropProof[0].task.add({});", "teardropProof[0].modifyTears.add({});",
    "teardropProof[0].suspend=false;", "teardropProof[0].timeoutId=false;",
    "MSG_BUS_PCB.messageBus.subscribed.SetSuspend[0].callback=()=>{};",
    "teardropProof[0].setSuspend=teardropProof[2][1];",
    "producerConstructors[0]=class kde{};", "producerConstructors[1]=class Sfe{};",
  ]) { assert.throws(() => sample(change), /PCB_STRING_OBSERVATION_STATE/u, change); }
});

void test("one String command decoder refuses wrong cardinality, ID, raw markers and authority", () => {
  const raw = sample().result.value; assert.ok(typeof raw === "string");
  for (const text of [
    raw.replace('"commandCount":1', '"commandCount":2'),
    raw.replace('"undoCount":0', '"undoCount":-0'),
    raw.replace('"source":"undefined"', '"source":"null"'),
    raw.replace('"timer":"null"', '"timer":"undefined"'),
    raw.replace('"primitiveId":', '"saveAuthorized":true,"primitiveId":'),
    raw.replace("e".repeat(16), "INVALID"),
  ]) { assert.throws(() => decodeCurrentPcbStringCommandState(pcbStringReply(text)), /PCB_STRING_OBSERVATION_REPLY/u); }
});

void test("one String command read passes local V8 effect check without invoking its history", async () => {
  const session = new Session(); session.connect();
  let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
        "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    const context = pcbStringObservationFixture(false, SETUP);
    assert.notEqual(uniqueContextId, "");
    const expression = EXPRESSION;
    const parameters = { expression, uniqueContextId, returnByValue: true, throwOnSideEffect: true, silent: true,
      awaitPromise: false, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false,
      userGesture: false, generatePreview: false, timeout: 1000 };
    // Node does not declare uniqueContextId and selects its void overload.
    const observed = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    decodeCurrentPcbStringCommandState(observed);
    runInContext('scope.object.Xe.stack=new Proxy(scope.object.Xe.stack,{ownKeys(o){getterReads++;return Reflect.ownKeys(o);}});', context);
    const refused = await (session.post("Runtime.evaluate", parameters) as Promise<unknown>);
    assert.throws(() => decodeCurrentPcbStringCommandState(refused), /PCB_STRING_OBSERVATION_REPLY/u);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  } finally { session.disconnect(); }
});

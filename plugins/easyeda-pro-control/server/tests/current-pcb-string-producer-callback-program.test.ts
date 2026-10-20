import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT, CURRENT_PCB_STRING_BUFFER_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_COOPERATION_CALLBACK_SELECTOR, CURRENT_PCB_STRING_DRAIN_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_STRUCTURE_CALLBACK_SELECTOR, CURRENT_PCB_STRING_UPLOAD_CALLBACK_SELECTOR,
  CURRENT_PCB_STRING_UPLOAD_STRUCTURE_CALLBACK_SELECTOR, decodeCurrentPcbStringBufferedCallbackEnvironment } from "../src/current-pcb-string-producer-callback-program.ts";
import { decodeCurrentPcbStringProducerCallbackFunction } from "../src/current-pcb-string-producer-callback-scope.ts";
import { currentPcbStringProducerCallbackSources as CALLBACKS } from "./helpers/current-pcb-string-producer-callback-fixture.ts";
import { currentPcbStringProducerSources as WRAPPERS } from "./helpers/current-pcb-string-producer-fixture.ts";

/** Only native wrapper/callback construction occurs. All six callback bodies
 * remain uncalled. Other setup and hostile mutations below are synthetic. */
const SETUP = `
globalThis.trapCalls=0;
function Nd(e){let t=null,s=null,r;return ${WRAPPERS.serial}}
function QA(e,t,s=!1){let r,i=null;return ${WRAPPERS.debounce}}
function ZA(e,t){let s=new Array,r=null,i=null;return ${WRAPPERS.cooperation}}
class Gd{bufferedStream(t,s){let r=null,i=null,n=null,a=this;return ${WRAPPERS.upload};${CALLBACKS.buffer}${CALLBACKS.drain}}}
class Lg extends Gd{constructor(){super();this.uuid="a".repeat(64);this._branchUuid="b".repeat(32);this.task1=new Set;this.bufferUploadData=new Map;
this.uploadStructure=Nd(${CALLBACKS.uploadStructure});this.structure=Nd(QA(${CALLBACKS.structure},300));
this.bufferedPendDataStream=ZA(${CALLBACKS.cooperation},10);this.bufferedUploadCloud=this.bufferedStream(${CALLBACKS.upload},500);}}
globalThis.PROJECT=new Lg;globalThis._TAB_ID_="synthetic-window";
`;
const handle = (reply: unknown): string => z.object({ result: z.object({ type: z.literal("function"),
  className: z.enum(["Function", "AsyncFunction"]), objectId: z.string(), description: z.string() }).strict() }).strict().parse(reply).result.objectId;

void test("effect-checked fixed selectors bind six original callbacks and fresh buffered environments without callback execution", async () => {
  const session = new Session(); session.connect(); let contextId = 0, paused = false;
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "callback-program") { contextId = params.context.id; }
  });
  session.on("Debugger.paused", (): void => { paused = true; });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const context = createContext({}, { name: "callback-program" }); runInContext(SETUP, context);
    const evaluate = async (expression: string): Promise<string> => {
      const result = await (session.post("Runtime.evaluate", {
        expression, contextId, returnByValue: false, objectGroup: "callback-program", throwOnSideEffect: true, silent: true }) as Promise<unknown>);
      return handle(result);
    };
    const call = (objectId: string, functionDeclaration: string, handles: readonly string[], returnByValue = false): Promise<unknown> =>
      session.post("Runtime.callFunctionOn", { objectId, functionDeclaration, arguments: handles.map(value => ({ objectId: value })),
        returnByValue, throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false });
    const scopes = async (objectId: string): Promise<readonly string[]> => {
      const reply = await session.post("Runtime.getProperties", { objectId, ownProperties: true });
      const list = reply.internalProperties?.find(item => item.name === "[[Scopes]]")?.value?.objectId; assert.ok(list !== undefined);
      const result = await session.post("Runtime.getProperties", { objectId: list, ownProperties: true });
      return result.result.map(item => { assert.ok(item.value?.objectId !== undefined); return item.value.objectId; });
    };
    const first = async (objectId: string): Promise<string> => {
      const items = await scopes(objectId), result = items[0]; assert.ok(result !== undefined); return result;
    };
    for (const [field, program, kind] of [
      ["uploadStructure", CURRENT_PCB_STRING_UPLOAD_STRUCTURE_CALLBACK_SELECTOR, "uploadStructure"],
      ["bufferedPendDataStream", CURRENT_PCB_STRING_COOPERATION_CALLBACK_SELECTOR, "cooperation"],
    ] as const) {
      const wrapper = await evaluate(`PROJECT.${field}`);
      const scope = await first(wrapper);
      decodeCurrentPcbStringProducerCallbackFunction(await call(scope, program, [wrapper]), kind);
    }
    const structure = await evaluate("PROJECT.structure");
    const serialScope = await first(structure);
    const debounce = handle(await call(serialScope, 'function(){return this.object.e}', []));
    const debounceScopes = await scopes(debounce), parameters = debounceScopes[1]; assert.ok(parameters !== undefined);
    decodeCurrentPcbStringProducerCallbackFunction(await call(parameters, CURRENT_PCB_STRING_STRUCTURE_CALLBACK_SELECTOR,
      [structure, serialScope, debounce]), "structure");

    const wrapper = await evaluate("PROJECT.bufferedUploadCloud"), wrapperScope = await first(wrapper);
    const upload = decodeCurrentPcbStringProducerCallbackFunction(await call(wrapperScope, CURRENT_PCB_STRING_UPLOAD_CALLBACK_SELECTOR, [wrapper]), "upload");
    const buffer = decodeCurrentPcbStringProducerCallbackFunction(await call(wrapperScope, CURRENT_PCB_STRING_BUFFER_CALLBACK_SELECTOR, [wrapper]), "buffer");
    const drain = decodeCurrentPcbStringProducerCallbackFunction(await call(wrapperScope, CURRENT_PCB_STRING_DRAIN_CALLBACK_SELECTOR, [wrapper]), "drain");
    const read = async (): Promise<unknown> => call(await first(wrapper), CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT,
      [wrapper, await first(buffer), await first(drain), upload, buffer, drain], true);
    const state = decodeCurrentPcbStringBufferedCallbackEnvironment(await read());
    assert.equal(state.retainedProjectReferenceMatched, true); assert.equal(state.callbackReferencesMatched, true);
    assert.equal(state.uploadLexicalReceiverVerified, false); assert.equal(state.originalOwnerVerified, false);
    assert.equal(state.queueCompletionVerified, false); assert.equal(state.executionAuthorized, false);
    assert.equal(state.timer, "null"); assert.equal(state.promise, "null");

    const foreignWrapper = await evaluate("PROJECT.structure");
    const wrong = await call(await first(wrapper), CURRENT_PCB_STRING_BUFFERED_CALLBACK_ENVIRONMENT,
      [wrapper, await first(buffer), await first(drain), foreignWrapper, buffer, drain], true);
    assert.throws(() => decodeCurrentPcbStringBufferedCallbackEnvironment(wrong), /OBSERVATION_REPLY/u);
    runInContext('globalThis.saved=PROJECT;PROJECT=new Proxy(PROJECT,{getOwnPropertyDescriptor(target,key){trapCalls++;return Reflect.getOwnPropertyDescriptor(target,key);}})', context);
    const proxy = await read(); assert.throws(() => decodeCurrentPcbStringBufferedCallbackEnvironment(proxy), /OBSERVATION_REPLY/u);
    runInContext("PROJECT=saved;PROJECT.bufferedUploadCloud=()=>{}", context);
    const swapped = await read(); assert.throws(() => decodeCurrentPcbStringBufferedCallbackEnvironment(swapped), /OBSERVATION_REPLY/u);
    assert.equal(runInContext("trapCalls", context) as unknown, 0); assert.equal(paused, false);
    await session.post("Runtime.releaseObjectGroup", { objectGroup: "callback-program" });
  } finally { session.disconnect(); }
});

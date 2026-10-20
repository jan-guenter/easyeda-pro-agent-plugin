import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_STRING_PRODUCER_CALLBACK_LOCATIONS, decodeCurrentPcbStringProducerCallbackFunction,
  decodeCurrentPcbStringProducerCallbackScope, decodeCurrentPcbStringProducerCallbackScopeList } from "../src/current-pcb-string-producer-callback-scope.ts";
import type { CurrentPcbStringProducerCallbackKind } from "../src/current-pcb-string-producer-callback-scope.ts";
import { currentPcbStringProducerCallbackSources as SOURCES } from "./helpers/current-pcb-string-producer-callback-fixture.ts";

function fixture(kind: CurrentPcbStringProducerCallbackKind): string {
  const profile = CURRENT_PCB_STRING_PRODUCER_CALLBACK_LOCATIONS[kind];
  let adjustment = 0;
  if (kind === "buffer") { adjustment = 10; }
  if (kind === "drain") { adjustment = 16; }
  const column = profile.columnNumber - adjustment;
  const padding = `${"\n".repeat(profile.lineNumber)}${" ".repeat(column)}`;
  if (kind === "buffer" || kind === "drain") {
    return `class Lg{bufferedStream(t,s){let r=null,i=null,n=null,a=this;${padding}${SOURCES[kind]};return ${profile.name};}}globalThis.original=new Lg().bufferedStream(()=>{},500);`;
  }
  return `class Lg{constructor(){this.callback=(${padding}${SOURCES[kind]});}}globalThis.PROJECT=new Lg;globalThis.foreign=new Lg;globalThis.original=PROJECT.callback;`;
}

void test("six callback bodies retain exact strict-class metadata; hidden lexical receivers remain refused", async () => {
  const session = new Session(); session.connect();
  let contextId = 0, paused = false, scriptId = "";
  session.on("Debugger.paused", (): void => { paused = true; });
  session.on("Debugger.scriptParsed", ({ params }): void => { if (params.url === "callback-scope.js") { scriptId = params.scriptId; } });
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "callback-scope") { contextId = params.context.id; }
  });
  const properties = (objectId: string): Promise<unknown> => session.post("Runtime.getProperties",
    { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
  const evaluate = (expression: string): Promise<unknown> => session.post("Runtime.evaluate", {
    expression, contextId, returnByValue: false, objectGroup: "synthetic-callback-scopes", throwOnSideEffect: true, silent: true });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const kind of ["uploadStructure", "structure", "cooperation", "upload", "buffer", "drain"] as const) {
      const context = createContext({}, { name: "callback-scope" });
      runInContext(fixture(kind), context, { filename: "callback-scope.js", timeout: 1000 });
      const reply = await evaluate("original");
      const handle = decodeCurrentPcbStringProducerCallbackFunction(reply, kind);
      const descriptors = await properties(handle);
      const list = decodeCurrentPcbStringProducerCallbackScopeList(descriptors, scriptId, kind);
      assert.equal(list.lexicalReceiverVerified, false);
      assert.throws(() => decodeCurrentPcbStringProducerCallbackScopeList(descriptors, "foreign-script", kind), /CALLBACK_SCOPE/u);
      if (kind === "buffer" || kind === "drain") {
        assert.ok(decodeCurrentPcbStringProducerCallbackScope(await properties(list.scopesId), kind));
      } else {
        assert.throws(() => decodeCurrentPcbStringProducerCallbackScope({}, kind), /LEXICAL_THIS_UNAVAILABLE/u);
        // Two instances have identical bodies/locations but different hidden this.
        // Moving the foreign arrow into PROJECT cannot be ruled out by these facts.
        const foreign = decodeCurrentPcbStringProducerCallbackFunction(await evaluate("foreign.callback"), kind);
        assert.notEqual(foreign, handle);
        const foreignList = decodeCurrentPcbStringProducerCallbackScopeList(await properties(foreign), scriptId, kind);
        assert.equal(foreignList.lexicalReceiverVerified, false);
        const visible = JSON.stringify(await properties(list.scopesId));
        assert.ok(!visible.includes("Closure (Lg)"));
      }
      const changed = { result: { type: "function", className: CURRENT_PCB_STRING_PRODUCER_CALLBACK_LOCATIONS[kind].async ? "AsyncFunction" : "Function",
        objectId: handle, description: `${SOURCES[kind]} ` } };
      assert.throws(() => decodeCurrentPcbStringProducerCallbackFunction(changed, kind), /CALLBACK_SCOPE/u);
      await session.post("Runtime.releaseObjectGroup", { objectGroup: "synthetic-callback-scopes" });
      await assert.rejects(properties(handle), /Could not find object/u);
    }
    assert.equal(paused, false);
  } finally { session.disconnect(); }
});

void test("callback metadata rejects getters, proxies and contradictory shape without invoking them", () => {
  let invocations = 0;
  const trap = (): never => { invocations += 1; throw new Error("TRAP"); };
  for (const input of [new Proxy({}, { ownKeys: trap }), Object.defineProperty({}, "result", { get: trap }),
    { result: [], internalProperties: [] }]) {
    assert.throws(() => decodeCurrentPcbStringProducerCallbackFunction(input, "structure"), /CALLBACK_SCOPE/u);
    assert.throws(() => decodeCurrentPcbStringProducerCallbackScopeList(input, "script", "structure"), /CALLBACK_SCOPE/u);
    assert.throws(() => decodeCurrentPcbStringProducerCallbackScope(input, "buffer"), /CALLBACK_SCOPE/u);
  }
  assert.equal(invocations, 0);
});

import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_STRING_PRODUCER_LOCATIONS, decodeCurrentPcb209WorkerProducerScopeList,
  decodeCurrentPcbStringProducerFunction, decodeCurrentPcbStringProducerScopeList,
  decodeCurrentPcbStringProducerScopes } from "../src/current-pcb-string-producer-scope.ts";
import type { CurrentPcbStringProducerKind } from "../src/current-pcb-string-producer-scope.ts";

/** Exact small returned-function excerpts from the pinned sources. Their factory
 * environments are synthetic and the functions are never invoked here. The
 * hashes test local source contracts, not an installed EasyEDA observation. */
import { currentPcbStringProducerSources as SOURCES } from "./helpers/current-pcb-string-producer-fixture.ts";

const FACTORIES = {
  move: ['globalThis.original=(function(){let o=null,t=[],e=null,r=null;return ', '})();'],
  serial: ['globalThis.original=(function Nd(e){let t=null,s=null,r;return ', '})(()=>{});'],
  debounce: ['globalThis.original=(function QA(e,t,s=!1){let r,i=null;return ', '})(()=>{},300);'],
  cooperation: ['globalThis.original=(function ZA(e,t){let s=new Array,r=null,i=null;return ', '})(()=>{},10);'],
  upload: ['globalThis.original=new(class{bufferedStream(t,s){let r=null,i=null,n=null,a=this;return ',
    ';function o(){}async function c(){return t}}})().bufferedStream(()=>{},500);'],
} as const;
function fixture(kind: CurrentPcbStringProducerKind): string {
  const profile = CURRENT_PCB_STRING_PRODUCER_LOCATIONS[kind], [before, after] = FACTORIES[kind];
  const column = profile.columnNumber - (profile.regular ? 8 : 0);
  return `${before}(${"\n".repeat(profile.lineNumber)}${" ".repeat(column)}${SOURCES[kind]})${after}`;
}

void test("five pinned producer wrappers expose their fixed original V8 scopes without invocation or pause", async () => {
  const session = new Session(); session.connect();
  let contextId = 0, paused = false, scriptId = "";
  session.on("Debugger.paused", (): void => { paused = true; });
  session.on("Debugger.scriptParsed", ({ params }): void => { if (params.url === "producer-scope.js") { scriptId = params.scriptId; } });
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "producer-scope") { contextId = params.context.id; }
  });
  const properties = (objectId: string): Promise<unknown> => session.post("Runtime.getProperties",
    { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const kind of ["move", "serial", "debounce", "cooperation", "upload"] as const) {
      const context = createContext({}, { name: "producer-scope" });
      runInContext(fixture(kind), context, { filename: "producer-scope.js", timeout: 1000 });
      const reply = await (session.post("Runtime.evaluate", { expression: "original", contextId, returnByValue: false,
        objectGroup: "synthetic-producer-scopes", throwOnSideEffect: true, silent: true }) as Promise<unknown>);
      const handle = decodeCurrentPcbStringProducerFunction(reply, kind);
      const descriptors = await properties(handle);
      if (kind === "serial") {
        const originalScript = scriptId, zero = JSON.stringify(descriptors).replace('"value":0', '"value":-0');
        assert.throws(() => decodeCurrentPcbStringProducerScopeList(JSON.parse(zero) as unknown, originalScript, kind), /PRODUCER_SCOPE/u);
      }
      const list = decodeCurrentPcbStringProducerScopeList(descriptors, scriptId, kind);
      if (kind === "debounce") {
        const descriptor = z.looseObject({ name: z.string() }), originalScript = scriptId;
        const modern = z.looseObject({ result: z.array(descriptor) }).parse(descriptors);
        assert.equal(modern.result.length, 5);
        modern.result = modern.result.filter(item => item.name !== "arguments" && item.name !== "caller");
        assert.equal(modern.result.length, 3);
        assert.equal(decodeCurrentPcb209WorkerProducerScopeList(modern, originalScript, "debounce"), list);
        assert.throws(() => decodeCurrentPcb209WorkerProducerScopeList(descriptors, originalScript, "debounce"), /PRODUCER_SCOPE/u);
        assert.throws(() => decodeCurrentPcbStringProducerScopeList(modern, originalScript, "debounce"), /PRODUCER_SCOPE/u);
      }
      const scopes = decodeCurrentPcbStringProducerScopes(await properties(list), kind);
      assert.equal(scopes.length, kind === "debounce" ? 2 : 1);
      assert.throws(() => decodeCurrentPcbStringProducerScopeList(descriptors, "foreign-script", kind), /PRODUCER_SCOPE/u);
      assert.throws(() => decodeCurrentPcbStringProducerFunction(reply, kind === "move" ? "serial" : "move"), /PRODUCER_SCOPE/u);
      const mutated = { result: { type: "function", className: "Function", objectId: handle, description: `${SOURCES[kind]} ` } };
      assert.throws(() => decodeCurrentPcbStringProducerFunction(mutated, kind), /PRODUCER_SCOPE/u);
      await session.post("Runtime.releaseObjectGroup", { objectGroup: "synthetic-producer-scopes" });
      for (const value of [handle, list, ...scopes]) { await assert.rejects(properties(value), /Could not find object/u); }
    }
    assert.equal(paused, false);
  } finally { session.disconnect(); }
});

void test("scope decoders reject malicious descriptors before touching them", () => {
  let invoked = 0;
  const bad = (): never => { invoked += 1; throw new Error("SIDE_EFFECT"); };
  for (const input of [new Proxy({}, { ownKeys: bad }), Object.defineProperty({}, "result", { get: bad }),
    { result: [], internalProperties: [] }, { result: [{ name: "0", value: null }] }]) {
    assert.throws(() => decodeCurrentPcbStringProducerFunction(input, "move"), /PRODUCER_SCOPE/u);
    assert.throws(() => decodeCurrentPcbStringProducerScopeList(input, "original-script", "move"), /PRODUCER_SCOPE/u);
    assert.throws(() => decodeCurrentPcbStringProducerScopes(input, "debounce"), /PRODUCER_SCOPE/u);
  }
  assert.equal(invoked, 0);
});

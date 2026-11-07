/** Actual uninvoked declarations exercise V8 metadata without running an
 * action, event, iterator, queue, stack formatter or disposable callback. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { decodeCurrentSchematicRelevancePrefixFunction, requireCurrentSchematicRelevancePrefixDescription } from "../src/current-schematic-relevance-action-prefix-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_PREFIX_SOURCE as SOURCE } from "../src/current-schematic-relevance-action-prefix-source.ts";

const cases = [
  {
    "variant": 0,
    "role": "asyncHelper",
    "text": "function bO(i,{success:e=Cr,failure:t=Cr}=qt){try{let r=i();return ZH(r)?r.then(n=>(e(n),n),t):(e(r),r)}catch(r){t(r)}}"
  },
  {
    "variant": 0,
    "role": "trace",
    "text": "function fre(){return(new Error().stack||\"\").split(`\n`).slice(1).map(qm)}"
  },
  {
    "variant": 0,
    "role": "disposableFactory",
    "text": "function tn(i){let e={dispose(){dE(e),i()}};return e}"
  },
  {
    "variant": 0,
    "role": "eventQueueConstructor",
    "text": "class{constructor(){this.index=-1;this.end=0}enqueue(e,t,r){this.index=0,this.end=r,this.current=e,this.args=t}dispose(){this.index=this.end,this.current=void 0,this.args=void 0}}"
  },
  {
    "variant": 0,
    "role": "containerIterator",
    "text": "*[Symbol.iterator](){for(let[e,t]of this._idMap){let r=t.deref();r?yield r:this._idMap.delete(e)}}"
  },
  {
    "variant": 1,
    "role": "asyncHelper",
    "text": "function PO(i,{success:e=Cr,failure:t=Cr}=qt){try{let r=i();return oz(r)?r.then(n=>(e(n),n),t):(e(r),r)}catch(r){t(r)}}"
  },
  {
    "variant": 1,
    "role": "trace",
    "text": "function Rae(){return(new Error().stack||\"\").split(`\n`).slice(1).map(sm)}"
  },
  {
    "variant": 1,
    "role": "disposableFactory",
    "text": "function rn(i){let e={dispose(){qM(e),i()}};return e}"
  },
  {
    "variant": 1,
    "role": "eventQueueConstructor",
    "text": "class{constructor(){this.index=-1;this.end=0}enqueue(e,t,r){this.index=0,this.end=r,this.current=e,this.args=t}dispose(){this.index=this.end,this.current=void 0,this.args=void 0}}"
  },
  {
    "variant": 1,
    "role": "containerIterator",
    "text": "*[Symbol.iterator](){for(let[e,t]of this._idMap){let r=t.deref();r?yield r:this._idMap.delete(e)}}"
  }
] as const;
void test("exact source-specific prefix declarations qualify native metadata and refuse foreign scripts or missing sloppy fields", async () => {
  assert.equal(process.versions.node, "24.18.0"); const session = new Session(); session.connect(); await session.post("Debugger.enable");
  const key = "__inertOwn7Prefix";
  try {
    for (const row of cases) {
      const context = createContext({}), profile = SOURCE[row.variant].roles[row.role]; let delta: number, prefix: string, suffix: string;
      if (profile.kind === "class") { prefix = `var ${  profile.name  }=`; suffix = `;${  profile.name}`; delta = row.text.indexOf("constructor") + "constructor".length; }
      else if (profile.generator) { prefix = "(class{"; suffix = "})"; delta = row.text.indexOf("("); }
      else { prefix = "("; suffix = ")"; delta = row.text.indexOf("("); }
      const source = "\n".repeat(profile.lineNumber) + " ".repeat(profile.columnNumber - prefix.length - delta) + prefix + row.text + suffix;
      const declared: unknown = runInContext(source, context); let fn: unknown = declared;
      if (profile.generator) { assert.ok(typeof declared === "function"); const parent: unknown = Reflect.get(declared, "prototype"); assert.ok(parent !== null && typeof parent === "object"); fn = Object.getOwnPropertyDescriptor(parent, Symbol.iterator)?.value; }
      Object.defineProperty(globalThis, key, { value: fn, configurable: true });
      const result = await session.post("Runtime.evaluate", { expression: `globalThis.${  key}`, objectGroup: "inert-own7-prefix" }); assert.ok(result.result.objectId !== undefined);
      requireCurrentSchematicRelevancePrefixDescription(result.result.description ?? "", row.variant, row.role);
      const metadata = await session.post("Runtime.getProperties", { objectId: result.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const location: unknown = metadata.internalProperties?.find(field => field.name === "[[FunctionLocation]]")?.value?.value; assert.ok(location !== null && typeof location === "object"); const script: unknown = Reflect.get(location, "scriptId"); assert.ok(typeof script === "string");
      try { decodeCurrentSchematicRelevancePrefixFunction(metadata, row.variant, row.role, script); } catch (error) { throw new Error(`${String(row.variant)}:${row.role}:${JSON.stringify(metadata.internalProperties)}`, { cause: error }); }
      assert.throws(() => decodeCurrentSchematicRelevancePrefixFunction(metadata, row.variant, row.role, "foreign"));
      if (profile.kind === "regular" && !profile.strict) { assert.equal(metadata.result.filter(field => field.name === "arguments" || field.name === "caller").length, 2); assert.throws(() => decodeCurrentSchematicRelevancePrefixFunction({ ...metadata, result: metadata.result.filter(field => field.name !== "caller") }, row.variant, row.role, script)); }
      Reflect.deleteProperty(globalThis, key);
    }
  } finally { Reflect.deleteProperty(globalThis, key); await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-own7-prefix" }); session.disconnect(); }
});

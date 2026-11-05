/** Real Node24 inspector forms with inert source. The module copy substitutes
 * only its fixed data import, never exports a caller-selected profile route.
 * This establishes inspector behavior, not an installed application admission.
 */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES } from "../src/current-pcb-209-spatial-source-profile.ts";
import { CURRENT_PCB_SPATIAL_FUNCTION_SOURCE_COUNT, CURRENT_PCB_SPATIAL_FUNCTION_SOURCE_REQUESTS,
  decodeCurrentPcbSpatialFunctionSourceTuple } from "../src/current-pcb-spatial-function-source.ts";

interface FixtureProfile {
  readonly key: string;
  readonly kind: "class" | "method" | "getter" | "function" | "arrow";
  readonly className: "Function" | "AsyncFunction" | "GeneratorFunction" | "AsyncGeneratorFunction";
  readonly sourceStart: number;
  readonly sourceEnd: number;
  readonly sourceBytes: number;
  readonly sourceSha256: string;
  readonly lineNumber: number;
  readonly columnNumber: number;
  readonly name: string;
  readonly parameterCount: number;
}
interface Decoders {
  readonly decodeCurrentPcbSpatialFunctionSourceArray: (input: unknown) => string;
  readonly decodeCurrentPcbSpatialFunctionSourceTuple: (input: unknown) => readonly Readonly<{ key: string; objectId: string }>[];
  readonly decodeCurrentPcbSpatialFunctionSourceMetadata: (input: unknown, scriptId: string, key: string) => true;
}
function isDecoder(input: unknown): input is Decoders {
  return input !== null && typeof input === "object" && ["decodeCurrentPcbSpatialFunctionSourceArray",
    "decodeCurrentPcbSpatialFunctionSourceTuple", "decodeCurrentPcbSpatialFunctionSourceMetadata"]
    .every(name => typeof Object.getOwnPropertyDescriptor(input, name)?.value === "function");
}
async function decoder(selectedProfiles: readonly FixtureProfile[]): Promise<Decoders> {
  const original = await readFile(new URL("../src/current-pcb-spatial-function-source.ts", import.meta.url), "utf8");
  const anchor = 'import { CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES } from "./current-pcb-209-spatial-source-profile.ts";';
  assert.equal(original.split(anchor).length, 2);
  const replaced = original.replace(anchor, `const CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES = Object.freeze(${JSON.stringify(selectedProfiles)}.map(Object.freeze));`)
    .replace('from "./current-pcb-209-spatial-track-source-profile.ts"',
      `from ${JSON.stringify(new URL("../src/current-pcb-209-spatial-track-source-profile.ts", import.meta.url).href)}`)
    .replace('from "zod"', `from ${JSON.stringify(import.meta.resolve("zod"))}`);
  const code = `${stripTypeScriptTypes(replaced, { mode: "strip" })}\n//# sourceURL=pcb-spatial-function-source-test.mjs`;
  const loaded: unknown = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
  assert.ok(isDecoder(loaded)); return loaded;
}

const fixtureClass = 'class Fixture{static ready=true;static get untouched(){globalThis.getterCalls++;throw Error("getter-called");}static choose(a,b){return a+b;}method(a){return a;}get value(){return 2;}*items(){yield 1;}async *asyncItems(){yield 1;}}';
const derivedClass = 'class Derived extends Fixture{constructor(...args){super(...args)}}';
const sloppyFunction = 'function regularSloppy(a){return a}';
const strictFunction = 'function regularStrict(a){"use strict";return a}';
const fixtureSource = `(()=>{globalThis.toStringCalls=0;globalThis.getterCalls=0;Function.prototype.toString=function(){globalThis.toStringCalls++;throw Error("toString-called");};${fixtureClass}${derivedClass}${sloppyFunction}${strictFunction}
const arrow=(a)=>a,asyncArrow=async a=>a;
return {functions:Object.freeze([Fixture,Derived,Fixture.choose,Fixture.prototype.method,Object.getOwnPropertyDescriptor(Fixture.prototype,"value").get,regularSloppy,regularStrict,arrow,asyncArrow,Fixture.prototype.items,Fixture.prototype.asyncItems]),native:Array.prototype.push,bound:regularSloppy.bind(null),proxy:new Proxy(regularSloppy,{})};})()`;
const plans = [
  { key: "class", kind: "class", className: "Function", name: "Fixture", parameterCount: 0, source: fixtureClass, location: "class Fixture" },
  { key: "subclass", kind: "class", className: "Function", name: "Derived", parameterCount: 0, source: derivedClass, location: "(...args)" },
  { key: "static", kind: "method", className: "Function", name: "choose", parameterCount: 2, source: "choose(a,b){return a+b;}", location: "(a,b)" },
  { key: "method", kind: "method", className: "Function", name: "method", parameterCount: 1, source: "method(a){return a;}", location: "(a){return a;}" },
  { key: "getter", kind: "getter", className: "Function", name: "get value", parameterCount: 0, source: "get value(){return 2;}", location: "(){return 2;}" },
  { key: "sloppy", kind: "function", className: "Function", name: "regularSloppy", parameterCount: 1, source: sloppyFunction, location: "(a){return a}" },
  { key: "strict", kind: "function", className: "Function", name: "regularStrict", parameterCount: 1, source: strictFunction, location: '(a){"use strict"' },
  { key: "arrow", kind: "arrow", className: "Function", name: "arrow", parameterCount: 1, source: "(a)=>a", location: "(a)=>a" },
  { key: "async", kind: "arrow", className: "AsyncFunction", name: "asyncArrow", parameterCount: 1, source: "async a=>a", location: "async a=>a" },
  { key: "generator", kind: "method", className: "GeneratorFunction", name: "items", parameterCount: 0, source: "*items(){yield 1;}", location: "(){yield 1;}" },
  { key: "async-generator", kind: "method", className: "AsyncGeneratorFunction", name: "asyncItems", parameterCount: 0, source: "async *asyncItems(){yield 1;}", location: "(){yield 1;}" },
] as const;

function profiles(): readonly FixtureProfile[] {
  return plans.map(plan => {
    const start = fixtureSource.indexOf(plan.source); assert.notEqual(start, -1);
    const offset = fixtureSource.indexOf(plan.location, start); assert.ok(offset >= start && offset < start + plan.source.length);
    const before = fixtureSource.slice(0, offset).split("\n");
    return { key: plan.key, kind: plan.kind, className: plan.className, sourceStart: start, sourceEnd: start + plan.source.length,
      sourceBytes: Buffer.byteLength(plan.source), sourceSha256: createHash("sha256").update(plan.source).digest("hex"),
      lineNumber: before.length - 1, columnNumber: before.at(-1)?.length ?? 0, name: plan.name, parameterCount: plan.parameterCount };
  });
}
function properties(session: Session, objectId: string): Promise<Runtime.GetPropertiesReturnType> {
  return session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
}
type Properties = Awaited<ReturnType<typeof properties>>;
function scriptOf(reply: Properties): string {
  const value: unknown = reply.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value;
  assert.ok(value !== null && typeof value === "object" && "scriptId" in value && typeof value.scriptId === "string");
  return value.scriptId;
}
function changed(reply: Properties, name: string): Properties["result"][number] {
  const item = reply.result.find(value => value.name === name); assert.ok(item !== undefined); return item;
}

void test("fixed production catalog alone determines tuple size and request cost", () => {
  assert.equal(CURRENT_PCB_SPATIAL_FUNCTION_SOURCE_COUNT, CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES.length);
  assert.equal(CURRENT_PCB_SPATIAL_FUNCTION_SOURCE_REQUESTS, CURRENT_PCB_209_SPATIAL_FUNCTION_PROFILES.length + 1);
  assert.throws(() => decodeCurrentPcbSpatialFunctionSourceTuple({ result: [], internalProperties: [] }), /PCB_SPATIAL_FUNCTION_SOURCE/u);
});

void test("actual Node24 function descriptions and locations qualify inert forms without calling overridden toString or getters", async context => {
  assert.equal(process.version, "v24.18.0");
  const fixtureProfiles = profiles();
  const checked = await decoder(fixtureProfiles);
  const realm = vm.createContext({});
  const world: unknown = vm.runInContext(fixtureSource, realm, { filename: "spatial-function-source-fixture.js" });
  const name = `__easyedaSpatialFunctionSource_${randomUUID().replaceAll("-", "")}`;
  const group = name;
  Object.defineProperty(globalThis, name, { value: world, configurable: true });
  const session = new Session(); session.connect();
  try {
    const array = await session.post("Runtime.evaluate", { expression: `globalThis.${name}.functions`, objectGroup: group, generatePreview: false });
    const arrayId = checked.decodeCurrentPcbSpatialFunctionSourceArray(array), tuple = await properties(session, arrayId);
    const references = checked.decodeCurrentPcbSpatialFunctionSourceTuple(tuple);
    const metadata = new Map<string, Properties>();
    assert.equal(references.length, fixtureProfiles.length);
    for (const reference of references) { metadata.set(reference.key, await properties(session, reference.objectId)); }
    const first = metadata.get("class"); assert.ok(first !== undefined); const scriptId = scriptOf(first);
    await context.test("class, inherited class, static/prototype methods, getters, ordinary functions and generator forms", () => {
      for (const reference of references) {
        assert.doesNotThrow(() => { assert.equal(checked.decodeCurrentPcbSpatialFunctionSourceMetadata(metadata.get(reference.key), scriptId, reference.key), true); }, reference.key);
      }
      const inherited = metadata.get("subclass"); assert.ok(inherited !== undefined);
      assert.equal(changed(inherited, "prototype").value?.className, "Fixture");
      const sloppy = metadata.get("sloppy"), strict = metadata.get("strict"); assert.ok(sloppy !== undefined && strict !== undefined);
      assert.equal(sloppy.result.length, 5); assert.equal(strict.result.length, 3);
      assert.deepEqual(vm.runInContext("[toStringCalls,getterCalls]", realm), vm.runInContext("[0,0]", realm));
    });
    await context.test("same description from another script cannot replace the original callee", async () => {
      const cloned = await session.post("Runtime.evaluate", { expression: `(${sloppyFunction})`, objectGroup: group, generatePreview: false });
      const entry = references.find(item => item.key === "sloppy"); assert.ok(entry !== undefined);
      const original = tuple.result.find(item => item.name === String(references.indexOf(entry))); assert.ok(original?.value !== undefined);
      assert.equal(cloned.result.description, original.value.description);
      assert.ok(cloned.result.objectId !== undefined);
      assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceMetadata(metadata.get("sloppy"), `${scriptId}-other`, "sloppy"), /PCB_SPATIAL_FUNCTION_SOURCE/u);
      const cloneMetadata = await properties(session, cloned.result.objectId);
      assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceMetadata(cloneMetadata, scriptId, "sloppy"), /PCB_SPATIAL_FUNCTION_SOURCE/u);
    });
    await context.test("native, bound and proxy forms cannot replace a script-qualified application function", async () => {
      for (const field of ["native", "bound", "proxy"]) {
        const value = await session.post("Runtime.evaluate", { expression: `globalThis.${name}.${field}`, objectGroup: group, generatePreview: false });
        assert.ok(value.result.objectId !== undefined);
        const reply = await properties(session, value.result.objectId);
        assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceMetadata(reply, scriptId, "sloppy"), /PCB_SPATIAL_FUNCTION_SOURCE/u);
      }
    });
    await context.test("full-source, descriptor and location drift withhold qualification", () => {
      const wrongSource = structuredClone(tuple); const remote = wrongSource.result[0]?.value; assert.ok(remote?.description !== undefined);
      remote.description += " ";
      assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceTuple(wrongSource), /PCB_SPATIAL_FUNCTION_SOURCE/u);
      const unfrozen = structuredClone(tuple); const field = unfrozen.result[0]; assert.ok(field !== undefined); field.writable = true;
      assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceTuple(unfrozen), /PCB_SPATIAL_FUNCTION_SOURCE/u);
      const wrongOwn = structuredClone(first); changed(wrongOwn, "length").writable = true;
      assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceMetadata(wrongOwn, scriptId, "class"), /PCB_SPATIAL_FUNCTION_SOURCE/u);
      const duplicate = structuredClone(first); duplicate.result.push(structuredClone(changed(duplicate, "length")));
      assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceMetadata(duplicate, scriptId, "class"), /PCB_SPATIAL_FUNCTION_SOURCE/u);
      const arbitraryClass = structuredClone(first); const accessor = arbitraryClass.result.find(item => item.name === "untouched"); assert.ok(accessor !== undefined);
      Object.defineProperty(accessor, "value", { value: {}, enumerable: true });
      assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceMetadata(arbitraryClass, scriptId, "class"), /PCB_SPATIAL_FUNCTION_SOURCE/u);
    });
    await context.test("hostile supplied objects and oversized replies never execute their accessors or proxy traps", () => {
      let calls = 0;
      const accessor = Object.defineProperty({}, "result", { enumerable: true, get() { calls += 1; return []; } });
      const proxy = new Proxy({}, { ownKeys(): string[] { calls += 1; return []; } });
      const oversized = { result: "x".repeat(262_145) };
      for (const input of [accessor, proxy, oversized, { result: Array.from({ length: 514 }, () => null) }]) {
        assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceTuple(input), /PCB_SPATIAL_FUNCTION_SOURCE/u);
        assert.throws(() => checked.decodeCurrentPcbSpatialFunctionSourceMetadata(input, scriptId, "class"), /PCB_SPATIAL_FUNCTION_SOURCE/u);
      }
      assert.equal(calls, 0);
    });
  } finally {
    try { assert.equal(Reflect.deleteProperty(globalThis, name), true); await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); }
    finally { session.disconnect(); }
  }
});

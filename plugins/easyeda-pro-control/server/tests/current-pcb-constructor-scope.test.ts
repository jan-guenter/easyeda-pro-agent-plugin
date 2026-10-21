import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS, CURRENT_PCB_CONSTRUCTOR_BUNDLES,
  CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS, CURRENT_PCB_CONSTRUCTOR_PROFILES, decodeCurrentPcbConstructorBundle,
  decodeCurrentPcbConstructorProperties, decodeCurrentPcbConstructorTuple } from "../src/current-pcb-constructor-scope.ts";
import type { CurrentPcbConstructorBundleKind, CurrentPcbConstructorName } from "../src/current-pcb-constructor-scope.ts";
import { pcbStringObservationFixture } from "./helpers/current-pcb-string-observation-fixture.ts";
import { CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING, currentPcbTeardropSources } from "./helpers/current-pcb-teardrop-fixture.ts";
import { currentPcbConstructorFailureDetail } from "../src/current-pcb-constructor-failure.ts";

function handleName(name: CurrentPcbConstructorName): string { return name.replace("$", "dollar"); }
function property(name: string, value: object, writable = false, configurable = true, enumerable = false): object {
  return { name, value, writable, configurable, enumerable, isOwn: true };
}
function metadata(name: CurrentPcbConstructorName): object {
  const expected = CURRENT_PCB_CONSTRUCTOR_PROFILES[name];
  return { result: [property("length", { type: "number", value: expected.parameterCount }), property("name", { type: "string", value: expected.name }),
    property("prototype", { type: "object", className: "Object", objectId: `prototype.${handleName(name)}` }, false, false),
    ...Object.entries(expected.staticFields).map(([key, value]) => property(key, { type: "number", value }, true, true, true))],
  internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: {
      scriptId: "original", lineNumber: expected.lineNumber, columnNumber: expected.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function.prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array",
      description: "Scopes[2]", objectId: "scopes" } },
  ] };
}
function tuple(kind: CurrentPcbConstructorBundleKind): object {
  const names = CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind];
  return { result: [
    ...names.map((name, index) => property(String(index), { type: "function", className: "Function", objectId: `ctor.${handleName(name)}` }, true, true, true)),
    property("length", { type: "number", value: names.length }, true, false),
  ], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array.prototype" } }] };
}

void test("fixed constructor bundles require every exact source location and descriptor without claiming lexical identity", () => {
  for (const kind of ["diagnostic", "precreate", "common"] as const) {
    const names = CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind];
    assert.equal(decodeCurrentPcbConstructorBundle({ result: { type: "object", subtype: "array", className: "Array",
      description: `Array(${names.length})`, objectId: "tuple" } }, kind), "tuple");
    assert.deepEqual(decodeCurrentPcbConstructorTuple(tuple(kind), kind), names.map(name => `ctor.${handleName(name)}`));
    for (const name of names) {
      const result = decodeCurrentPcbConstructorProperties(metadata(name), "original", name);
      assert.equal(result.prototypeId, `prototype.${handleName(name)}`); assert.equal(result.lexicalBindingVerified, false);
      assert.equal(result.executionAuthorized, false); assert.ok(Object.isFrozen(result));
      assert.throws(() => decodeCurrentPcbConstructorProperties(metadata(name), "foreign", name), /PCB_CONSTRUCTOR_SCOPE/u);
    }
  }
});

void test("constructor metadata rejects swapped names, locations, arity, duplicate fields and hostile envelopes", () => {
  const raw = JSON.stringify(metadata("kde"));
  for (const text of [
    raw.replace('"value":"kde"', '"value":"Sfe"'), raw.replace('"value":0', '"value":1'),
    raw.replace('"value":0', '"value":-0'), raw.replace('"columnNumber":318905', '"columnNumber":318906'),
    raw.replace('"lineNumber":4627', '"lineNumber":4628'),
    raw.replace('"writable":false', '"writable":true'), raw.replace('"name":"name"', '"name":"length"'),
    raw.replace('"name":"[[Scopes]]"', '"name":"[[Prototype]]"'),
    raw.replace('"objectId":"prototype.kde"', '"objectId":"prototype.kde","value":null'),
  ]) { assert.throws(() => decodeCurrentPcbConstructorProperties(JSON.parse(text) as unknown, "original", "kde"), /PCB_CONSTRUCTOR_SCOPE/u); }
  const tupleRaw = JSON.stringify(tuple("precreate"));
  for (const text of [
    tupleRaw.replace('"objectId":"ctor.Sfe"', '"objectId":"ctor.kde"'),
    tupleRaw.replace('"name":"1"', '"name":"0"'), tupleRaw.replace('"value":20', '"value":16'),
    tupleRaw.replace('"enumerable":true', '"enumerable":false'),
  ]) { assert.throws(() => decodeCurrentPcbConstructorTuple(JSON.parse(text) as unknown, "precreate"), /PCB_CONSTRUCTOR_SCOPE/u); }
  assert.throws(() => decodeCurrentPcbConstructorTuple(tuple("diagnostic"), "precreate"), /PCB_CONSTRUCTOR_SCOPE/u);
  let reads = 0;
  const accessor = Object.defineProperty({}, "result", { get(): never { reads += 1; throw new Error("GETTER"); } });
  const proxy = new Proxy({}, { ownKeys(): never { reads += 1; throw new Error("PROXY"); } });
  for (const input of [accessor, proxy, { result: [], exceptionDetails: {} }]) {
    assert.throws(() => decodeCurrentPcbConstructorTuple(input, "diagnostic"), /PCB_CONSTRUCTOR_SCOPE/u);
    assert.throws(() => decodeCurrentPcbConstructorProperties(input, "original", "kde"), /PCB_CONSTRUCTOR_SCOPE/u);
  }
  assert.equal(reads, 0);
  const named = JSON.stringify(metadata("$me"));
  for (const text of [named.replace('"value":"Sy"', '"value":"$me"'),
    named.replace('"value":0.8', '"value":0.9'), named.replace('"name":"MAX_QUEUE_SIZE"', '"name":"unknown"'),
    named.replace('"writable":true', '"writable":false')]) {
    assert.throws(() => decodeCurrentPcbConstructorProperties(JSON.parse(text) as unknown, "original", "$me"), /PCB_CONSTRUCTOR_SCOPE/u);
  }
  const wrongArity = JSON.stringify(metadata("Lpe")).replace('"value":1', '"value":0');
  assert.throws(() => decodeCurrentPcbConstructorProperties(JSON.parse(wrongArity) as unknown,
    "original", "Lpe"), /PCB_CONSTRUCTOR_SCOPE/u);
});

const ROOT_SYNTHETIC = CURRENT_PCB_CONSTRUCTOR_BUNDLES.diagnostic.slice(2).map(key => {
  const p = CURRENT_PCB_CONSTRUCTOR_PROFILES[key];
  return `var ${key}=class ${p.name}{constructor(${p.parameterCount === 1 ? "_parent" : ""}){}},${p.owner}=new ${key}();Object.assign(${key},${JSON.stringify(p.staticFields)});`;
}).join("\n");
const SYNTHETIC_SCOPE = `
(function(){
 var kde=class{constructor(){this.stack=null;}},Xe=new kde();
 var Sfe=class{constructor(){this.isMove=false;}${currentPcbTeardropSources.join("")}},Zec=new Sfe();
 var U5=class{constructor(){this.func=null;}};
 var Yde=class{constructor(){this.debounce=new U5();}},ze=new Yde();
 var mpe=class{constructor(){this.map=new Map();}},jo=new mpe();
 var HSe=class{constructor(){this.map=new Map();}},h_=new HSe();
 var USe=class{constructor(){this.map=new Map();}},aE=new USe();
 var Yme=class{constructor(){this.field=0;}},Me=new Yme();
 var Nfe=class{constructor(){this.field=0;}},ce=new Nfe();
 var Epe=class{constructor(){this.field=0;}},rt=new Epe();
 var GSe=class extends Object{},id=new GSe();
 ${ROOT_SYNTHETIC}
 const tearsOwner=Zec;${CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING}
 globalThis.syntheticHandler=()=>[Xe,jo,ze,h_,aE,Me,ce,rt,id,Si,$0,Pi,Sr,cm,nu,Us,Xo,dl,Yr,ru,Wn,Yh,Ft];
})();
`;

const inspectedProperty = z.object({ name: z.string(), value: z.object({ objectId: z.string().optional(), value: z.unknown().optional() }).loose().optional() }).loose();
const inspectedProperties = z.object({ result: z.array(inspectedProperty), internalProperties: z.array(inspectedProperty).optional() }).loose();
function inspectedHandle(input: unknown): string {
  return z.object({ result: z.object({ objectId: z.string() }).loose() }).loose().parse(input).result.objectId;
}
async function inspectProperties(session: Session, objectId: string): Promise<z.infer<typeof inspectedProperties>> {
  // Node's overloaded promise declarations otherwise select void here.
  const reply = await (session.post("Runtime.getProperties", { objectId, ownProperties: true }) as Promise<unknown>);
  return inspectedProperties.parse(reply);
}

void test("real synthetic V8 scopes omit singleton classes; fixed selectors recover only source-owned constructors without invocation", async () => {
  const session = new Session(); session.connect(); let contextId = 0;
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic") { contextId = params.context.id; }
  });
  try {
    await session.post("Runtime.enable");
    const context = pcbStringObservationFixture(false, SYNTHETIC_SCOPE);
    const handler = await (session.post("Runtime.evaluate", { expression: "syntheticHandler", contextId,
      returnByValue: false, throwOnSideEffect: true, silent: true, objectGroup: "synthetic-constructors" }) as Promise<unknown>);
    const functionProperties = await inspectProperties(session, inspectedHandle(handler));
    const scopesId = functionProperties.internalProperties?.find(item => item.name === "[[Scopes]]")?.value?.objectId;
    assert.ok(typeof scopesId === "string");
    const scopes = await inspectProperties(session, scopesId);
    const scopeId = scopes.result.find(item => item.name === "0")?.value?.objectId; assert.ok(typeof scopeId === "string");
    const scope = await inspectProperties(session, scopeId);
    const names = new Set(scope.result.map(item => item.name));
    for (const [name, expected] of Object.entries(CURRENT_PCB_CONSTRUCTOR_PROFILES)) {
      assert.ok(!names.has(name), name);
      assert.equal(names.has(expected.owner), name !== "Sfe", expected.owner);
    }
    assert.ok(names.has("U5"));
    const callback = await (session.post("Runtime.evaluate", { expression: 'MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback',
      contextId, returnByValue: false, throwOnSideEffect: true, silent: true, objectGroup: "synthetic-constructors" }) as Promise<unknown>);
    const callbackId = inspectedHandle(callback);
    const proofPending: Promise<unknown> = session.post("Runtime.evaluate", { expression: "teardropProof", contextId,
      returnByValue: false, throwOnSideEffect: true, silent: true, objectGroup: "synthetic-constructors" });
    const proofId = inspectedHandle(await proofPending);
    for (const kind of ["diagnostic", "precreate", "common"] as const) {
      const selected = await (session.post("Runtime.callFunctionOn", { objectId: scopeId,
        functionDeclaration: CURRENT_PCB_CONSTRUCTOR_BUNDLE_FUNCTIONS[kind],
        arguments: kind === "common" ? [{ objectId: callbackId }] : [{ objectId: callbackId }, { objectId: proofId }],
        returnByValue: false, throwOnSideEffect: true, silent: true, objectGroup: "synthetic-constructors" }) as Promise<unknown>);
      const tupleId = decodeCurrentPcbConstructorBundle(selected, kind);
      const properties = await inspectProperties(session, tupleId);
      const handles = decodeCurrentPcbConstructorTuple(properties, kind);
      assert.equal(handles.length, CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind].length);
      for (const [index, objectId] of handles.entries()) {
        const own = await inspectProperties(session, objectId);
        const className: unknown = own.result.find(item => item.name === "name")?.value?.value;
        const name = CURRENT_PCB_CONSTRUCTOR_BUNDLES[kind][index]; assert.ok(name !== undefined);
        assert.equal(className, CURRENT_PCB_CONSTRUCTOR_PROFILES[name].name);
        // Synthetic source locations must not be admitted as the pinned app.
        assert.throws(() => decodeCurrentPcbConstructorProperties(own, "original", name), /PCB_CONSTRUCTOR_SCOPE/u);
      }
    }
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: "synthetic-constructors" }); session.disconnect(); }
});

void test("constructor selector failures preserve only fixed profile and guard labels", () => {
  for (const kind of ["diagnostic", "precreate", "common"] as const) {
    const raw = JSON.stringify({ schema: "easyeda-pro-control.pcb-constructor-failure.v1", bundle: kind,
      profile: "Sfe", stage: "owner", reason: "own" });
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- assert.throws requires a synchronous error predicate.
    assert.throws(() => decodeCurrentPcbConstructorBundle({ result: { type: "string", value: raw } }, kind), (error: unknown) => {
      assert.deepEqual(currentPcbConstructorFailureDetail(error), JSON.parse(raw) as unknown); return true;
    });
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- assert.throws requires a synchronous error predicate.
    assert.throws(() => decodeCurrentPcbConstructorBundle({ result: { type: "string", value: raw.replace('"own"', '"private-value"') } }, kind), (error: unknown) => {
      assert.equal(currentPcbConstructorFailureDetail(error)?.stage, "decode");
      assert.ok(error instanceof Error); assert.doesNotMatch(error.message, /private-value/u); return true;
    });
    for (const reason of ["count", "instance", "target", "shadow"] as const) {
      const detail = { schema: "easyeda-pro-control.pcb-constructor-failure.v1", bundle: kind,
        profile: "Sfe", stage: "owner", reason };
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- assert.throws requires a synchronous error predicate.
      assert.throws(() => decodeCurrentPcbConstructorBundle({ result: { type: "string", value: JSON.stringify(detail) } }, kind), (error: unknown) => {
        assert.deepEqual(currentPcbConstructorFailureDetail(error), detail); return true;
      });
    }
  }
});

void test("leaf constructor association rejects missing tuples and owner/prototype substitutions even when names match", () => {
  const context = pcbStringObservationFixture(false, `
class kde{}class Sfe{}scope.object.Xe=new kde();scope.object.Zec=new Sfe();
globalThis.bundle=[kde,Sfe,...Array(14).fill(class{})];delete scope.object.kde;delete scope.object.Sfe;
`);
  const source = `function(constructors){const bad=()=>{throw new Error("REFUSED");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const object=o=>{if(o===null||typeof o!=="object")bad();return o;};const scope=this.object;
${CURRENT_PCB_CONSTRUCTOR_ASSOCIATION_PROGRAMS.diagnostic}
constructorInstance(own(scope,"Xe"),"kde");constructorInstance(own(scope,"Zec"),"Sfe");verifyConstructorAssociations();return true;}`;
  const call = `(${source}).call(scope,bundle)`;
  assert.equal(runInContext(call, context) as unknown, true);
  for (const change of [
    "bundle=undefined;", "bundle=[Sfe,kde];", "bundle=[kde,Sfe,kde];",
    "bundle[0]=class kde{};", "scope.object.Xe=new(class kde{})();",
    "Object.defineProperty(kde.prototype,'constructor',{value:class kde{}});",
  ]) {
    const changed = pcbStringObservationFixture(false, `class kde{}class Sfe{}scope.object.Xe=new kde();scope.object.Zec=new Sfe();globalThis.bundle=[kde,Sfe,...Array(14).fill(class{})];${change}`);
    assert.throws(() => runInContext(call, changed), /REFUSED/u, change);
  }
});

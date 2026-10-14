import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_IDENTITY_TYPE_METHOD, parseCurrentPcbIdentitiesRequest, queryCurrentPcbIdentities,
  validateCurrentPcbIdentitiesArguments, validateCurrentPcbIdentitiesResult } from "../src/current-pcb-identities.ts";
import type { CurrentPcbIdentitiesRequest } from "../src/current-pcb-identities.ts";
import { buildCurrentPcbIdentitiesProgram } from "../src/current-pcb-identities-program.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const selectedMethod = "eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId";
function inputFor(method = selectedMethod, args: Record<string, unknown> = {}): CurrentPcbIdentitiesRequest {
  return parseCurrentPcbIdentitiesRequest({ method, arguments: args, target });
}
const request = inputFor();
const defaults = { selected: ["selected-second", "selected-first"], Line: [{ globalIndex: "line-b" }, { globalIndex: "line-a" }],
  Arc: [{ globalIndex: "arc-a" }], Via: [{ globalIndex: "via-a" }],
  Component: [{ globalIndex: "component-b" }, { globalIndex: "component-a" }], Pad: [{ globalIndex: "pad-b" }, { globalIndex: "pad-a" }] };
interface Options { before?: string; beforeChild?: string; afterCall?: string; fastDeadline?: boolean; input?: CurrentPcbIdentitiesRequest; }
function environment(options: Options = {}): {
  run: () => Promise<unknown>; evaluateChild: (source: string) => unknown;
} {
  const input = options.input ?? request;
  const childContext = createContext({ checkCall: (topic: unknown, arg: unknown, timeout: unknown): void => {
    assert.equal(timeout, 0);
    if (topic === "getTabIdAndDocType" || topic === "pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds") { assert.equal(arg, undefined); }
    else {
      assert.ok(topic === "pcb/extensionAPI/track-getAll" || topic === "pcb/extensionAPI/arc-getAll" || topic === "pcb/extensionAPI/via-getAll" ||
        topic === "pcb/extensionAPI/component-getAll" || topic === "pcb/extensionAPI/pad-getAll");
      assert.ok(arg !== null && typeof arg === "object"); assert.deepEqual(Object.keys(arg), []);
    }
  } });
  runInContext(`globalThis.rows=${JSON.stringify(defaults)};globalThis.calls=0;globalThis.dataReads=0;globalThis.getterReads=0;
globalThis.identity={tabId:${JSON.stringify(input.target.tabId)},docType:3};
globalThis.topics={'pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds':'selected','pcb/extensionAPI/track-getAll':'Line','pcb/extensionAPI/arc-getAll':'Arc','pcb/extensionAPI/via-getAll':'Via','pcb/extensionAPI/component-getAll':'Component','pcb/extensionAPI/pad-getAll':'Pad'};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus)throw new Error('PRIVATE_RECEIVER');checkCall(topic,arg,timeout);calls++;await Promise.resolve();if(topic!=='getTabIdAndDocType')dataReads++;${options.afterCall ?? ""}return {message:topic==='getTabIdAndDocType'?identity:rows[topics[topic]],bridge:undefined,source:undefined};}}
globalThis.MSG_BUS_PCB={messageBus:new Bus()};${options.beforeChild ?? ""}`, childContext, { timeout: 1000 });
  const child: unknown = runInContext("globalThis", childContext);
  const context = createContext({ child, TextEncoder, setTimeout: options.fastDeadline === true
    ? (callback: () => void, delay: number): ReturnType<typeof setTimeout> => { assert.equal(delay, 10_000); return setTimeout(callback, 1); }
    : setTimeout, clearTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return [frame];}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.target=${JSON.stringify(input.target)};
globalThis.tab={tabId:target.tabId,data:{doctype:3,pid:target.projectUuid}};
globalThis.activeTab=target.tabId;
class Tabs {static getActiveTab(){return activeTab;}static getTabById(id){return id===tab.tabId?tab:null;}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false};
globalThis.UI={gVars,tabBar:Tabs};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.attributes={'c_dbid':target.tabId,'c_doctype':'3',src:'editor?entry=pcb','pcb-canvas':'true'};
globalThis.frame={tagName:'IFRAME',id:'frame_'+target.tabId,ownerDocument:document,isConnected:true,contentWindow:child,
classList:{contains(name){return name==='editframe';}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},
parentElement:{getAttribute(name){return name==='uuid'?target.tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;
${options.before ?? ""}`, context, { timeout: 1000 });
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentPcbIdentitiesProgram(input)}})()`, context, { timeout: 1000 }) as unknown),
    evaluateChild: (source: string): unknown => runInContext(source, childContext, { timeout: 1000 }) as unknown };
}

void test("current identity reader admits the target project fragment and rejects foreign or changing URLs", async () => {
  const before = "location.href+='id='+target.projectUuid+',tab=*'+target.tabId;document.URL=location.href;";
  const valid = environment({ before });
  validateCurrentPcbIdentitiesResult(request, decodeExactReadEnvelope(await valid.run()));
  assert.equal(valid.evaluateChild("calls"), 6);
  const foreign = environment({ before: "location.href+='id='+ 'f'.repeat(64);document.URL=location.href;" });
  await assert.rejects(foreign.run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
  assert.equal(foreign.evaluateChild("calls"), 0);
  const changed = environment({ before, afterCall: "parent.location.href='https://client/editor?cll=warn#id='+parent.target.projectUuid;parent.document.URL=parent.location.href;" });
  await assert.rejects(changed.run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
  assert.equal(changed.evaluateChild("calls"), 1);
});

void test("current PCB identities retain cross-realm receiver, full ordered IDs and positive three-family type evidence", async () => {
  for (const [method, expected] of [[selectedMethod, defaults.selected], ["eda.pcb_PrimitiveLine.getAllPrimitiveId", ["line-b", "line-a"]],
    ["eda.pcb_PrimitiveArc.getAllPrimitiveId", ["arc-a"]], ["eda.pcb_PrimitiveVia.getAllPrimitiveId", ["via-a"]],
    ["eda.pcb_PrimitiveComponent.getAllPrimitiveId", ["component-b", "component-a"]], ["eda.pcb_PrimitivePad.getAllPrimitiveId", ["pad-b", "pad-a"]]] as const) {
    const input = inputFor(method);
    const fixture = environment({ input, beforeChild: "for(const row of rows.Line)Object.defineProperty(row,'geometry',{get(){getterReads++;throw new Error('PRIVATE_GEOMETRY');}});" });
    const result = validateCurrentPcbIdentitiesResult(input, decodeExactReadEnvelope(await fixture.run()));
    assert.deepEqual(result["value"], expected); assert.equal(result["observedIdentityCount"], expected.length);
    assert.equal(result["familyObservations"], undefined); assert.equal(fixture.evaluateChild("getterReads"), 0);
    assert.equal(fixture.evaluateChild("calls"), 6); assert.equal(fixture.evaluateChild("dataReads"), 2);
    assert.equal(result["implementationKind"], "native-task-equivalent");
    for (const field of ["cadAuthority", "persistenceVerified", "sourceMembershipVerified"]) { assert.equal(result[field], false); }
  }
  for (const [id, type] of [["line-a", "Line"], ["arc-a", "Arc"], ["via-a", "Via"]]) {
    const input = inputFor(CURRENT_PCB_IDENTITY_TYPE_METHOD, { id });
    const fixture = environment({ input });
    const result = validateCurrentPcbIdentitiesResult(input, decodeExactReadEnvelope(await fixture.run()));
    assert.equal(result["value"], type); assert.equal(result["observedIdentityCount"], 4);
    assert.deepEqual(result["familyObservations"], [{ family: "Line", ids: ["line-b", "line-a"] }, { family: "Arc", ids: ["arc-a"] }, { family: "Via", ids: ["via-a"] }]);
    assert.equal(fixture.evaluateChild("calls"), 10); assert.equal(fixture.evaluateChild("dataReads"), 6);
  }
});

void test("current PCB identity schemas and discovery reject filters, unknown methods and incomplete target identity", async () => {
  assert.deepEqual(parseCurrentPcbIdentitiesRequest(request), request);
  assert.equal(validateCurrentPcbIdentitiesArguments(request)["valid"], true);
  for (const invalid of [{ ...request, code: "private()" }, { ...request, arguments: { net: "test" } },
    { ...request, method: "eda.pcb_Layer.getCurrentLayer" }, { ...request, target: { ...target, tabId: "wrong" } },
    { ...request, target: { ...target, branchUuid: "" } }, { ...request, method: CURRENT_PCB_IDENTITY_TYPE_METHOD },
    { ...request, method: CURRENT_PCB_IDENTITY_TYPE_METHOD, arguments: { id: "", extra: true } }]) {
    assert.throws(() => buildCurrentPcbIdentitiesProgram(invalid)); assert.equal(validateCurrentPcbIdentitiesArguments(invalid)["valid"], false);
  }
  const catalog = queryCurrentPcbIdentities({ includeSchemas: true });
  assert.equal(catalog["total"], 7); assert.equal(catalog["invocationEnabledByDiscovery"], false); assert.match(JSON.stringify(catalog), /inputSchema/u);
  assert.equal(queryCurrentPcbIdentities({ method: selectedMethod })["total"], 1);
  const otherTarget = { ...target, projectUuid: "d".repeat(32), documentUuid: "e".repeat(32), tabId: `${"e".repeat(32)}@${"d".repeat(32)}` };
  const input = parseCurrentPcbIdentitiesRequest({ ...request, target: otherTarget });
  const fixture = environment({ input });
  const raw: unknown = decodeExactReadEnvelope(await fixture.run());
  assert.deepEqual(validateCurrentPcbIdentitiesResult(input, raw)["target"], otherTarget);
});

void test("current PCB identities distinguish empty arrays from missing or unsupported type results and reject forged results", async () => {
  for (const method of [selectedMethod, "eda.pcb_PrimitiveLine.getAllPrimitiveId", "eda.pcb_PrimitiveArc.getAllPrimitiveId", "eda.pcb_PrimitiveVia.getAllPrimitiveId",
    "eda.pcb_PrimitiveComponent.getAllPrimitiveId", "eda.pcb_PrimitivePad.getAllPrimitiveId"]) {
    const input = inputFor(method);
    const fixture = environment({ input, beforeChild: "rows={selected:[],Line:[],Arc:[],Via:[],Component:[],Pad:[]};" });
    const raw: unknown = decodeExactReadEnvelope(await fixture.run());
    assert.deepEqual(validateCurrentPcbIdentitiesResult(input, raw)["value"], []);
  }
  const input = inputFor(CURRENT_PCB_IDENTITY_TYPE_METHOD, { id: "component-a" });
  const raw: unknown = decodeExactReadEnvelope(await environment({ input }).run());
  assert.throws(() => validateCurrentPcbIdentitiesResult(input, raw), /not in an observed supported family/u);
  const validInput = inputFor(CURRENT_PCB_IDENTITY_TYPE_METHOD, { id: "line-a" });
  const valid: unknown = decodeExactReadEnvelope(await environment({ input: validInput }).run());
  assert.ok(valid !== null && typeof valid === "object"); const payload = { ...valid };
  for (const invalid of [{ ...payload, target: { ...target, branchUuid: "f".repeat(32) } }, { ...payload, method: selectedMethod },
    { ...payload, cadAuthority: true }, { ...payload, extra: "PRIVATE" },
    { ...payload, observations: [{ family: "Line", ids: ["line-a", "line-a"] }, { family: "Arc", ids: [] }, { family: "Via", ids: [] }] },
    { ...payload, observations: [{ family: "Line", ids: ["line-a"] }, { family: "Arc", ids: ["line-a"] }, { family: "Via", ids: [] }] },
    { ...payload, observations: [{ family: "Component", ids: ["line-a"] }, { family: "Arc", ids: [] }, { family: "Via", ids: [] }] },
    { ...payload, observations: [{ family: "Via", ids: ["line-a"] }, { family: "Arc", ids: [] }, { family: "Line", ids: [] }] }]) {
    assert.throws(() => validateCurrentPcbIdentitiesResult(validInput, invalid));
  }
});

void test("current PCB identity sampling refuses changed native identity, retained owner and ordered IDs", async () => {
  for (const afterCall of ["parent.gVars.currentProject={...parent.gVars.currentProject};", "parent.activeTab='other';",
    "parent.tab={...parent.tab};", "parent.frame.contentWindow={};", "globalThis.document={...document};",
    "Bus.prototype.rpcCall=async()=>({message:[]});", "identity.docType=23;", "identity.tabId='other';",
    "if(dataReads===2)rows.selected.reverse();", "if(dataReads===2)rows.selected.push('changed');"]) {
    const fixture = environment({ afterCall });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
    assert.ok(Number(fixture.evaluateChild("calls")) <= 6);
  }
  for (const before of ["attributes.fromFile='true';", "attributes.c_doctype='4';", "gVars.isHistoryMode=true;",
    "tab.parentLibraryUuid='private';", "document.querySelectorAll=()=>[frame,frame];", "eda.extensionUuid='other';"]) {
    const fixture = environment({ before });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
    assert.equal(fixture.evaluateChild("calls"), 0);
  }
  const input = inputFor(CURRENT_PCB_IDENTITY_TYPE_METHOD, { id: "line-a" });
  for (const afterCall of ["if(dataReads===5)rows.Arc.push({globalIndex:'arc-b'});", "if(dataReads===4)rows.Line.reverse();"]) {
    await assert.rejects(environment({ input, afterCall }).run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
  }
});

void test("current PCB identities reject malformed, accessor, duplicate and oversized observations without reading geometry or leaking errors", async () => {
  for (const beforeChild of ["rows.selected=undefined;", "rows.selected={};", "delete rows.selected[0];",
    "rows.selected.push(rows.selected[0]);", "rows.selected[0]='';", "rows.selected[0]='x'.repeat(257);",
    "rows.selected=Array.from({length:257},(_,i)=>String(i));",
    "Object.defineProperty(rows.selected,'0',{get(){getterReads++;throw new Error('PRIVATE_GETTER');}});"]) {
    const fixture = environment({ beforeChild });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
    assert.equal(fixture.evaluateChild("getterReads"), 0);
  }
  const input = inputFor(CURRENT_PCB_IDENTITY_TYPE_METHOD, { id: "line-a" });
  for (const beforeChild of ["rows.Line[0]={};", "rows.Line[0].globalIndex=1;", "rows.Line[0]=Object.create({globalIndex:'inherited'});",
    "rows.Line.push(rows.Line[0]);", "rows.Arc[0].globalIndex='line-a';", "rows.Via=Array(20001).fill({globalIndex:'too-many'});",
    "rows.Line=Array.from({length:2000},(_,i)=>({globalIndex:String(i)+'x'.repeat(240)}));",
    "Object.defineProperty(rows.Line[0],'globalIndex',{get(){getterReads++;throw new Error('PRIVATE_GETTER');}});"]) {
    const fixture = environment({ input, beforeChild });
    await assert.rejects(fixture.run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
    assert.equal(fixture.evaluateChild("getterReads"), 0);
  }
  await assert.rejects(environment({ afterCall: "throw new Error('PRIVATE_VENDOR_ERROR');" }).run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
  const hung = environment({ afterCall: "return await new Promise(()=>{});", fastDeadline: true });
  await assert.rejects(hung.run(), { message: "CURRENT_PCB_IDENTITIES_READ_FAILED" });
  assert.equal(hung.evaluateChild("calls"), 1);
});

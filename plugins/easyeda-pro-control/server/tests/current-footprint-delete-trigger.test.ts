/** Actual pinned delete methods with inert local responders. No EasyEDA owner,
 * transport, intent issuer, process, backend or durable inverse is exercised. */
/* oxlint-disable import/max-dependencies -- This boundary composes the independent source-pinned entry producer, fixed wire/native table and actual inert vendor delete methods. */
import assert from "node:assert/strict";
import { decodeFixedNativeTable } from "./helpers/fixed-native-table.ts";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_PROGRAMS as PROGRAMS } from "../src/current-footprint-delete-trigger-programs.ts";
import { decodeCurrentFootprintDeleteTriggerAcknowledgment, decodeCurrentFootprintDeleteTriggerPreflight } from "../src/current-footprint-delete-trigger-protocol.ts";
import { currentFootprintDeleteTriggerNativeCases, currentFootprintDeleteTriggerNativeSource } from "../src/current-footprint-delete-trigger-native.ts";
import { currentFootprintDeleteTriggerWire } from "../src/current-footprint-delete-trigger-wire.ts";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_ENTRY_PRODUCER as ENTRY_PRODUCER } from "../src/current-footprint-delete-trigger-source.ts";
import { footprintDeleteEntryProducer } from "./helpers/footprint-delete-entry-producer.ts";
import { footprintDeleteFragments as fragments } from "./helpers/footprint-delete-fragments.ts";

const expectation = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), targetUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: 100 });
async function synthetic(mode: "normal" | "upload-false" | "missing" | "deleted" | "client-drift" | "ticket-drift" | "delete-getter" | "project-constructor-drift" | "bus-constructor-drift"): Promise<Record<string, unknown>> {
  const raw: unknown = await runInNewContext(`(async()=>{
const expected=${JSON.stringify(expectation)},mode=${JSON.stringify(mode)},steps=[],Ie='|\\n',self={PRO_EDITOR_VERSION:'3.2.209'};
${fragments.header}
${fragments.atom}
class Encoder{constructor(){this.doctype='FOOTPRINT';}${fragments.headMethod}${fragments.deleteEncoder}}
class Ke{constructor(){this.footprint=new Encoder;}}
const qe=async()=>{steps.push('clock');return 1800000000123;};
const be={FOOTPRINT:{ON_ADD:'add',ON_UPDATE:'update',ON_DELETE:'delete'}},De={META:'META',DELETE_DOC:'DELETE_DOC'};
class zy{}
class Vc extends zy{getMaxTicket(){return this.maxTicket;}setMaxTicket(n){this.maxTicket=n;}}
class ja extends Vc{constructor(){super();this.client=expected.client;this.maxTicket=100;}}
class Pi{constructor(p){this.projectManager=p;this.client=expected.client;this.user=undefined;}get maxTicket(){return this.projectManager.consistencyManager.getMaxTicket();}get newTicket(){let n=this.maxTicket+1;this.projectManager.consistencyManager.setMaxTicket(n);return n;}}
class ar extends Pi{isHas(s){return this.data[s]&&!this.data[s].isDelete;}}
class Tg extends ar{constructor(p){super(p);this.data={};}publishCanvas(){}verifyKey(s){if(typeof s!=='string')throw Error('key');}${footprintDeleteEntryProducer}${fragments.deleteString}${fragments.deleteData}}
class Mb{}class KP extends Mb{}class JP extends KP{}
class Gd{async uploadLocal(rows){steps.push('upload');return{success:mode!=='upload-false'};}}
class Lg extends Gd{constructor(){super();this.uuid=expected.projectUuid;this._branchUuid=expected.branchUuid;this.workerBus=new JP;this.consistencyManager=new ja;this.footprint=new Tg(this);}notifyWatcher(){}}
const p=new Lg;globalThis.PROJECT=p;const bus=p.workerBus,manager=p.footprint,consistency=p.consistencyManager,constructors=[Tg,ar,Pi,ja,Vc,zy,Lg,Gd,JP,KP,Mb];
manager.onDataChange(expected.targetUuid,null,JSON.stringify({title:'copied',description:'',tags:[],source:''}),De.META,expected.client,100,null,null,null,true);
const methods=(${PROGRAMS.capture.program}).call(p,bus,manager,consistency,constructors);
if(mode==='missing')delete manager.data[expected.targetUuid];if(mode==='deleted')manager.data[expected.targetUuid].isDelete=true;
if(mode==='client-drift')manager.client='e'.repeat(16);
if(mode==='project-constructor-drift')Object.setPrototypeOf(p,(class Lg extends Gd{}).prototype);
if(mode==='bus-constructor-drift')Object.setPrototypeOf(bus,(class JP extends KP{}).prototype);
if(mode==='delete-getter')Object.defineProperty(manager.data[expected.targetUuid],'isDelete',{get(){steps.push('getter');return false;}});
let preflight=null,ack=null,error=null;
try{preflight=(${PROGRAMS.preflight.program}).call(p,bus,manager,consistency,constructors,methods,expected);
if(mode==='ticket-drift')consistency.maxTicket++;
ack=await (${PROGRAMS.invoke.program}).call(p,bus,manager,consistency,constructors,methods,expected);}catch(e){error=e.message;}
return JSON.stringify({preflight,ack,error,steps,maximumTicket:consistency.maxTicket});})()`, {}, { timeout: 1000 });
  assert.equal(typeof raw, "string");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Parse only this inert fixture's own JSON; individual fields are asserted below.
  return JSON.parse(String(raw)) as Record<string, unknown>;
}
const reply = (value: unknown): Readonly<{ result: { type: string; value: unknown } }> => ({ result: { type: "string", value } });

void test("fixed delete preflight does not invoke a manager method; native success never proves upload or SQL completion", async () => {
  assert.equal(Buffer.byteLength(footprintDeleteEntryProducer), ENTRY_PRODUCER.bytes);
  assert.equal(createHash("sha256").update(footprintDeleteEntryProducer).digest("hex"), ENTRY_PRODUCER.sha256);
  for (const mode of ["normal", "upload-false"] as const) {
    const result = await synthetic(mode); assert.equal(result["error"], null);
    const preflight = decodeCurrentFootprintDeleteTriggerPreflight(reply(result["preflight"]));
    assert.deepEqual(preflight, { ...expectation, ownLiveFootprintPresent: true, managerUserAbsent: true, dependencyEligibilityVerified: false, executionAuthorized: false });
    assert.deepEqual(result["steps"], ["clock", "upload"]); assert.equal(result["maximumTicket"], 101);
    assert.deepEqual(decodeCurrentFootprintDeleteTriggerAcknowledgment(reply(result["ack"])), { nativeReturnedSuccess: true,
      uploadCompletionVerified: false, nativeSqlCompletionVerified: false, savedAbsenceVerified: false, executionAuthorized: false });
  }
});

void test("missing/deleted targets, accessors and pre-invocation scalar drift refuse before the native clock or upload", async () => {
  for (const mode of ["missing", "deleted", "client-drift", "ticket-drift", "delete-getter", "project-constructor-drift", "bus-constructor-drift"] as const) {
    const result = await synthetic(mode); assert.equal(result["error"], "FOOTPRINT_DELETE_TRIGGER_BINDING");
    assert.deepEqual(result["steps"], []); assert.equal(result["ack"], null);
  }
});

void test("closed delete grammar rejects programs, changed side-effect flags, aliases and authority claims", () => {
  for (const command of currentFootprintDeleteTriggerNativeCases()) {
    const wire = currentFootprintDeleteTriggerWire(command, 73);
    assert.equal(wire.request["role"], command.role); assert.equal(wire.request["sessionId"], undefined);
    assert.equal(wire.request["functionDeclaration"], undefined); assert.equal(wire.command.id, 73);
    for (const change of [{ executionAuthorized: true }, { role: "delete" }, { method: "Runtime.evaluate" }]) {
      assert.throws(() => currentFootprintDeleteTriggerWire({ ...command, ...change }, 73));
    }
    for (const change of [{ functionDeclaration: "function(){}" }, { throwOnSideEffect: !command.params.throwOnSideEffect }, { awaitPromise: !command.params.awaitPromise }]) {
      assert.throws(() => currentFootprintDeleteTriggerWire({ ...command, params: { ...command.params, ...change } }, 73));
    }
    for (const id of [0, -0, -1, 1.5, Number.NaN, 2_147_483_648]) { assert.throws(() => currentFootprintDeleteTriggerWire(command, id)); }
  }
  assert.match(currentFootprintDeleteTriggerNativeSource(), /class EasyedaFootprintDeleteTriggerProtocol/u);
  assert.throws(() => decodeCurrentFootprintDeleteTriggerAcknowledgment(reply('{"success":true,"savedAbsenceVerified":true}')));
  assert.throws(() => decodeCurrentFootprintDeleteTriggerAcknowledgment(reply('{"success":false}')));
});

void test("native templates reconstruct every exact command through flat scalars without a caller session or program", async () => {
  const source = currentFootprintDeleteTriggerNativeSource();
  const { rows } = await decodeFixedNativeTable(source, 3, 3);
  const cases = currentFootprintDeleteTriggerNativeCases(); assert.equal(rows.length, cases.length);
  for (const [index, command] of cases.entries()) {
    const wire = currentFootprintDeleteTriggerWire(command, 73);
    const row = rows[index]?.split("\t"); assert.ok(row !== undefined && row.length === 3);
    const [role, names, template] = row; assert.ok(names !== undefined && template !== undefined); assert.equal(role, command.role);
    assert.deepEqual(names.split(","), Object.keys(wire.request).filter(name => !["action", "role", "requestId"].includes(name)));
    const restored: unknown = JSON.parse(template.replaceAll(/"__deletetrigger_([A-Za-z\d]+)__"/gu,
      (_whole, name: string): string => JSON.stringify(name === "sessionId" ? command.sessionId : wire.request[name])));
    assert.deepEqual(restored, { method: command.method, sessionId: command.sessionId, params: command.params });
  }
});

/* oxlint-disable import/max-dependencies -- Exercise disjoint fixed books, actual pinned bodies, inert Inspector transport and same-realm descriptor decoders together without replacing original native owner custody. */
/** Inert fixed-source behavior and strict books only. Original cold-owner
 * custody and actual source-location metadata remain separate Core proofs. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {gunzipSync} from "node:zlib";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { decodeCurrentFootprintCopyClockRpcV2Array as decodeArray, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as decodeArrayResult, currentFootprintCopyClockRpcV2ArrayObject as object } from "../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_PROGRAMS as P } from "../src/current-footprint-inverse-native-delete-cold-get-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_SOURCE as ROW } from "../src/current-footprint-inverse-public-row-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_FLAGS as FLAGS, currentFootprintInverseNativeDeleteColdGetCases as cases, currentFootprintInverseNativeDeleteColdGetNativeFrame as frame, currentFootprintInverseNativeDeleteColdGetTemplate as getTemplate, validateCurrentFootprintInverseNativeDeleteColdGetCommand as validate, currentFootprintInverseNativeDeleteColdGetWire as wire } from "../src/current-footprint-inverse-native-delete-cold-get-protocol.ts";
import { currentFootprintInverseNativeDeleteColdOwnDataCases as ownCases, currentFootprintInverseNativeDeleteColdOwnDataTemplate as ownTemplate, validateCurrentFootprintInverseNativeDeleteColdOwnDataCommand as ownValidate } from "../src/current-footprint-inverse-native-delete-cold-own-data-protocol.ts";
import { currentFootprintForwardWriterOwnDataCases as oldCases } from "../src/current-footprint-forward-writer-own-data-protocol.ts";

import {currentFootprintInverseNativeDeleteColdNativeSource as nativeSource} from "../src/current-footprint-inverse-native-delete-cold-native.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), targetUuid: "c".repeat(16), maximumTicket: 103 };
function fixture(): vm.Context {
  const context = vm.createContext({ P, ROW, payload: JSON.stringify(target) });
  const source = [
    'const target=JSON.parse(payload);',
    'let calls=0;const Ne=()=>{calls++;throw new Error("forbidden normalization")},Oe={FOOTPRINT:"FOOTPRINT"};',
    `const Model=class{${ROW.rowGet.source}${ROW.dataGet.source}};const fp=new Model();fp.data={};fp.data[target.targetUuid]={uuid:target.targetUuid,ticket:target.maximumTicket,isDelete:true};`,
    'const project={uuid:target.projectUuid,_branchUuid:target.branchUuid,footprint:fp};globalThis.PROJECT=project;',
    'const packet=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];',
    'const programs={};for(const role of Object.keys(P))programs[role]=Function("return ("+P[role]+")")();',
    'const selected=programs.project.call(packet,project)[0];const view=programs.footprint.call(packet,selected);',
    'const methods=programs.methods.call(packet,project,selected,view[0],view[1],target);',
    'const proof=programs.snapshot.call(packet,project,selected,view[0],view[1],methods,target);',
  ].join("\n");
  vm.runInContext(source, context); return context;
}
void test("actual fixed manager GET bodies retain the tombstone and return missing twice without formatting", () => {
  const context = fixture();
  for (let index = 0; index < 2; index += 1) {
    const value: unknown = vm.runInContext('programs.result.call(packet,proof,programs.read.call(packet,proof))', context);
    assert.equal(value, true);
  }
  assert.equal(vm.runInContext('programs.reprove.call(packet,proof)', context), true);
  assert.equal(vm.runInContext('calls', context), 0);
});
void test("same-shaped replacement, branch drift, live-row change and own getter shadow refuse before an application read", () => {
  for (const change of [
    'fp.data[target.targetUuid]={...fp.data[target.targetUuid]}',
    'project._branchUuid="d".repeat(32)',
    'fp.data[target.targetUuid].isDelete=false',
    'fp.get=()=>{calls++;return null}',
  ]) {
    const context = fixture(); vm.runInContext(change, context);
    assert.throws(() => { vm.runInContext('programs.read.call(packet,proof)', context); });
    assert.equal(vm.runInContext('calls', context), 0);
  }
});
void test("cold books reject foreign markers, target operands and physical IDs while preserving all fixed programs", () => {
  for (const command of cases()) {
    const wrapped = wire(command, 2_147_483_647, "original_session10");
    const bytes = Buffer.from(JSON.stringify(wrapped) + String.fromCodePoint(0));
    assert.equal(frame(bytes, command, "original_session10")["action"], "footprint-inverse-native-delete-cold-get");
    assert.throws(() => wire(command, 2_147_483_648, "original_session10"));
  }
  const methods = validate({ phase: "inverse-native-delete-cold-get-call", role: "methods", method: "Runtime.callFunctionOn",
    params: { ...FLAGS, objectId: "reflection10", functionDeclaration: P.methods, arguments: [
      { objectId: "project10" }, { objectId: "manager10" }, { objectId: "parent10" }, { objectId: "rows10" }, { value: target },
    ], returnByValue: false } });
  if (methods.method !== "Runtime.callFunctionOn") { assert.fail("fixed call shape"); }
  assert.throws(() => validate({ ...methods, params: { ...methods.params, arguments: [{ value: target }, ...methods.params.arguments.slice(1)] } }));
  assert.throws(() => validate({ ...methods, params: { ...methods.params, arguments: [...methods.params.arguments.slice(0, -1), { value: { ...target, targetUuid: `${target.targetUuid}\n` } }] } }));
  assert.throws(() => validate({ ...methods, params: { ...methods.params, functionDeclaration: "function(){return false}" } }));
  for (const command of ownCases()) { assert.doesNotThrow(() => ownValidate(command)); }
  for (const command of oldCases()) { assert.throws(() => ownValidate(command)); }
});


void test("inert Inspector executes both exact manager reads with throwOnSideEffect true", async () => {
  // This is a private Node fixture, never an admitted EasyEDA source/context.
  // Production original function-location and factory proofs remain separate.
  const session = new Session(); session.connect(); let ownedFixture: string | null = null;
  try {
    await session.post("Runtime.enable");
    const setup = [
      'if(Object.getOwnPropertyDescriptor(globalThis,"PROJECT")!==undefined||Object.getOwnPropertyDescriptor(globalThis,"__easyedaColdGetFixture")!==undefined)throw new Error("fixture namespace occupied");',
      'globalThis.__easyedaColdGetFixture=(()=>{',
      'const project={uuid:"a".repeat(64),_branchUuid:"b".repeat(32)};',
      `const Model=class{${ROW.rowGet.source}${ROW.dataGet.source}};`,
      'const fp=new Model();fp.data={};fp.data["c".repeat(16)]={uuid:"c".repeat(16),ticket:103,isDelete:true};project.footprint=fp;',
      'const fixture={project,packet:[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis]};',
      'globalThis.PROJECT=project;return fixture;})()',
    ].join("\n");
    const initialized = await session.post("Runtime.evaluate", { expression: setup, silent: true });
    assert.equal(initialized.exceptionDetails, undefined);
    assert.ok(initialized.result.objectId !== undefined); ownedFixture = initialized.result.objectId;
    const packet = await session.post("Runtime.evaluate", { expression: "__easyedaColdGetFixture.packet", silent: true });
    const project = await session.post("Runtime.evaluate", { expression: "__easyedaColdGetFixture.project", silent: true });
    assert.ok(packet.result.objectId !== undefined && project.result.objectId !== undefined);
    const reflection = packet.result.objectId; const originalProject = project.result.objectId;
    const call = async (role: keyof typeof P, references: readonly string[], withTarget = false): Promise<unknown> => {
      const command = validate({ phase: "inverse-native-delete-cold-get-call", role, method: "Runtime.callFunctionOn",
        params: { ...FLAGS, objectId: reflection, functionDeclaration: P[role], arguments: [
          ...references.map(objectId => ({ objectId })), ...(withTarget ? [{ value: target }] : []),
        ], returnByValue: role === "result" || role === "reprove" } });
      assert.equal(command.method, "Runtime.callFunctionOn");
      if (command.method !== "Runtime.callFunctionOn") { assert.fail("fixed call"); }
      const params: Runtime.CallFunctionOnParameterType & Readonly<{ throwOnSideEffect: true }> = { ...command.params,
        arguments: command.params.arguments.map(argument => "objectId" in argument ? { objectId: argument.objectId } : { value: argument.value }) };
      const raw = await session.post("Runtime.callFunctionOn", params);
      assert.equal(raw.exceptionDetails, undefined); return raw;
    };
    const tuple = async (raw: unknown, size: 1 | 2 | 3 | 5): Promise<Readonly<{ id: string; values: ReturnType<typeof decodeArray> }>> => {
      const id = decodeArrayResult(raw, size);
      const properties = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      return { id, values: decodeArray(properties, size) };
    };
    const projectView = await tuple(await call("project", [originalProject]), 1);
    const manager = object(projectView.values, 0);
    const view = await tuple(await call("footprint", [manager]), 2);
    const parent = object(view.values, 0), rows = object(view.values, 1);
    const methods = await tuple(await call("methods", [originalProject, manager, parent, rows], true), 3);
    const proof = await tuple(await call("snapshot", [originalProject, manager, parent, rows, methods.id], true), 5);
    for (let index = 0; index < 2; index += 1) {
      const read = await tuple(await call("read", [proof.id]), 2);
      const raw: unknown = await call("result", [proof.id, read.id]);
      assert.deepEqual(raw, { result: { type: "boolean", value: true } });
    }
    assert.deepEqual(await call("reprove", [proof.id]), { result: { type: "boolean", value: true } });
  } finally {
    try {
      if (ownedFixture !== null) {
        await session.post("Runtime.callFunctionOn", { objectId: ownedFixture,
          functionDeclaration: 'function(){const d=Object.getOwnPropertyDescriptor(globalThis,"__easyedaColdGetFixture");if(d&&Object.hasOwn(d,"value")&&d.value===this){const p=Object.getOwnPropertyDescriptor(globalThis,"PROJECT");if(p&&Object.hasOwn(p,"value")&&p.value===this.project)delete globalThis.PROJECT;delete globalThis.__easyedaColdGetFixture;}}', silent: true });
      }
    } finally { session.disconnect(); }
  }
});

void test("cold native book restores every bounded selector and exact program preimage", () => {
  const source = nativeSource();
  const tables = [...source.matchAll(/EasyedaDiagnosticFixedTable\.Load\("([A-Za-z\d+/=]+)",(\d+),"([a-f\d]{64})","([a-f\d]{64})",(\d+),(\d+)\)/gu)].map(match => {
    const [, encoded, rawBytes, rawSha, packedSha, rowCount, columns] = match;
    assert.ok(encoded !== undefined && rawBytes !== undefined && rawSha !== undefined && packedSha !== undefined && rowCount !== undefined && columns !== undefined);
    const packed = Buffer.from(encoded, "base64");
    assert.equal(createHash("sha256").update(packed).digest("hex"), packedSha);
    // oxlint-disable-next-line node/no-sync -- Restore only this fixed bounded build-time book in the inert fixture.
    const restored = gunzipSync(packed, { maxOutputLength: 60_000 });
    assert.equal(restored.length, Number(rawBytes)); assert.equal(createHash("sha256").update(restored).digest("hex"), rawSha);
    const rows = restored.toString("utf8").split("\0").map(row => row.split("\t"));
    assert.equal(rows.length, Number(rowCount)); assert.ok(rows.every(row => row.length === Number(columns))); return rows;
  });
  assert.equal(tables.length, 2);
  const programs = tables[1], selectors = tables[0];
  assert.ok(selectors !== undefined && programs !== undefined); assert.equal(selectors.length, 37); assert.equal(programs.length, 12);
  const actual = new Map(selectors.map(row => [row[0], row]));
  for (const command of ownCases()) {
    const row = ownTemplate(command), selected = actual.get(command.phase);
    assert.deepEqual(selected, [command.phase, command.method, row.names.join(","), row.template]);
  }
  for (const command of cases()) {
    const key = command.phase + ("role" in command ? ":" + command.role : "");
    const row = getTemplate(command);
    assert.deepEqual(actual.get(key), [key, command.method, row.names.join(","), row.template]);
  }
  assert.ok(source.includes('input is int||input is long'));
  assert.ok(source.includes('value>0&&value<=9007199254740991L'));
  assert.ok(source.includes('rawRole!=null&&!(rawRole is string)'));
});

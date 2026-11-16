/** A real source branch comparison with inert canvas/opening data. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_SOURCE as SOURCE, decodeCurrentSchematicWireAnnotationAbsenceFunction as qualify } from "../src/current-schematic-wire-annotation-absence-source.ts";
import { CurrentSchematicWireAnnotationAbsenceCursor } from "../src/current-schematic-wire-annotation-absence-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_REQUESTS as LIMIT, currentSchematicWireAnnotationAbsenceCases, currentSchematicWireAnnotationAbsenceTemplate, validateCurrentSchematicWireAnnotationAbsenceCommand as validate } from "../src/current-schematic-wire-annotation-absence-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_PROGRAMS as PROGRAMS } from "../src/current-schematic-wire-annotation-absence-programs.ts";
import { wireAnnotationAbsenceFixture } from "./helpers/current-schematic-wire-annotation-absence-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function obj(value: unknown): object { assert.ok(value !== null && typeof value === "object"); return value; }
async function post(session: Session, method: string, params: unknown): Promise<unknown> {
  const pending: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); const value: unknown = await pending;
  if (value !== null && typeof value === "object" && "exceptionDetails" in value) { throw new Error(JSON.stringify({ method, value })); } return value;
}
for (const variant of [0, 1] as const) {
  void test(`Wire annotation absence variant ${String(variant)} reads actual private flag and null manager without invoking the factory again`, { timeout: 20_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const session = new Session(); session.connect(); await session.post("Debugger.enable"); const url = `wireAnnotationAbsence${String(variant)}.js`; const key = `__wireAnnotationAbsence${String(variant)}`; let scriptId = ""; const helpers = new Set<string>(); const expected: string[] = [];
    session.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } else if (event.params.url === "" && Object.values(PROGRAMS).some(program => event.params.length === program.length + 2)) { helpers.add(event.params.scriptId); } });
    const graph = obj(runInThisContext(`${wireAnnotationAbsenceFixture(source, variant, false)}\n//# sourceURL=${url}`)); assert.ok(scriptId.length > 0); Object.defineProperty(globalThis, key, { value: graph, configurable: true }); context.after(() => { Reflect.deleteProperty(globalThis, key); session.disconnect(); });
    const refs = new Map<string, string>();
    for (const role of ["holder", "native", "factory", "openCanvas", "register"] as const) { const actual = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.${role}` }); assert.ok(actual.result.objectId !== undefined); refs.set(role, actual.result.objectId); if (role !== "holder" && role !== "native") { const packet = await session.post("Runtime.getProperties", { objectId: actual.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); qualify(packet, actual.result, variant, role, scriptId); } }
    const need = (role: string): string => { const id = refs.get(role); assert.ok(id !== undefined); return id; };
    const cursor = new CurrentSchematicWireAnnotationAbsenceCursor(need("holder"), need("native"), scriptId, variant); let reads = 0;
    for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); reads += 1; if (command.phase === "wire-annotation-absence-call") { expected.push(`(${command.params.functionDeclaration})`); } cursor.accept(command, await post(session, command.method, command.params)); }
    const data = cursor.requireCompleted(); assert.equal(data.capturedPrivateModeFalseCompared, true); assert.equal(data.originalPageAnnotationManagerNullCompared, true); assert.equal(data.annotationLifecycleComplete, false); assert.equal(data.observerRosterComplete, false); assert.equal(data.saveAuthorized, false); assert.equal(reads, 14); assert.equal(helpers.size, 6); assert.ok(reads <= LIMIT.normalMaximum); assert.ok(helpers.size <= LIMIT.helperSourcesMaximum); assert.equal(helpers.size, expected.length);
    const actual: string[] = []; for (const id of helpers) { const helper = await session.post("Debugger.getScriptSource", { scriptId: id }); actual.push(helper.scriptSource); } assert.deepEqual(actual.toSorted(), expected.toSorted());
    assert.deepEqual(Reflect.get(graph, "counts"), { globalPanel: 0, watch: 1, select: 1, canvas: 1, finish: 1 }); const page = obj(Reflect.get(graph, "page")); assert.equal(Reflect.get(page, "annotationManager"), null);
    context.diagnostic(JSON.stringify({ reads, helpers: helpers.size, total: reads + helpers.size + LIMIT.cleanup }));
  });
}
void test("Wire annotation absence refuses private mode, existing manager, own getter and changed original roots", { timeout: 20_000 }, async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const session = new Session(); session.connect(); await session.post("Debugger.enable"); context.after(() => { session.disconnect(); });
  for (const fault of ["private", "manager", "getter", "saved", "canvas"]) {
    const key = `__wireAnnotationNegative${fault}`; const url = `wireAnnotationNegative${fault}.js`; let scriptId = ""; const listener = (event: { params: { url: string; scriptId: string } }): void => { if (event.params.url === url) { scriptId = event.params.scriptId; } }; session.on("Debugger.scriptParsed", listener);
    const graph = obj(runInThisContext(`${wireAnnotationAbsenceFixture(source, 0, fault === "private")}\n//# sourceURL=${url}`)); const page = obj(Reflect.get(graph, "page")); let getterCalls = 0;
    if (fault === "manager") { Reflect.set(page, "annotationManager", {}); } else if (fault === "getter") { Object.defineProperty(page, "annotationManager", { configurable: true, get(): null { getterCalls += 1; return null; } }); } else if (fault === "saved") { Reflect.set(obj(Reflect.get(graph, "state")), "saveAttempted", true); } else if (fault === "canvas") { Reflect.set(page, "canvas", null); }
    Object.defineProperty(globalThis, key, { value: graph, configurable: true });
    try {
      const holder = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.holder` }); const native = await session.post("Runtime.evaluate", { expression: `globalThis.${key}.native` }); assert.ok(holder.result.objectId !== undefined && native.result.objectId !== undefined && scriptId.length > 0); const cursor = new CurrentSchematicWireAnnotationAbsenceCursor(holder.result.objectId, native.result.objectId, scriptId, 0);
      await assert.rejects(async () => { for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); try { cursor.accept(command, await post(session, command.method, command.params)); } catch (error) { cursor.fail(); throw error; } } cursor.requireCompleted(); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted()); assert.equal(getterCalls, 0);
    } finally { Reflect.deleteProperty(globalThis, key); session.off("Debugger.scriptParsed", listener); }
  }
});
void test("Wire annotation absence grammar permits only bounded supplied selectors and consumes malformed replies", () => {
  for (const command of currentSchematicWireAnnotationAbsenceCases()) { assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireAnnotationAbsenceTemplate(command).template.length > 0); assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } })); }
  assert.throws(() => validate({ phase: "wire-annotation-absence-resume", method: "Debugger.resume", params: {} }));
  const cursor = new CurrentSchematicWireAnnotationAbsenceCursor("holder", "native", "script", 0); const command = cursor.next(); assert.ok(command !== null); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command); assert.throws(() => { cursor.accept(command, { result: { type: "object", subtype: "proxy", objectId: "foreign" } }); }); assert.throws(() => cursor.next());
});

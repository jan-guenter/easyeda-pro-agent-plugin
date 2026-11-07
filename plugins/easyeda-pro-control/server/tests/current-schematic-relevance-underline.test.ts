/** Inert objects and fixed readonly CDP replies; no application/native owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CurrentSchematicRelevanceUnderlineCursor } from "../src/current-schematic-relevance-underline-cursor.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UNDERLINE_PROGRAM as PROGRAM } from "../src/current-schematic-relevance-underline-program.ts";

const object = (id: string): object => ({ type: "object", className: "Object", description: "Object", objectId: id });
const field = (name: string, value: object): object => ({ name, value, writable: true, configurable: true, enumerable: true, isOwn: true });
const data = (items: readonly object[]): object => ({ result: items, internalProperties: [{ name: "[[Prototype]]", value: object("parent") }] });
const tuple = (): object => ({ result: [field("0", object("namespace")), { name: "length", value: { type: "number", value: 1 }, writable: true, configurable: false, enumerable: false, isOwn: true }], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Array", description: "Array(0)", subtype: "array", objectId: "array-prototype" } }] });
function reply(cursor: CurrentSchematicRelevanceUnderlineCursor, value: unknown): void { const command = cursor.next(); assert.ok(command !== null); cursor.reserve(command); cursor.accept(command, value); }
function run(edit: string): unknown {
  return runInNewContext(`const native=[];native[0]=Object.getOwnPropertyDescriptor;native[2]=Object.getPrototypeOf;native[4]=Object.hasOwn;native[5]=Reflect.ownKeys;native[15]=Object.prototype;const map={x:true,fontSize:true};const namespace={isConstructFromShapeManager:false,isConstructFromDecompress:{},bboxAttributes:map};let calls=0;${edit};const result=Reflect.apply((${PROGRAM}),namespace,[native,map]);({result,calls});`);
}
void test("underline proof requires absence on the complete original plain prototype chain without calling getters", () => {
  assert.deepEqual(structuredClone(run("")), { result: true, calls: 0 });
  assert.throws(() => run('Object.defineProperty(Object.prototype,"underline",{get(){calls++;return true}})'), /SCH209_UNDERLINE_BBOX/u);
  assert.throws(() => run('Object.defineProperty(map,"underline",{get(){calls++;return true}})'), /SCH209_UNDERLINE_BBOX/u);
  assert.throws(() => run("map.underline=true"), /SCH209_UNDERLINE_BBOX/u);
});
void test("five correlated original replies are required before eligibility and cannot be replayed", () => {
  const cursor = new CurrentSchematicRelevanceUnderlineCursor("frame", "native", 0); assert.throws(() => { cursor.requireCompleted(); });
  reply(cursor, { result: { type: "object", subtype: "array", className: "Array", description: "Array(1)", objectId: "tuple" } });
  reply(cursor, tuple());
  const namespaceFields = [field("isConstructFromShapeManager", { type: "boolean", value: false }), field("isConstructFromDecompress", object("decompress")), field("bboxAttributes", object("map"))];
  reply(cursor, data(namespaceFields));
  const mapFields = [field("x", { type: "boolean", value: true }), field("fontSize", { type: "boolean", value: true })]; reply(cursor, data(mapFields));
  const command = cursor.next(); assert.ok(command !== null); cursor.reserve(command); cursor.accept(command, { result: { type: "boolean", value: true } }); cursor.requireCompleted(); assert.equal(cursor.next(), null);
  assert.throws(() => { cursor.accept(command, { result: { type: "boolean", value: true } }); });
});
void test("metadata refuses Proxy namespace, unknown namespace fields and own underline before the fixed proof", () => {
  for (const change of ["proxy", "extra", "underline"] as const) {
    const cursor = new CurrentSchematicRelevanceUnderlineCursor("frame", "native", 1);
    reply(cursor, { result: { type: "object", subtype: "array", className: "Array", description: "Array(1)", objectId: "tuple" } });
    if (change === "proxy") { const copied = structuredClone(tuple()); const fields: unknown = Reflect.get(copied, "result"); assert.ok(Array.isArray(fields)); const first: unknown = fields[0]; assert.ok(first !== null && typeof first === "object"); Reflect.set(first, "value", { type: "object", subtype: "proxy", className: "Object", objectId: "proxy" }); assert.throws(() => { reply(cursor, copied); }); }
    else {
    reply(cursor, tuple()); const fields = [field("isConstructFromShapeManager", { type: "boolean", value: false }), field("isConstructFromDecompress", object("decompress")), field("bboxAttributes", object("map"))];
    if (change === "extra") { fields.push(field("foreign", { type: "boolean", value: false })); assert.throws(() => { reply(cursor, data(fields)); }); }
    else { reply(cursor, data(fields)); assert.throws(() => { reply(cursor, data([field("underline", { type: "boolean", value: true })])); }); }
    }
    assert.throws(() => { cursor.next(); });
  }
});

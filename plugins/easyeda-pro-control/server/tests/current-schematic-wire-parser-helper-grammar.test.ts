import assert from "node:assert/strict";
import {test} from "node:test";
import {CurrentSchematicWireParserHelperCursor} from "../src/current-schematic-wire-parser-helper-cursor.ts";
import {currentSchematicWireParserHelperCases,currentSchematicWireParserHelperTemplate,validateCurrentSchematicWireParserHelperCommand as validate} from "../src/current-schematic-wire-parser-helper-protocol.ts";

void test("Wire parser helper grammar preserves consumed observations and admits no invocation",()=>{
 for(const command of currentSchematicWireParserHelperCases()){assert.deepEqual(validate(command),command);const fixed=currentSchematicWireParserHelperTemplate(command);let text=fixed.template;for(const [key,value] of Object.entries(fixed.values)){text=text.replaceAll(`__wireparser_${key}__`,value);}assert.deepEqual(JSON.parse(text),{method:command.method,params:command.params});assert.ok(Object.isFrozen(fixed.fields));assert.ok(Object.isFrozen(fixed.values));assert.throws(()=>validate({...command,params:{...command.params,callerCode:"no"}}));}
 assert.throws(()=>validate({phase:"wire-parser-resume",method:"Debugger.resume",params:{}}));
 const cursor=new CurrentSchematicWireParserHelperCursor({frame:"123.1.2",scriptId:"123",variant:0});
 const reserve:unknown=Reflect.get(cursor,"reserve");assert.ok(typeof reserve==="function");assert.throws(()=>Reflect.apply(reserve,cursor,[null]));const command=cursor.next();assert.ok(command!==null);assert.throws(()=>{ cursor.reserve(structuredClone(command)); });cursor.reserve(command);assert.throws(()=>{ cursor.accept(command,{}); });assert.throws(()=>cursor.next());assert.equal(cursor.retainedReplies().length,1);
});

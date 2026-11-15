import assert from "node:assert/strict";
import {test} from "node:test";
import {decodeCurrentSchematicWireParserPromise as decode} from "../src/current-schematic-wire-parser-promise.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_FRAMES as FRAMES} from "../src/current-schematic-wire-parser-programs.ts";
import {currentSchematicWireParserCases,currentSchematicWireParserTemplate,validateCurrentSchematicWireParserCommand as validate} from "../src/current-schematic-wire-parser-protocol.ts";

const result=(type:string,value:unknown):object=>({type,value});
function promise(value:object):object{return{result:[],internalProperties:[{name:"[[Prototype]]",value:{type:"object",className:"Promise",description:"Promise",objectId:"123.1.2"}},{name:"[[PromiseState]]",value:result("string","fulfilled")},{name:"[[PromiseResult]]",value}]};}
void test("Wire parser Promise/result and codebook boundaries remain closed",()=>{
 assert.equal(decode(promise({type:"undefined"}),"undefined"),null);assert.equal(decode(promise({type:"object",className:"Object",description:"Object",objectId:"123.2.3"}),"object"),"123.2.3");
 assert.throws(()=>decode(promise(result("boolean",false)),"undefined"));assert.throws(()=>decode(promise({type:"object",subtype:"proxy",className:"Object",objectId:"123.3.4"}),"object"));
 const own=promise({type:"undefined"});Reflect.set(own,"result",[{name:"unexpected",value:result("number",1),writable:true,enumerable:true,configurable:true,isOwn:true}]);assert.throws(()=>decode(own,"undefined"));
 assert.ok(Object.isFrozen(FRAMES));for(const frame of FRAMES){assert.ok(Object.isFrozen(frame));}
 for(const command of currentSchematicWireParserCases()){assert.deepEqual(validate(command),command);const fixed=currentSchematicWireParserTemplate(command);let text=fixed.template;for(const [key,value] of Object.entries(fixed.values)){text=text.replaceAll(`__wireparser_${key}__`,value);}assert.deepEqual(JSON.parse(text),{method:command.method,params:command.params});assert.ok(Object.isFrozen(fixed.fields));assert.ok(Object.isFrozen(fixed.values));assert.throws(()=>validate({...command,params:{...command.params,callerCode:"no"}}));}
 assert.throws(()=>validate({phase:"wire-parser-resume",method:"Debugger.resume",params:{}}));
});

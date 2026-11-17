/** Separate padding-only extension for the original setLines caller and its original default aliases. */
import assert from "node:assert/strict";
import {wireTransitionFixture} from "./current-schematic-wire-transition-fixture.ts";

export function wireSetterReturnFixture(source:string,variant:0|1):string{
 const text=wireTransitionFixture(source,variant,true,true);
 const anchor=text.indexOf(`const ${variant===0?"uc":"cc"}={bboxAttributes:{points:true}};`);
 const start=text.indexOf(" ".repeat(60),anchor);
 const insert="const qt=fixturePointValues[6],Cr=fixturePointValues[7];";
 assert.ok(anchor!==-1&&start>anchor&&/^ +$/u.test(text.slice(start,start+insert.length)));
 const result=text.slice(0,start)+insert+text.slice(start+insert.length);
 assert.equal(result.length,text.length);assert.equal(result.slice(0,start).split("\n").length,text.slice(0,start).split("\n").length);
 return result;
}

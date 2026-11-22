/** Original vendor dispatcher bodies at original PCs; app surroundings stay inert. */
import assert from "node:assert/strict";
import {CURRENT_SCHEMATIC_WIRE_TICK_BODY_SOURCE as SOURCE,qualifyCurrentSchematicWireTickBodySource} from "../../src/current-schematic-wire-tick-body-source.ts";
import {wireRunnerReturnFixture} from "./current-schematic-wire-runner-return-fixture.ts";

export {installWireOriginalRunner} from "./current-schematic-wire-runner-return-fixture.ts";
export function wireTickBodyFixture(source:string,variant:0|1):string{
 assert.equal(variant,0);qualifyCurrentSchematicWireTickBodySource({scriptSource:source});
 let result=wireRunnerReturnFixture(source,variant);const write=(start:number,end:number,text:string):void=>{assert.equal(text.length,end-start);assert.ok(/^[ \r\n]*$/u.test(result.slice(start,end)));result=result.slice(0,start)+text+result.slice(end);};
 const a=SOURCE.methods.dispatcherBase,b=SOURCE.methods.dispatcherClass;
 write(a.start-3,a.start,"DB=");write(a.start,a.end,source.slice(a.start,a.end));write(a.end,b.start,",Vt=");write(b.start,b.end,source.slice(b.start,b.end));
 const suffix=";refs.dispatcherClass=Vt;refs.dispatcherBase=DB;";write(b.end,b.end+suffix.length,suffix);
 const prefix="let DB,Vt;";const anchor=result.indexOf("const qt=fixturePointValues[6],Cr=fixturePointValues[7];");assert.ok(anchor>0);const start=result.indexOf(" ".repeat(prefix.length),anchor);assert.ok(start>anchor);write(start,start+prefix.length,prefix);
 assert.equal(result.length,source.length);return result;
}

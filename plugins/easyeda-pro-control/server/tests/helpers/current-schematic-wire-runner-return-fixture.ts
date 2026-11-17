/** Exact vendor runner methods and helpers at original PCs in inert app roots.
 * The original constructor is never invoked; native startup remains unproved. */
import assert from "node:assert/strict";
import {runInContext} from "node:vm";
import type {Context} from "node:vm";
import {GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as ACTION} from "../../src/generated-schematic-display-action-source.ts";
import {CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_SOURCE as SOURCE,qualifyCurrentSchematicWireRunnerReturnSource} from "../../src/current-schematic-wire-runner-return-source.ts";
import {wireSetterReturnFixture} from "./current-schematic-wire-setter-return-fixture.ts";

export function wireRunnerReturnFixture(source:string,variant:0|1):string{
 assert.equal(qualifyCurrentSchematicWireRunnerReturnSource({scriptSource:source}),variant);
 let result=wireSetterReturnFixture(source,variant);const baseline=result;const profile=SOURCE[variant];
 const write=(start:number,end:number,text:string,original=false):void=>{assert.equal(text.length,end-start);if(original){assert.equal(result.slice(start,end).replaceAll(/[^\r\n]/gu," "),result.slice(start,end));}else{assert.ok(/^ +$/u.test(result.slice(start,end)));}result=result.slice(0,start)+text+result.slice(end);};
 const before=(position:number,text:string):void=>{write(position-text.length,position,text);};
 const after=(position:number,text:string):void=>{write(position,position+text.length,text);};
 const cls=ACTION[variant].methods.runnerConstructor;before(cls.start,`${profile.aliases.class}=`);write(cls.start,cls.end,source.slice(cls.start,cls.end),true);after(cls.end,`;refs.runnerClass=${profile.aliases.class};`);
 for(const role of["helper","promiseType","promiseTag","stack","trim","history","nullish"]as const){const row=profile.methods[role];write(row.start,row.end,source.slice(row.start,row.end),true);if(role==="helper"||role==="promiseType"||role==="promiseTag"){after(row.end,`;refs.${role}=${profile.aliases[role]};`);}}
 const prefix=`let ${profile.aliases.class};const ${profile.aliases.base}=class{};const ${profile.aliases.tagAlias}=Object.prototype.toString;`;
 const anchor=result.indexOf("const qt=fixturePointValues[6],Cr=fixturePointValues[7];");assert.ok(anchor>0);const start=result.indexOf(" ".repeat(prefix.length),anchor);assert.ok(start>anchor);write(start,start+prefix.length,prefix);
 assert.equal(result.length,source.length);assert.equal(result.split("\n").length,baseline.split("\n").length);return result;
}

/** Mutate only this synthetic fixture's retained runner before capture. Every
 * run/useAction/currentAction method then comes from the exact vendor class. */
export function installWireOriginalRunner(context:Context):void{
 runInContext(String.raw`(()=>{const runner=fixtureRoots.shapes.actionRunner;for(const key of["run","running","currentAction"])if(!Reflect.deleteProperty(runner,key))throw Error("fixture old runner own field");Object.setPrototypeOf(runner,fixtureRefs.runnerClass.prototype);runner._currentAction=null;runner.shapeManagers=new Set;runner._historyResolversMap=new WeakMap;runner._autoCancelActionTimer={set(){throw Error("unmodeled timer allocation")},cancel(){throw Error("unmodeled timer cancellation")}};runner.consistencyResumePauseImpl={tryPause(){},tryResume(){throw Error("unmodeled consistency resume")}};runner._onWillRun={dispatch(){}};runner._onDidRun={dispatch(){throw Error("unmodeled didRun dispatch")}};globalThis.fixtureOriginalRunner=runner;})()`,context);
}

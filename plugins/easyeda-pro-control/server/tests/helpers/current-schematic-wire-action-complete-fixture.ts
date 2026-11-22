/** Exact original completion classes, empty rosters and genuine immediate resume.
 * Only this inert Inspector fixture allocates these roots; no live SDK grant. */
import assert from "node:assert/strict";
import {runInContext} from "node:vm";
import type {Context} from "node:vm";
import {CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_SOURCE as SOURCE,qualifyCurrentSchematicWireActionCompleteSource} from "../../src/current-schematic-wire-action-complete-source.ts";
import {wireTickBodyFixture} from "./current-schematic-wire-tick-body-fixture.ts";

export {installWireOriginalRunner} from "./current-schematic-wire-runner-return-fixture.ts";

export function wireActionCompleteFixture(source:string,variant:0|1):string{
 assert.equal(variant,0);qualifyCurrentSchematicWireActionCompleteSource({scriptSource:source});
 let result=wireTickBodyFixture(source,variant);
 const write=(start:number,end:number,text:string):void=>{assert.equal(text.length,end-start);assert.ok(/^[ \r\n]*$/u.test(result.slice(start,end)));result=result.slice(0,start)+text+result.slice(end);};
 const profile=SOURCE.methods;const debounce=profile.debounceFactory;
 const oldHelperSuffix=";refs.helper=bO;";assert.equal(result.slice(debounce.start,debounce.start+oldHelperSuffix.length),oldHelperSuffix);
 result=result.slice(0,debounce.start)+" ".repeat(oldHelperSuffix.length)+result.slice(debounce.start+oldHelperSuffix.length);
 write(debounce.start,debounce.end,source.slice(debounce.start,debounce.end));write(debounce.end,debounce.end+oldHelperSuffix.length,oldHelperSuffix);
 for(const[role,alias]of[["collectionClass","_O"],["timerClass","su"],["channelClass","gL"],["pausedChannelClass","CC"],["consistencyClass","nz"]]as const){const row=profile[role];write(row.start-alias.length-1,row.start,`${alias}=`);write(row.start,row.end,source.slice(row.start,row.end));write(row.end,row.end+1,";");}
 const prefix="let _O,su,gL,CC,nz;";const anchor=result.indexOf("const qt=fixturePointValues[6],Cr=fixturePointValues[7];");assert.ok(anchor>0);const start=result.indexOf(" ".repeat(prefix.length),anchor);assert.ok(start>anchor);write(start,start+prefix.length,prefix);
 const suffix="refs.completionClasses=[_O,su,gL,CC,nz];refs.completionDebounceFactory=Ta;";const saved=result.indexOf(" ".repeat(suffix.length),900_000);assert.ok(saved>=900_000);write(saved,saved+suffix.length,suffix);
 assert.equal(result.length,source.length);return result;
}

export function installWireOriginalCompletionRoots(context:Context):void{
 runInContext(String.raw`(()=>{const runner=fixtureOriginalRunner,[Collection,Timer,Channel,PausedChannel,Consistency]=fixtureRefs.completionClasses;runner.shapeManagers=new Collection;runner._historyResolversMap=new WeakMap;runner._autoCancelActionTimer=new Timer;runner._onDidRun=new fixtureRefs.dispatcherClass({});runner.consistencyResumePauseImpl=new Consistency(runner);runner.consistencyResumePauseImpl.setImmediateTryResume();globalThis.fixtureCompletionClasses=[Collection,Timer,Channel,PausedChannel,Consistency];})()`,context);
}

/** Execute only the pinned task method on an inert unsafe receiver. This
 * separate plain Node process has no application/native owner or test hooks. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { test } from "node:test";
import { promisify } from "node:util";
import { CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE as PAGE, qualifyCurrentSchematicRelevanceCanvasEchoSource as qualify } from "../src/current-schematic-relevance-canvas-echo-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_PROGRAMS as P } from "../src/current-schematic-relevance-modify-echo-completion-programs.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";

// oxlint-disable-next-line typescript/strict-void-return -- promisify consumes only execFile's actual child completion callback.
const execute = promisify(execFile);
void test("an actual async task return needs an original-group retained Promise before resume", async context => {
  const sources = await readConfiguredEasyedaAssets(PAGE.map(row => row.relativePath)); if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  for (const variant of [0, 1] as const) {
    const source: string | undefined = sources[variant]; assert.ok(typeof source === "string"); assert.equal(qualify(source), variant); const role = PAGE[variant].roles.taskExecute; const body: string = source.slice(role.start, role.end);
    const script = `import assert from "node:assert/strict";import{Session}from"node:inspector";import{createContext,runInContext}from"node:vm";
const session=new Session();session.connect();const post=(method,params)=>new Promise((resolve,reject)=>session.post(method,params,(error,result)=>error?reject(error):resolve(result)));await post("Debugger.enable");let scriptId,actual,retained,failed,calls=0;const resumed=Promise.withResolvers();session.on("Debugger.scriptParsed",event=>{if(event.params.url==="echo-task-return.js")scriptId=event.params.scriptId;});const realm=createContext({callback(){calls++}});runInContext("this.task={unsafe:true,callback,execute:Object.getOwnPropertyDescriptor((class{"+${JSON.stringify(body)}+"}).prototype,\\"execute\\").value}",realm,{filename:"echo-task-return.js"});
const available=await post("Debugger.getPossibleBreakpoints",{start:{scriptId,lineNumber:0,columnNumber:0},restrictToFunction:false});const actualSource=await post("Debugger.getScriptSource",{scriptId}),start=actualSource.scriptSource.indexOf(${JSON.stringify(body)});const point=available.locations.find(value=>value.type==="return"&&value.columnNumber>=start&&value.columnNumber<start+${String(body.length)});assert.ok(point);session.on("Debugger.paused",event=>{actual=event.params.callFrames[0].returnValue;session.post("Runtime.callFunctionOn",{objectId:actual.objectId,functionDeclaration:${JSON.stringify(P.retainPromise)},objectGroup:"easyeda-schematic-relevance-modify-echo-completion-v1",silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,awaitPromise:false,userGesture:false},(error,result)=>{if(error)failed=error;else retained=result.result;session.post("Debugger.resume",error=>{if(error)resumed.reject(error);else resumed.resolve();});});});await post("Debugger.setBreakpoint",{location:{scriptId,lineNumber:point.lineNumber,columnNumber:point.columnNumber},condition:""});
try{runInContext("task.execute([1])",realm);await resumed.promise;if(failed)throw failed;assert.equal(calls,1);for(const value of[actual,retained])assert.deepEqual([value.type,value.subtype,value.className,value.description],["object","promise","Promise","Promise"]);const packet=await post("Runtime.getProperties",{objectId:retained.objectId,ownProperties:true});assert.equal(packet.result.length,0);assert.deepEqual(packet.internalProperties.map(value=>value.name),["[[Prototype]]","[[PromiseState]]","[[PromiseResult]]"]);assert.equal(packet.internalProperties[1].value.value,"fulfilled");assert.equal(packet.internalProperties[2].value.type,"undefined");process.stdout.write("retained-fulfilled-undefined\\n");}finally{await post("Debugger.disable");session.disconnect();}`;
    const result: Readonly<{stdout:string;stderr:string}> = await execute(process.execPath, ["--input-type=module", "--eval", script], { encoding: "utf8", timeout: 10_000, maxBuffer: 65_536 }); assert.equal(result.stderr, ""); assert.equal(result.stdout, "retained-fulfilled-undefined\n");
  }
});

/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- Held main-thread metadata inspection must retain reentrant failure cleanup. */
import {Session} from "node:inspector/promises";
import {parentPort,workerData} from "node:worker_threads";
import {z} from "zod";
import {CurrentSchematicWireParserHelperCursor,consumeCurrentSchematicWireParserHelperData as consume} from "../../src/current-schematic-wire-parser-helper-cursor.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS as FLAGS} from "../../src/current-schematic-wire-parser-helper-protocol.ts";
import {decodeCurrentSchematicWireParserPause as pause} from "../../src/current-schematic-wire-parser-source.ts";

const config=z.strictObject({key:z.string(),scriptId:z.string(),variant:z.union([z.literal(0),z.literal(1)])}).parse(workerData);const port=parentPort??(():never=>{throw new Error("worker port")})();port.on("message",()=>{
 // Retain this Inspector worker while the main source frame is held.
});const session=new Session();session.connectToMainThread();let breakpoint="";let stopped=false;let released=false;let removed=false;
async function remove():Promise<void>{if(!removed&&breakpoint!==""){removed=true;await session.post("Debugger.removeBreakpoint",{breakpointId:breakpoint});}}
async function release():Promise<void>{if(!released){released=true;await session.post("Runtime.releaseObjectGroup",{objectGroup:FLAGS.objectGroup});}}
async function fail(error:unknown):Promise<void>{if(stopped){return;}stopped=true;try{await remove();await release();await session.post("Debugger.resume");}catch{
 // Explicit inert fixture cleanup only.
}port.postMessage({error:String(error)});session.disconnect();port.close();}
session.on("Debugger.paused",event=>{void(async():Promise<void>=>{const held=pause(event.params,config.variant,"sheetAst","entry",config.scriptId,breakpoint);const cursor=new CurrentSchematicWireParserHelperCursor({frame:held.frame,scriptId:config.scriptId,variant:config.variant});let reads=0;
 for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);const pending:unknown=Reflect.apply(session.post.bind(session),session,[command.method,command.params]);cursor.accept(command,await pending);reads+=1;}
 const data=cursor.requireCompleted();const original={frame:held.frame,scriptId:config.scriptId,variant:config.variant};let copied=false;try{consume(structuredClone(data),original);}catch{copied=true;}if(!copied){throw new Error("copied parser packet accepted");}consume(data,original);let replay=false;try{consume(data,original);}catch{replay=true;}if(!replay){throw new Error("parser packet replayed");}await remove();await release();await session.post("Debugger.resume");stopped=true;port.postMessage({reads,functions:Object.keys(data.functions).length,helperClosureBindingsComplete:data.helperClosureBindingsComplete,parserCompleted:data.parserCompleted,saveAuthorized:data.saveAuthorized});session.disconnect();port.close();
})().catch(fail);});
async function initialize():Promise<void>{await session.post("Debugger.enable");const fn=await session.post("Runtime.evaluate",{expression:`globalThis.${config.key}.fn`});if(fn.result.objectId===undefined){throw new Error("fixture function");}const raw:unknown=await Reflect.apply(session.post.bind(session),session,["Debugger.setBreakpointOnFunctionCall",{objectId:fn.result.objectId}]);breakpoint=z.strictObject({breakpointId:z.string()}).parse(raw).breakpointId;port.postMessage({ready:true});}
void initialize().catch(fail);

/** Bounded original helper metadata at the held sheet-AST invocation.
 * This data cursor cannot issue the frame event or invoke the parser. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as tuple} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_FRAMES as FRAMES,CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_ROLES as ROLES,decodeCurrentSchematicWireParserHelperFunction as qualify} from "./current-schematic-wire-parser-source.ts";
import type {CurrentSchematicWireParserHelperRole as Role} from "./current-schematic-wire-parser-source.ts";
import {CURRENT_SCHEMATIC_WIRE_PARSER_FLAGS as FLAGS,CURRENT_SCHEMATIC_WIRE_PARSER_HELPER_REQUESTS as LIMIT,validateCurrentSchematicWireParserHelperCommand as validate} from "./current-schematic-wire-parser-helper-protocol.ts";
import type {CurrentSchematicWireParserHelperCommand as Command} from "./current-schematic-wire-parser-helper-protocol.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
function need(condition:boolean):asserts condition{if(!condition){throw new Error("SCHEMATIC_WIRE_PARSER_HELPER_CURSOR");}}
function props(objectId:string):Command{return validate({phase:"wire-parser-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
export interface CurrentSchematicWireParserHelperData{
 readonly schema:"private.schematic-wire-parser-helper-comparison-data.v1";readonly frameTuple:string;readonly functions:Readonly<Record<Role,string>>;
 readonly allTwentyOneCompleteHelpersCompared:true;readonly suppliedObservationsOnly:true;readonly originalFrameEventJoined:false;
 readonly helperClosureBindingsComplete:false;readonly childRpcJoined:false;readonly parserCompleted:false;readonly saveAuthorized:false;
}
type OriginalInput=Readonly<{frame:string;scriptId:string;variant:0|1}>;
const issued=new WeakMap<CurrentSchematicWireParserHelperData,OriginalInput>();const consumed=new WeakSet<CurrentSchematicWireParserHelperData>();
/** One exact local helper packet can join the same held AST entry. This
 * comparison token supplies no original event or continuation authority. */
export function consumeCurrentSchematicWireParserHelperData(data:CurrentSchematicWireParserHelperData,input:OriginalInput):Readonly<{frameTuple:string;functions:CurrentSchematicWireParserHelperData["functions"]}>{
 const original=issued.get(data);need(original!==undefined&&!consumed.has(data));consumed.add(data);
 need(original.frame===input.frame&&original.scriptId===input.scriptId&&original.variant===input.variant&&!Object.is(input.variant,-0));
 return Object.freeze({frameTuple:data.frameTuple,functions:data.functions});
}
export class CurrentSchematicWireParserHelperCursor{
 readonly #plan:Generator<Command,CurrentSchematicWireParserHelperData,unknown>;#pending:Command|null=null;#reserved=false;#failed=false;#reads=0;#result:CurrentSchematicWireParserHelperData|null=null;readonly #packets:unknown[]=[];
 public constructor(input:Readonly<{frame:string;scriptId:string;variant:0|1}>){const original=Object.freeze({...input});handle.parse(original.frame);handle.parse(original.scriptId);need((original.variant===0||original.variant===1)&&!Object.is(original.variant,-0));this.#plan=CurrentSchematicWireParserHelperCursor.collect(original);Object.freeze(this);}
 private static *collect(input:Readonly<{frame:string;scriptId:string;variant:0|1}>):Generator<Command,CurrentSchematicWireParserHelperData,unknown>{
  const captured=tuple(yield validate({phase:"wire-parser-helper-frame",variant:input.variant,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:input.frame,expression:FRAMES[input.variant],returnByValue:false,includeCommandLineAPI:false}}),21);
  const rows=array(yield props(captured),21);const entries:[Role,string][]=[];
  for(const[index,role]of ROLES.entries()){const actual=rows.get(String(index));need(actual?.type==="function"&&actual.objectId!==undefined);const decoded=qualify(yield props(actual.objectId),actual,input.variant,role,input.scriptId);entries.push([role,decoded.objectId]);}
  const found=new Map(entries);const take=(role:Role):string=>{const value=found.get(role);need(value!==undefined);return value;};
  const functions=Object.freeze({timer:take("timer"),helper01:take("helper01"),helper02:take("helper02"),helper03:take("helper03"),helper04:take("helper04"),helper05:take("helper05"),helper06:take("helper06"),helper07:take("helper07"),helper08:take("helper08"),helper09:take("helper09"),helper10:take("helper10"),helper11:take("helper11"),helper12:take("helper12"),helper13:take("helper13"),helper14:take("helper14"),helper15:take("helper15"),helper16:take("helper16"),helper17:take("helper17"),helper18:take("helper18"),helper19:take("helper19"),helper20:take("helper20")});
  const data:CurrentSchematicWireParserHelperData=Object.freeze({schema:"private.schematic-wire-parser-helper-comparison-data.v1",frameTuple:captured,functions,allTwentyOneCompleteHelpersCompared:true,suppliedObservationsOnly:true,originalFrameEventJoined:false,helperClosureBindingsComplete:false,childRpcJoined:false,parserCompleted:false,saveAuthorized:false});issued.set(data,input);return data;
 }
 public next():Command|null{need(!this.#failed&&!this.#reserved);if(this.#pending!==null){return this.#pending;}if(this.#result!==null){return null;}try{const step=this.#plan.next();need(step.done!==true);this.#pending=step.value;return step.value;}catch(error){this.#failed=true;throw error;}}
 public reserve(command:Command):void{need(!this.#failed&&!this.#reserved&&this.#pending!==null&&command===this.#pending&&this.#reads<LIMIT.normal);this.#reserved=true;this.#reads+=1;}
 public accept(command:Command,raw:unknown):void{need(!this.#failed&&this.#reserved&&this.#pending===command);try{const captured=capture(raw).value;this.#packets.push(captured);const step=this.#plan.next(captured);this.#pending=null;this.#reserved=false;if(step.done===true){this.#result=step.value;}else {this.#pending=step.value;}}catch(error){this.#failed=true;throw error;}}
 public requireCompleted():CurrentSchematicWireParserHelperData{need(!this.#failed&&!this.#reserved&&this.#pending===null&&this.#result!==null);return this.#result;}
 public retainedReplies():readonly unknown[]{need(this.#failed||this.#result!==null);return Object.freeze([...this.#packets]);}
 public fail():void{this.#failed=true;}
}

Object.freeze(CurrentSchematicWireParserHelperCursor.prototype);Object.freeze(CurrentSchematicWireParserHelperCursor);

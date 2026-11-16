/** Actual provider frames and their original normal returns. */
import {freezeDeep}from"./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_PROGRAMS as BEFORE}from"./current-schematic-wire-ui-provider-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_KINDS as KINDS,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_POINTS as POINTS}from"./current-schematic-wire-ui-runtime-source.ts";
import type {CurrentSchematicWireUiRuntimePoint as Kind}from"./current-schematic-wire-ui-runtime-source.ts";

const start=BEFORE.complete.indexOf('"use strict";');const end=BEFORE.complete.indexOf("dense(registry,13);");
if(start===-1||end<=start){throw new Error("WIRE_UI_RUNTIME_CURRENT");}
const ack='own(root[2],"modifyAcknowledged")!==false',attempted='own(root[2],"modifyAttempted")!==false';
let guard=BEFORE.complete.slice(start,end);
if(guard.split(attempted).length!==2||guard.split(ack).length!==2){throw new Error("WIRE_UI_RUNTIME_STAGE");}
guard=guard.replace(attempted,'own(root[2],"modifyAttempted")!==true').replace(ack,'typeof own(root[2],"modifyAcknowledged")!=="boolean"');
const same=String.raw`dense(registry,13);dense(locale,10);dense(targets,3);const factory=registry[4],tool=registry[6],map=registry[7],controller=registry[8],de=locale[0];if(own(registry[0],"currentProject")!==registry[1]||own(registry[1],"projectId")!==registry[2]||own(root[7],"projectId")!==registry[2]||own(factory,"getInstance")!==registry[5]||own(factory,"tool")!==tool||proto(tool)!==own(factory,"prototype")||own(tool,"map")!==map||proto(map)!==native[17]||get(map,"get")!==undefined||own(native[17],"get")!==native[8]||apply(native[8],map,[registry[2]])!==controller||method(tool,"get",false)[0]!==registry[9]||method(tool,"get",false)[1]!==registry[10]||method(controller,"isClosing",true)[0]!==registry[11]||method(controller,"isClosing",true)[1]!==registry[12]||own(controller,"_isClosing")!==false||own(de,"i18n")!==targets[1]||method(de,"curr",true)[0]!==locale[1]||own(de,"_getValue")!==locale[2]||own(de,"_cache")!==locale[3]||own(de,"_curr")!==locale[6]||own(locale[3],locale[6])!==locale[4]||own(locale[3],"en")!==locale[5]||own(locale[4],"or clear.")!==locale[7]||typeof locale[7]!=="string"||locale[7].length===0||proto("or clear.")!==locale[8]||own(locale[8],"trim")!==locale[9]||proto(locale[9])!==proto(native[0]))bad();`;
const language=String.raw`if(caller.length!==6||caller[0]!==targets[1]||caller[1]!=="or clear."||caller[2]!==undefined||caller[3]!==undefined||caller[4]!==de||caller[5]!==false)bad();`;
function program(kind:Kind):string{
 const row=POINTS[kind];let parent="";
 if(row.caller==="closing"){parent='if(caller.length!==3||caller[0]!==targets[0]||caller[1]!==registry[0]||caller[2]!==registry[3])bad();';}
 else if(row.caller==="lookup"){parent='if(caller.length!==3||caller[0]!==registry[2]||caller[1]!==factory||caller[2]!==registry[0])bad();';}
 else if(row.caller==="language"){parent=language;}
 const fields={
  lookup:'if(this.length!==3||this[0]!==registry[2]||this[1]!==factory||this[2]!==registry[0])bad();',
  instance:'if(this.length!==2||this[0]!==factory||this[1]!==factory)bad();',
  get:'if(this.length!==2||this[0]!==tool||this[1]!==registry[2])bad();',
  closing:'if(this.length!==1||this[0]!==controller)bad();',
  curr:'if(this.length!==1||this[0]!==de)bad();',
  value:'if(this.length!==3||this[0]!==de||this[1]!=="or clear."||this[2]!==locale[4])bad();',
  trim:'if(this.length!==6||this[0]!==targets[1]||this[1]!=="or clear."||this[2]!==undefined||this[3]!==undefined||this[4]!==de||this[5]!==false)bad();',
 }as const;
 let returned="";if(row.returned==="tool"){returned="if(actual!==tool)bad();";}else if(row.returned==="controller"){returned="if(actual!==controller)bad();";}
 const extra=row.returned==="tool"||row.returned==="controller"?",actual":"";
 return `function(native,holder,root,a,b,registry,locale,targets,caller${extra}){${guard}${same}${parent}${fields[row.frame]}${returned}return true;}`;
}
export const CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_CALLS=freezeDeep(KINDS.map(kind=>Object.freeze({role:kind,program:program(kind),refs:POINTS[kind].returned==="tool"||POINTS[kind].returned==="controller"?10:9,byValue:true})));
export const CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_RETAIN='function(){"use strict";return[this];}';
export const CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_ALIASES=`function(native,holder,root,a,b,registry,locale,targets,second,third){${guard}${same}dense(this,1);dense(second,1);dense(third,1);if(this[0]!==registry[6]||second[0]!==registry[8]||third[0]!==registry[8])bad();return true;}`;
export const CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_FRAMES=freezeDeep({lookup:"[t,f5,w]",instance:"[this,ace]",get:"[this,e]",closing:"[this]",curr:"[this]",value:"[this,t,e]",trim:"[this,t,e,i,de,Et]",callerClosing:"[this,w,Zst]",callerLookup:"[t,f5,w]",callerLanguage:"[this,t,e,i,de,Et]"}as const);

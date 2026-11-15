/** No app method, callback, resolver or Promise method is invoked. */
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_PROGRAMS as BEFORE}from"./current-schematic-wire-ui-provider-programs.ts";

const end=BEFORE.complete.indexOf("dense(registry,13);"),start=BEFORE.complete.indexOf('"use strict";');
if(start===-1||end<=start){throw new Error("WIRE_TREE_RUNTIME_ANCHOR");}
let current=BEFORE.complete.slice(start,end);
for(const[from,to]of[['own(root[2],"modifyAttempted")!==false','own(root[2],"modifyAttempted")!==true'],['own(root[2],"modifyAcknowledged")!==false','typeof own(root[2],"modifyAcknowledged")!=="boolean"']]as const){if(current.split(from).length!==2){throw new Error("WIRE_TREE_RUNTIME_STAGE");}current=current.replace(from,to);}
const same=String.raw`dense(entry,10);dense(on,4);const ast=entry[0],tree=entry[1],field=entry[2];if(field!=="objectTreeManager"&&field!=="pageTreeManager"||own(ast,field)!==tree||own(ast,"event")!==tree||own(ast,"batchDepth")!==0||own(ast,"prjUuid")!==entry[4]||own(root[6],"leftTreeActiveTab")!==entry[8]||own(tree,"passContentData")!==entry[3]||method(ast,"getBatch",false)[0]!==entry[5]||method(ast,"getEvent",false)[0]!==entry[6]||method(ast,"passContentData",false)[0]!==entry[7]||own(on[1],"isBuild")!==on[2])bad();const args=n=>{dense(n,3);if(n[0]!==entry[4]||n[1]!==false||n[2]!==false)bad();};const initial=()=>{dense(first,5);args(first[2]);if(first[0]!==null||first[1]!==null||first[3]!==target)bad();};const callee=()=>{dense(this,4);initial();if(this[1]!==null||this[2]!==first[2]||this[3]!==target)bad();};`;
const header=`function(native,holder,root,a,b,entry,on,scope,target,ticketScope,first,caller){${current}${same}`;
const serialCaller=String.raw`dense(caller,4);initial();if(caller[0]!==null||caller[1]!==null||caller[2]!==first[2]||caller[3]!==target)bad();`;
const passCaller=String.raw`dense(caller,3);if(caller[0]!==ast||caller[1]!==false||caller[2]!==false)bad();`;
function onProgram(returned:boolean):string{return `${header}initial();dense(this,4);${returned?"":passCaller}if(this[0]!==undefined||this[1]!==ast||this[2]!==on[1]||this[3]!==on[3]+${returned?"(on[2]?1:0)":"0"})bad();return true;}`;}
function continuation():string{return `${header}initial();dense(this,7);if(this[0]!==ast||this[1]!==false||this[2]!==false||this[3]!==on[0]||this[4]!==ast||this[5]!==on[1]||this[6]!==on[3])bad();return true;}`;}
const target=`${header}initial();dense(this,3);if(this[0]!==tree||this[1]!==entry[4]||this[2]!==false)bad();`;
export const CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_PROGRAMS=freezeDeep({
 wrapperEntry:`${header}dense(this,5);args(this[2]);${passCaller}if(this[0]!==null||this[1]!==null||this[3]!==target)bad();return true;}`,
 freshEntry:`${header}callee();dense(caller,5);if(this[0]!==null||caller[0]!==null||caller[1]!==null||caller[2]!==first[2]||caller[3]!==target||caller[4]!==first[2])bad();return true;}`,
 targetEntry:`${target}${serialCaller}return true;}`,
 targetReturn:`${target}return true;}`,
 wrapperValue:`${header}callee();if(this[0]===null||typeof this[0]!=="object")bad();return true;}`,
 freshReturn:`${header}callee();if(this[0]!==null)bad();return true;}`,
 continuation0:continuation(),continuation1:continuation(),onEntry0:onProgram(false),onEntry1:onProgram(false),onReturn0:onProgram(true),onReturn1:onProgram(true),
 retain:'function(){"use strict";return[this];}',
 join0:join(),join1:join(),
}as const);
function join():string{return `function(native,holder,root,a,b,entry,on,scope,target,ticketScope,first,wrapperCell,targetCell,freshCell,onCell,outer,parserFrame,context,sheet){${current}${same}initial();for(const cell of[wrapperCell,targetCell,freshCell,onCell])dense(cell,1);dense(scope,4);dense(ticketScope,4);if(scope[0]!==null||scope[1]!==null||scope[2]!==first[2]||scope[3]!==target||ticketScope[0]!==undefined||ticketScope[1]!==ast||ticketScope[2]!==on[1]||ticketScope[3]!==on[3]+(on[2]?1:0)||wrapperCell[0]!==freshCell[0]||targetCell[0]===freshCell[0]||onCell[0]===freshCell[0]||onCell[0]===targetCell[0]||outer===freshCell[0]||outer===targetCell[0]||outer===onCell[0])bad();dense(parserFrame,3);dense(context,23);dense(sheet,9);if(parserFrame[0]!==ast||parserFrame[1]!==false||parserFrame[2]!==false||context[0]!==holder||context[1]!==root[1]||context[2]!==root[2]||context[4]!==root[4]||context[6]!==root[6]||context[7]!==root[7]||sheet[0]!==entry[9]||sheet[1]!==ast||sheet[6]!==tree)bad();return true;}`;}
export const CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_FRAMES=freezeDeep([
 {wrapperEntry:"[e,t,n,i,r]",freshEntry:"[e,t,r,i]",targetEntry:"[this,e,t]",targetEarly:"[this,e,t]",targetFinal:"[this,e,t]",wrapperValue:"[e,t,r,i]",continuation:"[this,e,t,On,Ue,Z,nee]",onEntry:"[i,Ue,Z,nee]",onReturn:"[i,Ue,Z,nee]",freshReturn:"[e,t,r,i]",callerPass:"[this,e,t]",callerWrapper:"[e,t,n,i,r]",callerFresh:"[e,t,r,i]"},
 {wrapperEntry:"[e,t,n,i,r]",freshEntry:"[e,t,r,i]",targetEntry:"[this,e,t]",targetEarly:"[this,e,t]",targetFinal:"[this,e,t]",wrapperValue:"[e,t,r,i]",continuation:"[this,e,t,bn,Ue,Z,kee]",onEntry:"[i,Ue,Z,kee]",onReturn:"[i,Ue,Z,kee]",freshReturn:"[e,t,r,i]",callerPass:"[this,e,t]",callerWrapper:"[e,t,n,i,r]",callerFresh:"[e,t,r,i]"},
]as const);

/** Fixed service entry, actual target and return/result comparisons.
 * These recipes invoke no app method, resolver, timer or Promise callback. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_PROGRAMS as RPC } from "./current-schematic-wire-classic-rpc-shared-programs.ts";

const begin=RPC.request.indexOf('"use strict";'),end=RPC.request.indexOf("const bus=current(entry);");
if(begin===-1||end<=begin){throw new Error("WIRE_SERVICE_CURRENT_ANCHOR");}
const current=RPC.request.slice(begin,end);
const guard=`${current}const serviceCurrent=parents=>{const root=parents[0],entry=parents[1],request=parents[2],a=parents[3],b=parents[4],bus=current(entry);if(root[0]!==holder||root[1]!==entry[1]||root[2]!==entry[2]||root[3]!==entry[3]||root[4]!==entry[4]||root[6]!==entry[5]||root[7]!==entry[6]||root[8]!==entry[7]||root[9]!==entry[8]||root[10]!==bus||root[11]!==own(bus,"subscribed")||root[12]!==proto(bus)||root[13]!==own(bus,"pulled")||root[14]!==own(bus,"pushed")||entry[14]!==root[13]||entry[15]!==root[14]||request[0]!==entry||own(bus,"unsafe")!==false||keys(bus).length!==6||own(bus,"uuid")!==entry[13])bad();for(let i=0;i<6;i++){const key=["rpcCall","uniqueRpcTopic","publish","pull","push","rpcReply"][i];if(get(bus,key)!==undefined||own(root[12],key)!==(i<3?a[i]:b[i-3]))bad();}return bus;};`;
function entry(role:0|1|2):string{
 const argument=["if(arg!==null)bad();", "if(!native[7](arg)||proto(arg)!==native[16]||own(arg,\"length\")!==1||own(arg,0)!==\"or clear.\"||arg===rpc[11])bad();", "const id=own(rpc[4],\"uuid\");if(proto(arg)!==native[15]||keys(arg).length!==1||!has(arg,id))bad();const ids=own(arg,id);if(!native[7](ids)||proto(ids)!==native[16]||own(ids,\"length\")!==0||keys(ids).length!==1||arg===rpc[11])bad();"][role];
 return `function(native,holder,parents,tasks,callbacks,handlers,targets,caller){${guard}const bus=serviceCurrent(parents),rpc=parents[1],request=parents[2],task=tasks[${role}],callback=callbacks[${role}],handler=handlers[${role}],target=targets[${role}];if(this.length!==5||caller.length!==6||this[0]!==bus||this[2]!==undefined||this[3]!==undefined||this[4]!==handler||caller[0]!==task||caller[1]!==this[1]||caller[2]!==undefined||caller[3]!==undefined||caller[4]!==false||caller[5]!==rpc[25]||own(task,"callback")!==callback||own(task,"isRunning")!==true)bad();const payload=this[1];if(proto(payload)!==native[15]||keys(payload).length!==2||own(payload,"reply")!==request[2])bad();const arg=own(payload,"message");${argument}return[parents,${role},payload,arg,task,callback,handler,target];}`;
}
export const CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_PROGRAMS=freezeDeep({
 parents:`function(native,holder,root,entry,request,a,b){${guard}const parents=[root,entry,request,a,b];serviceCurrent(parents);return parents;}`,
 entryClosing:entry(0),entryLanguage:entry(1),entryTitles:entry(2),
 targetClosing:`function(native,holder,snapshot){${guard}serviceCurrent(snapshot[0]);if(this.length!==3||this[0]!==snapshot[7]||snapshot[1]!==0)bad();return[snapshot,this[1],this[2]];}`,
 targetLanguage:`function(native,holder,snapshot){${guard}serviceCurrent(snapshot[0]);if(this.length!==6||this[0]!==snapshot[7]||this[1]!=="or clear."||this[2]!==undefined||this[3]!==undefined||snapshot[1]!==1)bad();return[snapshot,this[4],this[5]];}`,
 targetTitles:`function(native,holder,snapshot){${guard}serviceCurrent(snapshot[0]);if(this.length!==2||this[0]!==snapshot[3]||snapshot[1]!==2||typeof this[1]!=="function")bad();return[snapshot,this[1]];}`,
 query:`function(native,holder,snapshot,target){${guard}serviceCurrent(snapshot[0]);if(this.length!==9||this[0]!==snapshot[3]||snapshot[1]!==2||target[0]!==snapshot)bad();return[snapshot,this[1],this[2],this[3],this[4],this[5],this[6],this[7],this[8]];}`,
 postClosing:`function(native,holder,snapshot){${guard}const bus=serviceCurrent(snapshot[0]),rpc=snapshot[0][1];if(this.length!==9||this[0]!==bus||this[1]!==snapshot[2]||this[2]!==undefined||this[3]!==undefined||this[4]!==snapshot[6]||this[5]!==snapshot[3]||this[6]!==snapshot[0][2][2]||this[7]!==false||this[8]!==rpc[16]||snapshot[1]!==0)bad();return[snapshot,this[7],this[8]];}`,
 postLanguage:`function(native,holder,snapshot,expected){${guard}const bus=serviceCurrent(snapshot[0]),rpc=snapshot[0][1];if(this.length!==9||this[0]!==bus||this[1]!==snapshot[2]||this[2]!==undefined||this[3]!==undefined||this[4]!==snapshot[6]||this[5]!==snapshot[3]||this[6]!==snapshot[0][2][2]||this[7]!==expected||this[8]!==rpc[16]||snapshot[1]!==1||typeof expected!=="string"||expected.length>8192)bad();return[snapshot,this[7],this[8]];}`,
 postTitles:`function(native,holder,snapshot){${guard}const bus=serviceCurrent(snapshot[0]),rpc=snapshot[0][1];if(this.length!==9||this[0]!==bus||this[1]!==snapshot[2]||this[2]!==undefined||this[3]!==undefined||this[4]!==snapshot[6]||this[5]!==snapshot[3]||this[6]!==snapshot[0][2][2]||this[8]!==rpc[16]||snapshot[1]!==2)bad();return[snapshot,this[7],this[8]];}`,
 callbackReturned:`function(native,holder,snapshot){${guard}const bus=serviceCurrent(snapshot[0]);if(this.length!==5||this[0]!==bus||this[1]!==snapshot[2]||this[2]!==undefined||this[3]!==undefined||this[4]!==snapshot[6])bad();return true;}`,
 targetClosingReturned:`function(native,holder,snapshot,target){${guard}serviceCurrent(snapshot[0]);if(this.length!==3||this[0]!==snapshot[7]||this[1]!==target[1]||this[2]!==target[2]||target[0]!==snapshot||snapshot[1]!==0)bad();return true;}`,
 targetLanguageReturned:`function(native,holder,snapshot,target){${guard}serviceCurrent(snapshot[0]);if(this.length!==6||this[0]!==snapshot[7]||this[1]!=="or clear."||this[2]!==undefined||this[3]!==undefined||this[4]!==target[1]||this[5]!==target[2]||target[0]!==snapshot||snapshot[1]!==1)bad();return true;}`,
 targetTitlesReturned:`function(native,holder,snapshot,target){${guard}serviceCurrent(snapshot[0]);if(this.length!==2||this[0]!==snapshot[3]||this[1]!==target[1]||target[0]!==snapshot||snapshot[1]!==2)bad();return true;}`,
 current:`function(native,holder,snapshot){${guard}serviceCurrent(snapshot[0]);return true;}`,
 published:`function(native,holder,snapshot,post,result){${guard}const bus=serviceCurrent(snapshot[0]),rpc=snapshot[0][1];if(this.length!==6||this[0]!==bus||snapshot[1]!==2||post[0]!==snapshot||this[1]!==result||this[2]!==snapshot[0][2][2]||this[3]!==undefined||this[4]!==undefined||this[5]!==rpc[27])bad();return[snapshot,post,result];}`,
 replyClosing:`function(native,holder,snapshot,post){${guard}const bus=serviceCurrent(snapshot[0]);if(this.length!==5||this[0]!==bus||this[1]!==false||this[1]!==post[1]||this[2]!==snapshot[0][2][2]||this[3]!==undefined||this[4]!==undefined||post[0]!==snapshot||snapshot[1]!==0)bad();return[snapshot,post,this[1]];}`,
 replyLanguage:`function(native,holder,snapshot,post){${guard}const bus=serviceCurrent(snapshot[0]);if(this.length!==5||this[0]!==bus||this[1]!==post[1]||this[2]!==snapshot[0][2][2]||this[3]!==undefined||this[4]!==undefined||post[0]!==snapshot||snapshot[1]!==1||typeof this[1]!=="string"||this[1].length>8192)bad();return[snapshot,post,this[1]];}`,
 replyTitles:`function(native,holder,snapshot,post,published){${guard}const bus=serviceCurrent(snapshot[0]);if(this.length!==5||this[0]!==bus||this[1]!==published[2]||this[2]!==snapshot[0][2][2]||this[3]!==undefined||this[4]!==undefined||post[0]!==snapshot||published[0]!==snapshot||published[1]!==post||snapshot[1]!==2)bad();return[snapshot,post,this[1]];}`,
 replyReturned:`function(native,holder,snapshot,reply){${guard}const bus=serviceCurrent(snapshot[0]);if(this.length!==5||this[0]!==bus||this[1]!==reply[2]||this[2]!==snapshot[0][2][2]||this[3]!==undefined||this[4]!==undefined||reply[0]!==snapshot)bad();return true;}`,
 queryReturned:`function(native,holder,snapshot,query,result){${guard}serviceCurrent(snapshot[0]);if(this.length!==3||snapshot[1]!==2||this[0]!==snapshot[3]||this[1]!==result||this[2]!==query[1]||query[0]!==snapshot)bad();return true;}`,
 same:`function(expected){"use strict";if(this!==expected)throw "WIRE_SERVICE_IDENTITY";return true;}`,
 retain:`function(){"use strict";return this;}`,
}as const);
export const CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FRAMES=freezeDeep({
 ui:{
  entry:"[this,i,o,n,e]",caller:"[this,t,e,i,o,e9e]",post:"[this,i,o,n,e,r,a,s,Promise]",
  closing:"[this,w,Zst]",language:"[this,t,e,i,de,Et]",
  published:"[this,c,a,o,l,aZ]",reply:"[this,t,e,i,o]",
 },
 sch:[
  {target:"[e,tj]",query:"[i,Z,Ie,ft,V,oi,Nt,ei,Tt]",queryReturned:"[i,e,Z]"},
  {target:"[e,Cj]",query:"[i,Z,Ie,ft,V,oi,Nt,ti,Tt]",queryReturned:"[i,e,Z]"},
 ],
}as const);

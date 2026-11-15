/* oxlint-disable eslint/no-template-curly-in-string -- Exact pinned worker method descriptions deliberately retain their original template syntax as data. */
/** Passive complete-timer binding recipes. Only an original Core collection
 * may supply their native metadata, helper source and retained references. */
import {CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_SOURCE as CALLBACKS} from "./current-footprint-forward-writer-startup-nonprivate-source.ts";
import {createHash} from "node:crypto";
import {CURRENT_NATIVE_OWN_DATA_CHECK as CHECK} from "./current-native-own-data-intrinsics.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_PROGRAMS as FACTS} from "./current-footprint-forward-writer-ticket-timer-programs.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SOURCE as SOURCE,qualifyCurrentFootprintForwardWriterTicketTimerSource} from "./current-footprint-forward-writer-ticket-timer-source.ts";
import {CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as DEPENDENCIES} from "./current-footprint-copy-dependency-profiles.ts";
import {CURRENT_FOOTPRINT_COPY_METHOD_PROFILES} from "./current-footprint-copy-method-bindings.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const getMax=CURRENT_FOOTPRINT_COPY_METHOD_PROFILES[2];
const maximumSource="getMaxTicket(){return this.maxTicket}";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_NATIVE_METADATA=freezeDeep([
 {slot:21,name:"setTimeout",arity:1,constructor:false},
 {slot:22,name:"clearTimeout",arity:0,constructor:false},
 {slot:25,name:"resolve",arity:1,constructor:false},
 {slot:26,name:"then",arity:2,constructor:false},
 {slot:14,name:"postMessage",arity:1,constructor:false},
 {slot:23,name:"Promise",arity:1,constructor:true},
 {slot:45,name:"debug",arity:0,constructor:false},
 {slot:46,name:"Symbol",arity:0,constructor:true},
 {slot:47,name:"get [Symbol.species]",arity:0,constructor:false},
 {slot:27,name:"BroadcastChannel",arity:1,constructor:true,parentDescription:"function EventTarget() { [native code] }"},
 {slot:28,name:"WorkerGlobalScope",arity:0,constructor:true,parentDescription:"function EventTarget() { [native code] }"},
 {slot:29,name:"EventTarget",arity:0,constructor:true},
] as const);
const method=(slot:number,key:keyof typeof SOURCE,arity:number):Readonly<{slot:number;name:string;arity:number;async:false;regular:false;lineNumber:number;columnNumber:number;source:string}>=>({slot,name:key.slice(key.indexOf(".")+1),arity,async:false,regular:false,lineNumber:SOURCE[key].functionLocation.lineNumber,columnNumber:SOURCE[key].functionLocation.columnNumber,source:SOURCE[key].source});
const extraMethods=freezeDeep([{"slot":32,"name":"broadcastWhoHas","arity":1,"async":false,"regular":false,"lineNumber":0,"columnNumber":12_328,"source":"broadcastWhoHas(e){this.post({type:\"WHOHAS\",uuid:this.uuid,topic:e})}"},{"slot":33,"name":"broadcastIHave","arity":2,"async":false,"regular":false,"lineNumber":0,"columnNumber":12_396,"source":"broadcastIHave(e,t){this.post({type:\"IHAVE\",uuid:this.uuid,topic:e,id:t})}"},{"slot":34,"name":"broadcastINeed","arity":3,"async":false,"regular":false,"lineNumber":0,"columnNumber":12_470,"source":"broadcastINeed(e,t,s){this.post({type:\"INEED\",uuid:this.uuid,topic:e,source:t,id:s})}"},{"slot":35,"name":"broadcastIGive","arity":4,"async":false,"regular":false,"lineNumber":0,"columnNumber":12_555,"source":"broadcastIGive(e,t,s,r){this.post({type:\"IGIVE\",uuid:this.uuid,topic:e,id:t,target:s,message:r})}"}] as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_METHOD_METADATA=freezeDeep([
 ...extraMethods,
 {"slot":43,"name":"publishUploadPending","arity":0,"async":false,"regular":false,"lineNumber":110,"columnNumber":16_115,"source":"publishUploadPending(){var s;let t=this.bufferUploadData.size>0||this.isUploadingCloud;this.mainMesBus.publish(\"ui/projectUploadPending\",{uploading:t}),(s=this.workerBus)==null||s.publish(\"/pro-mgr/project/uploadPending\",{uploading:t})}"},{"slot":42,"name":"publishCanvas","arity":11,"async":false,"regular":false,"lineNumber":109,"columnNumber":10_489,"source":"publishCanvas(s,r,i,n,a,o,c,l,u,h,p){if(this.watchIds[s])if(p!==void 0&&p!==o&&this.publishCanvas(s,r,i,n,\"\",p,c,void 0,u,h),l){this.cacheRevoke.has(s)||this.cacheRevoke.set(s,[]);let d=this.projectManager.consistencyManager.orderTree.getOrderNum(s,n);if(this.cacheRevoke.get(s).push([s,n,a,r,i,c,o,l.client,l.ticket,d,l.maxNum]),!this.revokeTimer){let m,f=new Promise(g=>m=g);this.projectManager.publishTask.add(f),this.revokeTimer=setTimeout(()=>{for(let[g,y]of this.cacheRevoke)this.projectManager.workerBus.publish(`/pro-mgr/${g}/revoke`,y);this.cacheRevoke.clear(),this.revokeTimer=null,m&&m(),this.projectManager.publishTask.delete(f)},20)}}else{this.cacheCanvas.has(s)||this.cacheCanvas.set(s,[]);let d=this.projectManager.consistencyManager.orderTree.getOrderNum(s,n);if(this.cacheCanvas.get(s).push([n,i,a,o,r,c,u,h,d]),!this.canvasTimer){let m,f=new Promise(g=>m=g);this.projectManager.publishTask.add(f),this.canvasTimer=setTimeout(()=>{for(let[g,y]of this.cacheCanvas)this.projectManager.workerBus.publish(`/pro-mgr/canvas/${g}/update`,y);this.cacheCanvas.clear(),this.canvasTimer=null,m&&m(),this.projectManager.publishTask.delete(f)},20)}}}"},
 ...(["onChange","onHeadChange"]as const).map((role,index)=>{const row=CALLBACKS[role];return{slot:index===0?38:39,name:row.name,arity:row.arity,async:false,regular:false,lineNumber:row.functionLocation.lineNumber,columnNumber:row.functionLocation.columnNumber,source:row.source};}),
 method(8,"KP.publish",2),method(9,"JP.broadcastPublish",2),method(10,"JP.post",1),method(11,"JP.onMessage",1),method(12,"KP.onReceivedPublish",3),method(16,"Lg.localPublishTicket",1),
 {slot:19,name:"getMaxTicket",arity:0,async:false,regular:false,lineNumber:getMax.lineNumber,columnNumber:getMax.columnNumber,source:maximumSource},
] as const);
export function qualifyCurrentFootprintForwardWriterTicketTimerBindingSource(input:string):void{
 qualifyCurrentFootprintForwardWriterTicketTimerSource(input);const body=input.slice(getMax.utf16Start,getMax.utf16End);
 if(body!==maximumSource||Buffer.byteLength(body)!==getMax.sourceBytes||createHash("sha256").update(body).digest("hex")!==getMax.sourceSha256){throw new Error("FORWARD_TICKET_MAXIMUM_SOURCE");}
}
const GUARD=`()=>{${CHECK}
dense(captured,49);for(let i=0;i<48;i++)if(value(captured,""+i)!==values[i])bad();if(value(captured,"48")!==check)bad();
const fields=["value","get","set","writable","enumerable","configurable"];
for(let i=0;i<saved.length;i++){const row=saved[i],left=row[2],right=get(row[0],row[1]);if(left===undefined){if(right!==undefined)bad();continue;}if(right===undefined)bad();for(let j=0;j<6;j++){const key=fields[j];if(has(left,key)!==has(right,key)||has(left,key)&&left[key]!==right[key])bad();}}
for(let i=0;i<parents.length;i++)if(proto(parents[i][0])!==parents[i][1])bad();dense(change,1);dense(heads,1);if(proto(watch)!==objectProto||names(watch).length!==0||symbols(watch).length!==0||value(footprint,"canvasTimer")!==null||value(footprint,"revokeTimer")!==null)bad();return true;}`;
const capture=`function(project,dependencies,destinations){${CHECK}
let captured=null;const saved=[],parents=[];
const descriptor=(o,k)=>{const d=get(o,k);saved[saved.length]=[o,k,d];return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!has(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined)bad();};
const parent=o=>{const p=proto(o);parents[parents.length]=[o,p];return p;};
if(own(root,"PROJECT")!==project)bad();const manager=own(project,"consistencyManager"),bus=own(project,"workerBus"),channel=own(bus,"bc"),subscribed=own(bus,"subscribed"),uuid=own(bus,"uuid");
const busProto=parent(bus),baseProto=parent(busProto),channelProto=parent(channel),lg=parent(project),ja=parent(manager),vc=parent(ja);
for(const key of["publish","broadcastPublish","broadcastWhoHas","broadcastIHave","broadcastINeed","broadcastIGive","post","onMessage","onReceivedPublish"])absent(bus,key);absent(busProto,"publish");absent(busProto,"onReceivedPublish");absent(channel,"postMessage");absent(project,"localPublishTicket");absent(manager,"getMaxTicket");absent(ja,"getMaxTicket");
const publish=own(baseProto,"publish"),broadcast=own(busProto,"broadcastPublish"),post=own(busProto,"post"),message=own(busProto,"onMessage"),received=own(baseProto,"onReceivedPublish"),nativePost=own(channelProto,"postMessage"),local=own(lg,"localPublishTicket"),maximum=own(vc,"getMaxTicket");
const promise=own(root,"Promise"),promiseProto=own(promise,"prototype"),resolve=own(promise,"resolve"),then=own(promiseProto,"then"),bc=own(root,"BroadcastChannel"),worker=own(root,"WorkerGlobalScope"),events=own(root,"EventTarget"),wp=own(worker,"prototype"),ep=own(events,"prototype");
if(own(channelProto,"constructor")!==bc||own(bc,"prototype")!==channelProto||parent(bc)!==events||parent(channelProto)!==ep||parent(worker)!==events||parent(wp)!==ep||own(wp,"constructor")!==worker||own(ep,"constructor")!==events||parent(ep)!==objectProto||own(promiseProto,"constructor")!==promise)bad();
let at=root,timerOwner=null;for(let i=0;i<6&&at!==null;i++){const d=descriptor(at,"setTimeout");if(d!==undefined){if(at!==wp||!has(d,"value"))bad();timerOwner=at;break;}at=parent(at);}if(timerOwner!==wp)bad();
if(descriptor(subscribed,"/pro-mgr/project/uploadPending")!==undefined||descriptor(objectProto,"/pro-mgr/project/uploadPending")!==undefined)bad();
const change=own(manager,"cbArr"),heads=own(manager,"headCbArr"),footprint=own(project,"footprint"),watch=own(footprint,"watchIds");dense(change,1);dense(heads,1);const changeCallback=own(change,"0"),headCallback=own(heads,"0");if(own(footprint,"projectManager")!==project||own(footprint,"canvasTimer")!==null||own(footprint,"revokeTimer")!==null||proto(watch)!==objectProto||names(watch).length!==0||symbols(watch).length!==0)bad();
const fp=parent(footprint),ar=parent(fp),gd=parent(lg);dense(dependencies,${String(DEPENDENCIES.length+9)});dense(destinations,43);
for(const[key,index]of[["publishMaxTicket",0],["canWsPublish",2]]){absent(project,key);if(own(lg,key)!==own(destinations,""+index))bad();}
absent(project,"onHeadChange");if(own(lg,"onHeadChange")!==own(dependencies,"39"))bad();
absent(footprint,"onDataChange");if(own(fp,"onDataChange")!==own(dependencies,"${String(DEPENDENCIES.length-3)}")||own(project,"uploadStructure")!==own(dependencies,"${String(DEPENDENCIES.length-1)}"))bad();
absent(footprint,"publishCanvas");absent(fp,"publishCanvas");absent(project,"publishUploadPending");absent(lg,"publishUploadPending");const canvas=own(ar,"publishCanvas"),pending=own(gd,"publishUploadPending");
const set=own(timerOwner,"setTimeout"),clear=own(timerOwner,"clearTimeout"),who=own(busProto,"broadcastWhoHas"),have=own(busProto,"broadcastIHave"),needMessage=own(busProto,"broadcastINeed"),give=own(busProto,"broadcastIGive");
const consoleObject=own(root,"console"),debug=own(consoleObject,"debug"),symbolConstructor=own(root,"Symbol"),species=own(symbolConstructor,"species"),speciesDescriptor=descriptor(promise,species);if(!speciesDescriptor||has(speciesDescriptor,"value")||typeof speciesDescriptor.get!=="function"||speciesDescriptor.set!==undefined||speciesDescriptor.enumerable!==false||speciesDescriptor.configurable!==true)bad();const speciesGetter=speciesDescriptor.get;
const values=[project,manager,bus,channel,subscribed,uuid,busProto,baseProto,publish,broadcast,post,message,received,channelProto,nativePost,lg,local,ja,vc,maximum,timerOwner,set,clear,promise,promiseProto,resolve,then,bc,worker,events,wp,ep,who,have,needMessage,give,change,heads,changeCallback,headCallback,footprint,watch,canvas,pending,consoleObject,debug,symbolConstructor,speciesGetter];
const check=${GUARD};captured=[values[0],values[1],values[2],values[3],values[4],values[5],values[6],values[7],values[8],values[9],values[10],values[11],values[12],values[13],values[14],values[15],values[16],values[17],values[18],values[19],values[20],values[21],values[22],values[23],values[24],values[25],values[26],values[27],values[28],values[29],values[30],values[31],values[32],values[33],values[34],values[35],values[36],values[37],values[38],values[39],values[40],values[41],values[42],values[43],values[44],values[45],values[46],values[47],check];check();return captured;}`;
const retained=`dense(capture,49);const guard=value(capture,"48");if(typeof guard!=="function"||proto(guard)!==functionProto||get(guard,"apply")!==undefined)bad();if(invoke(guard,root,[])!==true)bad();`;
const binding=`function(capture){${CHECK}${retained}return[${Array.from({length:15},(_,i)=>`value(capture,"${String(i)}")`).join(",")}];}`;
function once(input:string,before:string,after:string):string{if(input.split(before).length!==2){throw new Error("FORWARD_TICKET_FIXED_PROGRAM");}return input.replace(before,after);}
function qualified(self:boolean,frame:string,original:string):string{
 const roots=[...Array.from({length:5},(_,i)=>`value(binding,"${String(i)}")`),...Array.from({length:9},(_,i)=>`value(binding,"${String(i+6)}")`)];
 const envelope=self?`value(${frame},"1")`:roots[0]??"binding";
 const message=self?`value(${envelope},"message")`:envelope;
 return `const qualified=[binding,root,${[...roots,frame,original,envelope,message,...Array.from({length:12},()=>roots[0])].join(",")}];`;
}
function recipe(role:keyof typeof FACTS,signature:string,frame:string,original:string,self=false):string{
 let source:string=FACTS[role];source=source.replace(/^function\([^)]*\)/u,signature);
 return once(source,CHECK,`${CHECK}\n${retained}${qualified(self,frame,original)}`);
}
const baseline=recipe("baseline","function(binding,capture)",'value(binding,"0")','value(binding,"0")');
const before=once(recipe("baseline","function(binding,original,capture)",'value(binding,"0")',"original"),"return[project,manager,bus,channel,subscribed,uuid,maximum];",'dense(original,7);known(original);for(let i=0;i<6;i++)if(own(original,""+i)!==own(binding,""+i))bad();if(maximum!==own(original,"6"))bad();return true;');
const entry=once(recipe("entry","function(frame,binding,baseline,capture)","frame","baseline"),'const timer=own(project,"publishTimer");','dense(baseline,7);known(baseline);for(let i=0;i<6;i++)if(own(baseline,""+i)!==own(binding,""+i))bad();if(maximum<=own(baseline,"6"))bad();const timer=own(project,"publishTimer");');
const returned=recipe("returned","function(frame,binding,original,capture)","frame","original");
const selfReturned=recipe("selfReturned","function(frame,binding,original,capture)","frame","original",true);
const slot=once(recipe("baseline","function(binding,original,capture)",'value(binding,"0")',"original"),'if(own(project,"publishTimer")!==null)bad();return[project,manager,bus,channel,subscribed,uuid,maximum];','dense(original,7);known(original);for(let i=0;i<6;i++)if(own(original,""+i)!==own(binding,""+i))bad();if(maximum<own(original,"6"))bad();const timer=own(project,"publishTimer");if(timer!==null&&(typeof timer!=="number"||timer%1!==0||timer<1||timer>2147483647))bad();return{timer,ticket:maximum};');
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS=freezeDeep({capture,binding,baseline,before,entry,returned,selfReturned,slot});
export const CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_GUARD_SOURCE=GUARD;

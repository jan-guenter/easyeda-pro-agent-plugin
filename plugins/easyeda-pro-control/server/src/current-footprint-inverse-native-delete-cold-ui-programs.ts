/** Bespoke negative UI task programs. The native own-data tuple and every
 * selected reference must first receive original Inspector metadata. These
 * fixed strings contain no owner, replay, caller endpoint or positive book. */
import {CURRENT_NATIVE_OWN_DATA_CHECK} from "./current-native-own-data-intrinsics.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const common=`"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}
const data=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();return d.value;};
const method=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||d.enumerable||!d.configurable||typeof d.value!=="function")bad();return d.value;};
const plain=o=>{if(o===null||typeof o!=="object"||proto(o)!==objectProto)bad();return o;};
const roots=r=>{dense(r,2);if(value(root,"gVars")!==value(r,"0")||value(root,"_MSG_BUS_")!==value(r,"1"))bad();};`;
const keys=JSON.stringify(["uniqueRpcTopic","publish","subscribe","push","pull","pullA","rpcService","rpcCall","rpcReply"]);

/** One shared body is intentional: stage is a fixed codec literal, and each
 * opaque tuple is classified before a later stage traverses its members. */
const select=`function(stage,a,b){${common}
if(stage===0)return[value(root,"gVars"),value(root,"_MSG_BUS_")];
if(stage===1){roots(a);return[data(plain(value(a,"0")),"currentProject"),proto(value(a,"1"))];}
if(stage===2){roots(a);dense(b,2);const bus=value(a,"1"),p=value(b,"1");if(proto(bus)!==p||proto(p)!==objectProto||count(bus)!==6||data(bus,"unsafe")!==false)bad();return[data(bus,"subscribed"),data(bus,"pulled"),data(bus,"pushed"),method(p,"constructor")];}
if(stage===3){roots(a);dense(b,2);const bus=value(a,"1"),p=value(b,"1"),k=${keys},out=[null,null,null,null,null,null,null,null,null];if(proto(bus)!==p||proto(p)!==objectProto||count(p)!==10)bad();for(let i=0;i<9;i++){const name=value(k,""+i);if(get(bus,name)!==undefined)bad();out[i]=method(p,name);}return out;}
if(stage===4){dense(a,4);plain(value(a,"0"));plain(value(a,"1"));plain(value(a,"2"));return[data(value(a,"0"),"/PrjDB/footprint/getData")];}
if(stage===5){dense(a,1);dense(value(a,"0"),1);return[value(value(a,"0"),"0")];}
if(stage===6){dense(a,1);const task=value(a,"0");if(count(task)!==2||data(task,"isRunning")!==true)bad();return[proto(task),data(task,"callback")];}
if(stage===8){dense(a,9);const bus=value(a,"0"),reply=value(a,"2"),pulled=data(bus,"pulled");if(get(objectProto,reply)!==undefined)bad();return[data(pulled,reply)];}
if(stage===9){dense(a,1);dense(value(a,"0"),1);return[value(value(a,"0"),"0")];}
if(stage===10){dense(a,1);dense(b,9);const task=value(a,"0"),p=proto(value(b,"8"));if(proto(task)!==p||count(task)!==2||data(task,"isRunning")!==true)bad();return[p,data(task,"callback")];}
if(stage===7){dense(a,2);const p=value(a,"0");if(proto(p)!==objectProto||count(p)!==4)bad();return[method(p,"constructor"),method(p,"cancel"),method(p,"running"),method(p,"execute")];}bad();}`;

/** Snapshot descriptors as linked literal cells, avoiding ambient iterators,
 * array mutators and inherited numeric setters. Only the fresh reply key and
 * this invocation's ticket may change. Original queue descriptor peers remain compared. */
const prepare=`function(r,c,b,m,q,t,u,v,ap,nativeProof,target){${common}
roots(r);dense(c,2);dense(b,4);dense(m,9);dense(q,1);dense(t,1);dense(u,2);dense(v,4);plain(target);
const cleanNumeric=p=>{const k=names(p);for(let j=0;j<k.length;j++){const key=value(k,""+j),index=+key;if(index>=0&&index<4294967295&&index%1===0&&""+index===key)bad();}};
cleanNumeric(objectProto);cleanNumeric(arrayProto);if(get(objectProto,"message")!==undefined||get(objectProto,"reply")!==undefined)bad();
if(count(target)!==3||typeof ap!=="function"||proto(ap)!==functionProto||get(ap,"apply")!==undefined||typeof nativeProof!=="function"||proto(nativeProof)!==functionProto||get(nativeProof,"apply")!==undefined)bad();
const vars=plain(value(r,"0")),bus=value(r,"1"),project=plain(value(c,"0")),bp=value(c,"1"),sub=plain(value(b,"0")),pulled=plain(value(b,"1")),pushed=plain(value(b,"2")),queue=value(q,"0"),task=value(t,"0"),tp=value(u,"0"),callback=value(u,"1"),ticket=data(bus,"rpcTicket"),uuid=data(bus,"uuid"),document=value(target,"documentUuid"),projectId=value(target,"projectUuid"),branch=value(target,"branchUuid");
if(typeof uuid!=="string"||uuid.length!==32||typeof ticket!=="number"||ticket<0||ticket>=9007199254740990||ticket%1!==0||1/ticket===-Infinity||typeof document!=="string"||document.length!==16&&document.length!==32||typeof projectId!=="string"||projectId.length!==64||typeof branch!=="string"||branch.length!==32)bad();
const reply="_MSG_BUS_RPC_-/PrjDB/footprint/getData-"+uuid+"-"+ticket,topic="/PrjDB/footprint/getData";
if(get(pulled,reply)!==undefined||get(pushed,reply)!==undefined||get(objectProto,reply)!==undefined)bad();
const same=(a,b)=>a===b?(a!==0||1/a===1/b):a!==a&&b!==b;
const capture=(o,skip)=>{const ns=names(o),ss=symbols(o),p=proto(o);if(ns.length+ss.length>512)bad();let head=null,total=0;for(let i=0;i<ns.length+ss.length;i++){const k=i<ns.length?value(ns,""+i):value(ss,""+(i-ns.length));if(k!==skip){head={key:k,descriptor:get(o,k),next:head};total++;}}return()=>{if(proto(o)!==p)bad();const na=names(o),sa=symbols(o);let size=0;for(let i=0;i<na.length+sa.length;i++)if((i<na.length?value(na,""+i):value(sa,""+(i-na.length)))!==skip)size++;if(size!==total)bad();for(let cell=head;cell!==null;cell=value(cell,"next")){const x=value(cell,"descriptor"),y=get(o,value(cell,"key"));if(!x||!y||has(x,"value")!==has(y,"value")||x.enumerable!==y.enumerable||x.configurable!==y.configurable)bad();if(has(x,"value")){if(x.writable!==y.writable||!same(x.value,y.value))bad();}else if(x.get!==y.get||x.set!==y.set)bad();}return true;};};
const objects=[r,c,b,m,q,t,u,v,vars,project,bus,bp,sub,pulled,pushed,queue,task,tp,callback,target],checks=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];
for(let j=0;j<20;j++)checks[j]=capture(value(objects,""+j),j===10?"rpcTicket":j===13||j===14?reply:undefined);
let attempted=false;
const check=()=>{if(nativeProof()!==true)bad();cleanNumeric(objectProto);cleanNumeric(arrayProto);if(get(objectProto,"message")!==undefined||get(objectProto,"reply")!==undefined)bad();for(let j=0;j<20;j++)if(value(checks,""+j)()!==true)bad();roots(r);if(data(vars,"currentProject")!==project||data(project,"projectId")!==projectId||data(project,"branchUuid")!==branch||data(project,"isV2Format")!==false||data(vars,"isHistoryMode")!==false||proto(bus)!==bp||data(bus,"unsafe")!==false||data(bus,"uuid")!==uuid||data(bus,"subscribed")!==sub||data(bus,"pulled")!==pulled||data(bus,"pushed")!==pushed||data(sub,topic)!==queue)bad();dense(queue,1);if(value(queue,"0")!==task||proto(task)!==tp||data(task,"callback")!==callback||data(task,"isRunning")!==true||method(bp,"constructor")!==value(b,"3")||method(tp,"constructor")!==value(v,"0"))bad();const k=${keys};for(let i=0;i<9;i++)if(get(bus,value(k,""+i))!==undefined||method(bp,value(k,""+i))!==value(m,""+i))bad();for(let i=0;i<3;i++)if(method(tp,value(["cancel","running","execute"],""+i))!==value(v,""+(i+1)))bad();return true;};
const ready=()=>{if(data(bus,"rpcTicket")!==ticket||get(pulled,reply)!==undefined||get(pushed,reply)!==undefined)bad();return check();};
const before=()=>{if(attempted)bad();return ready();};
const once=()=>{if(attempted)bad();attempted=true;ready();return ap(value(m,"7"),bus,[topic,[document,projectId]]);};
const after=()=>{if(!attempted||data(bus,"rpcTicket")!==ticket+1||get(pulled,reply)!==undefined||get(pushed,reply)!==undefined)bad();return check();};
before();return[bus,value(m,"7"),reply,before,once,after,pulled,pushed,task];}`;

const workerHandler=`function(frame,proof,project,needMethod){${common}dense(frame,2);dense(proof,5);const check=value(proof,"4"),arg=value(frame,"1");if(typeof check!=="function"||invoke(check,undefined,[])!==true||value(frame,"0")!==project||value(root,"PROJECT")!==project||value(project,"footprint")!==value(proof,"0")||get(value(proof,"0"),"getNeedData")!==undefined||method(proto(value(proof,"0")),"getNeedData")!==needMethod||proto(arg)!==objectProto||count(arg)!==2||data(arg,"uuid")!==value(proof,"1")||data(arg,"need")!==undefined)bad();return true;}`;

const workerEntry=`function(frame,proof){${common}dense(frame,3);dense(proof,5);const check=value(proof,"4");if(typeof check!=="function"||invoke(check,undefined,[])!==true||value(frame,"0")!==value(proof,"0")||value(frame,"1")!==value(proof,"1")||value(frame,"2")!==1)bad();return true;}`;

const entry=`function(e,native,members,sender){${common}
dense(e,20);dense(native,20);dense(members,24);dense(sender,9);const bus=value(sender,"0"),task=value(sender,"8"),args=value(e,"2");dense(args,2);
if(value(e,"0")!==bus||value(e,"1")!=="/PrjDB/footprint/getData"||value(e,"3")!==300000||value(e,"4")!==2||value(e,"5")!==value(native,"4")||value(e,"6")!==value(native,"16")||
value(e,"7")!==method(proto(bus),"constructor")||value(e,"8")!==method(proto(task),"constructor")||value(e,"15")!==value(native,"14")||value(e,"16")!==value(native,"11")||value(e,"17")!==(value(native,"7")!==null)||value(e,"18")!==300000||value(e,"19")!=="_MSG_BUS_RPC_"||method(proto(bus),"rpcCall")!==value(sender,"1"))bad();return true;}`;

// Retain an actual remote return while its original pause still exists.
const retain="function(){\"use strict\";return this;}";
const run="function(){\"use strict\";return this();}";
const same="function(other){\"use strict\";return this===other;}";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PROGRAMS=freezeDeep({select,prepare,entry,workerEntry,workerHandler,retain,run,same});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FRAMES=freezeDeep({
 workerEntry:"[this,s,arguments.length]",workerHandler:"[this,s]",
 uiEntry:"[this,t,e,i,arguments.length,Promise,setTimeout,udn,R2t,e9e,P2t,tdn,ndn,Noe,aZ,adn,O2t,edn,z2t,sdn]",
 uiReturned:"[this,t,e,i]",
 uiInnerCaller:"[this,t,e,i,o]",
 uiTimer:"[n,r,i,setTimeout]",
 innerPush:"[this,e,t]",
 workerReturned:"[this,s,r]",
 workerDispatch:"[this,e,t,r,i,n]",
 managerReturned:"[this,t,s]",
 fulfilledReply:"[this,t,e,i,o]",
 fulfilledCaller:"[this,c,a,o,l]",
 resolver:"[this,a,s,l]",
 resolverTask:"[this,t,e,i,o]",
}as const);

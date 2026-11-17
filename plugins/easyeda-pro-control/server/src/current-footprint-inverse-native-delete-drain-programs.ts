/** Own native DEL drain recipes. No imported string issues an owner, original
 * receipt or continuation. Primitive metadata is joined before invocation. */
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_NATIVE_CHECK as CHECK,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_DESCRIPTOR_SNAPSHOTS as SNAPSHOTS}from"./current-footprint-inverse-native-delete-upload-programs.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE as SOURCE}from"./current-project-save-producer-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_RECIPE=Object.freeze({
 natives:`function(reflection,recipe){${CHECK}
const p=own(root,"PROJECT"),parent=proto(p),base=proto(parent),sync=own(base,"syncCloud");
if(get(p,"syncCloud")!==undefined||get(parent,"syncCloud")!==undefined||typeof sync!=="function"||textOf(sync)!==${JSON.stringify(SOURCE.syncCloud)})bad();
if(proto(setProto)!==objectProto||get(setProto,"length")!==undefined||get(objectProto,"length")!==undefined)bad();
return[own(setProto,"add"),own(setProto,"values"),sync,value(root,"JSON")];
}`,
 iterator:`function(reflection,recipe,add,values,json,parse,stringify){${CHECK}
if(own(setProto,"add")!==add||own(setProto,"values")!==values||proto(setProto)!==objectProto||get(setProto,"length")!==undefined||get(objectProto,"length")!==undefined)bad();
if(value(root,"JSON")!==json||proto(json)!==objectProto||value(json,"parse")!==parse||value(json,"stringify")!==stringify)bad();
const ctor=value(recipe,"3"),fresh=new ctor(),sentinel={};
if(proto(fresh)!==setProto||count(fresh)!==0||setSize(fresh)!==0)bad();
invoke(add,fresh,[sentinel]);if(setSize(fresh)!==1||!setHas(fresh,sentinel))bad();
const iterator=invoke(values,fresh,[]),iteratorProto=proto(iterator),next=own(iteratorProto,"next");
return[recipe,add,values,iteratorProto,next,json,parse,stringify];
}`,
 finish:`function(reflection,recipe,prepared,sync){${CHECK}
dense(prepared,8);if(own(prepared,"0")!==recipe||own(setProto,"add")!==own(prepared,"1")||own(setProto,"values")!==own(prepared,"2")||proto(setProto)!==objectProto||get(setProto,"length")!==undefined||get(objectProto,"length")!==undefined)bad();
const json=own(prepared,"5"),parse=own(prepared,"6"),stringify=own(prepared,"7");if(value(root,"JSON")!==json||proto(json)!==objectProto||value(json,"parse")!==parse||value(json,"stringify")!==stringify)bad();
const iteratorProto=own(prepared,"3"),next=own(prepared,"4");if(own(iteratorProto,"next")!==next)bad();
const ctor=value(recipe,"3"),fresh=new ctor(),sentinel={};invoke(own(prepared,"1"),fresh,[sentinel]);
if(proto(fresh)!==setProto||count(fresh)!==0||setSize(fresh)!==1||!setHas(fresh,sentinel))bad();
const iterator=invoke(own(prepared,"2"),fresh,[]);if(proto(iterator)!==iteratorProto)bad();
const first=invoke(next,iterator,[]),last=invoke(next,iterator,[]);
if(proto(first)!==objectProto||count(first)!==2||own(first,"done")!==false||own(first,"value")!==sentinel||proto(last)!==objectProto||count(last)!==2||own(last,"done")!==true||own(last,"value")!==undefined)bad();
const p=own(root,"PROJECT"),parent=proto(p),base=proto(parent);
if(get(p,"syncCloud")!==undefined||get(parent,"syncCloud")!==undefined||own(base,"syncCloud")!==sync||textOf(sync)!==${JSON.stringify(SOURCE.syncCloud)})bad();
return[recipe,own(prepared,"1"),own(prepared,"2"),iteratorProto,next,sync,json,parse,stringify];
}`,
});
const common=`${CHECK}
dense(dependencies,9);if(own(dependencies,"0")!==recipe||own(setProto,"add")!==own(dependencies,"1")||own(setProto,"values")!==own(dependencies,"2")||own(own(dependencies,"3"),"next")!==own(dependencies,"4"))bad();
if(value(root,"JSON")!==own(dependencies,"6")||proto(own(dependencies,"6"))!==objectProto||value(own(dependencies,"6"),"parse")!==own(dependencies,"7")||value(own(dependencies,"6"),"stringify")!==own(dependencies,"8"))bad();
const fixedData=(o,k,v)=>{const d=get(o,k);if(!d||!has(d,"value")||d.value!==v||d.writable!==true||d.enumerable!==false||d.configurable!==true)bad();};
fixedData(setProto,"add",own(dependencies,"1"));fixedData(setProto,"values",own(dependencies,"2"));fixedData(own(dependencies,"3"),"next",own(dependencies,"4"));fixedData(root,"JSON",own(dependencies,"6"));fixedData(own(dependencies,"6"),"parse",own(dependencies,"7"));fixedData(own(dependencies,"6"),"stringify",own(dependencies,"8"));
const p=own(root,"PROJECT"),parent=proto(p),base=proto(parent);
if(get(p,"syncCloud")!==undefined||get(parent,"syncCloud")!==undefined||own(base,"syncCloud")!==own(dependencies,"5"))bad();
const equal=(a,b,n)=>{dense(a,n);dense(b,n);for(let i=0;i<n;i++)if(own(a,""+i)!==own(b,""+i))bad();};
const reply=o=>{dense(o,7);if(invoke(own(o,"4"),undefined,[])!==true)bad();const initial=own(o,"0"),h=own(o,"1"),r=own(o,"2");dense(initial,7);if(own(own(initial,"2"),"0")!==p)bad();dense(h,8);dense(r,9);for(let i=0;i<8;i++)if(own(r,""+i)!==own(h,""+i))bad();const response=own(r,"8");if(proto(response)!==objectProto||own(response,"success")!==true||own(response,"result")!==own(o,"5")||own(h,"4")!==0||own(h,"5")!==3)bad();};
const detached=(frame,o)=>{dense(frame,4);reply(o);const h=own(o,"1"),r=own(o,"2");if(own(frame,"0")!==p||own(frame,"1")!==own(h,"1")||own(frame,"2")!==own(h,"2")||own(frame,"3")!==own(r,"8"))bad();};
const success=result=>{if(proto(result)!==objectProto||count(result)!==1||own(result,"success")!==true)bad();};
`;
const capture=`function(frame,original,history,local,response,headUuid,reflection,recipe,dependencies){${common}
dense(original,7);dense(history,8);dense(local,10);dense(frame,9);
if(invoke(own(original,"4"),undefined,[])!==true||own(own(original,"2"),"0")!==p||own(p,"pendingSyncCloud")!==false||own(p,"isSyncing")!==false)bad();
for(let i=0;i<8;i++)if(own(frame,""+i)!==own(history,""+i))bad();
if(own(frame,"8")!==response||proto(response)!==objectProto||own(response,"success")!==true||own(response,"result")!==headUuid||typeof headUuid!=="string"||headUuid.length!==32)bad();
for(let i=0;i<32;i++){const c=headUuid[i];if(!(c>="0"&&c<="9"||c>="a"&&c<="f"))bad();}
const body=own(original,"2"),scheduled=own(original,"1");dense(body,6);dense(scheduled,9);
if(own(body,"0")!==p||own(history,"0")!==p||own(history,"3")!==own(body,"5")||own(local,"7")!==own(body,"5")||own(p,"localCache")!==own(local,"2")||own(p,"isUploadingCloud")!==true||own(history,"4")!==0||own(history,"5")!==3)bad();
const task=own(p,"task1"),timer=own(scheduled,"2");if(setSize(task)!==2||!setHas(task,timer)||setSize(own(p,"task3"))!==0||setSize(own(p,"cachePromise"))!==0)bad();oneMap(own(p,"bufferUploadData"),"","",true);oneMap(own(p,"bufferUploadCache"),"","",true);
const iterator=invoke(own(dependencies,"2"),task,[]);if(proto(iterator)!==own(dependencies,"3"))bad();
const a=invoke(own(dependencies,"4"),iterator,[]),b=invoke(own(dependencies,"4"),iterator,[]),end=invoke(own(dependencies,"4"),iterator,[]);
if(proto(a)!==objectProto||proto(b)!==objectProto||proto(end)!==objectProto||own(a,"done")!==false||own(b,"done")!==false||own(end,"done")!==true||own(end,"value")!==undefined)bad();
const av=own(a,"value"),bv=own(b,"value");if(av===bv||av!==timer&&bv!==timer)bad();const cloud=av===timer?bv:av;
if(!setHas(task,cloud)||setSize(task)!==2||proto(cloud)!==value(value(recipe,"2"),"24"))bad();
const task3=own(p,"task3"),cachePromises=own(p,"cachePromise"),data=own(p,"bufferUploadData"),bufferCache=own(p,"bufferUploadCache");
const fixed=${SNAPSHOTS},fields=["uuid","_branchUuid","localCache","cache","task1","task3","cachePromise","bufferUploadData","bufferUploadCache"],saved=[get(p,"uuid"),get(p,"_branchUuid"),get(p,"localCache"),get(p,"cache"),get(p,"task1"),get(p,"task3"),get(p,"cachePromise"),get(p,"bufferUploadData"),get(p,"bufferUploadCache")];
const methodNames=["batchUploadCloud","uploadCloud","syncCloud"],methods=[own(original,"5"),own(original,"6"),own(dependencies,"5")],texts=${JSON.stringify([SOURCE.batchUploadCloud,SOURCE.uploadCloud,SOURCE.syncCloud])};
const branch=get(base,"branchUuid"),format=get(base,"isV2Format"),methodDescriptors=[get(base,"batchUploadCloud"),get(base,"uploadCloud"),get(base,"syncCloud")];
const desc=(x,y)=>{if(!x||!y||has(x,"value")!==has(y,"value")||!same(x.value,y.value)||x.get!==y.get||x.set!==y.set||x.writable!==y.writable||x.enumerable!==y.enumerable||x.configurable!==y.configurable)bad();};
const guard=()=>{
 if(own(root,"PROJECT")!==p||proto(p)!==parent||proto(parent)!==base||own(p,"task1")!==task||own(p,"task3")!==task3||own(p,"cachePromise")!==cachePromises||own(p,"bufferUploadData")!==data||own(p,"bufferUploadCache")!==bufferCache)bad();
 for(let i=0;i<22;i++)desc(get(fixed[i][0],fixed[i][1]),fixed[i][2]);for(let i=0;i<9;i++)desc(get(p,fields[i]),saved[i]);
 for(let i=0;i<3;i++){const k=methodNames[i],d=get(base,k);if(get(p,k)!==undefined||get(parent,k)!==undefined||!d||!has(d,"value")||d.value!==methods[i]||!d.writable||d.enumerable||!d.configurable||textOf(d.value)!==texts[i])bad();desc(d,methodDescriptors[i]);}
 for(let i=0;i<2;i++){const o=i===0?p:parent;if(get(o,"branchUuid")!==undefined||get(o,"isV2Format")!==undefined)bad();}
 desc(get(base,"branchUuid"),branch);desc(get(base,"isV2Format"),format);
 if(own(p,"isTemporary")!==false||own(p,"isHistoryBack")!==false||own(p,"_isV2Format")!==false)bad();
 const flags=["pendingSyncCloud","notSyncCloud","isSyncing","isUploadingCloud"];for(let i=0;i<4;i++){const flag=own(p,flags[i]);if(flag!==false&&flag!==true)bad();}
 return true;
};
guard();return[original,history,frame,local,guard,headUuid,cloud];
}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_CHECK=common;
const detachedEntry=`function(frame,original,reflection,recipe,dependencies){${common}detached(frame,original);if(own(p,"isUploadingCloud")!==true)bad();oneMap(own(frame,"2"),own(own(original,"3"),"6"),own(own(original,"1"),"3"));return true;}`;
const syncEntry=`function(frame,original,reflection,recipe,dependencies){${common}reply(original);dense(frame,2);if(own(frame,"0")!==p||own(frame,"1")!==undefined||own(p,"isUploadingCloud")!==true||own(p,"pendingSyncCloud")!==false||own(p,"notSyncCloud")!==false||own(p,"isSyncing")!==false||setSize(own(p,"task3"))!==0)bad();return true;}`;
const syncDeferred=`function(frame,original,entry,reflection,recipe,dependencies){${common}reply(original);equal(frame,entry,2);if(own(frame,"0")!==p||own(frame,"1")!==undefined||own(p,"isUploadingCloud")!==true||own(p,"pendingSyncCloud")!==true||own(p,"notSyncCloud")!==false||own(p,"isSyncing")!==false||setSize(own(p,"task3"))!==0)bad();return true;}`;
const historyQueued=`function(frame,original,reflection,recipe,dependencies){${common}reply(original);dense(frame,10);const previous=own(original,"2");for(let i=0;i<9;i++)if(own(frame,""+i)!==own(previous,""+i))bad();const promise=own(frame,"9");if(proto(promise)!==value(value(recipe,"2"),"24")||setHas(own(p,"task1"),promise)||own(p,"isUploadingCloud")!==true||own(p,"pendingSyncCloud")!==true)bad();return true;}`;
const historyFinally=`function(frame,original,queued,reflection,recipe,dependencies){${common}reply(original);equal(frame,queued,10);if(!setHas(own(p,"task1"),own(queued,"9")))bad();return true;}`;
const cloudReturned=`function(frame,original,result,reflection,recipe,dependencies){${common}reply(original);const h=own(original,"1");dense(frame,8);if(own(frame,"0")!==p||own(frame,"1")!==own(h,"2")||own(p,"isUploadingCloud")!==true||own(frame,"5")!==own(h,"3").length||own(frame,"6")!==50*1024*1024||own(frame,"7")!==result)bad();success(result);
const jobs=own(frame,"2"),urls=own(frame,"3"),chunks=own(frame,"4");dense(jobs,1);dense(urls,1);dense(chunks,1);if(own(jobs,"0")!==own(h,"1")||own(urls,"0")!==own(own(original,"3"),"6")||own(chunks,"0")!==own(h,"3"))bad();return true;}`;
const cloudFinally=`function(frame,original,returned,reflection,recipe,dependencies){${common}reply(original);dense(frame,7);dense(returned,8);for(let i=0;i<7;i++)if(own(frame,""+i)!==own(returned,""+i))bad();if(own(frame,"0")!==p||own(p,"isUploadingCloud")!==false||own(p,"pendingSyncCloud")!==true||own(p,"notSyncCloud")!==false||own(p,"isSyncing")!==false)bad();return true;}`;
const batchReturned=`function(frame,original,reflection,recipe,dependencies){${common}reply(original);dense(frame,2);if(own(frame,"0")!==p||own(frame,"1")!==own(original,"6")||setHas(own(p,"task1"),own(frame,"1"))||own(p,"isUploadingCloud")!==false)bad();return true;}`;
const bufferDone=`function(frame,original,reflection,recipe,dependencies){${common}reply(original);const prior=own(own(original,"0"),"0"),scheduled=own(own(original,"0"),"1");equal(frame,prior,8);if(own(frame,"0")!==p||own(frame,"6")!==own(scheduled,"2")||own(frame,"7")!==own(scheduled,"3")||setHas(own(p,"task1"),own(frame,"6")))bad();return true;}`;
const detachedReturned=`function(frame,original,entry,reflection,recipe,dependencies){${common}detached(frame,original);equal(frame,entry,4);oneMap(own(frame,"2"),"","",true);return true;}`;
const cloudResult=`function(frame,original,returned,reflection,recipe,dependencies){${common}reply(original);dense(returned,8);if(frame!==own(returned,"7"))bad();success(frame);return true;}`;
const final=`function(frame,original,reflection,recipe,dependencies){${common}if(frame!==original)bad();reply(original);const originalUpload=own(original,"0");if(invoke(own(originalUpload,"4"),undefined,[])!==true||own(p,"isUploadingCloud")!==false||own(p,"pendingSyncCloud")!==false||own(p,"notSyncCloud")!==false||own(p,"isSyncing")!==false)bad();oneMap(own(own(original,"1"),"2"),"","",true);oneMap(own(p,"bufferUploadData"),"","",true);oneMap(own(p,"bufferUploadCache"),"","",true);return setSize(own(p,"task1"))===0&&setSize(own(p,"task3"))===0&&setSize(own(p,"cachePromise"))===0;}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_PROGRAMS=Object.freeze({capture,detachedEntry,syncEntry,syncDeferred,historyQueued,historyFinally,cloudReturned,cloudFinally,batchReturned,bufferDone,detachedReturned,cloudResult,final});

/** Own-data-only native DEL upload algorithms. No ambient iterator, String,
 * Reflect method, Function.call, indexed assignment or application call runs.
 * Metadata for every invoked native is retained by the original recipe owner. */
import {CURRENT_NATIVE_OWN_DATA_CHECK as CHECK}from"./current-native-own-data-intrinsics.ts";
import {CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE as METHODS}from"./current-project-save-producer-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_RECIPE=Object.freeze({
 set:`function(){${CHECK}return value(root,"Set");}`,
 capture:`function(segments,publication,set){${CHECK}
dense(segments,6);dense(publication,49);const natives=value(segments,"5");dense(natives,2);
const map=value(natives,"0"),mapSize=value(natives,"1"),mapProto=value(map,"prototype"),setProto=value(set,"prototype");
if(set!==value(root,"Set")||map!==value(root,"Map")||value(publication,"23")!==value(root,"Promise"))bad();
const toString=value(functionProto,"toString"),mapGet=value(mapProto,"get"),setHas=value(setProto,"has"),size=get(setProto,"size");
if(!size||has(size,"value")||typeof size.get!=="function")bad();
return[packet,segments,publication,set,setProto,map,mapProto,toString,mapGet,mapSize,setHas,size.get];
}`,
 reprove:`function(recipe){${CHECK}
dense(recipe,12);const segments=value(recipe,"1"),publication=value(recipe,"2");dense(segments,6);dense(publication,49);
const natives=value(segments,"5");dense(natives,2);
if(value(recipe,"0")!==packet||value(recipe,"3")!==value(root,"Set")||value(recipe,"4")!==value(value(recipe,"3"),"prototype")||value(recipe,"5")!==value(root,"Map")||value(recipe,"5")!==value(natives,"0")||value(recipe,"6")!==value(value(recipe,"5"),"prototype")||value(recipe,"9")!==value(natives,"1")||value(recipe,"7")!==value(functionProto,"toString")||value(recipe,"8")!==value(value(recipe,"6"),"get")||value(recipe,"10")!==value(value(recipe,"4"),"has"))bad();
const sd=get(value(recipe,"4"),"size"),md=get(value(recipe,"6"),"size");if(!sd||has(sd,"value")||sd.get!==value(recipe,"11")||!md||has(md,"value")||md.get!==value(recipe,"9"))bad();
for(let i=7;i<12;i++){const fn=value(recipe,""+i);if(typeof fn!=="function"||proto(fn)!==functionProto||get(fn,"apply")!==undefined)bad();}
return true;
}`
});
const safe=`"use strict";const packet=reflection;${CHECK.replace("const packet=this,","const ")}
dense(recipe,12);if(value(recipe,"0")!==packet)bad();
if(invoke((${CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_RECIPE.reprove}),packet,[recipe])!==true)bad();
const mapProto=value(recipe,"6"),setProto=value(recipe,"4"),toString=value(recipe,"7"),mapGet=value(recipe,"8"),mapSize=value(recipe,"9"),setHasNative=value(recipe,"10"),setSizeNative=value(recipe,"11");
const same=(a,b)=>a===b?(a!==0||1/a===1/b):a!==a&&b!==b;
const own=value,array=dense,textOf=f=>invoke(toString,f,[]);
const setSize=v=>{const n=invoke(setSizeNative,v,[]);if(proto(v)!==setProto||count(v)!==0)bad();return n;};
const setHas=(v,k)=>invoke(setHasNative,v,[k]);
const oneMap=(v,key,text,empty=false)=>{const n=invoke(mapSize,v,[]);if(proto(v)!==mapProto||count(v)!==0||n!==(empty?0:1)||!empty&&invoke(mapGet,v,[key])!==text)bad();};
const idle=p=>{const a=["isTemporary","isHistoryBack","_isV2Format"];for(let i=0;i<3;i++)if(own(p,a[i])!==false)bad();const b=["pendingSyncCloud","notSyncCloud","isSyncing"];for(let i=0;i<3;i++){const d=get(p,b[i]);if(d&&(!has(d,"value")||d.value!==false&&d.value!==undefined))bad();}};
`;
/** Shared literal descriptor algorithm only; no original receipt or caller
 * can be issued from importing this string. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_NATIVE_CHECK=safe;
const SNAPSHOTS=[
 ["root","Object"],["root","Reflect"],["root","Function"],["root","Map"],["root","Set"],["root","Array"],["root","Promise"],
 ['value(root,"Object")',"getOwnPropertyDescriptor"],['value(root,"Object")',"getPrototypeOf"],['value(root,"Object")',"hasOwn"],['value(root,"Object")',"is"],
 ['value(root,"Reflect")',"ownKeys"],['value(root,"Reflect")',"apply"],["functionProto","toString"],['value(root,"Array")',"isArray"],
 ['value(root,"Map")',"prototype"],['value(root,"Set")',"prototype"],['value(root,"Promise")',"prototype"],
 ["mapProto","get"],["mapProto","size"],["setProto","size"],["setProto","has"],
]as const;
const snapshotLiteral=`[${SNAPSHOTS.map(([o,k])=>`[${o},${JSON.stringify(k)},get(${o},${JSON.stringify(k)})]`).join(",")}]`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_DESCRIPTOR_SNAPSHOTS=snapshotLiteral;
const capture=`function(frame,scheduled,body,cache,reflection,recipe){${safe}
array(frame,8);array(scheduled,9);array(body,6);array(cache,10);const p=own(body,"0"),key=own(cache,"6"),text=own(body,"5");
if(own(root,"PROJECT")!==p||own(scheduled,"4")!==p||own(cache,"2")!==own(p,"localCache")||own(cache,"7")!==text||typeof key!=="string"||typeof text!=="string"||own(frame,"0")!==p||own(frame,"1")!==own(scheduled,"5")||own(frame,"2")!==500||own(frame,"3")!==null||own(frame,"4")!==null||own(frame,"5")!==null||own(frame,"6")!==own(scheduled,"2")||own(frame,"7")!==own(scheduled,"3")||own(p,"uuid")!==own(cache,"8")||own(p,"_branchUuid")!==own(cache,"9"))bad();
const parent=proto(p),base=proto(parent),methodNames=["batchUploadCloud","uploadCloud"],texts=${JSON.stringify([METHODS.batchUploadCloud,METHODS.uploadCloud])};
const method=(j,expected)=>{const k=methodNames[j];if(get(p,k)!==undefined||get(parent,k)!==undefined)bad();const d=get(base,k);if(!d||!has(d,"value")||!d.writable||d.enumerable||!d.configurable||typeof d.value!=="function"||textOf(d.value)!==texts[j]||expected!==undefined&&d.value!==expected)bad();return d.value;};
const batch=method(0,undefined),cloud=method(1,undefined),methods=[batch,cloud];
for(let i=0;i<2;i++){const o=i===0?p:parent;if(get(o,"isV2Format")!==undefined||get(o,"branchUuid")!==undefined)bad();}
const branch=get(base,"branchUuid"),format=get(base,"isV2Format");
if(!branch||has(branch,"value")||textOf(branch.get)!=="get branchUuid(){return this._branchUuid}"||textOf(branch.set)!=="set branchUuid(t){this._branchUuid=t,this._projectDetails&&(this._projectDetails.currentBranch=t)}"||!format||has(format,"value")||textOf(format.get)!=="get isV2Format(){return this._isV2Format}")bad();
const timer=own(scheduled,"2"),task=own(p,"task1"),data=own(p,"bufferUploadData"),cacheMap=own(p,"bufferUploadCache"),task3=own(p,"task3"),cachePromises=own(p,"cachePromise");
const fields=[["PROJECT",root],["uuid",p],["_branchUuid",p],["localCache",p],["task1",p],["bufferUploadData",p],["bufferUploadCache",p],["task3",p],["cachePromise",p]],retained=[get(root,"PROJECT"),get(p,"uuid"),get(p,"_branchUuid"),get(p,"localCache"),get(p,"task1"),get(p,"bufferUploadData"),get(p,"bufferUploadCache"),get(p,"task3"),get(p,"cachePromise")];
const fixed=${snapshotLiteral};\nconst desc=(a,b)=>{if(!a||!b||has(a,"value")!==has(b,"value")||!same(a.value,b.value)||a.get!==b.get||a.set!==b.set||a.writable!==b.writable||a.enumerable!==b.enumerable||a.configurable!==b.configurable)bad();};
const guard=()=>{
 if(own(root,"PROJECT")!==p||proto(p)!==parent||proto(parent)!==base||own(p,"task1")!==task||own(p,"bufferUploadData")!==data||own(p,"bufferUploadCache")!==cacheMap||own(p,"task3")!==task3||own(p,"cachePromise")!==cachePromises)bad();
 for(let i=0;i<9;i++)desc(get(fields[i][1],fields[i][0]),retained[i]);\n for(let i=0;i<22;i++)desc(get(fixed[i][0],fixed[i][1]),fixed[i][2]);
 for(let i=0;i<2;i++){method(i,methods[i]);const o=i===0?p:parent;if(get(o,"isV2Format")!==undefined||get(o,"branchUuid")!==undefined)bad();}
 desc(get(base,"branchUuid"),branch);desc(get(base,"isV2Format"),format);
 if(value(root,"Set")!==value(recipe,"3")||value(root,"Map")!==value(recipe,"5")||value(value(recipe,"5"),"prototype")!==mapProto||value(value(recipe,"3"),"prototype")!==setProto||value(functionProto,"toString")!==toString||value(mapProto,"get")!==mapGet||value(setProto,"has")!==setHasNative)bad();
 const sm=get(setProto,"size"),mm=get(mapProto,"size");if(!sm||has(sm,"value")||sm.get!==setSizeNative||!mm||has(mm,"value")||mm.get!==mapSize)bad();idle(p);return true;
};
guard();if(own(p,"isUploadingCloud")!==false||setSize(task)!==1||!setHas(task,timer)||setSize(task3)!==0||setSize(cachePromises)!==0)bad();oneMap(data,key,text);oneMap(cacheMap,key,text,true);return[frame,scheduled,body,cache,guard,batch,cloud];
}`;
const cloudIngress=`function(frame,original,reflection,recipe){${safe}array(original,7);if(invoke(own(original,"4"),undefined,[])!==true)bad();array(frame,1);const scheduled=own(original,"1"),body=own(original,"2"),cache=own(original,"3"),p=own(body,"0");if(own(frame,"0")!==p||own(p,"isUploadingCloud")!==false||setSize(own(p,"task1"))!==1||!setHas(own(p,"task1"),own(scheduled,"2")))bad();oneMap(own(p,"bufferUploadData"),own(cache,"6"),own(body,"5"));oneMap(own(p,"bufferUploadCache"),"","",true);return true;}`;
const historyCloud=`function(frame,original,reflection,recipe){${safe}array(original,7);if(invoke(own(original,"4"),undefined,[])!==true)bad();array(frame,8);const body=own(original,"2"),cache=own(original,"3"),p=own(body,"0"),key=own(cache,"6"),text=own(body,"5"),job=own(frame,"1");
if(own(frame,"0")!==p||own(frame,"3")!==text||text.length>=10000||own(frame,"4")!==0||own(frame,"5")!==3||own(frame,"6")!==own(p,"uuid")||typeof own(frame,"7")!=="function"||own(p,"isUploadingCloud")!==true||proto(job)!==objectProto||count(job)!==2)bad();
const urls=own(job,"url"),chunks=own(job,"data");array(urls,1);array(chunks,1);if(own(urls,"0")!==key||own(chunks,"0")!==text)bad();oneMap(own(frame,"2"),key,text);oneMap(own(p,"bufferUploadData"),key,text,true);oneMap(own(p,"bufferUploadCache"),key,text,true);return true;}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_PROGRAMS=Object.freeze({capture,cloudIngress,historyCloud});
function receiver(length:number,buffered:boolean):string{
 return `function(project,wrapper,callback,reflection){const original=this;const packet=reflection;${CHECK.replace("const packet=this,","const ")}
dense(original,${String(length)});if(value(root,"PROJECT")!==project||value(project,"bufferedUploadCloud")!==wrapper||typeof wrapper!=="function"||typeof callback!=="function"||value(original,"0")!==project)bad();${buffered?'if(value(original,"1")!==callback||value(original,"2")!==500)bad();':""}return original;}`;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_RECEIVERS=Object.freeze({bufferDrain:receiver(8,true),cloudIngress:receiver(1,false),historyCloud:receiver(8,false)});

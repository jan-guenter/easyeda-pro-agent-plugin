/** Fixed native-equivalent read of existing footprint history chunks. It
 * invokes no vendor getter, compressor, parser, cache writer or network API.
 * Selected live consistency offsets determine the returned data; the host
 * compares it separately with its original completed checkpoint projection. */
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION } from "./current-footprint-copy-source-read.ts";

export const CURRENT_FOOTPRINT_COPY_CACHE_READ_LIMITS = Object.freeze({ keys: 64, bytes: 8_388_608, atoms: 4096, streamReads: 4096 });

const reader = String.raw`
let cacheRead,activeCacheReader=null;
const abortCacheReader=async()=>{const held=activeCacheReader;if(held===null)return;activeCacheReader=null;let cleanupTimer;try{const work=Promise.resolve(Reflect.apply(held.cancel,held.reader,[]));await Promise.race([work,new Promise((resolve,reject)=>{cleanupTimer=Reflect.apply(set,globalThis,[()=>reject(new Error("CURRENT_FOOTPRINT_COPY_CACHE_CLEANUP_DEADLINE")),1000]);})]);}finally{if(cleanupTimer!==undefined)Reflect.apply(clear,globalThis,[cleanupTimer]);Reflect.apply(held.release,held.reader,[]);}};
const readCacheSource=async()=>{
 const optional=(o,k)=>{const d=descriptor(o,k);if(d===undefined){if(k in o)bad();return undefined;}if(!Object.hasOwn(d,"value"))bad();return d.value;};
 const integer=v=>{if(!Number.isSafeInteger(v)||Object.is(v,-0)||v<0)bad();return v;};
 const rosters=[];
 const roster=o=>{const names=Reflect.ownKeys(o);if(names.length>4096||names.some(k=>typeof k!=="string"))bad();rosters.push([o,names]);return names;};
 const boundedText=(v,limit)=>{if(typeof v!=="string"||v.length>limit||!v.isWellFormed())bad();return v;};
 const actor=v=>{plain(v);const keys=roster(v);if(keys.length!==3||keys.some(k=>!["uuid","username","nickname"].includes(k)))bad();const uuid=boundedText(own(v,"uuid"),32);if(!/^[a-f0-9]{32}$/.test(uuid))bad();return{uuid,username:boundedText(own(v,"username"),4096),nickname:boundedText(own(v,"nickname"),4096)};};
 const mapPrototype=own(own(globalThis,"Map"),"prototype"),get=own(mapPrototype,"get"),entries=own(mapPrototype,"entries");
 const map=o=>{if(proto(o)!==mapPrototype||Reflect.ownKeys(o).length!==0)bad();return o;};
 const documents=map(own(consistency,"wDocData")),rows=map(Reflect.apply(get,documents,[footprintUuid]));
 const sizeDescriptor=descriptor(mapPrototype,"size");if(!sizeDescriptor||typeof sizeDescriptor.get!=="function")bad();const rowCount=Reflect.apply(sizeDescriptor.get,rows,[]);if(rowCount<2||rowCount>4097)bad();
 const snapshot=Array.from(Reflect.apply(entries,rows,[]));if(snapshot.length!==rowCount)bad();
 const cache=object(own(project,"cache"));
 const cacheProto=proto(cache),cacheConstructor=own(cacheProto,"constructor");
 if(typeof cacheConstructor!=="function"||own(cacheConstructor,"name")!=="bb"||own(cacheConstructor,"prototype")!==cacheProto||proto(cacheProto)!==Object.prototype||own(cache,"cacheName")!=="project_"+projectUuid+"_v6")bad();
 const storage=own(cache,"cache"),nativeCachePrototype=own(own(globalThis,"Cache"),"prototype");
 if(proto(storage)!==nativeCachePrototype)bad();const match=own(nativeCachePrototype,"match");
 const responsePrototype=own(own(globalThis,"Response"),"prototype"),bodyDescriptor=descriptor(responsePrototype,"body");
 if(!bodyDescriptor||typeof bodyDescriptor.get!=="function"||bodyDescriptor.set!==undefined)bad();
 const streamPrototype=own(own(globalThis,"ReadableStream"),"prototype"),getReader=own(streamPrototype,"getReader");
 const readerPrototype=own(own(globalThis,"ReadableStreamDefaultReader"),"prototype"),read=own(readerPrototype,"read"),cancel=own(readerPrototype,"cancel"),release=own(readerPrototype,"releaseLock");
 const Decoder=own(globalThis,"TextDecoder"),decoderPrototype=own(Decoder,"prototype"),decode=own(decoderPrototype,"decode");
 const intrinsicValues=[match,bodyDescriptor.get,getReader,read,cancel,release,Decoder,decode,own(globalThis,"Uint8Array")];if(intrinsicValues.some((value,index)=>value!==methodValues[index+5]))bad();const bytePrototype=own(methodValues[13],"prototype");
 const stable=()=>{check();for(const [o,keys]of rosters){const now=Reflect.ownKeys(o);if(now.length!==keys.length||now.some((key,index)=>key!==keys[index]))bad();}if(Reflect.apply(get,documents,[footprintUuid])!==rows||Reflect.apply(sizeDescriptor.get,rows,[])!==rowCount)bad();const now=Array.from(Reflect.apply(entries,rows,[]));if(now.length!==snapshot.length||now.some((v,i)=>v[0]!==snapshot[i][0]||v[1]!==snapshot[i][1]))bad();};
 const header=plain(own(plain(own(consistency,"docHead")),footprintUuid));
 if(own(header,"docType")!=="FOOTPRINT"||own(header,"uuid")!==footprintUuid||own(globalThis,"PRO_EDITOR_VERSION")!=="3.2.209")bad();
 roster(header);roster(metadata);
 const headerTime=integer(own(header,"updateTime")),headerVersion=own(header,"version"),headerTicket=integer(own(header,"ticket")),headerUser=actor(own(header,"user")),editVersion=own(header,"editVersion");
 if(headerTime===0||!boundedText(headerVersion,512)||!boundedText(editVersion,64))bad();
 const metaTicket=integer(own(metadata,"ticket")),metaTime=integer(own(metadata,"updateTime")),metaVersion=own(metadata,"version"),metaUser=actor(own(metadata,"modifier"));
 if(metaTime===0||!boundedText(metaVersion,512))bad();
 const originalTags=own(metadata,"tags");if(!Array.isArray(originalTags)||proto(originalTags)!==Array.prototype)bad();const tagsLength=integer(own(originalTags,"length"));if(tagsLength>256||roster(originalTags).length!==tagsLength+1)bad();const tags=[];for(let i=0;i<tagsLength;i++)tags.push(boundedText(own(originalTags,String(i)),512));
 const meta={title:boundedText(own(metadata,"title"),512),description:boundedText(own(metadata,"description"),65536),tags,source:boundedText(own(metadata,"source"),4096)};
 const head=(ticket,time,version,user,edit)=>JSON.stringify({type:"DOCHEAD",ticket})+"||"+JSON.stringify({docType:"FOOTPRINT",client,uuid:footprintUuid,updateTime:time,version,editVersion:edit,user});
 const selectedNodes=[];
 for(const [id,linkValue]of snapshot){if(typeof id!=="string"||id.length>256)bad();const link=plain(linkValue),node=plain(own(link,"last")),type=own(node,"dataType");roster(link);roster(node);
  if(type==="META"){if(id!=="META")bad();continue;}
  if(!["CANVAS","PAD","LINE","NET"].includes(type))bad();
  const ticket=integer(own(node,"ticket")),actualId=optional(node,"actualId"),data=optional(node,"data"),list=optional(link,"list");
  let first=node;if(list!==undefined){if(!Array.isArray(list)||proto(list)!==Array.prototype)bad();const n=integer(own(list,"length"));if(n>4096||roster(list).length!==n+1)bad();if(n)first=plain(own(list,"0"));}roster(first);
  const firstTicket=optional(first,"firstTicket")??own(first,"ticket");integer(firstTicket);
  if(actualId!==undefined&&(typeof actualId!=="string"||!actualId||actualId.length>256))bad();
  const row={id:actualId||id,type,ticket,firstTicket,data};
  if(data===undefined){const hId=own(node,"hId"),hNum=integer(own(node,"hNum")),dNum=integer(optional(node,"dNum")??0),start=integer(own(node,"start"));if(typeof hId!=="string"||!/^[a-f0-9]{32}$/.test(hId)||hNum>1000000||dNum>1000000||start>8388608)bad();row.cacheKey="https://client/dataStr/"+hId+(hNum?"-"+hNum:"")+"-FOOTPRINT"+(dNum?"-"+dNum:"");row.start=start;}
  else if(typeof data!=="string")bad();selectedNodes.push(row);
 }
 if(selectedNodes.length<1||selectedNodes.length>4096)bad();
 const chunks=new Map(),wanted=new Map();let bytes=0,scanned=0,streamReads=0;
 for(const node of selectedNodes)if(node.data===undefined){if(!wanted.has(node.cacheKey))wanted.set(node.cacheKey,new Set());wanted.get(node.cacheKey).add(node.start);}
 for(const node of selectedNodes){if(node.data!==undefined||chunks.has(node.cacheKey))continue;if(chunks.size>=64)bad();stable();const response=await Reflect.apply(match,storage,[node.cacheKey]);stable();if(response===undefined)throw new Error("CURRENT_FOOTPRINT_COPY_CACHE_MISS");if(proto(response)!==responsePrototype)bad();const stream=Reflect.apply(bodyDescriptor.get,response,[]);if(proto(stream)!==streamPrototype)bad();const input=Reflect.apply(getReader,stream,[]);if(proto(input)!==readerPrototype)bad();activeCacheReader={reader:input,cancel,release};const decoder=new Decoder("utf-8",{fatal:true});if(proto(decoder)!==decoderPrototype)bad();let text="",finished=false;
  try{for(;;){if(++streamReads>4096)bad();if(streamReads%16===0){await new Promise(resolve=>Reflect.apply(set,globalThis,[resolve,0]));stable();}stable();const part=await Reflect.apply(read,input,[]);stable();exact(part,["value","done"]);const done=own(part,"done"),value=own(part,"value");if(typeof done!=="boolean")bad();if(value!==undefined){if(Object.getPrototypeOf(value)!==bytePrototype)bad();bytes+=value.byteLength;if(bytes>8388608)bad();text+=Reflect.apply(decode,decoder,[value,{stream:true}]);}if(done){text+=Reflect.apply(decode,decoder,[]);finished=true;break;}}}
  finally{if(!finished)await abortCacheReader();else if(activeCacheReader!==null){activeCacheReader=null;Reflect.apply(release,input,[]);}}
  stable();if(!text||!text.isWellFormed())bad();const index=new Map(),offsets=wanted.get(node.cacheKey);let cursor=0,doc=null;
  while(cursor<text.length){if(++scanned>65536)bad();if(scanned%128===0){await new Promise(resolve=>Reflect.apply(set,globalThis,[resolve,0]));stable();}const stop=text.indexOf("|\n",cursor),end=stop<0?text.length:stop,separator=text.indexOf("||",cursor);if(separator<cursor||separator>=end)bad();const h=JSON.parse(text.slice(cursor,separator)),body=text.slice(separator+2,end);if(h.type==="DOCHEAD"){const d=JSON.parse(body);doc=d.uuid;if(d.docType!=="FOOTPRINT")bad();}if(offsets.has(separator+2))index.set(separator+2,{doc,header:h,body});cursor=end+2;}
  if(index.size!==offsets.size)bad();chunks.set(node.cacheKey,index);
 }
 const content=[head(maximumTicket+1,metaTime,metaVersion,metaUser,"3.2.209"),JSON.stringify({type:"META",ticket:metaTicket,id:"META"})+"||"+JSON.stringify(meta),head(headerTicket,headerTime,headerVersion,headerUser,editVersion)];
 let contentLength=content.reduce((sum,line)=>sum+line.length+2,0);
 for(const node of selectedNodes){let data=node.data;if(data===undefined){const record=chunks.get(node.cacheKey)?.get(node.start);if(record===undefined||record.doc!==footprintUuid||record.header.type!==node.type||record.header.id!==node.id||record.header.ticket!==node.ticket)bad();data=record.body;}
  if(typeof data!=="string"||contentLength+data.length>2097152||!data.startsWith("{")||!data.endsWith("}"))bad();const parsed=JSON.parse(data);if(parsed===null||typeof parsed!=="object"||Array.isArray(parsed))bad();
  const atom={type:node.type,ticket:node.ticket,id:node.id};if(node.firstTicket!==node.ticket)atom.firstTicket=node.firstTicket;const line=JSON.stringify(atom)+"||"+data;contentLength+=line.length+2;if(contentLength>2097152)bad();content.push(line);
 }
 stable();cacheRead={keys:chunks.size,bytes,atoms:selectedNodes.length};return content.join("|\n");
};
`;

function replaceOnce(source: string, before: string, after: string): string {
  const parts = source.split(before);
  if (parts.length !== 2) { throw new Error("FOOTPRINT_CACHE_SOURCE_TEMPLATE"); }
  return parts.join(after);
}
let program = replaceOnce(CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION, '"use strict";', `"use strict";${reader}`);
program = replaceOnce(program, 'own(methods,"length")!==5||Reflect.ownKeys(methods).length!==6', 'own(methods,"length")!==14||Reflect.ownKeys(methods).length!==15');
program = replaceOnce(program, 'index<5;index++', 'index<14;index++');
program = replaceOnce(program, "const raw=await Reflect.apply(getStr,this,[footprintUuid]);", "const raw={success:true,result:await readCacheSource()};");
program = replaceOnce(program, 'route:"native-get-str",sourceGetterDispatched:true', 'route:"native-cache-equivalent",sourceGetterDispatched:false');
program = replaceOnce(program, "cacheEffectsPossible:true", "cacheEffectsPossible:false,cacheRead,cacheWrites:0,networkRequests:0");
program = replaceOnce(program, 'finally{if(timer!==undefined)Reflect.apply(clear,globalThis,[timer]);}',
  'finally{if(timer!==undefined)Reflect.apply(clear,globalThis,[timer]);await abortCacheReader();}');
export const CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION = program;

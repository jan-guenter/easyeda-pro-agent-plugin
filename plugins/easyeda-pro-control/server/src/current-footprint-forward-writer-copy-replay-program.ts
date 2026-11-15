/** Full-copy pre-du projection only. The receiver is the original retained
 * local six-tuple; it invokes no parser, cache, timer or app method. The
 * original native owner must bind that tuple and exact held syncMerged. */
import { sha256Text } from "./core.ts";
import { CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE } from "./current-footprint-copy-create-source.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_SET_DOCTYPE_SOURCE = 'setDoctype(e,t){this.docHead[e]?this.docHead[e].docType=t:this.docHead[e]={docType:t}}';
const setDoctypePin = CURRENT_FOOTPRINT_COPY_CREATE_SOURCE_PROFILE.worker.spans.setDoctype;
if (Buffer.byteLength(CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_SET_DOCTYPE_SOURCE) !== setDoctypePin.bytes || sha256Text(CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_SET_DOCTYPE_SOURCE) !== setDoctypePin.sha256) { throw new Error("FORWARD_COPY_REPLAY_SET_DOCTYPE_SOURCE"); }
export const CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_REPLAY_PROGRAM = String.raw`function(merged){"use strict";
const bad=()=>{throw new Error("FORWARD_COPY_REPLAY_ORIGINAL");},descriptors=[],parents=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();descriptors.push([o,k,d]);return d.value;};
const optional=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){if(k in o)bad();return undefined;}return own(o,k);};
const proto=o=>{const p=Object.getPrototypeOf(o);parents.push([o,p]);return p;};
const plain=o=>{if(o===null||typeof o!=="object"||proto(o)!==Object.prototype)bad();return o;};
const array=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let j=0;j<n;j++)own(o,String(j));};
const native=(f,name,n)=>{if(typeof f!=="function"||own(f,"name")!==name||own(f,"length")!==n||Function.prototype.toString.call(f)!=="function "+name+"() { [native code] }")bad();return f;};
const get=native(own(Map.prototype,"get"),"get",1),entries=native(own(Map.prototype,"entries"),"entries",0),sizeDescriptor=Object.getOwnPropertyDescriptor(Map.prototype,"size");
if(!sizeDescriptor||Object.hasOwn(sizeDescriptor,"value"))bad();const size=native(own(sizeDescriptor,"get"),"get size",0),parse=native(own(JSON,"parse"),"parse",2),split=native(own(String.prototype,"split"),"split",2);
const map=o=>{if(proto(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
array(this,6);array(merged,10);const p=own(this,"0"),r=own(this,"2"),pair=own(this,"1"),body=own(this,"5");array(pair,2);
if(own(globalThis,"PROJECT")!==p||own(p,"consistencyManager")!==r||own(merged,"0")!==p||own(pair,"0")!==own(this,"3")||own(pair,"1")!==own(this,"4")||typeof body!=="string"||body.length<1||body.length>=10000||!body.isWellFormed()||own(this,"3")+"|\n"+own(this,"4")!==body)bad();
const parts=Reflect.apply(split,body,["|\n"]);if(parts.length<3||parts.length>515)bad();const atoms=[],heads=[];
for(let j=0;j<parts.length;j++){const raw=own(parts,String(j)),at=raw.indexOf("||");if(at<=0)bad();const h=plain(Reflect.apply(parse,JSON,[raw.slice(0,at)])),text=raw.slice(at+2);if(own(h,"type")==="DOCHEAD"){if(j!==0&&j!==2)bad();const d=plain(Reflect.apply(parse,JSON,[text]));if(own(d,"docType")!=="FOOTPRINT"||!/^[a-f0-9]{16}$/.test(own(d,"uuid"))||typeof own(d,"updateTime")!=="number"||!Number.isSafeInteger(own(d,"updateTime"))||own(d,"updateTime")<=0||own(d,"version")!==String(own(d,"updateTime"))||own(d,"editVersion")!=="3.2.209")bad();heads.push([h,d]);}else{if(j===0||j===2)bad();const id=own(h,"id"),type=own(h,"type"),ticket=own(h,"ticket");if(typeof id!=="string"||!id||typeof type!=="string"||!Number.isSafeInteger(ticket)||ticket<0||Reflect.ownKeys(h).length!==3||!["type","ticket","id"].every(k=>Object.hasOwn(h,k)))bad();atoms.push([id,type,ticket,text]);}}
if(heads.length!==2||atoms.filter(atom=>atom[1]==="META").length!==2)bad();const first=heads[0],second=heads[1],uuid=own(first[1],"uuid"),later=own(second[1],"updateTime")>own(first[1],"updateTime");
if(own(second[1],"uuid")!==uuid||own(second[1],"client")!==own(first[1],"client")||own(second[1],"updateTime")<own(first[1],"updateTime")||own(second[0],"ticket")!==own(first[0],"ticket")+1||own(r,"maxTicket")!==own(second[0],"ticket"))bad();
const current=plain(own(plain(own(r,"docHead")),uuid)),expected=later?second:first;
for(const k of["docType","uuid","updateTime","version","editVersion"])if(own(current,k)!==own(expected[1],k))bad();
if(Object.getOwnPropertyDescriptor(current,"ticket")!==undefined||"ticket" in current||Reflect.ownKeys(current).length!==7||own(current,"client")!==uuid)bad();
if(Function.prototype.toString.call(own(Object.getPrototypeOf(r),"setDoctype"))!==${JSON.stringify(CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_SET_DOCTYPE_SOURCE)})bad();
const actor=plain(own(current,"user"));if(Reflect.ownKeys(actor).length!==3||own(actor,"uuid")!==undefined||own(actor,"username")!==undefined||own(actor,"nickname")!==undefined)bad();
const wanted=new Map();for(const atom of atoms){const id=atom[0],type=atom[1],key=type==="NET"||type==="RULE_SELECTOR"?id.toUpperCase():id,old=wanted.get(key);if(old){if(id!=="META"||type!=="META"||atom[2]>=old[2]||old[2]!==own(first[0],"ticket"))bad();}else wanted.set(key,atom);}
const docs=map(own(r,"wDocData")),rows=map(Reflect.apply(get,docs,[uuid])),snapshot=Array.from(Reflect.apply(entries,rows,[]));if(snapshot.length!==wanted.size||Reflect.apply(size,rows,[])!==wanted.size)bad();
for(const[key,atom]of wanted){const id=atom[0],type=atom[1],link=plain(Reflect.apply(get,rows,[key])),node=plain(own(link,"last"));if(own(node,"dataType")!==type||own(node,"ticket")!==atom[2]||own(node,"data")!==atom[3]||optional(node,"pend")!==undefined||optional(node,"unique")!==undefined)bad();const actualId=optional(node,"actualId");if(type==="NET"||type==="RULE_SELECTOR"){if(actualId!==id)bad();}else if(actualId!==undefined)bad();}
for(const[o,parent]of parents)if(Object.getPrototypeOf(o)!==parent)bad();for(const[o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||n.value!==d.value||n.writable!==d.writable||n.enumerable!==d.enumerable||n.configurable!==d.configurable)bad();}
const now=Array.from(Reflect.apply(entries,rows,[]));if(now.length!==snapshot.length||now.some((row,j)=>row[0]!==snapshot[j][0]||row[1]!==snapshot[j][1])||Reflect.apply(get,docs,[uuid])!==rows)bad();return true;}`;

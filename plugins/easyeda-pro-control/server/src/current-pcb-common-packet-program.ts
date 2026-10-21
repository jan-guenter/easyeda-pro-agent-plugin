/** Versioned, fixed own-data graph packets. Every call creates a fresh packet;
 * no remote packet, iterator or model from an earlier call is mutated. Source
 * data is rechecked in bounded final passes, not claimed atomic across awaits.
 * The original scope/packet handles must be retained by a native owner. These
 * constants alone authorize no transport, snapshot, writer or Save.
 */
import { CURRENT_PCB_COMMON_BOUNDED_GRAPH_PROGRAM, CURRENT_PCB_COMMON_GRAPH_CLASSES } from "./current-pcb-common-graph.ts";
import { CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, CURRENT_PCB_COMMON_PRESENTATION_FUNCTION,
  CURRENT_PCB_COMMON_RULES_FUNCTION } from "./current-pcb-common-state.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION } from "./current-pcb-diagnostic-model-program.ts";

export const CURRENT_PCB_COMMON_PACKET_MAX_STEPS = 512;
export const CURRENT_PCB_COMMON_PACKET_MAX_TEXT_BYTES = 262_144;

const SUPPORT = `
const fail=()=>{throw new Error("PCB_COMMON_PACKET");};
const data=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))fail();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))fail();return d.value;};
const tick=Date.now,start=Reflect.apply(tick,Date,[]);
if(typeof tick!=="function"||!Number.isSafeInteger(start)||start<0)fail();
const budget=()=>{if(Date.now!==tick)fail();const n=Reflect.apply(tick,Date,[]);if(!Number.isSafeInteger(n)||n<start||n-start>1000)fail();};
for(const base of [Object.prototype,Array.prototype]){let p=base,depth=0;while(p!==null){if(++depth>16||Object.getOwnPropertyDescriptor(p,"toJSON")!==undefined)fail();p=Object.getPrototypeOf(p);}}
const keys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(x=>typeof x!=="string"))fail();return k;};
const collection=(o,p)=>{budget();if(Object.getPrototypeOf(o)!==p||keys(o).length!==0)fail();const d=Object.getOwnPropertyDescriptor(p,"size");if(!d||typeof d.get!=="function"||d.set!==undefined)fail();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)fail();const entries=[];Reflect.apply(data(p,"forEach"),o,[(value,key)=>{entries.push([key,value]);}]);if(entries.length!==n)fail();return entries;};
const sameCollection=(o,p,expected)=>{const now=collection(o,p);if(now.length!==expected.length)fail();for(let i=0;i<now.length;i++){if(!Object.is(now[i][0],expected[i][0])||!Object.is(now[i][1],expected[i][1]))fail();}budget();};
const sameDescriptor=(o,k,d)=>{const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,"value")||!Object.is(n.value,d.value)||n.enumerable!==d.enumerable||n.configurable!==d.configurable||n.writable!==d.writable)fail();};
const sameKeys=(o,p,k)=>{if(Object.getPrototypeOf(o)!==p)fail();const n=Reflect.ownKeys(o);if(n.length!==k.length)fail();for(let i=0;i<n.length;i++)if(n[i]!==k[i])fail();};
const utf8=s=>{budget();const nonAscii=s.match(/[^\\x00-\\x7f]/gu);if(nonAscii===null)return s.length;let n=s.length;for(let i=0;i<nonAscii.length;i++){if(i%256===0)budget();const c=nonAscii[i];n+=c.length===2||c.charCodeAt(0)>=2048?2:1;}budget();return n;};
const makePacket=(state,events,roots)=>{budget();state.eventText=JSON.stringify(events);const value={schema:"easyeda-pro-control.pcb-common-chunk.v1",sequence:state.sequence,phase:state.phase,sourceSchema:state.sourceSchema,documentUuid:state.documentUuid,nodes:state.objects.length,fields:state.fields,stringUnits:state.stringUnits,records:state.recordCount,events,roots};const json=JSON.stringify(value);if(json.length>262144||utf8(json)>262144)fail();budget();return{json,state};};
const rootCheck=s=>{budget();if((${CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION})!==s.callback)fail();for(const r of s.held)sameDescriptor(r[0],r[1],r[2]);sameKeys(s.constructorTuple,Array.prototype,s.constructorKeys);for(const r of s.absent)if(Object.getOwnPropertyDescriptor(r[0],r[1]))fail();for(const r of s.prototypes)if(Object.getPrototypeOf(r[0])!==r[1])fail();for(const r of s.collections)sameCollection(r[0],r[1],r[2]);budget();};
`;

const SEED = `
${SUPPORT}
const seedCollections=[];let seedFields=0,seedStringUnits=0;
const graphString=v=>{if(typeof v!=="string"||v.length>4096||!v.isWellFormed()||(seedStringUnits+=v.length)>131072)bad();return v;};
const graphCollection=(o,p)=>{const entries=collection(o,p);if((seedFields+=entries.length*2)>32768)bad();seedCollections.push([o,p,entries]);return entries;};
const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const graphValue=v=>v;
const finish=(sourceSchema,roots)=>{
verifyConstructorAssociations();const classes=${JSON.stringify(CURRENT_PCB_COMMON_GRAPH_CLASSES)}.map(n=>[n,own(klass(n),"prototype")]);
const objects=[],tokens=[];for(const r of roots){const v=r[1];let value;if(v===null)value=["null"];else if(v===undefined)value=["undefined"];else if(typeof v==="string")value=["string",graphString(v)];else if(typeof v==="boolean")value=["boolean",v];else if(typeof v==="number"){if(!Number.isFinite(v))bad();value=["number",Object.is(v,-0)?"-0":String(v)];}else{if(typeof v!=="object")bad();let i=objects.indexOf(v);if(i<0){i=objects.length;objects.push(v);}value=["ref",i];}tokens.push([r[0],value]);}
const held=retained.map(r=>{const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,"value")||!Object.is(d.value,r[2]))bad();return[r[0],r[1],d];});
const state={sourceSchema,documentUuid,callback:originalCallback,held,constructorTuple:constructors,constructorKeys,absent,prototypes:seedPrototypes.concat(constructorHeld.map(r=>[r[0],r[1]])),collections:seedCollections,classes,objects,roots:tokens,
sequence:0,phase:"capture",next:0,pending:null,fields:seedFields,stringUnits:seedStringUnits,jsonChecks:0,recordCount:0,records:[],history:null,verifyPacket:null,verifyIndex:0};
rootCheck(state);return makePacket(state,[],tokens);};
`;

function seed(source: string, bodyMarker: string): string {
  const body = source.indexOf(bodyMarker), graph = source.indexOf(CURRENT_PCB_COMMON_BOUNDED_GRAPH_PROGRAM);
  if (graph === -1 || body <= graph || source.includes(bodyMarker, body + 1) || !source.endsWith("}")) {
    throw new Error("PCB_COMMON_PACKET_SEED_SOURCE");
  }
  const prefix = source.slice(0, graph);
  const original = 'const instance=(o,n)=>{object(o);if(Object.getPrototypeOf(o)!==own(klass(n),"prototype"))bad();return o;};';
  if (prefix.split(original).length !== 2) { throw new Error("PCB_COMMON_PACKET_SEED_INSTANCE"); }
  return `${prefix.replace(original, 'const seedPrototypes=[];const instance=(o,n)=>{object(o);const p=own(klass(n),"prototype");if(Object.getPrototypeOf(o)!==p)bad();seedPrototypes.push([o,p]);return o;};')}${SEED}${source.slice(body)}`;
}

/** Fixed source-derived roots; no caller root, property, chunk size or program. */
export const CURRENT_PCB_COMMON_PACKET_SEEDS = Object.freeze({
  presentation: seed(CURRENT_PCB_COMMON_PRESENTATION_FUNCTION, '\nnoOwnPublic(env,["origin"'),
  rules: seed(CURRENT_PCB_COMMON_RULES_FUNCTION, '\nconst rules=instance('),
  preference: seed(CURRENT_PCB_COMMON_PREFERENCE_FUNCTION, '\nconst config=instance('),
});

/** Invoke on the preceding original packet. Each packet contains only its own
 * capture records and a link; it never clones the accumulated graph. Only the
 * bounded identity-reference vector is copied by the native Array concat.
 * Collection iterators are created and consumed in the same effect-checked call.
 */
export const CURRENT_PCB_COMMON_PACKET_ADVANCE = `function(){"use strict";${SUPPORT}
const previous=data(this,"state");if(!previous||previous.phase==="complete"||previous.sequence>=511)fail();rootCheck(previous);
const records=[],events=[],objects=previous.objects.concat([]);
const s={sourceSchema:previous.sourceSchema,documentUuid:previous.documentUuid,callback:previous.callback,held:previous.held,constructorTuple:previous.constructorTuple,constructorKeys:previous.constructorKeys,absent:previous.absent,prototypes:previous.prototypes,collections:previous.collections,classes:previous.classes,objects,roots:previous.roots,
sequence:previous.sequence+1,phase:previous.phase,next:previous.next,pending:previous.pending,fields:previous.fields,stringUnits:previous.stringUnits,jsonChecks:previous.jsonChecks,recordCount:previous.recordCount,records,history:previous,verifyPacket:previous.verifyPacket,verifyIndex:previous.verifyIndex};
let work=0,nodes=0;const stringStart=s.stringUnits;
const hold=r=>{if(++s.recordCount>73728)fail();records.push(r);};
const string=v=>{if(typeof v!=="string"||v.length>4096||!v.isWellFormed()||(s.stringUnits+=v.length)>131072)fail();return v;};
const scalar=v=>{if(v===null)return["null"];if(v===undefined)return["undefined"];if(typeof v==="boolean")return["boolean",v];if(typeof v==="string")return["string",string(v)];if(typeof v==="number"){if(!Number.isFinite(v))fail();return["number",Object.is(v,-0)?"-0":String(v)];}if(typeof v!=="object")fail();let i=objects.indexOf(v);if(i<0){if(objects.length>=4096)fail();i=objects.length;objects.push(v);}return["ref",i];};
const ownField=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value")||++s.fields>32768)fail();hold(["field",o,k,d]);return d;};
const jsonAbsent=o=>{let depth=0;while(o!==null){budget();if(++depth>16||++s.jsonChecks>32768)fail();const d=Object.getOwnPropertyDescriptor(o,"toJSON");if(d!==undefined){hold(["json",o,true]);return false;}const p=Object.getPrototypeOf(o);hold(["json",o,false,p]);o=p;}return true;};
if(s.phase==="capture"){
if(s.next===0&&s.pending===null){if(!jsonAbsent(Object.prototype)||!jsonAbsent(Array.prototype))fail();}
while(work<256&&nodes<64&&s.stringUnits-stringStart<8192){budget();
let n=s.pending;
if(n===null){if(s.next===objects.length)break;const o=objects[s.next],p=Object.getPrototypeOf(o);let kind,className=null,roster=null,entries=null,length,absence=null;
if(p===Map.prototype||p===Set.prototype){kind=p===Map.prototype?"map":"set";entries=collection(o,p);length=entries.length;if((s.fields+=length*2)>32768)fail();hold(["collection",o,p,entries]);}
else if(Array.isArray(o)){kind="array";if(p!==Array.prototype)fail();roster=keys(o);length=ownField(o,"length").value;if(!Number.isSafeInteger(length)||length<0||length>4096||roster.length!==length+1||roster[length]!=="length")fail();for(let i=0;i<length;i++)if(roster[i]!==String(i))fail();hold(["roster",o,p,roster]);absence=jsonAbsent(o);}
else{kind="object";className=p===null?"null":p===Object.prototype?"plain":null;if(className===null){const matches=s.classes.filter(r=>r[1]===p);if(matches.length!==1)fail();className=matches[0][0];}roster=keys(o);length=roster.length;hold(["roster",o,p,roster]);absence=jsonAbsent(o);}
n={o,index:s.next,kind,className,roster,entries,length,cursor:0};events.push(["node",n.index,kind,className,length,absence]);nodes++;work++;
}
let cursor=n.cursor;
while(cursor<n.length&&work<256&&s.stringUnits-stringStart<8192){budget();
if(n.kind==="object"){const k=n.roster[cursor],d=ownField(n.o,k);events.push(["field",n.index,string(k),scalar(d.value),d.enumerable]);work++;}
else if(n.kind==="array"){const d=ownField(n.o,String(cursor));events.push(["item",n.index,scalar(d.value)]);work++;}
else if(n.kind==="map"){const pair=n.entries[cursor];events.push(["entry",n.index,scalar(pair[0]),scalar(pair[1])]);work+=2;}
else{events.push(["member",n.index,scalar(n.entries[cursor][0])]);work+=2;}cursor++;
}
if(cursor===n.length){events.push(["end",n.index]);s.next++;s.pending=null;}else{s.pending={o:n.o,index:n.index,kind:n.kind,className:n.className,roster:n.roster,entries:n.entries,length:n.length,cursor};break;}
}
if(s.pending===null&&s.next===objects.length){s.phase="verify";s.verifyPacket=s;s.verifyIndex=0;}
}else{
let packet=s.verifyPacket,index=s.verifyIndex;
while(work<256&&packet!==null){budget();if(index===packet.records.length){packet=packet.history;index=0;continue;}
const r=packet.records[index++];if(r[0]==="field")sameDescriptor(r[1],r[2],r[3]);else if(r[0]==="roster")sameKeys(r[1],r[2],r[3]);else if(r[0]==="collection")sameCollection(r[1],r[2],r[3]);else if(r[0]==="json"){const present=Object.getOwnPropertyDescriptor(r[1],"toJSON")!==undefined;if(present!==r[2]||!present&&Object.getPrototypeOf(r[1])!==r[3])fail();}else fail();work++;
}
s.verifyPacket=packet;s.verifyIndex=index;if(packet===null)s.phase="complete";
}
rootCheck(s);budget();return makePacket(s,events,null);}`;

/** Separate fixed read avoids enumerating or publishing any private packet refs. */
export const CURRENT_PCB_COMMON_PACKET_READ = `function(){"use strict";const d=Object.getOwnPropertyDescriptor(this,"json");if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="string"||d.value.length>262144)throw new Error("PCB_COMMON_PACKET");return d.value;}`;

/** This final native serialization walks only packet-owned JSON data, never
 * model fields. It preserves the historical depth-first node numbering and
 * rejects the same depth/size bounds. The native owner may issue it once only
 * after its original packet transcript reaches complete; it is not a new read.
 */
export const CURRENT_PCB_COMMON_PACKET_RESULT = `function(){"use strict";${SUPPORT}
const s=data(this,"state");if(!s||s.phase!=="complete")fail();rootCheck(s);
const history=[];let p=s;while(p!==null){budget();if(history.length>=512)fail();history.push(p);p=p.history;}
const nodes=[],lengths=[];let active=-1,work=0;
for(let i=history.length-1;i>=0;i--){budget();const events=JSON.parse(history[i].eventText);for(const e of events){if(++work%256===0)budget();
if(e[0]==="node"){if(active!==-1||e[1]!==nodes.length)fail();active=e[1];lengths.push(e[4]);if(e[2]==="object")nodes.push({kind:"object",className:e[3],fields:[],enumerableKeys:[],jsonToJSONAbsent:e[5]});else if(e[2]==="array")nodes.push({kind:"array",values:[],jsonToJSONAbsent:e[5]});else if(e[2]==="map")nodes.push({kind:"map",entries:[]});else if(e[2]==="set")nodes.push({kind:"set",values:[]});else fail();}
else{if(active!==e[1]||active<0)fail();const n=nodes[active];if(e[0]==="field"&&n.kind==="object"){n.fields.push([e[2],e[3]]);if(e[4])n.enumerableKeys.push(e[2]);}
else if(e[0]==="item"&&n.kind==="array"||e[0]==="member"&&n.kind==="set")n.values.push(e[2]);
else if(e[0]==="entry"&&n.kind==="map")n.entries.push([e[2],e[3]]);
else if(e[0]==="end"){const length=n.kind==="object"?n.fields.length:n.kind==="map"?n.entries.length:n.values.length;if(length!==lengths[active])fail();active=-1;}else fail();}
}}
if(active!==-1||nodes.length!==s.objects.length)fail();const output=[],seen=new Map();
const value=(v,depth=0)=>{budget();if(depth>32)fail();if(v[0]!=="ref")return v;const source=v[1];if(seen.has(source))return["ref",seen.get(source)];const n=nodes[source];if(!n)fail();const index=output.length;seen.set(source,index);output.push(null);let copy;
if(n.kind==="object")copy={kind:"object",className:n.className,fields:n.fields.map(e=>[e[0],value(e[1],depth+1)]),enumerableKeys:n.enumerableKeys,jsonToJSONAbsent:n.jsonToJSONAbsent};
else if(n.kind==="map")copy={kind:"map",entries:n.entries.map(e=>[value(e[0],depth+1),value(e[1],depth+1)])};
else if(n.kind==="set")copy={kind:"set",values:n.values.map(v=>value(v,depth+1))};
else copy={kind:"array",values:n.values.map(v=>value(v,depth+1)),jsonToJSONAbsent:n.jsonToJSONAbsent};output[index]=copy;return["ref",index];};
const roots=s.roots.map(r=>[r[0],value(r[1])]);if(output.length!==nodes.length)fail();rootCheck(s);
const text=JSON.stringify({schema:s.sourceSchema,documentUuid:s.documentUuid,pickedOwnerPublicShadowsAbsent:true,graph:{roots,nodes:output}});if(text.length>524288||utf8(text)>524288)fail();budget();return text;}`;

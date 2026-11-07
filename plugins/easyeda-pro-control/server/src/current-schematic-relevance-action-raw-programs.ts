/** Fixed descriptor snapshots of the original held display scene. The caller
 * must qualify actual non-Proxy references and native callees before use.
 * These programs invoke no application method/getter, action or setter. */
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION = "[Object,Reflect,Array,Map,Set]";
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_FIELDS = [
  [0, "getOwnPropertyDescriptor", "value", 2], [0, "getOwnPropertyDescriptors", "value", 1], [0, "getPrototypeOf", "value", 1], [0, "is", "value", 2],
  [0, "hasOwn", "value", 2], [1, "ownKeys", "value", 1], [1, "apply", "value", 3], [2, "isArray", "value", 1],
  [3, "get", "value", 1], [3, "has", "value", 1], [3, "forEach", "value", 1], [3, "size", "get", 0],
  [4, "has", "value", 1], [4, "forEach", "value", 1], [4, "size", "get", 0],
] as const;

/** Retained native functions are taken from correlated own data descriptors.
 * Array assignment is used only after both literal prototypes have no numeric
 * inherited setter. All later programs use these references, never globals. */
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_PROGRAM = String.raw`function(objectProto,arrayProto,mapProto,setProto,get,descriptors,proto,same,has,keys,apply,isArray,mapGet,mapHas,mapEach,mapSize,setHas,setEach,setSize){"use strict";
const bad=()=>{throw "SCH209_RAW_NATIVE";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};
if(!isArray(this)||own(this,"length")!==5||keys(this).length!==6||proto([])!==arrayProto||proto({})!==objectProto||proto(arrayProto)!==objectProto)bad();
const parents=[arrayProto,objectProto];for(let i=0;i<parents.length;i++){const list=keys(parents[i]);for(let j=0;j<list.length;j++){const key=list[j];if(typeof key==="string"&&key!==""&&+key>=0&&+key<4294967295&&""+(+key)===key)bad();}}
const objects=[own(this,0),own(this,1),own(this,2),mapProto,setProto],values=[get,descriptors,proto,same,has,keys,apply,isArray,mapGet,mapHas,mapEach,mapSize,setHas,setEach,setSize],rows=[[0,"getOwnPropertyDescriptor","value"],[0,"getOwnPropertyDescriptors","value"],[0,"getPrototypeOf","value"],[0,"is","value"],[0,"hasOwn","value"],[1,"ownKeys","value"],[1,"apply","value"],[2,"isArray","value"],[3,"get","value"],[3,"has","value"],[3,"forEach","value"],[3,"size","get"],[4,"has","value"],[4,"forEach","value"],[4,"size","get"]];
for(let i=0;i<rows.length;i++){const row=rows[i],d=get(objects[row[0]],row[1]);if(!d||own(d,row[2])!==values[i])bad();}
if(own(own(this,0),"prototype")!==objectProto||own(own(this,2),"prototype")!==arrayProto||own(own(this,3),"prototype")!==mapProto||own(own(this,4),"prototype")!==setProto)bad();values[15]=objectProto;values[16]=arrayProto;values[17]=mapProto;values[18]=setProto;return values;}`;

export const CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_COUNT = 24;
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_PROGRAM = String.raw`function(native){"use strict";
const get=native[0],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "SCH209_RAW_REFERENCES";};
const own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};
if(!isArray(this)||own(this,"length")!==2||keys(this).length!==3)bad();const b=own(this,0),state=own(this,1),before=own(state,"before"),tree=own(before,"tree");
if(own(state,"owner")!==this||own(state,"failed")!==false||own(state,"modifyAttempted")!==true||own(state,"modifyAcknowledged")!==false||own(state,"saveAttempted")!==false||!isArray(tree)||own(tree,"length")!==8||keys(tree).length!==9)bad();
const result=[own(before,"rootModel")];for(let i=0;i<8;i++)result[result.length]=own(own(tree,i),"model");
const fields=["page","shapes","ids","index","consistency","handler","host","metadata","tab","tabs","manager","ui","sch","runner"];for(let i=0;i<fields.length;i++)result[result.length]=own(b,fields[i]);
result[result.length]=own(before,"sourceMap");if(result.length!==24)bad();return result;}`;

/** Every input in this tuple has already passed correlated native metadata.
 * Further objects are returned without inspecting their properties. */
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_RELATED_PROGRAM = String.raw`function(native){"use strict";
const get=native[0],has=native[4],keys=native[5],bad=()=>{throw "SCH209_RAW_RELATED";};
const own=(o,k,optional=false)=>{const d=get(o,k);if(!d&&optional)return undefined;if(!d||!has(d,"value"))bad();return d.value;};
if(own(this,"length")!==24||keys(this).length!==25)bad();const models=[own(this,0)];for(let i=1;i<=8;i++)models[models.length]=own(this,i);
const result=[];for(let at=0;at<models.length;at++){const model=models[at];const children=own(model,"children",true);if(children!==undefined)result[result.length]=children;const points=own(model,"_points",true);if(points!==undefined)result[result.length]=points;const node=own(model,"connectionPointNode",true);if(node!==undefined)result[result.length]=node;
const fields=["_lines","_netNames","_customAttrMap","_unConnectDotModels"];for(let j=0;j<fields.length;j++){const value=own(model,fields[j],true);if(value!==undefined)result[result.length]=value;}}
const root=own(this,0),shapes=own(this,10),handler=own(this,14);result[result.length]=own(root,"invalidZIndexChildMap");result[result.length]=own(handler,"sourceCodeIdMap");result[result.length]=own(shapes,"netPointManager");if(result.length<12||result.length>32)bad();return result;}`;

/** Third-level point/node containers are selected only after their original
 * parent tuple has passed native non-Proxy metadata. */
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_DETAIL_PROGRAM = String.raw`function(native){"use strict";
const get=native[0],proto=native[2],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "SCH209_RAW_DETAILS";};
const own=(o,k,optional=false)=>{const d=get(o,k);if(!d&&optional)return undefined;if(!d||!has(d,"value"))bad();return d.value;};
const result=[],length=own(this,"length");if(length<12||length>32||keys(this).length!==length+1)bad();
for(let i=0;i<length;i++){const o=own(this,i);if(isArray(o)){const n=own(o,"length");if(n>8||keys(o).length!==n+1)bad();for(let j=0;j<n;j++){const value=own(o,j);if(value!==null&&typeof value==="object")result[result.length]=value;}}
const fields=["Wire","Bus","Pin","BusEntry","unConnectDotModels","junctionModels","netGroupLineUnConnectDotIdMap","netGroupLineJunctionIdMap"];for(let j=0;j<fields.length;j++){const value=own(o,fields[j],true);if(value!==undefined)result[result.length]=value;}}
if(result.length<8||result.length>32)bad();return result;}`;

/** One prototype level only. Each returned native metadata tuple must be
 * accepted before this program may inspect that next level. */
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_PROTOTYPES_PROGRAM = String.raw`function(native){"use strict";const get=native[0],proto=native[2],has=native[4],keys=native[5],bad=()=>{throw "SCH209_RAW_PROTOTYPES";};const d=get(this,"length");if(!d||!has(d,"value")||d.value>96||keys(this).length!==d.value+1)bad();const values=[];for(let i=0;i<d.value;i++){const slot=get(this,i);if(!slot||!has(slot,"value"))bad();const value=slot.value;values[values.length]=value===null?null:proto(value);}return values;}`;

/** A complete baseline includes descriptors of every supplied original own
 * field and prototype, plus native collection membership. Unknown data stays
 * opaque and must preserve its exact reference; it is never dereferenced. */
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_SNAPSHOT_PROGRAM = String.raw`function(native,layer0,layer1,layer2,layer3,layer4,layer5,layer6,layer7,layer8,layer9,layer10,layer11){"use strict";
const layers=[layer0,layer1,layer2,layer3,layer4,layer5,layer6,layer7,layer8,layer9,layer10,layer11];
const get=native[0],descriptors=native[1],proto=native[2],same=native[3],has=native[4],keys=native[5],apply=native[6],isArray=native[7],mapGet=native[8],mapHas=native[9],mapEach=native[10],mapSize=native[11],setHas=native[12],setEach=native[13],setSize=native[14],bad=()=>{throw "SCH209_RAW_SNAPSHOT";};
const slot=(o,k)=>{const d=get(o,k);if(!d)return undefined;if(!has(d,"value"))bad();return d.value;},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;},dense=(o,max)=>{if(!isArray(o))bad();const n=own(o,"length");if(n>max||keys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,i);return n;};
const all=[],objects=dense(this,96),depth=dense(layers,12);if(objects<24||depth<1)bad();for(let i=0;i<objects;i++)all[all.length]=own(this,i);
for(let i=0;i<depth;i++){const layer=own(layers,i);if(dense(layer,96)!==objects)bad();for(let j=0;j<objects;j++){const value=own(layer,j),previous=i===0?own(this,j):own(own(layers,i-1),j);if(value!==(previous===null?null:proto(previous)))bad();if(value!==null)all[all.length]=value;}}
for(let i=0;i<objects;i++)if(own(own(layers,depth-1),i)!==null)bad();
const entries=[];for(let i=0;i<all.length;i++){const value=all[i];let duplicate=false;for(let j=0;j<i;j++)if(all[j]===value){duplicate=true;break;}if(duplicate)continue;
const names=keys(value);if(names.length>256)bad();const ds=descriptors(value),list=[];for(let j=0;j<names.length;j++){const key=names[j],d=own(ds,key);if(i<objects&&!has(d,"value"))bad();list[list.length]=[key,has(d,"value"),slot(d,"value"),slot(d,"get"),slot(d,"set"),slot(d,"writable"),slot(d,"enumerable"),slot(d,"configurable")];}
let collection=null;try{const n=apply(mapSize,value,[]),rows=[];if(n>64)bad();apply(mapEach,value,[(v,k)=>{rows[rows.length]=[k,v];}]);collection=["map",rows];}catch(error){if(error==="SCH209_RAW_SNAPSHOT")throw error;try{const n=apply(setSize,value,[]),rows=[];if(n>64)bad();apply(setEach,value,[(v)=>{rows[rows.length]=v;}]);collection=["set",rows];}catch(inner){if(inner==="SCH209_RAW_SNAPSHOT")throw inner;}}
entries[entries.length]=[value,proto(value),list,collection];}
const guard=function(){for(let i=0;i<entries.length;i++){const entry=entries[i],value=entry[0],parent=entry[1],list=entry[2],collection=entry[3],names=keys(value);if(proto(value)!==parent||names.length!==list.length)bad();for(let j=0;j<list.length;j++){const item=list[j],key=item[0],d=get(value,key);if(names[j]!==key||!d||has(d,"value")!==item[1]||!same(slot(d,"value"),item[2])||!same(slot(d,"get"),item[3])||!same(slot(d,"set"),item[4])||slot(d,"writable")!==item[5]||slot(d,"enumerable")!==item[6]||slot(d,"configurable")!==item[7])bad();}
if(collection!==null){const rows=collection[1];if(collection[0]==="map"){if(apply(mapSize,value,[])!==rows.length)bad();let at=0;apply(mapEach,value,[(v,k)=>{const row=rows[at++];if(!row||!same(k,row[0])||!same(v,row[1]))bad();}]);}else{if(apply(setSize,value,[])!==rows.length)bad();let at=0;apply(setEach,value,[v=>{if(!same(v,rows[at++]))bad();}]);}}}return true;};
return[entries,guard];}`;

/** Merge only the three exact classified original tuples. */
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_COMBINE_PROGRAM = String.raw`function(native,related,details){"use strict";const get=native[0],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "SCH209_RAW_COMBINE";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};const tuples=[this,related,details],result=[];for(let i=0;i<3;i++){const tuple=tuples[i];if(!isArray(tuple))bad();const n=own(tuple,"length");if(n>32||keys(tuple).length!==n+1)bad();for(let j=0;j<n;j++)result[result.length]=own(tuple,j);}if(result.length<44||result.length>88)bad();return result;}`;
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_SAME_PROGRAM = String.raw`function(native){"use strict";const get=native[0],has=native[4],apply=native[6],d=get(this,"1");if(!d||!has(d,"value")||typeof d.value!=="function")throw "SCH209_RAW_GUARD";return apply(d.value,undefined,[]);}`;

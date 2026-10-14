import { CURRENT_PCB_GEOMETRY_MAX_BYTES, CURRENT_PCB_GEOMETRY_MAX_NUMBER, CURRENT_PCB_GEOMETRY_MAX_ROWS,
  currentPcbGeometryFamily, parseCurrentPcbGeometryRequest } from "./current-pcb-geometry.ts";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";

/** Current API021d155b / UI3823ed6e / PCB217199c8 only. The native
 * serializers are the same ones used by current identity enumeration.
 * Copy own scalar fields only; native Point prototypes also contain mutators.
 */
export function buildCurrentPcbGeometryProgram(input: unknown): string {
  const request = parseCurrentPcbGeometryRequest(input);
  const family = currentPcbGeometryFamily(request);
  const primitiveIds = "primitiveIds" in request.arguments ? request.arguments.primitiveIds : null;
  const componentPrimitiveId = "primitiveId" in request.arguments ? request.arguments.primitiveId : null;
  const topics = { Line: "pcb/extensionAPI/track-getAll", Arc: "pcb/extensionAPI/arc-getAll", Via: "pcb/extensionAPI/via-getAll",
    Component: "pcb/extensionAPI/component-getAll", Pad: "pcb/extensionAPI/pad-getAll" } as const;
  return `let timer,clear;
try{
const root=globalThis,apply=Reflect.apply,target=${JSON.stringify(request.target)},family=${JSON.stringify(family)},topic=${JSON.stringify(topics[family])},primitiveIds=${JSON.stringify(primitiveIds)},componentPrimitiveId=${JSON.stringify(componentPrimitiveId)};let expired=false;
const bad=()=>{throw new Error('CURRENT_PCB_GEOMETRY_READ_FAILED');};
${buildCurrentProjectUrlGuard()}
const own=(owner,key)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
const absent=(owner,key)=>{const d=Object.getOwnPropertyDescriptor(owner,key);if(d&&(!Object.hasOwn(d,'value')||d.value!==undefined))bad();};
const fn=(owner,key)=>{const value=own(owner,key);if(typeof value!=='function')bad();return value;};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const topPlain=value=>{if(!object(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
const location=root.location,href=location?.href,document=root.document,ui=own(root,'UI'),host=own(root,'gVars'),mode=own(root,'PRO_EDITOR_MODE');
const project=topPlain(own(host,'currentProject')),tabs=own(ui,'tabBar'),edaOwner=eda;
if(typeof tabs!=='function'||Object.getPrototypeOf(tabs)!==Function.prototype)bad();
const active=fn(tabs,'getActiveTab'),getTab=fn(tabs,'getTabById'),select=document?.querySelectorAll;
if(typeof select!=='function')bad();
const tab=topPlain(apply(getTab,tabs,[target.tabId])),data=topPlain(own(tab,'data'));
const matches=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(matches.length!==1)bad();
const frame=matches[0],child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement;
const native=own(child,'MSG_BUS_PCB'),channel=own(native,'messageBus'),childObject=own(child,'Object'),childArray=own(child,'Array');
const childObjectPrototype=own(childObject,'prototype'),childArrayPrototype=own(childArray,'prototype');
const getAttribute=frame?.getAttribute,hasAttribute=frame?.hasAttribute,classes=frame?.classList,contains=classes?.contains,parentAttribute=parent?.getAttribute;
if(typeof getAttribute!=='function'||typeof hasAttribute!=='function'||typeof contains!=='function'||typeof parentAttribute!=='function')bad();
const chain=[channel];let rpc,rpcOwner;
for(let i=0;i<3;i++){const node=chain[i];if(!object(node))bad();const d=Object.getOwnPropertyDescriptor(node,'rpcCall');if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')bad();rpc=d.value;rpcOwner=node;break;}chain.push(Object.getPrototypeOf(node));}
if(typeof rpc!=='function')bad();
const set=own(root,'setTimeout');clear=own(root,'clearTimeout');if(typeof set!=='function'||typeof clear!=='function')bad();
const check=()=>{
 if(expired||root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 parseProjectUrl(href,target.projectUuid,target.tabId);
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(host,'currentProject')!==project||own(ui,'tabBar')!==tabs||eda!==edaOwner||own(edaOwner,'extensionUuid')!=='7e06d286b1ac846ef7eab9c7f2a9ee40')bad();
 if(own(project,'projectId')!==target.projectUuid||own(project,'branchUuid')!==target.branchUuid||own(project,'isV2Format')!==false||own(host,'isHistoryMode')!==false)bad();
 if(fn(tabs,'getActiveTab')!==active||fn(tabs,'getTabById')!==getTab||apply(active,tabs,[])!==target.tabId||apply(getTab,tabs,[target.tabId])!==tab||own(tab,'data')!==data)bad();
 if(own(tab,'tabId')!==target.tabId||own(data,'doctype')!==3||own(data,'pid')!==target.projectUuid)bad();absent(tab,'parentLibraryUuid');
 if(document.querySelectorAll!==select)bad();const found=apply(select,document,['[id="frame_'+target.tabId+'"]']);if(found.length!==1||found[0]!==frame)bad();
 if(frame.tagName!=='IFRAME'||frame.id!=='frame_'+target.tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==getAttribute||frame.hasAttribute!==hasAttribute||parent.getAttribute!==parentAttribute||!apply(contains,classes,['editframe'])||apply(parentAttribute,parent,['uuid'])!==target.tabId)bad();
 for(const [key,value] of [['c_dbid',target.tabId],['c_doctype','3'],['src','editor?entry=pcb'],['pcb-canvas','true']])if(apply(getAttribute,frame,[key])!==value)bad();
 for(const key of ['blankIframe','fromFile','jsonCacheReady'])if(apply(hasAttribute,frame,[key]))bad();
 if(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||own(child,'MSG_BUS_PCB')!==native||own(native,'messageBus')!==channel)bad();
 if(own(child,'Object')!==childObject||own(childObject,'prototype')!==childObjectPrototype||own(child,'Array')!==childArray||own(childArray,'prototype')!==childArrayPrototype)bad();
 for(let i=0;i<chain.length;i++){const node=chain[i];if(i>0&&Object.getPrototypeOf(chain[i-1])!==node)bad();if(node===rpcOwner){if(own(node,'rpcCall')!==rpc)bad();}else if(Object.hasOwn(node,'rpcCall'))bad();}
 if(own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();
};
const plain=value=>{if(!object(value))bad();const p=Object.getPrototypeOf(value);if(p!==Object.prototype&&p!==childObjectPrototype)bad();return value;};
const exact=(value,keys)=>{plain(value);const actual=Reflect.ownKeys(value);if(actual.length!==keys.length||!actual.every(key=>keys.includes(key)))bad();};
const num=value=>{if(typeof value!=='number'||!Number.isFinite(value)||Object.is(value,-0)||Math.abs(value)>${CURRENT_PCB_GEOMETRY_MAX_NUMBER})bad();return value;};
const integer=value=>{num(value);if(!Number.isInteger(value))bad();return value;};
const layer=value=>{integer(value);if(value<0||value>65535)bad();return value;};
const bool=value=>{if(typeof value!=='boolean')bad();return value;};
const text=(value,max,nullable=false)=>{if(value===null&&nullable)return value;if(typeof value!=='string'||value.length>max)bad();return value;};
// PCB217199c8@7397863 clones attrsMap including own undefined; API021d155b@1426362 passes these fields to optional string getters.
// Omit unavailable values, never coerce them to empty strings. Name is raw: native formula evaluation is separate at PCB4325200.
const componentMetadata=row=>{
 const attrs=plain(own(row,'attrsMap')),result={};
 for(const [key,field] of [['Designator','designator'],['Name','name'],['Manufacturer','manufacturer'],['Manufacturer Part','manufacturerPart'],['Supplier','supplier'],['Supplier Part','supplierPart']]){
  const d=Object.getOwnPropertyDescriptor(attrs,key);if(!d){if(key in attrs)bad();continue;}
  if(!Object.hasOwn(d,'value'))bad();if(d.value!==undefined)result[field]=text(d.value,1024);
 }
 return result;
};
// Native Point may retain an optional _hashed cache; project only own x/y data without reading that cache or its getter.
const point=value=>{if(!object(value))bad();const keys=Reflect.ownKeys(value);if(!keys.includes('x')||!keys.includes('y')||keys.some(key=>key!=='x'&&key!=='y'&&key!=='_hashed'))bad();return{x:num(own(value,'x')),y:num(own(value,'y'))};};
const arrayLength=value=>{
 const p=Object.getPrototypeOf(value??{});if(!Array.isArray(value)||(p!==Array.prototype&&p!==childArrayPrototype))bad();
 const n=own(value,'length');if(!Number.isInteger(n)||n<0||n>${CURRENT_PCB_GEOMETRY_MAX_ROWS}||Reflect.ownKeys(value).length!==n+1)bad();
 return n;
};
// PCB217199c8@10370738: global pad-getAll already scales hole tuple/offsets to mil and rotation to degrees.
// Null must branch first: legitimate holeless rows can contain NaN holeRotation. Zero dimensions are native observations, not DFM approval.
const hole=row=>{
 const tuple=own(row,'holeAspect');if(tuple===null)return null;
 const n=arrayLength(tuple),shape=own(tuple,'0');if((shape==='ROUND'&&n!==2)||(shape==='SLOT'&&n!==3)||(shape!=='ROUND'&&shape!=='SLOT'))bad();
 const diameter=num(own(tuple,'1'));if(diameter<0)bad();const offset=point(own(row,'holeOffset'));
 const result={shape,diameter,offsetX:offset.x,offsetY:offset.y,rotation:num(own(row,'holeRotation'))};
 if(shape==='SLOT'){const length=num(own(tuple,'2'));if(length<0)bad();result.length=length;}return result;
};
const copyRows=value=>{
 const n=arrayLength(value);
 const rows=[],seen=new Set();
 for(let i=0;i<n;i++){
  const row=plain(own(value,String(i))),id=text(own(row,'globalIndex'),256);if(id.length===0||seen.has(id))bad();seen.add(id);
  const identity={primitiveId:id,primitiveType:family,primitiveLock:bool(own(row,'locked'))};
  if(family==='Component'){
   const position=point(own(row,'position')),componentLayer=layer(own(row,'layerId'));if(![1,2].includes(componentLayer))bad();
   rows.push({...identity,layer:componentLayer,x:position.x,y:position.y,rotation:num(own(row,'rotation')),...componentMetadata(row)});continue;
  }
  const base={...identity,net:text(own(row,'net'),1024,true)};
  if(family==='Pad'){
   const center=point(own(row,'center')),padLayer=layer(own(row,'layerId')),padType=integer(own(row,'padTypeAspect'));
   if(![1,2,12].includes(padLayer)||![0,1,2].includes(padType))bad();
   rows.push({...base,layer:padLayer,padNumber:text(own(row,'num'),1024),x:center.x,y:center.y,rotation:num(own(row,'rotation')),
    metallization:bool(own(row,'plated')),padType,hole:hole(row)});
  }else if(family==='Via'){
   const center=point(own(row,'center')),viaType=integer(own(row,'type'));if(![0,1,2].includes(viaType))bad();
   rows.push({...base,x:center.x,y:center.y,holeDiameter:num(num(own(row,'holeRadius'))*2),diameter:num(num(own(row,'radius'))*2),viaType,
    designRuleBlindViaName:text(own(row,'name'),1024,true),startLayer:layer(own(row,'startLayer')),endLayer:layer(own(row,'endLayer')),
    maskExpansionMode:integer(own(row,'expansion')),topMaskExpansion:num(num(own(row,'topExpansion'))*10),bottomMaskExpansion:num(num(own(row,'bottomExpansion'))*10)});
  }else{
   const track={...base,layer:layer(own(row,'layerId')),startX:num(own(row,'startX')),startY:num(own(row,'startY')),endX:num(own(row,'endX')),endY:num(own(row,'endY')),lineWidth:num(own(row,'width'))};
   if(family==='Arc'){const interactiveMode=integer(own(row,'arcType'));if(![1,2].includes(interactiveMode))bad();rows.push({...track,arcAngle:num(own(row,'arcAngle')),interactiveMode});}else rows.push(track);
  }
 }
 return rows;
};
const call=async(name,arg)=>{check();const reply=await apply(rpc,channel,[name,arg,0]);check();plain(reply);return own(reply,'message');};
const identity=async()=>{const value=await call('getTabIdAndDocType',undefined);check();exact(value,['tabId','docType']);if(own(value,'tabId')!==target.tabId||own(value,'docType')!==3)bad();};
const read=async()=>{await identity();check();const raw=await call(topic,{});check();const rows=copyRows(raw);check();await identity();check();return rows;};
// PCB217199c8@10336862 enumerates gr.getItem(id).getPads() with full IDs. API021d155b@1427274 supplies its own input as public parent ID.
// Correlate observed child membership only; do not infer reverse parents, reconstructed IDs or symbol-pin mapping.
const readComponentPads=async()=>{
 await identity();check();const components=await call('pcb/extensionAPI/component-getAll',{}),componentIds=[],componentSet=new Set();
 for(let i=0,n=arrayLength(components);i<n;i++){const id=text(own(plain(own(components,String(i))),'globalIndex'),256);if(id.length===0||componentSet.has(id))bad();componentIds.push(id);componentSet.add(id);}
 if(!componentSet.has(componentPrimitiveId))bad();
 const pads=copyRows(await call('pcb/extensionAPI/pad-getAll',{})),byId=new Map();
 for(const pad of pads){if(componentSet.has(pad.primitiveId))bad();byId.set(pad.primitiveId,pad);}
 const children=await call('pcb/extensionAPI/component-getAllPinsByPrimitiveId',componentPrimitiveId),childRows=[],seen=new Set(),selected=[];
 for(let i=0,n=arrayLength(children);i<n;i++){
  const row=plain(own(children,String(i))),id=text(own(row,'globalIndex'),256);if(id.length===0||seen.has(id))bad();seen.add(id);
  const member={primitiveId:id,padNumber:text(own(row,'num'),1024),net:text(own(row,'net'),1024,true),layer:layer(own(row,'layerId')),
   primitiveLock:bool(own(row,'locked')),metallization:bool(own(row,'plated')),padType:integer(own(row,'padTypeAspect'))};
  const pad=byId.get(id);if(!pad||Object.keys(member).some(key=>member[key]!==pad[key]))bad();childRows.push(member);selected.push(pad);
 }
 await identity();check();return{componentIds,pads,childRows,selected};
};
const run=async()=>{
 const reader=componentPrimitiveId===null?read:readComponentPads,first=await reader(),firstJson=JSON.stringify(first);if(new TextEncoder().encode(firstJson).byteLength>${CURRENT_PCB_GEOMETRY_MAX_BYTES})bad();
 const second=await reader();if(JSON.stringify(second)!==firstJson)bad();check();
 const observation={ok:true,kind:'current-pcb-geometry-observation',method:${JSON.stringify(request.method)},target,rows:componentPrimitiveId===null?first:first.selected,samples:2,implementationKind:'native-task-equivalent',cadAuthority:false,persistenceVerified:false,sourceMembershipVerified:false};
 if(componentPrimitiveId!==null)Object.assign(observation,{componentPrimitiveId,observedComponentCount:first.componentIds.length,observedPadCount:first.pads.length,
  relationshipEvidence:'native-component-child-list-and-global-pad-membership',reciprocalParentVerified:false,symbolPinMappingVerified:false});
 const encode=value=>{const json=JSON.stringify(value),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
  if(utf8Bytes>${CURRENT_PCB_GEOMETRY_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${CURRENT_PCB_GEOMETRY_MAX_BYTES})bad();return envelope;};
 const complete=encode(observation);if(primitiveIds===null)return complete;
 const byId=new Map(first.map(row=>[row.primitiveId,row])),selected=primitiveIds.map(id=>{const row=byId.get(id);if(row===undefined)bad();return row;});
 return encode({...observation,rows:selected,observedRowCount:first.length});
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;reject(new Error('CURRENT_PCB_GEOMETRY_READ_FAILED'));},10000]);});
return await Promise.race([run(),timeout]);
}catch{throw new Error('CURRENT_PCB_GEOMETRY_READ_FAILED');}
finally{if(timer!==undefined&&typeof clear==='function'){try{Reflect.apply(clear,globalThis,[timer]);}catch{throw new Error('CURRENT_PCB_GEOMETRY_READ_FAILED');}}}`;
}

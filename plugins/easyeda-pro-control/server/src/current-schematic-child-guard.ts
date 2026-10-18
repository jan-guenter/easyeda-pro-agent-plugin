/** Fixed SCH holders, not PCB lifecycle authority. Requires root/apply/own/bad,
 * projectOnly and the exact target. Reads only the debug exports which return
 * existing objects; never render(), getOrInitDoc(), batch methods or getters.
 * SCH d9d6a955 UTF16 anchors: exports6282338, UG5540867, Lx3630653,
 * N1 5469012, mM5446807, Ja3651071 and w9 5766787. SCH6146135 retains the
 * UI3823ed6e project info published at15074861 with branchUuid at15074428.
 * Matching the projected
 * fields does not bind geometry, doc_id, compiler uniqueId or private Pc queues.
 */
export function buildCurrentSchematicChildGuard(): string {
  return String.raw`
const schematicChildren=(()=>{
 const sch=own(root,'SCH'),vars=own(sch,'gVars'),project=own(vars,'projectMgr'),currentProject=own(vars,'currentProject'),debug=own(sch,'D'),tree=own(debug,'leftTree');
 const readManager=own(tree,'manager'),readAst=own(tree,'ast'),readTemp=own(tree,'tempAst');
 const SetOwner=own(root,'Set'),setPrototype=own(SetOwner,'prototype'),sizeDescriptor=Object.getOwnPropertyDescriptor(setPrototype,'size');
 if(typeof readManager!=='function'||typeof readAst!=='function'||typeof readTemp!=='function'||!sizeDescriptor||typeof sizeDescriptor.get!=='function'||sizeDescriptor.set!==undefined)bad();
 const setSize=sizeDescriptor.get;
 const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
 const number=value=>{if(typeof value!=='number'||!Number.isFinite(value)||Object.is(value,-0))bad();return value;};
 const integer=value=>{number(value);if(!Number.isSafeInteger(value)||value<0)bad();return value;};
 const id=value=>{if(typeof value!=='string'||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(value))bad();return value;};
 const title=value=>{if(typeof value!=='string'||value.length<1||value.length>512||value.trim()!==value||!/^[\x20-\x7e]+$/.test(value)||value.includes('I'))bad();return value;};
 const keys=value=>{plain(value);const result=Reflect.ownKeys(value);if(result.length>128||result.some(key=>typeof key!=='string'))bad();result.forEach(id);return result.sort();};
 const base=()=>{
  projectOnly.check();
  if(own(root,'SCH')!==sch||own(sch,'gVars')!==vars||own(vars,'projectMgr')!==project||own(project,'uuid')!==target.projectUuid||own(sch,'D')!==debug||own(debug,'leftTree')!==tree)bad();
  if(own(vars,'currentProject')!==currentProject||own(plain(currentProject),'projectId')!==target.projectUuid||own(currentProject,'branchUuid')!==target.branchUuid||own(currentProject,'isV2Format')!==false)bad();
  if(own(tree,'manager')!==readManager||own(tree,'ast')!==readAst||own(tree,'tempAst')!==readTemp)bad();
  for(const fn of [readManager,readAst,readTemp])if(Object.getPrototypeOf(fn)!==Function.prototype)bad();
  const size=Object.getOwnPropertyDescriptor(setPrototype,'size');
  if(own(root,'Set')!==SetOwner||own(SetOwner,'prototype')!==setPrototype||size?.get!==setSize||size.set!==undefined)bad();
 };
 const pending=(manager,key)=>{
  const descriptor=Object.getOwnPropertyDescriptor(manager,key);
  if(!descriptor){if(key in manager)bad();return undefined;}
  if(!Object.hasOwn(descriptor,'value'))bad();const value=descriptor.value;
  if(value===null||typeof value!=='object'||Object.getPrototypeOf(value)!==setPrototype||Reflect.ownKeys(value).length!==0||apply(setSize,value,[])!==0)bad();return value;
 };
 const selected=(ast,owners)=>{
  const schematics=plain(own(ast,'schematics')),mapKeys=keys(schematics),value=plain(own(schematics,target.schematicUuid));
  if(!mapKeys.includes(target.schematicUuid)||own(value,'uuid')!==target.schematicUuid||own(value,'blockSymbolUuid')!=='')bad();
  const sheets=plain(own(value,'sheets')),sheetKeys=keys(sheets),sort=own(value,'sort');
  if(!Array.isArray(sort)||Object.getPrototypeOf(sort)!==Array.prototype||own(sort,'length')!==sheetKeys.length||Reflect.ownKeys(sort).length!==sheetKeys.length+1)bad();
  owners.push(schematics,value,sheets,sort);const order=[],seen=new Set(),projected={};
  for(let index=0;index<sheetKeys.length;index++){const uuid=id(own(sort,String(index)));if(seen.has(uuid)||!sheetKeys.includes(uuid))bad();seen.add(uuid);order.push(uuid);}
  for(const uuid of sheetKeys){const child=plain(own(sheets,uuid));owners.push(child);if(own(child,'uuid')!==uuid)bad();
   const lower=title(own(child,'title')),display=title(own(child,'displayTitle'));if(lower!==display.toLowerCase())bad();
   projected[uuid]={uuid,title:lower,displayTitle:display,zIndex:number(own(child,'zIndex'))};}
  const lower=title(own(value,'title')),display=title(own(value,'displayTitle')),board=own(value,'board'),version=own(value,'version'),updateTime=integer(own(value,'updateTime'));
  if(lower!==display.toLowerCase()||(board!==''&&!id(board))||typeof version!=='string'||version.length<1||version.length>128||updateTime<1||updateTime>8640000000000000)bad();
  return{mapKeys,schematic:{uuid:target.schematicUuid,title:lower,displayTitle:display,board,version,updateTime,blockSymbolUuid:'',sort:order,sheets:projected}};
 };
 const sample=()=>{
  base();const manager=apply(readManager,tree,[]),ast=plain(apply(readAst,tree,[])),temp=plain(apply(readTemp,tree,[]));base();
  if(manager===null||typeof manager!=='object'||Array.isArray(manager)||own(manager,'prjUuid')!==target.projectUuid||!Object.is(own(manager,'batchDepth'),0)||own(manager,'_isClose')!==false)bad();
  const cbb=own(manager,'CBB');if(cbb!==undefined&&cbb!==false&&cbb!==null&&cbb!==0||Object.is(cbb,-0))bad();
  if(ast===temp||own(ast,'isBuild')!==true||own(ast,'isPass')!==false||own(temp,'isBuild')!==false||own(temp,'isPass')!==false)bad();
  const transId=integer(own(ast,'transId')),tempId=integer(own(temp,'transId')),lastModify=number(own(ast,'lastModify'));
  if(transId<1||transId!==tempId||lastModify<0)bad();
  const schematics=pending(manager,'pendSchematicId'),sheets=pending(manager,'pendSheetId');
  if((schematics===undefined)!==(sheets===undefined)||(schematics!==undefined&&schematics===sheets))bad();
  const owners=[manager,Object.getPrototypeOf(manager),ast,temp,schematics,sheets],first=selected(ast,owners),second=selected(temp,owners);
  if(JSON.stringify(first)!==JSON.stringify(second))bad();base();
  const value={manager:{prjUuid:target.projectUuid,batchDepth:0,_isClose:false,...(cbb===undefined?{}:{CBB:cbb}),pendingSchematics:schematics===undefined?null:[],pendingSheets:sheets===undefined?null:[]},
   ast:{isBuild:true,isPass:false,transId,lastModify,schematic:first.schematic},tempAst:{isBuild:false,isPass:false,transId,schematic:second.schematic}};
  return{owners,cbb,mapKeys:first.mapKeys,value};
 };
 const initial=sample(),identity=JSON.stringify([initial.mapKeys,initial.value]);
 const read=()=>{const current=sample();if(!Object.is(current.cbb,initial.cbb)||current.owners.length!==initial.owners.length||current.owners.some((owner,index)=>owner!==initial.owners[index])||JSON.stringify([current.mapKeys,current.value])!==identity)bad();return current.value;};
 return{read,check:()=>{read();}};
})();`;
}

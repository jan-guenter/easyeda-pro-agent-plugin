/** Dormant prerequisite for a future closed-PCB title-only writer.
 * Requires root/apply/own/bad/target/projectOnly. The caller must separately
 * admit the exact current SCH implementation and no-editor project context.
 * This fixed fragment retains the native AST owners and observes batch/rebuild
 * state. It grants no execution authority, proves no complete AST/source effect,
 * and cannot observe the private Pc queue or establish its completion.
 *
 * Reviewed SCH 3.2.192.b79ad524, UTF-16 offsets: UG constructor 5540867,
 * startBatch/endBatch 5549002/5549110, Ja 3651071, PCB subscriber 6209387,
 * see 5765333, and the fixed debug exports 6282338. PCB update runs see, which
 * enters/exits a batch and can flush pending sheet/net work. Never call those
 * methods to inspect state. Ja clears isPass before its asynchronous rebuild;
 * matching positive transId values are also required to exclude that interval.
 */
export function buildCurrentPcbRenameStartupGuard(): string {
  return String.raw`
const pcbRenameStartup=(()=>{
 projectOnly.check();
 if(typeof target.projectUuid!=='string'||!/^[a-f0-9]{64}$/.test(target.projectUuid))bad();
 const sch=own(root,'SCH'),vars=own(sch,'gVars'),project=own(vars,'projectMgr'),debug=own(sch,'D'),tree=own(debug,'leftTree');
 const managerRead=own(tree,'manager'),astRead=own(tree,'ast'),tempRead=own(tree,'tempAst');
 const SetOwner=own(root,'Set'),setPrototype=own(SetOwner,'prototype'),sizeDescriptor=Object.getOwnPropertyDescriptor(setPrototype,'size');
 if(typeof managerRead!=='function'||typeof astRead!=='function'||typeof tempRead!=='function'||!sizeDescriptor||typeof sizeDescriptor.get!=='function'||sizeDescriptor.set!==undefined)bad();
 const setSize=sizeDescriptor.get;
 const base=()=>{
  projectOnly.check();
  if(own(root,'SCH')!==sch||own(sch,'gVars')!==vars||own(vars,'projectMgr')!==project||own(project,'uuid')!==target.projectUuid||own(sch,'D')!==debug||own(debug,'leftTree')!==tree)bad();
  if(own(tree,'manager')!==managerRead||own(tree,'ast')!==astRead||own(tree,'tempAst')!==tempRead)bad();
  for(const fn of [managerRead,astRead,tempRead])if(Object.getPrototypeOf(fn)!==Function.prototype)bad();
  const sizeNow=Object.getOwnPropertyDescriptor(setPrototype,'size');
  if(own(root,'Set')!==SetOwner||own(SetOwner,'prototype')!==setPrototype||sizeNow?.get!==setSize||sizeNow.set!==undefined)bad();
 };
 const plain=value=>{if(value===null||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad();return value;};
 const pending=(manager,key)=>{
  const descriptor=Object.getOwnPropertyDescriptor(manager,key);
  if(!descriptor){if(key in manager)bad();return undefined;}
  if(!Object.hasOwn(descriptor,'value'))bad();const value=descriptor.value;
  if(value===null||typeof value!=='object'||Object.getPrototypeOf(value)!==setPrototype||Reflect.ownKeys(value).length!==0||apply(setSize,value,[])!==0)bad();
  return value;
 };
 const sample=()=>{
  base();const manager=apply(managerRead,tree,[]),ast=plain(apply(astRead,tree,[])),temp=plain(apply(tempRead,tree,[]));base();
  if(manager===null||typeof manager!=='object'||Array.isArray(manager)||ast===temp||own(manager,'prjUuid')!==target.projectUuid||!Object.is(own(manager,'batchDepth'),0)||own(manager,'_isClose')!==false||own(manager,'CBB')!==false)bad();
  if(own(ast,'isBuild')!==true||own(ast,'isPass')!==false||own(temp,'isBuild')!==false||own(temp,'isPass')!==false)bad();
  const version=own(ast,'transId'),tempVersion=own(temp,'transId'),modified=own(ast,'lastModify');
  if(!Number.isSafeInteger(version)||version<=0||!Object.is(version,tempVersion)||typeof modified!=='number'||!Number.isFinite(modified)||modified<0||Object.is(modified,-0))bad();
  const schematics=pending(manager,'pendSchematicId'),sheets=pending(manager,'pendSheetId');
  if((schematics===undefined)!==(sheets===undefined)||(schematics!==undefined&&schematics===sheets))bad();
  base();return{owners:[manager,Object.getPrototypeOf(manager),ast,temp,schematics,sheets],version,modified};
 };
 const initial=sample();
 const check=()=>{const current=sample();if(!Object.is(current.version,initial.version)||!Object.is(current.modified,initial.modified)||current.owners.some((owner,index)=>owner!==initial.owners[index]))bad();};
 return{check};
})();`;
}

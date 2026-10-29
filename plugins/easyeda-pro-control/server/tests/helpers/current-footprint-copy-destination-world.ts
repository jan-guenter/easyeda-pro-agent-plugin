import { CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES as PROFILES } from "../../src/current-footprint-copy-destination-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_FIXTURE as SOURCES } from "./current-footprint-copy-destination-fixture.ts";

/** Inert relationships, actual exact method bodies and explicit local state.
 * No vendor constructor, callback, HTTP operation or application getter runs. */
export function footprintDestinationWorldSource(): string {
  const setup = PROFILES.map((profile, index) => {
    if (profile.kind === "class") { return ""; }
    const body = SOURCES[index];
    if (profile.kind !== "method") { return `scope[${JSON.stringify(profile.key)}]=(${body});`; }
    const [owner, key] = profile.key.split(".");
    return `Object.defineProperty(scope[${JSON.stringify(owner)}]${owner === "mc" ? "" : ".prototype"},${JSON.stringify(key)},{value:({${body}})[${JSON.stringify(key)}],writable:true,enumerable:false,configurable:true});`;
  }).join("\n");
  return `const scope={Lg:class Lg{},Gd:class Gd{},mc:class mc{},_d:class _d{},bd:class bd{},rs:class rs{},jr:false,ln:true};
  class Pi{}class ar extends Pi{}class Tg extends ar{}class zy{}class Vc extends zy{}class ja extends Vc{}class Mb{}class KP extends Mb{}class JP extends KP{}
  Object.setPrototypeOf(scope.Lg.prototype,scope.Gd.prototype);Object.setPrototypeOf(scope._d.prototype,scope.rs.prototype);Object.setPrototypeOf(scope.bd.prototype,scope.rs.prototype);Object.setPrototypeOf(scope._d,scope.rs);Object.setPrototypeOf(scope.bd,scope.rs);${setup}
  scope.Re=scope.mc;const instance=Object.create(scope.mc.prototype),history=Object.create(scope._d.prototype),branchApi=Object.create(scope.bd.prototype);
  instance.projectHistory=history;instance.branch=branchApi;history.parent=instance;branchApi.parent=instance;scope.mc.tool=instance;
  scope.ae={PROJECT_HISTORY:{SET:'/api/v4/projects/{project_uuid}/branches/{branch_uuid}/histories',GET:'/api/v4/projects/{project_uuid}/branches/{branch_uuid}/histories/{history_uuid}'},BRANCH:{GET:'/api/v4/projects/{project_uuid}/branches/{branch_uuid}'}};
  const project=Object.create(scope.Lg.prototype),bus=new JP,manager=new Tg,consistency=Object.assign(new ja,{client:'1'.repeat(16),maxTicket:7});manager.projectManager=project;
  Object.assign(project,{workerBus:bus,footprint:manager,consistencyManager:consistency,uuid:'a'.repeat(64),_branchUuid:'b'.repeat(32),isTemporary:false,isHistoryBack:false,_isV2Format:false,isUploadingCloud:false,isBatchUpload:false,pendingSyncCloud:false,isReady:true,cache:{},localCache:{}});
  const dependencies=Array.from({length:70},()=>()=>{});for(const [key,index,level]of [['onHeadChange',39,scope.Lg],['uploadCloud',35,scope.Gd],['batchUploadCloud',36,scope.Gd]])Object.defineProperty(level.prototype,key,{value:dependencies[index],writable:true,enumerable:false,configurable:true});dependencies[37]=scope.Gd.prototype.publishUploadPending;dependencies[62]=project.cache;dependencies[63]=project.localCache;
  const callbacks=Array.from({length:14},()=>({}));for(const [key,index,set]of [['task1',6,true],['task2',7,true],['task3',8,true],['cachePromise',9,true],['bufferUploadData',10,false],['bufferUploadCache',11,false]])callbacks[index]=project[key]=set?new Set:new Map;callbacks[12]=project.localCache;callbacks[13]=project.cache;
  const constructors=[Tg,ar,Pi,ja,Vc,zy,scope.Lg,scope.Gd,JP,KP,Mb];
  globalThis.PROJECT=project;const args=[project,bus,manager,consistency,dependencies,callbacks,constructors];`;
}

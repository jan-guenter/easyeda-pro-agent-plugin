/* oxlint-disable import/max-dependencies -- The fixed adapter composes three strict source-family plan interfaces and their data types; it accepts no caller callbacks and issues no native authority. */
/** Original source-family plan composition only. All closures capture fixed
 * module functions and one genuine token; callers supply no implementations,
 * owner, handles, source bytes or execution authority. Historical issuers keep
 * their original parameter domains and private maps unchanged. */
import {types} from "node:util";
import type {CurrentFootprintInversePreparedCheckpoint as Prepared} from "./current-footprint-inverse-prepared-checkpoint.ts";
import type {CurrentFootprintSavedFlowCachePlan as Flow} from "./current-footprint-saved-flow-cache-plan.ts";
import type {CurrentFootprintInverseStartupPlan as Startup} from "./current-footprint-inverse-startup-plan.ts";
import type {CurrentFootprintInversePublicRowPlan as Row} from "./current-footprint-inverse-public-row-plan.ts";
import type {CurrentFootprintSavedFlowCacheData,CurrentFootprintSavedFlowCacheInput} from "./current-footprint-saved-flow-cache-data.ts";
import type {CurrentFootprintInverseStartupData} from "./current-footprint-inverse-startup-data.ts";
import type {CurrentFootprintInverseInitialCacheData} from "./current-footprint-inverse-initial-cache-data.ts";
import type {CurrentFootprintInverseInitialSyncData} from "./current-footprint-inverse-initial-sync-data.ts";
import type {CurrentFootprintInverseColdLoadData} from "./current-footprint-inverse-cold-load-data.ts";
import type {CurrentFootprintInverseGetModelInputData,CurrentFootprintInversePublicRowData,CurrentFootprintInverseReferenceData} from "./current-footprint-inverse-v4-public-row-data.ts";

export interface CurrentFootprintInversePreparedFlowModule{
 readonly prepareCurrentFootprintSavedFlowCachePlan:(prepared:Prepared)=>Promise<Flow>;
 readonly requireOriginalCurrentFootprintSavedFlowCachePlan:(plan:Flow,prepared:Prepared)=>CurrentFootprintSavedFlowCacheData;
 readonly requireOriginalCurrentFootprintSavedFlowCacheInput:(plan:Flow,prepared:Prepared)=>CurrentFootprintSavedFlowCacheInput;
}
export interface CurrentFootprintInversePreparedStartupModule{
 readonly prepareCurrentFootprintInverseStartupPlan:(flow:Flow,prepared:Prepared)=>Promise<Startup>;
 readonly requireOriginalCurrentFootprintInverseStartupPlan:(plan:Startup,flow:Flow,prepared:Prepared)=>CurrentFootprintInverseStartupData;
 readonly requireOriginalCurrentFootprintInverseColdLoadData:(plan:Startup,flow:Flow,prepared:Prepared)=>CurrentFootprintInverseColdLoadData;
 readonly requireOriginalCurrentFootprintInverseInitialCacheData:(plan:Startup,flow:Flow,prepared:Prepared)=>CurrentFootprintInverseInitialCacheData;
 readonly requireOriginalCurrentFootprintInverseInitialSyncData:(plan:Startup,flow:Flow,prepared:Prepared)=>CurrentFootprintInverseInitialSyncData;
}
export interface CurrentFootprintInversePreparedRowModule{
 readonly prepareCurrentFootprintInversePublicRowPlan:(prepared:Prepared,flow:Flow)=>Promise<Row>;
 readonly requireOriginalCurrentFootprintInversePublicRowPlan:(plan:Row,prepared:Prepared,flow:Flow)=>CurrentFootprintInversePublicRowData;
 readonly requireOriginalCurrentFootprintInverseGetModelInput:(plan:Row,prepared:Prepared,flow:Flow)=>CurrentFootprintInverseGetModelInputData;
 readonly requireOriginalCurrentFootprintInverseReferenceData:(plan:Row,prepared:Prepared,flow:Flow)=>CurrentFootprintInverseReferenceData;
}
export interface CurrentFootprintInversePreparedPlanModules{
 readonly prepared:Prepared;
 readonly flow:CurrentFootprintInversePreparedFlowModule;
 readonly startup:CurrentFootprintInversePreparedStartupModule;
 readonly row:CurrentFootprintInversePreparedRowModule;
 readonly current:()=>void;
}
const attempts=new WeakMap<Prepared,Promise<Readonly<CurrentFootprintInversePreparedPlanModules>>>();
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_PREPARED_PLAN_SOURCE");}}
/** Retain the complete original module preparation before asynchronous imports.
 * A source label selects its strict original reader, never its authority. */
export function createCurrentFootprintInversePreparedPlanModules(prepared:Prepared):Promise<Readonly<CurrentFootprintInversePreparedPlanModules>>{
 need(prepared!==null&&typeof prepared==="object"&&!types.isProxy(prepared)&&Object.isFrozen(prepared));
 const descriptor=Object.getOwnPropertyDescriptor(prepared,"profile");need(Reflect.ownKeys(prepared).length===1&&descriptor!==undefined&&Object.hasOwn(descriptor,"value")&&(descriptor.value==="private.current-footprint-forward-saved-checkpoint.v1"||descriptor.value==="private.current-footprint-inverse-full-preparation.v1"));
 const previous=attempts.get(prepared);if(previous!==undefined){return previous;}
 const gate=Promise.withResolvers<null>();
 const pending=(async():Promise<Readonly<CurrentFootprintInversePreparedPlanModules>>=>{
  await gate.promise;
  if(prepared.profile==="private.current-footprint-inverse-full-preparation.v1"){
   const token=prepared;
   const source=await import("./current-footprint-inverse-full-preparation.ts");
   const original=source.requireOriginalCurrentFootprintInverseFullPreparation(token);
   const requireOriginal=source.requireOriginalCurrentFootprintInverseFullPreparation;
   const flowPlan=source.currentFootprintInverseFullFlowPlan;const flowData=source.requireCurrentFootprintInverseFullFlowData;
   const startupPlan=source.currentFootprintInverseFullStartupPlan;const startupData=source.requireCurrentFootprintInverseFullStartupData;
   const rowPlan=source.currentFootprintInverseFullPublicRowPlan;const rowData=source.requireCurrentFootprintInverseFullPublicRowData;
   const current=():void=>{
    need(source.requireOriginalCurrentFootprintInverseFullPreparation===requireOriginal&&source.currentFootprintInverseFullFlowPlan===flowPlan&&source.requireCurrentFootprintInverseFullFlowData===flowData&&source.currentFootprintInverseFullStartupPlan===startupPlan&&source.requireCurrentFootprintInverseFullStartupData===startupData&&source.currentFootprintInverseFullPublicRowPlan===rowPlan&&source.requireCurrentFootprintInverseFullPublicRowData===rowData&&requireOriginal(token)===original);
   };
   const same=(candidate:Prepared):void=>{current();need(candidate===token);};
   const withFlow=(candidate:Prepared,flow:Flow):void=>{same(candidate);flowData(token,flow);};
   const flow:CurrentFootprintInversePreparedFlowModule=Object.freeze<CurrentFootprintInversePreparedFlowModule>({
    prepareCurrentFootprintSavedFlowCachePlan:(candidate):Promise<Flow>=>{same(candidate);return Promise.resolve(flowPlan(token));},
    requireOriginalCurrentFootprintSavedFlowCachePlan:(plan,candidate):CurrentFootprintSavedFlowCacheData=>{same(candidate);return flowData(token,plan).flow;},
    requireOriginalCurrentFootprintSavedFlowCacheInput:(plan,candidate):CurrentFootprintSavedFlowCacheInput=>{same(candidate);return flowData(token,plan).input;},
   });
   const startup:CurrentFootprintInversePreparedStartupModule=Object.freeze<CurrentFootprintInversePreparedStartupModule>({
    prepareCurrentFootprintInverseStartupPlan:(plan,candidate):Promise<Startup>=>{withFlow(candidate,plan);return Promise.resolve(startupPlan(token));},
    requireOriginalCurrentFootprintInverseStartupPlan:(plan,parent,candidate):CurrentFootprintInverseStartupData=>{withFlow(candidate,parent);return startupData(token,plan).startup;},
    requireOriginalCurrentFootprintInverseColdLoadData:(plan,parent,candidate):CurrentFootprintInverseColdLoadData=>{withFlow(candidate,parent);return startupData(token,plan).cold;},
    requireOriginalCurrentFootprintInverseInitialCacheData:(plan,parent,candidate):CurrentFootprintInverseInitialCacheData=>{withFlow(candidate,parent);return startupData(token,plan).cache;},
    requireOriginalCurrentFootprintInverseInitialSyncData:(plan,parent,candidate):CurrentFootprintInverseInitialSyncData=>{withFlow(candidate,parent);return startupData(token,plan).sync;},
   });
   const row:CurrentFootprintInversePreparedRowModule=Object.freeze<CurrentFootprintInversePreparedRowModule>({
    prepareCurrentFootprintInversePublicRowPlan:(candidate,parent):Promise<Row>=>{withFlow(candidate,parent);return Promise.resolve(rowPlan(token));},
    requireOriginalCurrentFootprintInversePublicRowPlan:(plan,candidate,parent):CurrentFootprintInversePublicRowData=>{withFlow(candidate,parent);return rowData(token,plan).row;},
    requireOriginalCurrentFootprintInverseGetModelInput:(plan,candidate,parent):CurrentFootprintInverseGetModelInputData=>{withFlow(candidate,parent);return rowData(token,plan).model;},
    requireOriginalCurrentFootprintInverseReferenceData:(plan,candidate,parent):CurrentFootprintInverseReferenceData=>{withFlow(candidate,parent);return rowData(token,plan).reference;},
   });
   current();return Object.freeze({prepared:token,flow,startup,row,current});
  }
  const token=prepared;
  const checkpoint=await import("./current-footprint-copy-held-saved-generation.ts");
  const requireOriginal=checkpoint.requireOriginalCurrentFootprintForwardSavedCheckpoint;const prior=requireOriginal(token);
  const flow=await import("./current-footprint-saved-flow-cache-plan.ts");
  const startup=await import("./current-footprint-inverse-startup-plan.ts");
  const row=await import("./current-footprint-inverse-public-row-plan.ts");
  const current=():void=>{
   need(checkpoint.requireOriginalCurrentFootprintForwardSavedCheckpoint===requireOriginal);
   const same=requireOriginal(token);need(same.writer===prior.writer&&same.owner===prior.owner&&same.writerAfter===prior.writerAfter&&same.inventory===prior.inventory&&same.projection===prior.projection&&same.savedRead===prior.savedRead&&same.paired===prior.paired&&same.snapshot===prior.snapshot);
  };
  const same=(candidate:Prepared):void=>{current();need(candidate===token);};
  const wrappedFlow:CurrentFootprintInversePreparedFlowModule=Object.freeze<CurrentFootprintInversePreparedFlowModule>({
   prepareCurrentFootprintSavedFlowCachePlan:(candidate):Promise<Flow>=>{same(candidate);return flow.prepareCurrentFootprintSavedFlowCachePlan(token);},
   requireOriginalCurrentFootprintSavedFlowCachePlan:(plan,candidate):CurrentFootprintSavedFlowCacheData=>{same(candidate);return flow.requireOriginalCurrentFootprintSavedFlowCachePlan(plan,token);},
   requireOriginalCurrentFootprintSavedFlowCacheInput:(plan,candidate):CurrentFootprintSavedFlowCacheInput=>{same(candidate);return flow.requireOriginalCurrentFootprintSavedFlowCacheInput(plan,token);},
  });
  const wrappedStartup:CurrentFootprintInversePreparedStartupModule=Object.freeze<CurrentFootprintInversePreparedStartupModule>({
   prepareCurrentFootprintInverseStartupPlan:(parent,candidate):Promise<Startup>=>{same(candidate);return startup.prepareCurrentFootprintInverseStartupPlan(parent,token);},
   requireOriginalCurrentFootprintInverseStartupPlan:(plan,parent,candidate):CurrentFootprintInverseStartupData=>{same(candidate);return startup.requireOriginalCurrentFootprintInverseStartupPlan(plan,parent,token);},
   requireOriginalCurrentFootprintInverseColdLoadData:(plan,parent,candidate):CurrentFootprintInverseColdLoadData=>{same(candidate);return startup.requireOriginalCurrentFootprintInverseColdLoadData(plan,parent,token);},
   requireOriginalCurrentFootprintInverseInitialCacheData:(plan,parent,candidate):CurrentFootprintInverseInitialCacheData=>{same(candidate);return startup.requireOriginalCurrentFootprintInverseInitialCacheData(plan,parent,token);},
   requireOriginalCurrentFootprintInverseInitialSyncData:(plan,parent,candidate):CurrentFootprintInverseInitialSyncData=>{same(candidate);return startup.requireOriginalCurrentFootprintInverseInitialSyncData(plan,parent,token);},
  });
  const wrappedRow:CurrentFootprintInversePreparedRowModule=Object.freeze<CurrentFootprintInversePreparedRowModule>({
   prepareCurrentFootprintInversePublicRowPlan:(candidate,parent):Promise<Row>=>{same(candidate);return row.prepareCurrentFootprintInversePublicRowPlan(token,parent);},
   requireOriginalCurrentFootprintInversePublicRowPlan:(plan,candidate,parent):CurrentFootprintInversePublicRowData=>{same(candidate);return row.requireOriginalCurrentFootprintInversePublicRowPlan(plan,token,parent);},
   requireOriginalCurrentFootprintInverseGetModelInput:(plan,candidate,parent):CurrentFootprintInverseGetModelInputData=>{same(candidate);return row.requireOriginalCurrentFootprintInverseGetModelInput(plan,token,parent);},
   requireOriginalCurrentFootprintInverseReferenceData:(plan,candidate,parent):CurrentFootprintInverseReferenceData=>{same(candidate);return row.requireOriginalCurrentFootprintInverseReferenceData(plan,token,parent);},
  });
  current();return Object.freeze({prepared:token,flow:wrappedFlow,startup:wrappedStartup,row:wrappedRow,current});
 })();
 attempts.set(prepared,pending);gate.resolve(null);return pending;
}

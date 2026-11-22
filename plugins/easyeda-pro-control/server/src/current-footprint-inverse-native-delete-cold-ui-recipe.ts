/* oxlint-disable import/max-dependencies -- The original recipe joins independently checked primitive, sender, receiver, worker and held-return protocols. */
/** Complete same-generation recipe. Only Core's original one-shot input
 * registry can select its receiver, source, transport and original exit. */
import {collectCurrentFootprintInverseNativeDeleteColdUiPrimitives as primitives} from "./current-footprint-inverse-native-delete-cold-ui-primitive-collector.ts";
import {collectCurrentFootprintInverseNativeDeleteColdUiSender as sender} from "./current-footprint-inverse-native-delete-cold-ui-sender-collector.ts";
import {collectCurrentFootprintInverseNativeDeleteColdUiReceiver as receiver} from "./current-footprint-inverse-native-delete-cold-ui-receiver-collector.ts";
import {collectCurrentFootprintInverseNativeDeleteColdUiWorker as worker} from "./current-footprint-inverse-native-delete-cold-ui-worker-collector.ts";
import {CurrentFootprintInverseNativeDeleteColdUiTombstoneCollector as Tombstone} from "./current-footprint-inverse-native-delete-cold-ui-tombstone-collector.ts";
import {CurrentFootprintInverseNativeDeleteColdUiController as Controller} from "./current-footprint-inverse-native-delete-cold-ui-controller.ts";
import {qualifyCurrentFootprintInverseNativeDeleteColdUiSource as qualify} from "./current-footprint-inverse-native-delete-cold-ui-source.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCommand as Command} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiReturnData as Data} from "./current-footprint-inverse-native-delete-cold-ui-return-collector.ts";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
// oxlint-disable-next-line import/no-cycle -- Late original Core registry lookup; module initialization cannot issue or register a recipe input.
import {requireOriginalCurrentFootprintInverseNativeDeleteColdUiRecipe} from "./current-pcb-diagnostic-owner.ts";

interface Realm{readonly source:string;readonly scriptId:string;readonly sessionId:string;readonly uniqueContextId:string;readonly contextId:number}
export interface CurrentFootprintInverseNativeDeleteColdUiRecipeBindings{
 readonly ui:Realm;readonly worker:Realm;readonly managerScriptId:string;readonly originalProject:string;readonly maximumTicket:number;
 readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;
 readonly current:()=>void;readonly assertOriginalExit:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly beforeOriginalInvoke:()=>void;
 readonly request:(command:Command,sessionId:string,ownsHelper:boolean)=>Promise<unknown>;
 readonly qualifyHelper:(command:Command,sessionId:string)=>Promise<string>;
 readonly submit:(command:Command,sessionId:string)=>Readonly<{request:Promise<unknown>;written:Promise<void>;assertOriginalWritten:()=>void}>;
 readonly control:(phase:string)=>Promise<void>;readonly poll:()=>Promise<void>;
 readonly retainTombstone:(collector:Tombstone)=>void;readonly retainController:(controller:Controller)=>void;
}
/** No data packet can provide these private bindings; failures leave every
 * created observer retained in Core for its original Job-exit join. */
export async function runCurrentFootprintInverseNativeDeleteColdUiRecipe(token:object):Promise<Data>{
 const b=requireOriginalCurrentFootprintInverseNativeDeleteColdUiRecipe(token);b.current();
 const workerRequest=(command:Command):Promise<unknown>=>b.request(command,b.worker.sessionId,true);
 const workerHelper=async(command:Command):Promise<void>=>{await b.qualifyHelper(command,b.worker.sessionId);};
 const uiRequest=(command:Command):Promise<unknown>=>b.request(command,b.ui.sessionId,true);
 const uiHelper=(command:Command):Promise<string>=>b.qualifyHelper(command,b.ui.sessionId);
 const ownedWorker=await primitives({uniqueContextId:b.worker.uniqueContextId,current:b.current,request:workerRequest,qualifyHelper:workerHelper});b.current();await b.control("complete-worker-primitives");b.current();
 const tombstone=new Tombstone({originalProject:b.originalProject,reflection:ownedWorker.reflection,source:b.worker.source,scriptId:b.worker.scriptId,target:{projectUuid:b.target.projectUuid,branchUuid:b.target.branchUuid,targetUuid:b.target.documentUuid,maximumTicket:b.maximumTicket},
 current:b.current,assertOriginalExit:b.assertOriginalExit,request:workerRequest,qualifyHelper:workerHelper});b.retainTombstone(tombstone);
 const deleted=await tombstone.start();b.current();await b.control("complete-tombstone");b.current();
 const ownedUi=await primitives({uniqueContextId:b.ui.uniqueContextId,current:b.current,request:uiRequest,qualifyHelper:async(command):Promise<void>=>{await uiHelper(command);}});b.current();await b.control("complete-ui-primitives");b.current();
 const actualSender=await sender({uiScriptId:b.ui.scriptId,target:b.target,primitives:ownedUi,current:b.current,request:uiRequest,qualifyHelper:uiHelper});b.current();await b.control("complete-sender");b.current();
 const raw=await uiRequest({phase:"inverse-native-delete-cold-ui",role:"managerSource",method:"Debugger.getScriptSource",params:{scriptId:b.managerScriptId}});b.current();
 if(raw===null||typeof raw!=="object"||!("scriptSource"in raw)||typeof raw.scriptSource!=="string"||Reflect.ownKeys(raw).length!==1){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_MANAGER_SOURCE");}const managerSource=raw.scriptSource;qualify(managerSource,"manager");
 const actualReceiver=await receiver({uiScriptId:b.ui.scriptId,managerScriptId:b.managerScriptId,target:b.target,sender:actualSender,primitives:ownedUi,current:b.current,request:uiRequest,qualifyHelper:uiHelper});b.current();await b.control("complete-receiver");b.current();
 const actualWorker=await worker({originalProject:b.originalProject,originalProof:deleted.proof,source:b.worker.source,scriptId:b.worker.scriptId,expectedChannelName:actualReceiver.channelName,primitives:ownedWorker,target:b.target,current:b.current,request:workerRequest,qualifyHelper:workerHelper});b.current();await b.control("complete-worker");b.current();
 const controller=new Controller({ui:b.ui,manager:{...b.ui,scriptId:b.managerScriptId,source:managerSource},worker:b.worker,sender:actualSender,receiver:actualReceiver,primitives:ownedUi,target:b.target,
 originalWorkerHandler:actualWorker.handler,originalWorkerProject:b.originalProject,originalWorkerNeedData:actualWorker.getNeedData,originalWorkerGetData:deleted.getData,originalWorkerProof:deleted.proof,originalWorkerReflection:ownedWorker.reflection,
 originalManagerPush:actualReceiver.push,originalUiReply:actualSender.reply,originalWorkerFootprint:deleted.footprint,originalManagerFootprint:actualReceiver.footprint,originalManagerWorkerBus:actualReceiver.bus,
 current:():void=>{b.current();tombstone.requireOriginal(deleted);},assertOriginalExit:b.assertOriginalExit,assertOriginalEvent:b.assertOriginalEvent,beforeOriginalInvoke:b.beforeOriginalInvoke,
 request:(command,sessionId):Promise<unknown>=>b.request(command,sessionId,false),submit:b.submit,poll:b.poll});
 b.retainController(controller);const data=await controller.start();b.current();controller.requireOriginal(data);await b.control("complete-call");b.current();return data;
}

import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";

const FIXTURE = `
globalThis.vendorCalls=0;globalThis.getterReads=0;
class BroadcastChannel{constructor(name){this._name=name;}get name(){return this._name;}}
globalThis.BroadcastChannel=BroadcastChannel;
class J{constructor(name){this.bc=new BroadcastChannel(name);this.uuid="11111111-1111-4111-8111-111111111111";}}
class JP{constructor(name){this.bc=new BroadcastChannel(name);this.uuid="22222222-2222-4222-8222-222222222222";}}
class mCe{constructor(){this._lockerTicket=1;this._locker=0;this.isPull=false;this.compiler={PCB:new Map(),FOOTPRINT:new Map()};}}
class sCe{constructor(){this.unique="c".repeat(16);this.client="window_1";}}
class A8e{constructor(channel){Object.assign(this,{uuid:"d".repeat(16),path:"a".repeat(64),windowId:"window_1",
_headType:"PCB",channel,consistencyManager:new sCe(),isProject:true,isInit:true,canSave:true,isInitIng:false,isDestroy:false});}}
class Zu{constructor(channel){this.base=new A8e(channel);this.uuid=this.base.uuid;this.consistencyManager=this.base.consistencyManager;}}
class x{constructor(){this._doctype=3;this._id="d".repeat(16);this._tabId=this._id+"@"+"a".repeat(64);
this.compilerChannel=new mCe();this._compiler=new Zu(this.compilerChannel);
this.compilerChannel.compiler.PCB.set(this._compiler.consistencyManager.unique,this._compiler.base);}}
x.env=new x();
class wi{constructor(){this.map=new Map();}}wi.manager=new wi();wi.otherProjectManagerMap={};
class Z1e{constructor(callback){this.callback=callback;this.isRunning=true;}}
class Oet{constructor(){this.subscribed={"pcb/saveCompiler":[new Z1e(()=>{vendorCalls++;})]};}}
class HJ{constructor(){this.messageBus=new Oet();}}globalThis.MSG_BUS_PCB=new HJ();
class MI{constructor(){this.map=new Map();this.idMap=new Map();this._lastRatline=null;}}MI.manager=new MI();
class mpe{constructor(){this.map=new Map();this.idMap=new Map();this.highLightNets=new Set();this.clickHighlightRatlines=new Set();this.hoverHighlightRatlines=new Set();}}
class U5{constructor(){this.lastTime=-1;this.delay=0;this.func=null;this.animationFrameId=null;}}
class Yde{constructor(){this.map=new Map();this.noneNetMap=new Map();this.netLength=new Map();this.netModify=new Map();
this.rubbish=new Set();this.netOptions=[];this.updateNets={addNet:[],deleteNet:[],updateNetLength:{}};
this.ratlineVisibleBeforeGray={};this.debounce=new U5();}}
class HSe{constructor(){this.map=new Map();}}class USe{constructor(){this.map=new Map();}}
class pP{}pP.map=new Map();class h0{}h0.useWireClusterCache=false;h0.emptyNetChange=true;
globalThis.scope={object:{x,wi,mCe,sCe,A8e,Zu,MI,mpe,U5,Yde,HSe,USe,pP,h0,
jo:new mpe(),ze:new Yde(),h_:new HSe(),aE:new USe()}};
const name="/window_1/project/"+"a".repeat(64);globalThis[name]=new J(name);x.env._compiler.base.dataBus=globalThis[name];
class Gd{}class Lg extends Gd{}class ja{}
globalThis.PROJECT=new Lg();globalThis._TAB_ID_="window_1";
Object.assign(PROJECT,{uuid:"a".repeat(64),_branchUuid:"b".repeat(32),consistencyManager:new ja(),
task1:new Set(),task2:new Set(),task3:new Set(),cachePromise:new Set(),publishTask:new Set(),rollbackPromise:new Set(),
syncPendingNodeUuids:new Set(),confirmedEmptyNodeUuids:new Set(),warnedEmptyNodeUuids:new Set(),
bufferUploadData:new Map(),bufferUploadCache:new Map()});PROJECT.consistencyManager.uniqueIds={};
PROJECT.workerBus=new JP(name);
`;

/** Ordinary VM fixture only. It does not qualify real V8 scopes, browser native
 * BroadcastChannel getters, a renderer, worker or an actual message delivery. */
export function pcbStringObservationFixture(worker = false, change = ""): Context {
  const context = createContext({}, { name: "pcb-string-observation-synthetic" });
  runInContext(FIXTURE + (worker ? 'globalThis[name]=PROJECT.workerBus;' : "") + change, context, { timeout: 1000 });
  return context;
}

export function callPcbStringObservation(context: Context, source: string): unknown {
  return runInContext(`(${source}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback)`,
    context, { timeout: 1000 }) as unknown;
}
export function pcbStringReply(value: unknown): Readonly<{ result: Readonly<{ type: "string"; value: unknown }> }> {
  return { result: { type: "string", value } };
}

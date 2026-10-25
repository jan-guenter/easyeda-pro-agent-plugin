/* oxlint-disable eslint/no-template-curly-in-string, unicorn/prefer-string-raw -- Exact vendor excerpts retain literal template expressions and escapes at fixed source positions. */
/** Inert source excerpts from the fixed209 assets. All application/native
 * collaborators below are synthetic, and only a disposable Node child runs. */
import type { CurrentPcb209RatlineCaptureRole } from "../../src/current-pcb-209-ratline-capture-profile.ts";

const excerpts = {
  "pcb": [
    {
      "start": 13_743,
      "line": 30,
      "column": 12_341,
      "text": "Let=class extends txe{constructor(o,t){super(o),this.worker=t,t.onmessage=e=>{this.processRemoteMessage(e.data,void 0)}}publish(o,t){this.postMessage(o,\"publish\",t)}subscribe(o){this.postMessage(o,\"subscribe\",null)}push(o,t){this.postMessage(o,\"push\",t)}pull(o){this.postMessage(o,\"pull\",null)}rpcCall(o,t,e=sye){return super.rpcCall(o,t,void 0,e)}postMessage(o,t,e){let r={topic:o,type:t,message:e};this.worker.postMessage(r)}discard(){this.worker.terminate()}}"
    },
    {
      "start": 6_443_331,
      "line": 4401,
      "column": 167_184,
      "text": "Ew=class Ew extends Ni{constructor(){super(...arguments);this.busMap={};this.ratlineWorker=new Map;this.workerBus=new Map;this.i=0;this.id=0;this._workerStateMap={}}static getInstance(){return Ew.manager==null&&(Ew.manager=new Ew,Ew.manager.initPool()),Ew.manager}initPool(){}createWorker(e,r=void 0){let n=`&channel=${x.getInstance().channel}&cll=${self.PRO_LOG_LEVEL}`,s=e+n,a=new Worker(s,{name:r});return this.map.set(this.id,a),this.workerBus.set(this.i,new nce(a)),this.ratlineWorker.set(this.i++,a),a}get nextWorkerId(){return this.id}addWorker(e,r=!1,i=void 0){let n=r?\"\":`&cll=${self.PRO_LOG_LEVEL}`,s=e+n,a=new Worker(s,{name:i});this.map.set(this.id,a);let l=new LYe.WorkerMessageBridge(A.messageBus,a);return l.publish(\"workerName\",this.id),this.busMap[this.id]=l,this.id++,l}deleteWorker(e){let r=this.map.get(e);r&&(r.terminate(),this.map.delete(e),delete this.busMap[e],this.clearWorkerState(e))}getLastWorkerId(){return this.id-1}hasWorker(e){return this.map.has(e)}getWorkerState(e,r){let i=this._workerStateMap[e];return i&&i[r]}setWorkerState(e,r,i){if(!this.hasWorker(e))return;let n=this._workerStateMap[e];n||(n=this._workerStateMap[e]={}),n[r]=i}clearWorkerState(e){delete this._workerStateMap[e]}}"
    },
    {
      "start": 6_447_160,
      "line": 4401,
      "column": 171_013,
      "text": "function z3e(o,t=0){setTimeout(()=>{if(ec.modelIsBuilt){let e;typeof o==\"string\"?e=JSON.parse(o):e=o,o=null,kRt(e)}else z3e(o,50)},t)}function kRt(o){console.log(\"dealRatlineResultFromWorker\",\"======================>\",\"start\",new Date().getTime());let t=\"ratlineResultFromWorker-time\";yn(t);let{workerName:e,ratlineRes:r}=o,i=P0.getInstance(),n=i.getWorkerState(e,\"mainThreadRunEnd\"),s=i.getWorkerState(e,\"delayCopper\");i.deleteWorker(e);let a=(r!=null?r:[]).map(u=>u.net);Xh.input(r);let l=Jh,c=new Array;for(let u of a){let d=l.getNet(u);d!=null&&(c.push(d.name),d.showRatline=d.showRatline)}c.length&&A.publish(\"updateRatlineNet\",eq(c),$()),Fn.getInstance().allowPull=!0,E2.consumeNamed(\"init\"),A.publish(\"flushService\",\"\"),console.log(\"\\u98DE\\u7EBF\\u7ED3\\u679C\\u5904\\u7406\\u5B8C\\u6BD5\"),s&&A.publish(\"DelayCopper\",\"\"),n&&A.publish(\"hideLoading\",\"\",$()),GP.getInstance().startPcb(!!s),Wi(t);let h=\"createPcbEditorToRendered-time\";cie(h)&&(Wi(h),hie())}"
    },
    {
      "start": 6_992_856,
      "line": 4595,
      "column": 83_084,
      "text": "A.subscribe(\"ratlineResultFromWorker\",i=>{z3e(i)})"
    }
  ],
  "worker": [
    {
      "start": 4822,
      "line": 0,
      "column": 4822,
      "text": "EY=class extends iA{constructor(t,e){super(t),this.worker=e,e.onmessage=i=>{this.processRemoteMessage(i.data,void 0)}}publish(t,e){this.postMessage(t,\"publish\",e)}subscribe(t){this.postMessage(t,\"subscribe\",null)}push(t,e){this.postMessage(t,\"push\",e)}pull(t){this.postMessage(t,\"pull\",null)}rpcCall(t,e,i=fE){return super.rpcCall(t,e,void 0,i)}postMessage(t,e,i){let r={topic:t,type:e,message:i};this.worker.postMessage(r)}discard(){this.worker.terminate()}}"
    },
    {
      "start": 3_969_183,
      "line": 3609,
      "column": 299_420,
      "text": "Db=class extends Rt{constructor(i){super();this.busMap={};this.ratlineWorker=new Map;this.workerBus=new Map;this.i=0;this.id=0;this._workerStateMap={};this.messageBus=i}addWorker(i,r=!1,n=void 0){let s=r?\"\":`&cll=${self.PRO_LOG_LEVEL}`,a=i+s,o=new Worker(a,{name:n});this.map.set(this.id,o);let l=new jj.WorkerMessageBridge(this.messageBus,o);l.publish(\"workerName\",this.id),this.busMap[this.id]=l;let h=this.id;return this.id++,{bus:l,id:h}}deleteWorker(i){let r=this.map.get(i);r&&(r.terminate(),this.map.delete(i),delete this.busMap[i],this.clearWorkerState(i))}getLastWorkerId(){return this.id-1}hasWorker(i){return this.map.has(i)}getWorkerState(i,r){let n=this._workerStateMap[i];return n&&n[r]}setWorkerState(i,r,n){if(!this.hasWorker(i))return;let s=this._workerStateMap[i];s||(s=this._workerStateMap[i]={}),s[r]=n}clearWorkerState(i){delete this._workerStateMap[i]}}"
    },
    {
      "start": 4_051_686,
      "line": 3610,
      "column": 57_662,
      "text": "iY=new ap.WorkerMessageBridge(sp,self);self.workerBus=iY;sp.subscribe(\"workerName\",t=>{self.workerName=t})"
    },
    {
      "start": 4_052_103,
      "line": 3610,
      "column": 58_079,
      "text": "sp.rpcService($C,t=>{let{world:e}=t;e&&(console.log(\"rebuildRatlineInWorker\",\"======================>\",\"start\",new Date().getTime()),nt.getInstance().currOpenProjectId=e.projectId,nt.getInstance().needNum=!1,nt.getInstance().workerName=$C,Yi.getInstance().bindListener(new Nb),zs.getInstance().bindListener(new kb),setTimeout(async()=>{let i=async()=>{var E;FC(e);let m=`/${(E=Da())==null?void 0:E._TAB_ID_}/project/${nt.getInstance().projectId}`,b=Da(),_=b[m]=b[m]||new ap.BroadcastChannelMessageBus(m),O={doc:[nt.getInstance().id]},y=await _.rpcCall(\"/mgr/projectWorker/pcb/getCanvas\",O);if(!y.success)throw new Error(\"\\u83B7\\u53D6\\u6570\\u636E\\u5931\\u8D25\\uFF01\\uFF01\\uFF01\",y);let x=nt.getInstance().compiler,v=new M5(x);v.watch=!1,v.dataBus=_,x.setHandle(new n0(v));let I=new A5(x);return y.channel&&await(0,ap.flowRead)(y.channel,I.flowParseFull()),v};async function r(g){return await g.parseFootAndDevice(),g.dataBus=null,g.build(),g.netGroupMap}async function n(){let g=await i();return await r(g)}async function s(){let g=await n(),m=new K1;m.sycnLayers().classify();let b=new Bb(m),_=b.generateData(g),O=new Array;for(let y of _)O.push(b.stringify(y,g));return O}function a(){return new zb(\"2.0\",3).getCommonSource()}let o=await s(),l=new Db(sp),{bus:h,id:u}=l.addWorker(\"editor?entry=pcb-ratline-worker.js\",!0,\"pcb-ratline-worker\");(await h.rpcCall(\"ratlineEnviromentInit\",a(),oE)).message;let c=new Array;for(;o.length>0;){let g=(await h.rpcCall(\"singrebuildRatlineTopic\",o.pop(),oE)).message;ri.addAll(c,g)}l.deleteWorker(u);let p=\"ratlineResultFromWorker\",d={ratlineRes:c,workerName:self.workerName},f=JSON.stringify(d);iY.publish(p,f)},0))})"
    }
  ]
} as const;
const common = `"use strict";globalThis.CAPTURE_DONE=false;const noop=()=>{};const console={log:noop,debug:noop};class Worker{postMessage(){}terminate(){}}
class Base{constructor(bus){this.bus=bus;}rpcCall(){return Promise.resolve({message:[]});}}class Registry{constructor(){this.map=new Map;}}`;
const pcbPrelude = `var Let,Ew,P0;const txe=Base,Ni=Registry;const A={messageBus:{},subscribe(topic,callback){this.callback=callback;},publish:noop};
const LYe={get WorkerMessageBridge(){return Let;}},sye=500,self={PRO_LOG_LEVEL:0},ec={modelIsBuilt:true};
const Xh={input:noop},Jh={getNet:noop},compiler={allowPull:false},Fn={getInstance:()=>compiler},E2={consumeNamed:noop},GP={getInstance:()=>({startPcb:noop})};
const yn=noop,Wi=noop,cie=()=>true,hie=()=>{globalThis.CAPTURE_DONE=true;},eq=noop,$=()=>({});`;
const workerPrelude = `var EY,Db,iY;const iA=Base,Rt=Registry,fE=500,oE=500;const self={PRO_LOG_LEVEL:0,postMessage(){globalThis.CAPTURE_DONE=true;}};
const sp={listeners:new Map,services:new Map,subscribe(topic,callback){this.listeners.set(topic,callback);},rpcService(topic,callback){this.services.set(topic,callback);}};
const jj={get WorkerMessageBridge(){return EY;}},ap={get WorkerMessageBridge(){return EY;},BroadcastChannelMessageBus:class{rpcCall(){return Promise.resolve({success:true,channel:null});}}};
const state={projectId:"a".repeat(64),id:"b".repeat(32),compiler:{setHandle:noop}},nt={getInstance:()=>state},root={_TAB_ID_:"window"},Da=()=>root,FC=noop;
const $C="rebuildRatlineInWorker",Yi={getInstance:()=>({bindListener:noop})},zs=Yi,Nb=class{},kb=class{},n0=class{},A5=class{};
class M5{parseFootAndDevice(){return Promise.resolve();}build(){this.netGroupMap=new Map;}}class K1{sycnLayers(){return this;}classify(){return this;}}
class Bb{generateData(){return [];}stringify(){return "";}}class zb{getCommonSource(){return "";}}const ri={addAll:noop};`;
export function ratlineCaptureFixtureSource(role: CurrentPcb209RatlineCaptureRole, holdPcbResult = false): string {
 let source = (`${common}${role === "pcb" ? pcbPrelude : workerPrelude}`).replaceAll("\n", " ");
 for (const section of excerpts[role]) {
  const line = source.split("\n").length - 1, newlines = section.line - line;
  source += newlines === 0 ? " ".repeat(section.start - source.length) :
    " ".repeat(section.start - source.length - newlines - section.column) + "\n".repeat(newlines) + " ".repeat(section.column);
  if (source.length !== section.start || source.split("\n").length - 1 !== section.line || source.length - source.lastIndexOf("\n") - 1 !== section.column) { throw new Error("Fixture offset"); }
  source += `${section.text};`;
 }
 return source + (role === "pcb" ? `P0=Ew;const manager=Ew.getInstance();manager.addWorker("editor?entry=pcb-ratline-worker.js",false,"pcb-ratline-worker");${holdPcbResult ? "" : "A.callback(JSON.stringify({ratlineRes:[],workerName:0}));"}` :
 `sp.listeners.get("workerName")(0);sp.services.get($C)({world:{uuid:"b".repeat(32),docType:3,projectId:"a".repeat(64),env:{tabId:"pcb",windowTabId:"window"}}});`);
}

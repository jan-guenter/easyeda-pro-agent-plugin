/** Synthetic scopes only. No native manager initialization or callback runs. */
import { runInContext } from "node:vm";
import type { Context } from "node:vm";
import { pcbStringObservationFixture, pcbStringReply } from "./current-pcb-string-observation-fixture.ts";
import { CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING, currentPcbTeardropSources } from "./current-pcb-teardrop-fixture.ts";

const SETUP = `
Object.assign(x.env._compiler.base,{pendCacheLength:0,pendCache:{},cache:{},deleteCache:new Map(),sub:[]});
Object.assign(x.env._compiler.base.consistencyManager,{maxTicket:10,isPendChange:false,isLocalChange:false});
class FP{constructor(){this.openPcb=false;}}FP.manager=new FP();
class Of{constructor(){this.map=new Map();this.busMap={};this.ratlineWorker=new Map();this.workerBus=new Map();this._workerStateMap={};this.id=1;this.i=0;}}Of.manager=new Of();
class qI{constructor(){this.data=new Set();}}qI.proxy=new qI();
class e5{constructor(){this.data=new Set();}}e5.proxy=new e5();
class pE{constructor(){this.flag=false;}}pE.proxy=new pE();
class De{}class kde{constructor(){this.undoCommand=[];this.redoCommand=[];this.stack=null;}}
class Sfe{constructor(){this.isMove=false;this.suspend=true;this.modify=new Set();this.task=new Set();this.modifyTears=new Set();this.timeoutId=null;}${currentPcbTeardropSources.join("")}}
Object.assign(scope.object,{FP,Of,qI,e5,pE,De,Xe:new kde()});
producerConstructors[0]=kde;producerConstructors[1]=Sfe;
const tearsOwner=new Sfe();${CURRENT_PCB_TEARDROP_SYNTHETIC_BINDING}
`;
export function pcbLazyOwnerFixture(change = ""): Context { return pcbStringObservationFixture(false, SETUP + change); }
export function pcbLazyOwnerExpression(program: string): string {
  return `(${program}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback,producerConstructors,teardropProof)`;
}
export function pcbLazyOwnerReply(program: string, context: Context): ReturnType<typeof pcbStringReply> {
  return pcbStringReply(runInContext(pcbLazyOwnerExpression(program), context, { timeout: 1000 }) as unknown);
}

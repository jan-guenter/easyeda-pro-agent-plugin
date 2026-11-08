/** Source-position-preserving manager fixture with explicit in-memory service and worker seams. */
import {CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE,qualifyCurrentFootprintInverseInitializedGetSource} from "../../src/current-footprint-inverse-initialized-get-source.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE as DELETE_SOURCE,qualifyCurrentFootprintInverseDeleteManagerSource} from "../../src/current-footprint-inverse-delete-manager-source.ts";

/** Retain the original registry, registration and method bytes without starting any bridge. */
export function buildInertInverseDeleteMethodManager(full:string):string{
 qualifyCurrentFootprintInverseInitializedGetSource(full,"manager");qualifyCurrentFootprintInverseDeleteManagerSource(full);
 const intro='(()=>{let Ee;const J={footprint:{get:"/mgr/projectWorker/footprint/get",delete:"/mgr/projectWorker/footprint/delete"}};';
 let source=intro+full.split("").map(value=>value==="\n"||value==="\r"?value:" ").join("").slice(intro.length);
 const pieces=[{start:1_701_619,end:1_702_368,prefix:";",suffix:";"},{start:SOURCE.managerProjectGetData.start,end:SOURCE.managerProjectGetData.end,prefix:";var V0=class{constructor(t){this.project=t}",suffix:""},{start:DELETE_SOURCE.method.start,end:DELETE_SOURCE.method.end,prefix:"",suffix:"};"},...(["managerApplyArguments","managerProjectLookup","managerRegisterService"]as const).map(role=>({start:SOURCE[role].start,end:SOURCE[role].end,prefix:";",suffix:";"})),{start:SOURCE.managerRegisterGetCallback1.start,end:SOURCE.managerRegisterGetCallback1.end,prefix:';Ee={messageBus:inertBus};V("/PrjDB/footprint/getData",',suffix:");"},{start:DELETE_SOURCE.handler.start,end:DELETE_SOURCE.handler.end,prefix:';Ee={messageBus:inertBus};inertBus.subscribed["/PrjDB/footprint/delete"]=[];V("/PrjDB/footprint/delete",(function(t){globalThis.inertDeleteBody=t;return t})(',suffix:"));"}];
 for(const piece of pieces.toSorted((a,b)=>a.start-b.start)){source=source.slice(0,piece.start-piece.prefix.length)+piece.prefix+full.slice(piece.start,piece.end)+piece.suffix+source.slice(piece.end+piece.suffix.length);}
 return `${source};globalThis.inertNativeCalls=0;const project={uuid:"a".repeat(64),isReady:true,workerBus:{rpcCall(){inertNativeCalls++;return Promise.resolve({success:true})}}};project.footprint=new V0(project);el.tool=new el;el.tool.map.set(project.uuid,project);globalThis.inertDeleteMethod=V0.prototype.deleteData;globalThis.inertManagerProject=project;})();`;
}

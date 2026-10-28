/** Inert descriptor relationships; no vendor producer body executes. */
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as PROFILES } from "../../src/current-footprint-copy-dependency-profiles.ts";

export function footprintDependencyWorldSource(): string {
  const selected = PROFILES.map(profile => ({ key: profile.key, kind: profile.kind, parent: profile.parent }));
  return `const selected=${JSON.stringify(selected)};let calls=0;const scope={};const stop=()=>{calls++;throw Error('invoked');};
    function define(name,parent){if(scope[name])return scope[name];const inherited=parent??selected.find(p=>p.key===name)?.parent;const base=inherited?define(inherited):null;const c=base?class extends base{}:class{};scope[name]=c;return c;}
    for(const [name,parent]of [['Gd',null],['Lg','Gd'],['Pi',null],['ar','Pi'],['Tg','ar'],['zy',null],['Vc','zy'],['ja','Vc'],['Mb',null],['KP','Mb'],['JP','KP']])define(name,parent);
    for(const p of selected.filter(p=>p.kind==='class'))define(p.key,p.parent);
    for(const p of selected){if(p.kind==='function')scope[p.key]=stop;else if(p.kind==='method'){const [owner,key]=p.key.split('.');Object.defineProperty(scope[owner].prototype,key,{value:stop,writable:true,enumerable:false,configurable:true});}}
    for(const key of ['qe','Qe','Ke','Ni','cg'])scope[key]=stop;
    const project=Object.create(scope.Lg.prototype),manager=Object.create(scope.Tg.prototype),consistency=Object.create(scope.ja.prototype),bus={};
    const constructors=[scope.Tg,scope.ar,scope.Pi,scope.ja,scope.Vc,scope.zy],lexicals=[stop,stop,scope.qe,scope.Qe,scope.Ke,scope.Ni,scope.cg,{}, {},'|\\n'];
    const notification=Object.create(scope.JP.prototype);notification.uuid='12345678-1234-1234-1234-123456789abc';notification.rpcTicket=1;
    Object.assign(project,{workerBus:bus,footprint:manager,consistencyManager:consistency,wsBus:notification,cache:{},localCache:{}});Object.assign(manager,{projectManager:project,user:undefined});
    globalThis.PROJECT=project;globalThis._TAB_ID_='tab';globalThis['/tab/notify']=notification;
  `;
}

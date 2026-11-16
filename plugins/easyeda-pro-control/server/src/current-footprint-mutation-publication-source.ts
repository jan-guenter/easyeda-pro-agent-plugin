/** Exact current209 mutation parsing/publication comparison data.
 * Complete source equality supplies no original parser, callback, native
 * owner, clock, transport, mutation or saved-result authority. */
import {createHash} from "node:crypto";
import {qualifyCurrentProjectSaveStructureSource} from "./current-project-save-structure-source.ts";
import {CURRENT_FOOTPRINT_COPY_ASYNC_PROFILES as CALLBACKS} from "./current-footprint-copy-async-profiles.ts";
import {CURRENT_GENERATED_INITIAL_CACHE_SOURCE as INITIAL} from "./current-generated-initial-cache-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_MUTATION_PUBLICATION_METHODS=freezeDeep({
  "zy.parseFull": {
    "start": 238_798,
    "end": 239_200,
    "bytes": 402,
    "sha256": "f5b73dd5b56d8a29e08df9726f2ccb397b4572fb07300d0fdcf0d21e7bed5af3",
    "lineNumber": 3,
    "columnNumber": 536,
    "source": "parseFull(e,t,s){let r=t,i=s,n,a=null;Ro(e,(o,c,l)=>{let u=JSON.parse(o);if(u.type===\"EDIT_HEAD\")a=JSON.parse(c),this.onEditHead&&this.onEditHead(a);else if(u.type===\"DOCHEAD\"){let h=JSON.parse(c);i=h.docType,r=h.uuid,n=h.client,h.ticket=u.ticket,this.onDocHead(h,a,l)}else this.onLine(u.id,u.ticket,c,u.type,u.client||n,i,r,u.firstTicket,u.pend,a,u.num,l)},void 0,this.throwError),this.onEnd(),e=null}"
  },
  "ja.parseFull": {
    "start": 274_991,
    "end": 275_156,
    "bytes": 165,
    "sha256": "25704701f7723aa391b5ae1ca283a14fbd8ddfb622365a9446cdca4b78b269ba",
    "lineNumber": 9,
    "columnNumber": 7632,
    "source": "parseFull(e,t,s,r){let i=[];if(r)for(let n of r)this.orderTree.has(n)&&(i.push(n),this.orderTree.delete(n));super.parseFull(e,t,s),i.length&&this.reCalcOrderTree(i)}"
  },
  "ja.onLine": {
    "start": 274_888,
    "end": 274_991,
    "bytes": 103,
    "sha256": "c5f3dbc0e5309e5d3d1350c47bf5d5e64d2896163bc602e1cbab7e1f8a1b146d",
    "lineNumber": 9,
    "columnNumber": 7529,
    "source": "onLine(e,t,s,r,i,n,a,o,c,l,u,h,p){this.remoteChange(t,i,a,e,s,r,n,void 0,o,c,l,void 0,void 0,void 0,p)}"
  },
  "ja.onDocHead": {
    "start": 275_156,
    "end": 276_360,
    "bytes": 1204,
    "sha256": "0d8998d30474148fde6795b3fde0c6a57b8c57b1dbdf089aa9f24ac1f4b3452f",
    "lineNumber": 9,
    "columnNumber": 7797,
    "source": "onDocHead(e,t,s,r){r&&e!=null&&e.uuid&&e!=null&&e.updateTime&&(this.historyDocHead[r.uuid]||(this.historyDocHead[r.uuid]={}),(!this.historyDocHead[r.uuid][e.uuid]||this.historyDocHead[r.uuid][e.uuid].updateTime<e.updateTime)&&(this.historyDocHead[r.uuid][e.uuid]=e)),e.updateTime=e.updateTime||(t==null?void 0:t.updateTime),e.user=e.user||{uuid:t==null?void 0:t.uuid,username:t==null?void 0:t.username,nickname:t==null?void 0:t.nickname},this.setMaxTicket(e.ticket),this.docHead[e.uuid]?(!this.docHead[e.uuid].updateTime||this.docHead[e.uuid].updateTime<e.updateTime)&&(this.docHead[e.uuid].client=e.uuid,this.docHead[e.uuid].user=e.user,this.docHead[e.uuid].updateTime=e.updateTime,this.docHead[e.uuid].version=e.version,this.docHead[e.uuid].docType=e.docType,this.docHead[e.uuid].uuid=e.uuid,this.docHead[e.uuid].editVersion=e.editVersion,e.ticket&&e.ticket>this.docHead[e.uuid].ticket&&(this.docHead[e.uuid].ticket=e.ticket)):this.docHead[e.uuid]=e,this.creators[e.uuid]?this.creators[e.uuid].createTime>e.updateTime&&(this.creators[e.uuid].createTime=e.updateTime,this.creators[e.uuid].creator=e.user):this.creators[e.uuid]={createTime:e.updateTime,creator:e.user};for(let i of this.headCbArr)i(e,t)}"
  },
  "ja.remoteChange": {
    "start": 295_994,
    "end": 298_668,
    "bytes": 2674,
    "sha256": "f11159ef785df5c8474c957458af4e69140ece319c74f266e8ac09041b95a527",
    "lineNumber": 17,
    "columnNumber": 1363,
    "source": "remoteChange(e,t,s,r,i,n,a,o,c,l,u,h,p,d,m){var f,g,y,b,E,T;this.setMaxTicket(e),a&&this.setDoctype(s,a),a=this.getDoctype(s),o=o||h===this.getUnique();let w=this.caseInsensitiveTypes.has(n),S=w?r.toUpperCase():r,v=r,_=(b=(y=(g=(f=this.wDocData)==null?void 0:f.get)==null?void 0:g.call(f,s))==null?void 0:y.get(S))==null?void 0:b.last;h&&(this.uniqueIds[h]||(this.uniqueIds[h]={}),this.uniqueIds[h][s]||(this.uniqueIds[h][s]=new Set),this.uniqueIds[h][s].add(S)),this.wDocData.get(s)||this.wDocData.set(s,new Map),this.wDocData.get(s).has(S)||this.wDocData.get(s).set(S,{last:null});let I=this.wDocData.get(s).get(S),A=_?At.getFirstTicket(I):null,x=_&&_.ticket===e&&_.client===t&&!!_.pend!=!!l,C=n!==\"ELE_PLACEHOLDER\"&&n!==\"META_PLACEHOLDER\"&&(!o||o&&this.getIsLocalChange())&&(!x||x&&this.getIsPendChange()),L=At.find(I,P=>P.client===t&&P.ticket===e);if(L){this.setDocMaxTicket(s,e,l),m&&(L.hId&&L.hId!==m.uuid&&(L.hIds||(L.hIds=[]),L.hIds.includes(L.hId)||L.hIds.push(L.hId)),L.hId=m.uuid,L.hNum=m.num,L.start=m.start,m.size&&(L.size=m.size),m.hClient&&(L.hClient=m.hClient),m.dNum&&(L.dNum=m.dNum)),this.getCache&&!this.cacheType.includes(n)&&(E=L.data)!=null&&E.length&&L!=null&&L.hId&&delete L.data,L.pend&&!l&&(delete L.pend,C&&L===I.last&&this.publishChange(s,v,i,n,t,e,At.getFirstTicket(I),l,void 0,x,h,void 0,(T=At.getPreLastNode(I))==null?void 0:T.dataType)),n===\"PAD_NET\"&&this.syncPadNet(s,S);return}let z=e;if(l){let P=[];At.preForEach(I,R=>R.client===t&&R.pend&&R.ticket<e?(P.push(R),!0):!1),P.length&&P.length===At.getLength(I)&&(z=A||e),P.forEach(R=>{At.remove(I,R)})}let H={client:t,ticket:z,dataType:n};w&&(H.actualId=v),m&&(H.hId=m.uuid,H.hNum=m.num,H.start=m.start,m.size&&(H.size=m.size),m.hClient&&(H.hClient=m.hClient),m.dNum&&(H.dNum=m.dNum)),(!this.getCache||!H.hId||!i||this.cacheType.includes(n)||l)&&(H.data=l?i:this.safeString(i)),c!==void 0&&(H.firstTicket=c),l!==void 0&&(H.pend=l),h!==void 0&&(H.unique=h);let k=!_||_.ticket<e||_.ticket===e&&_.client<t;At.insert(I,H);let B=At.getFirstTicket(I);if(this.orderTree.has(s)&&(!_||A>B))try{this.orderTree.setOrderNum(s,this.getDoctype(s),S,I,!0,A&&A>B)}catch(P){console.error(P)}if(this.needDocIdDoctype.includes(a)&&i)if(a===\"SCH_PAGE\"&&n===\"META_PLACEHOLDER\"){let P=JSON.parse(i),R=S.split(\"_\"),O=S.split(\"_\")[0],j=R[1]?R[1]:O;this.docIds.setOrderNum(j,O,B,t,P.max)}else if(a===\"SCH_PAGE\"&&n===\"META\"){let P=JSON.parse(i);this.docIds.setOrderNum(s,P.schematic,B,t)}else n===\"META\"&&this.docIds.setOrderNum(s,a,B,t);if(this.setDocMaxTicket(s,z,l),k){let P=At.getFirstTicket(I);C&&this.publishChange(s,v,i,n,t,e,P,l,void 0,x,h,void 0,_==null?void 0:_.dataType)}n===\"PAD_NET\"&&this.syncPadNet(s,S)}"
  },
  "Vc.publishChange": {
    "start": 243_107,
    "end": 243_200,
    "bytes": 93,
    "sha256": "aa8e7d3b416f74314dd922d620f1f3728ec386e9f503d28987f9498bd9636877",
    "lineNumber": 4,
    "columnNumber": 3695,
    "source": "publishChange(e,t,s,r,i,n,a,o,c,l,u,h,p){this.cbArr.forEach(d=>d(e,t,s,r,i,n,a,o,c,l,u,h,p))}"
  },
  "Nd": {
    "start": 1_847_057,
    "end": 1_847_248,
    "bytes": 191,
    "sha256": "99fca9f1568807ff06f32f3fba55b490def72b5b07d9325974dc153db217909e",
    "lineNumber": 108,
    "columnNumber": 145_561,
    "source": "function Nd(e){let t=null,s=null,r;return(...i)=>(r=i,t?(s||(s=(async()=>{try{await t,t=s,s=null,await e(...r)}finally{t=null}})()),s):(t=(async()=>{try{await e(...r)}finally{t=null}})(),t))}"
  },
  "Pi.newTicket": {
    "start": 1_856_510,
    "end": 1_856_613,
    "bytes": 103,
    "sha256": "b2e4944fdd2d9d7ceaaba8b9b3ff803e12fd8f86eb782a987057ba2ea4c924df",
    "lineNumber": 109,
    "columnNumber": 9197,
    "source": "get newTicket(){let t=this.maxTicket+1;return this.projectManager.consistencyManager.setMaxTicket(t),t}"
  },
  "ar.setEditData": {
    "start": 1_857_186,
    "end": 1_857_789,
    "bytes": 603,
    "sha256": "0f0d25706407a59aa9e31b4c21723b7d66ab4e5aa605c6c13ff0c4754dd8f860",
    "lineNumber": 109,
    "columnNumber": 9873,
    "source": "setEditData(s,r,i,n,a,o){var l,u;let c=o===this.client;if(!this.data[s])this.data[s]={[this.mainKey]:s,creator:r,createTime:i,modifier:r,updateTime:i,version:n,path:this.projectManager.uuid,owner:{uuid:this.projectManager.uuid,nickname:(u=(l=this.projectManager)==null?void 0:l.projectDetails)==null?void 0:u.name}},a&&this.projectManager.notifyWatcher(a,{uuid:s,projectId:this.projectManager.uuid,localChange:c});else{let h=this.data[s];(!h.createTime||i<h.createTime)&&(h.createTime=i,h.creator=r),(!h.updateTime||h.updateTime<i)&&(h.updateTime=i,r&&(h.modifier=r),h.version=n,this.publishUpdate(s))}}"
  },
  "Tg.onDataChange": {
    "start": 1_878_825,
    "end": 1_879_756,
    "bytes": 931,
    "sha256": "a6d8254ca882842724fc5ab8d35ddc8d90b6088d74828f23465cb26a9e842356",
    "lineNumber": 109,
    "columnNumber": 31_512,
    "source": "onDataChange(s,r,i,n,a,o,c,l,u,h,p){let d=this.projectManager.uuid,m=a===this.client;this.data[s]||(this.data[s]={uuid:s},this.projectManager.notifyWatcher(be.FOOTPRINT.ON_ADD,{uuid:s,projectId:d,localChange:m}));let f=this.data[s];switch((!f.ticket||f.ticket<o)&&(f.ticket=o),n){case De.META:{let g=i?JSON.parse(i):null;f.source=g.source,f.title=g.title,f.description=g.description,f.tags=g.tags,!h&&!f.isDelete&&this.projectManager.notifyWatcher(be.FOOTPRINT.ON_UPDATE,{uuid:s,projectId:d,localChange:m}),this.publishCanvas(s,a,o,r,JSON.stringify(this.data[s]),n,c,l,u,h,p);break}case De.DELETE_DOC:{let g=i?JSON.parse(i):null;g&&g.isDelete?(f.isDelete=!0,!h&&this.projectManager.notifyWatcher(be.FOOTPRINT.ON_DELETE,{uuid:s,projectId:d,localChange:m})):(f.isDelete=!1,!h&&this.projectManager.notifyWatcher(be.FOOTPRINT.ON_ADD,{uuid:s,projectId:d,localChange:m}));break}default:{this.publishCanvas(s,a,o,r,i,n,c,l,u,h,p);break}}}"
  },
  "Lg.onHeadChange": {
    "start": 2_119_189,
    "end": 2_120_251,
    "bytes": 1062,
    "sha256": "898da83f178027276c6ecfcaf80ec0530ff6b72b3002e73ddad731e605a8566b",
    "lineNumber": 110,
    "columnNumber": 104_979,
    "source": "onHeadChange(s,r){var l;let i=(s==null?void 0:s.user)||{uuid:r==null?void 0:r.uuid,username:r==null?void 0:r.username,nickname:r==null?void 0:r.nickname},n=s.client,a=s.uuid,o=s.updateTime||(r==null?void 0:r.updateTime),c=s.version;switch(s.docType){case ve.CONFIG:break;case ve.BOARD:break;case ve.SCH:{this.schematic.setEditData(a,i,o,c,be.SCHEMATIC.ON_ADD,n);break}case ve.SCH_PAGE:{this.sheet.setEditData(a,i,o,c,be.SHEET.ON_ADD,n);let u=(l=this.sheet.data[a])==null?void 0:l.schematic;u&&this.schematic.setEditData(u,i,o,c);break}case ve.SIMULATION:{this.simulation.setEditData(a,i,o,c,be.SIMULATION.ON_ADD,n);break}case ve.PCB:{this.pcb.setEditData(a,i,o,c,be.PCB.ON_ADD,n);break}case ve.PANEL:{this.panel.setEditData(a,i,o,c,be.PANEL.ON_ADD,n);break}case ve.SYMBOL:{this.symbol.setEditData(a,i,o,c,be.SYMBOL.ON_ADD,n);break}case ve.FOOTPRINT:{this.footprint.setEditData(a,i,o,c,be.FOOTPRINT.ON_ADD,n);break}case ve.DEVICE:{this.device.setEditData(a,i,o,c,be.DEVICE.ON_ADD,n);break}case ve.INSTANCE:break;case ve.BLOB:break}this.publishMaxTicket(s.ticket)}"
  },
  "Lg.publishMaxTicket": {
    "start": 2_107_959,
    "end": 2_108_156,
    "bytes": 197,
    "sha256": "dae5d1960197a79cec105faf613f2a2f97abd9383907943d7d665f16a00f93b1",
    "lineNumber": 110,
    "columnNumber": 93_749,
    "source": "publishMaxTicket(s){!s||!this.canWsPublish()||this.wsBus.publish(\"/pro-mgr/notify/send\",{topic:\"/document/sendMsg/cooperation\",uuid:\"pendData\",path:this.branchUuid,msg:{type:\"pendData\",ticket:s}})}"
  },
  "Lg.localPublishTicket": {
    "start": 2_108_156,
    "end": 2_108_544,
    "bytes": 388,
    "sha256": "64330265b94b7b37d13e4c9acc7f77e91e886269a4fc9f44538e58bf0f9cc9aa",
    "lineNumber": 110,
    "columnNumber": 93_946,
    "source": "localPublishTicket(s){if(s){this.isReady&&this.workerBus.publish(\"/pro-mgr/project/ticket\",{ticket:s,force:!0}),this.publishTimer&&clearTimeout(this.publishTimer),this.publishTimer=null;return}this.publishTimer||(this.publishTimer=setTimeout(()=>{this.isReady&&this.workerBus.publish(\"/pro-mgr/project/ticket\",{ticket:this.consistencyManager.getMaxTicket()}),this.publishTimer=null},20))}"
  }
} as const);
export const CURRENT_FOOTPRINT_MUTATION_PUBLICATION_CALLBACKS=freezeDeep(CALLBACKS.slice(0,2));
export interface CurrentFootprintMutationPublicationSource{readonly profile:"private.current-footprint-mutation-publication-source.v1";readonly sourceQualified:true;readonly originalObjectsQualified:false;readonly executionAuthorized:false}
const originals=new WeakSet<object>();
function need(value:boolean):asserts value{
if(!value){
throw new Error("FOOTPRINT_MUTATION_PUBLICATION_SOURCE");
}
}
/** Qualify complete current209 worker bytes and every retained method,
 * helper and callback span before any pure source projection is selected. */
export function qualifyCurrentFootprintMutationPublicationSource(input:unknown):CurrentFootprintMutationPublicationSource{
 qualifyCurrentProjectSaveStructureSource(input);
need(typeof input==="string");
 for(const row
 of [...Object.values(CURRENT_FOOTPRINT_MUTATION_PUBLICATION_METHODS),INITIAL.Gu,INITIAL.Ro,...CURRENT_FOOTPRINT_MUTATION_PUBLICATION_CALLBACKS]){
  const text=input.slice(row.start,row.end);
need(Buffer.byteLength(text)===row.bytes&&createHash("sha256").update(text).digest("hex")===row.sha256);
  if("source"in row){
need(text===row.source);
}
 }
 const token=Object.freeze({profile:"private.current-footprint-mutation-publication-source.v1",sourceQualified:true,originalObjectsQualified:false,executionAuthorized:false} as const);
originals.add(token);
return token;
}
/** Refuse copied source packets; source reproof supplies no original object,
 * ownership, request, callback, clock or continuation authority. */
export function requireCurrentFootprintMutationPublicationSource(token:CurrentFootprintMutationPublicationSource):void{
need(originals.has(token));
}

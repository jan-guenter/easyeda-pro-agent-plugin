/** Exact original histories API and initial cache projection source. These
 * pure source facts grant no request, worker, cache or writer authority. */
/* oxlint-disable eslint/no-template-curly-in-string -- Complete pinned vendor functions are literal source data. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import { qualifyCurrentProjectSaveProducerSource } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_INITIAL_CACHE_SOURCE = freezeDeep({
  "Gu": {
    "realm": "worker",
    "start": 238_153,
    "end": 238_192,
    "bytes": 39,
    "sha256": "34a339f4a743842890c591b8b8253e730cf36c57073cbf6aae3153f4e4f911c7",
    "source": "function Gu(e,t,s){return e.slice(t,s)}"
  },
  "Ro": {
    "realm": "worker",
    "start": 238_192,
    "end": 238_565,
    "bytes": 373,
    "sha256": "fd048ca1f24caee0d2f52eee1cd93a869e05a678be8f557e8cf2f53d7a50f9f7",
    "source": "function Ro(e,t,s,r){let i=e.length,n=0;for(;n<i;){let a=e.indexOf(`|\n`,n);if(a<0){if(s)return e.substring(n);a=i}let o=Gu(e,n,a);try{if(o){let c=o.indexOf(\"||\"),l=c>-1,u=l?Gu(o,0,c):o,h=l?Gu(o,c+2):\"\";if(t(u,h,o,l?n+c+2:n)===!1){o=null;break}o=null}}catch(c){if(console.error(c),r)throw new Error((c==null?void 0:c.message)||\"\\u89E3\\u6790\\u5931\\u8D25\\uFF01\")}n=a+2}e=null}"
  },
  "groupTypes": {
    "realm": "worker",
    "start": 238_569,
    "end": 238_708,
    "bytes": 139,
    "sha256": "b73b47a13493982256e5259cd19d032a47e3f7a4199e25e62ce63941a74acd59",
    "source": "rI=[\"SYMBOL\",\"FOOTPRINT\",\"BLOB\",\"FONT\",\"PANEL_LIB\",\"DEVICE\",\"BOARD\",\"INSTANCE\",\"CONFIG\",\"VARIANT\",\"COMPONENT_GROUP\",\"COMPONENT_GROUP_DATA\"]"
  },
  "Na": {
    "realm": "worker",
    "start": 238_709,
    "end": 238_752,
    "bytes": 43,
    "sha256": "b600911e11b7f1ee9a6b64c97ae33885953e22b09e846adeaa14c91ae5c53578",
    "source": "function Na(e,t){return rI.includes(t)?t:e}"
  },
  "flowParseFull": {
    "realm": "worker",
    "start": 239_200,
    "end": 241_089,
    "bytes": 1889,
    "sha256": "0a32d5d522f214faab4283c24bf666cbd67536c2087a47c989ff8763c4c61e34",
    "source": "flowParseFull(e={}){let{cache:t,chunkLength:s=100*1024*1024,idsData:r,history:i}=e,n=\"\",a=null,o,c=null,l=!0,u=\"\",h=0,p=!1,d={},m=t?{}:void 0,f=new Set,g=E=>{m[E]===void 0&&(m[E]=-1),t(E,++m[E],d[E].data.join(`|\n`)),d[E].data.length=0,d[E].size=0,d[E].data.push(d[E].head),d[E].size+=d[E].head.length},y=E=>{if(f.add(n),!t)return;let T=Na(n,a);d[T].data.push(E),d[T].size+=(d[T].size?2:0)+E.length,d[T].size+E.length>s&&g(T)},b=(E,T)=>Ro(E,(w,S,v,_)=>{var I,A,x,C,L,z,H,k;let B=JSON.parse(w);if(B.type===\"EDIT_HEAD\")c=JSON.parse(S),(I=this.onEditHead)==null||I.call(this,c),(A=e.onEditHead)==null||A.call(e,c),p=!0;else if(B.type===\"DOCHEAD\"){let P=JSON.parse(S);a=P.docType,n=P.uuid,o=P.client,P.ticket=B.ticket,p||(c={uuid:P.uuid,username:(x=P==null?void 0:P.user)==null?void 0:x.username,nickname:(C=P==null?void 0:P.user)==null?void 0:C.nickname,updateTime:P==null?void 0:P.updateTime},(L=e.onEditHead)==null||L.call(e,c),p=!0),this.onDocHead(P,c,v,i);let R=Na(n,a);t&&!d[R]&&(d[R]={size:0,data:[],head:\"\"}),t&&(d[R].head=v),y(v)}else{let P=B.num,R=B.client||o;if(r){let O=(k=(H=(z=r.ids)==null?void 0:z[n])==null?void 0:H[R])==null?void 0:k[B.id];if(!O||O[0]!==B.ticket)return;P=O[1],r.size-=1,delete r.ids[n][R][B.id]}if(i){let O=Na(n,a);t&&(i.dNum=(m==null?void 0:m[O])===void 0?0:(m==null?void 0:m[O])+1),i.start=t?d[O].size+2+w.length+2:h+_,i.size=v.length,B.client&&(i.hClient=!0)}this.onLine(B.id,B.ticket,S,B.type,R,a,n,B.firstTicket,B.pend,c||(i==null?void 0:i.editHead),P,v,i),y(v)}},T,this.throwError);return{start:()=>{l=!0},end:()=>{if(u&&b(u,!1),t)for(let E in d)d[E].size&&d[E].data.length>1&&g(E),d[E]=null;l=!1,u=\"\",n=\"\",n=null,o=\"\",c=null,this.onEnd()},update:E=>{if(!l)throw new Error(\"\\u66F4\\u65B0\\u524D\\u672A\\u8C03\\u7528 start \\u65B9\\u6CD5\");let T=b(u+E,!0);h=h+u.length+E.length-((T==null?void 0:T.length)||0),u=\"\",T&&(u=T)},docMap:m,getDocIds:()=>Array.from(f)}}"
  },
  "onEditHead": {
    "realm": "worker",
    "start": 241_278,
    "end": 241_293,
    "bytes": 15,
    "sha256": "1cf3f85e1e16d1f77205b13ab1d9f1d164faee22e060a9529396112df697d46f",
    "source": "onEditHead(e){}"
  },
  "$y": {
    "realm": "worker",
    "start": 665_594,
    "end": 665_742,
    "bytes": 148,
    "sha256": "6de1a7d9c39af2fb1764aad86c26d74d5ae40bca487177e3e26fb5f07682e684",
    "source": "function $y(e){var t;return e instanceof Request?e.url:(t=e==null?void 0:e.startsWith)!=null&&t.call(e,location.origin)?e:`${location.origin}/${e}`}"
  },
  "Uo": {
    "realm": "worker",
    "start": 665_742,
    "end": 665_842,
    "bytes": 100,
    "sha256": "33c3594acd1121cb2917f5e792a549eb7601ef64abd05181b8abc5d534e1510a",
    "source": "function Uo(e,t,s,r){return $y(`dataStr/${e}${t&&t!==\"0\"?`-${t}`:\"\"}-${s}${r&&r!==\"0\"?`-${r}`:\"\"}`)}"
  },
  "IA": {
    "realm": "worker",
    "start": 1_708_962,
    "end": 1_709_078,
    "bytes": 116,
    "sha256": "c74f4554d2be2f6a1b7c2fd7365c4774db8bd7a2d712b055f0f2749018d3fa22",
    "source": "async function IA(e,t,s){return await Re.getInstance().projectHistory.get({projectId:t,branchUuid:s,historyUuid:e})}"
  },
  "ou": {
    "realm": "worker",
    "start": 1_709_078,
    "end": 1_709_123,
    "bytes": 45,
    "sha256": "f07495a6795f39c12f4058f9844d62b2660d4bab80dcf42e3933242b2d4ec5ef",
    "source": "function ou(e){return $y(`index/v${1}/${e}`)}"
  },
  "sdkVerify": {
    "realm": "worker",
    "start": 1_711_572,
    "end": 1_711_708,
    "bytes": 136,
    "sha256": "ef2fab8276248d59f71ad9f87cc9dedd41359d01f14ea0c486f3189a683d7c10",
    "source": "verify(t){if(Object.prototype.toString.call(t)===\"[object Object]\")for(let s in t){let r=t[s];if(r===\"\")return!0;Se.notNull(r)}return!0}"
  },
  "sdkExec": {
    "realm": "worker",
    "start": 1_711_708,
    "end": 1_711_879,
    "bytes": 171,
    "sha256": "c255a8490f3a383c0383a31caeb2969eb7ea8051f29dfb6ab241cdc30d234fd8",
    "source": "exec(t,s,r){var i;if(this.verify(s))return(i=r==null?void 0:r.headers)!=null&&i.path||(r=r||{},r.headers=r.headers||{},r.headers.path=He.currentProject.projectId),[t,s,r]}"
  },
  "sdkExec1": {
    "realm": "worker",
    "start": 1_711_879,
    "end": 1_711_897,
    "bytes": 18,
    "sha256": "3d0b0962ec37b9985e0be69f57be09d6b63411512a9af8da8737e562b56f8cad",
    "source": "exec1(t){return t}"
  },
  "sdkGET": {
    "realm": "worker",
    "start": 1_711_897,
    "end": 1_711_973,
    "bytes": 76,
    "sha256": "090a8a59a31ba4f8a264df918fed368bfaa630250cedb13159aae538509ae785",
    "source": "async GET(t,s,r,i){return this.exec1(await Ve(\"GET\",...this.exec(t,s,r),i))}"
  },
  "historySdkGet": {
    "realm": "worker",
    "start": 1_760_655,
    "end": 1_760_914,
    "bytes": 259,
    "sha256": "61bf98028cbe81a60f43cf9f1ae9c482b17045ad3689cd421ee65c5bd261ebc2",
    "source": "async get(s){try{let{projectId:r,branchUuid:i,historyUuid:n}=s,a=Rt(ae.PROJECT_HISTORY.GET,{project_uuid:r,branch_uuid:i,history_uuid:n}),o={headers:{[yt.ContentType]:gt.Json,path:r}};return this.GET(a,void 0,o)}catch(r){return{success:!1,message:r.message}}}"
  },
  "getFlowParse": {
    "realm": "worker",
    "start": 2_020_325,
    "end": 2_021_153,
    "bytes": 828,
    "sha256": "73b0e0541118ecd7aac7e62fba245364f69d1c77c36cecb2b76dee1e1ad4db97",
    "source": "getFlowParse(t,s,r,i=!0,n,a,o){var f;let c=[],l={uuid:i&&t.snapshot||t.uuid,num:s,editHead:(f=t==null?void 0:t.editHead)==null?void 0:f[s],dNum:n};t.editHead||(t.editHead=[]),a&&(t.editHead[s]=a);let u=r?(g,y,b)=>{let E=Uo(l.uuid,s,g,y);o&&o(E,b);let T=this.cache.put(E,new Response(b));this.cachePromise.add(T),T.then(()=>this.cachePromise.delete(T))}:void 0,h=r?g=>{!a&&(t.editHead[s]=g)}:void 0,p=this.consistencyManager.flowParseFull({cache:u,history:l,onEditHead:h}),d=g=>{r&&c.push(g),p.update(g)},m=()=>{if(p.end(),r){let g=p.getDocIds();t.snapshot&&i?(t.snapDocs||(t.snapDocs=[]),p.docMap&&(t.snapDocs[s]=p.docMap),t.snapDocIds||(t.snapDocIds=[]),g.length&&(t.snapDocIds[s]=g)):(t.docs||(t.docs=[]),p.docMap&&(t.docs[s]=p.docMap),t.docIds||(t.docIds=[]),g.length&&(t.docIds[s]=g))}};return{start:p.start,end:m,update:d}}"
  },
  "openInCloud": {
    "realm": "worker",
    "start": 2_129_074,
    "end": 2_129_915,
    "bytes": 841,
    "sha256": "1898634b3531809b386fbca3e3d73c54483014ebb302c9334223055c36496573",
    "source": "async openInCloud(s){let r=[];if(s){let c=await this.getHistories(s);if(!c.success)throw new Error(\"Get Histories Failed!\");r=(c==null?void 0:c.result)||[]}let i=0;for(let c=0;c<r.length;++c){let l=r[c];if(i+=(l.snapshot?l.snapshot_num||0:l.num||0)+1,l.snapshot)break}this.scaleProgress(i),this.isSyncing=!0;let n=[],a=0;for(let c=0;c<r.length;++c){let l=r[c],u=(l.snapshot?l.snapshot_num||0:l.num||0)+1;if(a+u>30&&(await Promise.all(n),n.length=0,a=0),a+=u,n.push(du(l,h=>{let p=this.getFlowParse(l,h,!0,!0),d=p.end;return p.end=()=>{d==null||d(),this.progress.update()},p},void 0,void 0,this.debugOpen)),l.snapshot)break}n.length&&await Promise.all(n),this.isSyncing=!1,this.historyIndex=r;let o={[yt.ContentType]:gt.Json};return this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:o})),{success:!0}}"
  },
  "searchHistory": {
    "realm": "main",
    "start": 2_594_284,
    "end": 2_594_406,
    "bytes": 122,
    "sha256": "dfedea8d19a0673d35805d951d392dfd31cac972ba7b9f22040effc733e7ffea",
    "source": "async searchHistory(e,r,i){if(!i?.type)throw new Error(\"Type parameter is required\");let s=await wB(e,r,i);return mB(e,s)}"
  },
  "mB": {
    "realm": "main",
    "start": 2_597_146,
    "end": 2_597_410,
    "bytes": 264,
    "sha256": "fc4cc5abe300ae81ab20d20912df42b8003b1def26527ce97a3e46c1e3706d99",
    "source": "function mB(t,e){return e?e.map(r=>({...r,dataStrUrl:`/api/v4/histories/dataStr?path=${encodeURIComponent(t.projectUuid)}&uuid=${r.uuid}`,...r.snapshot&&{snapshotUrl:`/api/v4/histories/dataStr?path=${encodeURIComponent(t.projectUuid)}&uuid=${r.snapshot}`}})):null}"
  },
  "wB": {
    "realm": "main",
    "start": 2_597_410,
    "end": 2_597_858,
    "bytes": 448,
    "sha256": "cbea111f9772f31f038d1a8dc6a7780dbcc1c1bcbacbec285925591002baf2ac",
    "source": "async function wB(t,e,r){try{switch(r.type){case\"project\":return await yB(t,e,{historyUuid:r.historyUuid,branchUuid:r.branchUuid});case\"component\":case\"device\":return await IB(t,e,{historyUuid:r.historyUuid,uuid:r.uuid});default:throw new Error(`Unsupported history type: ${r.type}`)}}catch(i){throw t.logger.error(\"\\u5386\\u53F2\\u67E5\\u8BE2\\u5931\\u8D25\",{error:i,message:i.message}),new Error(`\\u5386\\u53F2\\u67E5\\u8BE2\\u5931\\u8D25: ${i.message}`)}}"
  },
  "yB": {
    "realm": "main",
    "start": 2_597_858,
    "end": 2_598_654,
    "bytes": 796,
    "sha256": "3fa78bbd89729e04363b9a6546fadcbd7c7196ceec27c40c72800b644269e0ab",
    "source": "async function yB(t,e,r){let i=await y(t,e),s=await UB(t,e,{branchUuid:r.branchUuid}),a=[];for(let n of s){let c=(await Or(t,e,n.uuid)).instance(),A=[];if(n.node==0){let u=await i.queryOne({JOIN:c},{EQ:[c.uuid,r.historyUuid]},{PROJECTION:[c.id]});t.logger.debug(`\\u67E5\\u8BE2\\u5DE5\\u7A0B\\u5386\\u53F2\\u8BB0\\u5F55 ID: ${u?.id}, UUID: ${r.historyUuid}`),A=await i.queryAll({JOIN:c},{LET:[c.id,u?.id||0]},{PROJECTION:[c.id,c.uuid,c.parent,c.key,c.is_lock,c.num,c.snapshot_num,c.created_at,c.updated_at,c.lock_time]},{ORDERBYD:[c.id]})}else A=await i.queryAll({JOIN:c},{EQ:[1,1]},{PROJECTION:[c.id,c.uuid,c.parent,c.key,c.is_lock,c.num,c.snapshot_num,c.created_at,c.updated_at,c.lock_time]},{ORDERBYD:[c.id]});if(A&&A.length>0)for(let u of A)a.push({...u,iv:u.uuid})}return a.sort((n,o)=>o.id-n.id),a}"
  },
  "UB": {
    "realm": "main",
    "start": 2_601_284,
    "end": 2_602_357,
    "bytes": 1073,
    "sha256": "acdd4aa08127379224247c1295a3b06c3a87ef469b53d2ce7c6f505229cf2c76",
    "source": "async function UB(t,e,r){let i=await y(t,e),s=gt.instance(),a=await i.queryOne({JOIN:s},{EQ:[s.uuid,r.branchUuid]},{PROJECTION:[s.id,s.uuid,s.node,s.parent_uuid,s.name]});if(!a)return t.logger.warn(`\\u672A\\u627E\\u5230\\u7248\\u672C\\u6570\\u636E: ${r.branchUuid}`),[];let n=[],o=[{...a,level:1,idPath:[s.id]}],c=r.limit||1e3,A=1,u=1/0;for(;o.length>0;){let f=o.shift();if((f.uuid==r.branchUuid||f.node&&f.name!=\"start\")&&n.push(f),f.level>c&&f.snapshot&&f.level<u&&(u=f.level),f.parent_uuid&&f.level<1e3){let L=await i.queryOne({JOIN:s},{EQ:[s.uuid,f.parent_uuid]},{PROJECTION:[s.id,s.uuid,s.node,s.parent_uuid,s.name]});L&&!n.some(T=>T.id===L.id)&&(f.idPath.includes(L.id)?t.logger.error(`\\u68C0\\u6D4B\\u5230\\u5FAA\\u73AF\\u5F15\\u7528: UUID ${f.uuid} -> ${L.uuid}`):(A++,o.push({...L,level:f.level+1,idPath:[...f.idPath,L.id]})))}}let l=n.filter(f=>A<=c||f.level<=c?!0:f.level<=u);return t.logger.debug({event:\"\\u9879\\u76EE\\u5386\\u53F2\\u67E5\\u8BE2\",initialUuid:r.historyUuid,totalNodes:n.length,resultNodes:l.length,maxLevel:n[n.length-1]?.level||0,firstSnapshotAfterLimit:u}),l}"
  }
});
export function qualifyCurrentGeneratedInitialCacheSource(worker: string, main: string): void {
  qualifyCurrentProjectSaveProducerSource(worker); qualifyCurrentFootprintCopyMainBackendSource(main);
  for (const pin of Object.values(CURRENT_GENERATED_INITIAL_CACHE_SOURCE)) { const source = pin.realm === "worker" ? worker : main; const text = source.slice(pin.start, pin.end);
    if (text !== pin.source || Buffer.byteLength(text) !== pin.bytes || createHash("sha256").update(text).digest("hex") !== pin.sha256) { throw new Error("GENERATED_INITIAL_CACHE_SOURCE"); }
  }
}

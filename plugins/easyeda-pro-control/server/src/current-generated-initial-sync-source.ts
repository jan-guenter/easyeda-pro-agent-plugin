/** Fixed original same-head sync graph. Data and source alone issue no continuation. */
/* oxlint-disable eslint/no-template-curly-in-string -- Complete vendor function bytes are literal reviewed source data. */
import { createHash } from "node:crypto";
import { qualifyCurrentProjectSaveProducerSource } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_INITIAL_SYNC_MODULE_EXPRESSION = "[TP,Lg.prototype,Gd.prototype,IA,hd,ag]";
export const CURRENT_GENERATED_INITIAL_SYNC_CALLEES = freezeDeep([
  {
    "name": "isReadOnly",
    "arity": 0,
    "async": false,
    "regular": false,
    "start": 2_013_239,
    "end": 2_013_316,
    "bytes": 77,
    "sha256": "1ac8269d07d8f1283d909cb61e6cb2a5e8b078079e5350625d6ef1101f2c2540",
    "lineNumber": 109,
    "columnNumber": 165_936,
    "source": "isReadOnly(){return!!(this.isTemporary||this.isHistoryBack||this.isV2Format)}"
  },
  {
    "name": "getHistories",
    "arity": 1,
    "async": true,
    "regular": false,
    "start": 2_031_622,
    "end": 2_031_689,
    "bytes": 67,
    "sha256": "1f3549124a2aa6b20ec763a133a168b06860c9e0e173312648a58d475fa3342d",
    "lineNumber": 110,
    "columnNumber": 17_430,
    "source": "async getHistories(t){return await IA(t,this.uuid,this.branchUuid)}"
  },
  {
    "name": "loadLastSnap",
    "arity": 1,
    "async": true,
    "regular": false,
    "start": 2_031_728,
    "end": 2_031_853,
    "bytes": 125,
    "sha256": "7876ce966380310a559c1d8401691fdce93dba4ef61514d4a4aba96e6dc08b4f",
    "lineNumber": 110,
    "columnNumber": 17_536,
    "source": "async loadLastSnap(t){let s=t[t.length-1];s.snapshot&&!this.isSegmentsLoaded(s)&&await du(s,r=>this.getFlowParse(s,r,!0,!0))}"
  },
  {
    "name": "ensureNodesLoaded",
    "arity": 2,
    "async": true,
    "regular": false,
    "start": 2_026_219,
    "end": 2_026_598,
    "bytes": 379,
    "sha256": "20c8f18498216198c73978a48a8f120f305163b3e0ee4437efa529d64a5c89f2",
    "lineNumber": 110,
    "columnNumber": 12_032,
    "source": "async ensureNodesLoaded(t,s,r=!1){for(let i of t){let n=this.historyIndex.find(a=>a.uuid===i);if(n)try{r&&this.confirmedEmptyNodeUuids.delete(i),await this.ensureHistoryDataLoaded(n),this.syncPendingNodeUuids.delete(i),this.isSegmentsLoaded(n)&&(this.confirmedEmptyNodeUuids.delete(i),this.warnedEmptyNodeUuids.delete(i))}catch(a){if(this.syncPendingNodeUuids.add(i),s)throw a}}}"
  },
  {
    "name": "ensureHistoryDataLoaded",
    "arity": 1,
    "async": true,
    "regular": false,
    "start": 2_025_698,
    "end": 2_026_219,
    "bytes": 521,
    "sha256": "af96f515e68e9b5f00f31abf5eb1226d7dfbf676093dc4c8669a6161f859103e",
    "lineNumber": 110,
    "columnNumber": 11_517,
    "source": "async ensureHistoryDataLoaded(t){this.isSegmentsLoaded(t)||this.confirmedEmptyNodeUuids.has(t.uuid)||(await du(t,s=>this.getFlowParse(t,s,!0,!0)),this.isSegmentsLoaded(t)||this.confirmedEmptyNodeUuids.has(t.uuid)||(this.confirmedEmptyNodeUuids.add(t.uuid),this.warnedEmptyNodeUuids.has(t.uuid)||(this.warnedEmptyNodeUuids.add(t.uuid),console.warn(`ensureHistoryDataLoaded \\u8865\\u9F50\\u540E\\u4ECD\\u4E0D\\u5B8C\\u6574 [project=${this.uuid}, uuid=${t.uuid}]: \\u540E\\u7AEF\\u53EF\\u80FD\\u65E0\\u8BE5\\u5206\\u6BB5\\u6570\\u636E`))))}"
  },
  {
    "name": "isSegmentsLoaded",
    "arity": 1,
    "async": false,
    "regular": false,
    "start": 2_025_453,
    "end": 2_025_698,
    "bytes": 245,
    "sha256": "e5065424ee73e234520992e6c8d433e46d2365ac5bb8c4ca92106a2d697b592d",
    "lineNumber": 110,
    "columnNumber": 11_259,
    "source": "isSegmentsLoaded(t){var i,n;let s=!!t.snapshot,r=(s?t.snapshot_num:t.num)||0;for(let a=0;a<=r;a++){let o=s?(i=t==null?void 0:t.snapDocIds)==null?void 0:i[a]:(n=t==null?void 0:t.docIds)==null?void 0:n[a];if(!(o!=null&&o.length))return!1}return!0}"
  },
  {
    "name": "syncCloud",
    "arity": 1,
    "async": true,
    "regular": false,
    "start": 2_031_853,
    "end": 2_034_689,
    "bytes": 2836,
    "sha256": "3c5101bdf6a0ee65825bb16063044d2dbb812d146f639fb67623e1092e6ee15a",
    "lineNumber": 110,
    "columnNumber": 17_658,
    "source": "async syncCloud(t){var n,a,o,c,l;if(this.isReadOnly()||this.notSyncCloud)return;if(this.isUploadingCloud){this.pendingSyncCloud=!0;return}this.notSyncCloud=!0,this.pendingSyncCloud=!1;let s=!!t,r=null,i=new Promise(u=>r=u);this.task3.add(i);try{if(!t){let g=await this.getLastHistoryUuid(this.branchUuid);if(g.success===!1)throw new Error(\"GetLastHistoryUuid Failed!\");t=g.result.history_uuid}let u=(n=this.historyIndex)==null?void 0:n[0],h=(a=this.historyIndex)==null?void 0:a[1];if((u==null?void 0:u.uuid)!==t&&this.historyIndex.some(g=>g.uuid===t))throw new Hd;let p=[];if(t){let g=1;do{let y=await this.getHistories(t);if(!y.success)throw new Error(\"GetHistories Failed!\");p=(o=y==null?void 0:y.result)!=null&&o.length?y==null?void 0:y.result:[],p.length||await tu(50*g)}while(++g<5&&s&&(!p.length||((c=p==null?void 0:p[0])==null?void 0:c.uuid)===(u==null?void 0:u.uuid)&&((l=p==null?void 0:p[0])==null?void 0:l.num)===(u==null?void 0:u.num)));if(!p.length)throw new Error(\"\\u65E0\\u6CD5\\u4ECE\\u540E\\u7AEF\\u83B7\\u53D6\\u5230\\u5386\\u53F2\\u6570\\u636E\\uFF0C\\u540C\\u6B65\\u5931\\u8D25\\uFF01\")}p=hd(p,this.historyIndex);let d=p.findIndex(g=>(g==null?void 0:g.uuid)===(h==null?void 0:h.uuid)||(g==null?void 0:g.uuid)===(u==null?void 0:u.uuid)&&(g==null?void 0:g.num)===(u==null?void 0:u.num)),m=!1;this.cachePromise.add(i),this.isSyncing=!0;for(let g=d===-1?p.length-1:d;g>=0;--g){let y=p[g];g===d&&(y.uuid===(h==null?void 0:h.uuid)||y.uuid===(u==null?void 0:u.uuid)&&(y==null?void 0:y.num)===(u==null?void 0:u.num))||(m=!0,await du(y,b=>this.getFlowParse(y,b,!0,!0),y.uuid===(u==null?void 0:u.uuid)?(u==null?void 0:u.num)+1:void 0))}if(await this.loadLastSnap(p),m){this.historyIndex=p;let g={[yt.ContentType]:gt.Json};this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:g})),this.isApplyShot&&(this.isApplyShot=!1,this.applySnap())}let f=this.syncPendingNodeUuids.size?this.historyIndex.filter(g=>this.syncPendingNodeUuids.has(g.uuid)):this.historyIndex;await this.ensureNodesLoaded(f.map(g=>g.uuid),!1)}catch(u){console.error(`syncCloud \\u540C\\u6B65\\u5931\\u8D25 [project=${this.uuid}, branch=${this.branchUuid}, historyUuid=${t}]:`,u);let h=u instanceof Error?u:new Error(String(u));throw h.project=this.uuid,h.branch=this.branchUuid,h.historyUuid=t,h}finally{r==null||r(),this.cachePromise.delete(i),this.task3.delete(i),this.notSyncCloud=!1,this.isSyncing=!1;for(let u of Array.from(this.syncPendingNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.syncPendingNodeUuids.delete(u);for(let u of Array.from(this.confirmedEmptyNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.confirmedEmptyNodeUuids.delete(u);for(let u of Array.from(this.warnedEmptyNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.warnedEmptyNodeUuids.delete(u);this.pendingSyncCloud&&this.syncCloud().catch(()=>{})}}"
  },
  {
    "name": "IA",
    "arity": 3,
    "async": true,
    "regular": false,
    "start": 1_708_962,
    "end": 1_709_078,
    "bytes": 116,
    "sha256": "c74f4554d2be2f6a1b7c2fd7365c4774db8bd7a2d712b055f0f2749018d3fa22",
    "lineNumber": 108,
    "columnNumber": 7483,
    "source": "async function IA(e,t,s){return await Re.getInstance().projectHistory.get({projectId:t,branchUuid:s,historyUuid:e})}"
  },
  {
    "name": "hd",
    "arity": 2,
    "async": false,
    "regular": true,
    "start": 1_710_234,
    "end": 1_710_968,
    "bytes": 734,
    "sha256": "3e05a08be3ba94d5563853cd2fe235929b7abe8d44cf914c8ab492505715fb8a",
    "lineNumber": 108,
    "columnNumber": 8749,
    "source": "function hd(e,t){var n,a,o,c,l,u,h,p,d;if(!e.length||!t.length)return e;let s=!!e[e.length-1].snapshot,r=e[e.length-1].uuid===t[t.length-1].uuid,i=e[e.length-1].snapshot===t[t.length-1].snapshot;if(r&&i){let m=e.length-t.length;if(m>=0)for(let f=0;f<t.length;++f)(n=t[f])!=null&&n.uuid&&((a=t[f])==null?void 0:a.uuid)===((o=e[f+m])==null?void 0:o.uuid)&&(((c=t[f])==null?void 0:c.num)||0)<=(((l=e[f+m])==null?void 0:l.num)||0)&&ag(e[f+m],t[f])}if(s&&!i){let m=e[e.length-1],f=t.findIndex(y=>y.uuid===m.uuid),g=e.length-1;if(f>-1)for(let y=f-1;y>=0;--y){let b=g-(f-y);b>=0&&((u=e[b])==null?void 0:u.uuid)===((h=t[y])==null?void 0:h.uuid)&&(((p=t[y])==null?void 0:p.num)||0)<=(((d=e[b])==null?void 0:d.num)||0)&&ag(e[b],t[y])}}return e}"
  },
  {
    "name": "ag",
    "arity": 2,
    "async": false,
    "regular": true,
    "start": 1_710_049,
    "end": 1_710_234,
    "bytes": 185,
    "sha256": "38448745b4250d33e4db78ec23205aa713e4048d6bfaf6ddbd25d62ff6a191c0",
    "lineNumber": 108,
    "columnNumber": 8564,
    "source": "function ag(e,t){t.docs&&(e.docs=t.docs),t.editHead&&(e.editHead=t.editHead),t.docIds&&(e.docIds=t.docIds),t.snapDocs&&(e.snapDocs=t.snapDocs),t.snapDocIds&&(e.snapDocIds=t.snapDocIds)}"
  }
]);
export const CURRENT_GENERATED_INITIAL_SYNC_SITES = freezeDeep({
  "history": {
    "lineNumber": 110,
    "columnNumber": 18_272,
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "expression": "[this,t,s,r,i,u,h,y,g]",
    "length": 9
  },
  "merged": {
    "lineNumber": 110,
    "columnNumber": 18_935,
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "expression": "[this,t,s,r,i,u,h,p,d,m]",
    "length": 10
  },
  "finally": {
    "lineNumber": 110,
    "columnNumber": 19_939,
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "expression": "[this,t,s,r,i]",
    "length": 5
  }
});
export const CURRENT_GENERATED_INITIAL_SYNC_CALLER = Object.freeze({lineNumber:110,columnNumber:96_941,functionLineNumber:110,functionColumnNumber:94_422,expression:"[this,h]",length:2});
export function qualifyCurrentGeneratedInitialSyncSource(source: string): void { qualifyCurrentProjectSaveProducerSource(source); for (const row of CURRENT_GENERATED_INITIAL_SYNC_CALLEES) { const actual=source.slice(row.start,row.end); if(actual!==row.source||Buffer.byteLength(actual)!==row.bytes||createHash("sha256").update(actual).digest("hex")!==row.sha256) {throw new Error("INITIAL_SYNC_SOURCE");} } if(source.slice(2_177_106,2_177_125)!=="TP=new Lg(Nb,Hj,zj)") {throw new Error("INITIAL_SYNC_ORIGINAL_TP");} }

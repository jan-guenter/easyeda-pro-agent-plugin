/** Fixed current209 uploader sites. Refusal guards remain separate; these
 * source facts alone grant no continuation, cache/SQL effect or Save. */
/* oxlint-disable eslint/no-template-curly-in-string -- These complete pinned vendor methods are literal source data. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_WORKER_STARTUP_SOURCE as SOURCE } from "./current-pcb-209-worker-startup-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SAVE_PRODUCER_METHODS = freezeDeep({
  "headPut": {
    "start": 1_684_363,
    "end": 1_684_885,
    "bytes": 522,
    "sha256": "fbcf4d11c5d4b47e9ffa46057e13721851543486f43797f13c72d840a8cf159e",
    "functionLineNumber": 106,
    "functionColumnNumber": 55_912
  },
  "uploadCloud": {
    "start": 2_022_867,
    "end": 2_024_986,
    "bytes": 2119,
    "sha256": "7175c3c38cab0dc6026c461488a90b5c08ca8e235abff4d0a8ad469174aa4964",
    "functionLineNumber": 110,
    "functionColumnNumber": 8674
  },
  "bufferedStream": {
    "start": 2_029_672,
    "end": 2_030_081,
    "bytes": 409,
    "sha256": "ab5308d9747401e42204794c3a3d8eb7dfa99af4a34bcb90481c7761752f83a7",
    "functionLineNumber": 110,
    "functionColumnNumber": 15_476
  },
  "batchUploadCloud": {
    "start": 2_030_081,
    "end": 2_030_196,
    "bytes": 115,
    "sha256": "b0973c07ee483cba9a9eb304387e2c07070bc675cecb953eaa49ca9ff5f9c4bf",
    "functionLineNumber": 110,
    "functionColumnNumber": 15_893
  },
  "uploadLocal": {
    "start": 2_031_202,
    "end": 2_031_622,
    "bytes": 420,
    "sha256": "5add70c985bd271d5683fc48abd3d69ed0627cb54a9638acc73a164e583b5ea4",
    "functionLineNumber": 110,
    "functionColumnNumber": 17_009
  },
  "syncCloud": {
    "start": 2_031_853,
    "end": 2_034_689,
    "bytes": 2836,
    "sha256": "3c5101bdf6a0ee65825bb16063044d2dbb812d146f639fb67623e1092e6ee15a",
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658
  }
});
export const CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE = freezeDeep({
  "headPut": "async put(t,s,r){t=nu(t);let i=0,n=async()=>{try{console.time(`CustomCache clone ${t}`);let a=s.clone();console.timeEnd(`CustomCache clone ${t}`),console.time(`CustomCache put ${t}`);let o=await this.cache.put(t,a);return console.timeEnd(`CustomCache put ${t}`),o}catch(a){if(++i,console.error(\"cache \\u5199\\u5165\\u5931\\u8D25\",t,i),i>5)throw new Error(`cache \\u5199\\u5165\\u5931\\u8D25:${t},${i},${a.message}`,a);return!r&&(a==null?void 0:a.name)===\"NotFoundError\"?(await this.open(),n()):(await tu(100*i),n())}};return n()}",
  "uploadCloud": "async uploadCloud(){if(this.isV2Format)return{success:!1,message:\"This project is in V2 format and is currently in read-only mode. Saving is not allowed.\"};this.isUploadingCloud=!0;let t=new Map,s=[],r=[],i=[],n=0,a=50*1024*1024;for(let[c,l]of this.bufferUploadData)n>a&&(s.push({url:r,data:i}),r=[],r=[],n=0),r.push(c),i.push(l),n+=l.length,t.set(c,l),this.bufferUploadData.delete(c);i.length&&s.push({url:r,data:i});let o=()=>{for(let[c,l]of t)this.bufferUploadData.set(c,l);t.clear()};if(this.isTemporary)return t.clear(),this.publishUploadPending(),{success:!0};try{let c;for(let l of s){let u=l.data.join(Ie);if(!u.length)continue;let h=0,p=3,d=this.uuid,m=async()=>{let f=await Re.getInstance().projectHistory.set({projectId:d,branchData:{uuid:this.branchUuid},dataStr:u});if(!f.success||!f.result){console.error(\"\\u5B9E\\u65F6\\u4E0A\\u4F20\\u8BF7\\u6C42\\u5931\\u8D25\\uFF1Axxxxxxxxxxxxxxxxxxxx..........,\\u8BF7\\u67E5\\u770B\\u65E5\\u5FD7\\u4FE1\\u606F\",f);let g=await this.onerror(f);if(!g&&++h===p&&(g=!0),g)return et(\"error\",[\"Failed to upload data!\",ts(f)||f.message||\"\"]),this.notifyWatcher(be.PROJECT.UPLOAD_FAILED,f),this.mainMesBus.publish(\"ui/openProjectUploadFailed\",{project:this.uuid,branch:this.branchUuid}),{success:!1,message:`\\u4FDD\\u5B58\\u4E0A\\u4F20\\u5931\\u8D25\\uFF1A${ts(f)||f.message||\"\"}`};if(await tu(200*h),h<p)return await m()}else{(async()=>{let b=cg(`localSave/${this.branchUuid}?key=${f.result}&time=${new Date().getTime()}`);await this.localCache.put(b,new Response(u));for(let E of l.url)t.delete(E),this.bufferUploadCache.has(E)?(await this.bufferUploadCache.get(E).delete(E),this.bufferUploadCache.delete(E)):await this.localCache.delete(E)})();let y=this.syncCloud();return this.task1.add(y),y.finally(()=>{this.task1.delete(y)}),{success:!0}}};if(c=await m(),!(c!=null&&c.success)){o();break}}return c||{success:!0}}catch(c){return console.error(\"\\u4E0A\\u4F20\\u5931\\u8D25\\uFF01\\uFF01\\uFF01\",c),o(),{success:!1,message:`\\u4E0A\\u4F20\\u4E91\\u7AEF\\u5931\\u8D25\\uFF1A${c.message}`}}finally{this.isUploadingCloud=!1,this.publishUploadPending(),this.pendingSyncCloud&&this.syncCloud().catch(()=>{})}}",
  "bufferedStream": "bufferedStream(t,s){let r=null,i=null,n=null,a=this;return l=>{r&&(clearTimeout(r),r=null),n&&n(),i&&a.task1.delete(i),i=new Promise(u=>n=u),a.task1.add(i),o(l),r=setTimeout(()=>c(),s)};function o(l){let u=Array.isArray(l)?l:[l];for(let h of u)a.bufferUploadData.set(h.dataUrl,h.dataStr)}async function c(){r=null;let l=i,u=n;n=null,i=null;try{await t()}catch(h){console.error(h)}u&&u(),l&&a.task1.delete(l)}}",
  "batchUploadCloud": "async batchUploadCloud(){let t;try{t=this.uploadCloud(),this.task1.add(t),await t}finally{t&&this.task1.delete(t)}}",
  "uploadLocal": "async uploadLocal(t,s=!0,r){let i=t.filter(n=>!!n).join(Ie);if(i.length){s&&this.consistencyManager.parseFull(i,void 0,void 0,r);let n=cg(`upload/${this.branchUuid}?key=${Qe()}`);try{await this.localCache.put(n,new Response(i))}catch{return this.bufferUploadData.set(n,i),this.publishUploadPending(),await this.uploadCloud()}this.bufferedUploadCloud({dataStr:i,dataUrl:n}),this.publishUploadPending()}return{success:!0}}",
  "syncCloud": "async syncCloud(t){var n,a,o,c,l;if(this.isReadOnly()||this.notSyncCloud)return;if(this.isUploadingCloud){this.pendingSyncCloud=!0;return}this.notSyncCloud=!0,this.pendingSyncCloud=!1;let s=!!t,r=null,i=new Promise(u=>r=u);this.task3.add(i);try{if(!t){let g=await this.getLastHistoryUuid(this.branchUuid);if(g.success===!1)throw new Error(\"GetLastHistoryUuid Failed!\");t=g.result.history_uuid}let u=(n=this.historyIndex)==null?void 0:n[0],h=(a=this.historyIndex)==null?void 0:a[1];if((u==null?void 0:u.uuid)!==t&&this.historyIndex.some(g=>g.uuid===t))throw new Hd;let p=[];if(t){let g=1;do{let y=await this.getHistories(t);if(!y.success)throw new Error(\"GetHistories Failed!\");p=(o=y==null?void 0:y.result)!=null&&o.length?y==null?void 0:y.result:[],p.length||await tu(50*g)}while(++g<5&&s&&(!p.length||((c=p==null?void 0:p[0])==null?void 0:c.uuid)===(u==null?void 0:u.uuid)&&((l=p==null?void 0:p[0])==null?void 0:l.num)===(u==null?void 0:u.num)));if(!p.length)throw new Error(\"\\u65E0\\u6CD5\\u4ECE\\u540E\\u7AEF\\u83B7\\u53D6\\u5230\\u5386\\u53F2\\u6570\\u636E\\uFF0C\\u540C\\u6B65\\u5931\\u8D25\\uFF01\")}p=hd(p,this.historyIndex);let d=p.findIndex(g=>(g==null?void 0:g.uuid)===(h==null?void 0:h.uuid)||(g==null?void 0:g.uuid)===(u==null?void 0:u.uuid)&&(g==null?void 0:g.num)===(u==null?void 0:u.num)),m=!1;this.cachePromise.add(i),this.isSyncing=!0;for(let g=d===-1?p.length-1:d;g>=0;--g){let y=p[g];g===d&&(y.uuid===(h==null?void 0:h.uuid)||y.uuid===(u==null?void 0:u.uuid)&&(y==null?void 0:y.num)===(u==null?void 0:u.num))||(m=!0,await du(y,b=>this.getFlowParse(y,b,!0,!0),y.uuid===(u==null?void 0:u.uuid)?(u==null?void 0:u.num)+1:void 0))}if(await this.loadLastSnap(p),m){this.historyIndex=p;let g={[yt.ContentType]:gt.Json};this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:g})),this.isApplyShot&&(this.isApplyShot=!1,this.applySnap())}let f=this.syncPendingNodeUuids.size?this.historyIndex.filter(g=>this.syncPendingNodeUuids.has(g.uuid)):this.historyIndex;await this.ensureNodesLoaded(f.map(g=>g.uuid),!1)}catch(u){console.error(`syncCloud \\u540C\\u6B65\\u5931\\u8D25 [project=${this.uuid}, branch=${this.branchUuid}, historyUuid=${t}]:`,u);let h=u instanceof Error?u:new Error(String(u));throw h.project=this.uuid,h.branch=this.branchUuid,h.historyUuid=t,h}finally{r==null||r(),this.cachePromise.delete(i),this.task3.delete(i),this.notSyncCloud=!1,this.isSyncing=!1;for(let u of Array.from(this.syncPendingNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.syncPendingNodeUuids.delete(u);for(let u of Array.from(this.confirmedEmptyNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.confirmedEmptyNodeUuids.delete(u);for(let u of Array.from(this.warnedEmptyNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.warnedEmptyNodeUuids.delete(u);this.pendingSyncCloud&&this.syncCloud().catch(()=>{})}}"
});
export const CURRENT_PROJECT_SAVE_PRODUCER_SITES = freezeDeep({
  "localIngress": {
    "functionLineNumber": 110,
    "functionColumnNumber": 17_009,
    "lineNumber": 110,
    "columnNumber": 17_028,
    "offset": 2_031_238,
    "expression": "[this,t,s,r]",
    "length": 4
  },
  "bufferIngress": {
    "functionLineNumber": 110,
    "functionColumnNumber": 15_521,
    "lineNumber": 110,
    "columnNumber": 15_525,
    "offset": 2_029_735,
    "expression": "[l,r,i,n,a,t,s,c,o]",
    "length": 9
  },
  "cloudIngress": {
    "functionLineNumber": 110,
    "functionColumnNumber": 8674,
    "lineNumber": 110,
    "columnNumber": 8677,
    "offset": 2_022_887,
    "expression": "[this]",
    "length": 1
  },
  "historyCloud": {
    "functionLineNumber": 110,
    "functionColumnNumber": 9319,
    "lineNumber": 110,
    "columnNumber": 9344,
    "offset": 2_023_554,
    "expression": "[this,l,t,u,h,p,d,m]",
    "length": 8
  },
  "localReturned": {
    "functionLineNumber": 110,
    "functionColumnNumber": 17_009,
    "lineNumber": 110,
    "columnNumber": 17_393,
    "offset": 2_031_603,
    "expression": "[this,t,s,r,i]",
    "length": 5
  },
  "localFailed": {
    "functionLineNumber": 110,
    "functionColumnNumber": 17_009,
    "lineNumber": 110,
    "columnNumber": 17_238,
    "offset": 2_031_448,
    "expression": "[this,t,s,r,i,n]",
    "length": 6
  },
  "bufferScheduled": {
    "functionLineNumber": 110,
    "functionColumnNumber": 15_521,
    "lineNumber": 110,
    "columnNumber": 15_646,
    "offset": 2_029_856,
    "expression": "[l,r,i,n,a,t,s,c,o]",
    "length": 9
  },
  "bufferDrain": {
    "functionLineNumber": 110,
    "functionColumnNumber": 15_750,
    "lineNumber": 110,
    "columnNumber": 15_806,
    "offset": 2_030_016,
    "expression": "[a,t,s,r,i,n,l,u]",
    "length": 8
  },
  "bufferDone": {
    "functionLineNumber": 110,
    "functionColumnNumber": 15_750,
    "lineNumber": 110,
    "columnNumber": 15_869,
    "offset": 2_030_079,
    "expression": "[a,t,s,r,i,n,l,u]",
    "length": 8
  },
  "batchReturned": {
    "functionLineNumber": 110,
    "functionColumnNumber": 15_893,
    "lineNumber": 110,
    "columnNumber": 15_985,
    "offset": 2_030_195,
    "expression": "[this,t]",
    "length": 2
  },
  "historyReply": {
    "functionLineNumber": 110,
    "functionColumnNumber": 9319,
    "lineNumber": 110,
    "columnNumber": 9436,
    "offset": 2_023_646,
    "expression": "[this,l,t,u,h,p,d,m,f]",
    "length": 9
  },
  "historyFailed": {
    "functionLineNumber": 110,
    "functionColumnNumber": 9319,
    "lineNumber": 110,
    "columnNumber": 9462,
    "offset": 2_023_672,
    "expression": "[this,l,t,u,h,p,d,m,f]",
    "length": 9
  },
  "historyQueued": {
    "functionLineNumber": 110,
    "functionColumnNumber": 9319,
    "lineNumber": 110,
    "columnNumber": 10_368,
    "offset": 2_024_578,
    "expression": "[this,l,t,u,h,p,d,m,f,y]",
    "length": 10
  },
  "historyFinally": {
    "functionLineNumber": 110,
    "functionColumnNumber": 10_385,
    "lineNumber": 110,
    "columnNumber": 10_390,
    "offset": 2_024_600,
    "expression": "[this,l,t,u,h,p,d,m,f,y]",
    "length": 10
  },
  "cloudReturned": {
    "functionLineNumber": 110,
    "functionColumnNumber": 8674,
    "lineNumber": 110,
    "columnNumber": 10_477,
    "offset": 2_024_687,
    "expression": "[this,t,s,r,i,n,a,c]",
    "length": 8
  },
  "cloudFinally": {
    "functionLineNumber": 110,
    "functionColumnNumber": 8674,
    "lineNumber": 110,
    "columnNumber": 10_698,
    "offset": 2_024_908,
    "expression": "[this,t,s,r,i,n,a]",
    "length": 7
  },
  "syncEntry": {
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "lineNumber": 110,
    "columnNumber": 17_676,
    "offset": 2_031_886,
    "expression": "[this,t]",
    "length": 2
  },
  "syncDeferred": {
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "lineNumber": 110,
    "columnNumber": 17_774,
    "offset": 2_031_984,
    "expression": "[this,t]",
    "length": 2
  },
  "syncFull": {
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "lineNumber": 110,
    "columnNumber": 17_888,
    "offset": 2_032_098,
    "expression": "[this,t,s,r,i]",
    "length": 5
  },
  "syncReturned": {
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "lineNumber": 110,
    "columnNumber": 20_478,
    "offset": 2_034_688,
    "expression": "[this,t,s,r,i]",
    "length": 5
  },
  "syncFailed": {
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "lineNumber": 110,
    "columnNumber": 19_691,
    "offset": 2_033_901,
    "expression": "[this,t,s,r,i,u]",
    "length": 6
  },
  "detachedEntry": {
    "functionLineNumber": 110,
    "functionColumnNumber": 10_008,
    "lineNumber": 110,
    "columnNumber": 10_024,
    "offset": 2_024_234,
    "expression": "[this,l,t,f]",
    "length": 4
  },
  "detachedReturned": {
    "functionLineNumber": 110,
    "functionColumnNumber": 10_008,
    "lineNumber": 110,
    "columnNumber": 10_322,
    "offset": 2_024_532,
    "expression": "[this,l,t,f]",
    "length": 4
  },
  "headEntry": {
    "functionLineNumber": 106,
    "functionColumnNumber": 55_912,
    "lineNumber": 106,
    "columnNumber": 55_920,
    "offset": 1_684_380,
    "expression": "[this,t,s,r]",
    "length": 4
  },
  "headPromise": {
    "functionLineNumber": 106,
    "functionColumnNumber": 55_912,
    "lineNumber": 106,
    "columnNumber": 56_424,
    "offset": 1_684_884,
    "expression": "[this,t,s,r]",
    "length": 4
  },
  "headSuccess": {
    "functionLineNumber": 106,
    "functionColumnNumber": 55_938,
    "lineNumber": 106,
    "columnNumber": 56_166,
    "offset": 1_684_626,
    "expression": "[this,t,s,r,i,n]",
    "length": 6
  },
  "cacheFailed": {
    "functionLineNumber": 106,
    "functionColumnNumber": 55_938,
    "lineNumber": 106,
    "columnNumber": 56_176,
    "offset": 1_684_636,
    "expression": "[this,t,s,r,i,n,a]",
    "length": 7
  }
});
export type CurrentProjectSaveProducerRole = keyof typeof CURRENT_PROJECT_SAVE_PRODUCER_SITES;
export function qualifyCurrentProjectSaveProducerSource(input: unknown): void {
  if (typeof input !== "string" || !input.isWellFormed() || Buffer.byteLength(input) !== SOURCE.bytes || createHash("sha256").update(input).digest("hex") !== SOURCE.sha256) { throw new Error("PROJECT_SAVE_PRODUCER_SOURCE"); }
  const lines = input.split("\n");
  for (const site of Object.values(CURRENT_PROJECT_SAVE_PRODUCER_SITES)) {
    const offset = lines.slice(0, site.lineNumber).reduce((sum, line) => sum + line.length + 1, 0) + site.columnNumber;
    if (offset !== site.offset) { throw new Error("PROJECT_SAVE_PRODUCER_SITE"); }
  }
  const methods: Readonly<Record<string, string>> = CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE;
  for (const [name, pin] of Object.entries(CURRENT_PROJECT_SAVE_PRODUCER_METHODS)) {
    const text = input.slice(pin.start, pin.end);
    if (text !== methods[name] || Buffer.byteLength(text) !== pin.bytes || createHash("sha256").update(text).digest("hex") !== pin.sha256) { throw new Error("PROJECT_SAVE_PRODUCER_METHOD"); }
  }
}

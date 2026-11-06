/** Exact direct cache-put caller frames. Unknown/aliased callers remain held;
 * this roster makes no alias-completeness or continuation claim. */
/* oxlint-disable eslint/no-template-curly-in-string -- Complete pinned vendor function bodies are literal source data. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { qualifyCurrentProjectSaveProducerSource } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS = freezeDeep({
  "flow": {
    "namespace": "project",
    "expression": "[this,g,y,b,E,l,s,o,Lg.prototype,Gd.prototype]",
    "length": 10,
    "offset": 2_020_578,
    "end": 2_020_611,
    "callerOffset": 2_020_589,
    "lineNumber": 110,
    "columnNumber": 6379,
    "functionLineNumber": 110,
    "functionColumnNumber": 6319,
    "functionStart": 2_020_529,
    "functionEnd": 2_020_677,
    "functionSource": "(g,y,b)=>{let E=Uo(l.uuid,s,g,y);o&&o(E,b);let T=this.cache.put(E,new Response(b));this.cachePromise.add(T),T.then(()=>this.cachePromise.delete(T))}",
    "functionSha256": "ef093e302befb28bb6e946f7ae47ac8607db6aac204e4ca1ac118a02efd68642",
    "call": "this.cache.put(E,new Response(b))"
  },
  "localSave": {
    "namespace": "local",
    "expression": "[this,l,t,f,u,b,Lg.prototype,Gd.prototype]",
    "length": 8,
    "offset": 2_024_320,
    "end": 2_024_358,
    "callerOffset": 2_024_336,
    "lineNumber": 110,
    "columnNumber": 10_126,
    "functionLineNumber": 110,
    "functionColumnNumber": 10_008,
    "functionStart": 2_024_218,
    "functionEnd": 2_024_533,
    "functionSource": "async()=>{let b=cg(`localSave/${this.branchUuid}?key=${f.result}&time=${new Date().getTime()}`);await this.localCache.put(b,new Response(u));for(let E of l.url)t.delete(E),this.bufferUploadCache.has(E)?(await this.bufferUploadCache.get(E).delete(E),this.bufferUploadCache.delete(E)):await this.localCache.delete(E)}",
    "functionSha256": "ad456d32d1566392b497d007ec7241c49ee7944d7dfeb54334cd0366cf14d1e0",
    "call": "this.localCache.put(b,new Response(u))"
  },
  "localUpload": {
    "namespace": "local",
    "expression": "[this,t,s,r,i,n,Lg.prototype,Gd.prototype]",
    "length": 8,
    "offset": 2_031_391,
    "end": 2_031_429,
    "callerOffset": 2_031_407,
    "lineNumber": 110,
    "columnNumber": 17_197,
    "functionLineNumber": 110,
    "functionColumnNumber": 17_009,
    "functionStart": 2_031_219,
    "functionEnd": 2_031_622,
    "functionSource": "(t,s=!0,r){let i=t.filter(n=>!!n).join(Ie);if(i.length){s&&this.consistencyManager.parseFull(i,void 0,void 0,r);let n=cg(`upload/${this.branchUuid}?key=${Qe()}`);try{await this.localCache.put(n,new Response(i))}catch{return this.bufferUploadData.set(n,i),this.publishUploadPending(),await this.uploadCloud()}this.bufferedUploadCloud({dataStr:i,dataUrl:n}),this.publishUploadPending()}return{success:!0}}",
    "functionSha256": "bb1a8fd6e1c5cd760a6cf77c7c054fd9a0b3d56e15270bc28585454201e3f0b8",
    "call": "this.localCache.put(n,new Response(i))"
  },
  "syncHead": {
    "namespace": "project",
    "expression": "[this,t,s,r,i,u,h,p,d,m,g,Lg.prototype,Gd.prototype]",
    "length": 13,
    "offset": 2_033_567,
    "end": 2_033_662,
    "callerOffset": 2_033_578,
    "lineNumber": 110,
    "columnNumber": 19_368,
    "functionLineNumber": 110,
    "functionColumnNumber": 17_658,
    "functionStart": 2_031_868,
    "functionEnd": 2_034_689,
    "functionSource": "(t){var n,a,o,c,l;if(this.isReadOnly()||this.notSyncCloud)return;if(this.isUploadingCloud){this.pendingSyncCloud=!0;return}this.notSyncCloud=!0,this.pendingSyncCloud=!1;let s=!!t,r=null,i=new Promise(u=>r=u);this.task3.add(i);try{if(!t){let g=await this.getLastHistoryUuid(this.branchUuid);if(g.success===!1)throw new Error(\"GetLastHistoryUuid Failed!\");t=g.result.history_uuid}let u=(n=this.historyIndex)==null?void 0:n[0],h=(a=this.historyIndex)==null?void 0:a[1];if((u==null?void 0:u.uuid)!==t&&this.historyIndex.some(g=>g.uuid===t))throw new Hd;let p=[];if(t){let g=1;do{let y=await this.getHistories(t);if(!y.success)throw new Error(\"GetHistories Failed!\");p=(o=y==null?void 0:y.result)!=null&&o.length?y==null?void 0:y.result:[],p.length||await tu(50*g)}while(++g<5&&s&&(!p.length||((c=p==null?void 0:p[0])==null?void 0:c.uuid)===(u==null?void 0:u.uuid)&&((l=p==null?void 0:p[0])==null?void 0:l.num)===(u==null?void 0:u.num)));if(!p.length)throw new Error(\"\\u65E0\\u6CD5\\u4ECE\\u540E\\u7AEF\\u83B7\\u53D6\\u5230\\u5386\\u53F2\\u6570\\u636E\\uFF0C\\u540C\\u6B65\\u5931\\u8D25\\uFF01\")}p=hd(p,this.historyIndex);let d=p.findIndex(g=>(g==null?void 0:g.uuid)===(h==null?void 0:h.uuid)||(g==null?void 0:g.uuid)===(u==null?void 0:u.uuid)&&(g==null?void 0:g.num)===(u==null?void 0:u.num)),m=!1;this.cachePromise.add(i),this.isSyncing=!0;for(let g=d===-1?p.length-1:d;g>=0;--g){let y=p[g];g===d&&(y.uuid===(h==null?void 0:h.uuid)||y.uuid===(u==null?void 0:u.uuid)&&(y==null?void 0:y.num)===(u==null?void 0:u.num))||(m=!0,await du(y,b=>this.getFlowParse(y,b,!0,!0),y.uuid===(u==null?void 0:u.uuid)?(u==null?void 0:u.num)+1:void 0))}if(await this.loadLastSnap(p),m){this.historyIndex=p;let g={[yt.ContentType]:gt.Json};this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:g})),this.isApplyShot&&(this.isApplyShot=!1,this.applySnap())}let f=this.syncPendingNodeUuids.size?this.historyIndex.filter(g=>this.syncPendingNodeUuids.has(g.uuid)):this.historyIndex;await this.ensureNodesLoaded(f.map(g=>g.uuid),!1)}catch(u){console.error(`syncCloud \\u540C\\u6B65\\u5931\\u8D25 [project=${this.uuid}, branch=${this.branchUuid}, historyUuid=${t}]:`,u);let h=u instanceof Error?u:new Error(String(u));throw h.project=this.uuid,h.branch=this.branchUuid,h.historyUuid=t,h}finally{r==null||r(),this.cachePromise.delete(i),this.task3.delete(i),this.notSyncCloud=!1,this.isSyncing=!1;for(let u of Array.from(this.syncPendingNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.syncPendingNodeUuids.delete(u);for(let u of Array.from(this.confirmedEmptyNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.confirmedEmptyNodeUuids.delete(u);for(let u of Array.from(this.warnedEmptyNodeUuids))this.historyIndex.some(h=>h.uuid===u)||this.warnedEmptyNodeUuids.delete(u);this.pendingSyncCloud&&this.syncCloud().catch(()=>{})}}",
    "functionSha256": "f4cb891b2f5f01881e9ffb6af78a1903d6df207e7047ac97e06acf464d053cc3",
    "call": "this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:g}))"
  },
  "openLocalHead": {
    "namespace": "project",
    "expression": "[this,s,r,i,n,a,Lg.prototype,Gd.prototype]",
    "length": 8,
    "offset": 2_128_959,
    "end": 2_129_054,
    "callerOffset": 2_128_970,
    "lineNumber": 110,
    "columnNumber": 114_760,
    "functionLineNumber": 110,
    "functionColumnNumber": 114_106,
    "functionStart": 2_128_316,
    "functionEnd": 2_129_074,
    "functionSource": "(s){let r=await this.getHistories(s);if(!r.success||!r.result)throw new Error(\"Get Histories Failed!\");this.historyIndex=hd(r.result||[],this.historyIndex);let i=0;for(let a=0;a<this.historyIndex.length;++a){let o=this.historyIndex[a],c=o.snapshot?o.snapshot_num||0:o.num||0;for(let l=0;l<=c;l++){let u=gg(o,l,!0);if(u&&Object.keys(u).length)for(let h in u)i+=(u[h]||0)+1;else i+=1}if(o.snapshot)break}this.scaleProgress(i),this.isSyncing=!0;let n=await this.flowGetLocalHistory(this.historyIndex,this.debugOpen);if(this.isSyncing=!1,!n.success)return{success:!1,...n};if(this.clearLocalSave(),n.cloudFetched){let a={[yt.ContentType]:gt.Json};this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:a}))}return{success:!0}}",
    "functionSha256": "13ee74b9d7b16384808762a13f4ad2460612eb0d7388fd6c477f1bf66a97385e",
    "call": "this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:a}))"
  },
  "openCloudHead": {
    "namespace": "project",
    "expression": "[this,s,r,i,n,a,o,Lg.prototype,Gd.prototype]",
    "length": 9,
    "offset": 2_129_806,
    "end": 2_129_901,
    "callerOffset": 2_129_817,
    "lineNumber": 110,
    "columnNumber": 115_607,
    "functionLineNumber": 110,
    "functionColumnNumber": 114_881,
    "functionStart": 2_129_091,
    "functionEnd": 2_129_915,
    "functionSource": "(s){let r=[];if(s){let c=await this.getHistories(s);if(!c.success)throw new Error(\"Get Histories Failed!\");r=(c==null?void 0:c.result)||[]}let i=0;for(let c=0;c<r.length;++c){let l=r[c];if(i+=(l.snapshot?l.snapshot_num||0:l.num||0)+1,l.snapshot)break}this.scaleProgress(i),this.isSyncing=!0;let n=[],a=0;for(let c=0;c<r.length;++c){let l=r[c],u=(l.snapshot?l.snapshot_num||0:l.num||0)+1;if(a+u>30&&(await Promise.all(n),n.length=0,a=0),a+=u,n.push(du(l,h=>{let p=this.getFlowParse(l,h,!0,!0),d=p.end;return p.end=()=>{d==null||d(),this.progress.update()},p},void 0,void 0,this.debugOpen)),l.snapshot)break}n.length&&await Promise.all(n),this.isSyncing=!1,this.historyIndex=r;let o={[yt.ContentType]:gt.Json};return this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:o})),{success:!0}}",
    "functionSha256": "d842e91fbe1ccdbed2de69583ea19e5909c5124c1a4947600f28109893a78426",
    "call": "this.cache.put(ou(this.branchUuid),new Response(JSON.stringify(this.historyIndex),{headers:o}))"
  }
});
export type CurrentProjectSaveProducerCacheCaller = keyof typeof CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const originalFrames = z.array(z.unknown()).min(2).max(32);
const originalParams = z.looseObject({ callFrames: originalFrames });
const originalEvent = z.looseObject({ params: originalParams });
const frame = z.looseObject({ callFrameId: handle, location, functionLocation: location });
/** Supply only the exact retained original headEntry event. The central owner
 * separately binds its first frame and consumes each caller capture attempt. */
export function currentProjectSaveProducerCacheCallerFrame(input: unknown, scriptId: string): Readonly<{ role: CurrentProjectSaveProducerCacheCaller; callFrameId: string }> {
  const captured = captureCurrentPcbStringClockReply(input).value;
  const event = originalEvent.parse(captured);
  const actual = frame.parse(event.params.callFrames[1]);
  for (const [name, site] of Object.entries(CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS)) {
    if (actual.location.scriptId === scriptId && actual.functionLocation.scriptId === scriptId && actual.location.lineNumber === site.lineNumber && actual.location.columnNumber === site.columnNumber && actual.functionLocation.lineNumber === site.functionLineNumber && actual.functionLocation.columnNumber === site.functionColumnNumber) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The name enumerates this fixed own-data source roster.
      return Object.freeze({ role: name as CurrentProjectSaveProducerCacheCaller, callFrameId: actual.callFrameId });
    }
  }
  throw new Error("PROJECT_SAVE_PRODUCER_ORIGINAL_CACHE_CALLER");
}
export function qualifyCurrentProjectSaveProducerCacheSource(source: unknown): void {
  qualifyCurrentProjectSaveProducerSource(source); if (typeof source !== "string") { throw new TypeError("PROJECT_SAVE_PRODUCER_CACHE_SOURCE"); }
  const lines = source.split("\n");
  for (const site of Object.values(CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS)) {
    const offset = lines.slice(0, site.lineNumber).reduce((sum, line) => sum + line.length + 1, 0) + site.columnNumber;
    if (offset !== site.callerOffset || source.slice(site.callerOffset, site.callerOffset + 3) !== "put" || source.slice(site.offset, site.end) !== site.call || source.slice(site.functionStart, site.functionEnd) !== site.functionSource || createHash("sha256").update(source.slice(site.functionStart, site.functionEnd)).digest("hex") !== site.functionSha256) { throw new Error("PROJECT_SAVE_PRODUCER_CACHE_CALLER_SOURCE"); }
  }
}

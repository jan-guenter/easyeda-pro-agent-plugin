/** Exact changed-head loader callees. These supplied source facts issue no continuation. */
/* oxlint-disable eslint/no-template-curly-in-string -- Complete vendor functions are source data. */
import { createHash } from "node:crypto";
import { qualifyCurrentGeneratedInitialSyncSource } from "./current-generated-initial-sync-source.ts";
import { CURRENT_GENERATED_INITIAL_BRANCH_SOURCE as BRANCH } from "./current-generated-initial-branch-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_POST_HISTORY_SYNC_MODULE = "[du,mg,fc,Us,Uo,ou,Na,Ro,Gu,rI]";
export const CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLEES = freezeDeep([
  {
    "name": "du",
    "arity": 3,
    "async": true,
    "regular": false,
    "start": 1_852_674,
    "end": 1_852_979,
    "lineNumber": 109,
    "columnNumber": 5378,
    "source": "async function du(e,t,s,r=!0,i){let n=e.snapshot?0:s||0,a=e.snapshot?e.snapshot_num||0:e.num||0,o=Math.min(a-n+1,30),c=async(u,h,p,d,m,f)=>{try{await mg(u,h,p,d,m)}catch(g){throw f!=null&&yg(u,f,p),g}},l=[];for(let u=n;u<=a;u++){let h=u?`-${u}`:\"\",p=fc(e,h,r),d=t(u);l.push([e,p,r,d,i,u])}await Us(o,c,l)}",
    "bytes": 305,
    "sha256": "52d4edbe1deeb3f0ed5e733a1347d381797954e0a38fce453a0b294490ff6354"
  },
  {
    "name": "mg",
    "arity": 1,
    "async": true,
    "regular": false,
    "start": 1_850_334,
    "end": 1_851_314,
    "lineNumber": 109,
    "columnNumber": 3038,
    "source": "async function mg(e,t=e.dataStrUrl,s=!0,r,i){let n=new Headers;n.append(yt.ContentType,gt.Text);let a=await fetch(t,{method:\"GET\",redirect:\"error\",headers:n});if(!a.ok){if(i)return\"\";throw new Error(`\\u65E0\\u6CD5\\u4ECE\\u540E\\u7AEF\\u83B7\\u53D6\\u5386\\u53F2\\u6570\\u636E(HTTP ${a.status}): ${t}`)}let o=await a.arrayBuffer();if(!(o!=null&&o.byteLength))return\"\";let c=new Kn,l=new Ql;try{let{key:u}=e,h=s&&e.snapshot?e.snapshot:e.iv||e.uuid;if(o&&h&&u){let p=Ca(u),d=Ca(h);await c.init({key:p,iv:d});try{let f=await c.decrypt2(o),g=Do(new Uint8Array(f));l.write(g,y=>{y&&r.update(y)})}catch{let g=await c.decrypt(o),y=Do(new Uint8Array(g));l.write(y,b=>{b&&r.update(b)})}let m=l.end();m&&r.update(m),r.end()}else throw new Error(`\\u5386\\u53F2\\u6570\\u636E\\u89E3\\u5BC6\\u4FE1\\u606F\\u7F3A\\u5931\\uFF0C\\u65E0\\u6CD5\\u89E3\\u5BC6: ${t}`)}catch(u){if(l.end(),console.error(\"\\u6570\\u636E\\u89E3\\u5BC6\\u5931\\u8D25!!!\",t,u),!i)throw new Error(\"\\u6570\\u636E\\u89E3\\u5BC6\\u5931\\u8D25!!!\"+u);return\"\"}}",
    "bytes": 980,
    "sha256": "5856d83c813dbfd56885d3d35d0a74d6c9732bd0e158069c72418d9c24b9ce74"
  },
  {
    "name": "fc",
    "arity": 3,
    "async": false,
    "regular": true,
    "start": 1_851_314,
    "end": 1_851_385,
    "lineNumber": 109,
    "columnNumber": 4012,
    "source": "function fc(e,t,s){return s&&e.snapshot?e.snapshotUrl+t:e.dataStrUrl+t}",
    "bytes": 71,
    "sha256": "3b25ecd849db5090a980bd17480569946ec0fd2dc91253d24ce4a9b0d4501f5f"
  },
  {
    "name": "Us",
    "arity": 3,
    "async": false,
    "regular": true,
    "start": 1_845_836,
    "end": 1_845_980,
    "lineNumber": 108,
    "columnNumber": 144_351,
    "source": "function Us(e,t,s){let r=qA(e),i=[];if(s)for(let n of s){let a=Array.isArray(n)?n:[n];i.push(r(t,...a))}else i.push(r(t));return Promise.all(i)}",
    "bytes": 144,
    "sha256": "873138ae51548e1e8769898c4974956b90a1294bf161b17acea995af2d739a27"
  },
  {
    "name": "Uo",
    "arity": 4,
    "async": false,
    "regular": true,
    "start": 665_742,
    "end": 665_842,
    "lineNumber": 61,
    "columnNumber": 403,
    "source": "function Uo(e,t,s,r){return $y(`dataStr/${e}${t&&t!==\"0\"?`-${t}`:\"\"}-${s}${r&&r!==\"0\"?`-${r}`:\"\"}`)}",
    "bytes": 100,
    "sha256": "33c3594acd1121cb2917f5e792a549eb7601ef64abd05181b8abc5d534e1510a"
  },
  {
    "name": "ou",
    "arity": 1,
    "async": false,
    "regular": true,
    "start": 1_709_078,
    "end": 1_709_123,
    "lineNumber": 108,
    "columnNumber": 7593,
    "source": "function ou(e){return $y(`index/v${1}/${e}`)}",
    "bytes": 45,
    "sha256": "f07495a6795f39c12f4058f9844d62b2660d4bab80dcf42e3933242b2d4ec5ef"
  },
  {
    "name": "Na",
    "arity": 2,
    "async": false,
    "regular": true,
    "start": 238_709,
    "end": 238_752,
    "lineNumber": 3,
    "columnNumber": 458,
    "source": "function Na(e,t){return rI.includes(t)?t:e}",
    "bytes": 43,
    "sha256": "b600911e11b7f1ee9a6b64c97ae33885953e22b09e846adeaa14c91ae5c53578"
  },
  {
    "name": "Ro",
    "arity": 4,
    "async": false,
    "regular": true,
    "start": 238_192,
    "end": 238_565,
    "lineNumber": 2,
    "columnNumber": 52,
    "source": "function Ro(e,t,s,r){let i=e.length,n=0;for(;n<i;){let a=e.indexOf(`|\n`,n);if(a<0){if(s)return e.substring(n);a=i}let o=Gu(e,n,a);try{if(o){let c=o.indexOf(\"||\"),l=c>-1,u=l?Gu(o,0,c):o,h=l?Gu(o,c+2):\"\";if(t(u,h,o,l?n+c+2:n)===!1){o=null;break}o=null}}catch(c){if(console.error(c),r)throw new Error((c==null?void 0:c.message)||\"\\u89E3\\u6790\\u5931\\u8D25\\uFF01\")}n=a+2}e=null}",
    "bytes": 373,
    "sha256": "fd048ca1f24caee0d2f52eee1cd93a869e05a678be8f557e8cf2f53d7a50f9f7"
  },
  {
    "name": "Gu",
    "arity": 3,
    "async": false,
    "regular": true,
    "start": 238_153,
    "end": 238_192,
    "lineNumber": 2,
    "columnNumber": 13,
    "source": "function Gu(e,t,s){return e.slice(t,s)}",
    "bytes": 39,
    "sha256": "34a339f4a743842890c591b8b8253e730cf36c57073cbf6aae3153f4e4f911c7"
  },
  {
    "name": "getFlowParse",
    "arity": 3,
    "async": false,
    "regular": false,
    "start": 2_020_325,
    "end": 2_021_153,
    "lineNumber": 110,
    "columnNumber": 6127,
    "source": "getFlowParse(t,s,r,i=!0,n,a,o){var f;let c=[],l={uuid:i&&t.snapshot||t.uuid,num:s,editHead:(f=t==null?void 0:t.editHead)==null?void 0:f[s],dNum:n};t.editHead||(t.editHead=[]),a&&(t.editHead[s]=a);let u=r?(g,y,b)=>{let E=Uo(l.uuid,s,g,y);o&&o(E,b);let T=this.cache.put(E,new Response(b));this.cachePromise.add(T),T.then(()=>this.cachePromise.delete(T))}:void 0,h=r?g=>{!a&&(t.editHead[s]=g)}:void 0,p=this.consistencyManager.flowParseFull({cache:u,history:l,onEditHead:h}),d=g=>{r&&c.push(g),p.update(g)},m=()=>{if(p.end(),r){let g=p.getDocIds();t.snapshot&&i?(t.snapDocs||(t.snapDocs=[]),p.docMap&&(t.snapDocs[s]=p.docMap),t.snapDocIds||(t.snapDocIds=[]),g.length&&(t.snapDocIds[s]=g)):(t.docs||(t.docs=[]),p.docMap&&(t.docs[s]=p.docMap),t.docIds||(t.docIds=[]),g.length&&(t.docIds[s]=g))}};return{start:p.start,end:m,update:d}}",
    "bytes": 828,
    "sha256": "73b0e0541118ecd7aac7e62fba245364f69d1c77c36cecb2b76dee1e1ad4db97"
  },
  {
    "name": "applySnap",
    "arity": 0,
    "async": true,
    "regular": false,
    "start": 2_024_986,
    "end": 2_025_453,
    "lineNumber": 110,
    "columnNumber": 10_791,
    "source": "async applySnap(){var s;if(Fe)return;let t;if(Fe&&Gm?t=150:Fe?t=30:t=100,this.historyIndex.length>t){let r={headers:{path:this.uuid}},i=await Ve(\"POST\",ae.SNAPSHOT.APPLY,{project:this.uuid,branch:this.branchUuid,path:this.uuid},r);i!=null&&i.success&&(i!=null&&i.result)&&this.createSnapshot((s=i==null?void 0:i.result)==null?void 0:s.history_uuid).catch(n=>console.error(`\\u521B\\u5EFA\\u5FEB\\u7167\\u5931\\u8D25 [project=${this.uuid}, branch=${this.branchUuid}]:`,n))}}",
    "bytes": 467,
    "sha256": "0333b96969d98746ce578b1a643ca71f75b205f7c3cd279e13664b1b27be4022"
  }
, { ...BRANCH.getLastHistoryUuid, name: "getLastHistoryUuid", arity: 1, async: true, regular: false, lineNumber: 110, columnNumber: 6044 }]);
export const CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER = Object.freeze({"lineNumber":110,"columnNumber":10_749,"functionLineNumber":110,"functionColumnNumber":8674,"expression":"[this]","length":1});
export function qualifyCurrentPcbViaPostHistorySyncSource(source:string):void { qualifyCurrentGeneratedInitialSyncSource(source);for(const row of CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLEES){const actual=source.slice(row.start,row.end);if(actual!==row.source||Buffer.byteLength(actual)!==row.bytes||createHash("sha256").update(actual).digest("hex")!==row.sha256){throw new Error("PCB_VIA_POST_SYNC_SOURCE");}}}

/** Exact supplied source for the worker-to-UI footprint row projection.
 * Source data establishes neither a runtime row nor deletion authority. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_FILES = freezeDeep({
  "worker": {
    "relativePath": "pro-mgr/3.2.185.bf63a159/js/project-worker.js",
    "bytes": 2_181_308,
    "sha256": "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046"
  },
  "ui": {
    "relativePath": "pro-ui/3.2.198.2800f583/js/ui.js",
    "bytes": 17_468_192,
    "sha256": "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6"
  },
  "main": {
    "relativePath": "../app.js",
    "bytes": 2_657_192,
    "sha256": "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c"
  }
} as const);
export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_SOURCE = freezeDeep({
  "normalizeTitle": {
    "file": "worker",
    "start": 1_845_081,
    "end": 1_845_242,
    "bytes": 161,
    "sha256": "20d51aa170a8edbe9fe6c06c0711e91d19fa819f1e87eda0f6480bd172980586",
    "source": "function Ne(e){return typeof e!=\"string\"?(console.warn(\"Title must be a string!title is \"+e),e):Fe?e.toLocaleLowerCase():e.replace(/[A-Z]+/g,t=>t.toLowerCase())}"
  },
  "docHead": {
    "file": "worker",
    "start": 275_156,
    "end": 276_360,
    "bytes": 1204,
    "sha256": "0d8998d30474148fde6795b3fde0c6a57b8c57b1dbdf089aa9f24ac1f4b3452f",
    "source": "onDocHead(e,t,s,r){r&&e!=null&&e.uuid&&e!=null&&e.updateTime&&(this.historyDocHead[r.uuid]||(this.historyDocHead[r.uuid]={}),(!this.historyDocHead[r.uuid][e.uuid]||this.historyDocHead[r.uuid][e.uuid].updateTime<e.updateTime)&&(this.historyDocHead[r.uuid][e.uuid]=e)),e.updateTime=e.updateTime||(t==null?void 0:t.updateTime),e.user=e.user||{uuid:t==null?void 0:t.uuid,username:t==null?void 0:t.username,nickname:t==null?void 0:t.nickname},this.setMaxTicket(e.ticket),this.docHead[e.uuid]?(!this.docHead[e.uuid].updateTime||this.docHead[e.uuid].updateTime<e.updateTime)&&(this.docHead[e.uuid].client=e.uuid,this.docHead[e.uuid].user=e.user,this.docHead[e.uuid].updateTime=e.updateTime,this.docHead[e.uuid].version=e.version,this.docHead[e.uuid].docType=e.docType,this.docHead[e.uuid].uuid=e.uuid,this.docHead[e.uuid].editVersion=e.editVersion,e.ticket&&e.ticket>this.docHead[e.uuid].ticket&&(this.docHead[e.uuid].ticket=e.ticket)):this.docHead[e.uuid]=e,this.creators[e.uuid]?this.creators[e.uuid].createTime>e.updateTime&&(this.creators[e.uuid].createTime=e.updateTime,this.creators[e.uuid].creator=e.user):this.creators[e.uuid]={createTime:e.updateTime,creator:e.user};for(let i of this.headCbArr)i(e,t)}"
  },
  "headChange": {
    "file": "worker",
    "start": 2_119_189,
    "end": 2_120_251,
    "bytes": 1062,
    "sha256": "898da83f178027276c6ecfcaf80ec0530ff6b72b3002e73ddad731e605a8566b",
    "source": "onHeadChange(s,r){var l;let i=(s==null?void 0:s.user)||{uuid:r==null?void 0:r.uuid,username:r==null?void 0:r.username,nickname:r==null?void 0:r.nickname},n=s.client,a=s.uuid,o=s.updateTime||(r==null?void 0:r.updateTime),c=s.version;switch(s.docType){case ve.CONFIG:break;case ve.BOARD:break;case ve.SCH:{this.schematic.setEditData(a,i,o,c,be.SCHEMATIC.ON_ADD,n);break}case ve.SCH_PAGE:{this.sheet.setEditData(a,i,o,c,be.SHEET.ON_ADD,n);let u=(l=this.sheet.data[a])==null?void 0:l.schematic;u&&this.schematic.setEditData(u,i,o,c);break}case ve.SIMULATION:{this.simulation.setEditData(a,i,o,c,be.SIMULATION.ON_ADD,n);break}case ve.PCB:{this.pcb.setEditData(a,i,o,c,be.PCB.ON_ADD,n);break}case ve.PANEL:{this.panel.setEditData(a,i,o,c,be.PANEL.ON_ADD,n);break}case ve.SYMBOL:{this.symbol.setEditData(a,i,o,c,be.SYMBOL.ON_ADD,n);break}case ve.FOOTPRINT:{this.footprint.setEditData(a,i,o,c,be.FOOTPRINT.ON_ADD,n);break}case ve.DEVICE:{this.device.setEditData(a,i,o,c,be.DEVICE.ON_ADD,n);break}case ve.INSTANCE:break;case ve.BLOB:break}this.publishMaxTicket(s.ticket)}"
  },
  "setEditData": {
    "file": "worker",
    "start": 1_857_186,
    "end": 1_857_789,
    "bytes": 603,
    "sha256": "0f0d25706407a59aa9e31b4c21723b7d66ab4e5aa605c6c13ff0c4754dd8f860",
    "source": "setEditData(s,r,i,n,a,o){var l,u;let c=o===this.client;if(!this.data[s])this.data[s]={[this.mainKey]:s,creator:r,createTime:i,modifier:r,updateTime:i,version:n,path:this.projectManager.uuid,owner:{uuid:this.projectManager.uuid,nickname:(u=(l=this.projectManager)==null?void 0:l.projectDetails)==null?void 0:u.name}},a&&this.projectManager.notifyWatcher(a,{uuid:s,projectId:this.projectManager.uuid,localChange:c});else{let h=this.data[s];(!h.createTime||i<h.createTime)&&(h.createTime=i,h.creator=r),(!h.updateTime||h.updateTime<i)&&(h.updateTime=i,r&&(h.modifier=r),h.version=n,this.publishUpdate(s))}}"
  },
  "onDataChange": {
    "file": "worker",
    "start": 1_878_825,
    "end": 1_879_756,
    "bytes": 931,
    "sha256": "a6d8254ca882842724fc5ab8d35ddc8d90b6088d74828f23465cb26a9e842356",
    "source": "onDataChange(s,r,i,n,a,o,c,l,u,h,p){let d=this.projectManager.uuid,m=a===this.client;this.data[s]||(this.data[s]={uuid:s},this.projectManager.notifyWatcher(be.FOOTPRINT.ON_ADD,{uuid:s,projectId:d,localChange:m}));let f=this.data[s];switch((!f.ticket||f.ticket<o)&&(f.ticket=o),n){case De.META:{let g=i?JSON.parse(i):null;f.source=g.source,f.title=g.title,f.description=g.description,f.tags=g.tags,!h&&!f.isDelete&&this.projectManager.notifyWatcher(be.FOOTPRINT.ON_UPDATE,{uuid:s,projectId:d,localChange:m}),this.publishCanvas(s,a,o,r,JSON.stringify(this.data[s]),n,c,l,u,h,p);break}case De.DELETE_DOC:{let g=i?JSON.parse(i):null;g&&g.isDelete?(f.isDelete=!0,!h&&this.projectManager.notifyWatcher(be.FOOTPRINT.ON_DELETE,{uuid:s,projectId:d,localChange:m})):(f.isDelete=!1,!h&&this.projectManager.notifyWatcher(be.FOOTPRINT.ON_ADD,{uuid:s,projectId:d,localChange:m}));break}default:{this.publishCanvas(s,a,o,r,i,n,c,l,u,h,p);break}}}"
  },
  "rowGet": {
    "file": "worker",
    "start": 1_880_762,
    "end": 1_881_278,
    "bytes": 516,
    "sha256": "8d9f306dc82edd247d74300e4f33e6bae6656fa1243f94fb16e889a674898dfe",
    "source": "get(s){var i,n;let r=this.data[s];return!r||r!=null&&r.isDelete?null:{uuid:r.uuid,project_uuid:this.projectManager.uuid,title:Ne(r.title),display_title:r.title,docType:Oe.FOOTPRINT,creator:r.creator,createTime:r.createTime||r.updateTime,modifier:r.modifier,description:r.description,updateTime:r.updateTime,custom_tags:JSON.stringify(r.tags),owner:(n=(i=this.projectManager)==null?void 0:i.projectDetails)==null?void 0:n.owner,source:r.source||\"\",version:r.version||\"\",path:this.projectManager.uuid,ticket:r.ticket}}"
  },
  "dataGet": {
    "file": "worker",
    "start": 1_881_665,
    "end": 1_881_816,
    "bytes": 151,
    "sha256": "f0c48f56d6da9af180f9bab41cf416d6670ad0830b4ce17a1e0e23fd34927864",
    "source": String.raw`getData(s){if(!s)return{success:!1,result:null};let r=this.get(s);return r?{success:!0,result:r}:{success:!1,message:"\u6570\u636E\u4E0D\u5B58\u5728"}}`
  },
  "change": {
    "file": "worker",
    "start": 2_105_542,
    "end": 2_107_140,
    "bytes": 1598,
    "sha256": "44bfca1afed5a3f24c30767ac3b7a0235fc8fd92808eb604564f98cee1424c9e",
    "source": "(n,a,o,c,l,u,h,p,d,m,f,g,y)=>{var E,T,w;let b=this.consistencyManager.getDoctype(n);switch(b){case ve.BLOB:{this.blob.onDataChange(n,a,o,c,u,l,p,d,f,m);break}case ve.BOARD:{this.board.onDataChange(n,o,c,p,l,u,m);break}case ve.CONFIG:{this.config.onDataChange(n,a,o,c,l,u,m);break}case ve.DEVICE:{this.device.onDataChange(n,o,c,l,u,m);break}case ve.FONT:{this.font.onDataChange(n,a,o,c,u,l,p,d,f,m);break}case ve.FOOTPRINT:{this.footprint.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.INSTANCE:{this.instance.onDataChange(n,a,o,c,l,u,p,d);break}case ve.PANEL:{this.panel.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.PCB:{this.pcb.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.SCH:{this.schematic.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.SCH_PAGE:{if(this.sheet.onDataChange(n,a,o,c,l,u,p,d,f,m,y),c===De.META){let S=(E=this.sheet.data[n])==null?void 0:E.schematic,v=(T=this.sheet.data[n])==null?void 0:T.updateTime,_=(w=this.sheet.data[n])==null?void 0:w.version;S&&this.schematic.setEditData(S,void 0,v,_)}break}case ve.SIMULATION:{this.simulation.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.SYMBOL:{this.symbol.onDataChange(n,a,o,c,l,u,p,d,f,m,y);break}case ve.VARIANT:{!m&&this.variant.onVariantChange(n,o,c);break}case ve.COMPONENT_GROUP:{!m&&this.variant.onGroupChange(n,a,o,c);break}case ve.COMPONENT_GROUP_DATA:{!m&&this.variant.onGroupDataChange(n,a,o,c);break}}if(this.uploadStructure(b,c,p),this.localPublishTicket(),this.canWsPublish()&&!d){if([ve.SYMBOL,ve.FOOTPRINT].includes(b)&&p&&c!==De.META)return;let S=[n,a,l,u,o,c,b,p];this.bufferedPendDataStream(S)}}"
  },
  "projectRow": {
    "file": "ui",
    "start": 6_146_304,
    "end": 6_146_402,
    "bytes": 98,
    "sha256": "a5bddc7e2acb8754a0e4d152afa38757ef9133c8d85995eb021f040c0f17068f",
    "source": "function tgt(t,e){return{...iai(t,e),custom_tags:e.custom_tags,source:e.source,version:e.version}}"
  },
  "rowBase": {
    "file": "ui",
    "start": 6_145_841,
    "end": 6_146_121,
    "bytes": 280,
    "sha256": "1da86b17410df73e82ec42687a86a23927b7cab55d6e74decbaceee85ec122fb",
    "source": "function iai(t,e){return{title:e.title,description:e.description,docType:e.docType,uuid:e.uuid,path:Eue(e)||t,ticket:e.ticket,updateTime:am(e.updateTime),createTime:am(e.createTime),display_title:e.display_title,creator:Oue(e.creator),modifier:Rue(e.modifier),owner:_ue(e.owner)}}"
  },
  "time": {
    "file": "ui",
    "start": 6_000_239,
    "end": 6_000_339,
    "bytes": 100,
    "sha256": "0b0674b7e5867393961073c48413cbb299e0f281d8cb81be440e778a092623c7",
    "source": "function am(t){return String(t).length===13?Number(t):String(t).length===10?Number(t)*1e3:Number(t)}"
  },
  "path": {
    "file": "ui",
    "start": 6_000_339,
    "end": 6_000_426,
    "bytes": 87,
    "sha256": "9afed988f2c07db8a9d4442645c2daea044745ad0d53692fde2443c8217a9152",
    "source": "function Eue(t){var e;return t.path||t.project_uuid||((e=t.owner)==null?void 0:e.uuid)}"
  },
  "creator": {
    "file": "ui",
    "start": 6_144_451,
    "end": 6_144_533,
    "bytes": 82,
    "sha256": "eff29c9f3c771a6b15fa232f1a26f236ddf4f59cbb5e3ad14dee5c9a23643564",
    "source": "function Oue(t){return t?{uuid:t.uuid,nickname:t.nickname,username:t.username}:{}}"
  },
  "modifier": {
    "file": "ui",
    "start": 6_144_584,
    "end": 6_144_666,
    "bytes": 82,
    "sha256": "f60e87d7b319a688d3fd93d0ef7877ae73184d1e1b87fdf3b5396b8c9a60bf78",
    "source": "function Rue(t){return t?{uuid:t.uuid,nickname:t.nickname,username:t.username}:{}}"
  },
  "owner": {
    "file": "ui",
    "start": 6_144_666,
    "end": 6_144_748,
    "bytes": 82,
    "sha256": "43a408f6962bedd66071de9fd3f53d67e4d7c904e941a5ca9c9aa4926d4293dc",
    "source": "function _ue(t){return t?{uuid:t.uuid,nickname:t.nickname,username:t.username}:{}}"
  },
  "projectServiceShow": {
    "file": "main",
    "start": 2_317_612,
    "end": 2_318_997,
    "bytes": 1385,
    "sha256": "8002a5933781102a9315c2ded072ebb883b9711cdceaa64ede8011412afcad3e",
    "source": "async show(e){this.ctx.logger.trace(\"begin show\");let r=dt.instance(),i=fe.instance(\"owner_\"),s=fe.instance(\"creator_\"),a=qL.instance(\"members_\"),n=fe.instance();if(!(0,DE.existsSync)(e))return;let o=await y(this.ctx,e);this.ctx.logger.trace(\"begin queryAll projectInfo\");let c=await o.queryAll({JOIN:r},{LJOIN:[i,{EQ:[r.owner_uuid,i.uuid]}]},{LJOIN:[s,{EQ:[r.owner_uuid,s.uuid]}]},{LJOIN:[a,{EQ:[r.uuid,a.project_uuid]}]},{LJOIN:[n,{EQ:[a.user_uuid,n.uuid]}]},{EQ:[1,1]},{PROJECTION:[r.uuid,r.archive,r.content,r.cbb_project,r.thumb,r.ticket,r.g_ticket,r.owner_uuid,r.creator_uuid,r.created_at,r.updated_at,r.modifier_uuid,r.boards,r.block_symbol_attrs_groups,r.pcb_count,r.default_sheet,r.branch_uuid,i.username,i.nickname,i.avatar,a.role,a.user_uuid,n.username,n.nickname]});if(this.ctx.logger.trace(\"end queryAll projectInfo\"),c.length<1)throw Error(\"project does not exists\");let A={};c&&(A=c[0],A.members=[]);for(let u of c)A.members.push({uuid:u.members_user_uuid||\"\",username:u.member_user_username||\"\",nickname:u.member_user_nickname||\"\",avatar:\"\"});return A&&(A.name=rd.parse(e).name,A.title=A.name,A.owner={uuid:A.owner_uuid,username:A.owner_username,nickname:A.owner_nickname,avatar:A.owner_avatar},A.boards=A.boards===\"{}\"?[]:JSON.parse(A.boards),A.block_symbol_attrs_groups=A.block_symbol_attrs_groups?JSON.parse(A.block_symbol_attrs_groups):{}),A.readOnly=await uc(e),A}"
  },
  "projectControllerShow": {
    "file": "main",
    "start": 2_373_016,
    "end": 2_373_126,
    "bytes": 110,
    "sha256": "454f6e5ca321a55ab5154fdcc9aed0161877ee5ba7ae278e089e2409a453424c",
    "source": "async show(){let e=await this.projectService.show(this.path);e&&(e.uuid=this.ctx.projectUuid),this.ctx.body=e}"
  }
} as const);
export type CurrentFootprintInversePublicRowFile = keyof typeof CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_FILES;
const digest = (text: string): string => createHash("sha256").update(text).digest("hex");
export function qualifyCurrentFootprintInversePublicRowSource(file: CurrentFootprintInversePublicRowFile, source: string): void {
  const profile = CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_FILES[file];
  if (!source.isWellFormed() || Buffer.byteLength(source) !== profile.bytes || digest(source) !== profile.sha256) { throw new Error("INVERSE_PUBLIC_ROW_SOURCE"); }
  for (const row of Object.values(CURRENT_FOOTPRINT_INVERSE_PUBLIC_ROW_SOURCE).filter(value => value.file === file)) {
    const text = source.slice(row.start, row.end);
    if (text !== row.source || Buffer.byteLength(text) !== row.bytes || digest(text) !== row.sha256) { throw new Error("INVERSE_PUBLIC_ROW_SOURCE_SPAN"); }
  }
}

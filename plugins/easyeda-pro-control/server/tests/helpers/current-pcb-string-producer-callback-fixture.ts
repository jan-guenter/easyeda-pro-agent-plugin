/** Exact inert callback excerpts from WORKER b849bd12. Synthetic factories may
 * compile these snippets, but never execute these vendor callback bodies. */
export const currentPcbStringProducerCallbackSources = {
  uploadStructure: '(s,r,i)=>{if(this.isReady&&!this.isReadOnly()&&!this.isSyncing&&[ve.BOARD,ve.PCB,ve.SCH,ve.SCH_PAGE,ve.SYMBOL,ve.PANEL].includes(s)&&!(i&&r!=De.META&&r!==De.DELETE_DOC))return this.structure()}',
  structure: 'async()=>{console.time("structure throttle");let s=null,r=new Promise(i=>s=i);this.task2.add(r);try{let i=this.board.getStructure().result,n=this.schematic.getStructure().result,a=this.sheet.getStructure().result,o=this.pcb.getStructure().result,c=this.panel.getStructure().result,l=this.symbol.getStructure().result,u={boards:i,schematics:n,sheets:a,pcbs:o,panels:c,blockSymbols:l,owner:this.projectDetails.owner},h=this.consistencyManager.getMaxTicket(),p={uuid:this.uuid,branch_uuid:this.branchUuid,ticket:h,datas:u},d=await Re.getInstance().project.setProfile(p);if(s(),this.task2.delete(r),d&&!(d!=null&&d.success)){let m="Project tree structure generation failed!";return et("warn",[m]),{success:!1,message:m}}return console.timeEnd("structure throttle"),d}catch(i){throw s(),this.task2.delete(r),new Error(i)}}',
  cooperation: 's=>{this.isReadOnly()||this.wsBus.publish("/pro-mgr/notify/send",{topic:"/document/sendMsg/cooperation",uuid:"pendData",path:this.branchUuid,msg:{type:"pendData",data:s}})}',
  upload: 'async()=>{this.isBatchUpload||await this.batchUploadCloud()}',
  buffer: 'function o(l){let u=Array.isArray(l)?l:[l];for(let h of u)a.bufferUploadData.set(h.dataUrl,h.dataStr)}',
  drain: 'async function c(){r=null;let l=i,u=n;n=null,i=null;try{await t()}catch(h){console.error(h)}u&&u(),l&&a.task1.delete(l)}',
} as const;

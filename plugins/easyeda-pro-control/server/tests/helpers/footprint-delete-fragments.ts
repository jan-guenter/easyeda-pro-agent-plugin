/** Actual pinned methods; tests supply inert dependency responders only. */
/* oxlint-disable unicorn/prefer-string-raw, eslint/no-template-curly-in-string -- Preserve exact inert vendor bytes without evaluating their template literals. */
export const footprintDeleteFragments = {
  "header": "function xt(e,t,s,r,i,n,a,o){let c={docType:e,client:t,uuid:s};return(r||r===0)&&(c.updateTime=r),(i||c.updateTime||c.updateTime===0)&&(c.version=i||String(r)),(o||self!=null&&self.PRO_EDITOR_VERSION)&&(c.editVersion=o||(self==null?void 0:self.PRO_EDITOR_VERSION)),n&&(c.user=n),`${JSON.stringify({type:\"DOCHEAD\",ticket:a})}||${JSON.stringify(c)}`}",
  "atom": "function $e(e,t,s,r,i,n,a,o){if(r==null)throw new Error(`getAtomDataStr: \\u6570\\u636E\\u65E0\\u6548, dataType=${e}, ticket=${t}, id=${s}, data=${r}`);let c={type:e,ticket:t,id:s};return n!==void 0&&(c.firstTicket=n),a!==void 0&&(c.pend=a),o!==void 0&&(c.num=o),i&&(c.client=i),`${JSON.stringify(c)}||${r}`}",
  "deleteEncoder": "delete(e,t){let s=t||JSON.stringify({isDelete:!0});return $e(\"DELETE_DOC\",e,\"DELETE_DOC\",s)}",
  "deleteString": "async deleteString(s){let r=new Ke,i=[],n=await qe();i.push(r.footprint.head({doc:s,client:this.client,updateTime:n,user:this.user,ticket:this.maxTicket+1}));let a=JSON.stringify({isDelete:!0}),o=this.newTicket;return i.push(r.footprint.delete(o,a)),i.join(Ie)}",
  "deleteData": "async deleteData(s){if(this.verifyKey(s),!this.isHas(s))return{success:!1,message:\"\\u6570\\u636E\\u4E0D\\u5B58\\u5728\"};let r=await this.deleteString(s);return await this.projectManager.uploadLocal([r]),{success:!0}}",
  "headMethod": "head(e){return xt(this.doctype,e.client,e.doc,e.updateTime,e.version||String(e.updateTime),e.user,e.ticket)}"
} as const;

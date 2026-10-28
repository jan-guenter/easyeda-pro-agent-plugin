/** Exact inert application fragments; compiled or hashed only in synthetic tests. */
/* oxlint-disable eslint/no-template-curly-in-string -- Preserve vendor template and JSON escaping without evaluating interpolation. */
export const mainRequestFragments = Object.freeze({
  "sqlQueryOne": "queryOne(...e){this.logger.trace(\"queryOne\",e);let{sql:r,params:i}=wo(...e);return this.dbWrap.queryOne(r,i.map(s=>s.value))}",
  "editHead": "async function PB(t){return`${JSON.stringify({type:\"EDIT_HEAD\"})}||${JSON.stringify(t.modify)}|\n${t.dataStr}`}",
  "createProjectHistory": "async createProjectHistory(){let e=await L3(this.ctx,this.path,!0),r={projectUuid:this.ctx.routerParams.projectUuid,branchUuid:this.ctx.routerParams.branchUuid,dataStr:e};if(this.path==ge.lcscUuid)throw new le(W.PERMISSION_DENIED);this.ctx.body=await this.service.saveProjectHistory(this.ctx,this.path,r)}"
} as const);
/* oxlint-enable eslint/no-template-curly-in-string */

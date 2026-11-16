/** Separate bounded rejection-observation lane. The released V2 normal-return
 * schedule and its 2002 requests remain unchanged and cannot be refunded. */
export const CURRENT_MAIN_STARTUP_LIBRARY_READONLY_PROFILE=Object.freeze({
  maximumRequests:8,normalPathRequests:3,rejectionPathRequests:8,firstScriptIndex:0,
  phases:Object.freeze(["points","arm","frame","proof","remove-return","remove-failure","require","resume"] as const),
});
/** Consume before dispatch. Only the original controller may correlate this
 * bookkeeping with its real source-held pause and acknowledged resume. */
export class CurrentMainStartupLibraryReadonlySchedule {
  #stage=0;#requests=0;#failed=false;#normal=false;
  public consume(phase:string):void {
    if(this.#failed || this.complete) { throw new Error("STOCK_READONLY_SEQUENCE"); }
    const normal=this.#stage===2 && phase==="sql-stock-readonly-disarm-normal";
    const expected=`sql-stock-readonly-${CURRENT_MAIN_STARTUP_LIBRARY_READONLY_PROFILE.phases[this.#stage] ?? "invalid"}`;
    if(!normal && phase!==expected) { this.#failed=true;throw new Error("STOCK_READONLY_SEQUENCE"); }
    this.#requests+=1;
    if(normal) { this.#normal=true; } else { this.#stage+=1; }
  }
  public get complete():boolean { return !this.#failed && (this.#normal || this.#stage===8); }
  public get rejected():boolean { return this.complete && !this.#normal; }
  public get requests():number { return this.#requests; }
}

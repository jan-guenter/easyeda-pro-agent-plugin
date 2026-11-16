/** Pinned user-profile SELECTs use distinct profile wrappers. This pure
 * descriptor proof cannot replace a paused SQL guard or issue a continuation. */
import { CURRENT_MAIN_STARTUP_CONFIG_JOIN_HELPERS as HELPERS } from "./current-main-startup-config-programs.ts";

const BODY = "async login(e){let r=fe.instance();return(await y(this.ctx,_)).queryOne({JOIN:r},{EQ:[r.username,new d(e)]},{PROJECTION:[r.uuid,r.username,r.nickname]})}";
export const CURRENT_MAIN_STARTUP_USER_READ_SOURCE = Object.freeze({
  login: Object.freeze({ start: 2_220_292, end: 2_220_445, body: BODY,
    caller: Object.freeze({ lineNumber: 8519, columnNumber: 4929 }) }),
  byUuid: Object.freeze({ start: 2_220_445, end: 2_220_713, body: "async getByUuid(e,r){this.ctx.logger.trace(\"begin get user info\");let i=fe.instance(),s=await y(this.ctx,e);this.ctx.logger.trace(\"begin query user info\");let a=await s.queryOne({JOIN:i},{EQ:[i.uuid,new d(r)]},{PROJECTION:Object.values(i)});return delete a.password,a}",
    caller: Object.freeze({ lineNumber: 8519, columnNumber: 5188 }) }),
  prefix: Object.freeze([
    Object.freeze({ lineNumber: 1025, columnNumber: 700 }),
    Object.freeze({ lineNumber: 1025, columnNumber: 672 }),
    Object.freeze({ lineNumber: 1025, columnNumber: 2858 }),
  ]),
});
interface Frame { readonly location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> }
/** The caller must already own the complete qualified app source and its
 * original script. Matching source data alone creates no native authority. */
export function isCurrentMainStartupUserRead(source: string, scriptId: string, frames: readonly Frame[]): boolean {
  const pinned = CURRENT_MAIN_STARTUP_USER_READ_SOURCE;
  return [pinned.login,pinned.byUuid].some(site => source.slice(site.start,site.end) === site.body &&
    frames.length >= 4 && [...pinned.prefix,site.caller].every((point,index) => {
      const frame=frames[index];
      return frame!==undefined && frame.location.scriptId===scriptId && frame.location.lineNumber===point.lineNumber && frame.location.columnNumber===point.columnNumber;
    }));
}
export const CURRENT_MAIN_STARTUP_USER_READ_OWNER_PROGRAM = `function(configTracker){${HELPERS}const o=retained(configTracker),z=o.z;checked(this,z.proxy);arr(this,4);const w=checked(own(this,"0"),z.proxy),db=database(own(w,"db"),o.path,z);if(Object.getPrototypeOf(w)!==own(own(o.capture,"1"),"prototype")||own(this,"3")!==z.sc||typeof own(this,"1")!=="string")bad();const p=own(this,"2");if(dense(p,z.proxy)!==1||typeof own(p,"0")!=="string")bad();verify();if(own(w,"db")!==db)bad();return true;}`;

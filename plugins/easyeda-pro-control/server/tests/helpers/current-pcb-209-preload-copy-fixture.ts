/** The sole pinned 646-byte generated function and original creator expression,
 * placed in an otherwise inert program. The sorting function is never called.
 * This fixture proves local V8 event behavior, not complete preload admission. */
import { Session } from "node:inspector";
import { Script } from "node:vm";

export const PRELOAD_COPY_FIXTURE_SOURCE = "(function Is(e,t,i=0,s=e.length){r(e,null,t,i,s);function r(a,o,l,u,c){let h,d,p,f;if(u<c-1){let m=c-u;if(m>50)o===null&&(o=new Array(m+1)),n(a,o,l,u,(u+c)/2|0,c);else{h=a[u],d=u,p=u,f=c;let g=d+1;for(;g<f;){if(p!=f){if(f=f+-1,l(h,a[f])<=0)continue;a[p]=a[f],p=f;continue}if(l(h,a[g])>=0){d=g,g=d+1;continue}a[p]=a[g],d=g,p=g,g=d+1}a[p]=h,r(a,o,l,u,p),r(a,o,l,p+1,c)}}}function n(a,o,l,u,c,h){r(a,o,l,u,c),r(a,o,l,c,h);for(var d=u,p=c,f=0,m=a[d],g=a[p];d<c&&p<h;){var b=l(m,g);isNaN(b)?(o[f++]=g,g=a[++p]):(b<=0&&(o[f++]=m,m=a[++d]),b>=0&&(o[f++]=g,g=a[++p]))}for(;d<c;d++)o[f++]=a[d];for(;p<h;p++)o[f++]=a[p];for(d=u,p=0;p<f;d++,p++)a[d]=o[p]}})";
const PRELOAD_URL = "https://modules.lceda.cn/pro-mgr/3.2.185.bf63a159/js/preload.js";

function fixtureProgram(): string {
  const lines = Array.from({ length: 9 }, (): string => "");
  const place = (line: number, column: number, text: string): void => {
    const previous = lines[line];
    if (previous === undefined || previous.length > column) { throw new Error("Fixture overlap"); }
    lines[line] = previous.padEnd(column) + text;
  };
  place(0, 0, "(()=>{");
  place(7, 39_733, PRELOAD_COPY_FIXTURE_SOURCE.slice(1, -1));
  place(7, 42_677, "var wt=class{static funcCopy(e){return(0,eval)(\"(\"+e.toString()+\")\")}};");
  place(8, 102_952, "var ju=wt.funcCopy(Is);");
  place(8, 111_780, "var iE=wt.funcCopy(Is),sE=wt.funcCopy(Is),rE=wt.funcCopy(Is);");
  place(8, 111_900, "})();");
  return lines.join("\n");
}

/** Execute only in the test-owned child process. Each original instrumentation
 * pause is resumed once, and the session is disconnected before returning. */
export function capturePreloadCopyFixture(): Readonly<{ parsed: readonly unknown[]; paused: readonly unknown[]; sources: readonly unknown[]; preloadScriptId: string }> {
  const parsed: unknown[] = [], paused: unknown[] = [], session = new Session(), sources: unknown[] = [];
  const copies = new Set<string>(); let preloadScriptId = "";
  session.connect();
  try {
    session.post("Debugger.enable");
    session.on("Debugger.scriptParsed", ({ params }) => {
      if (params.url === PRELOAD_URL) { preloadScriptId = params.scriptId; }
      if (params.url === "" && params.stackTrace?.callFrames[0]?.scriptId === preloadScriptId) {
        copies.add(params.scriptId); parsed.push(params);
      }
    });
    session.on("Debugger.paused", ({ params }) => {
      const scriptId = params.callFrames[0]?.location.scriptId;
      if (scriptId !== undefined && copies.has(scriptId)) {
        paused.push(params);
        // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Same-process V8 pause callbacks must complete synchronously before the one resume.
        session.post("Debugger.getScriptSource", { scriptId }, (error, result) => {
          if (error !== null) { throw error; } sources.push(result);
        });
      }
      session.post("Debugger.resume");
    });
    session.post("Debugger.setInstrumentationBreakpoint", { instrumentation: "beforeScriptExecution" });
    new Script(fixtureProgram(), { filename: PRELOAD_URL }).runInThisContext();
  } finally { session.post("Debugger.disable"); session.disconnect(); }
  return { parsed, paused, sources, preloadScriptId };
}

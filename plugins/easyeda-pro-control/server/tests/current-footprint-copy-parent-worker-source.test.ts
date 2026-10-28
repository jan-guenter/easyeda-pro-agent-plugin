/** Exact pinned ordinary-open fragments in synthetic Node V8. No application,
 * project or installed asset is read, and this is not connected validation. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext, runInNewContext } from "node:vm";
import { CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_PROGRAMS as PROGRAMS } from "../src/current-footprint-copy-parent-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES as SITES } from "../src/current-footprint-copy-parent-worker-source.ts";

const open = String.raw`async open(t){try{let{uuid:s,cPath:r,options:i={}}=t;if(!s)throw new Error(\`invalid project uuid: \${s}\`);this.uuid=s,this.cPath=r,console.log("[OPEN PROJECT] Start open project in MGR"),this.options=i,vp(this.uuid,this),this.isOpening=!0,this.worker=new Worker(\`editor?entry=mgr-project-worker.js&cll=\${self.PRO_LOG_LEVEL}&debugOpen=\${dd()}\`,{name:\`project_\${this.uuid}_\${window._TAB_ID_}\`}),this.workerBus=Hn(\`/\${window._TAB_ID_}/project/\${this.uuid}\`),new aO.WorkerMessageBridge(Ee.messageBus,this.worker),this.mainBus=Ee.messageBus,console.time("Open project in worker..."),console.log("[OPEN PROJECT] Open project in worker");let n=await this.workerBus.rpcCall(J.public.openProject,{uuid:this.uuid,cPath:this.cPath,_TAB_ID_:window._TAB_ID_,options:this.options,isEstablished:!!self._WS_ID_},1440*6e4);return console.timeEnd("Open project in worker..."),n.success?(this._projectDetail=n.result,await this.onSuccess(),console.log("[OPEN PROJECT] onSuccess in MGR")):(this.onFailed(),console.log("[OPEN PROJECT] Succeed to open the project in MGR")),n}catch(s){return console.error(s),this.onFailed(),console.log("[OPEN PROJECT] Failed to open project"+s.message),{success:!1,message:s.message}}}`.replaceAll("\\`", "`").replaceAll("\\${", "${");
const dispatch = "async function cO(e){let{uuid:t}=e,s=rl(t);return s?{success:!0,result:(await s.project.getData(t)).result}:(s=new tl,await s.open(e))}";
const registration = "V(ls.OPEN,async t=>await cO(t))";
const constructor = "constructor(){this.isReady=false;this._isOpening=false;this._isClosing=false;}get isOpening(){return this._isOpening;}set isOpening(value){this._isOpening=value;}";
const hash = (value: string): string => createHash("sha256").update(value).digest("hex");
const ignoreConsole = (): undefined => undefined;
async function retainResume(promise: Promise<unknown>, errors: unknown[]): Promise<void> {
  try { await promise; } catch (error) { errors.push(error); }
}

void test("ordinary parent source pins bind ls.OPEN through cO/new tl rather than the adjacent temporary open", () => {
  for (const [fragment, span] of [[open, SITES.open], [dispatch, SITES.dispatch], [registration, SITES.registration]] as const) {
    assert.equal(Buffer.byteLength(fragment), span.bytes); assert.equal(hash(fragment), span.sha256);
  }
  assert.equal(SITES.receiverClass, "tl");
  assert.equal(SITES.before.offset - SITES.open.start, open.indexOf("new Worker("));
  assert.equal(SITES.after.offset - SITES.open.start, open.indexOf("=Hn("));
  assert.equal(SITES.before.columnNumber, 123_154); assert.equal(SITES.after.columnNumber, 123_310);
});

void test("ordinary tl opening reaches both exact native sites before creating the bus", async () => {
  const events: string[] = [], session = new Session(); session.connect();
  const context = createContext({
    record: (value: string): void => { events.push(value); },
    console: { log: ignoreConsole, error: ignoreConsole, time: ignoreConsole, timeEnd: ignoreConsole },
  });
  const prefix = "var tl=class{";
  const openColumn = SITES.before.columnNumber - open.indexOf("new Worker(");
  const source = `${"\n".repeat(104)}${" ".repeat(openColumn - prefix.length)}${prefix}${open}${constructor}async onSuccess(){}onFailed(){throw Error("synthetic-open-failed");}};
const self={PRO_LOG_LEVEL:"warn"},window={_TAB_ID_:"tab"},dd=()=>false,vp=()=>{},rl=()=>undefined;
class Worker{constructor(){record("worker");}}const Hn=()=>{record("bus");return{rpcCall:async()=>({success:true})};};
const aO={WorkerMessageBridge:class{}},Ee={messageBus:{}},J={public:{openProject:"synthetic-open"}};
${dispatch}
//# sourceURL=easyeda-footprint-ordinary-parent-open.js`;
  const script: { value: Readonly<{ id: string; context: number }> | null } = { value: null };
  const errors: unknown[] = [], points = new Map<string, "before" | "after">();
  session.on("Debugger.scriptParsed", (event): void => {
    if (event.params.url === "easyeda-footprint-ordinary-parent-open.js") {
      script.value = Object.freeze({ id: event.params.scriptId, context: event.params.executionContextId });
    }
  });
  session.on("Debugger.paused", (event): void => {
    const side = points.get(event.params.hitBreakpoints?.[0] ?? "");
    events.push(`pause-${side ?? "unexpected"}`);
    void retainResume(session.post("Debugger.resume"), errors);
  });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable"); runInContext(source, context);
    const selected = script.value; assert.ok(selected !== null);
    for (const side of ["before", "after"] as const) {
      const location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> =
        { scriptId: selected.id, lineNumber: SITES[side].lineNumber, columnNumber: SITES[side].columnNumber };
      const reply = await session.post("Debugger.setBreakpoint", { location }); points.set(reply.breakpointId, side);
      assert.deepEqual(reply.actualLocation, location);
    }
    const request: Runtime.CallFunctionOnParameterType & Readonly<{ throwOnSideEffect: false }> = { executionContextId: selected.context,
      functionDeclaration: "async function(){return await cO({uuid:'synthetic-project'});}", returnByValue: true,
      awaitPromise: true, silent: true, throwOnSideEffect: false };
    const reply = await session.post("Runtime.callFunctionOn", request);
    const result: unknown = reply.result.value;
    assert.equal(reply.exceptionDetails, undefined); assert.deepEqual(result, { success: true });
    assert.deepEqual(events, ["pause-before", "worker", "pause-after", "bus"]); assert.deepEqual(errors, []);
  } finally {
    try { for (const breakpointId of points.keys()) { await session.post("Debugger.removeBreakpoint", { breakpointId }); } }
    finally { session.disconnect(); }
  }
});

void test("ordinary base-manager prototype satisfies the held opening guards without a bus or bridge", () => {
  const result: unknown = runInNewContext(`(()=>{
globalThis._TAB_ID_="tab";globalThis.Worker=class Worker{};
class tl{${constructor}}const project=new tl();project.uuid="path";project.isOpening=true;
Reflect.apply((${PROGRAMS.before}),project,["path","tab"]);
project.worker=new Worker();Reflect.apply((${PROGRAMS.after}),project,[project,"path","tab"]);
project.workerBus={};let refused=false;try{Reflect.apply((${PROGRAMS.after}),project,[project,"path","tab"]);}catch{refused=true;}
return refused;})()`);
  assert.equal(result, true);
});

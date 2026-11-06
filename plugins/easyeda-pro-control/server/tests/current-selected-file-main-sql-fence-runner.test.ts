/** Production runner scheduling against a deliberately synthetic CDP peer.
 * Only source/transport issuance are substituted; actual cursor, decoders,
 * ordering, predicates, counters and mutation-hold logic run unchanged. */
/* oxlint-disable import/max-dependencies -- Exercise the real source cursor with explicit synthetic transport/source peers and the actual actor decoders. */
import { currentPcbViaMainBeginNativeCases, validateCurrentPcbViaMainBeginCommand } from "../src/current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginCommand } from "../src/current-pcb-via-main-begin-protocol.ts";
import { viaMainActorProperties, viaMainActorValue } from "./helpers/via-main-actor-replies.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "../src/current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendRunner, CurrentFootprintCopyMainBackendTransport } from "../src/current-footprint-copy-main-backend-runner.ts";
import type { CurrentSelectedFileMainSqlFenceCommand as SqlCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as EARLY_ID } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "../src/current-selected-file-main-sql-fence-source.ts";
import { CurrentFootprintCopyMainBackendRunner as OriginalRunner, requireOriginalCurrentSelectedFileMainRequest } from "../src/current-footprint-copy-main-backend-runner.ts";
import { selectedRequestPeer, selectedRequestReaderConstructor } from "./helpers/selected-main-request-reader-fixture.ts";
import { CONFIG_SQL, mainBackendModule, mainBackendTransportFixture } from "./helpers/footprint-main-backend-runner-fixture.ts";
import type { CurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";
import { currentPcbViaMainNativeCases, validateCurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";

type Data = Record<string, unknown>;
type CurrentPcbViaMainStepCommand = Parameters<CurrentFootprintCopyMainBackendRunner["consumeOriginalViaMainDriverStep"]>[0];
const captureArrayId=(raw:unknown):string=>{assert.ok(raw!==null&&typeof raw==="object");const result:unknown=Reflect.get(raw,"result");assert.ok(result!==null&&typeof result==="object");const value:unknown=Reflect.get(result,"objectId");assert.ok(typeof value==="string");return value;};
const capability = Object.freeze({ profile: "private.selected-file-main-sql-fence-bootstrap.v1" as const, executionAuthorized: false as const });
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function nativeArray(): Data {
  return { result: [...["Database", "Statement", "", "Date", "now"].map((name, index) => property(String(index), { type: "function", className: "Function", description: `function ${name}() { [native code] }`, objectId: `native${String(index)}` }, true, true)),
    property("length", { type: "number", value: 5 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array" } }] };
}
function nativeMetadata(id: string): Data {
  let name = ""; if (id === "native0") { name = "Database"; } else if (id === "native1") { name = "Statement"; } else if (id === "native3") { name = "Date"; } else if (id === "native4") { name = "now"; }
  const result = [property("name", { type: "string", value: name }), property("length", { type: "number", value: name === "Date" ? 7 : 0 })];
  if (name !== "" && name !== "now") { result.push(property("prototype", { type: "object", className: "Object", objectId: "prototype" }, false, false, false)); }
  if (name === "Date") { for (const key of ["now", "parse", "UTC"]) { result.push(property(key, { type: "function", className: "Function", description: `function ${key}() { [native code] }`, objectId: `date-${key}` }, true, false)); } }
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "scopes" } }] };
}
const configPacket = (role: "jb" | "dc", site: "run" | "prepare" | "prepared", sql: string, transactionDepth: 0 | 1): Data => ({ recognized: true, role, site, sql, transactionDepth, parametersEmpty: true, designWriteGrant: false, nativeCompletionProven: false });
async function fixture(delta = 0, wrongStartup: "order" | "foreign" | null = null): Promise<Readonly<{ runner: CurrentFootprintCopyMainBackendRunner; phases: string[]; transport: CurrentFootprintCopyMainBackendTransport;
  injectBeginPoint: (role: "save" | "transaction" | "run" | "callback" | "returned") => void; injectViaPoint: (role: "context" | "controller" | "editHead") => void; loseNextDriverStep: () => void; injectRequest: (method: string, foreign?: boolean, sourceDelta?: number, history?: boolean) => void; injectMutation: () => void; injectDriver: () => void; resumes: () => number; deferPoll: () => Readonly<{ started: Promise<unknown>; release: () => void }> }>> {
  const base = mainBackendTransportFixture();
  const ids = new Map<number, number>(), phases: string[] = [], queue: Data[] = [], retainedRegistration: Data[] = [];
  let currentRequest = { method: "GET", url: "", delta: 0, pathHeader:"f".repeat(64) }, fetchScriptSeen = false;
  const startup: { site: keyof typeof SOURCE.sites; value?: Data }[] = [{ site: "startupVersion" }, { site: "startupJB" },
    { site: "run", value: configPacket("jb", "run", CONFIG_SQL.transaction.begin, 1) },
    ...CONFIG_SQL.scripts.jb.map(row => ({ site: "run" as const, value: configPacket("jb", "run", row.sql, 1) })),
    { site: "run", value: configPacket("jb", "run", `${CONFIG_SQL.broadcastDeletePrefix}1793920000000`, 1) },
    { site: "run", value: configPacket("jb", "run", CONFIG_SQL.transaction.commit, 0) }, { site: "startupDC" },
    ...CONFIG_SQL.scripts.dc.map(row => ({ site: "run" as const, value: configPacket("dc", "run", row.sql, 0) })),
    { site: "run", value: configPacket("dc", "run", `${CONFIG_SQL.cookieDeletePrefix}1793920000`, 0) },
    { site: "prepare", value: configPacket("dc", "prepare", CONFIG_SQL.cookieUpsert, 0) }, { site: "prepared", value: configPacket("dc", "prepared", CONFIG_SQL.cookieUpsert, 0) }];
  if (wrongStartup === "order") { startup[2] = { site: "run", value: configPacket("jb", "run", CONFIG_SQL.scripts.jb[0]?.sql ?? "", 1) }; }
  if (wrongStartup === "foreign") { startup[2] = { site: "run", value: { recognized: false } }; }
  let startupIndex = -1;
  let queuedBytes = Buffer.alloc(0); let contextPointActive = false, loseDriverStep = false, plannedResumes = 0;
  let holdRegistration = false, normalResumes = 0, runner: CurrentFootprintCopyMainBackendRunner | null = null, sqlResumes = 0;
  let heldPoll: Readonly<{ started: PromiseWithResolvers<null>; settle: PromiseWithResolvers<null> }> | null = null;
  const event = (method: string, params: Data): void => { queue.push({ method, params }); };
  const location = (site: keyof typeof SOURCE.sites): Data => ({ scriptId: "app", lineNumber: SOURCE.sites[site].lineNumber, columnNumber: SOURCE.sites[site].breakpointColumnNumber + (site === "import" ? delta : 0) });
  const pause = (site: keyof typeof SOURCE.sites): void => { const frames:Data[]=[{callFrameId:`frame-${site}`,location:location(site)}];
    if(site==="driver"){frames.push({callFrameId:"frame-caller",location:{scriptId:"app",lineNumber:1164,columnNumber:51_414}});}
    event("Debugger.paused",{reason:"other",hitBreakpoints:[site==="import"?EARLY_ID:`sql-${site}`],callFrames:frames});
  };
  const sqlSend = (command: SqlCommand, id: number): Promise<void> => {
    phases.push(command.phase); let result: unknown = {};
    if (command.phase === "sql-fence-early-arm") { result = { breakpointId: EARLY_ID, locations: [] }; }
    else if (command.phase === "sql-fence-after-imports-arm" || command.phase === "sql-fence-arm") {
      const site = command.phase === "sql-fence-after-imports-arm" ? "afterImports" : command.site; result = { breakpointId: `sql-${site}`, actualLocation: location(site) };
    } else if (command.phase === "sql-fence-resume") {
      sqlResumes += 1; event("Debugger.resumed", {});
      if(contextPointActive&&currentRequest.method==="GET"){event("Debugger.paused",{reason:"other",hitBreakpoints:["via-2540"],callFrames:[{callFrameId:"wrong-get-context",location:{scriptId:"app",lineNumber:1164,columnNumber:2540}}]});}
      if (sqlResumes === 1) { pause("afterImports"); }
      else { startupIndex += 1; const next = startup[startupIndex]; if (next === undefined) { holdRegistration = false; queue.push(...retainedRegistration.splice(0)); }
        else { pause(next.site); } }
    } else if (command.phase === "sql-fence-frame" || command.phase === "sql-fence-capture" || command.phase === "sql-fence-native-frame") {
      let count = 5;
      if (command.phase === "sql-fence-frame") { const counts = { afterImports: 4, startupVersion: 13, startupJB: 12, startupDC: 11, prepare: 6, prepared: 7 }; const actual: unknown = Object.getOwnPropertyDescriptor(counts, command.site)?.value; count = typeof actual === "number" ? actual : 5; }
      else if (command.phase === "sql-fence-capture") { count = 11; }
      result = { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId: command.phase } };
    } else if (command.phase === "sql-fence-properties") { result = command.params.objectId === "sql-fence-native-frame" ? nativeArray() : nativeMetadata(command.params.objectId); }
    else if (command.phase === "sql-fence-require") { result = { result: { type: "boolean", value: true } }; }
    else if (command.phase === "sql-fence-startup-version") { result = { result: { type: "object", subtype: "array", className: "Array", description: "Array(6)", objectId: "original-startup-tracker" } }; }
    else if (command.phase === "sql-fence-startup-jb" || command.phase === "sql-fence-startup-dc") { result = { result: { type: "boolean", value: true } }; }
    else if (command.phase === "sql-fence-startup-select") { result = { result: { type: "object", value: startup[startupIndex]?.value ?? { recognized: false } } }; }
    if (command.phase.startsWith("sql-fence-request-") || command.phase === "sql-fence-driver-frame" || command.phase === "sql-fence-fetch-source" ||
      command.phase === "sql-fence-properties" && "objectId" in command.params && !["sql-fence-native-frame", "native0", "native1", "native2", "native3", "native4"].includes(command.params.objectId)) { result = selectedRequestPeer(command, currentRequest); }
    queue.push({ id, result }); return Promise.resolve();
  };
  const transport: CurrentFootprintCopyMainBackendTransport = Object.freeze({
    assertCurrent: (): Promise<void> => base.transport.assertCurrent(),
    send: (command: Command, id: number): Promise<void> => {
      phases.push(command.phase); const local = base.commands.length + 1; ids.set(local, id);
      if (command.phase === "resume") {
        normalResumes += 1;
        if (normalResumes === 1) { holdRegistration = true; event("Debugger.resumed", {}); event("Debugger.scriptParsed", { scriptId: "app", url: "file:///synthetic/app.js", executionContextId: 1 }); pause("import"); }
      }
      return base.transport.send(command, local);
    },
    poll: async (): Promise<string> => {
      if (heldPoll !== null) { const original = heldPoll; original.started.resolve(null); await original.settle.promise; assert.equal(heldPoll, original); heldPoll = null; }
      for (;;) {
        if (queuedBytes.length > 0) { const part = queuedBytes.subarray(0, 32_768); queuedBytes = queuedBytes.subarray(part.length); return part.toString("base64"); }
        const ready = queue.shift(); if (ready !== undefined) { const bytes = Buffer.from(`${JSON.stringify(ready)}\0`); queuedBytes = bytes.subarray(32_768); return bytes.subarray(0, 32_768).toString("base64"); }
        const text = Buffer.from(await base.transport.poll(false), "base64").toString(); if (text === "") { return ""; }
        const value: unknown = JSON.parse(text.slice(0, -1)); assert.ok(value !== null && typeof value === "object");
        if (Object.hasOwn(value, "id")) { const id: unknown = Reflect.get(value, "id"); assert.ok(typeof id === "number"); Reflect.set(value, "id", ids.get(id)); }
        let held = false;
        if (!Object.hasOwn(value, "id") && holdRegistration) {
          const method: unknown = Reflect.get(value, "method");
          if (method === "Debugger.resumed" || method === "Debugger.scriptParsed") { held = true; }
          if (method === "Debugger.breakpointResolved" || method === "Debugger.paused") {
            // Deliberate inert protocol data, not an authority cast.
            retainedRegistration.push(Object.fromEntries(Object.entries(value))); held = true;
          }
        }
        if (!held) { return Buffer.from(`${JSON.stringify(value)}\0`).toString("base64"); }
      }
    },
  });
  const RequestReader = await selectedRequestReaderConstructor();
  const viaArrays = new Map<string, number>();
  const module = await mainBackendModule({
    "./current-selected-file-main-request-reader.ts": { CurrentSelectedFileMainRequestReader: RequestReader },
    "./current-main-startup-config-sql.ts": { qualifyCurrentMainStartupConfigSource: (source: unknown): void => { assert.equal(source, "synthetic-complete-app-source"); } },
    "./current-footprint-copy-main-request-source.ts": {
      qualifyCurrentFootprintCopyMainRequestSource: (source: unknown): unknown => { assert.equal(source, "synthetic-complete-app-source"); return capability; },
      requireCurrentFootprintCopyMainRequestSource: (source: unknown): void => { assert.equal(source, capability); },
    },
    "./current-selected-file-main-sql-fence-source.ts": { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE: SOURCE,
      qualifyCurrentSelectedFileMainSqlFenceSource: (source: unknown): void => { assert.equal(source, "synthetic-complete-app-source"); } },
    "./current-selected-file-main-sql-fence-bootstrap.ts": {
      requireCurrentSelectedFileMainSqlFenceBootstrap: (token: unknown, original: unknown): string => { assert.equal(token, capability); assert.equal(original, transport); return String.raw`C:\Synthetic\fixture.eprj2`; },
      sendCurrentSelectedFileMainSqlFenceCommand: (token: unknown, original: unknown, command: SqlCommand, id: number): Promise<void> => {
        assert.equal(token, capability); assert.equal(original, runner); return sqlSend(command, id);
      },
      sendOriginalCurrentPcbViaMainBegin: (token: unknown, original: unknown, command: CurrentPcbViaMainBeginCommand, id: number): Promise<void> => {
        assert.equal(token,capability);assert.equal(original,runner);assert.ok(runner!==null);phases.push(`${command.phase}-${command.role}`);
        let result:unknown={};
        if(command.phase==="via-main-begin-arm"){result={breakpointId:`begin-${command.role}`,actualLocation:command.params.location};}
        else if(command.phase==="via-main-begin-step"){const grant=runner.consumeOriginalViaMainBegin(command,id);assert.equal(grant.nativeSql,command.role==="run");if(loseDriverStep){return Promise.reject(new Error("original-driver-step-ack-lost"));}plannedResumes+=1;event("Debugger.resumed",{});}
        else if(command.phase==="via-main-begin-frame"||command.phase==="via-main-begin-join"){const counts=command.phase==="via-main-begin-frame"?{save:4,transaction:2,run:7,callback:8,returned:2}:{save:4,transaction:3,run:10,callback:4,returned:0};result={result:{type:"object",subtype:"array",className:"Array",description:`Array(${String(counts[command.role])})`,objectId:`begin-${command.phase}-${command.role}`}};
          if(command.phase==="via-main-begin-join"&&command.role==="returned"){result={result:{type:"object",value:{schema:"private.current-pcb-via-main-begin-result.v1",originalNativeCallbackSucceeded:true,originalBeginAwaitCompleted:true,transactionDepth:1,historySqlCompleted:false,furtherSelectedSqlAuthorized:false,persistenceVerified:false}}};}}
        queue.push({id,result});return Promise.resolve();
      },
      sendOriginalCurrentPcbViaMainStep: (token: unknown, original: unknown, command: CurrentPcbViaMainStepCommand, id: number): Promise<void> => {
        assert.equal(token, capability); assert.equal(original, runner); assert.ok(command.phase==="via-main-driver-step"||command.phase==="via-main-context-step"||command.phase==="via-main-controller-step"); assert.ok(runner !== null);
        let dataStr:string;if(command.phase==="via-main-driver-step"){dataStr=runner.consumeOriginalViaMainDriverStep(command,id).dataStr;}else if(command.phase==="via-main-context-step"){dataStr=runner.consumeOriginalViaMainContextStep(command,id).dataStr;}else{dataStr=runner.consumeOriginalViaMainControllerStep(command,id).dataStr;}assert.ok(typeof dataStr==="string"); phases.push(command.phase);
        if(loseDriverStep){return Promise.reject(new Error("original-driver-step-ack-lost"));}
        plannedResumes += 1;event("Debugger.resumed",{});queue.push({id,result:{}});return Promise.resolve();
      },
      sendOriginalCurrentPcbViaMainCommand: (token: unknown, original: unknown, command: CurrentPcbViaMainCommand, id: number): Promise<void> => {
        assert.equal(token, capability); assert.equal(original, runner); validateCurrentPcbViaMainCommand(command); phases.push(command.phase);
        let result: unknown = command.phase === "via-main-construction-require" ? { result: { type: "boolean", value: true } } : { result: [] };
        if (command.method === "Debugger.setBreakpoint") { const point = command.params["location"]; assert.ok(point !== null && typeof point === "object"); result = { breakpointId: `via-${String(Reflect.get(point, "columnNumber"))}`, actualLocation: point }; if(Reflect.get(point,"columnNumber")===2540){contextPointActive=true;} }
        if(command.method==="Debugger.removeBreakpoint"&&command.params["breakpointId"]==="via-2540"){contextPointActive=false;result={};}
        if(command.phase==="via-main-request-invocation-frame"||command.phase==="via-main-request-frame"||command.phase==="via-main-request-invocation"||command.phase==="via-main-request-context"||command.phase==="via-main-request-controller"||command.phase==="via-main-request-actor"||command.phase==="via-main-request-sql"){
          const frame=command.method==="Debugger.evaluateOnCallFrame";let length=6;if(frame){if(command.phase==="via-main-request-invocation-frame"){length=3;}else if(command.params["callFrameId"]==="frame-context"){length=4;}else if(command.params["expression"]==="[t]"){length=1;}else if(command.params["expression"]==="[t,e,r,i,c,Date,Date.now,yo,Z2]"){length=9;}else{length=8;}}else if(command.phase==="via-main-request-controller"){length=12;}else if(command.phase==="via-main-request-actor"){length=10;}else if(command.phase==="via-main-request-sql"){length=7;}
          viaArrays.set(`via-array-${String(id)}`,length);result={result:{type:"object",subtype:"array",className:"Array",description:`Array(${String(length)})`,objectId:`via-array-${String(id)}`}};
        }else if(command.phase==="via-main-request-properties"){
          const target=String(command.params["objectId"]);const length=viaArrays.get(target);const byLength:Readonly<Record<string,"controller"|"actor"|"sql">>={12:"controller",10:"actor",7:"sql"};const byId:Readonly<Record<string,"PB"|"queryOne"|"promise">>={"native-PB":"PB","native-queryOne":"queryOne","native-dbPromise":"promise"};const role=byLength[String(length)]??byId[target]??null;
          if(role!==null){result=viaMainActorProperties(role);}
        }else if(command.phase==="via-main-request-value"){result={result:{type:"object",value:viaMainActorValue}};
        }else if(command.phase==="via-main-request-context-join"){result={result:{type:"boolean",value:true}};}
        queue.push({ id, result }); return Promise.resolve();
      },
    },
  });
  runner = new module.Constructor(transport, undefined, capability);
  return { runner, phases, transport, injectBeginPoint:(role:"save"|"transaction"|"run"|"callback"|"returned"):void=>{
    const sites={save:[8572,19_844,19_828,"saveProjectHistory"],transaction:[1025,2529,2514,"inTransaction"],run:[1025,875,859,""],callback:[1025,895,891,""],returned:[1025,2186,2040,"begin"]} as const;const site=sites[role];
    const calls:unknown[]=[{callFrameId:`begin-frame-${role}`,functionName:site[3],location:{scriptId:"app",lineNumber:site[0],columnNumber:site[1]},functionLocation:{scriptId:"app",lineNumber:site[0],columnNumber:site[2]}}];
    if(role==="run"){for(const [name,column]of[["begin",2040],["inTransaction",2514]]as const){calls.push({callFrameId:`begin-caller-${name}`,functionName:name,location:{scriptId:"app",lineNumber:1025,columnNumber:column},functionLocation:{scriptId:"app",lineNumber:1025,columnNumber:column}});}}
    event("Debugger.paused",{reason:"other",hitBreakpoints:[role==="run"?"sql-run":`begin-${role}`],callFrames:calls});
  }, injectViaPoint:(role:"context"|"controller"|"editHead"):void=>{
    const site={context:{lineNumber:1164,columnNumber:2540},controller:{lineNumber:8573,columnNumber:1663},editHead:{lineNumber:8572,columnNumber:27_776}}[role];
    const name={context:"",controller:"createProjectHistory",editHead:"PB"}[role];const column={context:2434,controller:1648,editHead:27_772}[role];
    const caller=role==="context"?{callFrameId:"frame-parent",functionName:"interceptHttpProtocol",location:{scriptId:"app",lineNumber:1164,columnNumber:51_414},functionLocation:{scriptId:"app",lineNumber:1164,columnNumber:51_072}}:{callFrameId:"frame-actor",functionName:"L3",location:{scriptId:"app",lineNumber:8573,columnNumber:267},functionLocation:{scriptId:"app",lineNumber:8573,columnNumber:31}};
    event("Debugger.paused",{reason:"other",hitBreakpoints:[`via-${String(site.columnNumber)}`],callFrames:[{callFrameId:`frame-${role}`,functionName:name,location:{scriptId:"app",...site},functionLocation:{scriptId:"app",lineNumber:site.lineNumber,columnNumber:column}},...(role==="controller"?[]:[caller])]});
  }, loseNextDriverStep: ():void=>{loseDriverStep=true;}, injectRequest: (method: string, foreign = false, sourceDelta = 0, history=false): void => {
    const project = foreign ? "d".repeat(64) : createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex"); currentRequest = { method, url: `/api/v4/projects/${project}/branches${history?`/${"b".repeat(32)}/histories`:""}`, delta: sourceDelta, pathHeader:project };
    if (!fetchScriptSeen) { event("Debugger.scriptParsed", { scriptId: "builtin-fetch", url: "node:internal/deps/undici/undici", executionContextId: 1, startLine: 0, startColumn: 0, endLine: 17_434, endColumn: 0, length: 745_782, isLiveEdit: false, hasSourceURL: false, isModule: false, scriptLanguage: "JavaScript" }); fetchScriptSeen = true; }
    pause("driver"); }, injectMutation: (): void => { pause("run"); }, injectDriver: (): void => { pause("driver"); }, resumes: (): number => normalResumes + sqlResumes + plannedResumes,
    deferPoll: () => { assert.equal(heldPoll, null); const original = { started: Promise.withResolvers<null>(), settle: Promise.withResolvers<null>() }; heldPoll = original;
      return { started: original.started.promise, release: (): void => { original.settle.resolve(null); } }; } };
}
void test("actual runner arms every selected-file site before SQLite import and retains its original fence after construction", async () => {
  const f = await fixture(); await f.runner.observe();
  assert.deepEqual(f.phases.slice(0, 6), ["runtime-enable", "debugger-enable", "sql-fence-early-arm", "registration-arm", "run-waiting", "resume"]);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-arm").length, 23); assert.equal(f.resumes(), 55);
  assert.equal(f.runner.selectedSqlFenceState()["ready"], true); assert.equal(f.runner.selectedSqlFenceState()["conditionalBreakpoints"], 23);
  f.injectMutation(); await f.runner.pumpSelectedSqlFence(); const before = f.phases.length;
  assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "run"); assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  await f.runner.pumpSelectedSqlFence(); assert.equal(f.resumes(), 55); assert.equal(f.phases.length, before);
  await assert.rejects(f.runner.prepareNormalClose(), /RETAIN_THROUGH_EXIT/u); await assert.rejects(f.runner.release(), /RETAIN_THROUGH_EXIT/u);
});
void test("an import pause at another actual column refuses before SQLite import continuation or conditional arming", async () => {
  const f = await fixture(1); await assert.rejects(f.runner.observe(), /SELECTED_SQL_LOCATION/u);
  assert.equal(f.phases.includes("sql-fence-arm"), false); assert.equal(f.resumes(), 1);
});
void test("the production original bootstrap issuer rejects a matching token and bare fake transport before sending", () => {
  let sent = 0; const transport: CurrentFootprintCopyMainBackendTransport = { assertCurrent: (): Promise<void> => Promise.resolve(),
    send: (): Promise<void> => { sent += 1; return Promise.resolve(); }, poll: (): Promise<string> => Promise.resolve("") };
  assert.throws(() => new OriginalRunner(transport, undefined, structuredClone(capability)), /SELECTED_SQL_BOOTSTRAP/u); assert.equal(sent, 0);
});
void test("the actual Via cursor shares a retained late poll, arms exact source points and keeps the persistent driver held", async () => {
  const f = await fixture(); await f.runner.observe(); const original = await f.runner.beginViaMainObservation();
  const sites = [[1164, 2540], [8573, 1663], [8572, 27_776]];
  for (const [lineNumber, columnNumber] of sites) { await original.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-site-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "app", lineNumber, columnNumber } } }), false); }
  f.runner.requireViaMainObservationArmed(original.origin); assert.equal(original.bindings.persistentDriverBreakpointId, "sql-driver");
  const body = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), projectKey: "a".repeat(64), path: String.raw`C:\Synthetic\fixture.eprj2`, dataStr: "original-producer-body" };
  f.runner.bindViaExpectedHistoryBody(original.origin, body); assert.deepEqual(f.runner.requireViaExpectedHistoryBody(original.origin), body);
  assert.throws(() => { f.runner.bindViaExpectedHistoryBody(original.origin, body); }, /BIND_CONSUMED/u);
  assert.throws(() => f.runner.requireViaExpectedHistoryBody({ ...original.origin }), /ORIGINAL_BODY/u);
  const delayed = f.deferPoll(); const first = f.runner.pumpSelectedSqlFence(); await delayed.started; const second = f.runner.pumpSelectedSqlFence();
  const before = f.phases.length;
  const command = original.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-properties", method: "Runtime.getProperties", params: { objectId: "retained", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), false);
  assert.equal(f.phases.length, before); delayed.release(); await Promise.all([first, second, command]); assert.equal(f.phases.length, before + 1);
  f.injectDriver(); const driver = await original.bindings.nextEvent(); assert.equal(driver.method, "Debugger.paused"); assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "driver");
  assert.throws(() => validateCurrentPcbViaMainCommand({ phase: "via-main-request-resume", method: "Debugger.resume", params: {} }), /NO_RESUME/u);
  await assert.rejects(original.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: "sql-driver" } }), true));
  await assert.rejects(f.runner.beginViaMainObservation(), /ORIGINAL_CURSOR/u); assert.equal(f.resumes(), 55); assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
});

void test("the original main cursor qualifies modern Fetch GET, resumes it once, and keeps the next POST held", async () => {
  const f = await fixture(); await f.runner.observe(); const initial = f.resumes(); f.injectRequest("GET"); await f.runner.pumpSelectedSqlFence(); await f.runner.pumpSelectedSqlFence();
  assert.equal(f.resumes(), initial + 1); assert.equal(f.runner.selectedSqlFenceState()["readonlyRequestContinuations"], 1); assert.equal(f.runner.selectedSqlFenceState()["heldSite"], null);
  f.injectRequest("POST"); await f.runner.pumpSelectedSqlFence(); assert.equal(f.resumes(), initial + 1); assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "driver");
  const packet = await f.runner.observeSelectedMainRequest(); assert.equal(packet.method, "POST"); assert.equal(packet.executionAuthorized, false);
  // This runner came from the production module with an explicit source seam;
  // Its own method checks the actual private registry, while the normal module
  // Correctly rejects the packet as belonging to a different module instance.
  f.runner.requireOriginalSelectedMainRequest(packet); assert.throws(() => { requireOriginalCurrentSelectedFileMainRequest(packet, f.runner); });
  assert.throws(() => { f.runner.requireOriginalSelectedMainRequest(structuredClone(packet)); });
  await assert.rejects(f.runner.continueSelectedReadonlyRequest(packet), /NO_WRITE_GRANT/u); assert.equal(f.resumes(), initial + 1);
});
void test("foreign-project GET and wrong original getter source location never acquire a driver resume", async () => {
  for (const wrongSource of [false, true]) {
    const f = await fixture(); await f.runner.observe(); const initial = f.resumes(); f.injectRequest("GET", !wrongSource, Number(wrongSource));
    await f.runner.pumpSelectedSqlFence();
    if (wrongSource) { await assert.rejects(f.runner.pumpSelectedSqlFence()); } else { await f.runner.pumpSelectedSqlFence(); assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "driver"); }
    assert.equal(f.resumes(), initial);
  }
});

void test("after genuine Via cursor handoff the original Fetch GET is serviced and only its own resumed event is consumed", async () => {
  const f = await fixture(); await f.runner.observe(); const original = await f.runner.beginViaMainObservation();
  for (const [lineNumber, columnNumber] of [[8573, 1663], [8572, 27_776]]) {
    await original.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-site-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "app", lineNumber, columnNumber } } }), false);
  }
  f.injectRequest("GET"); const event = await original.bindings.nextEvent(); assert.equal(event.method, "Debugger.paused");
  const packet = await original.bindings.observeRequest(); original.bindings.requireOriginalRequest(packet);
  assert.throws(() => { original.bindings.requireOriginalRequest(structuredClone(packet)); });
  const before = f.resumes(); await original.bindings.continueReadonlyRequest(packet); assert.equal(f.resumes(), before + 1);
  assert.throws(() => { original.bindings.requireOriginalRequest(packet); });
  f.injectRequest("POST"); const next = await original.bindings.nextEvent(); assert.equal(next.method, "Debugger.paused");
  const held = await original.bindings.observeRequest(); assert.equal(held.method, "POST"); original.bindings.requireOriginalRequest(held);
  assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "driver"); assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  await assert.rejects(original.bindings.continueReadonlyRequest(held), /NO_WRITE_GRANT/u); assert.equal(f.resumes(), before + 1);
});

void test("the actual startup cursor consumes all original profile SQL before registration and never resumes reordered or foreign calls", async () => {
  const complete = await fixture(); await complete.runner.observe();
  assert.equal(complete.phases.filter(phase => phase === "sql-fence-startup-select").length, 48);
  assert.equal(complete.runner.selectedSqlFenceState()["profileSqlContinuationsAcknowledged"], 48);
  assert.equal(complete.runner.selectedSqlFenceState()["profileMetadataContinuationsAcknowledged"], 3);
  assert.deepEqual(complete.runner.selectedSqlFenceState()["startupProfileBookkeeping"], { currentVersionObserved: true, jbCallsConsumed: 44, dcCallsConsumed: 4,
    profileSqlOnly: true, cookieUpdatesAdmitted: false, selectedProjectWriteGrant: false, nativeCompletionProven: false });
  for (const fault of ["order", "foreign"] as const) {
    const refused = await fixture(0, fault); await assert.rejects(refused.runner.observe(), /STARTUP_CONFIG_SEQUENCE|UNQUALIFIED_STARTUP_MUTATION/u);
    assert.equal(refused.phases.filter(phase => phase === "sql-fence-startup-select").length, 1); assert.equal(refused.resumes(), 5);
    assert.equal(refused.phases.includes("capture"), false);
  }
});

void test("the original Via history driver grant is consumed only by its pending native call and lost acknowledgment cannot repeat",async()=>{
  for(const lose of [false,true]){
    const f=await fixture();await f.runner.observe();const original=await f.runner.beginViaMainObservation();
    for(const [lineNumber,columnNumber]of [[1164,2540],[8573,1663],[8572,27_776]]){await original.bindings.request(validateCurrentPcbViaMainCommand({phase:"via-main-request-site-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:"app",lineNumber,columnNumber}}}),false);}
    const command={phase:"via-main-driver-step",method:"Debugger.resume",params:{}} as const;
    assert.throws(()=>f.runner.consumeOriginalViaMainDriverStep(command,1));
    const projectUuid=createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex");
    f.runner.bindViaExpectedHistoryBody(original.origin,{projectUuid,branchUuid:"b".repeat(32),projectKey:projectUuid,path:String.raw`C:\Synthetic\fixture.eprj2`,dataStr:"original-held-body"});
    f.injectRequest("POST",false,0,true);await original.bindings.nextEvent();const packet=await original.bindings.observeRequest();const before=f.resumes();
    if(lose){f.loseNextDriverStep();await assert.rejects(original.bindings.continuePlannedDriver(packet),/original-driver-step-ack-lost/u);assert.equal(f.resumes(),before);}
    else{await original.bindings.continuePlannedDriver(packet);assert.equal(f.resumes(),before+1);}
    await assert.rejects(original.bindings.continuePlannedDriver(packet));assert.equal(f.phases.filter(phase=>phase==="via-main-driver-step").length,1);
    assert.throws(()=>f.runner.consumeOriginalViaMainDriverStep(command,1));assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"],0);
  }
});

for(const loseBegin of [false,true]){void test(`the original Via controller, actor and BEGIN callback retain exact native slots (lost=${String(loseBegin)})`,async()=>{
  const f=await fixture();await f.runner.observe();const original=await f.runner.beginViaMainObservation();
  const cases=currentPcbViaMainNativeCases();
  for(const role of [[8573,1663],[8572,27_776]]){await original.bindings.request(validateCurrentPcbViaMainCommand({phase:"via-main-request-site-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:"app",lineNumber:role[0],columnNumber:role[1]}}}),false);}
  const expected={projectUuid:createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex"),branchUuid:"b".repeat(32),projectKey:createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex"),path:String.raw`C:\Synthetic\fixture.eprj2`,dataStr:"original-held-body"};
  const beginCases=currentPcbViaMainBeginNativeCases();
  for(const command of beginCases.filter(item=>item.phase==="via-main-begin-arm")){await original.bindings.beginRequest({...command,params:{...command.params,location:{...command.params.location,scriptId:"app"}}},false);}original.bindings.requireBeginArmed();
  const beforeReads=f.resumes();f.injectRequest("GET");await f.runner.pumpSelectedSqlFence();await f.runner.pumpSelectedSqlFence();assert.equal(f.resumes(),beforeReads+1);
  f.runner.bindViaExpectedHistoryBody(original.origin,expected);
  const send=(phase:string,params:Record<string,unknown>,expression?:string):Promise<unknown>=>{const sample=cases.find(item=>item.phase===phase&&(expression===undefined||item.params["expression"]===expression));assert.ok(sample!==undefined);return original.bindings.request(validateCurrentPcbViaMainCommand({...sample,params:{...sample.params,...params}}),false);};

  f.injectRequest("POST",false,0,true);await original.bindings.nextEvent();const request=await original.bindings.observeRequest();
  const driver=captureArrayId(await send("via-main-request-invocation-frame",{callFrameId:"frame-driver"},"[this,r,i]"));
  const caller=captureArrayId(await send("via-main-request-invocation-frame",{callFrameId:"frame-caller"},"[this,s,a]"));
  const invocation=captureArrayId(await send("via-main-request-invocation",{objectId:driver,arguments:[{objectId:original.bindings.constructionObjectId},{objectId:caller}]}));
  await original.bindings.request(validateCurrentPcbViaMainCommand({phase:"via-main-request-site-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:"app",lineNumber:1164,columnNumber:2540}}}),false);
  await original.bindings.continuePlannedDriver(request);f.injectViaPoint("context");await original.bindings.nextEvent();
  await assert.rejects(original.bindings.continuePlannedContext(),/ORIGINAL_JOINED_CONTEXT/u);
  const frame=captureArrayId(await send("via-main-request-frame",{callFrameId:"frame-context"},"[this,r,i,s]"));
  const context=captureArrayId(await send("via-main-request-context",{objectId:frame,arguments:[{objectId:original.bindings.constructionObjectId}]}));
  await send("via-main-request-context-join",{objectId:invocation,arguments:[{objectId:context}]});
  await original.bindings.request(validateCurrentPcbViaMainCommand({phase:"via-main-request-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:"via-2540"}}),true);
  await original.bindings.continuePlannedContext();f.injectRequest("GET");await original.bindings.nextEvent();const read=await original.bindings.observeRequest();const beforeLaterRead=f.resumes();await original.bindings.continueReadonlyRequest(read);assert.equal(f.resumes(),beforeLaterRead+1);
  f.injectViaPoint("controller");await original.bindings.nextEvent();
  const controllerFrame=captureArrayId(await send("via-main-request-frame",{callFrameId:"frame-controller"},"[this,this.ctx,this.service,this.path,L3,PB,Date,Date.now]"));
  const controller=captureArrayId(await send("via-main-request-controller",{objectId:controllerFrame,arguments:[{objectId:context},{value:expected}]}));
  original.bindings.requireOriginalControllerBody();assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"],0);
  await assert.rejects(original.bindings.continuePlannedContext());
  await assert.rejects(original.bindings.continuePlannedController(),/ORIGINAL_JOINED_CONTROLLER/u);
  await send("via-main-request-properties",{objectId:controller});await send("via-main-request-properties",{objectId:"native-PB"});
  await original.bindings.continuePlannedController();f.injectViaPoint("editHead");await original.bindings.nextEvent();
  const editFrame=captureArrayId(await send("via-main-request-frame",{callFrameId:"frame-editHead"},"[t]"));const actorFrame=captureArrayId(await send("via-main-request-frame",{callFrameId:"frame-actor"},"[t,e,r,i,c,Date,Date.now,yo,Z2]"));
  const actor=captureArrayId(await send("via-main-request-actor",{objectId:editFrame,arguments:[{objectId:actorFrame},{objectId:controller}]}));
  await send("via-main-request-properties",{objectId:actor});await send("via-main-request-properties",{objectId:"native-dbPromise"});
  const sql=captureArrayId(await send("via-main-request-sql",{objectId:actor,arguments:[{objectId:"native-yo"}]}));
  await send("via-main-request-properties",{objectId:sql});await send("via-main-request-properties",{objectId:"native-queryOne"});await send("via-main-request-value",{objectId:actor,arguments:[]});
  original.bindings.requireOriginalActorSql();assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"],0);await assert.rejects(original.bindings.continuePlannedController());
  const beginSend=(phase:string,role:string,params:Record<string,unknown>={}):Promise<unknown>=>{const sample=beginCases.find(item=>item.phase===phase&&item.role===role);assert.ok(sample!==undefined);return original.bindings.beginRequest(validateCurrentPcbViaMainBeginCommand({...sample,params:{...sample.params,...params}}),false);};
  await beginSend("via-main-begin-step","actor");f.injectBeginPoint("save");await original.bindings.nextEvent();
  const saveFrame=captureArrayId(await beginSend("via-main-begin-frame","save",{callFrameId:"begin-frame-save"}));
  const save=captureArrayId(await beginSend("via-main-begin-join","save",{objectId:saveFrame,arguments:[{objectId:actor},{objectId:sql}]}));
  await beginSend("via-main-begin-step","save");f.injectBeginPoint("transaction");await original.bindings.nextEvent();
  const transactionFrame=captureArrayId(await beginSend("via-main-begin-frame","transaction",{callFrameId:"begin-frame-transaction"}));
  const transaction=captureArrayId(await beginSend("via-main-begin-join","transaction",{objectId:transactionFrame,arguments:[{objectId:save}]}));
  await beginSend("via-main-begin-step","transaction");f.injectBeginPoint("run");await original.bindings.nextEvent();
  const runFrame=captureArrayId(await beginSend("via-main-begin-frame","run",{callFrameId:"begin-frame-run"}));
  const run=captureArrayId(await beginSend("via-main-begin-join","run",{objectId:runFrame,arguments:[{objectId:original.bindings.sqlCaptureObjectId},{objectId:transaction}]}));
  if(loseBegin){f.loseNextDriverStep();await assert.rejects(beginSend("via-main-begin-step","run"),/ack-lost/u);await assert.rejects(beginSend("via-main-begin-step","run"));assert.equal(f.phases.filter(item=>item==="via-main-begin-step-run").length,1);return;}
  await beginSend("via-main-begin-step","run");f.injectBeginPoint("callback");await original.bindings.nextEvent();
  const callbackFrame=captureArrayId(await beginSend("via-main-begin-frame","callback",{callFrameId:"begin-frame-callback"}));
  const callback=captureArrayId(await beginSend("via-main-begin-join","callback",{objectId:callbackFrame,arguments:[{objectId:run}]}));
  await beginSend("via-main-begin-step","callback");f.injectBeginPoint("returned");await original.bindings.nextEvent();
  const returnedFrame=captureArrayId(await beginSend("via-main-begin-frame","returned",{callFrameId:"begin-frame-returned"}));
  await beginSend("via-main-begin-join","returned",{objectId:returnedFrame,arguments:[{objectId:callback}]});const result=original.bindings.originalBeginResult();assert.equal(result.originalBeginAwaitCompleted,true);assert.equal(result.historySqlCompleted,false);
  await assert.rejects(beginSend("via-main-begin-step","run"));
});}

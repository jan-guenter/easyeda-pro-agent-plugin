/* oxlint-disable eslint/max-classes-per-file -- Two explicit inert sequence peers preserve original production scheduling while substituting independent catalogue replies. */
/** Production runner scheduling against a deliberately synthetic CDP peer.
 * Only source/transport issuance are substituted; actual cursor, decoders,
 * ordering, predicates, counters and mutation-hold logic run unchanged. */
/* oxlint-disable import/max-dependencies -- Exercise the real source cursor with explicit synthetic transport/source peers and the actual actor decoders. */
import { currentPcbViaMainStructureFrame, currentPcbViaMainStructureNativeCases, validateCurrentPcbViaMainStructureCommand } from "../src/current-pcb-via-main-structure-protocol.ts";
import type { CurrentPcbViaMainStructureCommand, CurrentPcbViaMainStructureFrameRole, CurrentPcbViaMainStructureProgramRole } from "../src/current-pcb-via-main-structure-protocol.ts";
import { viaMainStructureReply, viaMainStructureWindow } from "./helpers/via-main-structure-replies.ts";
import { currentPcbViaMainHistoryFrame, currentPcbViaMainHistoryNativeCases, validateCurrentPcbViaMainHistoryCommand } from "../src/current-pcb-via-main-history-protocol.ts";
import type { CurrentPcbViaMainHistoryCommand, CurrentPcbViaMainHistoryFrameRole } from "../src/current-pcb-via-main-history-protocol.ts";
import { historyBaseline, viaMainHistoryReply, viaMainHistoryWindow } from "./helpers/via-main-history-replies.ts";
import { currentPcbViaMainBeginNativeCases, validateCurrentPcbViaMainBeginCommand } from "../src/current-pcb-via-main-begin-protocol.ts";
import type { CurrentPcbViaMainBeginCommand } from "../src/current-pcb-via-main-begin-protocol.ts";
import { viaMainActorProperties, viaMainActorValue } from "./helpers/via-main-actor-replies.ts";
import { CurrentMainStartupLibraryV2Schedule, CURRENT_MAIN_STARTUP_LIBRARY_V2 as STOCK } from "../src/current-main-startup-library-v2-profile.ts";
import { CurrentMainStartupLibraryProgress, captureCurrentMainStartupLibrarySelection, currentMainStartupLibrarySelectionSchema } from "../src/current-main-startup-library-progress.ts";
import type { CurrentMainStartupLibraryV2Command } from "../src/current-main-startup-library-v2-protocol.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "../src/current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendRunner, CurrentFootprintCopyMainBackendTransport } from "../src/current-footprint-copy-main-backend-runner.ts";
import type { CurrentSelectedFileMainSqlFenceCommand as SqlCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as EARLY_ID } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "../src/current-selected-file-main-sql-fence-source.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as CAPTURED_EXPRESSIONS, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as CAPTURED_FRAME } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { currentSelectedFileMainSqlStartupDiagnosticV2Schema } from "../src/current-selected-file-main-sql-startup-diagnostic-v2.ts";
import { CurrentMainStartupConfigProgress, currentMainStartupConfigSelectionSchema } from "../src/current-main-startup-config-progress.ts";
import { captureCurrentSelectedFileMainSqlStartupPauseLocations, createCurrentSelectedFileMainSqlStartupRefusalContext } from "../src/current-selected-file-main-sql-startup-refusal-context.ts";
import { CurrentFootprintCopyMainBackendRunner as OriginalRunner, requireOriginalCurrentSelectedFileMainRequest } from "../src/current-footprint-copy-main-backend-runner.ts";
import { selectedRequestPeer, selectedRequestReaderConstructor } from "./helpers/selected-main-request-reader-fixture.ts";
import { CONFIG_SQL, mainBackendModule, mainBackendTransportFixture } from "./helpers/footprint-main-backend-runner-fixture.ts";
import type { CurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";
import { currentPcbViaMainNativeCases, validateCurrentPcbViaMainCommand } from "../src/current-pcb-via-main-protocol.ts";

type Data = Record<string, unknown>;
type CapturedSite = keyof typeof CAPTURED_EXPRESSIONS;
type Classification = "held" | "guard-passed" | "guard-refused" | "malformed" | "legacy-count" | "lost-ack";
type SqlPauseFixture = Readonly<{ site: CapturedSite; classification?: Classification;
  fault?: "frame" | "properties" | "probe" | "raw-count" | "raw-exception" | "raw-reference" | "raw-side-effect" | "original-pause" | "resume-ack";
  hitBreakpoints?: readonly string[]; following?: "driver"; batchResume?: boolean }>;
type CurrentPcbViaMainStepCommand = Parameters<CurrentFootprintCopyMainBackendRunner["consumeOriginalViaMainDriverStep"]>[0];
function structurePeerFrame(kind: CurrentPcbViaMainStructureFrameRole): Data { const fixed = currentPcbViaMainStructureFrame(kind); const column: unknown = Object.getOwnPropertyDescriptor(fixed,"columnNumber")?.value; let columnNumber = typeof column === "number" ? column : fixed.functionColumn; if(kind === "run") { columnNumber = 875; } return { callFrameId: `structure-frame-${kind}`, functionName: fixed.name, location:{scriptId:"app",lineNumber:fixed.lineNumber,columnNumber},functionLocation:{scriptId:"app",lineNumber:fixed.lineNumber,columnNumber:fixed.functionColumn} }; }
const captureArrayId=(raw:unknown):string=>{assert.ok(raw!==null&&typeof raw==="object");const result:unknown=Reflect.get(raw,"result");assert.ok(result!==null&&typeof result==="object");const value:unknown=Reflect.get(result,"objectId");assert.ok(typeof value==="string");return value;};
const capability = Object.freeze({ profile: "private.selected-file-main-sql-fence-bootstrap.v1" as const, executionAuthorized: false as const });
function historyPeerFrame(kind: CurrentPcbViaMainHistoryFrameRole): Data {
  const site = currentPcbViaMainHistoryFrame(kind); let columnNumber = site.functionColumn;
  if (kind === "sqlRun") { columnNumber = 875; } else if ("columnNumber" in site && typeof site.columnNumber === "number") { columnNumber = site.columnNumber; }
  return { callFrameId: `history-frame-${kind}`, functionName: site.name, location: { scriptId: "app", lineNumber: site.lineNumber, columnNumber }, functionLocation: { scriptId: "app", lineNumber: site.lineNumber, columnNumber: site.functionColumn } };
}
function property(name: string, value: Data, writable = false, enumerable = false, configurable = true): Data { return { name, value, writable, enumerable, configurable, isOwn: true }; }
/** Synthetic response for the additional passive import-array check. The
 * runner still executes its real decoder and fixed capture schedule. */
function importsArray(): Data {
  return { result: [...["keeper", "context", "sqlite", "util"].map((name, index) => property(String(index), { type: index < 2 ? "function" : "object", className: index < 2 ? "Function" : "Object", objectId: `import-${name}` }, true, true)),
    property("length", { type: "number", value: 4 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array" } }] };
}
function nativeArray(): Data {
  return { result: [...["Database", "Statement", "", "Date", "now"].map((name, index) => property(String(index), { type: "function", className: "Function", description: `function ${name}() { [native code] }`, objectId: `native${String(index)}` }, true, true)),
    property("length", { type: "number", value: 5 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array" } }] };
}
function nativeMetadata(id: string, unsupported = false): Data {
  let name = ""; if (id === "native0") { name = "Database"; } else if (id === "native1") { name = "Statement"; } else if (id === "native3") { name = "Date"; } else if (id === "native4") { name = "now"; }
  const result = [property("name", { type: "string", value: name }), property("length", { type: "number", value: name === "Date" ? 7 : 0 })];
  if (name !== "" && name !== "now") { result.push(property("prototype", { type: "object", className: "Object", objectId: "prototype" }, false, false, false)); }
  if (name === "Date") { for (const key of ["now", "parse", "UTC"]) { result.push(property(key, { type: "function", className: "Function", description: `function ${key}() { [native code] }`, objectId: `date-${key}` }, true, false)); } }
  if (unsupported) { result.push(property("unexpected", { type: "string", value: "synthetic-private-metadata" })); }
  return { result, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "scopes" } }] };
}
const configPacket = (role: "jb" | "dc", site: "run" | "prepare" | "prepared", sql: string, transactionDepth: 0 | 1): Data => ({ recognized: true, role, site, sql, transactionDepth, parametersEmpty: true, designWriteGrant: false, nativeCompletionProven: false });
/** Run the production scheduler against a source-labelled synthetic peer.
 * Classifier replies describe only that peer's original held pause; they do
 * not replace the real command validators, counters or continuation gates. */
async function fixture(delta = 0, wrongStartup: "order" | "foreign" | "malformed" | null = null, unsupportedNative = false,
  firstStartup: SqlPauseFixture | null = null, startupCallerFrames: readonly Data[] = [],
  failureProbe?: Readonly<{ consumeError?: Error; projectionError?: Error; locationProjectionCount?: { count: number } }>, stockMode: "complete" | "lineage" | "early-registration" | "interleave" | "interleave-refused" | null = null): Promise<Readonly<{ runner: CurrentFootprintCopyMainBackendRunner; phases: string[]; transport: CurrentFootprintCopyMainBackendTransport;
  injectStructurePoint: (role: CurrentPcbViaMainStructureFrameRole, caller?: CurrentPcbViaMainStructureFrameRole) => void; injectHistoryPoint: (role: CurrentPcbViaMainHistoryFrameRole, caller?: CurrentPcbViaMainHistoryFrameRole) => void; injectBeginPoint: (role: "save" | "transaction" | "run" | "callback" | "returned") => void; injectViaPoint: (role: "context" | "controller" | "editHead") => void; loseNextDriverStep: () => void; injectRequest: (method: string, foreign?: boolean, sourceDelta?: number, history?: boolean | "structure") => void; injectMutation: () => void; injectSql: (pause: SqlPauseFixture) => void; injectDriver: () => void; resumes: () => number; resumeBatches: () => number; deferPoll: () => Readonly<{ started: Promise<unknown>; release: () => void }> }>> {
  const base = mainBackendTransportFixture();
  const ids = new Map<number, number>(), phases: string[] = [], queue: Data[] = [], retainedRegistration: Data[] = [];
  let currentRequest = { method: "GET", url: "", delta: 0, pathHeader:"f".repeat(64) }, fetchScriptSeen = false;
  const startup: { site: keyof typeof SOURCE.sites; value?: Data; stock?: number }[] = [{ site: "startupVersion" }, { site: "startupJB" },
    { site: "run", value: configPacket("jb", "run", CONFIG_SQL.transaction.begin, 1) },
    ...CONFIG_SQL.scripts.jb.map(row => ({ site: "run" as const, value: configPacket("jb", "run", row.sql, 1) })),
    { site: "run", value: configPacket("jb", "run", `${CONFIG_SQL.broadcastDeletePrefix}1793920000000`, 1) },
    { site: "run", value: configPacket("jb", "run", CONFIG_SQL.transaction.commit, 0) }, { site: "startupDC" },
    ...CONFIG_SQL.scripts.dc.map(row => ({ site: "run" as const, value: configPacket("dc", "run", row.sql, 0) })),
    { site: "run", value: configPacket("dc", "run", `${CONFIG_SQL.cookieDeletePrefix}1793920000`, 0) },
    { site: "prepare", value: configPacket("dc", "prepare", CONFIG_SQL.cookieUpsert, 0) }, { site: "prepared", value: configPacket("dc", "prepared", CONFIG_SQL.cookieUpsert, 0) }];
  const interleaved = stockMode === "interleave" || stockMode === "interleave-refused";
  const configTail = interleaved ? startup.splice(-3) : [];
  if (interleaved) { configTail.splice(1,0,{site:"queryAll"}); }
  if (stockMode !== null) { startup.push({ site: "run", stock: 0 }); }
  let interleaveIndex = -1;
  if (wrongStartup === "order") { startup[2] = { site: "run", value: configPacket("jb", "run", CONFIG_SQL.scripts.jb[0]?.sql ?? "", 1) }; }
  if (wrongStartup === "foreign") { startup[2] = { site: "run", value: { recognized: false } }; }
  if (wrongStartup === "malformed") { startup[2] = { site: "run", value: { recognized: false, sql: "private malformed SQL" } }; }
  if (firstStartup !== null) { startup.unshift({ site: firstStartup.site }); }
  let stockIndex = 0; const stockSchedule = new CurrentMainStartupLibraryV2Schedule();
  const stockOrigin = Object.freeze({ profile: "private.current-main-startup-library-origin.v2" as const, executionAuthorized: false as const });
  let startupIndex = -1; let historySlot = "data";
  let queuedBytes = Buffer.alloc(0); let contextPointActive = false, loseDriverStep = false, plannedResumes = 0, resumeBatches = 0;
  let holdRegistration = false, normalResumes = 0, runner: CurrentFootprintCopyMainBackendRunner | null = null, sqlResumes = 0;
  let currentSqlFrame: string | null = null, currentSqlPause: SqlPauseFixture | null = null;
  const diagnosticSite = firstStartup?.site ?? (wrongStartup === "foreign" ? "run" : null);
  const diagnosticObjectId = diagnosticSite === null ? null : `legacy-${diagnosticSite}`;
  let heldPoll: Readonly<{ started: PromiseWithResolvers<null>; settle: PromiseWithResolvers<null> }> | null = null;
  const event = (method: string, params: Data): void => {
    if (method === "Debugger.paused") { const frames = params["callFrames"]; assert.ok(Array.isArray(frames)); const frame: unknown = frames[0]; assert.ok(frame !== null && typeof frame === "object"); const id: unknown = Reflect.get(frame, "callFrameId"); assert.ok(typeof id === "string"); currentSqlFrame = id; }
    queue.push({ method, params });
  };
  const location = (site: keyof typeof SOURCE.sites): Data => ({ scriptId: "app", lineNumber: SOURCE.sites[site].lineNumber, columnNumber: SOURCE.sites[site].breakpointColumnNumber + (site === "import" ? delta : 0) });
  /** Deliver the exact armed SQL point, with optional negative event data. */
  const pause = (site: keyof typeof SOURCE.sites, options: SqlPauseFixture | null = null): void => { currentSqlPause = options; const frames:Data[]=[{callFrameId:`frame-${site}`,location:location(site),...(site==="driver"?{functionName:"",functionLocation:{scriptId:"app",lineNumber:1164,columnNumber:2434}}:{})},...startupCallerFrames];
    if (stockMode !== null && interleaveIndex < 0 && startup[startupIndex]?.stock === 0) {
      frames.splice(0, frames.length, ...STOCK.initialLineage.map((point, index) => ({ callFrameId: `stock-${String(stockIndex)}-${String(index)}`, location: { scriptId: "app", ...point } })));
      if (stockIndex > 0 && stockMode !== "lineage") { frames.pop(); }
    }
    if (interleaveIndex >= 0) { frames.splice(0, frames.length, { callFrameId: `config-${site}`, location: location(site) }, ...[{lineNumber:1025,columnNumber:847},{lineNumber:1025,columnNumber:3173},{lineNumber:8583,columnNumber:256}].map(point => ({callFrameId:`config-caller-${String(point.columnNumber)}`,location:{scriptId:"app",...point}}))); }
    if(site==="driver"){frames.push({callFrameId:"frame-caller",functionName:"interceptHttpProtocol",functionLocation:{scriptId:"app",lineNumber:1164,columnNumber:51_072},location:{scriptId:"app",lineNumber:1164,columnNumber:51_414}});}
    event("Debugger.paused",{reason:"other",hitBreakpoints:options?.hitBreakpoints??[site==="import"?EARLY_ID:`sql-${site}`],callFrames:frames});
  };
  /** Preserve the original raw-frame/classifier/ACK order and independently
   * check its fixed arguments before issuing each synthetic CDP response. */
  const sqlSend = (command: SqlCommand, id: number): Promise<void> => {
    phases.push(command.phase); let result: unknown = {};
    const batchResume = command.phase === "sql-fence-resume" && currentSqlPause?.batchResume === true;
    if (command.phase === "sql-fence-early-arm") { result = { breakpointId: EARLY_ID, locations: [] }; }
    else if (command.phase === "sql-fence-after-imports-arm" || command.phase === "sql-fence-held-arm") {
      if (command.phase === "sql-fence-held-arm") { assert.equal(command.params.condition, "true"); }
      const site = command.phase === "sql-fence-after-imports-arm" ? "afterImports" : command.site; result = { breakpointId: `sql-${site}`, actualLocation: location(site) };
    } else if (command.phase === "sql-fence-resume" || command.phase === "sql-fence-startup-config-resume") {
      if (command.phase === "sql-fence-startup-config-resume") { assert.ok(runner !== null); runner.requireOriginalStartupInterleaveCommand(capability, command); assert.equal(stockSchedule.requests, 10); assert.equal(runner.startupLibraryState()["requests"], 10); }
      if (currentSqlPause?.fault === "resume-ack") { return Promise.reject(new Error("original-sql-resume-ack-lost")); }
      const following = currentSqlPause?.following;
      sqlResumes += 1; event("Debugger.resumed", {});
      if(contextPointActive&&currentRequest.method==="GET"){event("Debugger.paused",{reason:"other",hitBreakpoints:["via-2540"],callFrames:[{callFrameId:"wrong-get-context",location:{scriptId:"app",lineNumber:1164,columnNumber:2540}}]});}
      if (interleaveIndex >= 0) { interleaveIndex += 1; const next = configTail[interleaveIndex]; if (next === undefined) { interleaveIndex = -1; stockIndex += 1; pause("run"); } else { pause(next.site, next.site === "queryAll" ? {site:"queryAll",classification:"guard-passed"} : null); } }
      else if (sqlResumes === 1) { pause("afterImports"); }
      else { startupIndex += 1; const next = startup[startupIndex]; if (next === undefined) { holdRegistration = false; queue.push(...retainedRegistration.splice(0)); }
        else { pause(next.site, startupIndex === 0 ? firstStartup : null); } }
      if (following === "driver") { pause("driver"); }
    } else if (command.phase === "sql-fence-raw-frame") {
      assert.equal(command.params.callFrameId, currentSqlFrame); assert.equal(command.params.expression, CAPTURED_EXPRESSIONS[command.site]);
      assert.equal(command.params.throwOnSideEffect, true); assert.equal(command.params.expression.includes("F5"), false);
      let count = CAPTURED_EXPRESSIONS[command.site].slice(1, -1).split(",").length;
      if (currentSqlPause?.fault === "raw-count") { count += 1; }
      result = currentSqlPause?.fault === "raw-exception" ? { result: { type: "undefined" }, exceptionDetails: { text: "private-frame-error" } } :
        { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId: `raw-${command.site}` } };
      if (currentSqlPause?.fault === "raw-reference" || currentSqlPause?.fault === "raw-side-effect") {
        const reference = currentSqlPause.fault === "raw-reference";
        result = { result: { type: "object", subtype: "error", className: reference ? "ReferenceError" : "EvalError",
          description: reference ? "ReferenceError: t is not defined" : "EvalError: Possible side-effect in debug-evaluate" }, exceptionDetails: { text: "private-frame-error" } };
      }
    } else if (command.phase === "sql-fence-captured-frame") {
      assert.equal(command.params.objectId, `raw-${command.site}`); assert.equal(command.params.functionDeclaration, CAPTURED_FRAME);
      assert.deepEqual(command.params.arguments, [{ objectId: "sql-fence-capture" }, { value: command.site }]);
      assert.equal(command.params.throwOnSideEffect, false); assert.equal(command.params.awaitPromise, false); assert.equal(command.params.returnByValue, false);
      if (currentSqlPause?.classification === "lost-ack") { return Promise.reject(new Error("original-classifier-ack-lost")); }
      if (currentSqlPause?.fault === "original-pause") { event("Debugger.resumed", {}); }
      const classification = currentSqlPause?.classification ?? "held";
      if (classification === "guard-passed") { result = { result: { type: "boolean", value: true } }; }
      else if (classification === "guard-refused") { result = { result: { type: "string", value: "guard-refused" } }; }
      else if (classification === "malformed") { result = { result: { type: "boolean", value: false } }; }
      else { const count = SOURCE.sites[command.site].expression.slice(1, -1).split(",").length + Number(classification === "legacy-count");
        result = { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId: `legacy-${command.site}` } }; }
    } else if (command.phase === "sql-fence-frame" || command.phase === "sql-fence-capture" || command.phase === "sql-fence-native-frame") {
      if (command.phase === "sql-fence-frame" && command.site === "run" && wrongStartup === "foreign") {
        assert.fail("A diagnostic must not re-evaluate the spent run frame");
      }
      let count = 5;
      if (command.phase === "sql-fence-frame") { const counts = { afterImports: 4, startupVersion: 13, startupJB: 12, startupDC: 11, prepare: 6, prepared: 7 }; const actual: unknown = Object.getOwnPropertyDescriptor(counts, command.site)?.value; count = typeof actual === "number" ? actual : 5; }
      else if (command.phase === "sql-fence-capture") { count = 11; }
      result = { result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(count)})`, objectId: command.phase } };
      if (command.phase === "sql-fence-frame" && firstStartup !== null && command.site === firstStartup.site) {
        assert.fail("A diagnostic must use its cached tuple even when the old frame would refuse");
      }
    } else if (command.phase === "sql-fence-predicate-diagnostic") {
      assert.equal(firstStartup?.site, "initializerBirth");
      assert.equal(runner?.retained().failure, "SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION");
      assert.equal(runner?.retainedSelectedSqlStartupDiagnostic()?.diagnosticRequests, 1);
      assert.equal(runner?.retainedSelectedSqlPredicateDiagnostic()?.probeState, "not-read");
      result = firstStartup?.fault === "probe" ? { result: { type: "undefined" }, exceptionDetails: { text: "private" } } : { result: { type: "string", value: "proxy-positive" } };
    } else if (command.phase === "sql-fence-properties") {
      if (command.params.objectId === diagnosticObjectId && diagnosticSite !== null) {
        const retained = runner?.retainedSelectedSqlStartupDiagnostic();
        assert.ok(retained !== undefined && retained !== null); assert.equal(retained.site, diagnosticSite); assert.equal(retained.frameState, "not-read");
        assert.equal(retained.frameOrigin, "captured-original-tuple"); assert.equal(retained.diagnosticRequests, 0);
        assert.equal(runner?.retained().failure, "SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION");
        if (wrongStartup === "foreign") { assert.equal(runner?.retainedSelectedSqlStartupRefusalContext()?.reason, "selection-unrecognized"); }
        let data: Data[];
        if (diagnosticSite === "initializerBirth") { data = [{ type: "string", value: "C:\\private\\other.db" }, ...[0, 1, 2].map(index => ({ type: "function", className: "Function", objectId: `diagnostic-${String(index)}` }))]; }
        else { data = diagnosticSite === "keeperBirth" ? [{ type: "string", value: "C:\\private\\other.db" }, { type: "object", className: "Object", objectId: "diagnostic-sqlite" }] :
          [{ type: "object", className: "Object", objectId: "diagnostic-wrapper" }, { type: "string", value: "DELETE FROM private_table WHERE secret='private-value'" },
            { type: "object", subtype: "array", className: "Array", objectId: "diagnostic-parameters" }, { type: "object", className: "Object", objectId: "diagnostic-sqlite" }, { type: "object", className: "Object", objectId: "diagnostic-util" }]; }
        result = { result: [...data.map((value, index) => property(String(index), value, true, true)),
          property("length", { type: "number", value: data.length }, true, false, false)],
          internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "diagnostic-array-prototype" } }] };
        if (firstStartup?.fault === "properties") { result = { result: [], internalProperties: [] }; }
      }
      else if (command.params.objectId === "sql-fence-frame") { result = importsArray(); }
      else { result = command.params.objectId === "sql-fence-native-frame" ? nativeArray() : nativeMetadata(command.params.objectId, unsupportedNative && command.params.objectId === "native0"); }
    }
    else if (command.phase === "sql-fence-require") { result = { result: { type: "boolean", value: true } }; }
    else if (command.phase === "sql-fence-startup-version") { assert.equal(command.params.objectId, "legacy-startupVersion"); result = { result: { type: "object", subtype: "array", className: "Array", description: "Array(6)", objectId: "original-startup-tracker" } }; }
    else if (command.phase === "sql-fence-startup-jb" || command.phase === "sql-fence-startup-dc") { assert.equal(command.params.objectId, command.phase === "sql-fence-startup-jb" ? "legacy-startupJB" : "legacy-startupDC"); result = { result: { type: "boolean", value: true } }; }
    else if (command.phase === "sql-fence-startup-read-owner") { assert.ok(runner !== null); runner.requireOriginalStartupInterleaveCommand(capability, command); assert.equal(command.params.objectId,"raw-queryAll"); assert.deepEqual(command.params.arguments,[{objectId:"original-startup-tracker"}]); assert.equal(command.params.throwOnSideEffect,true); result = {result:{type:"boolean",value:stockMode !== "interleave-refused"}}; }
    else if (command.phase === "sql-fence-startup-select") { assert.equal(command.params.objectId, `legacy-${command.site}`); result = { result: { type: "object", value: (interleaveIndex < 0 ? startup[startupIndex]?.value : configTail[interleaveIndex]?.value) ?? { recognized: false } } }; }
    if (command.phase.startsWith("sql-fence-request-") || command.phase.startsWith("sql-fence-driver-") || command.phase === "sql-fence-fetch-source" ||
      command.phase === "sql-fence-properties" && "objectId" in command.params && command.params.objectId !== diagnosticObjectId && !["sql-fence-frame", "sql-fence-native-frame", "native0", "native1", "native2", "native3", "native4"].includes(command.params.objectId)) { result = selectedRequestPeer(command, currentRequest); }
    queue.push({ id, result });
    if (batchResume) {
      assert.equal(queuedBytes.length, 0); assert.equal(queue[0]?.["method"], "Debugger.resumed"); assert.equal(queue[1]?.["method"], "Debugger.paused");
      queuedBytes = Buffer.from(queue.splice(0).map(packet => `${JSON.stringify(packet)}\0`).join("")); resumeBatches += 1;
    }
    return Promise.resolve();
  };
  /** The runner/codec/schedule are real. This inert peer substitutes only
   * catalog/native replies; it executes no SQL or inspector program. */
  const stockSend = (command: CurrentMainStartupLibraryV2Command, id: number): Promise<void> => {
    assert.ok(runner !== null); runner.requireOriginalStartupLibraryCommand(capability, stockOrigin, command); stockSchedule.consume(command.phase); phases.push(command.phase);
    let result: unknown = {};
    const suffix = command.phase.slice("sql-stock-v2-".length);
    const array = (length: number): object => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: `stock-${suffix}-${String(stockIndex)}` } });
    if (suffix === "raw" || suffix === "bind") { result = array(4); }
    else if (suffix === "captured") { result = array(5); }
    else if (suffix === "caller" || suffix === "frame") { result = array(3); }
    else if (suffix === "points") { result = { locations: [{ scriptId: "app", ...STOCK.returnPoint, type: "return" }] }; }
    else if (suffix === "arm") { result = { breakpointId: "stock-return", actualLocation: { scriptId: "app", ...STOCK.returnPoint } }; }
    else if (suffix === "select") { result = { result: { type: "object", value: { recognized: true, role: "jl", site: "run", scriptIndex: stockIndex, sql: `inert-stock-${String(stockIndex)}`, parametersEmpty: true, transactionDepth: 0, designWriteGrant: false, nativeCompletionProven: false, normalReturnProven: false } } }; }
    else if (suffix === "require" || suffix === "return") { result = { result: { type: "boolean", value: true } }; }
    else if (suffix === "return-frame") { result = array(1); }
    else if (suffix === "return-properties") { result = { result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "promise-prototype" } }, { name: "[[PromiseState]]", value: { type: "string", value: "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "object", className: "Yo", description: "Yo", objectId: "stock-owner" } }] }; }
    else if (suffix === "resume") {
      event("Debugger.resumed", {});
      if (interleaved && stockIndex === 0) { interleaveIndex = 0; const first = configTail[0]; assert.ok(first !== undefined); pause(first.site); }
      else if (stockIndex < 331 && stockMode !== "early-registration") { stockIndex += 1; pause("run"); }
      else if (stockIndex === 331) { stockIndex += 1; event("Debugger.paused", { reason: "other", hitBreakpoints: ["stock-return"], callFrames: [{ callFrameId: "stock-return-frame", location: { scriptId: "app", ...STOCK.returnPoint }, returnValue: { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "stock-native-return" } }] }); }
      else { holdRegistration = false; queue.push(...retainedRegistration.splice(0)); }
    }
    queue.push({ id, result }); return Promise.resolve();
  };
  const transport: CurrentFootprintCopyMainBackendTransport = Object.freeze({
    assertCurrent: (): Promise<void> => base.transport.assertCurrent(),
    send: (command: Command, id: number): Promise<void> => {
      phases.push(command.phase); const local = base.commands.length + 1; ids.set(local, id);
      if (command.phase === "resume") {
        normalResumes += 1;
        if (normalResumes === 1) { holdRegistration = true; event("Debugger.resumed", {}); event("Debugger.scriptParsed", { scriptId: "app", url: stockMode === null ? "file:///synthetic/app.js" : "file:///C:/Synthetic/app.js", executionContextId: 1 }); pause("import"); }
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
  /** Throw only the explicit synthetic sequence error; all original version,
   * binding, snapshot and scheduler behavior remains in the maintained code. */
  class RefusingProgress extends CurrentMainStartupConfigProgress {
    public override consume(input: Parameters<CurrentMainStartupConfigProgress["consume"]>[0]): boolean {
      if (failureProbe?.consumeError !== undefined) { throw failureProbe.consumeError; } return super.consume(input);
    }
  }
  class InertStockProgress {
    #bound = false; #count = 0;
    public bind(): void { assert.equal(this.#bound, false); this.#bound = true; }
    public consume(input: unknown): boolean { const packet = captureCurrentMainStartupLibrarySelection(input); assert.ok(packet.recognized); assert.equal(packet.scriptIndex, this.#count); assert.equal(packet.sql, `inert-stock-${String(this.#count)}`); this.#count += 1; return true; }
    public requireAllCallsConsumed(): void { assert.equal(this.#count, 332); }
    public snapshot(): object { return { ...new CurrentMainStartupLibraryProgress().snapshot(), receiverBound: this.#bound, scriptCallsConsumed: this.#count, allCallsConsumed: this.#bound && this.#count === 332 }; }
  }
  const module = await mainBackendModule({
    ...(stockMode === null ? {} : { "./current-main-startup-library-progress.ts": { CurrentMainStartupLibraryProgress: InertStockProgress, currentMainStartupLibrarySelectionSchema } }),
    ...(failureProbe?.consumeError === undefined ? {} : { "./current-main-startup-config-progress.ts": { currentMainStartupConfigSelectionSchema, CurrentMainStartupConfigProgress: RefusingProgress } }),
    ...(failureProbe?.projectionError === undefined && failureProbe?.locationProjectionCount === undefined ? {} : { "./current-selected-file-main-sql-startup-refusal-context.ts": {
      captureCurrentSelectedFileMainSqlStartupPauseLocations: (...input: Parameters<typeof captureCurrentSelectedFileMainSqlStartupPauseLocations>): ReturnType<typeof captureCurrentSelectedFileMainSqlStartupPauseLocations> => {
        const counter = failureProbe?.locationProjectionCount; if (counter !== undefined) { counter.count += 1; } return captureCurrentSelectedFileMainSqlStartupPauseLocations(...input);
      },
      createCurrentSelectedFileMainSqlStartupRefusalContext: (...input: Parameters<typeof createCurrentSelectedFileMainSqlStartupRefusalContext>): ReturnType<typeof createCurrentSelectedFileMainSqlStartupRefusalContext> => {
        const original = failureProbe?.projectionError; if (original !== undefined) { throw original; } return createCurrentSelectedFileMainSqlStartupRefusalContext(...input);
      } } }),
    "./current-selected-file-main-request-reader.ts": { CurrentSelectedFileMainRequestReader: RequestReader },
    "./current-pcb-via-main-live-history-source.ts": { qualifyCurrentPcbViaMainLiveHistorySource: (source: unknown): void => { assert.equal(source, "synthetic-complete-app-source"); } },
    "./current-main-startup-library-source.ts": { qualifyCurrentMainStartupLibrarySource: (source: unknown): void => { assert.equal(source, "synthetic-complete-app-source"); } },
    "./current-main-startup-config-sql.ts": { qualifyCurrentMainStartupConfigSource: (source: unknown): void => { assert.equal(source, "synthetic-complete-app-source"); } },
    "./current-footprint-copy-main-request-source.ts": {
      qualifyCurrentFootprintCopyMainRequestSource: (source: unknown): unknown => { assert.equal(source, "synthetic-complete-app-source"); return capability; },
      requireCurrentFootprintCopyMainRequestSource: (source: unknown): void => { assert.equal(source, capability); },
    },
    "./current-selected-file-main-sql-fence-source.ts": { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE: SOURCE,
      qualifyCurrentSelectedFileMainSqlFenceSource: (source: unknown): void => { assert.equal(source, "synthetic-complete-app-source"); } },
    "./current-selected-file-main-sql-fence-bootstrap.ts": {
      enrollOriginalCurrentMainStartupLibrary: (token: unknown, original: CurrentFootprintCopyMainBackendRunner): typeof stockOrigin => { assert.equal(token, capability); assert.equal(original, runner); assert.ok(stockMode !== null); original.requireOriginalStartupLibraryEnrollment(capability); return stockOrigin; },
      sendOriginalCurrentMainStartupLibrary: (token: unknown, original: unknown, origin: unknown, command: CurrentMainStartupLibraryV2Command, id: number): Promise<void> => { assert.equal(token, capability); assert.equal(original, runner); assert.equal(origin, stockOrigin); return stockSend(command, id); },
      prepareOriginalCurrentSelectedFileStartupActors: (token: unknown, original: CurrentFootprintCopyMainBackendRunner): Promise<void> => {
        assert.equal(token, capability); assert.equal(original, runner); original.requireOriginalStartupActorPause(capability); phases.push("startup-actors"); return Promise.resolve();
      },
      requireCurrentSelectedFileMainSqlFenceBootstrap: (token: unknown, original: unknown): string => { assert.equal(token, capability); assert.equal(original, transport); return String.raw`C:\Synthetic\fixture.eprj2`; },
      sendCurrentSelectedFileMainSqlFenceCommand: (token: unknown, original: unknown, command: SqlCommand, id: number): Promise<void> => {
        assert.equal(token, capability); assert.equal(original, runner); return sqlSend(command, id);
      },
      sendOriginalCurrentPcbViaMainStructure: (token: unknown, original: unknown, command: CurrentPcbViaMainStructureCommand, id: number): Promise<ReturnType<typeof viaMainStructureWindow>> => {
        assert.equal(token, capability); assert.equal(original, runner); assert.ok(runner !== null); phases.push("role" in command ? `${command.phase}-${command.role}` : command.phase);
        const window = command.phase === "via-main-structure-step" ? viaMainStructureWindow(command.role) : null;
        if (command.phase === "via-main-structure-step") { runner.consumeOriginalViaMainStructure(command, id); if (loseDriverStep) { return Promise.reject(new Error("original-structure-step-ack-lost")); } plannedResumes += 1; event("Debugger.resumed", {}); }
        queue.push({ id, result: viaMainStructureReply(command, id, currentRequest.pathHeader) }); return Promise.resolve(window);
      },
      sendOriginalCurrentPcbViaMainHistory: (token: unknown, original: unknown, command: CurrentPcbViaMainHistoryCommand, id: number): Promise<ReturnType<typeof viaMainHistoryWindow>> => {
        assert.equal(token, capability); assert.equal(original, runner); assert.ok(runner !== null); phases.push("role" in command ? `${command.phase}-${command.role}` : command.phase);
        const window = command.phase === "via-main-history-step" ? viaMainHistoryWindow(command.role) : null;
        if (command.phase === "via-main-history-step") { runner.consumeOriginalViaMainHistory(command, id); if (loseDriverStep) { return Promise.reject(new Error("original-history-step-ack-lost")); } if (window !== null) { historySlot = window.slot; } plannedResumes += 1; event("Debugger.resumed", {}); }
        queue.push({ id, result: viaMainHistoryReply(command, id, historySlot) }); return Promise.resolve(window);
      },
      sendOriginalCurrentPcbViaMainBegin: (token: unknown, original: unknown, command: CurrentPcbViaMainBeginCommand, id: number): Promise<void> => {
        assert.equal(token,capability);assert.equal(original,runner);assert.ok(runner!==null);phases.push(`${command.phase}-${command.role}`);
        let result:unknown={};
        if(command.phase==="via-main-begin-arm"){result={breakpointId:`begin-${command.role}`,actualLocation:command.params.location};}
        else if(command.phase==="via-main-begin-step"){const grant=runner.consumeOriginalViaMainBegin(command,id);assert.equal(grant.nativeSql,command.role==="run");if(loseDriverStep){return Promise.reject(new Error("original-driver-step-ack-lost"));}plannedResumes+=1;event("Debugger.resumed",{});}
        else if(command.phase==="via-main-begin-frame"||command.phase==="via-main-begin-raw-frame"||command.phase==="via-main-begin-join"||command.phase==="via-main-begin-rebase"||command.phase==="via-main-begin-bookkeeping"){const counts=command.phase==="via-main-begin-frame"||command.phase==="via-main-begin-raw-frame"?{save:4,transaction:2,run:7,callback:8,returned:2}:{save:4,transaction:3,run:10,callback:4,returned:0};const count=counts[command.role]-(command.phase==="via-main-begin-raw-frame"?1:0);result={result:{type:"object",subtype:"array",className:"Array",description:`Array(${String(count)})`,objectId:`begin-${command.phase}-${command.role}`}};
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
  return { runner, phases, transport, injectStructurePoint: (role: CurrentPcbViaMainStructureFrameRole, caller?: CurrentPcbViaMainStructureFrameRole): void => {
    let pointId = `structure-${role}`; if (role === "run") { pointId = "sql-run"; } else if (role === "callback") { pointId = "begin-callback"; }
    event("Debugger.paused", { reason:"other",hitBreakpoints:[pointId],callFrames:[structurePeerFrame(role),...(caller===undefined?[]:[structurePeerFrame(caller)])] });
  }, injectHistoryPoint: (role: CurrentPcbViaMainHistoryFrameRole, caller?: CurrentPcbViaMainHistoryFrameRole): void => {
    if (role === "sqlRun" && caller !== undefined) { const slots: Partial<Record<CurrentPcbViaMainHistoryFrameRole, string>> = { dataCaller: "data", headCallerAppend: "head", headCallerMutable: "head", branchCaller: "branch", commitCaller: "commit", projectCaller: "project" }; historySlot = slots[caller] ?? "data"; }
    let pointId = `history-${role}`; if (role === "sqlRun") { pointId = "sql-run"; } else if (role === "sqlCallback") { pointId = "begin-callback"; }
    event("Debugger.paused", { reason: "other", hitBreakpoints: [pointId], callFrames: [historyPeerFrame(role), ...(caller === undefined ? [] : [historyPeerFrame(caller)])] });
  }, injectBeginPoint:(role:"save"|"transaction"|"run"|"callback"|"returned"):void=>{
    const sites={save:[8572,19_844,19_828,"saveProjectHistory"],transaction:[1025,2529,2514,"inTransaction"],run:[1025,875,859,""],callback:[1025,895,891,""],returned:[1025,2186,2040,"begin"]} as const;const site=sites[role];
    const calls:unknown[]=[{callFrameId:`begin-frame-${role}`,functionName:site[3],location:{scriptId:"app",lineNumber:site[0],columnNumber:site[1]},functionLocation:{scriptId:"app",lineNumber:site[0],columnNumber:site[2]}}];
    if(role==="run"){for(const [name,column]of[["begin",2040],["inTransaction",2514]]as const){calls.push({callFrameId:`begin-caller-${name}`,functionName:name,location:{scriptId:"app",lineNumber:1025,columnNumber:column},functionLocation:{scriptId:"app",lineNumber:1025,columnNumber:column}});}}
    event("Debugger.paused",{reason:"other",hitBreakpoints:[role==="run"?"sql-run":`begin-${role}`],callFrames:calls});
  }, injectViaPoint:(role:"context"|"controller"|"editHead"):void=>{
    const site={context:{lineNumber:1164,columnNumber:2540},controller:{lineNumber:8573,columnNumber:1663},editHead:{lineNumber:8572,columnNumber:27_776}}[role];
    const name={context:"",controller:"createProjectHistory",editHead:"PB"}[role];const column={context:2434,controller:1648,editHead:27_772}[role];
    const caller=role==="context"?{callFrameId:"frame-parent",functionName:"interceptHttpProtocol",location:{scriptId:"app",lineNumber:1164,columnNumber:51_414},functionLocation:{scriptId:"app",lineNumber:1164,columnNumber:51_072}}:{callFrameId:"frame-actor",functionName:"L3",location:{scriptId:"app",lineNumber:8573,columnNumber:267},functionLocation:{scriptId:"app",lineNumber:8573,columnNumber:31}};
    event("Debugger.paused",{reason:"other",hitBreakpoints:[`via-${String(site.columnNumber)}`],callFrames:[{callFrameId:`frame-${role}`,functionName:name,location:{scriptId:"app",...site},functionLocation:{scriptId:"app",lineNumber:site.lineNumber,columnNumber:column}},...(role==="controller"?[]:[caller])]});
  }, loseNextDriverStep: ():void=>{loseDriverStep=true;}, injectRequest: (method: string, foreign = false, sourceDelta = 0, history: boolean | "structure"=false): void => {
    const project = foreign ? "d".repeat(64) : createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex"); currentRequest = { method, url: `/api/v4/projects/${project}/branches${history===false?"":`/${"b".repeat(32)}/${history==="structure"?"structures":"histories"}`}`, delta: sourceDelta, pathHeader:project };
    if (!fetchScriptSeen) { event("Debugger.scriptParsed", { scriptId: "builtin-fetch", url: "node:internal/deps/undici/undici", executionContextId: 1, startLine: 0, startColumn: 0, endLine: 17_434, endColumn: 0, length: 745_782, isLiveEdit: false, hasSourceURL: false, isModule: false, scriptLanguage: "JavaScript" }); fetchScriptSeen = true; }
    pause("driver"); }, injectMutation: (): void => { pause("run"); }, injectSql: (original): void => { pause(original.site, original); }, injectDriver: (): void => { pause("driver"); }, resumes: (): number => normalResumes + sqlResumes + plannedResumes, resumeBatches: (): number => resumeBatches,
    deferPoll: () => { assert.equal(heldPoll, null); const original = { started: Promise.withResolvers<null>(), settle: Promise.withResolvers<null>() }; heldPoll = original;
      return { started: original.started.promise, release: (): void => { original.settle.resolve(null); } }; } };
}
void test("actual runner arms every selected-file site before SQLite import and retains its original fence after construction", async () => {
  const f = await fixture(); await f.runner.observe();
  assert.deepEqual(f.phases.slice(0, 6), ["runtime-enable", "debugger-enable", "sql-fence-early-arm", "registration-arm", "run-waiting", "resume"]);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-held-arm").length, 23); assert.equal(f.resumes(), 55);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-raw-frame").length, 51);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-captured-frame").length, 51);
  assert.equal(f.runner.selectedSqlFenceState()["ready"], true); assert.equal(f.runner.selectedSqlFenceState()["conditionalBreakpoints"], 23);
  f.injectMutation(); await f.runner.pumpSelectedSqlFence(); const before = f.phases.length;
  assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "run"); assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  await f.runner.pumpSelectedSqlFence(); assert.equal(f.resumes(), 55); assert.equal(f.phases.length, before);
  await assert.rejects(f.runner.prepareNormalClose(), /RETAIN_THROUGH_EXIT/u); await assert.rejects(f.runner.release(), /RETAIN_THROUGH_EXIT/u);
});
void test("captured module bindings pass each genuine birth pause before the unchanged startup SQL sequence", async () => {
  for (const site of ["keeperBirth", "initializerBirth"] as const) {
    const f = await fixture(0, null, false, { site, classification: "guard-passed" }); await f.runner.observe();
    assert.equal(f.resumes(), 56); assert.equal(f.runner.selectedSqlFenceState()["ready"], true);
    assert.equal(f.runner.selectedSqlFenceState()["profileSqlContinuationsAcknowledged"], 48);
    assert.equal(f.runner.selectedSqlFenceState()["profileMetadataContinuationsAcknowledged"], 3);
    assert.equal(f.runner.retainedSelectedSqlStartupDiagnostic(), null); assert.equal(f.runner.retainedSelectedSqlPredicateDiagnostic(), null);
    assert.equal(f.phases.filter(phase => phase === "sql-fence-raw-frame").length, 52);
    assert.equal(f.phases.filter(phase => phase === "sql-fence-captured-frame").length, 52);
    assert.equal(f.phases.filter(phase => phase === "sql-fence-frame").length, 1);
    assert.equal(f.phases.includes("sql-fence-predicate-diagnostic"), false);
    assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  }
});
void test("guard refusal, malformed frames and lost classifier ACKs keep the same startup pause stopped without retry", async () => {
  for (const scenario of [
    { classification: "guard-refused", error: /CAPTURED_FRAME_GUARD/u },
    { classification: "malformed", error: /Invalid input/u },
    { classification: "legacy-count", error: /CAPTURED_FRAME_LEGACY_TUPLE/u },
    { classification: "lost-ack", error: /original-classifier-ack-lost/u },
    { fault: "raw-count", error: /CAPTURED_FRAME_RAW_TUPLE/u },
    { fault: "raw-exception", error: /Invalid input/u },
    { fault: "original-pause", error: /UNEXPECTED_RESUME/u },
  ] as const) {
    const { error, ...options } = scenario; const f = await fixture(0, null, false, { site: "keeperBirth", ...options });
    await assert.rejects(f.runner.observe(), error); assert.equal(f.resumes(), 3);
    assert.equal(f.runner.retainedSelectedSqlStartupDiagnostic(), null); assert.equal(f.runner.retainedSelectedSqlPredicateDiagnostic(), null);
    assert.equal(f.phases.filter(phase => phase === "sql-fence-raw-frame").length, 1);
    const expected = "fault" in scenario && (scenario.fault === "raw-count" || scenario.fault === "raw-exception") ? 0 : 1;
    assert.equal(f.phases.filter(phase => phase === "sql-fence-captured-frame").length, expected);
    assert.equal(f.phases.includes("sql-fence-startup-version"), false); assert.equal(f.phases.includes("capture"), false);
    const before = f.phases.length; await assert.rejects(f.runner.observe(), /OBSERVE_CONSUMED/u); assert.equal(f.phases.length, before);
    assert.equal(f.resumes(), 3); assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  }
});
void test("refused raw frame replies retain their fixed site/category and schema issues without another request", async () => {
  for (const [fault, failure] of [["raw-reference", "SELECTED_SQL_RAW_FRAME_KEEPERBIRTH_BINDING_T"], ["raw-side-effect", "SELECTED_SQL_RAW_FRAME_KEEPERBIRTH_SIDE_EFFECT_CHECK"]] as const) {
    const f = await fixture(0, null, false, { site: "keeperBirth", fault });
    await assert.rejects(f.runner.observe(), /Invalid input/u);
    assert.equal(f.runner.retained().failure, failure); assert.ok(f.runner.retained().schemaIssues !== null);
    assert.equal(f.phases.filter(phase => phase === "sql-fence-raw-frame").length, 1);
    assert.equal(f.phases.filter(phase => phase === "sql-fence-captured-frame").length, 0);
    assert.equal(f.resumes(), 3);
    const before = f.phases.length; await assert.rejects(f.runner.observe(), /OBSERVE_CONSUMED/u); assert.equal(f.phases.length, before);
  }
});
void test("a missing original resume ACK consumes its single guard-passed continuation", async () => {
  const f = await fixture(0, null, false, { site: "keeperBirth", classification: "guard-passed", fault: "resume-ack" });
  await assert.rejects(f.runner.observe(), /original-sql-resume-ack-lost/u);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-resume").length, 3); assert.equal(f.resumes(), 3);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-captured-frame").length, 1);
  const before = f.phases.length; await assert.rejects(f.runner.observe()); assert.equal(f.phases.length, before);
  assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
});
void test("unknown and mixed breakpoint hits never reach captured SQL classification or resume", async () => {
  for (const hitBreakpoints of [["foreign-point"], ["sql-keeperBirth", "foreign-point"]]) {
    const f = await fixture(0, null, false, { site: "keeperBirth", classification: "guard-passed", hitBreakpoints });
    await assert.rejects(f.runner.observe(), /REGISTRATION_PAUSE|INITIAL_PAUSE/u);
    assert.equal(f.phases.includes("sql-fence-raw-frame"), false); assert.equal(f.phases.includes("sql-fence-captured-frame"), false);
    assert.equal(f.resumes(), 3); assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  }
});
void test("an unsupported native ABI retains its source-issued diagnostic before startup SQL or resume", async () => {
  const f = await fixture(0, null, true);
  await assert.rejects(f.runner.observe(), /SELECTED_SQL_NATIVE_DATABASE/u);
  const failure = f.runner.retained().failure;
  assert.ok(typeof failure === "string"); assert.match(failure, /SELECTED_SQL_NATIVE_DATABASE_P4_[A-F\d]{16}$/u);
  assert.equal(failure.includes("synthetic-private-metadata"), false);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-properties").length, 3);
  assert.equal(f.phases.includes("sql-fence-require"), false);
  assert.equal(f.phases.includes("sql-fence-startup-version"), false);
  assert.equal(f.resumes(), 2); assert.equal(f.runner.selectedSqlFenceState()["ready"], false);
});
void test("a held reconstructed tuple supplies live v2 diagnostic properties without re-evaluating the spent frame", async () => {
  for (const first of [{ site: "keeperBirth" }, { site: "run" }, { site: "run", fault: "frame" }, { site: "run", fault: "properties" }] as const) {
    const f = await fixture(0, null, false, { ...first, classification: "held" });
    assert.equal(f.runner.retainedSelectedSqlStartupDiagnostic(), null);
    await assert.rejects(f.runner.observe(), /SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION/u);
    const retained = f.runner.retainedSelectedSqlStartupDiagnostic();
    const diagnostic = currentSelectedFileMainSqlStartupDiagnosticV2Schema.parse(retained);
    assert.equal(f.runner.retainedSelectedSqlStartupDiagnostic(), retained); assert.equal(Object.isFrozen(retained), true);
    assert.equal(diagnostic.site, first.site); assert.equal(diagnostic.originalPhase, "sql-fence-captured-frame");
    assert.equal(diagnostic.refusal, first.site === "run" ? "tracker-absent" : "site-outside-startup-profile");
    assert.equal(diagnostic.predicateBranchVerified, false); assert.equal(diagnostic.resumeAuthorized, false);
    assert.equal(diagnostic.frameOrigin, "captured-original-tuple"); assert.equal(diagnostic.diagnosticRequests, 1);
    if ("fault" in first && first.fault === "properties") { assert.equal(diagnostic.frameState, "properties-refused"); assert.equal(diagnostic.summary, null); }
    else { assert.equal(diagnostic.frameState, "captured"); assert.equal(diagnostic.summary?.pathKind, first.site === "keeperBirth" ? "other" : "not-applicable"); assert.equal(diagnostic.summary?.sqlKind, first.site === "run" ? "delete" : "not-applicable"); }
    assert.equal(f.runner.retained().phase, "sql-fence-captured-frame"); assert.equal(f.runner.retained().failure, "SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION");
    assert.equal(f.runner.retained().schemaIssues, null); assert.equal(f.resumes(), 3);
    assert.equal(f.phases.includes("sql-fence-startup-version"), false); assert.equal(f.phases.includes("sql-fence-startup-select"), false); assert.equal(f.phases.includes("capture"), false);
    assert.equal(JSON.stringify(diagnostic).includes("private-value"), false); assert.equal(JSON.stringify(diagnostic).includes("other.db"), false);
    assert.equal(JSON.stringify(diagnostic).includes("diagnostic-wrapper"), false); assert.equal(JSON.stringify(diagnostic).includes("synthetic-private-error"), false);
    const before = f.phases.length; await assert.rejects(f.runner.observe()); assert.equal(f.phases.length, before); assert.equal(f.runner.retainedSelectedSqlStartupDiagnostic(), retained);
    assert.equal(currentSelectedFileMainSqlStartupDiagnosticV2Schema.safeParse({ ...diagnostic, sql: "private-value" }).success, false);
    assert.equal(f.phases.filter(phase => phase === "sql-fence-frame").length, 1);
    assert.deepEqual(f.phases.slice(f.phases.lastIndexOf("sql-fence-captured-frame")), ["sql-fence-captured-frame", "sql-fence-properties"]);
  }
});
void test("initializer guard probe remains separate from the one-property live diagnostic and preserves the original refusal/resume count", async () => {
  for (const fault of [undefined, "probe"] as const) {
    const f = await fixture(0, null, false, { site: "initializerBirth", classification: "held", ...(fault === undefined ? {} : { fault }) });
    assert.equal(f.runner.retainedSelectedSqlPredicateDiagnostic(), null);
    await assert.rejects(f.runner.observe(), /SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION/u);
    const retained = f.runner.retainedSelectedSqlPredicateDiagnostic(); assert.ok(retained !== null);
    assert.equal(retained.probeState, fault === undefined ? "captured" : "evaluation-refused");
    assert.equal(retained.stage, fault === undefined ? "proxy-positive" : null); assert.equal(retained.diagnosticRequests, 1);
    assert.equal(retained.originalPredicateBranchVerified, false); assert.equal(retained.resumeAuthorized, false);
    assert.equal(f.runner.retainedSelectedSqlStartupDiagnostic()?.diagnosticRequests, 1); assert.equal(f.resumes(), 3);
    assert.equal(f.runner.retained().phase, "sql-fence-captured-frame"); assert.equal(f.runner.retained().failure, "SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION");
    assert.equal(f.phases.filter(phase => phase === "sql-fence-predicate-diagnostic").length, 1);
    const before = f.phases.length; await assert.rejects(f.runner.observe()); assert.equal(f.phases.length, before);
    assert.equal(f.runner.retainedSelectedSqlPredicateDiagnostic(), retained); assert.equal(Object.isFrozen(retained), true);
    assert.equal(f.phases.includes("capture"), false);
    assert.equal(JSON.stringify(retained).includes("other.db"), false);
  }
});
void test("an import pause at another actual column refuses before SQLite import continuation or conditional arming", async () => {
  const f = await fixture(1); await assert.rejects(f.runner.observe(), /SELECTED_SQL_LOCATION/u);
  assert.equal(f.phases.includes("sql-fence-held-arm"), false); assert.equal(f.resumes(), 1);
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
void test("the Via handoff drains only a sole guard-passed SQL pair and preserves its next driver and owned source points", async () => {
  const f = await fixture(); await f.runner.observe(); const original = await f.runner.beginViaMainObservation();
  const before = f.resumes(), classifications = f.phases.filter(phase => phase === "sql-fence-captured-frame").length;
  f.injectSql({ site: "run", classification: "guard-passed", following: "driver", batchResume: true });
  await f.runner.pumpSelectedSqlFence();
  const driver = await original.bindings.nextEvent(); assert.equal(driver.method, "Debugger.paused");
  assert.equal(f.resumes(), before + 1); assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "driver"); assert.equal(f.resumeBatches(), 1);
  assert.equal(f.phases.filter(phase => phase === "sql-fence-captured-frame").length, classifications + 2);
  assert.equal(f.runner.selectedSqlFenceState()["readonlyRequestContinuations"], 0);
  const separate = await fixture(); await separate.runner.observe(); const owner = await separate.runner.beginViaMainObservation();
  await owner.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-site-arm", method: "Debugger.setBreakpoint",
    params: { location: { scriptId: "app", lineNumber: 8573, columnNumber: 1663 } } }), false);
  const captured = separate.phases.filter(phase => phase === "sql-fence-captured-frame").length, resumes = separate.resumes();
  separate.injectViaPoint("controller"); const owned = await owner.bindings.nextEvent(); assert.equal(owned.method, "Debugger.paused");
  assert.equal(separate.phases.filter(phase => phase === "sql-fence-captured-frame").length, captured);
  assert.equal(separate.resumes(), resumes); assert.equal(separate.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
});

void test("Via nextEvent filters guard-passed SQL pauses before delivering the next original held driver", async () => {
  for (const site of ["queryOne", "run", "driver"] as const) {
    const f = await fixture(); await f.runner.observe(); const original = await f.runner.beginViaMainObservation();
    const before = f.resumes(), start = f.phases.length;
    f.injectSql({ site, classification: "guard-passed", following: "driver" });
    const event = await original.bindings.nextEvent(); assert.equal(event.method, "Debugger.paused");
    assert.ok(event.params !== null && typeof event.params === "object"); const frames: unknown = Reflect.get(event.params, "callFrames");
    assert.ok(Array.isArray(frames)); const frame: unknown = frames[0];
    assert.ok(frame !== null && typeof frame === "object"); assert.equal(Reflect.get(frame, "callFrameId"), "frame-driver");
    assert.equal(f.resumes(), before + 1); assert.equal(f.runner.selectedSqlFenceState()["heldSite"], "driver");
    assert.equal(f.phases.slice(start).filter(phase => phase === "sql-fence-captured-frame").length, 2);
    assert.equal(f.phases.slice(start).filter(phase => phase === "sql-fence-resume").length, 1);
    assert.equal(f.runner.selectedSqlFenceState()["readonlyRequestContinuations"], 0);
    assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  }
});

void test("a guard-passed Via pause clears only its own held reference before body binding", async () => {
  const f = await fixture(); await f.runner.observe(); const original = await f.runner.beginViaMainObservation();
  for (const [lineNumber, columnNumber] of [[8573, 1663], [8572, 27_776]]) {
    await original.bindings.request(validateCurrentPcbViaMainCommand({ phase: "via-main-request-site-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "app", lineNumber, columnNumber } } }), false);
  }
  const before = f.resumes(); f.injectSql({ site: "run", classification: "guard-passed" });
  await f.runner.pumpSelectedSqlFence(); assert.equal(f.resumes(), before + 1);
  assert.equal(f.runner.selectedSqlFenceState()["heldSite"], null);
  const body = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), projectKey: "a".repeat(64), path: String.raw`C:\Synthetic\fixture.eprj2`, dataStr: "original-producer-body" };
  f.runner.bindViaExpectedHistoryBody(original.origin, body); assert.deepEqual(f.runner.requireViaExpectedHistoryBody(original.origin), body);
});

void test("Via filtering never resumes a refused classifier or retries a lost original resume acknowledgment", async () => {
  for (const fault of ["guard-refused", "resume-ack"] as const) {
    const f = await fixture(); await f.runner.observe(); const original = await f.runner.beginViaMainObservation();
    const before = f.resumes(), start = f.phases.length;
    f.injectSql({ site: "queryOne", classification: fault === "guard-refused" ? "guard-refused" : "guard-passed", ...(fault === "resume-ack" ? { fault } : {}) });
    await assert.rejects(original.bindings.nextEvent()); const stopped = f.phases.length;
    await assert.rejects(original.bindings.nextEvent()); assert.equal(f.phases.length, stopped);
    assert.equal(f.resumes(), before);
    assert.equal(f.phases.slice(start).filter(phase => phase === "sql-fence-resume").length, fault === "resume-ack" ? 1 : 0);
    assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  }
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

void test("the original startup refusal retains exact selection and event locations before old diagnostics without another request or resume", async () => {
  const callers = [
    { callFrameId: "private-caller", functionName: "privateFunction", url: "file:///private/design", scopeChain: [{ private: "raw SQL" }], location: { scriptId: "app", lineNumber: 0, columnNumber: 3 } },
    { callFrameId: "foreign-caller", functionName: "foreignFunction", location: { scriptId: "foreign-handle", lineNumber: 0, columnNumber: 0 } },
    { callFrameId: "outside-caller", location: { scriptId: "app", lineNumber: 999_999, columnNumber: 0 } },
  ];
  const f = await fixture(0, "foreign", false, null, callers);
  await assert.rejects(f.runner.observe(), /SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION/u);
  const context = f.runner.retainedSelectedSqlStartupRefusalContext(); assert.ok(context !== null);
  assert.equal(context.site, "run"); assert.equal(context.reason, "selection-unrecognized"); assert.deepEqual(context.selection, { state: "returned", recognized: false });
  assert.deepEqual(context.progress, { currentVersionObserved: true, jbCallsConsumed: 0, dcCallsConsumed: 0,
    profileSqlOnly: true, cookieUpdatesAdmitted: false, selectedProjectWriteGrant: false, nativeCompletionProven: false });
  // The source issuer is explicitly synthetic in this fixture. The original
  // Pinned top location lies outside its short text and is counted as omitted.
  assert.deepEqual(context.callFrames, { totalFrames: 4, omittedForeignScript: 1, omittedOutsideSource: 2,
    locations: [{ frameIndex: 1, lineNumber: 0, columnNumber: 3 }] });
  assert.deepEqual(f.phases.slice(f.phases.lastIndexOf("sql-fence-startup-select")), ["sql-fence-startup-select", "sql-fence-properties"]);
  assert.equal(f.resumes(), 5); assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  const requests = f.phases.length; assert.equal(f.runner.retainedSelectedSqlStartupRefusalContext(), context); assert.equal(f.phases.length, requests);
  assert.equal(Object.hasOwn(f.runner.retained(), "startupRefusalContext"), false);
  for (const value of ["private-caller", "privateFunction", "file:///private", "raw SQL", "foreign-handle"]) { assert.equal(JSON.stringify(context).includes(value), false); }
});

void test("sequence refusal preserves exact thrown identity even when optional projection fails, and later ordinary holds publish no startup failure", async () => {
  let errorReads = 0; const original = new Error("synthetic original sequence refusal"), projection = new Error("synthetic optional projection refusal");
  const rejectErrorRead = (): never => { errorReads += 1; throw new Error("must not inspect"); };
  for (const value of [original, projection]) { Object.defineProperty(value, "stack", { get: rejectErrorRead }); }
  for (const projectionError of [undefined, projection]) {
    const f = await fixture(0, null, false, null, [], { consumeError: original, ...(projectionError === undefined ? {} : { projectionError }) });
    await assert.rejects(f.runner.observe(), (caught: unknown): boolean => caught === original);
    const context = f.runner.retainedSelectedSqlStartupRefusalContext();
    if (projectionError === undefined) { assert.equal(context?.reason, "selection-sequence-refused"); assert.equal(context?.selection.state, "returned"); }
    else { assert.equal(context, null); }
    assert.equal(f.phases.at(-1), "sql-fence-startup-select"); assert.equal(f.resumes(), 5);
  }
  const ordinary = await fixture(); await ordinary.runner.observe(); const resumes = ordinary.resumes();
  ordinary.injectSql({ site: "run" }); await ordinary.runner.pumpSelectedSqlFence();
  assert.equal(ordinary.runner.retainedSelectedSqlStartupRefusalContext(), null); assert.equal(ordinary.resumes(), resumes);
  assert.equal(ordinary.runner.selectedSqlFenceState()["heldSite"], "run"); assert.equal(errorReads, 0);
});

void test("decode refusal and tracker-absent startup retain distinct exact states without diagnostic or selection retries", async () => {
  const malformed = await fixture(0, "malformed"); await assert.rejects(malformed.runner.observe());
  const decoded = malformed.runner.retainedSelectedSqlStartupRefusalContext(); assert.ok(decoded !== null);
  assert.equal(decoded.reason, "selection-reply-refused"); assert.deepEqual(decoded.selection, { state: "reply-refused" });
  assert.equal(malformed.runner.retained().failure, "REPLY_SCHEMA"); assert.equal(malformed.phases.at(-1), "sql-fence-startup-select");
  assert.equal(malformed.resumes(), 5); assert.equal(JSON.stringify(decoded).includes("private malformed SQL"), false);
  const absent = await fixture(0, null, false, { site: "run" });
  await assert.rejects(absent.runner.observe(), /SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION/u);
  const fallback = absent.runner.retainedSelectedSqlStartupRefusalContext(); assert.ok(fallback !== null);
  assert.equal(fallback.reason, "tracker-absent"); assert.deepEqual(fallback.selection, { state: "not-attempted" });
  assert.equal(absent.phases.includes("sql-fence-startup-select"), false); assert.equal(fallback.additionalRequests, 0);
});

void test("original source bounds are projected once per actual refusal and never for complete startup or later ordinary holds", async () => {
  const completeCount = { count: 0 }, refusedCount = { count: 0 };
  const complete = await fixture(0, null, false, null, [], { locationProjectionCount: completeCount });
  await complete.runner.observe(); assert.equal(completeCount.count, 0);
  complete.injectSql({ site: "run" }); await complete.runner.pumpSelectedSqlFence();
  assert.equal(completeCount.count, 0); assert.equal(complete.runner.retainedSelectedSqlStartupRefusalContext(), null);
  const refused = await fixture(0, "foreign", false, null, [], { locationProjectionCount: refusedCount });
  await assert.rejects(refused.runner.observe(), /SELECTED_SQL_UNQUALIFIED_STARTUP_MUTATION/u);
  assert.equal(refusedCount.count, 1); const packet = refused.runner.retainedSelectedSqlStartupRefusalContext(); assert.ok(packet !== null);
  assert.equal(refused.runner.retainedSelectedSqlStartupRefusalContext(), packet); assert.equal(refusedCount.count, 1);
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

for (const scenario of ["complete", "begin-lost", "history-lost", "foreign-sql"] as const) { void test(`the original Via history transaction retains each native slot (${scenario})`, async () => {
  const loseBegin = scenario === "begin-lost";
  const f=await fixture();await f.runner.observe();const original=await f.runner.beginViaMainObservation();
  const projectUuid = createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex"); f.runner.bindViaInitialHistoryBaseline(original.origin, { ...historyBaseline, projectUuid });
  const cases=currentPcbViaMainNativeCases();
  for(const role of [[8573,1663],[8572,27_776]]){await original.bindings.request(validateCurrentPcbViaMainCommand({phase:"via-main-request-site-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:"app",lineNumber:role[0],columnNumber:role[1]}}}),false);}
  const expected={projectUuid:createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex"),branchUuid:"b".repeat(32),projectKey:createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex"),path:String.raw`C:\Synthetic\fixture.eprj2`,dataStr:"original-held-body"};
  const beginCases=currentPcbViaMainBeginNativeCases();
  for (const command of currentPcbViaMainHistoryNativeCases().filter(item => item.phase === "via-main-history-arm")) { await original.bindings.historyRequest({ ...command, params: { ...command.params, location: { ...command.params.location, scriptId: "app" } } }, false); }
  original.bindings.requireHistoryArmed();
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
  const handoff = original.bindings.startHistory(); assert.equal(handoff.callbackBreakpointId, "begin-callback");
  const historyCases = currentPcbViaMainHistoryNativeCases();
  const historySend = (phase: string, role: string | null, params: Record<string, unknown> = {}): Promise<unknown> => { const sample = historyCases.find(item => item.phase === phase && (role === null || "role" in item && item.role === role)); assert.ok(sample !== undefined); return original.bindings.historyRequest(validateCurrentPcbViaMainHistoryCommand({ ...sample, params: { ...sample.params, ...params } }), false); };
  await historySend("via-main-history-properties", "transaction", { objectId: handoff.transactionObjectId }); await historySend("via-main-history-properties", "callback", { objectId: "original-history-callback" });
  await historySend("via-main-history-callback-arm", null, { objectId: "original-history-callback" });
  const historyStep = (role: string): Promise<unknown> => historySend("via-main-history-step", role);
  const historyFrame = async (role: CurrentPcbViaMainHistoryFrameRole): Promise<string> => captureArrayId(await historySend("via-main-history-frame", role, { callFrameId: `history-frame-${role}` }));
  const historyJoin = async (role: string, receiver: string, args: readonly string[] = []): Promise<string> => captureArrayId(await historySend("via-main-history-join", role, { objectId: receiver, arguments: args.map(objectId => ({ objectId })) }));
  const historyValue = (role: string, receiver: string, args: readonly string[] = []): Promise<unknown> => historySend("via-main-history-join", role, { objectId: receiver, arguments: args.map(objectId => ({ objectId })) });
  const captureHistory = async (role: CurrentPcbViaMainHistoryFrameRole, program: string, args: readonly string[]): Promise<string> => { f.injectHistoryPoint(role); await original.bindings.nextEvent(); return historyJoin(program, await historyFrame(role), args); };
  await historyStep("begin"); const historyCallback = await captureHistory("callback", "callback", [handoff.transactionObjectId]); await historyStep("callback");
  const branch = await captureHistory("branch", "branch", [historyCallback]); await historyValue("branchValue", branch); await historyStep("branch");
  const writer = await captureHistory("writerAppend", "writer", [branch]); await historyStep("writer");
  f.injectHistoryPoint("encryptEntry", "encryptCallerAppend"); await original.bindings.nextEvent(); const entry = await historyFrame("encryptEntry"); const encryptCaller = await historyFrame("encryptCallerAppend");
  const encrypt = await historyJoin("encryptEntry", entry, [encryptCaller, writer]); await historyStep("encrypt");
  const cipher = await captureHistory("cipher", "cipher", [encrypt, original.bindings.sqlCaptureObjectId]); await historyValue("cipherValue", cipher, [original.bindings.sqlCaptureObjectId]); await historyStep("cipher");
  if (scenario === "foreign-sql") { f.injectMutation(); await original.bindings.nextEvent(); const beforeForeign = f.resumes(); await assert.rejects(historyFrame("sqlRun")); assert.equal(f.resumes(), beforeForeign); assert.equal(f.phases.includes("via-main-history-step-sql-data"), false); assert.throws(() => original.bindings.originalHistoryEffects()); return; }
  let commitCallback = "", projectRun = "";
  for (const [slot, callerRole, program] of [["data", "dataCaller", "runData"], ["head", "headCallerAppend", "runHead"], ["branch", "branchCaller", "runBranch"], ["commit", "commitCaller", "runCommit"], ["project", "projectCaller", "runProject"]] as const) {
    if (slot === "project") { await captureHistory("commitReturned", "commitReturned", [commitCallback]); await historyStep("commitReturned"); }
    f.injectHistoryPoint("sqlRun", callerRole); await original.bindings.nextEvent(); const sqlFrame = await historyFrame("sqlRun"); const sqlCaller = await historyFrame(callerRole);
    const runPacket = await historyJoin(program, sqlFrame, [sqlCaller, cipher, original.bindings.sqlCaptureObjectId]); await historyValue("sqlValue", runPacket);
    if (scenario === "history-lost" && slot === "data") { f.loseNextDriverStep(); const beforeLost = f.resumes(); await assert.rejects(historyStep("sql-data"), /ack-lost/u); await assert.rejects(historyStep("sql-data")); assert.equal(f.resumes(), beforeLost); assert.equal(f.phases.filter(phase => phase === "via-main-history-step-sql-data").length, 1); assert.throws(() => original.bindings.originalHistoryEffects()); return; }
    await historyStep(`sql-${slot}`);
    const callbackPacket = await captureHistory("sqlCallback", "sqlCallback", [runPacket]); await historyValue("sqlCallbackValue", callbackPacket); await historyStep(`callback-${slot}`);
    if (slot === "commit") { commitCallback = callbackPacket; } if (slot === "project") { projectRun = runPacket; }
  }
  const projectReturned = await captureHistory("projectReturned", "projectReturned", [projectRun]); await historyStep("projectReturned");
  const saveReturned = await captureHistory("saveReturned", "saveReturned", [projectReturned]); await historyStep("saveReturned");
  f.injectHistoryPoint("controllerReturned"); await original.bindings.nextEvent(); const controllerReturned = await historyFrame("controllerReturned"); await historyValue("controllerReturned", controllerReturned, [saveReturned]); await historyStep("controllerReturned");
  const effects = original.bindings.originalHistoryEffects(); assert.equal(effects.nativeCallbacks.length, 5); assert.equal(effects.originalServiceAwaitCompleted, true); assert.equal(effects.bodySha256, createHash("sha256").update(expected.dataStr).digest("hex"));
  assert.deepEqual(effects.nativeCallbacks.map(item => item.slot), ["data", "head", "branch", "commit", "project"]); assert.equal(f.phases.filter(item => item === "via-main-history-arm-sqlCallback").length, 0);
  assert.equal(f.runner.selectedSqlFenceState()["selectedProjectMutationsResumed"], 0);
  await assert.rejects(beginSend("via-main-begin-step", "run"), /HISTORY_TRANSFERRED/u);
});}

void test("the old Via request cleanup cannot remove source points owned by the new native BEGIN enrollment",async()=>{
  const f=await fixture();await f.runner.observe();const original=await f.runner.beginViaMainObservation();
  for(const command of currentPcbViaMainBeginNativeCases().filter(item=>item.phase==="via-main-begin-arm")){await original.bindings.beginRequest({...command,params:{...command.params,location:{...command.params.location,scriptId:"app"}}},false);}
  original.bindings.requireBeginArmed();
  await assert.rejects(original.bindings.request(validateCurrentPcbViaMainCommand({phase:"via-main-request-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:"begin-callback"}}),true),/VIA_MAIN_PERSISTENT_POINT/u);
  original.bindings.requireBeginArmed();assert.equal(f.phases.includes("via-main-request-remove"),false);
});

for (const scenario of ["complete", "sql-ack-lost", "foreign-callback", "final-catch"] as const) { void test(`actual structure cursor loans one BEGIN callback and retains publication ordering (${scenario})`, async () => {
  const f = await fixture(); await f.runner.observe(); const original = await f.runner.beginViaMainObservation();
  const projectUuid = createHash("sha256").update(String.raw`C:\Synthetic\fixture.eprj2`).digest("hex"); f.runner.bindViaInitialHistoryBaseline(original.origin, { ...historyBaseline, projectUuid });
  for (const [lineNumber, columnNumber] of [[8573, 1663], [8572, 27_776]]) { await original.bindings.request(validateCurrentPcbViaMainCommand({ phase:"via-main-request-site-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:"app",lineNumber,columnNumber}} }),false); }
  for (const command of currentPcbViaMainBeginNativeCases().filter(item=>item.phase==="via-main-begin-arm")) { await original.bindings.beginRequest({...command,params:{...command.params,location:{...command.params.location,scriptId:"app"}}},false); }
  const commands = currentPcbViaMainStructureNativeCases();
  const send = (phase: string, role: string | null, params: Data = {}, cleanup = false): Promise<unknown> => { const sample = commands.find(item=>item.phase===phase&&(role===null||"role" in item&&item.role===role)); assert.ok(sample!==undefined); return original.bindings.structureRequest(validateCurrentPcbViaMainStructureCommand({...sample,params:{...sample.params,...params}}),cleanup); };
  const arm = (role:string):Promise<unknown> => { const sample=commands.find(item=>item.phase==="via-main-structure-arm"&&item.role===role);assert.ok(sample?.phase==="via-main-structure-arm");return send(sample.phase,role,{...sample.params,location:{...sample.params.location,scriptId:"app"}}); };
  for (const role of ["controller","query","selected","update","exec","updateReturned","serviceReturned","controllerReturned","response"]) { await arm(role); } original.bindings.requireStructureArmed();
  f.runner.bindViaExpectedHistoryBody(original.origin,{projectUuid,branchUuid:"b".repeat(32),projectKey:projectUuid,path:String.raw`C:\Synthetic\fixture.eprj2`,dataStr:"original-held-body"});
  const expected={projectUuid,branchUuid:"b".repeat(32),ticket:3,structureText:'{"saved":true}'}; f.runner.bindViaExpectedStructure(original.origin,expected);
  const before=f.resumes(); f.injectRequest("GET");await original.bindings.nextEvent(); const read=await original.bindings.observeRequest();await original.bindings.continueReadonlyRequest(read);assert.equal(f.resumes(),before+1);
  f.injectRequest("POST",false,0,"structure");await original.bindings.nextEvent();const request=await original.bindings.observeRequest();original.bindings.startStructure(request);
  const frame=async(role:CurrentPcbViaMainStructureFrameRole):Promise<string>=>{let callFrameId=`structure-frame-${role}`;if(role==="driver"){callFrameId="frame-driver";}else if(role==="driverCaller"){callFrameId="frame-caller";}return captureArrayId(await send("via-main-structure-frame",role,{callFrameId}));};
  const join=async(role: CurrentPcbViaMainStructureProgramRole,receiver:string,args:readonly string[]=[]):Promise<string>=>captureArrayId(await send("via-main-structure-join",role,{objectId:receiver,arguments:args.map(objectId=>({objectId}))}));
  const value=(role:string,receiver:string):Promise<unknown>=>send("via-main-structure-join",role,{objectId:receiver,arguments:[]});
  const step=(role:string):Promise<unknown>=>send("via-main-structure-step",role);
  const capture=async(role:CurrentPcbViaMainStructureFrameRole,program:CurrentPcbViaMainStructureProgramRole,args:readonly string[]):Promise<string>=>{let caller:CurrentPcbViaMainStructureFrameRole|undefined;if(role==="query"){caller="queryCaller";}else if(role==="run"){caller="runCaller";}f.injectStructurePoint(role,caller);await original.bindings.nextEvent();return join(program,await frame(role),args);};
  const remove=(role:string):Promise<unknown>=>send("via-main-structure-remove",role,{breakpointId:`structure-${role}`},true);
  await arm("context");const driver=await frame("driver");const caller=await frame("driverCaller");const invocation=await join("invocation",driver,[original.bindings.constructionObjectId,caller]);await step("driver");
  const context=await capture("context","context",[original.bindings.constructionObjectId]);await send("via-main-structure-join","contextJoin",{objectId:invocation,arguments:[{objectId:context}]});await remove("context");await step("context");
  f.injectStructurePoint("controller");await original.bindings.nextEvent();const controller=captureArrayId(await send("via-main-structure-join","controller",{objectId:await frame("controller"),arguments:[{objectId:context},{objectId:invocation},{value:expected}]}));await step("controller");
  f.injectStructurePoint("query","queryCaller");await original.bindings.nextEvent();const query=await join("query",await frame("query"),[controller,await frame("queryCaller")]);
  await send("via-main-structure-properties","query",{objectId:query});await send("via-main-structure-properties","promise",{objectId:"structure-db-promise"});await send("via-main-structure-join","connection",{objectId:query,arguments:[{objectId:"structure-yo"}]});await step("query");
  const selected=await capture("selected","selected",[query]);await value("selectedValue",selected);await step("selected");const update=await capture("update","update",[selected]);await value("rowsValue",update);await step("update");
  const exec=await capture("exec","exec",[update]);await step("exec");f.injectStructurePoint("run","runCaller");await original.bindings.nextEvent();const run=await join("run",await frame("run"),[await frame("runCaller"),exec,original.bindings.sqlCaptureObjectId]);await value("runValue",run);
  if(scenario==="sql-ack-lost"){f.loseNextDriverStep();const count=f.resumes();await assert.rejects(step("run"),/ack-lost/u);await assert.rejects(step("run"));assert.equal(f.resumes(),count);assert.equal(f.phases.filter(item=>item==="via-main-structure-step-run").length,1);assert.throws(()=>original.bindings.originalStructureEffects());return;}
  await step("run");
  if(scenario==="foreign-callback"){f.injectMutation();await original.bindings.nextEvent();const count=f.resumes();await assert.rejects(frame("callback"));assert.equal(f.resumes(),count);assert.throws(()=>original.bindings.originalStructureEffects());return;}
  const callback=await capture("callback","callback",[run]);await value("callbackValue",callback);await step("callback");
  const updateReturned=await capture("updateReturned","updateReturned",[exec]);await step("updateReturned");const service=await capture("serviceReturned","serviceReturned",[updateReturned]);await step("serviceReturned");const controllerReturned=await capture("controllerReturned","controllerReturned",[service]);await step("controllerReturned");
  const response=await capture("response","response",[controllerReturned]);await value("responseValue",response);const final=await join("finalSelect",response);await send("via-main-structure-properties","final",{objectId:final});await send("via-main-structure-properties","finalFunction",{objectId:"structure-final-function"});await send("via-main-structure-final-arm",null,{objectId:"structure-final-function"});await step("response");
  const entry=await capture("finalEntry","finalEntry",[final]);await arm("finalReturned");await arm("finalFailed");await step("finalEntry");
  if(scenario==="final-catch"){f.injectStructurePoint("finalFailed");await original.bindings.nextEvent();const count=f.resumes();await assert.rejects(frame("finalReturned"));assert.equal(f.resumes(),count);assert.throws(()=>original.bindings.originalStructureEffects());return;}
  const returned=await capture("finalReturned","finalReturned",[entry]);await value("finalValue",returned);for(const role of["finalEntry","finalReturned","finalFailed"]){await remove(role);}await step("finalReturned");
  const effects=original.bindings.originalStructureEffects();assert.equal(effects.originalResponseFinalizerReturned,true);assert.equal(effects.structureText,expected.structureText);assert.equal(effects.nativeChanges,1);assert.equal(f.phases.filter(item=>item==="via-main-structure-arm-callback").length,0);original.bindings.requireBeginArmed();
  for(const role of["controller","query","selected","update","exec","updateReturned","serviceReturned","controllerReturned","response"]){await remove(role);}await send("via-main-structure-release",null,{},true);
  f.injectRequest("GET");await original.bindings.nextEvent();const after=await original.bindings.observeRequest();await original.bindings.continueReadonlyRequest(after);assert.equal(original.bindings.originalStructureEffects(),effects);assert.equal(f.phases.includes("via-main-structure-remove-callback"),false);
}); }

void test("stock V2 runner joins initial4/later3 pauses through332 calls and the original JL return before registration", async () => {
  const f = await fixture(0, null, false, null, [], undefined, "complete"); await f.runner.observe();
  const state = f.runner.startupLibraryState(); assert.equal(state["originalNormalReturnProven"], true); assert.equal(state["requests"], 2002);
  assert.equal(f.phases.filter(phase => phase === "sql-stock-v2-caller").length, 332); assert.equal(f.phases.filter(phase => phase === "sql-stock-v2-resume").length, 333);
  assert.equal(f.phases.includes("sql-stock-resume"), false); assert.equal(f.runner.retainedStartupLibraryRefusalContext(), null);
  const requestsBefore = f.phases.length; const cursor = f.runner.issueForwardMainCursor();
  assert.equal(cursor.profile, "private.current-footprint-forward-main-cursor.v1"); assert.equal(cursor.executionAuthorized, false);
  assert.equal(f.runner.issueForwardMainCursor(), cursor); assert.equal(f.phases.length, requestsBefore);
  await assert.rejects(f.runner.release(), /SELECTED_SQL_RETAIN_THROUGH_EXIT/u);
});
void test("stock V2 runner holds foreign continuation lineage with zero additional refusal requests and denies early registration", async () => {
  const f = await fixture(0, null, false, null, [], undefined, "lineage"); await assert.rejects(f.runner.observe(), /STOCK_ORIGINAL_LINEAGE/u);
  const packet = f.runner.retainedStartupLibraryRefusalContext(); assert.ok(packet !== null); assert.equal(packet.progress.scriptCallsConsumed, 1); assert.equal(packet.stockRequests, 10); assert.equal(packet.callFrames.totalFrames, 4);
  assert.equal(packet.additionalRequests, 0); assert.equal(packet.resumeAuthorized, false); assert.equal(f.phases.filter(phase => phase === "sql-stock-v2-select").length, 1);
  const early = await fixture(0, null, false, null, [], undefined, "early-registration"); await assert.rejects(early.runner.observe(), /STOCK_REGISTRATION_BEFORE_NORMAL_RETURN/u);
  assert.equal(early.runner.startupLibraryState()["originalNormalReturnProven"], false); assert.equal(early.phases.includes("sql-stock-v2-return"), false);
});

void test("pending original stock retains its cursor through source-profile cookie cleanup and an original config read", async () => {
  const f = await fixture(0, null, false, null, [], undefined, "interleave"); await f.runner.observe();
  const first = f.phases.indexOf("sql-stock-v2-resume"), second = f.phases.indexOf("sql-stock-v2-raw", first);
  const interleave = f.phases.slice(first + 1, second);
  assert.equal(interleave.filter(phase => phase === "sql-fence-startup-select").length, 3);
  assert.equal(interleave.filter(phase => phase === "sql-fence-startup-read-owner").length, 1);
  assert.equal(interleave.filter(phase => phase === "sql-fence-startup-config-resume").length, 4);
  assert.equal(interleave.some(phase => phase.startsWith("sql-stock-")), false);
  assert.equal(interleave.length, 19);
  assert.equal(f.runner.startupLibraryState()["requests"], 2002);
  assert.equal(f.runner.startupLibraryState()["originalNormalReturnProven"], true);
  const refused = await fixture(0, null, false, null, [], undefined, "interleave-refused"); await assert.rejects(refused.runner.observe());
  assert.equal(refused.runner.startupLibraryState()["requests"], 10);
  assert.equal(refused.phases.filter(phase => phase === "sql-fence-startup-config-resume").length, 1);
  assert.equal(refused.phases.at(-1), "sql-fence-startup-read-owner");
});

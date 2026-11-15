/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- Held main-thread Inspector callbacks require retained reentrant failure delivery. */
/** Inspector observes the main-thread source fixture only. */
import { CurrentSchematicWireWorkerPendingCursor } from "../../src/current-schematic-wire-worker-pending-cursor.ts";
import type { CurrentSchematicWireWorkerPendingData } from "../../src/current-schematic-wire-worker-pending-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_WORKER_PENDING_POINTS as WORKER_POINTS, decodeCurrentSchematicWireWorkerPendingPause as workerPause } from "../../src/current-schematic-wire-worker-pending-source.ts";
import { Session } from "node:inspector/promises";
import { CURRENT_SCHEMATIC_WIRE_PUBLICATION_OBJECT_GROUP } from "../../src/current-schematic-wire-publication-values.ts";
import { parentPort, workerData } from "node:worker_threads";
import { z } from "zod";
import { CurrentSchematicWireCmPublicationCursor } from "../../src/current-schematic-wire-cm-publication-cursor.ts";
import type { CurrentSchematicWireCmPublicationData } from "../../src/current-schematic-wire-cm-publication-cursor.ts";
import { decodeCurrentSchematicWireCmPublicationPause as cmPause } from "../../src/current-schematic-wire-cm-publication-source.ts";
import { CurrentSchematicWirePendingBatchCursor } from "../../src/current-schematic-wire-pending-batch-cursor.ts";
import type { CurrentSchematicWirePendingBatchData } from "../../src/current-schematic-wire-pending-batch-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_POINTS as POINTS, CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_SOURCE as SOURCE, decodeCurrentSchematicWirePendingBatchPayloadPause as payloadPause } from "../../src/current-schematic-wire-pending-batch-source.ts";

const port = parentPort ?? (() : never => { throw new Error("worker port"); })(); port.on("message", () => {
  // Keep the original Inspector worker alive while its main-thread frame is held.
});
const config = z.strictObject({ workerKey:z.string(),workerScriptId:z.string(),baseline:z.unknown(),key: z.string(), scriptId: z.string(), variant: z.union([z.literal(0), z.literal(1)]), expected: z.unknown(), dataBusSite: z.strictObject({ scriptId: z.string(), lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }) }).parse(workerData);
const session = new Session(); session.connectToMainThread(); const breakpoints: string[] = []; const stages: number[] = []; let cmData: CurrentSchematicWireCmPublicationData | null = null; let phase = 0; let data: CurrentSchematicWirePendingBatchData | null = null; let holder = ""; let native = ""; let reads = 0; let helpers = 0; let pauses = 0; let resumes = 0; let stopped = false; let observing = false; let activeHelper: string | null = null; const helperScripts = new Set<string>(); const expectedScripts: string[] = [];
session.on("Debugger.scriptParsed", event => { if (observing && event.params.url === "" && activeHelper !== null && event.params.length === activeHelper.length + 2) { helperScripts.add(event.params.scriptId); } });
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
async function post(method: string, params: unknown): Promise<unknown> { if (method === "Runtime.callFunctionOn" && params !== null && typeof params === "object") { const fn: unknown = Reflect.get(params, "functionDeclaration"); need(typeof fn === "string", "helper source"); expectedScripts.push(`(${  fn  })`); activeHelper = fn; } const pending: unknown = Reflect.apply(session.post.bind(session), session, [method, params]); const value: unknown = await pending; activeHelper = null; if (value !== null && typeof value === "object" && "exceptionDetails" in value) { const details: unknown = Reflect.get(value, "exceptionDetails"); const exception: unknown = details !== null && typeof details === "object" ? Reflect.get(details, "exception") : null; const message: unknown = exception !== null && typeof exception === "object" ? Reflect.get(exception, "value") : null; if (typeof message === "string" && /^SCH209_WIRE_(?:PENDING_BATCH|CM_PUBLICATION|WORKER_PENDING)$/u.test(message)) { throw new Error(message); } throw new Error("unexpected fixed helper exception"); } return value; }
async function run(cursor: CurrentSchematicWirePendingBatchCursor): Promise<CurrentSchematicWirePendingBatchData> {
  const start = reads;
  for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); if (command.method === "Runtime.callFunctionOn") { helpers += 1; } reads += 1; cursor.accept(command, await post(command.method, command.params)); }
  stages.push(reads - start); return cursor.requireCompleted();
}
async function runCm(cursor: CurrentSchematicWireCmPublicationCursor): Promise<CurrentSchematicWireCmPublicationData> {
  const start = reads;
  for (let command = cursor.next(); command !== null; command = cursor.next()) { cursor.reserve(command); if (command.method === "Runtime.callFunctionOn") { helpers += 1; } reads += 1; cursor.accept(command, await post(command.method, command.params)); }
  stages.push(reads - start); return cursor.requireCompleted();
}
let nodeData:CurrentSchematicWireWorkerPendingData|null=null;let workerNative="";let nodeStarted=false;const nodeStages:number[]=[];
async function runNode(cursor:CurrentSchematicWireWorkerPendingCursor):Promise<CurrentSchematicWireWorkerPendingData>{const start=reads;for(let command=cursor.next();command!==null;command=cursor.next()){cursor.reserve(command);if(command.method==="Runtime.callFunctionOn"){helpers += 1;}reads += 1;cursor.accept(command,await post(command.method,command.params));}nodeStages.push(reads-start);return cursor.requireCompleted();}
const removals = new Set<string>(); let releaseStarted = false;
async function remove(): Promise<void> { for (const breakpointId of breakpoints) { if (!removals.has(breakpointId)) { removals.add(breakpointId); await session.post("Debugger.removeBreakpoint", { breakpointId }); } } }
async function release(): Promise<void> { need(!releaseStarted, "publication cleanup replay"); releaseStarted = true; z.strictObject({}).parse(await post("Runtime.releaseObjectGroup", { objectGroup: CURRENT_SCHEMATIC_WIRE_PUBLICATION_OBJECT_GROUP })); }
async function fail(error: unknown): Promise<void> { if (stopped) { return; } stopped = true; try { await remove(); if (!releaseStarted) { await release(); } if(nodeStarted){await post("Runtime.releaseObjectGroup",{objectGroup:"easyeda-schematic-wire-worker-pending-v1"});} await session.post("Debugger.resume"); } catch {
  // The inert source fixture may already have returned during failure cleanup.
} port.postMessage({ error: error instanceof Error ? error.message : String(error), reads, stages, nodeStages, pauses, resumes, helpers }); session.disconnect(); port.close(); }
session.on("Debugger.paused", event => { void (async (): Promise<void> => {
  if (stopped) { return; } if(phase>=6){
 const stage=phase===6?"entry":"returned";pauses += 1;const breakpoint=breakpoints[phase===6?4:5];need(breakpoint!==undefined,"worker original point");const held=workerPause(event.params,stage,config.workerScriptId,breakpoint);let foreign=false;try{workerPause(event.params,stage,config.workerScriptId,"foreign-point");}catch{foreign=true;}need(foreign,"foreign worker point accepted");
 if(stage==="entry"){need(data!==null,"original settled renderer packet");const baseline=z.array(z.strictObject({page:z.string(),id:z.string(),type:z.enum(["META","WIRE","LINE","ATTR","BUS","BUSLINE","TEXT"]),body:z.string(),client:z.string(),ticket:z.number().int().positive()})).length(8).parse(config.baseline);
 let copied=false;try{const candidate=new CurrentSchematicWireWorkerPendingCursor({stage:"before",frame:held.frame,native:workerNative,projectUuid:"inert-project",baseline,renderer:structuredClone(data)});candidate.next();}catch{copied=true;}need(copied,"copied renderer packet accepted");
 nodeData=await runNode(new CurrentSchematicWireWorkerPendingCursor({stage:"before",frame:held.frame,native:workerNative,projectUuid:"inert-project",baseline,renderer:data}));}
 else{need(nodeData!==null,"original worker baseline packet");await session.post("Runtime.evaluate",{expression:`globalThis.${config.workerKey}.afterHeld()`});const before=nodeData;let copied=false;try{const candidate=new CurrentSchematicWireWorkerPendingCursor({stage:"after",frame:held.frame,previous:structuredClone(before)});candidate.next();}catch{copied=true;}need(copied,"copied worker baseline accepted");nodeData=await runNode(new CurrentSchematicWireWorkerPendingCursor({stage:"after",frame:held.frame,previous:before}));let replay=false;try{const candidate=new CurrentSchematicWireWorkerPendingCursor({stage:"after",frame:held.frame,previous:before});candidate.next();}catch{replay=true;}need(replay,"worker baseline replayed");}
 phase += 1;await session.post("Debugger.resume");resumes += 1;
 if(stage==="returned"){const actualScripts:string[]=[];for(const scriptId of helperScripts){const source=await session.post("Debugger.getScriptSource",{scriptId});actualScripts.push(source.scriptSource);}need(helperScripts.size===13&&JSON.stringify(actualScripts.toSorted())===JSON.stringify(expectedScripts.toSorted()),"worker helper sources");await remove();await post("Runtime.releaseObjectGroup",{objectGroup:"easyeda-schematic-wire-worker-pending-v1"});stopped=true;port.postMessage({reads,nodeStages,helpers,pauses,resumes,pending:nodeData?.threePendingHeadsCompared,orderPreserved:nodeData?.priorHeadsAndOrderNumbersPreservedCompared,workerCompleted:nodeData?.workerCompleted,saveAuthorized:nodeData?.saveAuthorized});session.disconnect();port.close();}
 return;
} const current = phase; pauses += 1; const top = event.params.callFrames[0]; const ids = event.params.hitBreakpoints ?? []; const slot = current < 3 ? 0 : current - 2; need(top !== undefined && ids.length === 1 && ids[0] === breakpoints[slot], "unexpected held batch event");
  need(top.location.scriptId === config.scriptId && top.functionLocation?.scriptId === config.scriptId, "batch source script");
  if (current < 3) {
    const breakpoint = breakpoints[0]; need(breakpoint !== undefined, "original CM breakpoint"); const held = cmPause(event.params, config.variant, config.scriptId, breakpoint);
    let foreign = false; try { cmPause(event.params, config.variant, config.scriptId, "foreign-breakpoint"); } catch { foreign = true; } need(foreign, "foreign CM pause accepted");
    const schema = z.tuple([z.strictObject({ id: z.string(), type: z.literal("WIRE"), body: z.string() }), z.strictObject({ id: z.string(), type: z.literal("LINE"), body: z.string() }), z.strictObject({ id: z.string(), type: z.literal("ATTR"), body: z.string() })]);
    if (current === 0) { cmData = await runCm(new CurrentSchematicWireCmPublicationCursor({ ordinal: 1, frame: top.callFrameId, publisherFrame: held.publisherFrame, holder, native, expected: schema.parse(config.expected) })); }
    else { need(cmData !== null, "previous original CM packet"); cmData = await runCm(new CurrentSchematicWireCmPublicationCursor({ ordinal: current === 1 ? 2 : 3, frame: top.callFrameId, publisherFrame: held.publisherFrame, previous: cmData })); }
    need(cmData !== null, "completed CM packet"); let copied = false; try { const candidate = cmData.ordinal < 3 ? new CurrentSchematicWireCmPublicationCursor({ ordinal: cmData.ordinal === 1 ? 2 : 3, frame: top.callFrameId, publisherFrame: held.publisherFrame, previous: structuredClone(cmData) }) : new CurrentSchematicWirePendingBatchCursor({ stage: "payload", frame: top.callFrameId, timerFrame: top.callFrameId, previous: structuredClone(cmData) }); candidate.next(); } catch { copied = true; } need(copied, "copied CM packet accepted");
  } else if (current === 3) {
    need(cmData !== null, "original third CM packet"); const breakpoint = breakpoints[1]; need(breakpoint !== undefined, "original dataBus breakpoint"); const held = payloadPause(event.params, config.variant, config.scriptId, breakpoint, config.dataBusSite); data = await run(new CurrentSchematicWirePendingBatchCursor({ stage: "payload", frame: held.frame, timerFrame: held.timerFrame, previous: cmData })); let replay = false; try { const candidate = new CurrentSchematicWirePendingBatchCursor({ stage: "payload", frame: top.callFrameId, timerFrame: top.callFrameId, previous: cmData }); candidate.next(); } catch { replay = true; } need(replay, "third CM packet replayed");
  } else {
    const role = current === 4 ? "publisherReturned" : "timerReturned"; const point = POINTS[config.variant][role]; const fn = SOURCE[config.variant].roles[current === 4 ? "publishPendData" : "timerCallback"];
    need(top.location.lineNumber === point.lineNumber && top.location.columnNumber === point.columnNumber && top.functionLocation.lineNumber === fn.lineNumber && top.functionLocation.columnNumber === fn.columnNumber && top.returnValue?.type === "undefined" && top.returnValue.value === undefined && top.returnValue.objectId === undefined, "batch normal return");
    need(data !== null, "original batch packet"); data = await run(new CurrentSchematicWirePendingBatchCursor({ stage: current === 4 ? "publisherReturned" : "timerReturned", frame: top.callFrameId, previous: data }));
  }
  phase += 1; await session.post("Debugger.resume"); resumes += 1;
  if (current === 5) {
    need(data !== null, "batch timer packet"); const originalTimer = data; data = await run(new CurrentSchematicWirePendingBatchCursor({ stage: "settled", previous: originalTimer })); let replay = false; try { const candidate = new CurrentSchematicWirePendingBatchCursor({ stage: "settled", previous: originalTimer }); candidate.next(); } catch { replay = true; } need(replay, "original timer packet replayed");
    const actualScripts: string[] = []; for (const scriptId of helperScripts) { const source = await session.post("Debugger.getScriptSource", { scriptId }); actualScripts.push(source.scriptSource); }
    need(helperScripts.size === 17 && JSON.stringify(actualScripts.toSorted()) === JSON.stringify(expectedScripts.toSorted()), `batch helper sources ${  JSON.stringify({ count: helperScripts.size, actual: actualScripts.map(value => value.length), expected: expectedScripts.map(value => value.length) })}`);
    await remove();await release();nodeStarted=true;reads=0;helpers=0;helperScripts.clear();expectedScripts.length=0;
for(const name of ["native","orderSetter"]){const result=await session.post("Runtime.evaluate",{expression:`globalThis.${config.workerKey}.${name}`});need(result.result.objectId!==undefined,"worker original fixture binding");if(name==="native"){workerNative=result.result.objectId;}else{const armed=z.strictObject({breakpointId:z.string()}).parse(await post("Debugger.setBreakpointOnFunctionCall",{objectId:result.result.objectId}));breakpoints.push(armed.breakpointId);}}
const orderPoint=breakpoints.pop();need(orderPoint!==undefined,"original order function breakpoint");
for(const point of [WORKER_POINTS.entry,WORKER_POINTS.returned]){const armed=await session.post("Debugger.setBreakpoint",{location:{scriptId:config.workerScriptId,...point}});need(armed.actualLocation.lineNumber===point.lineNumber&&armed.actualLocation.columnNumber===point.columnNumber,"worker exact location");breakpoints.push(armed.breakpointId);}breakpoints.push(orderPoint);
port.postMessage({workerReady:true});
  }
})().catch(fail); });
async function initialize(): Promise<void> {
await session.post("Debugger.enable"); observing = true;
for (const name of ["holder", "native", "cm.publishChange", "dataBus.publish"]) { const result = await session.post("Runtime.evaluate", { expression: `globalThis.${  config.key  }.${  name}` }); need(result.result.objectId !== undefined, "original fixture reference"); if (name === "holder") { holder = result.result.objectId; } else if (name === "native") { native = result.result.objectId; } else { const point = z.strictObject({ breakpointId: z.string() }).parse(await post("Debugger.setBreakpointOnFunctionCall", { objectId: result.result.objectId })); breakpoints.push(point.breakpointId); } }
for (const role of ["publisherReturned", "timerReturned"] as const) { const point = await session.post("Debugger.setBreakpoint", { location: { scriptId: config.scriptId, ...POINTS[config.variant][role] } }); breakpoints.push(point.breakpointId); }
port.postMessage({ ready: true });

}
void initialize().catch(fail);

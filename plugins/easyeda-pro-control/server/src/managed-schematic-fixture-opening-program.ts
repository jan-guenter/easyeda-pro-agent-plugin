/* oxlint-disable import/max-dependencies -- Fixed programs compose existing source-qualified registration/project/page leaves and the independent guarded schematic readers. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "./current-pcb-diagnostic-opening.ts";
import { buildCurrentProjectUrlGuard } from "./current-project-url.ts";
import { buildCurrentSchematicPageOpeningProgram } from "./current-schematic-page-opening-program.ts";
import { currentSchematicPageOpeningResultSchema } from "./current-schematic-page-opening.ts";
import { buildCurrentSchematicPageReadProgram } from "./current-schematic-page-read-program.ts";
import { validateCurrentSchematicPageReadResult } from "./current-schematic-page-read.ts";
import { GENERATED_FIXTURE_REGISTRATION_FUNCTION, generatedFixtureRegistrationResultSchema } from "./managed-fixture-registration-program.ts";
import { assertOriginalGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";
import { generatedSchematicTargetSchema } from "./managed-schematic-fixture-opening.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";

const MAX = 65_536;
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_SCHEMATIC_PROGRAM_REFUSED"); } }
function one(source: string, before: string, after: string): string { need(source.split(before).length === 2); return source.replace(before, after); }
function registrationFunction(): string {
  let source = GENERATED_FIXTURE_REGISTRATION_FUNCTION.replaceAll("documentUuid", "pageUuid");
  source = one(source, "Reflect.ownKeys(target).length!==5", "Reflect.ownKeys(target).length!==6");
  source = one(source, "'branchUuid','pageUuid','expectedSourceSha256'", "'branchUuid','pageUuid','schematicUuid','expectedSourceSha256'");
  source = one(source, "!/^[a-f0-9]{32}$/.test(target.pageUuid)", "!/^[a-f0-9]{32}$/.test(target.pageUuid)||!/^[a-f0-9]{32}$/.test(target.schematicUuid)");
  return one(source, "(?:via_only|line_and_via|arc_line_and_via)", "schematic");
}
function projectFunction(): string {
  let source = CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION.replaceAll("documentUuid", "pageUuid");
  source = one(source, '"branchUuid","pageUuid","expectedSourceSha256"', '"branchUuid","pageUuid","schematicUuid","expectedSourceSha256"');
  source = one(source, '!matches(target.pageUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)', '!matches(target.pageUuid,/^[a-f0-9]{32}$/)||!matches(target.schematicUuid,/^[a-f0-9]{32}$/)');
  return one(source, 'schema:"easyeda-pro-control.pcb-diagnostic-opening.v1"', 'schema:"easyeda-pro-control.generated-schematic-project-opening.v1"');
}
const registration = registrationFunction(); const projectOpening = projectFunction();
const opaque = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/u); const hex = z.string().regex(/^[a-f0-9]{64}$/u); const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const failure = z.strictObject({ stage: z.string().min(1).max(64), code: z.string().min(1).max(64), substage: z.string().min(1).max(64).optional() });
const observedTab = z.string().min(1).max(128), observedTitle = z.string().min(1).max(512);
const projectObservationSchema = z.strictObject({ projectPresent: z.boolean(), branchUuid: uuid.nullable(), windowTabId: opaque, containerCount: z.number().int().min(1).max(128),
  tabIds: z.array(observedTab).max(256), activeTabId: z.string().max(128), initialTitle: observedTitle, expectedOpenedTitle: observedTitle, documentTitle: observedTitle });
const projectResultSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.generated-schematic-project-opening.v1"), phase: z.enum(["preflight", "open-project"]),
  projectUuid: hex, branchUuid: uuid, pageUuid: uuid, ok: z.boolean(), status: z.enum(["ready", "opened-prefix-observed", "refused"]), failure: failure.nullable(), cleanupFailure: failure.nullable().optional(),
  dispatchAttempted: z.boolean(), publicResult: z.boolean().nullable(), prefixObserved: z.boolean(), nativeWorkMayRemain: z.boolean(), observation: projectObservationSchema.nullable(),
});
const nativeEnvelopeSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.exact-json.v1"), utf8Bytes: z.number().int().nonnegative(), json: z.string().max(MAX) });

export const generatedSchematicIdentitySchema = z.strictObject({ schema: z.literal("easyeda-pro-control.generated-schematic-page-identity.v1"),
  projectUuid: hex, branchUuid: uuid, schematicUuid: uuid, pageUuid: uuid, tabId: z.string().min(97).max(97), windowTabId: opaque,
  samples: z.literal(2), originalPageRechecked: z.literal(true), nativePageReadinessObserved: z.literal(true), persistenceVerified: z.literal(false), connectivityVerified: z.literal(false) });
const readersEnvelopeSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.generated-schematic-readers.v1"), identity: generatedSchematicIdentitySchema,
  values: z.array(nativeEnvelopeSchema).length(3) });

const stages = ["registration", "project-preflight", "project-open", "page-preflight", "page-open", "page-identity"] as const;
export const generatedSchematicNavigationResultSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.generated-schematic-navigation.v1"), target: generatedSchematicTargetSchema,
  state: z.literal("settled"), outcome: z.enum(["opened-ready", "partial-or-refused"]), attempted: z.array(z.enum(stages)).min(1).max(6), failedStage: z.enum(stages).nullable(),
  registration: generatedFixtureRegistrationResultSchema.nullable(), projectPreflight: projectResultSchema.nullable(), project: projectResultSchema.nullable(),
  pagePreflight: currentSchematicPageOpeningResultSchema.nullable(), page: currentSchematicPageOpeningResultSchema.nullable(), identity: generatedSchematicIdentitySchema.nullable(),
  originalContextIntact: z.boolean(), replayAllowed: z.literal(false), persistentRegistrationVerified: z.literal(false), completeSourceVerified: z.literal(false), persistenceVerified: z.literal(false),
  connectivityVerified: z.literal(false), executionAuthorized: z.literal(false), explicitSaveDispatched: z.literal(false) });

function pageTarget(qualified: QualifiedGeneratedSchematicFixtureTarget): Readonly<{ rawWindowsPath: string; projectUuid: string; branchUuid: string; documentUuid: string; schematicUuid: string; expectedSourceSha256: string }> {
  assertOriginalGeneratedSchematicFixtureTarget(qualified); const target = qualified.target;
  return { rawWindowsPath: target.rawWindowsPath, projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.pageUuid, schematicUuid: target.schematicUuid, expectedSourceSha256: target.expectedSourceSha256 };
}
/** Independent parent/page identity and readiness sample after awaited opening.
 * It calls no family getter, source serializer, compiler, navigation or writer. */
function identityProgram(target: QualifiedGeneratedSchematicFixtureTarget["target"], expectedWindowTabId?: string): string {
  return `const target=${JSON.stringify(target)},root=globalThis,bad=()=>{throw new Error('GENERATED_SCHEMATIC_PAGE_IDENTITY');};
${buildCurrentProjectUrlGuard()}
const ui=root.UI,sch=root.SCH,host=root.gVars,metadata=host?.currentProject,tabs=ui?.tabBar,manager=sch?.docMemoryManager;
const active=manager?.getActiveDoc,activeTab=tabs?.getActiveTab,getTab=tabs?.getTabById,doc=root.document,href=root.location?.href,windowTabId=root._TAB_ID_;
if(${JSON.stringify(expectedWindowTabId ?? null)}!==null&&windowTabId!==${JSON.stringify(expectedWindowTabId ?? null)})bad();
if(typeof active!=='function'||typeof activeTab!=='function'||typeof getTab!=='function'||typeof windowTabId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(windowTabId))bad();
const tabId=target.pageUuid+'@'+target.projectUuid,page=Reflect.apply(active,manager,[]),tab=Reflect.apply(getTab,tabs,[tabId]),project=page?.projectMgr,consistency=page?.consistencyImpl,handler=consistency?.decodeAndRealTimeSyncHandler;
const check=()=>{if(root.window!==root||root.top!==root||root.document!==doc||doc?.defaultView!==root||doc?.nodeType!==9||doc?.URL!==href||root.location?.href!==href||root.location?.origin!=='https://client'||root._TAB_ID_!==windowTabId||parseProjectUrl(href,target.projectUuid,tabId).empty)bad();
if(root.UI!==ui||root.SCH!==sch||root.gVars!==host||ui.gVars!==host||host.currentProject!==metadata||metadata.projectId!==target.projectUuid||metadata.branchUuid!==target.branchUuid||metadata.isV2Format!==false||host.isHistoryMode!==false||ui.tabBar!==tabs||tabs.getActiveTab!==activeTab||tabs.getTabById!==getTab||Reflect.apply(activeTab,tabs,[])!==tabId||Reflect.apply(getTab,tabs,[tabId])!==tab||tab?.tabId!==tabId||tab.data?.doctype!==1||tab.data?.pid!==target.projectUuid||tab.parentLibraryUuid!==undefined)bad();
if(sch.docMemoryManager!==manager||manager.getActiveDoc!==active||Reflect.apply(active,manager,[])!==page||page?.uuid!==target.pageUuid||page.project_uuid!==target.projectUuid||page.tabId!==tabId||page.docType!==1||page.schematicUuid!==target.schematicUuid||page.isSchSheetDoc?.()!==true||page.isBlockSymbolInstancePage!==false||page.source!==''||page.projectMgr!==project||project?.uuid!==target.projectUuid||page.consistencyImpl!==consistency||consistency?.decodeAndRealTimeSyncHandler!==handler||consistency.handler!==handler||handler?.docManager!==page||handler.consistencyImpl!==consistency||consistency.state!=='initialized'||page.shapeManager?.actionRunner?.running!==false)bad();};
check();check();return {schema:'easyeda-pro-control.generated-schematic-page-identity.v1',projectUuid:target.projectUuid,branchUuid:target.branchUuid,schematicUuid:target.schematicUuid,pageUuid:target.pageUuid,tabId,windowTabId,samples:2,originalPageRechecked:true,nativePageReadinessObserved:true,persistenceVerified:false,connectivityVerified:false};`;
}
export function buildGeneratedSchematicNavigationProgram(qualified: QualifiedGeneratedSchematicFixtureTarget): string {
  const target = generatedSchematicTargetSchema.parse(qualified.target); assertOriginalGeneratedSchematicFixtureTarget(qualified);
  const page = pageTarget(qualified); const marker = "SCH_GENERATED_ORIGINAL_WINDOW"; const literal = JSON.stringify(marker);
  const open = buildCurrentSchematicPageOpeningProgram(page, "open", marker); need(open.split(literal).length === 3);
  const pageOpen = one(open.replaceAll(literal, "expectedWindowTabId"), ',phase="open",root=globalThis', ",root=globalThis");
  const code = `const target=${JSON.stringify(target)},root=globalThis,ui=root.UI,host=root.gVars,document=root.document,windowTabId=root._TAB_ID_;let loaded;
const bad=()=>{throw new Error('GENERATED_SCHEMATIC_NAVIGATION');};const current=()=>{if(globalThis!==root||root.UI!==ui||root.gVars!==host||root.document!==document||root._TAB_ID_!==windowTabId||loaded!==undefined&&host.currentProject!==loaded)bad();};
const decode=envelope=>{if(!envelope||envelope.schema!=='easyeda-pro-control.exact-json.v1'||typeof envelope.json!=='string'||new TextEncoder().encode(envelope.json).byteLength!==envelope.utf8Bytes||envelope.utf8Bytes>49152)bad();return JSON.parse(envelope.json);};
const state={schema:'easyeda-pro-control.generated-schematic-navigation.v1',target,state:'settled',outcome:'partial-or-refused',attempted:[],failedStage:null,registration:null,projectPreflight:null,project:null,pagePreflight:null,page:null,identity:null,originalContextIntact:true,replayAllowed:false,persistentRegistrationVerified:false,completeSourceVerified:false,persistenceVerified:false,connectivityVerified:false,executionAuthorized:false,explicitSaveDispatched:false};
const attempt=stage=>{current();state.attempted.push(stage);state.failedStage=stage;};
const projectOpen=${projectOpening},pageOpen=async(phase,expectedWindowTabId)=>{${pageOpen}};
try{attempt('registration');state.registration=JSON.parse(await (${registration})(target));current();
attempt('project-preflight');state.projectPreflight=JSON.parse(await projectOpen(target,'preflight'));current();if(!state.projectPreflight.ok)bad();
attempt('project-open');state.project=JSON.parse(await projectOpen(target,'open-project'));current();if(!state.project.ok||state.project.status!=='opened-prefix-observed')bad();loaded=host.currentProject;
attempt('page-preflight');state.pagePreflight=decode(await pageOpen('preflight',null));current();
attempt('page-open');state.page=decode(await pageOpen('open',state.pagePreflight.windowTabId));current();
attempt('page-identity');state.identity=await(async()=>{${identityProgram(target)}})();current();state.outcome='opened-ready';state.failedStage=null;
}catch{try{current();}catch{state.originalContextIntact=false;}}const json=JSON.stringify(state),utf8Bytes=new TextEncoder().encode(json).byteLength;if(utf8Bytes>${MAX})bad();return {schema:'easyeda-pro-control.exact-json.v1',utf8Bytes,json};`;
  need(Buffer.byteLength(code) <= MAX); return code;
}
export function validateGeneratedSchematicNavigation(value: unknown, qualified: QualifiedGeneratedSchematicFixtureTarget): z.infer<typeof generatedSchematicNavigationResultSchema> {
  assertOriginalGeneratedSchematicFixtureTarget(qualified); const result = generatedSchematicNavigationResultSchema.parse(value), target = qualified.target;
  need(canonicalJson(result.target) === canonicalJson(target) && canonicalJson(result.attempted) === canonicalJson(stages.slice(0, result.attempted.length)));
  need((result.outcome === "opened-ready") === (result.identity !== null && result.failedStage === null) && (result.failedStage === null || result.failedStage === result.attempted.at(-1)));
  const leaves = [result.registration, result.projectPreflight, result.project, result.pagePreflight, result.page, result.identity];
  const passed = [result.registration !== null, result.projectPreflight?.ok === true && result.projectPreflight.status === "ready" && !result.projectPreflight.dispatchAttempted,
    result.project?.ok === true && result.project.status === "opened-prefix-observed" && result.project.dispatchAttempted && result.project.publicResult === true && result.project.prefixObserved,
    result.pagePreflight !== null, result.page !== null, result.identity !== null];
  for (const [index, leaf] of leaves.entries()) { need(index < result.attempted.length || leaf === null); if (index < result.attempted.length - 1) { need(passed[index] === true); } }
  if (result.outcome === "opened-ready") { need(result.originalContextIntact && result.attempted.length === stages.length && passed.every(Boolean)); }
  else { need(result.failedStage !== null); }
  if (result.registration !== null) { need(result.registration.projectUuid === target.projectUuid && result.registration.rawWindowsPath === target.rawWindowsPath); }
  for (const [receipt, phase] of [[result.projectPreflight, "preflight"], [result.project, "open-project"]] as const) {
    if (receipt !== null) { need(receipt.phase === phase && receipt.projectUuid === target.projectUuid && receipt.branchUuid === target.branchUuid && receipt.pageUuid === target.pageUuid && receipt.ok === (receipt.failure === null) && receipt.nativeWorkMayRemain === receipt.dispatchAttempted); }
  }
  for (const [receipt, phase] of [[result.pagePreflight, "preflight"], [result.page, "open"]] as const) {
    if (receipt !== null) { need(receipt.phase === phase && receipt.projectUuid === target.projectUuid && receipt.branchUuid === target.branchUuid && receipt.documentUuid === target.pageUuid && receipt.schematicUuid === target.schematicUuid); }
  }
  if (result.projectPreflight?.ok === true && result.project?.ok === true) { need(result.projectPreflight.observation !== null && result.project.observation !== null && result.projectPreflight.observation.windowTabId === result.project.observation.windowTabId); }
  if (result.pagePreflight !== null) { need(result.project?.observation !== null && result.project?.observation !== undefined && result.pagePreflight.windowTabId === result.project.observation.windowTabId); }
  if (result.page !== null) { need(result.pagePreflight !== null && result.page.windowTabId === result.pagePreflight.windowTabId); }
  if (result.identity !== null) { need(result.page !== null && result.identity.projectUuid === target.projectUuid && result.identity.branchUuid === target.branchUuid && result.identity.pageUuid === target.pageUuid && result.identity.schematicUuid === target.schematicUuid && result.identity.tabId === `${target.pageUuid}@${target.projectUuid}` && result.identity.windowTabId === result.page.windowTabId); }
  return result;
}
function requests(qualified: QualifiedGeneratedSchematicFixtureTarget): readonly ReturnType<typeof pageReadRequest>[] {
  return ["eda.sch_PrimitiveText.getAll", "eda.sch_PrimitiveWire.getAll", "eda.sch_PrimitiveBus.getAll"].map(method => pageReadRequest(qualified, method));
}
function pageReadRequest(qualified: QualifiedGeneratedSchematicFixtureTarget, method: string): { target: { projectUuid: string; branchUuid: string; schematicUuid: string; documentUuid: string; tabId: string }; operation: { method: string; arguments: Record<string, never> } } {
  assertOriginalGeneratedSchematicFixtureTarget(qualified); const target = qualified.target;
  return { target: { projectUuid: target.projectUuid, branchUuid: target.branchUuid, schematicUuid: target.schematicUuid, documentUuid: target.pageUuid, tabId: `${target.pageUuid}@${target.projectUuid}` }, operation: { method, arguments: {} } };
}
export function buildGeneratedSchematicReadersProgram(qualified: QualifiedGeneratedSchematicFixtureTarget, expectedWindowTabId: string): string {
  opaque.parse(expectedWindowTabId);
  const batch = requests(qualified), target = qualified.target;
  const code = `const identity=await(async()=>{${identityProgram(target, expectedWindowTabId)}})();const values=[];
${batch.map(request => `values.push(await(async()=>{${buildCurrentSchematicPageReadProgram(request)}})());`).join("\n")}
const after=await(async()=>{${identityProgram(target, expectedWindowTabId)}})();if(JSON.stringify(identity)!==JSON.stringify(after))throw new Error('GENERATED_SCHEMATIC_READ_IDENTITY_CHANGED');
const json=JSON.stringify({schema:'easyeda-pro-control.generated-schematic-readers.v1',identity,values}),utf8Bytes=new TextEncoder().encode(json).byteLength;if(utf8Bytes>${MAX})throw new Error('GENERATED_SCHEMATIC_READ_BOUND');return {schema:'easyeda-pro-control.exact-json.v1',utf8Bytes,json};`;
  need(Buffer.byteLength(code) <= MAX); return code;
}
export function validateGeneratedSchematicReaders(value: unknown, qualified: QualifiedGeneratedSchematicFixtureTarget, history: NativeHistorySnapshot, expectedWindowTabId: string): Readonly<Record<string, unknown>> {
  assertOriginalGeneratedSchematicFixtureTarget(qualified);
  const envelope = readersEnvelopeSchema.parse(value);
  const target = qualified.target; const identity = envelope.identity; need(identity.windowTabId === expectedWindowTabId);
  need(identity.projectUuid === target.projectUuid && identity.branchUuid === target.branchUuid && identity.pageUuid === target.pageUuid && identity.schematicUuid === target.schematicUuid && identity.tabId === `${target.pageUuid}@${target.projectUuid}`);
  const page = history.documents.find(document => document.uuid === target.pageUuid); need(page !== undefined && page.docType === "SCH_PAGE");
  const batch = requests(qualified), expectedTypes = ["TEXT", "WIRE", "BUS"] as const;
  const values = envelope.values.map((raw, index) => {
    need(Buffer.byteLength(raw.json) === raw.utf8Bytes); const request = batch[index], type = expectedTypes[index]; need(request !== undefined && type !== undefined);
    const result = validateCurrentSchematicPageReadResult(request, JSON.parse(raw.json) as unknown); const expected = page.records.filter(record => record.type === type); const state = result.value[0];
    need(expected.length === 1 && result.value.length === 1 && state !== undefined && state.primitiveId === expected[0]?.id);
    if (type !== "TEXT") { need("kind" in state && state.kind === type.toLowerCase() && state.lines.length === 1);
      const line = page.records.filter(record => record.type === "LINE" && record.body["lineGroup"] === state.primitiveId); need(line.length === 1 && line[0]?.id === state.lines[0]?.primitiveId); }
    return result;
  });
  return { schema: "easyeda-pro-control.generated-schematic-readers-result.v1", identity, values, generatedPrimitiveRosterMatched: true,
    additionalNativeChildEffectsAccepted: false,
    completeSourceVerified: false, connectivityVerified: false, persistenceVerified: false, executionAuthorized: false, saveAuthorized: false };
}

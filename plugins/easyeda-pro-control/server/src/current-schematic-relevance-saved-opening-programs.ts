/** Fixed by-value leaves only. Original Core owns registration, once-only
 * navigation and the new worker/scene origin; these data functions issue none. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { buildCurrentSchematicPageOpeningProgram } from "./current-schematic-page-opening-program.ts";
import { currentSchematicPageOpeningResultSchema, currentSchematicPageOpeningTargetSchema } from "./current-schematic-page-opening.ts";
import { GENERATED_SCHEMATIC_PROJECT_OPENING_FUNCTION, GENERATED_SCHEMATIC_RELEVANCE_PAGE_IDENTITY_FUNCTION,
 generatedSchematicIdentitySchema, generatedSchematicProjectOpeningResultSchema } from "./managed-schematic-fixture-opening-program.ts";
import { generatedSchematicTargetSchema } from "./managed-schematic-fixture-opening.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentSchematicRelevanceSavedOpeningPhaseSchema = z.enum(["preflight", "open-project", "open-page"]);
export type CurrentSchematicRelevanceSavedOpeningPhase = z.infer<typeof currentSchematicRelevanceSavedOpeningPhaseSchema>;
const windowId = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/u);
export const currentSchematicRelevanceSavedOpeningTargetSchema = generatedSchematicTargetSchema.refine(target =>
 // oxlint-disable-next-line no-control-regex -- Exact disposable generated Windows path refuses every control character before a native command is assembled.
 target.rawWindowsPath.isWellFormed() && /^[A-Za-z]:\\(?:[^\\\u0000-\u001F\u007F<>:"|?*/]+\\)*CodexEasyedaFixture_[a-f0-9]{32}\\Codex_schematic_relevance_[a-f0-9]{16}\.eprj2$/u.test(target.rawWindowsPath));
const placeholderPath = String.raw`C:\Synthetic\CodexEasyedaFixture_${"a".repeat(32)}\Codex_schematic_relevance_${"b".repeat(16)}.eprj2`;
const placeholder = currentSchematicPageOpeningTargetSchema.parse({ rawWindowsPath: placeholderPath,
 projectUuid: sha256Text(placeholderPath), branchUuid: "d".repeat(32), documentUuid: "e".repeat(32), schematicUuid: "f".repeat(32), expectedSourceSha256: "1".repeat(64) });
function one(source: string, before: string, after: string): string {
 if (source.split(before).length !== 2) { throw new Error("SCHEMATIC_SAVED_OPENING_TEMPLATE"); } return source.replace(before, after);
}
const marker = "SCH_GENERATED_ORIGINAL_WINDOW";
let page = buildCurrentSchematicPageOpeningProgram(placeholder, "open", marker);
if (page.split(JSON.stringify(marker)).length !== 3) { throw new Error("SCHEMATIC_SAVED_OPENING_WINDOW_TEMPLATE"); }
page = one(page.replaceAll(JSON.stringify(marker), "expectedWindowTabId"), ',phase="open",root=globalThis', ",root=globalThis");
page = one(page, `const target=${JSON.stringify(placeholder)}`, "const target={rawWindowsPath:boundTarget.rawWindowsPath,projectUuid:boundTarget.projectUuid,branchUuid:boundTarget.branchUuid,documentUuid:boundTarget.pageUuid,schematicUuid:boundTarget.schematicUuid,expectedSourceSha256:boundTarget.expectedSourceSha256}");

export const CURRENT_SCHEMATIC_RELEVANCE_SAVED_OPENING_FUNCTION = `async function(boundTarget,phase,expectedWindowTabId){
"use strict";
const root=globalThis,ui=root.UI,host=root.gVars,document=root.document,windowTabId=root._TAB_ID_,bad=()=>{throw new Error("SCHEMATIC_SAVED_OPENING_STAGE");};
if(!["preflight","open-project","open-page"].includes(phase)||typeof expectedWindowTabId!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(expectedWindowTabId)||windowTabId!==expectedWindowTabId)bad();
if(boundTarget===null||typeof boundTarget!=="object"||Array.isArray(boundTarget)||Reflect.ownKeys(boundTarget).length!==6)bad();
for(const key of ["rawWindowsPath","projectUuid","branchUuid","pageUuid","schematicUuid","expectedSourceSha256"]){const d=Object.getOwnPropertyDescriptor(boundTarget,key);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="string")bad();}
const current=()=>{if(globalThis!==root||root.UI!==ui||root.gVars!==host||root.document!==document||root._TAB_ID_!==windowTabId||windowTabId!==expectedWindowTabId)bad();};
const decode=envelope=>{if(!envelope||envelope.schema!=="easyeda-pro-control.exact-json.v1"||typeof envelope.json!=="string"||envelope.utf8Bytes!==new TextEncoder().encode(envelope.json).byteLength||envelope.utf8Bytes>49152)bad();return JSON.parse(envelope.json);};
const projectOpen=${GENERATED_SCHEMATIC_PROJECT_OPENING_FUNCTION},pageOpen=async(phase,expectedWindowTabId)=>{${page}};
let project=null,pagePreflight=null,pageResult=null,identity=null;
current();
if(phase==="open-page"){
 pagePreflight=decode(await pageOpen("preflight",null));current();if(pagePreflight.windowTabId!==windowTabId)bad();
 pageResult=decode(await pageOpen("open",windowTabId));current();
 identity=await(${GENERATED_SCHEMATIC_RELEVANCE_PAGE_IDENTITY_FUNCTION})(boundTarget,windowTabId);current();
}else{
 project=JSON.parse(await projectOpen(boundTarget,phase));current();
 if(project.ok!==true||project.failure!==null||project.observation?.windowTabId!==windowTabId||project.status!==(phase==="preflight"?"ready":"opened-prefix-observed")||project.dispatchAttempted!==(phase==="open-project")||project.nativeWorkMayRemain!==(phase==="open-project")||phase==="open-project"&&(project.publicResult!==true||project.prefixObserved!==true))bad();
}
const documentTitle=document.title;if(typeof documentTitle!=="string"||documentTitle.length<1||documentTitle.length>512)bad();current();
return{schema:"private.current-schematic-relevance-saved-opening-stage.v1",phase,project,pagePreflight,page:pageResult,identity,documentTitle};
}`;
if (Buffer.byteLength(CURRENT_SCHEMATIC_RELEVANCE_SAVED_OPENING_FUNCTION) > 49_152) { throw new Error("SCHEMATIC_SAVED_OPENING_FUNCTION_BOUND"); }

export const currentSchematicRelevanceSavedOpeningResultSchema = z.strictObject({
 schema: z.literal("private.current-schematic-relevance-saved-opening-stage.v1"), phase: currentSchematicRelevanceSavedOpeningPhaseSchema,
 project: generatedSchematicProjectOpeningResultSchema.nullable(), pagePreflight: currentSchematicPageOpeningResultSchema.nullable(),
 page: currentSchematicPageOpeningResultSchema.nullable(), identity: generatedSchematicIdentitySchema.nullable(), documentTitle: z.string().min(1).max(512).refine(value => value.isWellFormed()),
});
/** Data validation only; these arguments cannot issue an original native sender. */
export function currentSchematicRelevanceSavedOpeningArguments(target: unknown, phase: CurrentSchematicRelevanceSavedOpeningPhase, expectedWindowTabId: string): readonly Readonly<{ value: unknown }>[] {
 return freezeDeep([{ value: currentSchematicRelevanceSavedOpeningTargetSchema.parse(target) }, { value: currentSchematicRelevanceSavedOpeningPhaseSchema.parse(phase) }, { value: windowId.parse(expectedWindowTabId) }]);
}
export function decodeCurrentSchematicRelevanceSavedOpeningResult(input: unknown, targetInput: unknown, phase: CurrentSchematicRelevanceSavedOpeningPhase, expectedWindowTabId: string): Readonly<z.infer<typeof currentSchematicRelevanceSavedOpeningResultSchema>> {
 const target = currentSchematicRelevanceSavedOpeningTargetSchema.parse(targetInput); windowId.parse(expectedWindowTabId);
 const value = currentSchematicRelevanceSavedOpeningResultSchema.parse(input);
 if (value.phase !== phase) { throw new Error("SCHEMATIC_SAVED_OPENING_PHASE"); }
 if (phase === "open-page") {
  if (value.project !== null || value.pagePreflight === null || value.page === null || value.identity === null) { throw new Error("SCHEMATIC_SAVED_OPENING_PAGE"); }
  for (const [result, nativePhase] of [[value.pagePreflight, "preflight"], [value.page, "open"]] as const) {
   if (result.phase !== nativePhase || result.projectUuid !== target.projectUuid || result.branchUuid !== target.branchUuid || result.documentUuid !== target.pageUuid || result.schematicUuid !== target.schematicUuid ||
    result.tabId !== `${target.pageUuid}@${target.projectUuid}` || result.windowTabId !== expectedWindowTabId || result.opened !== (nativePhase === "open") || result.dispatchAttempted !== (nativePhase === "open") || result.nativeWorkMayRemain !== (nativePhase === "open")) { throw new Error("SCHEMATIC_SAVED_OPENING_PAGE_BINDING"); }
  }
  const expected = { ...value.identity, projectUuid: target.projectUuid, branchUuid: target.branchUuid, pageUuid: target.pageUuid, schematicUuid: target.schematicUuid, tabId: `${target.pageUuid}@${target.projectUuid}`, windowTabId: expectedWindowTabId };
  if (canonicalJson(expected) !== canonicalJson(value.identity)) { throw new Error("SCHEMATIC_SAVED_OPENING_IDENTITY"); }
 } else {
  const project = value.project;
  if (project === null || project.phase !== phase || !project.ok || project.failure !== null || project.cleanupFailure !== undefined && project.cleanupFailure !== null || project.observation === null || project.observation.windowTabId !== expectedWindowTabId ||
   project.projectUuid !== target.projectUuid || project.branchUuid !== target.branchUuid || project.pageUuid !== target.pageUuid || project.status !== (phase === "preflight" ? "ready" : "opened-prefix-observed") ||
   phase === "preflight" && (project.publicResult !== null || project.prefixObserved) || project.dispatchAttempted !== (phase === "open-project") || project.nativeWorkMayRemain !== (phase === "open-project") || phase === "open-project" && (project.publicResult !== true || !project.prefixObserved) ||
   value.pagePreflight !== null || value.page !== null || value.identity !== null) { throw new Error("SCHEMATIC_SAVED_OPENING_PROJECT"); }
 }
 return freezeDeep(value);
}

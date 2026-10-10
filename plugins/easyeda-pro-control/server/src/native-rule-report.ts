import { z } from "zod";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";

export const NATIVE_RULE_REPORT_PROFILE = "easyeda-pro-control.native-rule-report.v1";
const identifier = z.string().min(1).max(512);
export const nativeRuleCheckRequestSchema = z.object({ kind: z.enum(["pcb-drc", "schematic-erc"]) }).strict();
export const nativeRuleCheckBindingSchema = z.object({ documentUuid: identifier, tabId: identifier, projectUuid: identifier }).strict();
export type NativeRuleCheckBinding = z.infer<typeof nativeRuleCheckBindingSchema>;
const boundedJson = z.json().refine((value) => Buffer.byteLength(JSON.stringify(value), "utf8") <= 4_194_304, "Rule report exceeds its bound.");
const source = z.string().min(1).max(4_194_304);
const severity = z.enum(["fatalError", "error", "warn", "info"]);
const counts = z.object({ fatalError: z.number().int().nonnegative(), error: z.number().int().nonnegative(), warn: z.number().int().nonnegative(), info: z.number().int().nonnegative() }).strict();
const item = z.object({ index: z.number().int().nonnegative(), severity, categories: z.array(z.string().max(4096)).max(8), native: boundedJson }).strict();
export const nativeRuleSnapshotSchema = z.object({ document: nativeRuleCheckBindingSchema, kind: z.enum(["pcb-drc", "schematic-erc"]), source, policy: boundedJson }).strict();
export type NativeRuleSnapshot = z.infer<typeof nativeRuleSnapshotSchema>;
export const nativeRuleCheckEvidenceSchema = z.object({
  profile: z.literal(NATIVE_RULE_REPORT_PROFILE), kind: z.enum(["pcb-drc", "schematic-erc"]), document: nativeRuleCheckBindingSchema,
  sourceBefore: source, sourceAfter: source, policyBefore: boundedJson, policyAfter: boundedJson,
  nativeReport: boundedJson, nativeCounts: counts.nullable(),
  execution: z.object({ source: z.enum(["native-pcb-verbose", "native-sch-log-group"]), completed: z.literal(true), actionSucceeded: z.boolean().nullable(), groupStarted: z.number().int().nonnegative(), groupEnded: z.number().int().nonnegative() }).strict(),
}).strict();
export const nativeRuleReportSchema = z.object({
  profile: z.literal(NATIVE_RULE_REPORT_PROFILE), kind: z.enum(["pcb-drc", "schematic-erc"]), document: nativeRuleCheckBindingSchema,
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/u), policy: boundedJson, items: z.array(item).max(100_000), counts,
  nativeReport: boundedJson, zeroReportedViolations: z.boolean(), scope: z.literal("native-current-enabled-rules"),
  limitations: z.array(z.string()),
}).strict();
export type NativeRuleReport = z.infer<typeof nativeRuleReportSchema>;

const PCB_CATEGORIES = new Set(["Clearance Error", "Clearance Error in the same footprint", "Physical Error", "Differential Pair Error", "Connection Error", "Netlist Error", "Creepage Error"]);

/** Preserve native leaf objects and original templates/parameters. No regex
 * severity inference, aggregate placeholders or invented per-pin warnings.
 */
export function verifyNativeRuleReport(input: unknown, expectedBinding: NativeRuleCheckBinding): NativeRuleReport {
  const binding = nativeRuleCheckBindingSchema.parse(expectedBinding), evidence = nativeRuleCheckEvidenceSchema.parse(input);
  if (canonicalJson(evidence.document) !== canonicalJson(binding) || evidence.sourceBefore !== evidence.sourceAfter || canonicalJson(evidence.policyBefore) !== canonicalJson(evidence.policyAfter)) {throw new Error("Rule-check context, source or rule policy changed during calculation.");}
  const items: z.infer<typeof item>[] = [], resultCounts = { fatalError: 0, error: 0, warn: 0, info: 0 };
  if (!Array.isArray(evidence.nativeReport)) {throw new TypeError("Native report is not an itemized array.");}
  if (evidence.kind === "pcb-drc") {
    if (evidence.execution.source !== "native-pcb-verbose" || evidence.execution.actionSucceeded !== null || evidence.nativeCounts !== null || evidence.execution.groupStarted !== 0 || evidence.execution.groupEnded !== 0) {throw new Error("PCB report completion profile mismatch.");}
    const categories = new Set<string>();
    const visit = (value: unknown, path: string[]): void => {
      if (!isRecord(value) || path.length > 8 || items.length >= 100_000) {throw new Error("Native PCB report row or depth is invalid.");}
      if (Object.hasOwn(value, "list")) {
        if (!Array.isArray(value["list"]) || typeof value["name"] !== "string") {throw new TypeError("Native PCB group is incomplete.");}
        for (const child of value["list"]) {visit(child, [...path, value["name"]]);}
      } else {
        if (typeof value["globalIndex"] !== "string" || typeof value["errorType"] !== "string" || typeof value["errorObjType"] !== "string" || !Array.isArray(value["objs"]) || !value["objs"].every((entry: unknown) => typeof entry === "string") || !isRecord(value["explanation"]) || typeof value["explanation"]["str"] !== "string" || !isRecord(value["explanation"]["param"])) {throw new Error("Aggregate-only or unreviewed PCB leaf is not itemized evidence.");}
        if (path.length < 2 || !PCB_CATEGORIES.has(path[0] ?? "")) {throw new Error("Native PCB report category is unreviewed.");}
        items.push(item.parse({ index: items.length, severity: "error", categories: path, native: value })); resultCounts.error += 1;
      }
    };
    for (const group of evidence.nativeReport) {
      if (!isRecord(group) || typeof group["name"] !== "string" || !PCB_CATEGORIES.has(group["name"]) || categories.has(group["name"])) {throw new Error("Unknown or duplicate native PCB report category.");}
      categories.add(group["name"]); visit(group, []);
    }
  } else {
    if (evidence.execution.source !== "native-sch-log-group" || evidence.execution.actionSucceeded !== true || evidence.execution.groupStarted !== 1 || evidence.execution.groupEnded !== 1 || evidence.nativeCounts === null) {throw new Error("Schematic report lacks one completed successful native check/log group.");}
    for (const entry of evidence.nativeReport) {
      if (!isRecord(entry) || entry["tabType"] !== "schDrcLog") {throw new Error("Schematic log row belongs to another scope.");}
      const level = severity.parse(entry["type"]);
      if (Array.isArray(entry["msg"])) {
        if (level !== "info" || !entry["msg"].every((part: unknown) => typeof part === "string")) {throw new Error("Unreviewed schematic lifecycle log row.");}
      } else {
        if (typeof entry["msg"] !== "string" || !entry["msg"]) {throw new Error("Schematic check returned an incomplete native detail row.");}
        items.push(item.parse({ index: items.length, severity: level, categories: ["schDrcLog"], native: entry })); resultCounts[level] += 1;
      }
    }
    if (canonicalJson(resultCounts) !== canonicalJson(evidence.nativeCounts)) {throw new Error("Captured schematic detail rows do not account for every native severity counter.");}
  }
  return nativeRuleReportSchema.parse({ profile: NATIVE_RULE_REPORT_PROFILE, kind: evidence.kind, document: binding, sourceSha256: sha256Json(evidence.sourceBefore), policy: evidence.policyBefore, items, counts: resultCounts, nativeReport: evidence.nativeReport, zeroReportedViolations: resultCounts.fatalError + resultCounts.error + resultCounts.warn === 0, scope: "native-current-enabled-rules", limitations: ["Native enabled-rule policy is reported, not replaced or certified complete for manufacturing.", ...(evidence.kind === "pcb-drc" ? ["The public PCB checker honors custom-check selections even with strict=true; physical rule configuration does not export those selection flags. This report must not be labelled an all-rules scan."] : ["The native SCH check uses its current compiled schematic hierarchy; external AST freshness/source-coverage verification remains required."]), "UI visibility does not suppress report rows; original native templates and identity links remain data.", "A guarded whole-project before/after checkpoint comparison is required outside this renderer read to establish durable project invariance.", "This is a native report, not fabrication approval or an independent electrical/connectivity solver."] });
}

const SOURCE_NORMALIZER = `
const reportCanonical = value => {
  if (Array.isArray(value)) return '['+value.map(reportCanonical).join(',')+']';
  if (value!==null&&typeof value==='object') return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+reportCanonical(value[key])).join(',')+'}';
  return JSON.stringify(value);
};
const reportSource = source => {
  if (typeof source!=='string'||!source||source.length>4194304) throw new Error('RULE_SOURCE_INCOMPLETE');
  const rows=source.split('|\\n').filter(Boolean).map(line=>{const split=line.indexOf('||');if(split<1)throw new Error('RULE_SOURCE_INVALID');return {header:JSON.parse(line.slice(0,split)),body:JSON.parse(line.slice(split+2))};});
  const head=rows[0]?.header.type==='DOCHEAD'?rows.shift():null;
  if(head){delete head.body.client;delete head.body.version;delete head.body.updateTime;}
  const objects=rows.map(row=>({id:row.header.id,type:row.header.type,body:row.body})).sort((a,b)=>a.id.localeCompare(b.id));
  if(new Set(objects.map(value=>value.id)).size!==objects.length)throw new Error('RULE_SOURCE_DUPLICATE');
  return reportCanonical({document:head?.body??null,objects});
};
`;

const SCH_SOURCE_READER = `
const native=globalThis.SCH,vars=native?.gVars,manager=native?.docMemoryManager;
if(!manager||typeof manager.getSchDocs!=='function'||typeof manager.getActiveDoc!=='function')throw new Error('SCH_ERC_NATIVE_PROFILE_MISSING');
const active=manager.getActiveDoc();
const check=()=>{const doc=manager.getActiveDoc();if(doc!==active||!doc||doc.uuid!==binding.documentUuid||doc.tabId!==binding.tabId||doc.isSchSheetDoc()!==true||vars.currentProject?.projectId!==binding.projectUuid)throw new Error('SCH_ERC_CONTEXT_DRIFT');};
const sources=()=>{const docs=manager.getSchDocs();if(!Array.isArray(docs)||docs.length>2048||!docs.includes(active)||new Set(docs.map(doc=>doc.uuid)).size!==docs.length)throw new Error('SCH_ERC_DOCUMENT_SCOPE_INVALID');return reportCanonical(docs.map(doc=>{if(typeof doc.uuid!=='string'||typeof doc.consistencyImpl?.getSourceCode!=='function')throw new Error('SCH_ERC_SOURCE_MISSING');return {uuid:doc.uuid,source:reportSource(doc.consistencyImpl.getSourceCode())};}).sort((a,b)=>a.uuid.localeCompare(b.uuid)));};
const policy=()=>{const value=JSON.parse(JSON.stringify(vars.designRule));if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length===0)throw new Error('SCH_ERC_POLICY_MISSING');return value;};
`;

const PCB_SOURCE_READER = `
const check=async()=>{const doc=await eda.dmt_SelectControl.getCurrentDocumentInfo();if(doc?.documentType!==3||doc.uuid!==binding.documentUuid||doc.tabId!==binding.tabId||doc.parentProjectUuid!==binding.projectUuid)throw new Error('PCB_DRC_CONTEXT_DRIFT');};
const sources=async()=>{const value=reportSource(await eda.sys_FileManager.getDocumentSource());const doc=JSON.parse(value).document;if(doc?.uuid!==binding.documentUuid||doc?.docType!=='PCB')throw new Error('PCB_DRC_SOURCE_IDENTITY_MISMATCH');return value;};
const policy=async()=>{const value=JSON.parse(JSON.stringify(await eda.pcb_Drc.getCurrentRuleConfiguration()));if(!value||typeof value!=='object'||!value.config)throw new Error('PCB_DRC_POLICY_MISSING');return value;};
`;

/** Read exactly the same calculation scope without starting ERC/DRC. Retain
 * this snapshot in the journal so recovery can detect edits to other loaded
 * schematic sheets, not just changes to the active document or saved database.
 */
export function buildNativeRuleSnapshotReadExpression(kindInput: "pcb-drc" | "schematic-erc", bindingInput: NativeRuleCheckBinding): string {
  const { kind } = nativeRuleCheckRequestSchema.parse({ kind: kindInput }), binding = nativeRuleCheckBindingSchema.parse(bindingInput);
  const reader = kind === "pcb-drc" ? PCB_SOURCE_READER : SCH_SOURCE_READER;
  return `(async()=>{const binding=${JSON.stringify(binding)};${SOURCE_NORMALIZER}${reader}
await check();const source=await sources(),rulePolicy=await policy();await check();
const result={document:binding,kind:${JSON.stringify(kind)},source,policy:rulePolicy};if(JSON.stringify(result).length>4194304)throw new Error('RULE_SNAPSHOT_LIMIT');return result;
})()`;
}

/** Public PCB verbose returns the complete vhe worker/native list. Unlike the
 * upstream adapter, retain all nested identity and explanation fields.
 */
export function buildNativePcbDrcReadExpression(bindingInput: NativeRuleCheckBinding): string {
  const binding = nativeRuleCheckBindingSchema.parse(bindingInput);
  return `(async()=>{const binding=${JSON.stringify(binding)};${SOURCE_NORMALIZER}${PCB_SOURCE_READER}
await check();
const sourceBefore=await sources(),policyBefore=await policy();
await check();
const nativeReport=await eda.pcb_Drc.check(true,false,true);
await check();
const sourceAfter=await sources(),policyAfter=await policy();
if(sourceBefore!==sourceAfter||reportCanonical(policyBefore)!==reportCanonical(policyAfter))throw new Error('PCB_DRC_SOURCE_OR_POLICY_DRIFT');
const report={profile:${JSON.stringify(NATIVE_RULE_REPORT_PROFILE)},kind:'pcb-drc',document:binding,sourceBefore,sourceAfter,policyBefore,policyAfter,nativeReport,nativeCounts:null,execution:{source:'native-pcb-verbose',completed:true,actionSucceeded:null,groupStarted:0,groupEnded:0}};
if(JSON.stringify(report).length>4194304)throw new Error('PCB_DRC_REPORT_LIMIT');return report;
})()`;
}

/** Evaluate only in the pinned SCH frame. This observes the exact native log
 * group and action completion; it neither replaces handlers nor executes
 * caller code. MessageBus subscriptions are cancelled, not pulled (pull is
 * a different queue consumer API). Native event subscriptions are disposed.
 */
export function buildNativeSchematicErcReadExpression(bindingInput: NativeRuleCheckBinding): string {
  const binding = nativeRuleCheckBindingSchema.parse(bindingInput);
  return `(async()=>{const binding=${JSON.stringify(binding)};${SOURCE_NORMALIZER}${SCH_SOURCE_READER}
const bus=vars?.messageBus,runner=native?.app?.actionRunner;
if(!bus||typeof bus.subscribe!=='function'||typeof bus.rpcCall!=='function'||!runner||typeof runner.onDidRun!=='function'||typeof runner.onWillRun!=='function')throw new Error('SCH_ERC_NATIVE_PROFILE_MISSING');
check();if(runner.running||runner.currentAction)throw new Error('SCH_ERC_ACTION_ALREADY_RUNNING');
const sourceBefore=sources(),policyBefore=policy();
const nativeReport=[],handles=[];let started=0,ended=0,willRun=0,didRun=0,actionSucceeded=null,captureError=null;
const subscribe=(topic,callback)=>{const handle=bus.subscribe(topic,callback);if(!handle||typeof handle.cancel!=='function'||typeof handle.running!=='function')throw new Error('SCH_ERC_LISTENER_HANDLE_INVALID');handles.push({kind:'bus',handle});};
try{
 subscribe('bottomBarLogGroupStart',value=>{if(value==='schDrcLog'){started++;if(started!==1||ended)captureError='overlapping native log group';}});
 subscribe('bottomBarLogGroupEnd',value=>{if(value==='schDrcLog'){ended++;if(started!==1||ended!==1)captureError='unbalanced native log group';}});
 subscribe('bottomBarLog',value=>{if(started===1&&ended===0){try{if(nativeReport.length>=100000)throw new Error('native log limit');if(!value||value.tabType!=='schDrcLog')throw new Error('foreign log during check');nativeReport.push(JSON.parse(JSON.stringify(value)));}catch(error){captureError=String(error);}}});
 const willHandle=runner.onWillRun(action=>{willRun++;if(action?.name!=='designRule actionRunner')captureError='foreign native action';});
 if(!willHandle||typeof willHandle.dispose!=='function')throw new Error('SCH_ERC_ACTION_LISTENER_INVALID');handles.push({kind:'event',handle:willHandle});
 const didHandle=runner.onDidRun(result=>{didRun++;if(result?.action?.name!=='designRule actionRunner'||typeof result.success!=='boolean')captureError='foreign native completion';else actionSucceeded=result.success;});
 if(!didHandle||typeof didHandle.dispose!=='function')throw new Error('SCH_ERC_ACTION_LISTENER_INVALID');handles.push({kind:'event',handle:didHandle});
 const completion=await bus.rpcCall('checkERC',false);
 check();
 if(captureError||started!==1||ended!==1||willRun!==1||didRun!==1||actionSucceeded!==true||runner.running||runner.currentAction)throw new Error('SCH_ERC_INCOMPLETE_OR_FAILED_NATIVE_CHECK: '+String(captureError));
 const rawCounts=completion?.message;if(!rawCounts||typeof rawCounts!=='object')throw new Error('SCH_ERC_COUNTERS_MISSING');
 const nativeCounts={};for(const level of ['fatalError','error','warn','info']){if(!Number.isSafeInteger(rawCounts[level])||rawCounts[level]<0)throw new Error('SCH_ERC_COUNTER_INVALID');nativeCounts[level]=rawCounts[level];}
 const sourceAfter=sources(),policyAfter=policy();
 if(sourceBefore!==sourceAfter||reportCanonical(policyBefore)!==reportCanonical(policyAfter))throw new Error('SCH_ERC_SOURCE_OR_POLICY_DRIFT');
 const result={profile:${JSON.stringify(NATIVE_RULE_REPORT_PROFILE)},kind:'schematic-erc',document:binding,sourceBefore,sourceAfter,policyBefore,policyAfter,nativeReport,nativeCounts,execution:{source:'native-sch-log-group',completed:true,actionSucceeded,groupStarted:started,groupEnded:ended}};
 if(JSON.stringify(result).length>4194304)throw new Error('SCH_ERC_REPORT_LIMIT');return result;
}finally{let cleanupFailed=false;for(const owned of handles){try{if(owned.kind==='bus'){owned.handle.cancel();if(owned.handle.running()!==false)cleanupFailed=true;}else owned.handle.dispose();}catch{cleanupFailed=true;}}if(cleanupFailed)throw new Error('SCH_ERC_LISTENER_CLEANUP_FAILED');}
})()`;
}

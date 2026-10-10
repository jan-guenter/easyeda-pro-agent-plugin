import { canonicalJson, isRecord } from "./core.ts";
import { buildDesignOperationCallExpression, compileDesignOperation } from "./design-operations.ts";
import { buildExpectedDesignSource } from "./design-source-proof.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { DesignNativeAdapter } from "./design-native-adapter.ts";

export const DESIGN_RULE_PUBLIC_PROFILE = "easyeda-pro-control.pcb-rules-public.v1";

export function isDesignRuleAction(action: string): boolean {
  return action.startsWith("pcb.rules.") || ["netclass", "equal-length", "differential-pair"].includes(action.split(".")[1] ?? "");
}

function values(record: NativeSourceObject | undefined, key: string): Record<string, unknown> {
  if (record === undefined) { return {}; }
  const value = record.body[key];
  if (!isRecord(value)) { throw new TypeError("Unknown native rule selector shape."); }
  return value;
}

function assertDefaultFields(record: NativeSourceObject | undefined, fields: readonly string[]): void {
  const keys = values(record, "ruleKeyValue");
  for (const field of fields) {
    const value = keys[field];
    if (value !== undefined && value !== null && value !== "default") { throw new Error("Public group operation would reset a member rule override; assign or preserve it explicitly first."); }
  }
}

/** The native public group manager resets member rules. Reject those cases
 * before dispatch instead of treating its resets as intended collateral.
 */
export function assertPublicRuleEffects(operation: unknown, before: NativeSourceSnapshot, expected = buildExpectedDesignSource(operation, before)): void {
  const compiled = compileDesignOperation(operation);
  if (!isDesignRuleAction(compiled.action)) { throw new Error("Not a maintained public rule action."); }
  const records = new Map(before.objects.map((record) => [record.id, record]));
  const family = compiled.effect.family, verb = compiled.action.split(".")[2];
  if (compiled.action.startsWith("pcb.rules.") || family === "differential-pair") {
    for (const record of before.objects.filter((entry) => entry.type === "NET" && entry.body["differentialName"] !== null && entry.body["differentialName"] !== undefined && entry.body["differentialName"] !== "")) {
      const group = record.body["differentialName"];
      const key: unknown = JSON.parse(record.id);
      if (typeof group !== "string" || !Array.isArray(key) || typeof key[1] !== "string") { throw new TypeError("Invalid pair-member source identity."); }
      const member = values(records.get(JSON.stringify(["RULE_SELECTOR", ["NET", key[1]]])), "ruleKeyValue")["DIFFER_ENTAIL"] ?? "default";
      const pair = values(records.get(JSON.stringify(["RULE_SELECTOR", ["DIFF_PAIR", group]])), "ruleKeyValue")["DIFFER_ENTAIL"] ?? "default";
      if (typeof member !== "string" || typeof pair !== "string" || member !== pair) { throw new Error("Native full-rule setter would replace individual pair-member physics."); }
    }
  }
  if (["netclass", "equal-length", "differential-pair"].includes(family)) {
    const first = compiled.call.args[0];
    if (first?.kind !== "literal" || typeof first.value !== "string") { throw new Error("Missing exact group identity."); }
    const profile = new Map([ ["netclass", ["NET_CLASS", "netType"]], ["equal-length", ["EQ_LEN_GRP", "equalLengthGroupName"]], ["differential-pair", ["DIFF_PAIR", "differentialName"]] ]).get(family);
    const membership = profile?.[1], selector = profile?.[0];
    if (selector === undefined || membership === undefined) { throw new Error("Unknown public rule group profile."); }
    const group = records.get(JSON.stringify(["RULE_SELECTOR", [selector, first.value]]));
    if (verb === "rename" && group !== undefined && canonicalJson(group.body) !== canonicalJson({ ruleOrder: 4, ruleKeyValue: {}, copperValue: {}, innerPlaneValue: {} })) {
      throw new Error("Native group rename recreates its rule selector; configured groups need an explicit preserved-rule migration.");
    }
    if (verb === "rename" && before.objects.some((record) => record.type === "RULE_SELECTOR" && record !== group && record.id.includes(JSON.stringify([selector, first.value])))) {
      throw new Error("Native group rename cannot preserve associated between-net selectors.");
    }
    let fields = ["DIFFER_ENTAIL"];
    if (family === "netclass") { fields = ["SAFE", "TRACK", "BLIND", "RADIUS", "PLANE", "COPPER", "SOLDER", "PASTE", ...(["delete", "rename"].includes(verb ?? "") ? ["CREEPAGE"] : [])]; }
    else if (family === "equal-length") { fields = ["NET_LENGTH", "NET_LENGTH_TOLERANCE"]; }
    if (verb === "add-nets") { assertDefaultFields(group, fields); }
    for (const record of before.objects.filter((entry) => entry.type === "NET")) {
      const next = expected.objects.find((entry) => entry.id === record.id);
      // The differential manager deletes/recreates every pair, including
      // Unrelated pairs. Their member physics must not be silently reset.
      if (record.body[membership] === first.value || canonicalJson(record) !== canonicalJson(next ?? null) || (family === "differential-pair" && record.body["differentialName"] !== null)) {
        const key: unknown = JSON.parse(record.id);
        if (!Array.isArray(key) || typeof key[1] !== "string") { throw new TypeError("Invalid native net identity."); }
        assertDefaultFields(records.get(JSON.stringify(["RULE_SELECTOR", ["NET", key[1]]])), fields);
      }
    }
    if (family === "differential-pair") {
      for (const record of before.objects.filter((entry) => entry.type === "RULE_SELECTOR" && entry.id.startsWith('["RULE_SELECTOR",["DIFF_PAIR",'))) {
        if (Object.keys(values(record, "ruleKeyValue")).some((key) => key !== "DIFFER_ENTAIL") || Object.keys(values(record, "copperValue")).length > 0 || Object.keys(values(record, "innerPlaneValue")).length > 0) { throw new Error("Native differential manager cannot preserve unknown pair-selector fields."); }
      }
    }
  }
  if (compiled.action === "pcb.rules.net.replace") {
    for (const record of expected.objects.filter((entry) => entry.type === "RULE_SELECTOR")) {
      const old = records.get(record.id);
      if (canonicalJson(values(old, "ruleKeyValue")["DIFFER_ENTAIL"] ?? null) !== canonicalJson(values(record, "ruleKeyValue")["DIFFER_ENTAIL"] ?? null)) { throw new Error("Public net-rule overwrite does not set differential physics; use its dedicated rule path."); }
    }
  }
  if (compiled.action === "pcb.rules.configuration.replace" && before.objects.some((record) => record.type === "VIA")) {
    const changedBlind = expected.objects.some((record) => record.type === "RULE" && record.id.startsWith('["RULE","BLIND",') && canonicalJson(record) !== canonicalJson(records.get(record.id) ?? null));
    const removedBlind = before.objects.some((record) => record.type === "RULE" && record.id.startsWith('["RULE","BLIND",') && !expected.objects.some((entry) => entry.id === record.id));
    if (changedBlind || removedBlind) { throw new Error("Native blind-via rule replacement can rewrite existing vias; separate geometry-aware migration is required."); }
  }
}

export function buildDesignRulePublicAdapter(operation: unknown, before: NativeSourceSnapshot): DesignNativeAdapter {
  const compiled = compileDesignOperation(operation), expected = buildExpectedDesignSource(operation, before);
  assertPublicRuleEffects(operation, before, expected);
  if (before.document["docType"] !== "PCB" || before.document["editVersion"] !== "3.2.149.88089769") { throw new Error("Public rule adapter requires the reviewed PCB source profile."); }
  if (before.objects.some((record) => ["POURED", "LAYER_FILL", "TEARDROP", "PARTITION", "PANELIZE_STAMP"].includes(record.type))) { throw new Error("Clear derived copper before changing PCB rules; automatic recomputation is not permitted collateral."); }
  const pair = compiled.effect.family === "differential-pair";
  const argument = compiled.call.args[0];
  if (argument?.kind !== "literal") { throw new Error("Missing typed rule argument."); }
  const call = compiled.action === "pcb.rules.configuration.replace" ? `(async()=>{
const frames=[globalThis.window?.top],buses=[],seen=new Set();
for(let index=0;index<frames.length;index++){
  if(frames.length>64)throw new Error('Numeric rule frame bound exceeded');
  const frame=frames[index];if(!frame||seen.has(frame))continue;seen.add(frame);
  let bus;try{bus=frame.MSG_BUS_PCB;for(let child=0;child<frame.frames.length;child++)frames.push(frame.frames[child]);}catch{continue;}
  if(bus&&typeof bus.messageBus?.rpcCall==='function'&&!buses.includes(bus))buses.push(bus);
}
if(buses.length===0||buses.length>8)throw new Error('Numeric rule frame scope unavailable');
let selected;
for(const bus of buses){const identity=(await bus.messageBus.rpcCall('getTabIdAndDocType',{}))?.message;if(identity?.tabId===EXPECTED_TAB_ID&&identity?.docType===3){if(selected)throw new Error('Duplicate numeric rule frame');selected=bus;}}
if(!selected)throw new Error('Exact numeric rule frame unavailable');
await checkRuleContext();
if(ruleCanonical(ruleSource((await selected.messageBus.rpcCall('FileSource',{}))?.message))!==ruleCanonical(RULE_BEFORE))throw new Error('Numeric rule baseline changed before dispatch');
// The fixed PCB service omits configName, preserving the project template.
// Do not call the UI wrapper, which can write a separate global preset.
return(await selected.messageBus.rpcCall('pcb/extensionAPI/drc-overwriteCurrentRuleConfiguration',{ruleConfiguration:${canonicalJson(argument.value)}}))?.message;
})()` : buildDesignOperationCallExpression(operation);
  const code = `
const RULE_BEFORE = ${canonicalJson({ document: before.document, objects: before.objects })};
const RULE_AFTER = ${canonicalJson({ document: expected.document, objects: expected.objects })};
const ruleCanonical = value => Array.isArray(value) ? '[' + value.map(ruleCanonical).join(',') + ']' : value !== null && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + ruleCanonical(value[key])).join(',') + '}' : JSON.stringify(value);
const ruleSource = source => {
  if (typeof source !== 'string' || source.length > 67108864) throw new Error('Incomplete rule source');
  const lines = source.split('|\\n'); if (lines.at(-1) === '') lines.pop();
  const rows = lines.map(line => { const split = line.indexOf('||'); if (split <= 0) throw new Error('Malformed rule source'); return {header:JSON.parse(line.slice(0,split)),body:JSON.parse(line.slice(split+2))}; });
  if (rows[0]?.header.type !== 'DOCHEAD' || rows.length > 500000) throw new Error('Invalid rule source header');
  const document = {...rows[0].body}; delete document.client; delete document.version; delete document.updateTime;
  const ids = new Set();
  const objects = rows.slice(1).map(row => { const {id,type} = row.header; if (typeof id !== 'string' || !id || ids.has(id) || typeof type !== 'string' || ['DOCHEAD','DELETE','DELETE_DOC'].includes(type) || !row.body || typeof row.body !== 'object' || Array.isArray(row.body)) throw new Error('Invalid rule record'); ids.add(id); return {id,type,body:row.body}; }).sort((a,b)=>a.id.localeCompare(b.id));
  return {document,objects};
};
const checkRuleContext = async () => {
  if (EXPECTED_DOCUMENT_TYPE !== 3 || EXPECTED_DOCUMENT_UUID !== RULE_BEFORE.document.uuid) throw new Error('Missing rule context guard');
  const current = await eda.dmt_SelectControl.getCurrentDocumentInfo();
  if (String(current?.uuid ?? current?.documentUuid ?? current?.id ?? '') !== EXPECTED_DOCUMENT_UUID || String(current?.tabId ?? '') !== EXPECTED_TAB_ID || Number(current?.documentType ?? current?.docType) !== 3) throw new Error('Rule context drift');
};
await checkRuleContext();
const currentRuleSource = ruleSource(await eda.sys_FileManager.getDocumentSource());
if (ruleCanonical(currentRuleSource) !== ruleCanonical(RULE_BEFORE)) throw new Error('Rule baseline changed; nothing dispatched');
const result = await ${call};
if (result !== true) throw new Error('Public rule operation did not confirm completion');
await checkRuleContext();
if (ruleCanonical(ruleSource(await eda.sys_FileManager.getDocumentSource())) !== ruleCanonical(RULE_AFTER)) throw new Error('Public rule effect changed unintended records; do not save or retry');
${pair ? `// The pair manager deletes every old selector but uploads only changed pairs.
// Persist the complete unchanged net-rule rows once so c1 uploads all
// reconstructed pair selectors. Avoid numeric overwrite's configuration-store side effect.
const pairRules = await eda.pcb_Drc.getNetRules();
if (!Array.isArray(pairRules)) throw new Error('Incomplete public net-rule collection');
await checkRuleContext();
if (ruleCanonical(ruleSource(await eda.sys_FileManager.getDocumentSource())) !== ruleCanonical(RULE_AFTER)) throw new Error('Pair baseline changed before persistence completion');
if (await eda.pcb_Drc.overwriteNetRules(pairRules) !== true) throw new Error('Pair selector persistence did not complete');
await checkRuleContext();
if (ruleCanonical(ruleSource(await eda.sys_FileManager.getDocumentSource())) !== ruleCanonical(RULE_AFTER)) throw new Error('Pair persistence changed unrelated rule records');` : ""}
return true;
`;
  if (Buffer.byteLength(code, "utf8") > 8 * 1024 * 1024) { throw new Error("Generated public rule program exceeds its transport bound."); }
  return { profile: DESIGN_RULE_PUBLIC_PROFILE, requiredVersions: { editor: "3.2.149.88089769", pcb: "3.2.149.5378b690", api: "0.2.53.aee2f57a" }, beforeSha256: before.sha256, expected, code };
}

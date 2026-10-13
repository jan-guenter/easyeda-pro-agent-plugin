import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import { footprintScopeSchema } from "./footprint-action.ts";
import type { FootprintScope } from "./footprint-action.ts";
import { buildNativeDocumentCloseFunction, buildNativeDocumentOpenFunction } from "./native-document-lifecycle.ts";
import { PCB_NAVIGATION_PREFERENCE_GUARD } from "./pcb-navigation-preferences.ts";

export function buildFootprintSourceGuard(expected: NativeSourceSnapshot, scopeInput: FootprintScope): string {
  const scope = footprintScopeSchema.parse(scopeInput);
  if (expected.document["docType"] !== "PCB" || expected.document["uuid"] !== scope.footprintUuid || expected.sha256 !== sha256Json({ schema: expected.schema, document: expected.document, objects: expected.objects })) { throw new Error("Footprint lifecycle source identity or commitment is invalid."); }
  const baseline = canonicalJson({ document: expected.document, objects: expected.objects });
  if (baseline.length > 3 * 1024 * 1024) { throw new Error("Footprint lifecycle exceeds the reviewed source bound."); }
  return `
const SCOPE = ${JSON.stringify(scope)};
const EXPECTED_SOURCE = ${baseline};
const stable = value => Array.isArray(value) ? '['+value.map(stable).join(',')+']' : value !== null && typeof value === 'object' ? '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+stable(value[key])).join(',')+'}' : JSON.stringify(value);
const contextMatches = async () => {
  const project = await eda.dmt_Project.getCurrentProjectInfo();
  const document = await eda.dmt_SelectControl.getCurrentDocumentInfo();
  if (project?.uuid !== SCOPE.libraryUuid || document?.uuid !== SCOPE.footprintUuid || document?.documentType !== 4 || document?.tabId !== SCOPE.footprintUuid+'@'+SCOPE.libraryUuid || document?.parentLibraryUuid !== SCOPE.metadataOwnerUuid) throw new Error('Footprint lifecycle scope drift');
};
await contextMatches();
const library = eda.lib_Footprint;
const metadata = await library.get(SCOPE.footprintUuid,SCOPE.libraryUuid);
if (metadata?.uuid !== SCOPE.footprintUuid || metadata?.libraryUuid !== SCOPE.metadataOwnerUuid || metadata?.name !== SCOPE.footprintName || metadata?.libraryType !== '4') throw new Error('Footprint lifecycle metadata drift');
const parseFootprintSource = source => {
if (typeof source !== 'string' || source.length > 4194304) throw new Error('Footprint lifecycle source unavailable');
const lines = source.split('|\\n');
if (lines.at(-1) === '') lines.pop();
const rows = lines.map(line => { const split=line.indexOf('||'); if(split<1) throw new Error('Invalid footprint source record'); return {header:JSON.parse(line.slice(0,split)),body:JSON.parse(line.slice(split+2))}; });
if (rows[0]?.header.type !== 'DOCHEAD') throw new Error('Missing footprint source header');
const document = {...rows[0].body};
if (typeof document.client !== 'string' || !/^[a-f0-9]{16}$/.test(document.client) || !Number.isSafeInteger(document.updateTime) || document.version !== String(document.updateTime)) throw new Error('Invalid footprint export header');
delete document.client; delete document.updateTime; delete document.version;
const ids = new Set();
const objects = rows.slice(1).map(row => {
  const {id,type}=row.header;
  if (typeof id !== 'string' || !id || ids.has(id) || typeof type !== 'string' || ['DOCHEAD','DELETE','DELETE_DOC'].includes(type) || row.body === null || typeof row.body !== 'object' || Array.isArray(row.body)) throw new Error('Invalid footprint source identity');
  ids.add(id); return {id,type,body:row.body};
}).sort((left,right)=>left.id.localeCompare(right.id));
return {document,objects};
};
const source = await eda.sys_FileManager.getDocumentSource();
if (stable(parseFootprintSource(source)) !== stable(EXPECTED_SOURCE)) throw new Error('Footprint changed before lifecycle action');
await contextMatches();
`;
}

/** Save the exact already-proved frame without decoding its source again.
 * lib_Footprint.updateDocumentSource would save even after decode=false and
 * discard the save result. The executor still checkpoints before close.
 */
export function buildFootprintSaveCode(expected: NativeSourceSnapshot, scope: FootprintScope): string {
  return `${PCB_NAVIGATION_PREFERENCE_GUARD}
assertPcbNavigationPreferences();
${buildFootprintSourceGuard(expected, scope)}
const frames=[globalThis.window?.top],buses=[],seen=new Set();
for(let index=0;index<frames.length;index++){
  if(frames.length>64)throw new Error('Footprint save frame bound exceeded');
  const frame=frames[index];if(!frame||seen.has(frame))continue;seen.add(frame);
  let bus;try{bus=frame.MSG_BUS_PCB;for(let child=0;child<frame.frames.length;child++)frames.push(frame.frames[child]);}catch{continue;}
  if(bus&&typeof bus.messageBus?.rpcCall==='function'&&!buses.includes(bus))buses.push(bus);
}
if(buses.length===0||buses.length>8)throw new Error('Footprint save frame scope unavailable');
let selected;
for(const bus of buses){const identity=(await bus.messageBus.rpcCall('getTabIdAndDocType',{}))?.message;if(identity?.tabId===SCOPE.footprintUuid+'@'+SCOPE.libraryUuid&&identity?.docType===4){if(selected)throw new Error('Footprint save frame identity duplicated');selected=bus;}}
if(!selected)throw new Error('Exact footprint save frame not found');
await contextMatches();
const finalSource=(await selected.messageBus.rpcCall('FileSource',{}))?.message;
if(stable(parseFootprintSource(finalSource))!==stable(EXPECTED_SOURCE))throw new Error('Footprint changed before compiler save');
assertPcbNavigationPreferences();
const saved=(await selected.messageBus.rpcCall('pcb/saveCompiler',''))?.message;
if(saved?.success!==true)throw new Error('Footprint compiler save was not acknowledged');
await contextMatches();
return {ok:true,kind:'footprint-save-requested',saved:false,compilerAcknowledgment:{success:true}};`;
}

/** Called only after independent complete-project durable proof succeeds. */
export function buildFootprintReopenCode(expected: NativeSourceSnapshot, scope: FootprintScope): string {
  const lifecycle = { projectUuid: scope.libraryUuid, documentUuid: scope.footprintUuid, documentType: 4 as const, metadataOwnerUuid: scope.metadataOwnerUuid };
  return `${PCB_NAVIGATION_PREFERENCE_GUARD}
assertPcbNavigationPreferences();
${buildFootprintSourceGuard(expected, scope)}
const editor=eda.dmt_EditorControl;
if (typeof editor?.closeDocument !== 'function' || typeof editor?.openLibraryDocument !== 'function' || typeof editor?.activateDocument !== 'function') throw new Error('Footprint lifecycle editor API unavailable');
const tabId=SCOPE.footprintUuid+'@'+SCOPE.libraryUuid;
const closeProof=await (${buildNativeDocumentCloseFunction(lifecycle)})(tabId);
const openProof=await (${buildNativeDocumentOpenFunction(lifecycle)})(tabId);
await contextMatches();
return {ok:true,saved:true,closed:true,reopened:true,closeProof,openProof,document:{uuid:SCOPE.footprintUuid,documentType:4,tabId}};`;
}

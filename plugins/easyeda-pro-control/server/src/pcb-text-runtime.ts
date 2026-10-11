import { canonicalJson } from "./core.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import { buildPcbExactFrameBinding } from "./pcb-exact-frame.ts";

export interface PcbTextRuntimeScope { readonly projectUuid: string; readonly branchUuid: string; }

/** Text-only caller for now. UI 12414b9d exports gVars/UI and its synchronous
 * tab registry; getTabIframeSync resolves the exact tab, unlike the public
 * current-tab source getter/setter. PCB 65401cdc serves FileSource and
 * pcb/decode on the selected frame's MSG_BUS_PCB receiver. Both files must be
 * pinned by the transaction coordinator before dispatch. No API result can
 * substitute another receiver after the complete baseline read.
 */
export function buildPcbTextRuntime(before: NativeSourceSnapshot, expected: NativeSourceSnapshot, scope: PcbTextRuntimeScope): string {
  return `
let textStage='host';
try {
const TEXT_SCOPE=${JSON.stringify(scope)},TEXT_BEFORE=${canonicalJson({ document: before.document, objects: before.objects })},TEXT_AFTER=${canonicalJson({ document: expected.document, objects: expected.objects })};
if(EXPECTED_DOCUMENT_TYPE!==3||EXPECTED_PROJECT_UUID!==TEXT_SCOPE.projectUuid||EXPECTED_DOCUMENT_UUID!==TEXT_BEFORE.document.uuid||EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID)throw new Error('CONTEXT');
${buildPcbExactFrameBinding("TEXT_SCOPE")}
const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value!==null&&typeof value==='object'?'{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
const parse=source=>{
if(typeof source!=='string'||source.length>16777216)throw new Error('SOURCE');const lines=source.split('|\\n');if(lines.at(-1)==='')lines.pop();
if(lines.length<2||lines.length>20001)throw new Error('SOURCE');
const rows=lines.map(line=>{const split=line.indexOf('||');if(split<=0)throw new Error('SOURCE');return{header:JSON.parse(line.slice(0,split)),body:JSON.parse(line.slice(split+2)),line};});
if(rows[0]?.header.type!=='DOCHEAD'||!rows[0].body||Array.isArray(rows[0].body)||typeof rows[0].body!=='object')throw new Error('SOURCE');
const document={...rows[0].body};delete document.client;delete document.version;delete document.updateTime;
const ids=new Set(),objects=rows.slice(1).map(row=>{const{id,type}=row.header;if(typeof id!=='string'||!id||ids.has(id)||typeof type!=='string'||['DOCHEAD','DELETE','DELETE_DOC'].includes(type)||!row.body||Array.isArray(row.body)||typeof row.body!=='object')throw new Error('SOURCE');ids.add(id);return{id,type,body:row.body};}).sort((a,b)=>a.id.localeCompare(b.id));
return{document,objects,rows};};
assertPcbFrameCurrent();textStage='identity';
const identity=(await pcbFrameRpc.call(pcbFrameChannel,'getTabIdAndDocType',{}))?.message;assertPcbFrameCurrent();
if(identity?.tabId!==EXPECTED_TAB_ID||identity.docType!==3)throw new Error('IDENTITY');
textStage='baseline';const current=parse((await pcbFrameRpc.call(pcbFrameChannel,'FileSource',{}))?.message);assertPcbFrameCurrent();
if(canonical({document:current.document,objects:current.objects})!==canonical(TEXT_BEFORE))throw new Error('BASELINE');
const wanted=new Map(TEXT_AFTER.objects.map(row=>[row.id,row]));
const output=[current.rows[0].line];
for(const row of current.rows.slice(1)){const desired=wanted.get(row.header.id);if(!desired||desired.type!==row.header.type)throw new Error('EFFECT');output.push(canonical(row.body)===canonical(desired.body)?row.line:JSON.stringify(row.header)+'||'+JSON.stringify(desired.body));}
const merged=output.join('|\\n')+'|\\n',check=parse(merged);
if(canonical({document:check.document,objects:check.objects})!==canonical(TEXT_AFTER))throw new Error('EFFECT');
// Final synchronous proof after the last awaited read, immediately followed
// By the captured exact receiver. Never use the current-tab public setter.
assertPcbFrameCurrent();textStage='dispatch';const acknowledgment=(await pcbFrameRpc.call(pcbFrameChannel,'pcb/decode',merged))?.message;
textStage='acknowledgment';if(acknowledgment!==true)throw new Error('ACK');
// Return the native acknowledgment before any fallible post-write read. The
// Journaled executor subsequently proves exact source, context and persistence.
return true;
}catch(error){let code='EXCEPTION';try{const descriptor=error!==null&&(typeof error==='object'||typeof error==='function')?Object.getOwnPropertyDescriptor(error,'message'):undefined;const message=descriptor&&Object.hasOwn(descriptor,'value')?descriptor.value:undefined;if(typeof message==='string'&&['CONTEXT','HOST','RECEIVER','PROJECT','ACTIVE_TAB','TAB','PERMISSION','FRAME','SOURCE','IDENTITY','BASELINE','EFFECT','ACK'].includes(message))code=message;}catch(_){}throw new Error('Standalone PCB text refused: '+textStage+':'+code);}
`;
}

import { canonicalJson } from "./core.ts";
import { compareDocumentSources } from "./document-source.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import { buildPcbExactFrameBinding } from "./pcb-exact-frame.ts";
import type { PcbTextRuntimeScope } from "./pcb-text-runtime.ts";

/** Fixed single-STRING membership changes only. Caller first proves the full
 * text profile and journal-owned creation ID; this is not a raw source API.
 * Uses the same pinned exact frame as the text modifier and retains every
 * unrelated native row byte-for-byte and in its original sequence.
 */
export function buildPcbTextLifecycleRuntime(before: NativeSourceSnapshot, expected: NativeSourceSnapshot,
  scope: PcbTextRuntimeScope, createdId?: string): string {
  const delta = compareDocumentSources(before, expected);
  if (delta.documentChanged || delta.changed.length > 0 ||
      (createdId === undefined ? delta.added.length > 0 || delta.removed.length !== 1 || delta.removed[0]?.type !== "STRING"
        : !/^[a-f0-9]{16}$/u.test(createdId) || delta.removed.length > 0 || delta.added.length !== 1 || delta.added[0]?.id !== createdId || delta.added[0].type !== "STRING")) {
    throw new Error("Standalone PCB text runtime requires one exact STRING addition or removal.");
  }
  return `
let textStage='host';
try {
const TEXT_SCOPE=${JSON.stringify(scope)},TEXT_BEFORE=${canonicalJson({ document: before.document, objects: before.objects })},TEXT_AFTER=${canonicalJson({ document: expected.document, objects: expected.objects })},TEXT_CREATED_ID=${JSON.stringify(createdId ?? null)};
if(EXPECTED_DOCUMENT_TYPE!==3||EXPECTED_PROJECT_UUID!==TEXT_SCOPE.projectUuid||EXPECTED_DOCUMENT_UUID!==TEXT_BEFORE.document.uuid||EXPECTED_TAB_ID!==EXPECTED_DOCUMENT_UUID+'@'+EXPECTED_PROJECT_UUID)throw new Error('CONTEXT');
${buildPcbExactFrameBinding("TEXT_SCOPE")}
const canonical=value=>Array.isArray(value)?'['+value.map(canonical).join(',')+']':value!==null&&typeof value==='object'?'{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}':JSON.stringify(value);
const parse=source=>{
if(typeof source!=='string'||source.length>16777216)throw new Error('SOURCE');const lines=source.split('|\\n');if(lines.at(-1)==='')lines.pop();
if(lines.length<2||lines.length>20001)throw new Error('SOURCE');
const rows=lines.map(line=>{const split=line.indexOf('||');if(split<=0)throw new Error('SOURCE');const header=JSON.parse(line.slice(0,split));
if(!header||Array.isArray(header)||typeof header!=='object'||Object.keys(header).some(key=>!['type','id','ticket','client'].includes(key))||typeof header.type!=='string'||!/^[A-Z][A-Z0-9_]{0,63}$/.test(header.type))throw new Error('SOURCE');
if(Object.hasOwn(header,'ticket')&&(!Number.isSafeInteger(header.ticket)||header.ticket<0||Object.is(header.ticket,-0)))throw new Error('TICKET');
return{header,body:JSON.parse(line.slice(split+2)),line};});
if(rows[0]?.header.type!=='DOCHEAD'||!rows[0].body||Array.isArray(rows[0].body)||typeof rows[0].body!=='object')throw new Error('SOURCE');
const document={...rows[0].body};delete document.client;delete document.version;delete document.updateTime;
const ids=new Set(),objects=rows.slice(1).map(row=>{const{id,type}=row.header;if(typeof id!=='string'||!id||ids.has(id)||typeof type!=='string'||['DOCHEAD','DELETE','DELETE_DOC'].includes(type)||!row.body||Array.isArray(row.body)||typeof row.body!=='object')throw new Error('SOURCE');ids.add(id);return{id,type,body:row.body};}).sort((a,b)=>a.id.localeCompare(b.id));
return{document,objects,rows};};
assertPcbFrameCurrent();textStage='identity';
const identity=(await pcbFrameRpc.call(pcbFrameChannel,'getTabIdAndDocType',{}))?.message;assertPcbFrameCurrent();
if(identity?.tabId!==EXPECTED_TAB_ID||identity.docType!==3)throw new Error('IDENTITY');
textStage='baseline';const current=parse((await pcbFrameRpc.call(pcbFrameChannel,'FileSource',{}))?.message);assertPcbFrameCurrent();
if(canonical({document:current.document,objects:current.objects})!==canonical(TEXT_BEFORE))throw new Error('BASELINE');
const wanted=new Map(TEXT_AFTER.objects.map(row=>[row.id,row])),existing=new Set(current.objects.map(row=>row.id));
const output=[current.rows[0].line];let removed=0,ticket=0;
for(const row of current.rows.slice(1)){
if(Object.hasOwn(row.header,'ticket')){if(!Number.isSafeInteger(row.header.ticket)||row.header.ticket<0)throw new Error('TICKET');ticket=Math.max(ticket,row.header.ticket);}
const desired=wanted.get(row.header.id);
if(!desired){if(TEXT_CREATED_ID!==null||row.header.type!=='STRING'||++removed!==1)throw new Error('EFFECT');continue;}
if(desired.type!==row.header.type||canonical(row.body)!==canonical(desired.body))throw new Error('EFFECT');output.push(row.line);}
if(TEXT_CREATED_ID!==null){
const added=TEXT_AFTER.objects.filter(row=>!existing.has(row.id));
if(added.length!==1||added[0].id!==TEXT_CREATED_ID||added[0].type!=='STRING'||!Number.isSafeInteger(ticket+1))throw new Error('EFFECT');
output.push(JSON.stringify({type:'STRING',id:TEXT_CREATED_ID,ticket:ticket+1})+'||'+JSON.stringify(added[0].body));
}else if(removed!==1)throw new Error('EFFECT');
const merged=output.join('|\\n')+'|\\n',check=parse(merged);
if(canonical({document:check.document,objects:check.objects})!==canonical(TEXT_AFTER))throw new Error('EFFECT');
assertPcbFrameCurrent();textStage='dispatch';const acknowledgment=(await pcbFrameRpc.call(pcbFrameChannel,'pcb/decode',merged))?.message;
textStage='acknowledgment';if(acknowledgment!==true)throw new Error('ACK');
return TEXT_CREATED_ID===null?true:{primitiveId:TEXT_CREATED_ID};
}catch(error){let code='EXCEPTION';try{const descriptor=error!==null&&(typeof error==='object'||typeof error==='function')?Object.getOwnPropertyDescriptor(error,'message'):undefined;const message=descriptor&&Object.hasOwn(descriptor,'value')?descriptor.value:undefined;if(typeof message==='string'&&['CONTEXT','HOST','RECEIVER','PROJECT','ACTIVE_TAB','TAB','PERMISSION','FRAME','SOURCE','IDENTITY','BASELINE','EFFECT','TICKET','ACK'].includes(message))code=message;}catch(_){}throw new Error('Standalone PCB text lifecycle refused: '+textStage+':'+code);}
`;
}

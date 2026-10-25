import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import { NETLIST_FILES_MAX_PINS, NETLIST_FILES_MAX_RESULT_BYTES, NETLIST_FILES_METHOD,
  expectedNetlistDifferences, netlistCompareFilesRequestSchema, netlistDifferenceSchema,
  normalizeNetlistDifferences, validateNetlistFileContents } from "./netlist-files.ts";

/** Fixed public File/File method; input text has already passed the whole
 * supported parser and exact descriptor checks. No caller text is code.
 */
export function buildNetlistFilesProgram(input: unknown, leftText: string, rightText: string): string {
  const request = netlistCompareFilesRequestSchema.parse(input);
  const expected = expectedNetlistDifferences(validateNetlistFileContents(request.left, leftText), validateNetlistFileContents(request.right, rightText));
  const inputFiles = [{ name: request.left.name, text: leftText, bytes: request.left.bytes, sha256: request.left.sha256 },
    { name: request.right.name, text: rightText, bytes: request.right.bytes, sha256: request.right.sha256 }];
  return `let timer,clear,stage='environment',attempted=0,cleanupFailed=false,payload;
const refuse=()=>({ok:false,kind:'netlist-files-refusal',method:${JSON.stringify(NETLIST_FILES_METHOD)},code:'NETLIST_FILES_REFUSED',stage,attempted,cleanupFailed});
try{
const root=globalThis,apply=Reflect.apply,edaOwner=eda,bridgeUuid='7e06d286b1ac846ef7eab9c7f2a9ee40';
const bad=()=>{throw new Error('NETLIST_FILES_REFUSED');};
const own=(value,key)=>{const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
const retain=(value,key)=>{
 const chain=[];let node=value,method;
 for(let i=0;node!==null&&i<8;i++){
  if(typeof node!=='object'&&typeof node!=='function')bad();const descriptor=Object.getOwnPropertyDescriptor(node,key);
  if(!method&&descriptor){if(!Object.hasOwn(descriptor,'value')||typeof descriptor.value!=='function')bad();method=descriptor.value;}
  chain.push({node,descriptor});node=Object.getPrototypeOf(node);
 }
 if(node!==null||!method)bad();return {method,check:()=>{for(let i=0;i<chain.length;i++){
  const item=chain[i],next=chain[i+1]?.node??null,current=Object.getOwnPropertyDescriptor(item.node,key),before=item.descriptor;
  if(Object.getPrototypeOf(item.node)!==next)bad();if(before===undefined){if(current!==undefined)bad();continue;}
  if(!current||current.value!==before.value||current.get!==before.get||current.set!==before.set||current.writable!==before.writable||current.enumerable!==before.enumerable||current.configurable!==before.configurable)bad();
 }}};
};
const ui=own(root,'UI'),host=own(root,'gVars'),mode=own(root,'PRO_EDITOR_MODE'),bus=own(root,'_MSG_BUS2_EXTAPI_');
const owner=own(edaOwner,'sys_Tool'),comparison=retain(owner,'netlistComparison'),rpc=retain(bus,'rpcCall');
const FileClass=own(root,'File'),BlobClass=own(root,'Blob'),arrayBuffer=retain(BlobClass.prototype,'arrayBuffer');
const cryptoOwner=root.crypto,subtle=cryptoOwner?.subtle,digest=retain(subtle,'digest');
const location=root.location,href=location?.href,document=root.document,set=own(root,'setTimeout');clear=own(root,'clearTimeout');
if(typeof FileClass!=='function'||typeof BlobClass!=='function'||typeof set!=='function'||typeof clear!=='function')bad();
const clock=root.performance,now=retain(clock,'now');let lastTime=apply(now.method,clock,[]);
if(!Number.isFinite(lastTime)||lastTime<0)bad();const deadline=lastTime+10000;let expired=false;
const check=()=>{
 if(root.performance!==clock)bad();now.check();const time=apply(now.method,clock,[]);
 if(!Number.isFinite(time)||time<lastTime||time>=deadline)bad();lastTime=time;
 if(expired||root.top!==root||root.window!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==href||location?.href!==href||location?.origin!=='https://client')bad();
 if(typeof href!=='string'||!/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)#?$/.test(href))bad();
 if(own(root,'PRO_EDITOR_MODE')!==mode||(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'))bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||eda!==edaOwner||own(edaOwner,'extensionUuid')!==bridgeUuid||own(edaOwner,'sys_Tool')!==owner)bad();
 if(own(root,'_MSG_BUS2_EXTAPI_')!==bus||own(host,'extensionApiMessageBus2')!==bus||own(root,'File')!==FileClass||own(root,'Blob')!==BlobClass||root.crypto!==cryptoOwner||cryptoOwner.subtle!==subtle||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();
 comparison.check();rpc.check();arrayBuffer.check();digest.check();
};
check();timer=apply(set,root,[()=>{expired=true;},10000]);
const expected=${JSON.stringify(expected)},inputs=${JSON.stringify(inputFiles)},files=[];
for(const input of inputs){stage='file-construction';check();const file=new FileClass([input.text],input.name,{type:'text/plain',lastModified:0});
 if(!(file instanceof FileClass)||!(file instanceof BlobClass)||file.name!==input.name||file.size!==input.bytes||file.type!=='text/plain')bad();
 stage='file-bytes';const bytes=new Uint8Array(await apply(arrayBuffer.method,file,[]));check();if(bytes.length!==input.bytes)bad();
 stage='file-hash';const hash=new Uint8Array(await apply(digest.method,subtle,['SHA-256',bytes]));check();
 if(Array.from(hash,value=>value.toString(16).padStart(2,'0')).join('')!==input.sha256)bad();files.push(file);
}
const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad();const n=own(value,'length');if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad();for(let i=0;i<n;i++)own(value,String(i));return n;};
const text=value=>{if(typeof value!=='string'||value.length<1||value.length>130||/[^\\x20-\\x7E]/.test(value))bad();return value;};
const strings=value=>{const n=dense(value,${NETLIST_FILES_MAX_PINS}),out=[];for(let i=0;i<n;i++)out.push(text(own(value,String(i))));return out;};
const project=value=>{const n=dense(value,2560),rows=[];for(let i=0;i<n;i++){
 const row=own(value,String(i));if(!row||typeof row!=='object'||Object.getPrototypeOf(row)!==Object.prototype||Reflect.ownKeys(row).length!==4||!Reflect.ownKeys(row).every(key=>['type','object','net1','net2'].includes(key)))bad();
 const type=own(row,'type');if(type!=='NET'&&type!=='COMPONENT')bad();rows.push({type,object:text(own(row,'object')),net1:strings(own(row,'net1')),net2:strings(own(row,'net2'))});
 }if(new TextEncoder().encode(JSON.stringify(rows)).byteLength>${NETLIST_FILES_MAX_RESULT_BYTES / 2})bad();return rows;};
const lexical=(a,b)=>a<b?-1:a>b?1:0;
const normalized=rows=>rows.map(row=>({type:row.type,object:row.object,net1:[...row.net1].sort(lexical),net2:[...row.net2].sort(lexical)})).sort((a,b)=>lexical(a.type,b.type)||lexical(a.object,b.object));
const read=async()=>{stage='sdk-call';check();attempted++;const value=await apply(comparison.method,owner,files);check();stage='result';const result=project(value);if(JSON.stringify(normalized(result))!==JSON.stringify(expected))bad();return result;};
const first=await read(),second=await read();check();stage='sample-equality';if(JSON.stringify(first)!==JSON.stringify(second))bad();
payload={ok:true,kind:'netlist-files-comparison',method:${JSON.stringify(NETLIST_FILES_METHOD)},leftSha256:inputs[0].sha256,rightSha256:inputs[1].sha256,samplesMatched:true,independentMembershipMatched:true,differences:first};
}catch{payload=refuse();}
finally{if(timer!==undefined&&clear){try{Reflect.apply(clear,globalThis,[timer]);}catch{cleanupFailed=true;payload=refuse();}}}
const json=JSON.stringify(payload),utf8Bytes=new TextEncoder().encode(json).byteLength,envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${NETLIST_FILES_MAX_RESULT_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${NETLIST_FILES_MAX_RESULT_BYTES})throw new Error('NETLIST_FILES_RESPONSE_TOO_LARGE');return envelope;`;
}

const successSchema = z.object({ ok: z.literal(true), kind: z.literal("netlist-files-comparison"), method: z.literal(NETLIST_FILES_METHOD),
  leftSha256: z.string(), rightSha256: z.string(), samplesMatched: z.literal(true), independentMembershipMatched: z.literal(true),
  differences: z.array(netlistDifferenceSchema).max(2560) }).strict();
const refusalSchema = z.object({ ok: z.literal(false), kind: z.literal("netlist-files-refusal"), method: z.literal(NETLIST_FILES_METHOD),
  code: z.literal("NETLIST_FILES_REFUSED"), stage: z.enum(["environment", "file-construction", "file-bytes", "file-hash", "sdk-call", "result", "sample-equality"]),
  attempted: z.number().int().min(0).max(2), cleanupFailed: z.boolean() }).strict();

export function validateNetlistFilesResult(input: unknown, leftText: string, rightText: string, raw: unknown): Record<string, unknown> {
  const request = netlistCompareFilesRequestSchema.parse(input), result = z.union([successSchema, refusalSchema]).parse(raw);
  if (!result.ok) { return { ...result, connectedValidation: false, cadAuthority: false, persistenceVerified: false }; }
  const expected = expectedNetlistDifferences(validateNetlistFileContents(request.left, leftText), validateNetlistFileContents(request.right, rightText));
  if (result.leftSha256 !== request.left.sha256 || result.rightSha256 !== request.right.sha256 || JSON.stringify(normalizeNetlistDifferences(result.differences)) !== JSON.stringify(expected)) {
    throw new Error("Netlist result does not match its complete input membership model.");
  }
  return { ...result, comparisonScope: "footprint-designator-and-net-pin-memberships-only", equalInScope: result.differences.length === 0,
    connectedValidation: false, cadAuthority: false, persistenceVerified: false };
}
